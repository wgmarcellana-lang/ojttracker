const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const { buildLogStatusStats } = require('../utilities/controllerUtils');
const reportUtils = require('../utilities/reportUtils');

async function getDashboard(req, res, next) {
  try {
    const { user } = req;
    const { entityId, role } = user;

    if (role === 'intern') {
      const [summary, allLogs, recentLogs] = await Promise.all([
        internModel.getDashboardSummary(entityId),
        dailyLogModel.getByInternId(entityId),
        dailyLogModel.getRecentByIntern(entityId, 5)
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

    if (role === 'supervisor') {
      const [supervisor, interns, logs] = await Promise.all([
        supervisorModel.getById(entityId),
        supervisorModel.getInterns(entityId),
        dailyLogModel.getBySupervisor(entityId)
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
          stats: buildLogStatusStats(logs)
        }
      });
    }

    if (role === 'admin') {
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
            ...buildLogStatusStats(logs)
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
      role,
      dashboard: {}
    });
  } catch (error) {
    return next(error);
  }
}

async function getReviewLogs(req, res, next) {
  try {
    const { user } = req;
    const logs = user.role === 'admin'
      ? await dailyLogModel.getAll()
      : await dailyLogModel.getBySupervisor(user.entityId);

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

    await dailyLogModel.updateStatus(
      logId,
      'approved',
      supervisorComment || 'Approved by supervisor.'
    );

    return res.status(200).json({
      success: true,
      details: 'Log approved successfully.',
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

    await dailyLogModel.updateStatus(
      logId,
      'rejected',
      supervisorComment || 'Please update the entry details and resubmit.'
    );

    return res.status(200).json({
      success: true,
      details: 'Log rejected successfully.',
      logId: Number(logId)
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
