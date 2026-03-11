const express = require('express');
const router = express.Router();
const supervisorController = require('../controllers/supervisorController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(requireAuth);

router.get('/dashboard', requireRole('supervisor', 'admin'), supervisorController.showDashboard);
router.get('/review-logs', requireRole('supervisor', 'admin'), supervisorController.reviewLogs);
router.post('/logs/:logId/approve', requireRole('supervisor', 'admin'), supervisorController.approveLog);
router.post('/logs/:logId/reject', requireRole('supervisor', 'admin'), supervisorController.rejectLog);

module.exports = router;
