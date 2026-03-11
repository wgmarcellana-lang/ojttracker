module.exports = {
  authCookieName: process.env.AUTH_COOKIE_NAME || 'ojttracker_auth',
  adminDisplayName: process.env.ADMIN_DISPLAY_NAME || 'System Admin',
  adminDepartment: process.env.ADMIN_DEPARTMENT || 'Operations',
  loginRedirectPath: '/auth/login',
  roleRedirects: {
    intern: '/interns/dashboard',
    supervisor: '/supervisors/dashboard',
    admin: '/admin/dashboard'
  }
};
