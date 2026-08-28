const express = require('express');
const router = express.Router();
const {
  chat,
  getSlipSummary,
  detectAnomaly,
  getAnomaliesList,
  reviewAnomaly
} = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(authenticate);

// AI Chat for both Admin and Employees
router.post('/chat', chat);

// AI Salary Slip Summary
router.post('/summary', getSlipSummary);

// AI Anomaly Actions (Admin only)
router.post('/anomaly', authorize('admin'), detectAnomaly);
router.get('/anomalies', authorize('admin'), getAnomaliesList);
router.put('/anomalies/:id', authorize('admin'), reviewAnomaly);

module.exports = router;
