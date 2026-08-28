const { isValidEmail, isValidPhone, isNonNegativeNumber } = require('../utils/validation');

/**
 * Validate Register Request
 */
const validateRegister = (req, res, next) => {
  const { fullName, email, password, phone, employeeId } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ success: false, message: 'Full name is required.' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  if (phone && !isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
  }

  next();
};

/**
 * Validate Employee Creation / Update
 */
const validateEmployee = (req, res, next) => {
  const { fullName, employeeId, department, designation, joiningDate, email, phone } = req.body;

  if (!fullName || !fullName.trim()) {
    return res.status(400).json({ success: false, message: 'Employee full name is required.' });
  }

  if (!employeeId || !employeeId.trim()) {
    return res.status(400).json({ success: false, message: 'Employee ID is required.' });
  }

  if (!department || !department.trim()) {
    return res.status(400).json({ success: false, message: 'Department is required.' });
  }

  if (!designation || !designation.trim()) {
    return res.status(400).json({ success: false, message: 'Designation is required.' });
  }

  if (!joiningDate) {
    return res.status(400).json({ success: false, message: 'Joining date is required.' });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'A valid email is required.' });
  }

  if (!phone || !isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: 'A valid phone number is required.' });
  }

  next();
};

/**
 * Validate Salary Slip Entry
 */
const validateSalarySlip = (req, res, next) => {
  const {
    employeeId,
    month,
    year,
    basicSalary,
    hra,
    allowances,
    bonus,
    overtime,
    tax,
    pf,
    esi,
    otherDeductions
  } = req.body;

  if (!employeeId || !employeeId.trim()) {
    return res.status(400).json({ success: false, message: 'Employee ID is required.' });
  }

  const numMonth = Number(month);
  if (!numMonth || numMonth < 1 || numMonth > 12) {
    return res.status(400).json({ success: false, message: 'Month must be an integer between 1 and 12.' });
  }

  const numYear = Number(year);
  if (!numYear || numYear < 2000 || numYear > 2100) {
    return res.status(400).json({ success: false, message: 'Year must be a valid 4-digit year.' });
  }

  const numericFields = {
    basicSalary,
    hra,
    allowances,
    bonus,
    overtime,
    tax,
    pf,
    esi,
    otherDeductions
  };

  for (const [key, val] of Object.entries(numericFields)) {
    if (val !== undefined && val !== null && val !== '') {
      if (!isNonNegativeNumber(val)) {
        return res.status(400).json({
          success: false,
          message: `Field '${key}' must be a non-negative number.`
        });
      }
    }
  }

  if (Number(basicSalary || 0) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Basic salary must be greater than 0.'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateEmployee,
  validateSalarySlip
};
