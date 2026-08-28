const { SalarySlipRepo, AnomalyRepo } = require('./dataService');

/**
 * Anomaly Detection Service for Payroll
 */
const detectSalaryAnomalies = async (currentSlip, employee) => {
  const anomalies = [];

  // Fetch previous salary slips for this employee
  const slips = await SalarySlipRepo.find({ employeeId: currentSlip.employeeId }, 0, 10);
  const previousSlips = slips.filter(s => String(s._id) !== String(currentSlip._id));
  const prev = previousSlips[0]; // Most recent previous slip

  const basic = Number(currentSlip.basicSalary) || 0;
  const bonus = Number(currentSlip.bonus) || 0;
  const overtime = Number(currentSlip.overtime) || 0;
  const gross = Number(currentSlip.grossSalary) || 0;
  const deductions = Number(currentSlip.totalDeductions) || 0;
  const net = Number(currentSlip.netSalary) || 0;

  // Rule 1: High Bonus Check (> 50% of basic salary)
  if (bonus > 0 && basic > 0 && bonus >= basic * 0.5) {
    const bonusRatio = Math.round((bonus / basic) * 100);
    const severity = bonusRatio >= 100 ? 'high' : 'medium';
    anomalies.push({
      salarySlipId: currentSlip._id,
      employeeId: currentSlip.employeeId,
      severity,
      reason: `Unusually large bonus of $${bonus.toFixed(2)} (${bonusRatio}% of basic pay $${basic.toFixed(2)}).`,
      recommendation: `Verify with HR department if this special bonus has written approval from department leadership.`
    });
  }

  // Rule 2: Excessive Overtime Check (> 40% of basic salary)
  if (overtime > 0 && basic > 0 && overtime >= basic * 0.4) {
    const otRatio = Math.round((overtime / basic) * 100);
    anomalies.push({
      salarySlipId: currentSlip._id,
      employeeId: currentSlip.employeeId,
      severity: 'medium',
      reason: `High overtime payout of $${overtime.toFixed(2)} (${otRatio}% of basic pay).`,
      recommendation: `Check logged timesheets and overtime pre-approvals for month ${currentSlip.month}/${currentSlip.year}.`
    });
  }

  // Rule 3: Deductions exceed 50% of Gross Pay
  if (gross > 0 && deductions >= gross * 0.5) {
    anomalies.push({
      salarySlipId: currentSlip._id,
      employeeId: currentSlip.employeeId,
      severity: 'high',
      reason: `Total deductions ($${deductions.toFixed(2)}) exceed 50% of gross earnings ($${gross.toFixed(2)}).`,
      recommendation: `Inspect tax, loan, or penalty deductions to ensure take-home pay satisfies statutory minimums.`
    });
  }

  // Rule 4: Month-over-Month Net Salary Discrepancies (> 30% jump or drop)
  if (prev && prev.netSalary > 0) {
    const diff = net - prev.netSalary;
    const pctChange = Math.abs(diff) / prev.netSalary;

    if (pctChange >= 0.3) {
      const direction = diff > 0 ? 'increase' : 'drop';
      const pctFormatted = Math.round(pctChange * 100);
      const severity = pctFormatted >= 50 ? 'high' : 'medium';

      anomalies.push({
        salarySlipId: currentSlip._id,
        employeeId: currentSlip.employeeId,
        severity,
        reason: `Significant ${pctFormatted}% ${direction} in net pay compared to previous month ($${Number(prev.netSalary).toFixed(2)} -> $${net.toFixed(2)}).`,
        recommendation: `Review line items between ${prev.month}/${prev.year} and ${currentSlip.month}/${currentSlip.year} to confirm calculation accuracy.`
      });
    }

    // Rule 5: Basic Salary unexpected change
    if (prev.basicSalary && Math.abs(basic - prev.basicSalary) > 10) {
      anomalies.push({
        salarySlipId: currentSlip._id,
        employeeId: currentSlip.employeeId,
        severity: 'medium',
        reason: `Basic salary shifted from $${Number(prev.basicSalary).toFixed(2)} to $${basic.toFixed(2)}.`,
        recommendation: `Verify if employee '${employee.fullName || currentSlip.employeeId}' received an official promotion or salary revision.`
      });
    }
  }

  // Save anomalies
  for (const a of anomalies) {
    await AnomalyRepo.create(a);
  }

  return anomalies;
};

module.exports = {
  detectSalaryAnomalies
};
