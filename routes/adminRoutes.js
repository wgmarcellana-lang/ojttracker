const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.use(requireAuth, requireRole('admin'));

router.get('/dashboard', adminController.showDashboard);
router.get('/interns', adminController.manageInterns);
router.get('/supervisors', adminController.manageSupervisors);
router.post('/supervisors', adminController.createSupervisor);
router.get('/supervisors/:id/edit', adminController.showEditSupervisor);
router.post('/supervisors/:id/update', adminController.updateSupervisor);
router.post('/supervisors/:id/delete', adminController.deleteSupervisor);

module.exports = router;
