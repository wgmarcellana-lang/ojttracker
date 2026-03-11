module.exports = {
  authCookieName: process.env.AUTH_COOKIE_NAME || 'ojttracker_auth',
  authCookieSecret: process.env.AUTH_COOKIE_SECRET || 'change-this-auth-cookie-secret',
  adminDisplayName: process.env.ADMIN_DISPLAY_NAME || 'System Admin',
  adminDepartment: process.env.ADMIN_DEPARTMENT || 'Operations',
  loginRedirectPath: '/auth/login',
  roleRedirects: {
    intern: '/interns/dashboard',
    supervisor: '/supervisors/dashboard',
    admin: '/admin/dashboard'
  }
};
