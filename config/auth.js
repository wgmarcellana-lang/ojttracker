module.exports = {
  authCookieName: process.env.AUTH_COOKIE_NAME || 'ojttracker_auth',
  authCookieSecret: process.env.AUTH_COOKIE_SECRET || 'change-this-auth-cookie-secret',
  jwtSecret: process.env.JWT_SECRET || process.env.AUTH_COOKIE_SECRET || 'change-this-jwt-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminDisplayName: process.env.ADMIN_DISPLAY_NAME || 'System Admin',
  adminDepartment: process.env.ADMIN_DEPARTMENT || 'Operations',
  loginRedirectPath: '/auth/login',
  roleRedirects: {
    intern: '/interns/dashboard',
    supervisor: '/supervisors/dashboard',
    admin: '/admin/dashboard'
  }
};
