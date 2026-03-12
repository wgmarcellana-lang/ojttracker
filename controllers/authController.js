const userModel = require('../model/userModel');
const { AUTH_COOKIE_NAME, getRedirectPath } = require('../middleware/authMiddleware');
const { getLoginValidationErrors } = require('../validators/authValidator');
const { encryptAuthCookie, encryptAuthToken } = require('../utilities/authCookie');
const { isPasswordHash, verifyPassword } = require('../utilities/passwordUtils');

const getLoginFormData = (payload = {}) => ({
  username: payload.username || '',
  password: payload.password || ''
});

const buildInvalidLoginResponse = (payload = {}) => ({
  success: false,
  details: 'Invalid credentials. Please try again.',
  errors: ['Invalid credentials. Please try again.'],
  formData: getLoginFormData(payload)
});

async function showLogin(req, res, next) {
  try {
    return res.render('auth/login', {
      pageTitle: 'Login',
      errors: req.user ? ['You are already logged in.'] : [],
      formData: getLoginFormData()
    });
  } catch (error) {
    return next(error);
  }
}

async function getSession(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      authenticated: Boolean(req.user),
      redirectPath: getRedirectPath(req.user),
      user: req.user || null
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const errors = req.validationErrors || await getLoginValidationErrors(req.body);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: getLoginFormData(req.body)
      });
    }

    const username = String(req.body.username).trim().toLowerCase();
    const account = await userModel.getByUsername(username);

    if (!account) {
      return res.status(401).json(buildInvalidLoginResponse(req.body));
    }

    const isPasswordValid = await verifyPassword(req.body.password, account.password);
    if (!isPasswordValid) {
      return res.status(401).json(buildInvalidLoginResponse(req.body));
    }

    if (!isPasswordHash(account.password)) {
      await userModel.updatePassword(account.id, req.body.password);
    }

    const encryptedCookie = await encryptAuthCookie({
      role: account.role,
      userId: account.id
    });
    const accessToken = await encryptAuthToken({
      role: account.role,
      userId: account.id
    });

    res.cookie(AUTH_COOKIE_NAME, encryptedCookie, {
      httpOnly: true,
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      details: 'Login successful.',
      redirectPath: getRedirectPath({ role: account.role }),
      accessToken,
      user: {
        id: account.id,
        username: account.username,
        role: account.role
      }
    });
  } catch (error) {
    return next(error);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie(AUTH_COOKIE_NAME);
    return res.status(200).json({
      success: true,
      details: 'Logout successful.'
    });
  } catch (error) {
    return next(error);
  }
}

exports.showLogin = showLogin;
exports.getSession = getSession;
exports.login = login;
exports.logout = logout;
