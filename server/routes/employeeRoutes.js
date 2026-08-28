const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateEmployee } = require('../middleware/validate');

// All employee routes require authentication
router.use(authenticate);

// Admin-only listing
router.get('/', authorize('admin'), getAllEmployees);

// Admin or Self employee view
router.get('/:id', getEmployeeById);

// Admin-only management
router.post('/', authorize('admin'), validateEmployee, createEmployee);
router.put('/:id', authorize('admin'), updateEmployee);
router.delete('/:id', authorize('admin'), deleteEmployee);

module.exports = router;
