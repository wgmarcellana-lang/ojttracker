exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        details: 'Authentication required.',
        redirectPath: '/auth/login'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to access this resource.'
      });
    }

    return next();
  };
};
