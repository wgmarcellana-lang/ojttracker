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

exports.getLogs = (req, res) => {
  const logs = req.user.role === 'intern'
    ? dailyLogModel.getByInternId(req.user.entityId)
    : dailyLogModel.getAll();

  res.render('logs/index', {
    pageTitle: 'Daily Logs',
    logs,
    interns: internModel.getAll()
  });
};

exports.getLogById = (req, res) => {
  const log = dailyLogModel.getById(req.params.id);

  if (!log) {
    return res.status(404).render('error', {
      message: 'Daily log not found.',
      error: {},
      pageTitle: 'Log Not Found'
    });
  }

  if (req.user.role === 'intern' && Number(log.intern_id) !== Number(req.user.entityId)) {
    return res.redirect('/logs');
  }

  return res.render('logs/show', {
    pageTitle: 'Log Details',
    log
  });
};

exports.showCreateForm = (req, res) => {
  const selectedInternId = getSelectedInternId(req);

  res.render('logs/edit', {
    pageTitle: 'Add Daily Log',
    mode: 'create',
    errors: [],
    formData: buildFormState({}, selectedInternId),
    interns: internModel.getAll(),
    log: null
  });
};

exports.createLog = (req, res) => {
  const internId = getSelectedInternId(req);
  const payload = {
    ...req.body,
    intern_id: internId,
    break_hours: req.body.break_hours ?? 1
  };

  const errors = getDailyLogValidationErrors(payload);

  if (dailyLogModel.findByInternAndDate(internId, payload.date)) {
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
    return res.status(400).render('logs/edit', {
      pageTitle: 'Add Daily Log',
      mode: 'create',
      errors,
      formData: buildFormState(payload, internId),
      interns: internModel.getAll(),
      log: null
    });
  }

  const result = dailyLogModel.create({
    ...payload,
    status: 'pending',
    supervisor_comment: ''
  });

  return res.redirect(`/logs/${result.lastInsertRowid}`);
};

exports.showEditForm = (req, res) => {
  const log = dailyLogModel.getById(req.params.id);

  if (!log) {
    return res.status(404).render('error', {
      message: 'Daily log not found.',
      error: {},
      pageTitle: 'Log Not Found'
    });
  }

  if (req.user.role === 'intern' && Number(log.intern_id) !== Number(req.user.entityId)) {
    return res.redirect('/logs');
  }

  return res.render('logs/edit', {
    pageTitle: 'Edit Daily Log',
    mode: 'edit',
    errors: [],
    formData: buildFormState(log),
    interns: internModel.getAll(),
    log
  });
};

exports.updateLog = (req, res) => {
  const existingLog = dailyLogModel.getById(req.params.id);
  if (!existingLog) {
    return res.status(404).render('error', {
      message: 'Daily log not found.',
      error: {},
      pageTitle: 'Log Not Found'
    });
  }

  const internId = getSelectedInternId(req, existingLog.intern_id);
  const payload = {
    ...req.body,
    intern_id: internId,
    break_hours: req.body.break_hours ?? 1
  };
  const errors = getDailyLogValidationErrors(payload);

  if (dailyLogModel.findByInternAndDate(internId, payload.date, req.params.id)) {
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
    return res.status(400).render('logs/edit', {
      pageTitle: 'Edit Daily Log',
      mode: 'edit',
      errors,
      formData: buildFormState(payload),
      interns: internModel.getAll(),
      log: existingLog
    });
  }

  dailyLogModel.update(req.params.id, {
    ...payload,
    status: existingLog.status === 'approved' ? 'pending' : existingLog.status,
    supervisor_comment: existingLog.status === 'approved' ? '' : existingLog.supervisor_comment
  });

  return res.redirect(`/logs/${req.params.id}`);
};

exports.deleteLog = (req, res) => {
  dailyLogModel.delete(req.params.id);
  res.redirect('/logs');
};
