'use client';

import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { Calendar, momentLocalizer, EventProps } from 'react-big-calendar';
import moment from 'moment';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, GlobalStyles, Checkbox, FormControlLabel, Box } from '@mui/material';
import AddEventDialog from '@/components/calendar/AddEventDialog';
import EditEventDialog from '@/components/calendar/EditEventDialog';
import ConfirmDeleteDialog from '@/components/calendar/ConfirmDeleteDialog';
import CalendarToolbar from '@/components/calendar/CalendarToolbar';
import { getLabelText, getLabelColor } from '@/utils/calendar-labels';
import { getStatusText, getStatusColor } from '@/utils/calendar-status';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CachedIcon from '@mui/icons-material/Cached';
import { expandRecurrentEvents, CalendarEvent, PersonalCalendarEvent } from '@/utils/recurrence';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CustomEvent: React.FC<EventProps<CalendarEvent>> = ({ event }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {event.originalEvent.Type === 1 && <CachedIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />}
    {event.allDay && <AccessTimeIcon sx={{ fontSize: '1rem', verticalAlign: 'middle', mr: 0.5 }} />}
    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</span>
  </div>
);

const CalendarPage: React.FC = () => {
  const { keycloak, initialized } = useKeycloak();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddEventDialog, setOpenAddEventDialog] = useState(false);
  const [openEditEventDialog, setOpenEditEventDialog] = useState(false);
  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<any>('month');

  const fetchEvents = React.useCallback(async (viewInfo?: { start: Date; end: Date }) => {
    if (!initialized || !keycloak.authenticated) {
      return;
    }

    const currentViewRange = viewInfo || {
      start: moment(date).startOf('month').toDate(),
      end: moment(date).endOf('month').toDate(),
    };

    try {
      const response = await fetch('http://localhost:5003/api/odata/PersonalCalendar', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const formattedEvents: CalendarEvent[] = data.value.flatMap((event: PersonalCalendarEvent) => {
        console.log('Raw StartOn:', event.StartOn, 'Raw EndOn:', event.EndOn);
        if (event.Type === 1 && event.RecurrenceInfoXml) {
          return expandRecurrentEvents(event, currentViewRange);
        } else {
          return [{
            id: event.Oid,
            title: event.Subject,
            start: moment(event.StartOn), 
            end: moment(event.EndOn),     
            allDay: event.AllDay,
            originalEvent: event,
          }];
        }
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    }
  }, [initialized, keycloak.authenticated, keycloak.token, date]);

  useEffect(() => {
    const start = moment(date).startOf(view as any).toDate();
    const end = moment(date).endOf(view as any).toDate();
    fetchEvents({ start, end });
  }, [fetchEvents, date, view]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  return (
    <div style={{ height: '100vh', padding: '20px' }}>
      <GlobalStyles styles={{
        '.rbc-calendar': {
          fontFamily: 'inherit',
          backgroundColor: 'var(--mui-palette-background-paper)',
          color: 'var(--mui-palette-text-primary)',
          borderRadius: '8px',
          boxShadow: 'var(--mui-shadows-1)',
        },
        '.rbc-header': {
          backgroundColor: 'var(--mui-palette-action-hover)',
          color: 'var(--mui-palette-text-secondary)',
          borderColor: 'var(--mui-palette-divider)',
          padding: '8px 0',
        },
        '.rbc-day-bg': {
          backgroundColor: 'var(--mui-palette-background-paper)',
        },
        '.rbc-today': {
          backgroundColor: 'var(--mui-palette-action-selected)',
        },
        '.rbc-off-range-bg': {
          backgroundColor: 'var(--mui-palette-action-disabledBackground)',
        },
        '.rbc-event': {
          backgroundColor: 'var(--mui-palette-primary-main)',
          color: 'var(--mui-palette-primary-contrastText)',
          borderRadius: '4px',
          padding: '2px 5px',
        },
        '.rbc-event.rbc-selected': {
          backgroundColor: 'var(--mui-palette-primary-dark)',
        },
        '.rbc-toolbar button': {
          color: 'var(--mui-palette-text-primary)',
          borderColor: 'var(--mui-palette-divider)',
          '&:hover': {
            backgroundColor: 'var(--mui-palette-action-hover)',
          },
        },
        '.rbc-toolbar button.rbc-active': {
          backgroundColor: 'var(--mui-palette-primary-main)',
          color: 'var(--mui-palette-primary-contrastText)',
        },
        '.rbc-month-view': {
          borderColor: 'var(--mui-palette-divider)',
          overflow: 'visible',
        },
        '.rbc-month-row': {
          overflow: 'visible',
        },
        '.rbc-time-view': {
          borderColor: 'var(--mui-palette-divider)',
        },
        '.rbc-agenda-view': {
          borderColor: 'var(--mui-palette-divider)',
        },
        '.rbc-time-header': {
          borderColor: 'var(--mui-palette-divider)',
        },
        '.rbc-time-content': {
          borderColor: 'var(--mui-palette-divider)',
        },
        '.rbc-current-time-indicator': {
          backgroundColor: 'var(--mui-palette-error-main)',
        },
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Personal Calendar
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenAddEventDialog(true)}>
          Add Event
        </Button>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor={(event) => (event.start as moment.Moment).toDate()}
        endAccessor={(event) => (event.end as moment.Moment).toDate()}
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        date={date}
        view={view}
        onNavigate={(newDate) => setDate(newDate)}
        onView={(newView) => setView(newView)}
        onRangeChange={(range) => {
          if ('start' in range && 'end' in range) {
            fetchEvents({ start: range.start, end: range.end });
          }
        }}
        eventPropGetter={(event) => {
          const backgroundColor = getLabelColor(event.originalEvent.Label);
          return {
            style: {
              backgroundColor,
            },
          };
        }}
        components={{
          toolbar: CalendarToolbar,
          event: CustomEvent,
        }}
      />

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{selectedEvent?.title}</DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <Typography variant="body1">
                <strong>Start:</strong> {selectedEvent.start.format('YYYY-MM-DD HH:mm')}
              </Typography>
              <Typography variant="body1">
                <strong>End:</strong> {selectedEvent.end.format('YYYY-MM-DD HH:mm')}
              </Typography>
              {selectedEvent.originalEvent.Description && (
                <Typography variant="body1">
                  <strong>Description:</strong> {selectedEvent.originalEvent.Description}
                </Typography>
              )}
              {selectedEvent.originalEvent.Location && (
                <Typography variant="body1">
                  <strong>Location:</strong> {selectedEvent.originalEvent.Location}
                </Typography>
              )}
              {selectedEvent.originalEvent.Label !== undefined && (
                <Typography component="div" variant="body1">
                  <strong>Label:</strong>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getLabelColor(selectedEvent.originalEvent.Label), borderRadius: '4px', mr: 1 }} />
                    {getLabelText(selectedEvent.originalEvent.Label)}
                  </Box>
                </Typography>
              )}
              {selectedEvent.originalEvent.Status !== undefined && (
                <Typography component="div" variant="body1">
                  <strong>Status:</strong>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
                    <Box sx={{ width: 16, height: 16, bgcolor: getStatusColor(selectedEvent.originalEvent.Status), borderRadius: '4px', mr: 1 }} />
                    {getStatusText(selectedEvent.originalEvent.Status)}
                  </Box>
                </Typography>
              )}
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedEvent.allDay}
                    readOnly
                    color="primary"
                  />
                }
                label="All Day"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
          <Button onClick={() => {
            setOpenDialog(false);
            setOpenEditEventDialog(true);
          }} color="primary">
            Edit
          </Button>
          <Button onClick={() => {
            setOpenDialog(false);
            setOpenConfirmDeleteDialog(true);
          }} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <AddEventDialog
        open={openAddEventDialog}
        onClose={() => setOpenAddEventDialog(false)}
        onEventAdded={fetchEvents}
      />

      <EditEventDialog
        open={openEditEventDialog}
        onClose={() => setOpenEditEventDialog(false)}
        event={selectedEvent}
        onEventUpdated={fetchEvents}
      />

      <ConfirmDeleteDialog
        open={openConfirmDeleteDialog}
        onClose={() => setOpenConfirmDeleteDialog(false)}
        eventId={selectedEvent ? selectedEvent.id : null}
        onEventDeleted={fetchEvents}
      />
    </div>
  );
};

export default CalendarPage;