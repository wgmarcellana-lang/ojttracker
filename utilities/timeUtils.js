const { roundToTwo } = require('./numberUtils');

const MINUTES_PER_HOUR = 60;

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
    throw new Error('Invalid time format.');
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  return (hours * MINUTES_PER_HOUR) + minutes;
};

const formatTime12Hour = (timeValue) => {
  if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
    return timeValue || '';
  }

  const [hourValue, minuteValue] = timeValue.split(':').map(Number);
  const meridiem = hourValue >= 12 ? 'pm' : 'am';
  const normalizedHour = hourValue % 12 || 12;

  return `${String(normalizedHour).padStart(2, '0')}:${String(minuteValue).padStart(2, '0')} ${meridiem}`;
};

const formatLongDate = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))
    ? new Date(`${dateValue}T00:00:00`)
    : new Date(dateValue);

  if (Number.isNaN(normalizedDate.getTime())) {
    return dateValue;
  }

  return normalizedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const calculateWorkedHoursFromTimeRange = ({ timeIn, timeOut, breakHours = 1 }) => {
  const startMinutes = parseTimeToMinutes(timeIn);
  const endMinutes = parseTimeToMinutes(timeOut);
  const breakMinutes = Number(breakHours) * MINUTES_PER_HOUR;

  if (endMinutes <= startMinutes) {
    throw new Error('Time out must be later than time in.');
  }

  const rawMinutes = endMinutes - startMinutes - breakMinutes;

  if (rawMinutes <= 0) {
    throw new Error('Worked hours must be greater than zero.');
  }

  return roundToTwo(rawMinutes / MINUTES_PER_HOUR);
};

const startOfWeek = (dateInput) => {
  const date = new Date(dateInput);
  const day = date.getDay();
  const difference = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() + difference);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const formatDateKey = (date) => date.toISOString().slice(0, 10);

module.exports = {
  MINUTES_PER_HOUR,
  parseTimeToMinutes,
  formatLongDate,
  formatTime12Hour,
  calculateWorkedHoursFromTimeRange,
  startOfWeek,
  formatDateKey
};
