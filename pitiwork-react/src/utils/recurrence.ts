import moment from 'moment';

// These interfaces are redefined here to avoid circular dependencies.
// They should be kept in sync with the definitions in app/dashboard/calendar/page.tsx.
export interface PersonalCalendarEvent {
  Oid: string;
  StartOn: string;
  EndOn: string;
  Subject: string;
  Description: string | null;
  AllDay: boolean;
  Location: string | null;
  Label: number;
  Status: number;
  Type: number;
  RecurrenceInfoXml: string | null;
  ResourceId: string | null;
  RemindIn: string | null;
  ReminderInfoXml: string | null;
  AlarmTime: string | null;
  IsPostponed: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: unknown;
  originalEvent: PersonalCalendarEvent;
}

export interface RecurrenceInfo {
  type: number;
  startDate: Date;
  endDate?: Date;
  weekDays?: number;
  weekOfMonth?: number;
  occurrenceCount?: number;
  range: number;
  month?: number;
  dayNumber?: number;
}

/**
 * Parses the RecurrenceInfoXml string into a structured object.
 * @param xmlString The XML string from the RecurrenceInfoXml field.
 * @returns A RecurrenceInfo object or null if parsing fails.
 */
export const parseRecurrenceInfoXml = (xmlString: string): RecurrenceInfo | null => {
  if (globalThis.window === undefined || !xmlString) {
    return null;
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const recurrenceInfoNode = xmlDoc.querySelectorAll("RecurrenceInfo")[0];

    if (!recurrenceInfoNode) {
      return null;
    }

    const type = Number.parseInt(recurrenceInfoNode.getAttribute("Type") || '0', 10);
    const startDateAttr = recurrenceInfoNode.getAttribute("Start");
    const startDate = moment(startDateAttr, "MM/DD/YYYY HH:mm:ss").toDate();
    const endDateAttr = recurrenceInfoNode.getAttribute("End");
    const endDate = endDateAttr ? moment(endDateAttr, "MM/DD/YYYY HH:mm:ss").toDate() : undefined;

    const weekDaysAttr = recurrenceInfoNode.getAttribute("WeekDays");
    const weekDays = weekDaysAttr ? Number.parseInt(weekDaysAttr, 10) : undefined;
    const occurrenceCountAttr = recurrenceInfoNode.getAttribute("OccurrenceCount");
    const occurrenceCount = occurrenceCountAttr ? Number.parseInt(occurrenceCountAttr, 10) : undefined;
    const range = Number.parseInt(recurrenceInfoNode.getAttribute("Range") || '0', 10);
    const monthAttr = recurrenceInfoNode.getAttribute("Month");
    const month = monthAttr ? Number.parseInt(monthAttr, 10) : undefined;
    const dayNumberAttr = recurrenceInfoNode.getAttribute("DayNumber");
    const dayNumber = dayNumberAttr ? Number.parseInt(dayNumberAttr, 10) : undefined;
    const weekOfMonthAttr = recurrenceInfoNode.getAttribute("WeekOfMonth");
    const weekOfMonth = weekOfMonthAttr ? Number.parseInt(weekOfMonthAttr, 10) : undefined;

    return {
      type,
      startDate,
      endDate,
      weekDays,
      occurrenceCount,
      range,
      month,
      dayNumber,
      weekOfMonth,
    };
  } catch (error) {
    console.error("Error parsing RecurrenceInfoXml:", error);
    return null;
  }
};

const getWeekDayNumber = (momentDate: moment.Moment) => {
  return Math.pow(2, momentDate.day());
};

const createEventOccurrence = (baseEvent: PersonalCalendarEvent, recurrenceStartDate: Date, actualOccurrenceDate: moment.Moment, occurrenceIndex: number): CalendarEvent => {
    const originalEventStartMoment = moment(baseEvent.StartOn);
    const originalEventEndMoment = moment(baseEvent.EndOn);
    const eventDuration = originalEventEndMoment.diff(originalEventStartMoment);
    const patternStartMoment = moment(recurrenceStartDate);

    const newStart = actualOccurrenceDate.clone().set({
        hour: patternStartMoment.hour(),
        minute: patternStartMoment.minute(),
        second: patternStartMoment.second(),
    }).toDate();

    const newEnd = moment(newStart).add(eventDuration).toDate();

    return {
        id: `${baseEvent.Oid}-${occurrenceIndex}`,
        title: baseEvent.Subject,
        start: newStart,
        end: newEnd,
        allDay: baseEvent.AllDay,
        originalEvent: baseEvent,
    };
}

export const expandRecurrentEvents = (
  baseEvent: PersonalCalendarEvent,
  viewRange: { start: Date; end: Date }
): CalendarEvent[] => {
  if (!baseEvent.RecurrenceInfoXml) {
    return [];
  }

  const info = parseRecurrenceInfoXml(baseEvent.RecurrenceInfoXml);
  if (!info) {
    return [];
  }

  const expandedEvents: CalendarEvent[] = [];
  const { type, startDate, endDate, weekDays, occurrenceCount, range, month, dayNumber, weekOfMonth } = info;

  const viewStartMoment = moment(viewRange.start).startOf('day');
  const viewEndMoment = moment(viewRange.end).endOf('day');
  
  let occurrences = 0;
  const maxOccurrences = (range === 2 && occurrenceCount) ? occurrenceCount : Infinity;
  const patternEndDate = (range === 1 && endDate) ? moment(endDate).endOf('day') : viewEndMoment.clone().add(5, 'years');
  
  let currentDate = moment(startDate);

  let iterationCount = 0;
  const maxIterations = 365 * 2; // Max 2 years of iterations for safety

  while (currentDate.isBefore(patternEndDate) && occurrences < maxOccurrences && iterationCount < maxIterations) {
    iterationCount++;
    let isValidOccurrence = false;

    // Check if the current date is a valid occurrence according to the pattern
    if (currentDate.isSameOrAfter(moment(startDate))) {
        switch (type) {
            case 0: // Daily
                isValidOccurrence = true;
                break;
            case 1: // Weekly
                if (weekDays && (getWeekDayNumber(currentDate) & weekDays) !== 0) {
                    isValidOccurrence = true;
                }
                break;
            case 2: // Monthly
                const dayOfMonthToMatch = dayNumber || moment(startDate).date();
                if (currentDate.date() === dayOfMonthToMatch) {
                    isValidOccurrence = true;
                }
                break;
            case 3: // Yearly
                if (month && dayNumber && currentDate.month() + 1 === month && currentDate.date() === dayNumber) {
                    isValidOccurrence = true;
                }
                break;
        }
    }

    if (isValidOccurrence) {
        occurrences++;
        if (currentDate.isBetween(viewStartMoment, viewEndMoment, undefined, '[]')) {
            expandedEvents.push(createEventOccurrence(baseEvent, startDate, currentDate, occurrences));
        }
    }

    // Move to the next potential date
    switch (type) {
        case 2: // Monthly
            currentDate.add(1, 'month');
            break;
        case 3: // Yearly
            currentDate.add(1, 'year');
            break;
        default: // Daily and Weekly
            currentDate.add(1, 'day');
            break;
    }
  }

  return expandedEvents;
};