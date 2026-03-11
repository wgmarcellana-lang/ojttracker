const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../validators/authValidator');

router.get('/login', authController.showLogin);
router.get('/session', authController.getSession);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
