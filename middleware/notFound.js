module.exports = (req, res, next) => {
  if (req.accepts('html') && req.method === 'GET') {
    return res.status(404).render('error', {
      pageTitle: 'Not Found',
      message: 'The requested resource was not found.',
      error: {}
    });
  }

  return res.status(404).json({
    success: false,
    details: 'The requested resource was not found.'
  });
};
