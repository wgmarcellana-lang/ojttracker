const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const reportUtils = require('../utilities/reportUtils');

async function getDashboard(req, res, next) {
  try {
    if (req.user.role === 'intern') {
      const [summary, allLogs, recentLogs] = await Promise.all([
        internModel.getDashboardSummary(req.user.entityId),
        dailyLogModel.getByInternId(req.user.entityId),
        dailyLogModel.getRecentByIntern(req.user.entityId, 5)
      ]);

      if (!summary) {
        return res.status(404).json({
          success: false,
          details: 'Intern not found.'
        });
      }

      const report = reportUtils.buildCompletionReport(summary.intern, allLogs);

      return res.status(200).json({
        success: true,
        role: 'intern',
        dashboard: {
          intern: summary.intern,
          approvedHours: summary.approvedHours,
          totalHours: summary.totalHours,
          pendingCount: summary.pendingCount,
          renderedHours: report.renderedHours,
          remainingHours: report.remainingHours,
          completionPercentage: report.completionPercentage,
          weeklySummary: report.weeklySummary,
          recentLogs
        }
      });
    }

    if (req.user.role === 'supervisor') {
      const [supervisor, interns, logs] = await Promise.all([
        supervisorModel.getById(req.user.entityId),
        supervisorModel.getInterns(req.user.entityId),
        dailyLogModel.getBySupervisor(req.user.entityId)
      ]);

      if (!supervisor) {
        return res.status(404).json({
          success: false,
          details: 'Supervisor not found.'
        });
      }

      const pendingLogs = logs.filter((log) => log.status === 'pending');

      return res.status(200).json({
        success: true,
        role: 'supervisor',
        dashboard: {
          supervisor,
          interns,
          pendingLogs,
          stats: {
            pending: pendingLogs.length,
            approved: logs.filter((log) => log.status === 'approved').length,
            rejected: logs.filter((log) => log.status === 'rejected').length
          }
        }
      });
    }

    if (req.user.role === 'admin') {
      const [interns, supervisors, logs] = await Promise.all([
        internModel.getAll(),
        supervisorModel.getAll(),
        dailyLogModel.getAll()
      ]);

      const pendingLogs = logs.filter((log) => log.status === 'pending');

      return res.status(200).json({
        success: true,
        role: 'admin',
        dashboard: {
          stats: {
            interns: interns.length,
            supervisors: supervisors.length,
            logs: logs.length,
            pending: pendingLogs.length,
            approved: logs.filter((log) => log.status === 'approved').length,
            rejected: logs.filter((log) => log.status === 'rejected').length
          },
          pendingLogs,
          recentLogs: logs.slice(0, 5),
          interns,
          supervisors
        }
      });
    }

    return res.status(200).json({
      success: true,
      role: req.user.role,
      dashboard: {}
    });
  } catch (error) {
    return next(error);
  }
}

async function getReviewLogs(req, res, next) {
  try {
    const logs = req.user.role === 'admin'
      ? await dailyLogModel.getAll()
      : await dailyLogModel.getBySupervisor(req.user.entityId);

    return res.status(200).json({
      success: true,
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

    await dailyLogModel.updateStatus(
      req.params.logId,
      'approved',
      req.body.supervisor_comment || 'Approved by supervisor.'
    );

    return res.status(200).json({
      success: true,
      details: 'Log approved successfully.',
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

    await dailyLogModel.updateStatus(
      req.params.logId,
      'rejected',
      req.body.supervisor_comment || 'Please update the entry details and resubmit.'
    );

    return res.status(200).json({
      success: true,
      details: 'Log rejected successfully.',
      logId: Number(req.params.logId)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard,
  getReviewLogs,
  approveLog,
  rejectLog
};
