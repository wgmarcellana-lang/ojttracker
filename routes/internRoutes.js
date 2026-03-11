const express = require('express');
const router = express.Router();
const internController = require('../controllers/internController');
const { requireAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validateIntern } = require('../validators/internValidator');

router.use(requireAuth);

router.get('/dashboard', requireRole('intern', 'admin'), internController.showDashboard);
router.get('/', requireRole('admin'), internController.getInterns);
router.get('/new', requireRole('admin'), internController.showCreateForm);
router.post('/', requireRole('admin'), validateIntern, internController.createIntern);
router.get('/:id/edit', requireRole('admin'), internController.showEditForm);
router.post('/:id/update', requireRole('admin'), validateIntern, internController.updateIntern);
router.post('/:id/delete', requireRole('admin'), internController.deleteIntern);
router.get('/:id', requireRole('intern', 'admin'), internController.getInternById);

module.exports = router;
