const { SalarySlipRepo, EmployeeRepo, CompanyRepo } = require('../services/dataService');
const { calculateSalary } = require('../services/salaryService');
const { generateSalarySlipPDF } = require('../services/pdfService');
const { detectSalaryAnomalies } = require('../services/anomalyService');
const generateSlipNumber = require('../utils/generateSlipNumber');

/**
 * Create a new Salary Slip (Admin only)
 * POST /api/salary
 */
const createSalarySlip = async (req, res, next) => {
  try {
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
      otherDeductions,
      notes,
      status
    } = req.body;

    const cleanEmpId = employeeId.toUpperCase().trim();

    // Verify employee exists
    const employee = await EmployeeRepo.findByEmployeeId(cleanEmpId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID '${cleanEmpId}' does not exist.`
      });
    }

    // Check existing slip for period
    const existingSlip = await SalarySlipRepo.findByEmployeeMonthYear(cleanEmpId, month, year);
    if (existingSlip) {
      return res.status(400).json({
        success: false,
        message: `A salary slip for ${employee.fullName} for month ${month}/${year} already exists (${existingSlip.slipNumber}).`
      });
    }

    // Authoritative Calculation
    const calculated = calculateSalary({
      basicSalary,
      hra,
      allowances,
      bonus,
      overtime,
      tax,
      pf,
      esi,
      otherDeductions
    });

    const slipNumber = await generateSlipNumber(year, month);

    const slip = await SalarySlipRepo.create({
      slipNumber,
      employeeId: cleanEmpId,
      employee: employee._id,
      month: Number(month),
      year: Number(year),
      ...calculated,
      notes: notes ? notes.trim() : '',
      status: status || 'approved'
    });

    // Run AI/Rule Anomaly Detection
    const anomalies = await detectSalaryAnomalies(slip, employee);

    res.status(201).json({
      success: true,
      message: 'Salary slip created and calculated successfully.',
      data: slip,
      anomalies: anomalies.length > 0 ? anomalies : []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Salary Slip by ID or SlipNumber
 * GET /api/salary/:id (or /api/salary-slips/:id)
 */
const getSalarySlipById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slip = await SalarySlipRepo.findByIdOrSlipNumber(id);

    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found.'
      });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.employeeId !== slip.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to view this salary slip.'
      });
    }

    const company = await CompanyRepo.get();

    res.json({
      success: true,
      data: slip,
      company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download Salary Slip as PDF
 * GET /api/salary-slips/:id/pdf
 */
const getSalarySlipPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slip = await SalarySlipRepo.findByIdOrSlipNumber(id);

    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found.'
      });
    }

    // Ownership check
    if (req.user.role !== 'admin' && req.user.employeeId !== slip.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Access to this salary slip is forbidden.'
      });
    }

    let employee = slip.employee;
    if (!employee) {
      employee = await EmployeeRepo.findByEmployeeId(slip.employeeId);
    }

    const company = await CompanyRepo.get();

    const filename = `SalarySlip-${slip.slipNumber}-${employee?.fullName || 'Employee'}.pdf`.replace(/\s+/g, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    generateSalarySlipPDF(slip, company, employee || {}, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Salary History
 * GET /api/salary/history
 */
const getSalaryHistory = async (req, res, next) => {
  try {
    const { employeeId, month, year, search, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (req.user.role !== 'admin') {
      filter.employeeId = req.user.employeeId;
    } else if (employeeId && employeeId !== 'all') {
      filter.employeeId = employeeId.toUpperCase().trim();
    }

    if (month && month !== 'all') filter.month = Number(month);
    if (year && year !== 'all') filter.year = Number(year);
    if (search && search.trim()) filter.search = search.trim();

    const skip = (Number(page) - 1) * Number(limit);

    const [slips, total] = await Promise.all([
      SalarySlipRepo.find(filter, skip, Number(limit)),
      SalarySlipRepo.countDocuments(filter)
    ]);

    const allMatching = await SalarySlipRepo.find(filter, 0, 9999);
    const summary = allMatching.reduce(
      (acc, s) => {
        acc.totalGross += s.grossSalary || 0;
        acc.totalDeductions += s.totalDeductions || 0;
        acc.totalNet += s.netSalary || 0;
        return acc;
      },
      { totalGross: 0, totalDeductions: 0, totalNet: 0 }
    );

    res.json({
      success: true,
      data: slips,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      },
      summary: {
        totalGross: Math.round(summary.totalGross * 100) / 100,
        totalDeductions: Math.round(summary.totalDeductions * 100) / 100,
        totalNet: Math.round(summary.totalNet * 100) / 100,
        count: total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Salary Slip (Admin only)
 * PUT /api/salary/:id
 */
const updateSalarySlip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slip = await SalarySlipRepo.findByIdOrSlipNumber(id);
    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found.'
      });
    }

    const calculated = calculateSalary({
      basicSalary: req.body.basicSalary !== undefined ? req.body.basicSalary : slip.basicSalary,
      hra: req.body.hra !== undefined ? req.body.hra : slip.hra,
      allowances: req.body.allowances !== undefined ? req.body.allowances : slip.allowances,
      bonus: req.body.bonus !== undefined ? req.body.bonus : slip.bonus,
      overtime: req.body.overtime !== undefined ? req.body.overtime : slip.overtime,
      tax: req.body.tax !== undefined ? req.body.tax : slip.tax,
      pf: req.body.pf !== undefined ? req.body.pf : slip.pf,
      esi: req.body.esi !== undefined ? req.body.esi : slip.esi,
      otherDeductions: req.body.otherDeductions !== undefined ? req.body.otherDeductions : slip.otherDeductions
    });

    const updateData = { ...calculated };
    if (req.body.notes !== undefined) updateData.notes = req.body.notes.trim();
    if (req.body.status) updateData.status = req.body.status;

    Object.assign(slip, updateData);
    const employee = await EmployeeRepo.findByEmployeeId(slip.employeeId);
    const anomalies = await detectSalaryAnomalies(slip, employee || {});

    res.json({
      success: true,
      message: 'Salary slip updated and recalculated successfully.',
      data: slip,
      anomalies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Salary Slip (Admin only)
 * DELETE /api/salary/:id
 */
const deleteSalarySlip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slip = await SalarySlipRepo.delete(id);

    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found.'
      });
    }

    res.json({
      success: true,
      message: `Salary slip deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSalarySlip,
  getSalarySlipById,
  getSalarySlipPDF,
  getSalaryHistory,
  updateSalarySlip,
  deleteSalarySlip
};
