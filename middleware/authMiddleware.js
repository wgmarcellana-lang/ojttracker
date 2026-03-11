const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const authConfig = require('../config/auth');

const AUTH_COOKIE_NAME = authConfig.authCookieName;

const parseAuthCookie = (cookieValue) => {
  if (!cookieValue) {
    return null;
  }

  const [role, userId] = String(cookieValue).split(':');
  if (!role) {
    return null;
  }

  return {
    role,
    userId: userId ? Number(userId) : null
  };
};

const getRedirectPath = (user) => {
  if (!user) {
    return authConfig.loginRedirectPath;
  }

  return authConfig.roleRedirects[user.role] || authConfig.loginRedirectPath;
};

const loadCurrentUser = (req, res, next) => {
  const parsed = parseAuthCookie(req.cookies[AUTH_COOKIE_NAME]);

  if (!parsed) {
    req.user = null;
    res.locals.currentUser = null;
    res.locals.currentPath = req.path;
    return next();
  }

  const account = parsed.userId ? userModel.getById(parsed.userId) : null;
  let profile = null;
  let entityId = null;

  if (account && account.role === 'intern' && account.intern_id) {
    profile = internModel.getById(account.intern_id);
    entityId = account.intern_id;
  }

  if (account && account.role === 'supervisor' && account.supervisor_id) {
    profile = supervisorModel.getById(account.supervisor_id);
    entityId = account.supervisor_id;
  }

  if (account && account.role === 'admin') {
    profile = {
      id: account.id,
      name: authConfig.adminDisplayName,
      department: authConfig.adminDepartment
    };
    entityId = 0;
  }

  req.user = profile ? {
    id: account.id,
    username: account.username,
    role: account.role,
    entityId,
    profile
  } : null;

  res.locals.currentUser = req.user;
  res.locals.currentPath = req.path;
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/auth/login');
  }

  next();
};

module.exports = {
  AUTH_COOKIE_NAME,
  getRedirectPath,
  loadCurrentUser,
  parseAuthCookie,
  requireAuth
};
