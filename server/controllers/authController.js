const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const { UserRepo, EmployeeRepo } = require('../services/dataService');

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Register User (Employee or initial Admin)
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone, employeeId, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const cleanEmpId = (employeeId || `EMP${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase().trim();

    // Check existing email
    const existingUser = await UserRepo.findByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Check existing employee ID
    const existingEmp = await EmployeeRepo.findByEmployeeId(cleanEmpId);
    if (existingEmp) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${cleanEmpId}' is already registered.`
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create Employee record
    const employee = await EmployeeRepo.create({
      employeeId: cleanEmpId,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : '+1 (555) 000-0000',
      department: req.body.department || 'General Operations',
      designation: req.body.designation || 'Staff Associate',
      joiningDate: req.body.joiningDate || new Date(),
      status: 'active'
    });

    // Create User record
    const userRole = role === 'admin' ? 'admin' : 'employee';
    const user = await UserRepo.create({
      employeeId: cleanEmpId,
      email: normalizedEmail,
      passwordHash,
      role: userRole,
      status: 'active'
    });

    const token = signToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        fullName: employee.fullName,
        department: employee.department,
        designation: employee.designation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserRepo.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your HR administrator.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Fetch employee details if linked
    let employee = null;
    if (user.employeeId) {
      employee = await EmployeeRepo.findByEmployeeId(user.employeeId);
    }

    const token = signToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        employeeId: user.employeeId || '',
        email: user.email,
        role: user.role,
        fullName: employee ? employee.fullName : (user.role === 'admin' ? 'System Administrator' : 'Staff User'),
        department: employee ? employee.department : 'Administration',
        designation: employee ? employee.designation : 'Administrator'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout User
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await UserRepo.findById(req.user._id);
    let employee = null;
    if (user && user.employeeId) {
      employee = await EmployeeRepo.findByEmployeeId(user.employeeId);
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        employeeId: user.employeeId,
        email: user.email,
        role: user.role,
        fullName: employee ? employee.fullName : (user.role === 'admin' ? 'Administrator' : 'User'),
        department: employee ? employee.department : 'N/A',
        designation: employee ? employee.designation : 'N/A',
        phone: employee ? employee.phone : '',
        employee
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
