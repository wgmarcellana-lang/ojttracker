const userModel = require('../model/userModel');
const { AUTH_COOKIE_NAME, getRedirectPath } = require('../middleware/authMiddleware');
const { encryptAuthCookie, encryptAuthToken } = require('../utilities/authCookie');

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
    const { user } = req;

    return res.render('auth/login', {
      pageTitle: 'Login',
      errors: user ? ['You are already logged in.'] : [],
      formData: getLoginFormData()
    });
  } catch (error) {
    return next(error);
  }
}

async function getSession(req, res, next) {
  try {
    const { user } = req;

    return res.status(200).json({
      success: true,
      authenticated: Boolean(user),
      redirectPath: getRedirectPath(user)
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { body, validationErrors = [] } = req;
    const { username, password } = body;
    const errors = validationErrors;

    if (errors.length) {
      return res.status(400).json({
        success: false,
        details: 'Validation failed.',
        errors,
        formData: getLoginFormData(body)
      });
    }

    const accounts = await userModel.verifyCredentials(username, password);

    if (accounts.length === 0) {
      return res.status(401).json(buildInvalidLoginResponse(body));
    }

    const [account] = accounts;
    const { id, role } = account;

    const encryptedCookie = await encryptAuthCookie({
      role,
      userId: id
    });
    const accessToken = await encryptAuthToken({
      role,
      userId: id
    });

    res.cookie(AUTH_COOKIE_NAME, encryptedCookie, {
      httpOnly: true,
      sameSite: 'lax'
    });

    return res.status(200).json({
      success: true,
      details: 'Login successful.',
      redirectPath: getRedirectPath({ role }),
      accessToken
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
