const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(requireAuth, requireRole('intern', 'supervisor', 'admin'));

router.get('/', reportController.showReports);
router.get('/export/csv', reportController.exportCsv);
router.get('/export/pdf', reportController.exportPdf);

module.exports = router;
