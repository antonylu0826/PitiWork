interface CalendarLabel {
  value: number;
  text: string;
  color: string;
}

export const calendarLabels: CalendarLabel[] = [
  { value: 0, text: 'None', color: '#9e9e9e' }, // Grey
  { value: 1, text: 'Important', color: '#ff5722' }, // Deep Orange
  { value: 2, text: 'Business', color: '#2196f3' }, // Blue
  { value: 3, text: 'Personal', color: '#4caf50' }, // Green
  { value: 4, text: 'Vacation', color: '#ff9800' }, // Orange
  { value: 5, text: 'Must Attend', color: '#8bc34a' }, // Light Green
  { value: 6, text: 'Travel Required', color: '#03a9f4' }, // Light Blue
  { value: 7, text: 'Needs Preparation', color: '#3f51b5' }, // Indigo
  { value: 8, text: 'Birthday', color: '#9c27b0' }, // Purple
  { value: 9, text: 'Anniversary', color: '#673ab7' }, // Deep Purple
  { value: 10, text: 'Phone Call', color: '#ffeb3b' }, // Yellow
];

export const getLabelText = (value: number): string => {
  const label = calendarLabels.find(l => l.value === value);
  return label ? label.text : 'Unknown';
};

export const getLabelColor = (value: number): string => {
  const label = calendarLabels.find(l => l.value === value);
  return label ? label.color : '#000000'; // Default to black if not found
};
