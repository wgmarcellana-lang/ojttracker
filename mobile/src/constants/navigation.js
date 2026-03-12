export const tabMap = {
  intern: [
    { key: 'dashboard', label: 'Dashboard', short: 'DB' },
    { key: 'logs', label: 'My Logs', short: 'LG' },
    { key: 'form', label: 'Add Log', short: 'AD' },
    { key: 'reports', label: 'Reports', short: 'RP' },
  ],
  supervisor: [
    { key: 'dashboard', label: 'Dashboard', short: 'DB' },
    { key: 'review', label: 'Review Logs', short: 'RV' },
    { key: 'logs', label: 'All Logs', short: 'LG' },
  ],
  admin: [
    { key: 'dashboard', label: 'Dashboard', short: 'DB' },
    { key: 'interns', label: 'Interns', short: 'IN' },
    { key: 'supervisors', label: 'Supervisors', short: 'SV' },
    { key: 'review', label: 'Review Logs', short: 'RV' },
    { key: 'logs', label: 'All Logs', short: 'LG' },
    { key: 'reports', label: 'Reports', short: 'RP' },
  ],
};

export const tabsByRole = {
  intern: ['dashboard', 'logs', 'form', 'reports'],
  supervisor: ['dashboard', 'review', 'logs'],
  admin: ['dashboard', 'interns', 'supervisors', 'review', 'logs', 'reports'],
};

export const statCards = {
  intern: [
    ['AP', 'approvedHours'],
    ['RM', 'remainingHours'],
    ['TL', 'totalHours'],
    ['PD', 'pendingCount'],
  ],
  supervisor: [
    ['IN', 'interns'],
    ['PD', 'pending'],
    ['AP', 'approved'],
    ['RJ', 'rejected'],
  ],
  admin: [
    ['IN', 'interns'],
    ['SV', 'supervisors'],
    ['PD', 'pending'],
    ['LG', 'logs'],
  ],
};
