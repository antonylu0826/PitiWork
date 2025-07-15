interface CalendarStatus {
  value: number;
  text: string;
  color: string;
}

export const calendarStatus: CalendarStatus[] = [
  { value: 0, text: 'Free', color: '#ffffff' }, // White
  { value: 1, text: 'Working Elsewhere', color: '#9c27b0' }, // Purple
  { value: 2, text: 'Tentative', color: '#4caf50' }, // Green
  { value: 3, text: 'Busy', color: '#2196f3' }, // Blue
  { value: 4, text: 'Out Of Office', color: '#ff5722' }, // Deep Orange
];

export const getStatusText = (value: number): string => {
  const status = calendarStatus.find(s => s.value === value);
  return status ? status.text : 'Unknown';
};

export const getStatusColor = (value: number): string => {
  const status = calendarStatus.find(s => s.value === value);
  return status ? status.color : '#000000'; // Default to black if not found
};
