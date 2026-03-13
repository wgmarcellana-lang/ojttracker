exports.requireRole = (...roles) => {
  return (req, res, next) => {
    const { user } = req;

    if (!user) {
      return res.status(401).json({
        success: false,
        details: 'Authentication required.',
        redirectPath: '/auth/login'
      });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        details: 'You do not have permission to access this resource.'
      });
    }

    return next();
  };
};
