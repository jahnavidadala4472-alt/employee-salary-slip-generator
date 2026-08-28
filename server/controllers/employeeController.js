const bcrypt = require('bcryptjs');
const { EmployeeRepo, UserRepo } = require('../services/dataService');

/**
 * Get all employees with search and filters (Admin only)
 * GET /api/employees
 */
const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department, designation, status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (department && department !== 'all') filter.department = department;
    if (designation && designation !== 'all') filter.designation = designation;
    if (search && search.trim()) filter.search = search.trim();

    const skip = (Number(page) - 1) * Number(limit);

    const [employees, total, departments, designations] = await Promise.all([
      EmployeeRepo.find(filter, skip, Number(limit)),
      EmployeeRepo.countDocuments(filter),
      EmployeeRepo.distinct('department'),
      EmployeeRepo.distinct('designation')
    ]);

    res.json({
      success: true,
      data: employees,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      },
      filters: {
        departments,
        designations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee by ID (Admin or the employee themselves)
 * GET /api/employees/:id
 */
const getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeRepo.findByIdOrEmpId(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with identifier '${id}'.`
      });
    }

    if (req.user.role !== 'admin' && req.user.employeeId !== employee.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not allowed to view another employee profile.'
      });
    }

    res.json({
      success: true,
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create Employee & linked User login (Admin only)
 * POST /api/employees
 */
const createEmployee = async (req, res, next) => {
  try {
    const {
      fullName,
      employeeId,
      department,
      designation,
      joiningDate,
      phone,
      email,
      address,
      bankName,
      accountLast4,
      password
    } = req.body;

    const cleanEmpId = employeeId.toUpperCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    const empExists = await EmployeeRepo.findByEmployeeId(cleanEmpId);
    if (empExists) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${cleanEmpId}' is already in use.`
      });
    }

    const emailExists = await EmployeeRepo.findByEmail(cleanEmail);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: `Email '${cleanEmail}' is already registered.`
      });
    }

    const employee = await EmployeeRepo.create({
      fullName: fullName.trim(),
      employeeId: cleanEmpId,
      department: department.trim(),
      designation: designation.trim(),
      joiningDate: new Date(joiningDate),
      phone: phone.trim(),
      email: cleanEmail,
      address: address ? address.trim() : '',
      bankName: bankName ? bankName.trim() : '',
      accountLast4: accountLast4 ? accountLast4.trim() : '',
      status: 'active'
    });

    const defaultPassword = password || 'Employee@12345';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    await UserRepo.create({
      employeeId: cleanEmpId,
      email: cleanEmail,
      passwordHash,
      role: 'employee',
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully with login credentials.',
      data: employee
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Employee (Admin only)
 * PUT /api/employees/:id
 */
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const updated = await EmployeeRepo.update(id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    if (updateData.status) {
      await UserRepo.updateOne({ employeeId: updated.employeeId }, { status: updateData.status });
    }

    res.json({
      success: true,
      message: 'Employee details updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Employee Status (Admin only)
 * DELETE /api/employees/:id
 */
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await EmployeeRepo.findByIdOrEmpId(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found.'
      });
    }

    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    const updated = await EmployeeRepo.update(id, { status: newStatus });
    await UserRepo.updateOne({ employeeId: employee.employeeId }, { status: newStatus });

    res.json({
      success: true,
      message: `Employee status changed to ${newStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
