const express = require('express');
const router = express.Router();
const {
  createSalarySlip,
  getSalarySlipById,
  getSalarySlipPDF,
  getSalaryHistory,
  updateSalarySlip,
  deleteSalarySlip
} = require('../controllers/salaryController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateSalarySlip } = require('../middleware/validate');

// PDF download supports direct token auth from query if opened in new tab or header
router.get('/:id/pdf', authenticate, getSalarySlipPDF);

// Salary History (Filtered for employee or all for admin)
router.get('/history', authenticate, getSalaryHistory);

// Create salary slip (Admin only)
router.post('/', authenticate, authorize('admin'), validateSalarySlip, createSalarySlip);

// View salary slip by ID or SlipNumber (Admin or self)
router.get('/:id', authenticate, getSalarySlipById);

// Update salary slip (Admin only)
router.put('/:id', authenticate, authorize('admin'), updateSalarySlip);

// Delete salary slip (Admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteSalarySlip);

module.exports = router;
