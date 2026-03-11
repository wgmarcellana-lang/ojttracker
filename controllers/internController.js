const dailyLogModel = require('../model/dailyLogModel');
const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const { withTransaction } = require('../config/database');
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

async function showDashboard(req, res, next) {
  try {
    const targetInternId = req.user.role === 'intern'
      ? req.user.entityId
      : Number(req.query.id || 1);

    const [summary, allLogs, recentLogs] = await Promise.all([
      internModel.getDashboardSummary(targetInternId),
      dailyLogModel.getByInternId(targetInternId),
      dailyLogModel.getRecentByIntern(targetInternId, 5)
    ]);

    if (!summary) {
      return res.status(404).render('error', {
        message: 'Intern not found.',
        error: {},
        pageTitle: 'Intern Not Found'
      });
    }

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

    return res.render('intern/dashboard', {
      pageTitle: 'Intern Dashboard',
      intern: summary.intern,
      renderedHours,
      totalHours: summary.totalHours,
      pendingCount: summary.pendingCount,
      remainingHours,
      completionPercentage,
      weeklySummary: buildWeeklySummary(approvedLogs),
      recentLogs
    });
  } catch (error) {
    return next(error);
  }
}

async function getInterns(req, res, next) {
  try {
    return res.render('intern/index', {
      pageTitle: 'Intern Directory',
      interns: await internModel.getAll()
    });
  } catch (error) {
    return next(error);
  }
}

async function getInternById(req, res, next) {
  try {
    if (!canAccessIntern(req, req.params.id)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to access this intern.',
        redirectPath: '/interns/dashboard'
      });
    }

    const [intern, logs] = await Promise.all([
      internModel.getById(req.params.id),
      dailyLogModel.getByInternId(req.params.id)
    ]);
    if (!intern) {
      return res.status(404).render('error', {
        message: 'Intern not found.',
        error: {},
        pageTitle: 'Intern Not Found'
      });
    }

    const approvedLogs = logs.filter((log) => log.status === 'approved');
    const renderedHours = sumHours(approvedLogs);

    return res.render('intern/show', {
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
  } catch (error) {
    return next(error);
  }
}

async function showCreateForm(req, res, next) {
  try {
    return res.render('intern/edit', {
      pageTitle: 'Add Intern',
      mode: 'create',
      errors: [],
      formData: buildFormState(),
      supervisors: await supervisorModel.getAll(),
      intern: null
    });
  } catch (error) {
    return next(error);
  }
}

async function createIntern(req, res) {
  try {
    const errors = req.validationErrors || await getInternValidationErrors(req.body);

    if (!req.body.username || !String(req.body.username).trim()) {
      errors.push('Username is required.');
    }

    if (!req.body.password || !String(req.body.password).trim()) {
      errors.push('Password is required.');
    }

    if (req.body.username && await userModel.getByUsername(req.body.username)) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: buildFormState(req.body)
      });
    }

    const result = await withTransaction(async () => {
      const createdIntern = await internModel.create(req.body);
      await userModel.create({
        username: req.body.username,
        password: req.body.password,
        role: 'intern',
        intern_id: createdIntern.lastInsertRowid
      });

      return createdIntern;
    });

    return res.status(201).json({
      success: true,
      details: 'Intern created successfully.',
      redirectPath: `/interns/${result.lastInsertRowid}`,
      internId: Number(result.lastInsertRowid)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      details: 'Unable to create intern account. Please check the details and try again.',
      errors: ['Unable to create intern account. Please check the details and try again.'],
      formData: buildFormState(req.body)
    });
  }
}

async function showEditForm(req, res, next) {
  try {
    const intern = await internModel.getById(req.params.id);

    if (!intern) {
      return res.status(404).render('error', {
        message: 'Intern not found.',
        error: {},
        pageTitle: 'Intern Not Found'
      });
    }

    const [supervisors, userAccount] = await Promise.all([
      supervisorModel.getAll(),
      userModel.getByInternId(intern.id)
    ]);

    return res.render('intern/edit', {
      pageTitle: 'Edit Intern',
      mode: 'edit',
      errors: [],
      formData: buildFormState({
        ...intern,
        ...(userAccount || {})
      }),
      supervisors,
      intern
    });
  } catch (error) {
    return next(error);
  }
}

async function updateIntern(req, res) {
  try {
    const intern = await internModel.getById(req.params.id);
    if (!intern) {
      return res.status(404).json({
        success: false,
        details: 'Intern not found.'
      });
    }

    const errors = req.validationErrors || await getInternValidationErrors(req.body);
    const [existingUser, usernameOwner] = await Promise.all([
      userModel.getByInternId(req.params.id),
      req.body.username ? userModel.getByUsername(req.body.username) : Promise.resolve(null)
    ]);

    if (!req.body.username || !String(req.body.username).trim()) {
      errors.push('Username is required.');
    }

    if (!req.body.password || !String(req.body.password).trim()) {
      errors.push('Password is required.');
    }

    if (usernameOwner && (!existingUser || Number(usernameOwner.id) !== Number(existingUser.id))) {
      errors.push('Username is already in use.');
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: buildFormState(req.body)
      });
    }

    await withTransaction(async () => {
      await internModel.update(req.params.id, req.body);

      if (existingUser) {
        await userModel.update(existingUser.id, {
          username: req.body.username,
          password: req.body.password,
          role: 'intern',
          intern_id: req.params.id
        });
      }
    });

    return res.status(200).json({
      success: true,
      details: 'Intern updated successfully.',
      redirectPath: `/interns/${req.params.id}`,
      internId: Number(req.params.id)
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      details: 'Unable to update the intern account. Please check the details and try again.',
      errors: ['Unable to update the intern account. Please check the details and try again.'],
      formData: buildFormState(req.body)
    });
  }
}

async function deleteIntern(req, res, next) {
  try {
    const intern = await internModel.getById(req.params.id);
    if (!intern) {
      return res.status(404).json({
        success: false,
        details: 'Intern not found.'
      });
    }

    await withTransaction(async () => {
      await userModel.deleteByInternId(req.params.id);
      await internModel.delete(req.params.id);
    });

    return res.status(200).json({
      success: true,
      details: 'Intern deleted successfully.',
      redirectPath: '/interns',
      internId: Number(req.params.id)
    });
  } catch (error) {
    return next(error);
  }
}

exports.showDashboard = showDashboard;
exports.getInterns = getInterns;
exports.getInternById = getInternById;
exports.showCreateForm = showCreateForm;
exports.createIntern = createIntern;
exports.showEditForm = showEditForm;
exports.updateIntern = updateIntern;
exports.deleteIntern = deleteIntern;
