import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';
import { calendarLabels } from '@/utils/calendar-labels';
import { calendarStatus } from '@/utils/calendar-status';
import moment from 'moment';
import { useKeycloak } from '@react-keycloak/web';

interface PersonalCalendarEvent {
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
  ResourceId: string | null;
  RemindIn: string | null;
  ReminderInfoXml: string | null;
  AlarmTime: string | null;
  IsPostponed: boolean;
}

interface EditEventDialogProps {
  open: boolean;
  onClose: () => void;
  event: PersonalCalendarEvent | null;
  onEventUpdated: () => void; // Callback to refresh events after updating
}

const EditEventDialog: React.FC<EditEventDialogProps> = ({ open, onClose, event, onEventUpdated }) => {
  const { keycloak } = useKeycloak();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [label, setLabel] = useState(0);
  const [status, setStatus] = useState(0);

  useEffect(() => {
    if (event) {
      setSubject(event.Subject);
      setDescription(event.Description || '');
      setLocation(event.Location || '');
      setStartTime(moment(event.StartOn).format('YYYY-MM-DDTHH:mm'));
      setEndTime(moment(event.EndOn).format('YYYY-MM-DDTHH:mm'));
      setAllDay(event.AllDay);
      setLabel(event.Label);
      setStatus(event.Status);
    }
  }, [event]);

  const handleAllDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setAllDay(isChecked);
    if (isChecked) {
        setStartTime(moment(startTime).startOf('day').format('YYYY-MM-DDTHH:mm'));
        setEndTime(moment(endTime).endOf('day').format('YYYY-MM-DDTHH:mm'));
    }
  };

  const handleSubmit = async () => {
    if (!keycloak.authenticated || !event) {
      console.error('User not authenticated or event not selected.');
      return;
    }

    const updatedEvent = {
      Oid: event.Oid, // Include Oid for PUT request
      Subject: subject,
      Description: description,
      Location: location,
      StartOn: moment(startTime).toISOString(),
      EndOn: moment(endTime).toISOString(),
      AllDay: allDay,
      Label: label,
      Status: status,
    };

    try {
      const response = await fetch(`http://localhost:5003/api/odata/PersonalCalendar(${event.Oid})`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onClose();
      onEventUpdated(); // Refresh events in the calendar
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Calendar Event</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Subject"
          type="text"
          fullWidth
          variant="outlined"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Location"
          type="text"
          fullWidth
          variant="outlined"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={allDay}
              onChange={handleAllDayChange}
              color="primary"
            />
          }
          label="All Day Event"
        />
        <TextField
          margin="dense"
          label="Start Time"
          type="datetime-local"
          fullWidth
          variant="outlined"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          margin="dense"
          label="End Time"
          type="datetime-local"
          fullWidth
          variant="outlined"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel id="label-select-label">Label</InputLabel>
          <Select
            labelId="label-select-label"
            id="label-select"
            value={label}
            label="Label"
            onChange={(e) => setLabel(Number(e.target.value))}
          >
            {calendarLabels.map((lbl) => (
              <MenuItem key={lbl.value} value={lbl.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: lbl.color, borderRadius: '4px', mr: 1 }} />
                  {lbl.text}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={status}
            label="Status"
            onChange={(e) => setStatus(Number(e.target.value))}
          >
            {calendarStatus.map((stat) => (
              <MenuItem key={stat.value} value={stat.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: stat.color, borderRadius: '4px', mr: 1 }} />
                  {stat.text}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditEventDialog;