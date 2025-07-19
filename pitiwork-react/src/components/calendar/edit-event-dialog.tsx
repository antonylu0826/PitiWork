import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
  Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, 
  Box, Collapse, Grid, FormGroup, FormLabel
} from '@mui/material';
import { calendarLabels } from '@/utils/calendar-labels';
import { calendarStatus } from '@/utils/calendar-status';
import moment from 'moment';
import { useKeycloak } from '@react-keycloak/web';
import { v4 as uuidv4 } from 'uuid';
import { parseRecurrenceInfoXml, CalendarEvent } from '@/utils/recurrence';

interface EditEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onEventUpdated: () => void;
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ open, onClose, event, onEventUpdated }) => {
  const { keycloak } = useKeycloak();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [label, setLabel] = useState(0);
  const [status, setStatus] = useState(0);

  // Recurrence state
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('2');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(moment().add(1, 'month').format('YYYY-MM-DD'));
  const [recurrenceId, setRecurrenceId] = useState<string | null>(null);
  
  // Specific recurrence settings
  const [weeklyDays, setWeeklyDays] = useState<number[]>([]);
  const [monthlyDayNumber, setMonthlyDayNumber] = useState<string>('1');
  const [yearlyMonth, setYearlyMonth] = useState<string>('1');
  const [yearlyDayNumber, setYearlyDayNumber] = useState<string>('1');

  useEffect(() => {
    if (event) {
      const { originalEvent, start, end } = event;

      setSubject(originalEvent.Subject);
      setDescription(originalEvent.Description || '');
      // Use the moment objects from the event prop directly
      setStartTime(start.format('YYYY-MM-DDTHH:mm'));
      setEndTime(end.format('YYYY-MM-DDTHH:mm'));
      setAllDay(originalEvent.AllDay);
      setLabel(originalEvent.Label);
      setStatus(originalEvent.Status);
      
      const isRecurring = originalEvent.Type === 1;
      setIsRecurrent(isRecurring);
      if (isRecurring && originalEvent.RecurrenceInfoXml) {
        const info = parseRecurrenceInfoXml(originalEvent.RecurrenceInfoXml);
        const idMatch = originalEvent.RecurrenceInfoXml.match(/Id="([^"]+)"/);
        if (idMatch) setRecurrenceId(idMatch[1]);

        if (info) {
          setRecurrenceType(info.type.toString());
          if (info.endDate) {
             setRecurrenceEndDate(moment(info.endDate).format('YYYY-MM-DD'));
          } else if (info.occurrenceCount) {
            setRecurrenceEndDate(moment().add(info.occurrenceCount, 'days').format('YYYY-MM-DD'));
          }
          
          if (info.weekDays) {
            const days: number[] = [];
            for (let i = 0; i < 7; i++) {
              if ((info.weekDays & Math.pow(2, i)) !== 0) days.push(i);
            }
            setWeeklyDays(days);
          } else {
            setWeeklyDays([]);
          }

          setMonthlyDayNumber((info.dayNumber || '1').toString());
          setYearlyDayNumber((info.dayNumber || '1').toString());
          setYearlyMonth((info.month || '1').toString());
        }
      } else {
        setIsRecurrent(false);
      }
    }
  }, [event]);

  useEffect(() => {
    if (allDay) {
      const startOfDay = moment(startTime).startOf('day').format('YYYY-MM-DDTHH:mm');
      const endOfDay = moment(startTime).endOf('day').format('YYYY-MM-DDTHH:mm');
      setStartTime(startOfDay);
      setEndTime(endOfDay);
    }
  }, [allDay, startTime]);

  useEffect(() => {
    if (allDay) {
      const endOfDay = moment(startTime).endOf('day').format('YYYY-MM-DDTHH:mm');
      setEndTime(endOfDay);
    }
  }, [startTime, allDay]);

  const handleAllDayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllDay(event.target.checked);
  };

  const handleWeeklyDayChange = (day: number) => {
    setWeeklyDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const calculateOccurrenceCount = () => {
    const start = moment(startTime);
    const end = moment(recurrenceEndDate);
    let count = 0;
    const current = start.clone().startOf('day');

    while (current.isSameOrBefore(end)) {
        let isValid = false;
        switch (recurrenceType) {
            case '0': { // Daily
                isValid = true;
                break;
            }
            case '1': { // Weekly
                if (weeklyDays.includes(current.day())) {
                    isValid = true;
                }
                break;
            }
            case '2': { // Monthly
                if (current.date() === Number.parseInt(monthlyDayNumber, 10)) {
                    isValid = true;
                }
                break;
            }
            case '3': { // Yearly
                if (current.month() + 1 === Number.parseInt(yearlyMonth, 10) && current.date() === Number.parseInt(yearlyDayNumber, 10)) {
                    isValid = true;
                }
                break;
            }
        }
        if (isValid) {
            count++;
        }
        current.add(1, 'day');
    }
    return count;
  };

  const generateRecurrenceInfoXml = () => {
    if (!isRecurrent) return null;

    const occurrenceCount = calculateOccurrenceCount();
    const startDate = moment(startTime).format('MM/DD/YYYY HH:mm:ss');
    const endDate = moment(recurrenceEndDate).format('MM/DD/YYYY HH:mm:ss');
    const id = recurrenceId || uuidv4();
    let xml = `<RecurrenceInfo Start="${startDate}" End="${endDate}" Id="${id}" Type="${recurrenceType}" OccurrenceCount="${occurrenceCount}" Range="2"`;

    switch (recurrenceType) {
        case '1': {
            const weekDaysValue = weeklyDays.reduce((acc, day) => acc + Math.pow(2, day), 0);
            xml += ` WeekDays="${weekDaysValue}"`;
            break;
        }
        case '2': {
            xml += ` DayNumber="${monthlyDayNumber}"`;
            break;
        }
        case '3': {
            xml += ` Month="${yearlyMonth}" DayNumber="${yearlyDayNumber}"`;
            break;
        }
    }

    xml += ' Version="2" />';
    return xml;
  };

  const handleSubmit = async () => {
    if (!keycloak.authenticated || !event) return;

    const updatedEvent = {
      Oid: event.originalEvent.Oid,
      Subject: subject,
      Description: description,
      StartOn: moment(startTime).format(),
      EndOn: moment(endTime).format(),
      AllDay: allDay,
      Label: label,
      Status: status,
      Type: isRecurrent ? 1 : 0,
      RecurrenceInfoXml: generateRecurrenceInfoXml(),
    };

    try {
      const response = await fetch(`http://localhost:5003/api/odata/PersonalCalendar(${event.originalEvent.Oid})`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${keycloak.token}` },
        body: JSON.stringify(updatedEvent),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      onClose();
      onEventUpdated();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Calendar Event</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Subject" type="text" fullWidth variant="outlined" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <TextField margin="dense" label="Description" type="text" fullWidth multiline rows={4} variant="outlined" value={description} onChange={(e) => setDescription(e.target.value)} />
        <TextField margin="dense" label="Start Time" type="datetime-local" fullWidth variant="outlined" value={startTime} onChange={(e) => setStartTime(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField margin="dense" label="End Time" type="datetime-local" fullWidth variant="outlined" value={endTime} onChange={(e) => setEndTime(e.target.value)} InputLabelProps={{ shrink: true }} />
        <FormControlLabel control={<Checkbox checked={allDay} onChange={handleAllDayChange} color="primary" />} label="All Day Event" />

        <FormControl fullWidth margin="dense">
          <InputLabel>Label</InputLabel>
          <Select value={label} label="Label" onChange={(e) => setLabel(Number(e.target.value))}>
            {calendarLabels.map((lbl) => <MenuItem key={lbl.value} value={lbl.value}><Box sx={{ display: 'flex', alignItems: 'center' }}><Box sx={{ width: 16, height: 16, bgcolor: lbl.color, borderRadius: '4px', mr: 1 }} />{lbl.text}</Box></MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={(e) => setStatus(Number(e.target.value))}>
            {calendarStatus.map((stat) => <MenuItem key={stat.value} value={stat.value}><Box sx={{ display: 'flex', alignItems: 'center' }}><Box sx={{ width: 16, height: 16, bgcolor: stat.color, borderRadius: '4px', mr: 1 }} />{stat.text}</Box></MenuItem>)}
          </Select>
        </FormControl>
        <FormControlLabel control={<Checkbox checked={isRecurrent} onChange={(e) => setIsRecurrent(e.target.checked)} color="primary" />} label="Recurrent Event" />

        <Collapse in={isRecurrent}>
            <Box sx={{ pl: 2, borderLeft: '1px solid', borderColor: 'divider' }}>
                <FormControl margin="dense" fullWidth>
                    <InputLabel>Recurrence Type</InputLabel>
                    <Select value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)} label="Recurrence Type">
                        <MenuItem value="0">Daily</MenuItem>
                        <MenuItem value="1">Weekly</MenuItem>
                        <MenuItem value="2">Monthly</MenuItem>
                        <MenuItem value="3">Yearly</MenuItem>
                    </Select>
                </FormControl>

                <Collapse in={recurrenceType === '1'} sx={{ mt: 1 }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormLabel component="legend">Repeat on</FormLabel>
                        <FormGroup row>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                <FormControlLabel key={index} control={<Checkbox checked={weeklyDays.includes(index)} onChange={() => handleWeeklyDayChange(index)} />} label={day} />
                            ))}
                        </FormGroup>
                    </FormControl>
                </Collapse>

                <Collapse in={recurrenceType === '2'} sx={{ mt: 1 }}>
                    <TextField margin="dense" label="Day of Month" type="number" fullWidth variant="outlined" value={monthlyDayNumber} onChange={(e) => setMonthlyDayNumber(e.target.value)} inputProps={{ min: 1, max: 31 }} />
                </Collapse>

                <Collapse in={recurrenceType === '3'}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Month</InputLabel>
                                <Select value={yearlyMonth} onChange={(e) => setYearlyMonth(e.target.value)} label="Month">
                                    {moment.months().map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField margin="dense" label="Day of Month" type="number" fullWidth variant="outlined" value={yearlyDayNumber} onChange={(e) => setYearlyDayNumber(e.target.value)} inputProps={{ min: 1, max: 31 }} />
                        </Grid>
                    </Grid>
                </Collapse>

                <TextField sx={{ mt: 1 }} margin="dense" label="End Date" type="date" fullWidth variant="outlined" value={recurrenceEndDate} onChange={(e) => setRecurrenceEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Box>
        </Collapse>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventDialog;