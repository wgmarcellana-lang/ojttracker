const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.user) {
    if (req.user.role === 'intern') {
      return res.redirect('/interns/dashboard');
    }

    if (req.user.role === 'supervisor') {
      return res.redirect('/supervisors/dashboard');
    }

    return res.redirect('/admin/dashboard');
  }

  return res.redirect('/auth/login');
});

module.exports = router;
