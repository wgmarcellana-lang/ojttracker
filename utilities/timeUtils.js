const { roundToTwo } = require('./numberUtils');

const MINUTES_PER_HOUR = 60;

const parseTimeToMinutes = (timeValue) => {
  if (!timeValue || !/^\d{2}:\d{2}$/.test(timeValue)) {
    throw new Error('Invalid time format.');
  }

  const [hours, minutes] = timeValue.split(':').map(Number);
  return (hours * MINUTES_PER_HOUR) + minutes;
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
  calculateWorkedHoursFromTimeRange,
  startOfWeek,
  formatDateKey
};
