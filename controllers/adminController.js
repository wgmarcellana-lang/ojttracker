const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const { db } = require('../config/database');

const buildSupervisorFormState = (payload = {}) => ({
  name: payload.name || '',
  email: payload.email || '',
  department: payload.department || '',
  username: payload.username || '',
  password: payload.password || ''
});

const getSupervisorValidationErrors = (payload = {}) => {
  const errors = [];

  if (!payload.name || !String(payload.name).trim()) {
    errors.push('Supervisor name is required.');
  }

  if (!payload.email || !String(payload.email).trim()) {
    errors.push('Supervisor email is required.');
  }

  if (!payload.department || !String(payload.department).trim()) {
    errors.push('Department is required.');
  }

  if (!payload.username || !String(payload.username).trim()) {
    errors.push('Username is required.');
  }

  if (!payload.password || !String(payload.password).trim()) {
    errors.push('Password is required.');
  }

  return errors;
};

exports.showDashboard = (req, res) => {
  const interns = internModel.getAll();
  const supervisors = supervisorModel.getAll();
  const logs = dailyLogModel.getAll();

  res.render('admin/dashboard', {
    pageTitle: 'Admin Dashboard',
    stats: {
      interns: interns.length,
      supervisors: supervisors.length,
      logs: logs.length,
      pendingLogs: logs.filter((log) => log.status === 'pending').length
    },
    recentLogs: logs.slice(0, 6),
    interns,
    supervisors
  });
};

exports.manageInterns = (req, res) => {
  res.render('admin/interns', {
    pageTitle: 'Manage Interns',
    interns: internModel.getAll()
  });
};

exports.manageSupervisors = (req, res) => {
  res.render('admin/supervisors', {
    pageTitle: 'Manage Supervisors',
    supervisors: supervisorModel.getAll(),
    formData: buildSupervisorFormState(),
    errors: [],
    mode: 'create',
    supervisor: null
  });
};

exports.createSupervisor = (req, res) => {
  const errors = getSupervisorValidationErrors(req.body);

  if (req.body.username && userModel.getByUsername(req.body.username)) {
    errors.push('Username is already in use.');
  }

  if (errors.length) {
    return res.status(400).render('admin/supervisors', {
      pageTitle: 'Manage Supervisors',
      supervisors: supervisorModel.getAll(),
      formData: buildSupervisorFormState(req.body),
      errors,
      mode: 'create',
      supervisor: null
    });
  }

  try {
    db.exec('BEGIN');
    const result = supervisorModel.create(req.body);
    userModel.create({
      username: req.body.username,
      password: req.body.password,
      role: 'supervisor',
      supervisor_id: result.lastInsertRowid
    });
    db.exec('COMMIT');
    res.redirect('/admin/supervisors');
  } catch (error) {
    db.exec('ROLLBACK');
    return res.status(400).render('admin/supervisors', {
      pageTitle: 'Manage Supervisors',
      supervisors: supervisorModel.getAll(),
      formData: buildSupervisorFormState(req.body),
      errors: ['Unable to create supervisor account. Please check the details and try again.'],
      mode: 'create',
      supervisor: null
    });
  }
};

exports.showEditSupervisor = (req, res) => {
  const supervisor = supervisorModel.getById(req.params.id);
  if (!supervisor) {
    return res.status(404).render('error', {
      message: 'Supervisor not found.',
      error: {},
      pageTitle: 'Supervisor Not Found'
    });
  }

  res.render('admin/supervisors', {
    pageTitle: 'Manage Supervisors',
    supervisors: supervisorModel.getAll(),
    formData: buildSupervisorFormState({
      ...supervisor,
      ...(userModel.getBySupervisorId(supervisor.id) || {})
    }),
    errors: [],
    mode: 'edit',
    supervisor
  });
};

exports.updateSupervisor = (req, res) => {
  const supervisor = supervisorModel.getById(req.params.id);
  if (!supervisor) {
    return res.status(404).render('error', {
      message: 'Supervisor not found.',
      error: {},
      pageTitle: 'Supervisor Not Found'
    });
  }

  const errors = getSupervisorValidationErrors(req.body);
  const existingUser = userModel.getBySupervisorId(req.params.id);
  const usernameOwner = req.body.username ? userModel.getByUsername(req.body.username) : null;

  if (usernameOwner && (!existingUser || Number(usernameOwner.id) !== Number(existingUser.id))) {
    errors.push('Username is already in use.');
  }

  if (errors.length) {
    return res.status(400).render('admin/supervisors', {
      pageTitle: 'Manage Supervisors',
      supervisors: supervisorModel.getAll(),
      formData: buildSupervisorFormState(req.body),
      errors,
      mode: 'edit',
      supervisor
    });
  }

  try {
    db.exec('BEGIN');
    supervisorModel.update(req.params.id, req.body);

    if (existingUser) {
      userModel.update(existingUser.id, {
        username: req.body.username,
        password: req.body.password,
        role: 'supervisor',
        supervisor_id: req.params.id
      });
    }

    db.exec('COMMIT');
    res.redirect('/admin/supervisors');
  } catch (error) {
    db.exec('ROLLBACK');
    return res.status(400).render('admin/supervisors', {
      pageTitle: 'Manage Supervisors',
      supervisors: supervisorModel.getAll(),
      formData: buildSupervisorFormState(req.body),
      errors: ['Unable to update supervisor account. Please check the details and try again.'],
      mode: 'edit',
      supervisor
    });
  }
};

exports.deleteSupervisor = (req, res) => {
  userModel.deleteBySupervisorId(req.params.id);
  supervisorModel.delete(req.params.id);
  res.redirect('/admin/supervisors');
};
