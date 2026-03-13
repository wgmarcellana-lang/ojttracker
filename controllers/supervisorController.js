const dailyLogModel = require('../model/dailyLogModel');
const supervisorModel = require('../model/supervisorModel');
const {
  buildLogStatusStats,
  getScopedSupervisorId
} = require('../utilities/controllerUtils');

async function showDashboard(req, res, next) {
  try {
    const { query, user } = req;
    const supervisorId = getScopedSupervisorId({
      user,
      query,
      fallbackSupervisorId: 1
    });

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
      stats: buildLogStatusStats(logs)
    });
  } catch (error) {
    return next(error);
  }
}

async function reviewLogs(req, res, next) {
  try {
    const { query, user } = req;
    const supervisorId = getScopedSupervisorId({
      user,
      query,
      fallbackSupervisorId: 1
    });
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
    const { body, params } = req;
    const { logId } = params;
    const { supervisor_comment: supervisorComment } = body;
    const log = await dailyLogModel.getById(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    await dailyLogModel.updateStatus(logId, 'approved', supervisorComment || 'Approved by supervisor.');
    return res.status(200).json({
      success: true,
      details: 'Log approved successfully.',
      redirectPath: '/supervisors/review-logs',
      logId: Number(logId)
    });
  } catch (error) {
    return next(error);
  }
}

async function rejectLog(req, res, next) {
  try {
    const { body, params } = req;
    const { logId } = params;
    const { supervisor_comment: supervisorComment } = body;
    const log = await dailyLogModel.getById(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    await dailyLogModel.updateStatus(logId, 'rejected', supervisorComment || 'Please update the entry details and resubmit.');
    return res.status(200).json({
      success: true,
      details: 'Log rejected successfully.',
      redirectPath: '/supervisors/review-logs',
      logId: Number(logId)
    });
  } catch (error) {
    return next(error);
  }
}

exports.showDashboard = showDashboard;
exports.reviewLogs = reviewLogs;
exports.approveLog = approveLog;
exports.rejectLog = rejectLog;
