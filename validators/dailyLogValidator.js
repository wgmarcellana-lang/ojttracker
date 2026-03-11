const getDailyLogValidationErrors = async (payload = {}) => {
  const errors = [];

  if (!payload.date || Number.isNaN(new Date(payload.date).getTime())) {
    errors.push('A valid work date is required.');
  }

  if (!payload.time_in || !/^\d{2}:\d{2}$/.test(payload.time_in)) {
    errors.push('Time in is required.');
  }

  if (!payload.time_out || !/^\d{2}:\d{2}$/.test(payload.time_out)) {
    errors.push('Time out is required.');
  }

  const breakHours = Number(payload.break_hours ?? 1);
  if (!Number.isFinite(breakHours) || breakHours < 0) {
    errors.push('Break hours must be zero or greater.');
  }

  if (!payload.task_description || !String(payload.task_description).trim()) {
    errors.push('Task description is required.');
  }

  if (payload.intern_id && Number(payload.intern_id) <= 0) {
    errors.push('A valid intern must be selected.');
  }

  return errors;
};

exports.getDailyLogValidationErrors = getDailyLogValidationErrors;

async function validateDailyLog(req, res, next) {
  try {
    req.validationErrors = await getDailyLogValidationErrors(req.body);
    return next();
  } catch (error) {
    return next(error);
  }
}

exports.validateDailyLog = validateDailyLog;
