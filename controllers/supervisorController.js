const dailyLogModel = require('../model/dailyLogModel');
const supervisorModel = require('../model/supervisorModel');

async function showDashboard(req, res, next) {
  try {
    const supervisorId = req.user.role === 'supervisor'
      ? req.user.entityId
      : Number(req.query.id || 1);

    const [supervisor, interns, logs] = await Promise.all([
      supervisorModel.getById(supervisorId),
      supervisorModel.getInterns(supervisorId),
      dailyLogModel.getBySupervisor(supervisorId)
    ]);

    if (!supervisor) {
      return res.status(404).render('error', {
        message: 'Supervisor not found.',
        error: {},
        pageTitle: 'Supervisor Not Found'
      });
    }

    const pendingLogs = logs.filter((log) => log.status === 'pending');

    return res.render('supervisor/dashboard', {
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
  } catch (error) {
    return next(error);
  }
}

async function reviewLogs(req, res, next) {
  try {
    const supervisorId = req.user.role === 'supervisor'
      ? req.user.entityId
      : Number(req.query.id || 1);
    const logs = await dailyLogModel.getBySupervisor(supervisorId);

    return res.render('supervisor/review-logs', {
      pageTitle: 'Review Logs',
      logs: logs.filter((log) => log.status === 'pending')
    });
  } catch (error) {
    return next(error);
  }
}

async function approveLog(req, res, next) {
  try {
    const log = await dailyLogModel.getById(req.params.logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    await dailyLogModel.updateStatus(req.params.logId, 'approved', req.body.supervisor_comment || 'Approved by supervisor.');
    return res.status(200).json({
      success: true,
      details: 'Log approved successfully.',
      redirectPath: '/supervisors/review-logs',
      logId: Number(req.params.logId)
    });
  } catch (error) {
    return next(error);
  }
}

async function rejectLog(req, res, next) {
  try {
    const log = await dailyLogModel.getById(req.params.logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    await dailyLogModel.updateStatus(req.params.logId, 'rejected', req.body.supervisor_comment || 'Please update the entry details and resubmit.');
    return res.status(200).json({
      success: true,
      details: 'Log rejected successfully.',
      redirectPath: '/supervisors/review-logs',
      logId: Number(req.params.logId)
    });
  } catch (error) {
    return next(error);
  }
}

exports.showDashboard = showDashboard;
exports.reviewLogs = reviewLogs;
exports.approveLog = approveLog;
exports.rejectLog = rejectLog;
