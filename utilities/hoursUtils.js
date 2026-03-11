const { clampMinZero, roundToTwo } = require('./numberUtils');
const {
  calculateWorkedHoursFromTimeRange,
  startOfWeek,
  formatDateKey
} = require('./timeUtils');

const calculateWorkedHours = ({ timeIn, timeOut, breakHours = 1 }) => (
  calculateWorkedHoursFromTimeRange({ timeIn, timeOut, breakHours })
);

const calculateRemainingHours = ({ requiredHours, renderedHours }) => {
  const required = Number(requiredHours) || 0;
  const rendered = Number(renderedHours) || 0;
  return clampMinZero(required - rendered);
};

const calculateCompletionPercentage = ({ requiredHours, renderedHours }) => {
  const required = Number(requiredHours) || 0;
  const rendered = Number(renderedHours) || 0;

  if (required <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((rendered / required) * 100));
};

const sumHours = (logs = []) => roundToTwo(
  logs.reduce((total, log) => total + (Number(log.hours_worked || log.hoursWorked) || 0), 0)
);

const buildWeeklySummary = (logs = []) => {
  const grouped = new Map();

  logs.forEach((log) => {
    const weekStart = startOfWeek(log.date);
    const key = formatDateKey(weekStart);
    const existing = grouped.get(key) || {
      weekStart: key,
      hours: 0,
      totalLogs: 0,
      approvedLogs: 0
    };

    existing.hours += Number(log.hours_worked || log.hoursWorked) || 0;
    existing.totalLogs += 1;

    if (log.status === 'approved') {
      existing.approvedLogs += 1;
    }

    grouped.set(key, existing);
  });

  return Array.from(grouped.values())
    .map((week) => ({
      ...week,
      hours: roundToTwo(week.hours)
    }))
    .sort((left, right) => left.weekStart.localeCompare(right.weekStart));
};

module.exports = {
  calculateWorkedHours,
  calculateRemainingHours,
  calculateCompletionPercentage,
  sumHours,
  buildWeeklySummary
};
