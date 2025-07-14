'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import type { TestObject } from './test-objects-table';

interface TestObjectModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: { Name: string; DisplayName: string }) => void;
  initialData?: TestObject | null;
}

export function TestObjectModal({
  open,
  onClose,
  onSave,
  initialData,
}: TestObjectModalProps): React.JSX.Element {
  const [name, setName] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');

  React.useEffect(() => {
    if (open && initialData) {
      setName(initialData.Name);
      setDisplayName(initialData.DisplayName);
    } else if (!open) {
      // Reset form when modal is closed
      setName('');
      setDisplayName('');
    }
  }, [open, initialData]);

  const handleSave = () => {
    onSave({ Name: name, DisplayName: displayName });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Test Object' : 'Add New Test Object'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
