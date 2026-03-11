exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect('/auth/login');
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).render('error', {
        message: 'You do not have permission to access this page.',
        error: {},
        pageTitle: 'Access Denied'
      });
    }

    return next();
  };
};
