const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const { withTransaction } = require('../config/database');
const reportUtils = require('../utilities/reportUtils');
const { getInternValidationErrors } = require('../validators/internValidator');

const buildSupervisorValidationErrors = async (payload = {}) => {
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

async function getInterns(req, res, next) {
  try {
    const [interns, supervisors] = await Promise.all([
      internModel.getAll(),
      supervisorModel.getAll()
    ]);

    return res.status(200).json({
      success: true,
      interns,
      supervisors
    });
  } catch (error) {
    return next(error);
  }
}

async function getInternById(req, res, next) {
  try {
    const { params } = req;
    const { id } = params;
    const [intern, logs, supervisors, userAccount] = await Promise.all([
      internModel.getById(id),
      dailyLogModel.getByInternId(id),
      supervisorModel.getAll(),
      userModel.getByInternId(id)
    ]);

    if (!intern) {
      return res.status(404).json({
        success: false,
        details: 'Intern not found.'
      });
    }

    const report = reportUtils.buildCompletionReport(intern, logs);

    return res.status(200).json({
      success: true,
      intern: {
        ...intern,
        username: userAccount?.username || intern.username || ''
      },
      logs,
      supervisors,
      report
    });
  } catch (error) {
    return next(error);
  }
}

async function createIntern(req, res, next) {
  try {
    const { body, validationErrors = [] } = req;
    const { username, password } = body;
    const errors = validationErrors.length ? validationErrors : await getInternValidationErrors(body);

    if (!username || !String(username).trim()) {
      errors.push('Username is required.');
    }

    if (!password || !String(password).trim()) {
      errors.push('Password is required.');
    }

    if (username && await userModel.getByUsername(username)) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors
      });
    }

    const result = await withTransaction(async () => {
      const createdIntern = await internModel.create(body);
      await userModel.create({
        username,
        password,
        role: 'intern',
        intern_id: createdIntern.lastInsertRowid
      });

      return createdIntern;
    });

    return res.status(201).json({
      success: true,
      details: 'Intern created successfully.',
      internId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateIntern(req, res, next) {
  try {
    const { body, params, validationErrors = [] } = req;
    const { id } = params;
    const { username, password } = body;
    const intern = await internModel.getById(id);
    if (!intern) {
      return res.status(404).json({
        success: false,
        details: 'Intern not found.'
      });
    }

    const errors = validationErrors.length ? validationErrors : await getInternValidationErrors(body);
    const [existingUser, usernameOwner] = await Promise.all([
      userModel.getByInternId(id),
      username ? userModel.getByUsername(username) : Promise.resolve(null)
    ]);

    if (!username || !String(username).trim()) {
      errors.push('Username is required.');
    }

    if (!password || !String(password).trim()) {
      errors.push('Password is required.');
    }

    if (usernameOwner && (!existingUser || Number(usernameOwner.id) !== Number(existingUser.id))) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors
      });
    }

    await withTransaction(async () => {
      await internModel.update(id, body);

      if (existingUser) {
        await userModel.update(existingUser.id, {
          username,
          password,
          role: 'intern',
          intern_id: id
        });
      }
    });

    return res.status(200).json({
      success: true,
      details: 'Intern updated successfully.',
      internId: Number(id)
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteIntern(req, res, next) {
  try {
    const { params } = req;
    const { id } = params;
    const intern = await internModel.getById(id);
    if (!intern) {
      return res.status(404).json({
        success: false,
        details: 'Intern not found.'
      });
    }

    await withTransaction(async () => {
      await userModel.deleteByInternId(id);
      await internModel.delete(id);
    });

    return res.status(200).json({
      success: true,
      details: 'Intern deleted successfully.',
      internId: Number(id)
    });
  } catch (error) {
    return next(error);
  }
}

async function getSupervisors(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      supervisors: await supervisorModel.getAll()
    });
  } catch (error) {
    return next(error);
  }
}

async function getSupervisorById(req, res, next) {
  try {
    const { params } = req;
    const { id } = params;
    const [supervisor, supervisors, userAccount] = await Promise.all([
      supervisorModel.getById(id),
      supervisorModel.getAll(),
      userModel.getBySupervisorId(id)
    ]);

    if (!supervisor) {
      return res.status(404).json({
        success: false,
        details: 'Supervisor not found.'
      });
    }

    return res.status(200).json({
      success: true,
      supervisor: {
        ...supervisor,
        username: userAccount?.username || supervisor.username || ''
      },
      supervisors
    });
  } catch (error) {
    return next(error);
  }
}

async function createSupervisor(req, res, next) {
  try {
    const { body, validationErrors = [] } = req;
    const { username, password } = body;
    const errors = validationErrors.length ? validationErrors : await buildSupervisorValidationErrors(body);

    if (username && await userModel.getByUsername(username)) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors
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
      supervisorId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    return next(error);
  }
}

async function updateSupervisor(req, res, next) {
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

    const errors = validationErrors.length ? validationErrors : await buildSupervisorValidationErrors(body);
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
        errors
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
      supervisorId: Number(id)
    });
  } catch (error) {
    return next(error);
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
      supervisorId: Number(id)
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getInterns,
  getInternById,
  createIntern,
  updateIntern,
  deleteIntern,
  getSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor
};
