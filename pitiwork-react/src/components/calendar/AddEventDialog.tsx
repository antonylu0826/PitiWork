import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Checkbox, FormControlLabel } from '@mui/material';
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
      // Other properties can be added as needed, e.g., Label, Status, Type
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
