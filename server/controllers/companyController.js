const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { CompanyRepo } = require('../services/dataService');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `company_logo_${Date.now()}${ext}`;
    cb(null, safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WEBP, and SVG images are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
}).single('logo');

/**
 * Get Company Profile
 * GET /api/company
 */
const getCompany = async (req, res, next) => {
  try {
    const company = await CompanyRepo.get();
    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Company Details (Admin only)
 * PUT /api/company
 */
const updateCompany = async (req, res, next) => {
  try {
    const updateData = { ...req.body };
    const company = await CompanyRepo.update(updateData);

    res.json({
      success: true,
      message: 'Company profile updated successfully.',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Company Logo (Admin only)
 * POST /api/company/logo
 */
const uploadLogo = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded.'
      });
    }

    try {
      const logoPath = `/uploads/${req.file.filename}`;
      const company = await CompanyRepo.update({ logoPath });

      res.json({
        success: true,
        message: 'Company logo uploaded successfully.',
        logoPath,
        data: company
      });
    } catch (error) {
      next(error);
    }
  });
};

module.exports = {
  getCompany,
  updateCompany,
  uploadLogo
};
