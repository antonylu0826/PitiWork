import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel, Select, MenuItem, InputLabel, FormControl, Box } from '@mui/material';
import { calendarLabels } from '@/utils/calendar-labels';
import { calendarStatus } from '@/utils/calendar-status';
import moment from 'moment';
import { useKeycloak } from '@react-keycloak/web';

interface AddEventDialogProps {
  open: boolean;
  onClose: () => void;
  onEventAdded: () => void; // Callback to refresh events after adding
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ open, onClose, onEventAdded }) => {
  const { keycloak } = useKeycloak();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState(moment().format('YYYY-MM-DDTHH:mm'));
  const [endTime, setEndTime] = useState(moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
  const [allDay, setAllDay] = useState(false);
  const [label, setLabel] = useState(0);
  const [status, setStatus] = useState(0);
  const [recurrenceInfoXml, setRecurrenceInfoXml] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState('');

  const handleSubmit = async () => {
    if (!keycloak.authenticated) {
      console.error('User not authenticated.');
      return;
    }

    const newEvent = {
      Subject: subject,
      Description: description,
      Location: location,
      StartOn: moment(startTime).toISOString(),
      EndOn: moment(endTime).toISOString(),
      AllDay: allDay,
      Label: label,
      Status: status,
      RecurrenceInfoXml: recurrenceInfoXml || null,
      RecurrencePattern: recurrencePattern || null,
    };

    try {
      const response = await fetch('http://localhost:5003/api/odata/PersonalCalendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear form and close dialog
      setSubject('');
      setDescription('');
      setLocation('');
      setStartTime(moment().format('YYYY-MM-DDTHH:mm'));
      setEndTime(moment().add(1, 'hour').format('YYYY-MM-DDTHH:mm'));
      setAllDay(false);
      setLabel(0);
      setStatus(0);
      setRecurrenceInfoXml('');
      setRecurrencePattern('');
      onClose();
      onEventAdded(); // Refresh events in the calendar
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Calendar Event</DialogTitle>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              color="primary"
            />
          }
          label="All Day Event"
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
        <TextField
          margin="dense"
          label="Recurrence Info XML"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={recurrenceInfoXml}
          onChange={(e) => setRecurrenceInfoXml(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Recurrence Pattern"
          type="text"
          fullWidth
          variant="outlined"
          value={recurrencePattern}
          onChange={(e) => setRecurrencePattern(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Add Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddEventDialog;
