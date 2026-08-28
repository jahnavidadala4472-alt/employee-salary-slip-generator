const express = require('express');
const router = express.Router();
const { getCompany, updateCompany, uploadLogo } = require('../controllers/companyController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public or Authenticated can view company profile
router.get('/', getCompany);

// Admin-only updates
router.post('/', authenticate, authorize('admin'), updateCompany);
router.put('/', authenticate, authorize('admin'), updateCompany);
router.post('/logo', authenticate, authorize('admin'), uploadLogo);

module.exports = router;
