import React from 'react';
import { Toolbar, Button, IconButton, Typography, Box } from '@mui/material';
import { ArrowLeft as ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar'; // For Today button icon

interface CalendarToolbarProps {
  label: string;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: string) => void;
  view: string;
  views: string[];
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({ label, onNavigate, onView, view, views }) => {
  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    onNavigate(action);
  };

  const viewChange = (newView: string) => {
    onView(newView);
  };

  return (
    <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={() => navigate('PREV')}>
          <ArrowLeftIcon />
        </IconButton>
        <IconButton onClick={() => navigate('NEXT')}>
          <ArrowRightIcon />
        </IconButton>
        <Button onClick={() => navigate('TODAY')} startIcon={<CalendarIcon />}>
          Today
        </Button>
      </Box>

      <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
        {label}
      </Typography>

      <Box>
        {views.map((name) => (
          <Button
            key={name}
            onClick={() => viewChange(name)}
            variant={view === name ? 'contained' : 'outlined'}
            sx={{ ml: 1 }}
          >
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Button>
        ))}
      </Box>
    </Toolbar>
  );
};

export default CalendarToolbar;
