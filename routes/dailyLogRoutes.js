const express = require('express');
const router = express.Router();
const dailyLogController = require('../controllers/dailyLogController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateDailyLog } = require('../validators/dailyLogValidator');

router.use(requireAuth);

router.get('/', requireRole('intern', 'supervisor', 'admin'), dailyLogController.getLogs);
router.get('/new', requireRole('intern', 'admin'), dailyLogController.showCreateForm);
router.post('/', requireRole('intern', 'admin'), validateDailyLog, dailyLogController.createLog);
router.get('/:id/edit', requireRole('intern', 'admin'), dailyLogController.showEditForm);
router.post('/:id/update', requireRole('intern', 'admin'), validateDailyLog, dailyLogController.updateLog);
router.post('/:id/delete', requireRole('intern', 'admin'), dailyLogController.deleteLog);
router.get('/:id', requireRole('intern', 'supervisor', 'admin'), dailyLogController.getLogById);

module.exports = router;
