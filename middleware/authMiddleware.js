const internModel = require('../model/internModel');
const supervisorModel = require('../model/supervisorModel');
const userModel = require('../model/userModel');
const authConfig = require('../config/auth');
const { decryptAuthCookie } = require('../utilities/authCookie');

const AUTH_COOKIE_NAME = authConfig.authCookieName;

const parseAuthCookie = async (cookieValue) => decryptAuthCookie(cookieValue);

const getRedirectPath = (user) => {
  if (!user) {
    return authConfig.loginRedirectPath;
  }

  return authConfig.roleRedirects[user.role] || authConfig.loginRedirectPath;
};

const loadCurrentUser = async (req, res, next) => {
  try {
    const parsed = await parseAuthCookie(req.cookies[AUTH_COOKIE_NAME]);

    if (!parsed) {
      req.user = null;
      res.locals.currentUser = null;
      res.locals.currentPath = req.path;
      return next();
    }

    const account = parsed.userId ? await userModel.getById(parsed.userId) : null;
    let profile = null;
    let entityId = null;

    if (account && account.role === 'intern' && account.intern_id) {
      profile = await internModel.getById(account.intern_id);
      entityId = account.intern_id;
    }

    if (account && account.role === 'supervisor' && account.supervisor_id) {
      profile = await supervisorModel.getById(account.supervisor_id);
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
    return next();
  } catch (error) {
    return next(error);
  }
};

const requireAuth = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        details: 'Authentication required.',
        redirectPath: '/auth/login'
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  AUTH_COOKIE_NAME,
  getRedirectPath,
  loadCurrentUser,
  parseAuthCookie,
  requireAuth
};
