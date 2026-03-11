module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const payload = {
    success: false,
    details: status === 500 ? 'Internal server error.' : (err.message || 'Request failed.')
  };

  if (req.app.get('env') === 'development' && err.stack) {
    payload.stack = err.stack;
  }

  if (req.accepts('html') && !req.xhr && !String(req.path).startsWith('/auth/') && req.method === 'GET') {
    return res.status(status).render('error', {
      pageTitle: 'Application Error',
      message: payload.details,
      error: req.app.get('env') === 'development' ? err : {}
    });
  }

  return res.status(status).json(payload);
};
