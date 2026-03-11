const getLoginValidationErrors = (payload = {}) => {
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

exports.validateLogin = (req, res, next) => {
  req.validationErrors = getLoginValidationErrors(req.body);
  next();
};
