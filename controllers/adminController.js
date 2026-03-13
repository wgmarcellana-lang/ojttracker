const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const { withTransaction } = require('../config/database');

const buildSupervisorFormState = (payload = {}) => ({
  name: payload.name || '',
  email: payload.email || '',
  department: payload.department || '',
  username: payload.username || '',
  password: payload.password || ''
});

const getSupervisorValidationErrors = async (payload = {}) => {
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

async function showDashboard(req, res, next) {
  try {
    const [interns, supervisors, logs] = await Promise.all([
      internModel.getAll(),
      supervisorModel.getAll(),
      dailyLogModel.getAll()
    ]);

    return res.render('admin/dashboard', {
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
  } catch (error) {
    return next(error);
  }
}

async function manageInterns(req, res, next) {
  try {
    return res.render('admin/interns', {
      pageTitle: 'Manage Interns',
      interns: await internModel.getAll()
    });
  } catch (error) {
    return next(error);
  }
}

async function manageSupervisors(req, res, next) {
  try {
    return res.render('admin/supervisors', {
      pageTitle: 'Manage Supervisors',
      supervisors: await supervisorModel.getAll(),
      showForm: false,
      formData: buildSupervisorFormState(),
      errors: [],
      mode: 'create',
      supervisor: null
    });
  } catch (error) {
    return next(error);
  }
}

async function showCreateSupervisor(req, res, next) {
  try {
    return res.render('admin/supervisors', {
      pageTitle: 'Add Supervisor',
      supervisors: await supervisorModel.getAll(),
      showForm: true,
      formData: buildSupervisorFormState(),
      errors: [],
      mode: 'create',
      supervisor: null
    });
  } catch (error) {
    return next(error);
  }
}

async function createSupervisor(req, res) {
  try {
    const { body, validationErrors = [] } = req;
    const { username, password } = body;
    const errors = validationErrors.length ? validationErrors : await getSupervisorValidationErrors(body);

    if (username && await userModel.getByUsername(username)) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: buildSupervisorFormState(body)
      });
    }

    const result = await withTransaction(async () => {
      const createdSupervisor = await supervisorModel.create(body);
      await userModel.create({
        username,
        password,
        role: 'supervisor',
        supervisor_id: createdSupervisor.lastInsertRowid
      });

      return createdSupervisor;
    });

    return res.status(201).json({
      success: true,
      details: 'Supervisor created successfully.',
      redirectPath: '/admin/supervisors',
      supervisorId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      details: 'Unable to create supervisor account. Please check the details and try again.',
      errors: ['Unable to create supervisor account. Please check the details and try again.'],
      formData: buildSupervisorFormState(req.body)
    });
  }
}

async function showEditSupervisor(req, res, next) {
  try {
    const { params } = req;
    const { id } = params;
    const supervisor = await supervisorModel.getById(id);
    if (!supervisor) {
      return res.status(404).render('error', {
        message: 'Supervisor not found.',
        error: {},
        pageTitle: 'Supervisor Not Found'
      });
    }

    const [supervisors, userAccount] = await Promise.all([
      supervisorModel.getAll(),
      userModel.getBySupervisorId(supervisor.id)
    ]);

    return res.render('admin/supervisors', {
      pageTitle: 'Manage Supervisors',
      supervisors,
      showForm: true,
      formData: buildSupervisorFormState({
        ...supervisor,
        ...(userAccount || {})
      }),
      errors: [],
      mode: 'edit',
      supervisor
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSupervisor(req, res) {
  try {
    const { body, params, validationErrors = [] } = req;
    const { id } = params;
    const { username, password } = body;
    const supervisor = await supervisorModel.getById(id);
    if (!supervisor) {
      return res.status(404).json({
        success: false,
        details: 'Supervisor not found.'
      });
    }

    const errors = validationErrors.length ? validationErrors : await getSupervisorValidationErrors(body);
    const [existingUser, usernameOwner] = await Promise.all([
      userModel.getBySupervisorId(id),
      username ? userModel.getByUsername(username) : Promise.resolve(null)
    ]);

    if (usernameOwner && (!existingUser || Number(usernameOwner.id) !== Number(existingUser.id))) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: buildSupervisorFormState(body)
      });
    }

    await withTransaction(async () => {
      await supervisorModel.update(id, body);

      if (existingUser) {
        await userModel.update(existingUser.id, {
          username,
          password,
          role: 'supervisor',
          supervisor_id: id
        });
      }
    });

    return res.status(200).json({
      success: true,
      details: 'Supervisor updated successfully.',
      redirectPath: '/admin/supervisors',
      supervisorId: Number(id)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      details: 'Unable to update supervisor account. Please check the details and try again.',
      errors: ['Unable to update supervisor account. Please check the details and try again.'],
      formData: buildSupervisorFormState(req.body)
    });
  }
}

async function deleteSupervisor(req, res, next) {
  try {
    const { params } = req;
    const { id } = params;
    const supervisor = await supervisorModel.getById(id);
    if (!supervisor) {
      return res.status(404).json({
        success: false,
        details: 'Supervisor not found.'
      });
    }

    await withTransaction(async () => {
      await userModel.deleteBySupervisorId(id);
      await supervisorModel.delete(id);
    });

    return res.status(200).json({
      success: true,
      details: 'Supervisor deleted successfully.',
      redirectPath: '/admin/supervisors',
      supervisorId: Number(id)
    });
  } catch (error) {
    return next(error);
  }
}

exports.showDashboard = showDashboard;
exports.manageInterns = manageInterns;
exports.manageSupervisors = manageSupervisors;
exports.showCreateSupervisor = showCreateSupervisor;
exports.createSupervisor = createSupervisor;
exports.showEditSupervisor = showEditSupervisor;
exports.updateSupervisor = updateSupervisor;
exports.deleteSupervisor = deleteSupervisor;
