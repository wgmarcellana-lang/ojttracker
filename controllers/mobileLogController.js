const dailyLogModel = require('../model/dailyLogModel');
const { calculateWorkedHours } = require('../utilities/hoursUtils');
const { getDailyLogValidationErrors } = require('../validators/dailyLogValidator');

const canMutateLog = (req, log) => {
  if (!req.user) {
    return false;
  }

  if (req.user.role === 'admin') {
    return true;
  }

  return req.user.role === 'intern' && Number(req.user.entityId) === Number(log.intern_id);
};

const getTargetInternId = (req, fallbackInternId) => {
  if (req.user.role === 'intern') {
    return Number(req.user.entityId);
  }

  return Number(req.body.intern_id || fallbackInternId || 0);
};

const buildApiLogPayload = async (req, fallbackInternId) => {
  const internId = getTargetInternId(req, fallbackInternId);
  const payload = {
    ...req.body,
    intern_id: internId,
    break_hours: req.body.break_hours ?? 1
  };
  const errors = req.validationErrors || await getDailyLogValidationErrors(payload);

  if (await dailyLogModel.findByInternAndDate(internId, payload.date, fallbackInternId ? req.params.id : undefined)) {
    errors.push(fallbackInternId ? 'Another log already exists for this intern and date.' : 'An entry for this intern and date already exists.');
  }

  try {
    payload.hours_worked = calculateWorkedHours({
      timeIn: payload.time_in,
      timeOut: payload.time_out,
      breakHours: payload.break_hours
    });
  } catch (error) {
    errors.push(error.message);
  }

  return { errors, payload };
};

async function getLogs(req, res, next) {
  try {
    const logs = req.user.role === 'intern'
      ? await dailyLogModel.getByInternId(req.user.entityId)
      : await dailyLogModel.getAll();

    return res.status(200).json({
      success: true,
      logs
    });
  } catch (error) {
    return next(error);
  }
}

async function getLogById(req, res, next) {
  try {
    const log = await dailyLogModel.getById(req.params.id);

    if (!log) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    if (req.user.role === 'intern' && Number(log.intern_id) !== Number(req.user.entityId)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to access this log.'
      });
    }

    return res.status(200).json({
      success: true,
      log
    });
  } catch (error) {
    return next(error);
  }
}

async function createLog(req, res, next) {
  try {
    const { errors, payload } = await buildApiLogPayload(req);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors
      });
    }

    const result = await dailyLogModel.create({
      ...payload,
      status: 'pending',
      supervisor_comment: ''
    });

    return res.status(201).json({
      success: true,
      details: 'Daily log created successfully.',
      logId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateLog(req, res, next) {
  try {
    const existingLog = await dailyLogModel.getById(req.params.id);

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    if (!canMutateLog(req, existingLog)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to edit this log.'
      });
    }

    const { errors, payload } = await buildApiLogPayload(req, existingLog.intern_id);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors
      });
    }

    await dailyLogModel.update(req.params.id, {
      ...payload,
      status: existingLog.status === 'approved' ? 'pending' : existingLog.status,
      supervisor_comment: existingLog.status === 'approved' ? '' : existingLog.supervisor_comment
    });

    return res.status(200).json({
      success: true,
      details: 'Daily log updated successfully.',
      logId: Number(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteLog(req, res, next) {
  try {
    const existingLog = await dailyLogModel.getById(req.params.id);

    if (!existingLog) {
      return res.status(404).json({
        success: false,
        details: 'Daily log not found.'
      });
    }

    if (!canMutateLog(req, existingLog)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to delete this log.'
      });
    }

    await dailyLogModel.delete(req.params.id);

    return res.status(200).json({
      success: true,
      details: 'Daily log deleted successfully.',
      logId: Number(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLogs,
  getLogById,
  createLog,
  updateLog,
  deleteLog
};
