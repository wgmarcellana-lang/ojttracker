const getLoginValidationErrors = async (payload = {}) => {
  const errors = [];

  if (!payload.username || !String(payload.username).trim()) {
    errors.push('Username is required.');
  }

  if (!payload.password || !String(payload.password).trim()) {
    errors.push('Password is required.');
  }

  return errors;
};

exports.getLoginValidationErrors = getLoginValidationErrors;

async function validateLogin(req, res, next) {
  try {
    req.validationErrors = await getLoginValidationErrors(req.body);
    return next();
  } catch (error) {
    return next(error);
  }
}

exports.validateLogin = validateLogin;
