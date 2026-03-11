const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const { db } = require('../config/database');
const {
  buildWeeklySummary,
  calculateCompletionPercentage,
  calculateRemainingHours,
  sumHours
} = require('../utilities/hoursUtils');
const { getInternValidationErrors } = require('../validators/internValidator');

const buildFormState = (payload = {}) => ({
  name: payload.name || '',
  school: payload.school || '',
  course: payload.course || '',
  required_hours: payload.required_hours || 486,
  start_date: payload.start_date || '',
  supervisor_id: payload.supervisor_id || '',
  username: payload.username || '',
  password: payload.password || ''
});

const canAccessIntern = (req, internId) => (
  req.user.role === 'admin' ||
  (req.user.role === 'intern' && Number(req.user.entityId) === Number(internId))
);

exports.showDashboard = (req, res) => {
  const targetInternId = req.user.role === 'intern'
    ? req.user.entityId
    : Number(req.query.id || 1);

  const summary = internModel.getDashboardSummary(targetInternId);

  if (!summary) {
    return res.status(404).render('error', {
      message: 'Intern not found.',
      error: {},
      pageTitle: 'Intern Not Found'
    });
  }

  const allLogs = dailyLogModel.getByInternId(targetInternId);
  const approvedLogs = allLogs.filter((log) => log.status === 'approved');
  const renderedHours = sumHours(approvedLogs);
  const remainingHours = calculateRemainingHours({
    requiredHours: summary.intern.required_hours,
    renderedHours
  });
  const completionPercentage = calculateCompletionPercentage({
    requiredHours: summary.intern.required_hours,
    renderedHours
  });

  res.render('intern/dashboard', {
    pageTitle: 'Intern Dashboard',
    intern: summary.intern,
    renderedHours,
    totalHours: summary.totalHours,
    pendingCount: summary.pendingCount,
    remainingHours,
    completionPercentage,
    weeklySummary: buildWeeklySummary(approvedLogs),
    recentLogs: dailyLogModel.getRecentByIntern(targetInternId, 5)
  });
};

exports.getInterns = (req, res) => {
  res.render('intern/index', {
    pageTitle: 'Intern Directory',
    interns: internModel.getAll()
  });
};

exports.getInternById = (req, res) => {
  if (!canAccessIntern(req, req.params.id)) {
    return res.redirect('/interns/dashboard');
  }

  const intern = internModel.getById(req.params.id);
  if (!intern) {
    return res.status(404).render('error', {
      message: 'Intern not found.',
      error: {},
      pageTitle: 'Intern Not Found'
    });
  }

  const logs = dailyLogModel.getByInternId(req.params.id);
  const approvedLogs = logs.filter((log) => log.status === 'approved');
  const renderedHours = sumHours(approvedLogs);

  res.render('intern/show', {
    pageTitle: 'Intern Details',
    intern,
    logs,
    renderedHours,
    remainingHours: calculateRemainingHours({
      requiredHours: intern.required_hours,
      renderedHours
    }),
    completionPercentage: calculateCompletionPercentage({
      requiredHours: intern.required_hours,
      renderedHours
    })
  });
};

exports.showCreateForm = (req, res) => {
  res.render('intern/edit', {
    pageTitle: 'Add Intern',
    mode: 'create',
    errors: [],
    formData: buildFormState(),
    supervisors: supervisorModel.getAll(),
    intern: null
  });
};

exports.createIntern = (req, res) => {
  const errors = getInternValidationErrors(req.body);

  if (!req.body.username || !String(req.body.username).trim()) {
    errors.push('Username is required.');
  }

  if (!req.body.password || !String(req.body.password).trim()) {
    errors.push('Password is required.');
  }

  if (req.body.username && userModel.getByUsername(req.body.username)) {
    errors.push('Username is already in use.');
  }

  if (errors.length) {
    return res.status(400).render('intern/edit', {
      pageTitle: 'Add Intern',
      mode: 'create',
      errors,
      formData: buildFormState(req.body),
      supervisors: supervisorModel.getAll(),
      intern: null
    });
  }

  try {
    db.exec('BEGIN');
    const result = internModel.create(req.body);
    userModel.create({
      username: req.body.username,
      password: req.body.password,
      role: 'intern',
      intern_id: result.lastInsertRowid
    });
    db.exec('COMMIT');
    res.redirect(`/interns/${result.lastInsertRowid}`);
  } catch (error) {
    db.exec('ROLLBACK');
    return res.status(400).render('intern/edit', {
      pageTitle: 'Add Intern',
      mode: 'create',
      errors: ['Unable to create intern account. Please check the details and try again.'],
      formData: buildFormState(req.body),
      supervisors: supervisorModel.getAll(),
      intern: null
    });
  }
};

exports.showEditForm = (req, res) => {
  const intern = internModel.getById(req.params.id);

  if (!intern) {
    return res.status(404).render('error', {
      message: 'Intern not found.',
      error: {},
      pageTitle: 'Intern Not Found'
    });
  }

  res.render('intern/edit', {
    pageTitle: 'Edit Intern',
    mode: 'edit',
    errors: [],
    formData: buildFormState({
      ...intern,
      ...(userModel.getByInternId(intern.id) || {})
    }),
    supervisors: supervisorModel.getAll(),
    intern
  });
};

exports.updateIntern = (req, res) => {
  const intern = internModel.getById(req.params.id);
  if (!intern) {
    return res.status(404).render('error', {
      message: 'Intern not found.',
      error: {},
      pageTitle: 'Intern Not Found'
    });
  }

  const errors = getInternValidationErrors(req.body);
  const existingUser = userModel.getByInternId(req.params.id);

  if (!req.body.username || !String(req.body.username).trim()) {
    errors.push('Username is required.');
  }

  if (!req.body.password || !String(req.body.password).trim()) {
    errors.push('Password is required.');
  }

  const usernameOwner = req.body.username ? userModel.getByUsername(req.body.username) : null;
  if (usernameOwner && (!existingUser || Number(usernameOwner.id) !== Number(existingUser.id))) {
    errors.push('Username is already in use.');
  }

  if (errors.length) {
    return res.status(400).render('intern/edit', {
      pageTitle: 'Edit Intern',
      mode: 'edit',
      errors,
      formData: buildFormState(req.body),
      supervisors: supervisorModel.getAll(),
      intern
    });
  }

  try {
    db.exec('BEGIN');
    internModel.update(req.params.id, req.body);

    if (existingUser) {
      userModel.update(existingUser.id, {
        username: req.body.username,
        password: req.body.password,
        role: 'intern',
        intern_id: req.params.id
      });
    }

    db.exec('COMMIT');
    res.redirect(`/interns/${req.params.id}`);
  } catch (error) {
    db.exec('ROLLBACK');
    return res.status(400).render('intern/edit', {
      pageTitle: 'Edit Intern',
      mode: 'edit',
      errors: ['Unable to update the intern account. Please check the details and try again.'],
      formData: buildFormState(req.body),
      supervisors: supervisorModel.getAll(),
      intern
    });
  }
};

exports.deleteIntern = (req, res) => {
  userModel.deleteByInternId(req.params.id);
  internModel.delete(req.params.id);
  res.redirect('/interns');
};
