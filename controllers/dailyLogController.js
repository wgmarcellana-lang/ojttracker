const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const { calculateWorkedHours } = require('../utilities/hoursUtils');
const { getDailyLogValidationErrors } = require('../validators/dailyLogValidator');

const getSelectedInternId = (req, fallbackInternId) => {
  if (req.user.role === 'intern') {
    return Number(req.user.entityId);
  }

  return Number(req.body.intern_id || req.query.internId || fallbackInternId || 1);
};

const buildFormState = (payload = {}, selectedInternId = '') => ({
  intern_id: payload.intern_id || selectedInternId || '',
  date: payload.date || '',
  time_in: payload.time_in || '08:00',
  time_out: payload.time_out || '17:00',
  break_hours: payload.break_hours ?? 1,
  task_description: payload.task_description || '',
  supervisor_comment: payload.supervisor_comment || ''
});

async function getLogs(req, res, next) {
  try {
    const [logs, interns] = await Promise.all([
      req.user.role === 'intern'
        ? dailyLogModel.getByInternId(req.user.entityId)
        : dailyLogModel.getAll(),
      internModel.getAll()
    ]);

    return res.render('logs/index', {
      pageTitle: 'Daily Logs',
      logs,
      interns
    });
  } catch (error) {
    return next(error);
  }
}

async function getLogById(req, res, next) {
  try {
    const log = await dailyLogModel.getById(req.params.id);

    if (!log) {
      return res.status(404).render('error', {
        message: 'Daily log not found.',
        error: {},
        pageTitle: 'Log Not Found'
      });
    }

    if (req.user.role === 'intern' && Number(log.intern_id) !== Number(req.user.entityId)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to access this log.',
        redirectPath: '/logs'
      });
    }

    return res.render('logs/show', {
      pageTitle: 'Log Details',
      log
    });
  } catch (error) {
    return next(error);
  }
}

async function showCreateForm(req, res, next) {
  try {
    const selectedInternId = getSelectedInternId(req);

    return res.render('logs/edit', {
      pageTitle: 'Add Daily Log',
      mode: 'create',
      errors: [],
      formData: buildFormState({}, selectedInternId),
      interns: await internModel.getAll(),
      log: null
    });
  } catch (error) {
    return next(error);
  }
}

async function createLog(req, res, next) {
  try {
    const internId = getSelectedInternId(req);
    const payload = {
      ...req.body,
      intern_id: internId,
      break_hours: req.body.break_hours ?? 1
    };

    const errors = req.validationErrors || await getDailyLogValidationErrors(payload);

    if (await dailyLogModel.findByInternAndDate(internId, payload.date)) {
      errors.push('An entry for this intern and date already exists.');
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

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: buildFormState(payload, internId)
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
      redirectPath: `/logs/${result.lastInsertRowid}`,
      logId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    return next(error);
  }
}

async function showEditForm(req, res, next) {
  try {
    const log = await dailyLogModel.getById(req.params.id);

    if (!log) {
      return res.status(404).render('error', {
        message: 'Daily log not found.',
        error: {},
        pageTitle: 'Log Not Found'
      });
    }

    if (req.user.role === 'intern' && Number(log.intern_id) !== Number(req.user.entityId)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to edit this log.',
        redirectPath: '/logs'
      });
    }

    return res.render('logs/edit', {
      pageTitle: 'Edit Daily Log',
      mode: 'edit',
      errors: [],
      formData: buildFormState(log),
      interns: await internModel.getAll(),
      log
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

    const internId = getSelectedInternId(req, existingLog.intern_id);
    const payload = {
      ...req.body,
      intern_id: internId,
      break_hours: req.body.break_hours ?? 1
    };
    const errors = req.validationErrors || await getDailyLogValidationErrors(payload);

    if (await dailyLogModel.findByInternAndDate(internId, payload.date, req.params.id)) {
      errors.push('Another log already exists for this intern and date.');
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

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: buildFormState(payload)
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
      redirectPath: `/logs/${req.params.id}`,
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

    await dailyLogModel.delete(req.params.id);
    return res.status(200).json({
      success: true,
      details: 'Daily log deleted successfully.',
      redirectPath: '/logs',
      logId: Number(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

exports.getLogs = getLogs;
exports.getLogById = getLogById;
exports.showCreateForm = showCreateForm;
exports.createLog = createLog;
exports.showEditForm = showEditForm;
exports.updateLog = updateLog;
exports.deleteLog = deleteLog;
