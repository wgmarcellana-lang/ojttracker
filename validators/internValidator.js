const getInternValidationErrors = async (payload = {}) => {
  const errors = [];

  if (!payload.name || !String(payload.name).trim()) {
    errors.push('Intern name is required.');
  }

  if (!payload.school || !String(payload.school).trim()) {
    errors.push('School is required.');
  }

  if (!payload.course || !String(payload.course).trim()) {
    errors.push('Course is required.');
  }

  const requiredHours = Number(payload.required_hours);
  if (!Number.isFinite(requiredHours) || requiredHours <= 0) {
    errors.push('Required hours must be a positive number.');
  }

  if (!payload.start_date || Number.isNaN(new Date(payload.start_date).getTime())) {
    errors.push('A valid internship start date is required.');
  }

  return errors;
};

exports.getInternValidationErrors = getInternValidationErrors;

async function validateIntern(req, res, next) {
  try {
    req.validationErrors = await getInternValidationErrors(req.body);
    return next();
  } catch (error) {
    return next(error);
  }
}

exports.validateIntern = validateIntern;
