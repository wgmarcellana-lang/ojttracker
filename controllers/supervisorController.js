const dailyLogModel = require('../model/dailyLogModel');
const supervisorModel = require('../model/supervisorModel');

exports.showDashboard = (req, res) => {
  const supervisorId = req.user.role === 'supervisor'
    ? req.user.entityId
    : Number(req.query.id || 1);
  const supervisor = supervisorModel.getById(supervisorId);

  if (!supervisor) {
    return res.status(404).render('error', {
      message: 'Supervisor not found.',
      error: {},
      pageTitle: 'Supervisor Not Found'
    });
  }

  const interns = supervisorModel.getInterns(supervisorId);
  const logs = dailyLogModel.getBySupervisor(supervisorId);
  const pendingLogs = logs.filter((log) => log.status === 'pending');

  res.render('supervisor/dashboard', {
    pageTitle: 'Supervisor Dashboard',
    supervisor,
    interns,
    pendingLogs,
    stats: {
      pending: pendingLogs.length,
      approved: logs.filter((log) => log.status === 'approved').length,
      rejected: logs.filter((log) => log.status === 'rejected').length
    }
  });
};

exports.reviewLogs = (req, res) => {
  const supervisorId = req.user.role === 'supervisor'
    ? req.user.entityId
    : Number(req.query.id || 1);

  res.render('supervisor/review-logs', {
    pageTitle: 'Review Logs',
    logs: dailyLogModel.getBySupervisor(supervisorId)
  });
};

exports.approveLog = (req, res) => {
  dailyLogModel.updateStatus(req.params.logId, 'approved', req.body.supervisor_comment || 'Approved by supervisor.');
  res.redirect('/supervisors/review-logs');
};

exports.rejectLog = (req, res) => {
  dailyLogModel.updateStatus(req.params.logId, 'rejected', req.body.supervisor_comment || 'Please update the entry details and resubmit.');
  res.redirect('/supervisors/review-logs');
};
