const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../validators/authValidator');

router.get('/login', authController.showLogin);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authController.logout);

module.exports = router;
