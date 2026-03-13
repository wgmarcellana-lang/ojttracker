const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const { user } = req;
  let redirectPath = '/auth/login';

  if (user) {
    if (user.role === 'intern') {
      redirectPath = '/interns/dashboard';
    } else if (user.role === 'supervisor') {
      redirectPath = '/supervisors/dashboard';
    } else {
      redirectPath = '/admin/dashboard';
    }
  }

  return res
    .status(200)
    .type('html')
    .send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting</title>
</head>
<body>
  <p>Redirecting...</p>
  <script>
    window.location.replace(${JSON.stringify(redirectPath)});
  </script>
</body>
</html>`);
});

module.exports = router;
