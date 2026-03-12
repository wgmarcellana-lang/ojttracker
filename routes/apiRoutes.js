const express = require('express');
const router = express.Router();
const mobileLogController = require('../controllers/mobileLogController');
const mobileAppController = require('../controllers/mobileAppController');
const mobileAdminController = require('../controllers/mobileAdminController');
const mobileReportController = require('../controllers/mobileReportController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateDailyLog } = require('../validators/dailyLogValidator');
const { validateIntern } = require('../validators/internValidator');

router.use(requireAuth);

router.get('/dashboard', requireRole('intern', 'supervisor', 'admin'), mobileAppController.getDashboard);
router.get('/review-logs', requireRole('supervisor', 'admin'), mobileAppController.getReviewLogs);
router.post('/review-logs/:logId/approve', requireRole('supervisor', 'admin'), mobileAppController.approveLog);
router.post('/review-logs/:logId/reject', requireRole('supervisor', 'admin'), mobileAppController.rejectLog);
router.get('/logs', requireRole('intern', 'supervisor', 'admin'), mobileLogController.getLogs);
router.get('/logs/:id', requireRole('intern', 'supervisor', 'admin'), mobileLogController.getLogById);
router.post('/logs', requireRole('intern', 'admin'), validateDailyLog, mobileLogController.createLog);
router.put('/logs/:id', requireRole('intern', 'admin'), validateDailyLog, mobileLogController.updateLog);
router.delete('/logs/:id', requireRole('intern', 'admin'), mobileLogController.deleteLog);
router.get('/interns', requireRole('admin'), mobileAdminController.getInterns);
router.get('/interns/:id', requireRole('admin'), mobileAdminController.getInternById);
router.post('/interns', requireRole('admin'), validateIntern, mobileAdminController.createIntern);
router.put('/interns/:id', requireRole('admin'), validateIntern, mobileAdminController.updateIntern);
router.delete('/interns/:id', requireRole('admin'), mobileAdminController.deleteIntern);
router.get('/supervisors', requireRole('admin'), mobileAdminController.getSupervisors);
router.get('/supervisors/:id', requireRole('admin'), mobileAdminController.getSupervisorById);
router.post('/supervisors', requireRole('admin'), mobileAdminController.createSupervisor);
router.put('/supervisors/:id', requireRole('admin'), mobileAdminController.updateSupervisor);
router.delete('/supervisors/:id', requireRole('admin'), mobileAdminController.deleteSupervisor);
router.get('/reports', requireRole('intern', 'supervisor', 'admin'), mobileReportController.getReport);
router.get('/reports/:internId/csv', requireRole('intern', 'supervisor', 'admin'), mobileReportController.exportCsv);

module.exports = router;
