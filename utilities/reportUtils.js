const { escapeCsvValue } = require('./csvUtils');
const {
  buildWeeklySummary,
  calculateCompletionPercentage,
  calculateRemainingHours,
  sumHours
} = require('./hoursUtils');

const buildCompletionReport = (intern = {}, logs = []) => {
  const approvedLogs = logs.filter((log) => log.status === 'approved');
  const renderedHours = sumHours(approvedLogs);
  const remainingHours = calculateRemainingHours({
    requiredHours: intern.required_hours,
    renderedHours
  });

  return {
    intern,
    logs,
    renderedHours,
    remainingHours,
    completionPercentage: calculateCompletionPercentage({
      requiredHours: intern.required_hours,
      renderedHours
    }),
    weeklySummary: buildWeeklySummary(approvedLogs),
    status: remainingHours === 0 ? 'Completed' : 'In Progress'
  };
};

const buildWeeklySummaryReport = (logs = []) => buildWeeklySummary(
  logs.filter((log) => log.status === 'approved')
);

const buildCsv = (intern = {}, logs = []) => {
  const header = [
    'Intern',
    'School',
    'Course',
    'Date',
    'Time In',
    'Time Out',
    'Break Hours',
    'Hours Worked',
    'Status',
    'Task Description',
    'Supervisor Comment'
  ];

  const rows = logs.map((log) => [
    intern.name,
    intern.school,
    intern.course,
    log.date,
    log.time_in,
    log.time_out,
    log.break_hours,
    log.hours_worked,
    log.status,
    log.task_description,
    log.supervisor_comment || ''
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');
};

module.exports = {
  buildCompletionReport,
  buildWeeklySummary: buildWeeklySummaryReport,
  buildCsv
};
