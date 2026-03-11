const userModel = require('../model/userModel');
const { AUTH_COOKIE_NAME, getRedirectPath } = require('../middleware/authMiddleware');
const { getLoginValidationErrors } = require('../validators/authValidator');

exports.showLogin = (req, res) => {
  if (req.user) {
    return res.redirect(getRedirectPath(req.user));
  }

  return res.render('auth/login', {
    pageTitle: 'Login',
    errors: [],
    formData: {
      username: '',
      password: ''
    }
  });
};

exports.login = (req, res) => {
  const errors = getLoginValidationErrors(req.body);

  if (errors.length) {
    return res.status(400).render('auth/login', {
      pageTitle: 'Login',
      errors,
      formData: req.body
    });
  }

  const username = String(req.body.username).trim().toLowerCase();
  const account = userModel.getByUsername(username);

  if (!account || account.password !== req.body.password) {
    return res.status(401).render('auth/login', {
      pageTitle: 'Login',
      errors: ['Invalid credentials. Please try again.'],
      formData: req.body
    });
  }

  res.cookie(AUTH_COOKIE_NAME, `${account.role}:${account.id}`, {
    httpOnly: true,
    sameSite: 'lax'
  });

  return res.redirect(getRedirectPath({ role: account.role }));
};

exports.logout = (req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.redirect('/auth/login');
};
