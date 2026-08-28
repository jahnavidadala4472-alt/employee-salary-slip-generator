const { EmployeeRepo, SalarySlipRepo, AnomalyRepo, AILogRepo } = require('../services/dataService');
const { getAIChatResponse, generateSalarySlipSummary } = require('../services/aiService');
const { detectSalaryAnomalies } = require('../services/anomalyService');
const env = require('../config/env');

/**
 * AI Chat Assistant
 * POST /api/ai/chat
 */
const chat = async (req, res, next) => {
  try {
    const { prompt, employeeId } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Prompt message cannot be empty.'
      });
    }

    let targetEmpId = req.user.role === 'admin' ? employeeId : req.user.employeeId;
    if (!targetEmpId && req.user.role === 'admin') {
      const activeEmps = await EmployeeRepo.find({ status: 'active' }, 0, 1);
      targetEmpId = activeEmps[0]?.employeeId || null;
    }

    let employee = null;
    let latestSlip = null;
    let previousSlip = null;

    if (targetEmpId) {
      employee = await EmployeeRepo.findByEmployeeId(targetEmpId);
      const slips = await SalarySlipRepo.find({ employeeId: targetEmpId }, 0, 2);
      latestSlip = slips[0] || null;
      previousSlip = slips[1] || null;
    }

    const aiResponse = await getAIChatResponse(prompt.trim(), {
      employee,
      latestSlip,
      previousSlip
    });

    await AILogRepo.create({
      userId: req.user._id,
      salarySlipId: latestSlip ? latestSlip._id : undefined,
      prompt: prompt.trim().substring(0, 500),
      response: aiResponse ? aiResponse.substring(0, 2000) : ''
    });

    res.json({
      success: true,
      response: aiResponse,
      isConfigured: !!env.AI_API_KEY
    });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Salary Slip Summary
 * POST /api/ai/summary
 */
const getSlipSummary = async (req, res, next) => {
  try {
    const { salarySlipId } = req.body;

    if (!salarySlipId) {
      return res.status(400).json({
        success: false,
        message: 'Salary slip identifier is required.'
      });
    }

    const slip = await SalarySlipRepo.findByIdOrSlipNumber(salarySlipId);
    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found.'
      });
    }

    if (req.user.role !== 'admin' && req.user.employeeId !== slip.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot access summaries for another employee.'
      });
    }

    const employee = await EmployeeRepo.findByEmployeeId(slip.employeeId);
    const slips = await SalarySlipRepo.find({ employeeId: slip.employeeId }, 0, 10);
    const previousSlip = slips.find(s =>
      String(s._id) !== String(slip._id) &&
      (s.year < slip.year || (s.year === slip.year && s.month < slip.month))
    );

    const summary = await generateSalarySlipSummary(slip, employee || {}, previousSlip);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger Anomaly Detection on a specific slip (Admin only)
 * POST /api/ai/anomaly
 */
const detectAnomaly = async (req, res, next) => {
  try {
    const { salarySlipId } = req.body;
    const slip = await SalarySlipRepo.findByIdOrSlipNumber(salarySlipId);

    if (!slip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found.'
      });
    }

    const employee = await EmployeeRepo.findByEmployeeId(slip.employeeId);
    const anomalies = await detectSalaryAnomalies(slip, employee || {});

    res.json({
      success: true,
      anomalies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI Anomalies List (Admin only)
 * GET /api/ai/anomalies
 */
const getAnomaliesList = async (req, res, next) => {
  try {
    const { status = 'all' } = req.query;

    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const anomalies = await AnomalyRepo.find(filter);

    const enriched = await Promise.all(
      anomalies.map(async (a) => {
        const emp = await EmployeeRepo.findByEmployeeId(a.employeeId);
        return {
          ...a,
          employee: emp ? { fullName: emp.fullName, department: emp.department, designation: emp.designation } : null
        };
      })
    );

    res.json({
      success: true,
      data: enriched,
      pendingCount: await AnomalyRepo.countDocuments({ status: 'pending' })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Review / Dismiss AI Anomaly (Admin only)
 * PUT /api/ai/anomalies/:id
 */
const reviewAnomaly = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await AnomalyRepo.updateStatus(id, status || 'reviewed', req.user._id);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Anomaly record not found.'
      });
    }

    res.json({
      success: true,
      message: `Anomaly marked as ${status || 'reviewed'}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chat,
  getSlipSummary,
  detectAnomaly,
  getAnomaliesList,
  reviewAnomaly
};
