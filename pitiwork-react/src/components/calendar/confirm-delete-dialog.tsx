import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string | null;
  onEventDeleted: () => void; // Callback to refresh events after deleting
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({ open, onClose, eventId, onEventDeleted }) => {
  const { keycloak } = useKeycloak();

  const handleDelete = async () => {
    if (!keycloak.authenticated || !eventId) {
      console.error('User not authenticated or event not selected.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5003/api/odata/PersonalCalendar(${eventId})`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${keycloak.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onClose();
      onEventDeleted(); // Refresh events in the calendar
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this event?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteDialog;
