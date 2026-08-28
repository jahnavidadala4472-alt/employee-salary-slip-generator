const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { getMonthName, numberToWords } = require('./salaryService');

/**
 * Generate PDF Salary Slip stream / buffer
 * @param {Object} slip SalarySlip document (populated with employee)
 * @param {Object} company Company document
 * @param {Object} employee Employee document
 * @returns {PDFDocument} pdf stream
 */
const generateSalarySlipPDF = (slip, company, employee, res) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    info: {
      Title: `Salary Slip - ${slip.slipNumber} - ${employee.fullName}`,
      Author: company.companyName || 'Payroll System',
      Subject: `Pay Slip for ${getMonthName(slip.month)} ${slip.year}`
    }
  });

  // Pipe to response
  doc.pipe(res);

  const primaryColor = '#1e3a8a';   // Navy / Indigo
  const accentColor = '#6366f1';    // Purple
  const darkTextColor = '#1e293b';  // Slate 800
  const lightTextColor = '#64748b'; // Slate 500
  const borderColor = '#cbd5e1';    // Slate 300
  const lightBgColor = '#f8fafc';   // Slate 50
  const tableHeaderBg = '#f1f5f9';  // Slate 100

  // 1. Header with Company Branding & Accent Stripe
  doc.rect(40, 40, 515, 6).fill(primaryColor);

  let currentY = 55;

  // Company Name & Details
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(company.companyName || 'NEXUS ENTERPRISES INC.', 40, currentY);

  doc
    .fillColor(lightTextColor)
    .font('Helvetica')
    .fontSize(8.5)
    .text(company.address || '100 Innovation Blvd, Tech Suite 400', 40, currentY + 22)
    .text(`Phone: ${company.phone || '+1 (555) 019-2834'} | Email: ${company.email || 'payroll@nexus.com'}`, 40, currentY + 33)
    .text(`Tax ID: ${company.taxIdentifier || 'TAX-EIN-9842103'} | Web: ${company.website || 'www.nexus.com'}`, 40, currentY + 44);

  // Right-aligned Salary Slip Title Badge
  doc
    .rect(385, currentY, 170, 46)
    .fillAndStroke(lightBgColor, borderColor);

  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(12)
    .text('PAYSLIP / SALARY SLIP', 390, currentY + 8, { width: 160, align: 'center' });

  doc
    .fillColor(accentColor)
    .font('Helvetica-Bold')
    .fontSize(9)
    .text(`${getMonthName(slip.month).toUpperCase()} ${slip.year}`, 390, currentY + 24, { width: 160, align: 'center' });

  // Divider Line
  currentY = 115;
  doc.moveTo(40, currentY).lineTo(555, currentY).strokeColor(borderColor).stroke();

  // 2. Metadata Grid (Employee Info & Slip Details)
  currentY = 125;
  const colW = 252;
  const boxH = 95;

  // Left Card: Employee Details
  doc.rect(40, currentY, colW, boxH).fillAndStroke(lightBgColor, borderColor);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text('EMPLOYEE DETAILS', 50, currentY + 8);
  
  const empLabelsY = currentY + 24;
  doc.font('Helvetica').fontSize(8).fillColor(lightTextColor);
  doc.text('Employee ID:', 50, empLabelsY);
  doc.text('Full Name:', 50, empLabelsY + 13);
  doc.text('Department:', 50, empLabelsY + 26);
  doc.text('Designation:', 50, empLabelsY + 39);
  doc.text('Joining Date:', 50, empLabelsY + 52);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(darkTextColor);
  doc.text(employee.employeeId, 120, empLabelsY);
  doc.text(employee.fullName, 120, empLabelsY + 13);
  doc.text(employee.department, 120, empLabelsY + 26);
  doc.text(employee.designation, 120, empLabelsY + 39);
  const joiningDateFormatted = employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
  doc.text(joiningDateFormatted, 120, empLabelsY + 52);

  // Right Card: Payment & Slip Details
  doc.rect(302, currentY, colW, boxH).fillAndStroke(lightBgColor, borderColor);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text('PAYMENT & SLIP METADATA', 312, currentY + 8);

  doc.font('Helvetica').fontSize(8).fillColor(lightTextColor);
  doc.text('Slip Number:', 312, empLabelsY);
  doc.text('Pay Period:', 312, empLabelsY + 13);
  doc.text('Bank Name:', 312, empLabelsY + 26);
  doc.text('Account (Last 4):', 312, empLabelsY + 39);
  doc.text('Generated On:', 312, empLabelsY + 52);

  doc.font('Helvetica-Bold').fontSize(8).fillColor(darkTextColor);
  doc.text(slip.slipNumber, 395, empLabelsY);
  doc.text(`${getMonthName(slip.month)} ${slip.year}`, 395, empLabelsY + 13);
  doc.text(employee.bankName || 'Direct Deposit', 395, empLabelsY + 26);
  doc.text(employee.accountLast4 ? `•••• ${employee.accountLast4}` : 'Verified on File', 395, empLabelsY + 39);
  const genDate = slip.createdAt ? new Date(slip.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString();
  doc.text(genDate, 395, empLabelsY + 52);

  // 3. Earnings & Deductions Tables (Side by Side)
  currentY = 230;
  const tableW = 252;
  const rowH = 18;

  // Table Headers
  // Left: Earnings Header
  doc.rect(40, currentY, tableW, 22).fillAndStroke(tableHeaderBg, borderColor);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
  doc.text('EARNINGS', 50, currentY + 6);
  doc.text('AMOUNT ($)', 220, currentY + 6, { width: 62, align: 'right' });

  // Right: Deductions Header
  doc.rect(302, currentY, tableW, 22).fillAndStroke(tableHeaderBg, borderColor);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
  doc.text('DEDUCTIONS', 312, currentY + 6);
  doc.text('AMOUNT ($)', 482, currentY + 6, { width: 62, align: 'right' });

  const earningsList = [
    { label: 'Basic Salary', amount: slip.basicSalary },
    { label: 'House Rent Allowance (HRA)', amount: slip.hra },
    { label: 'Special / Other Allowances', amount: slip.allowances },
    { label: 'Performance Bonus', amount: slip.bonus },
    { label: 'Overtime Pay', amount: slip.overtime }
  ];

  const deductionsList = [
    { label: 'Income Tax (TDS)', amount: slip.tax },
    { label: 'Provident Fund (PF)', amount: slip.pf },
    { label: 'Employee State Insurance (ESI)', amount: slip.esi },
    { label: 'Other / Misc Deductions', amount: slip.otherDeductions },
    { label: '—', amount: 0 } // placeholder to align rows
  ];

  let tableRowY = currentY + 22;

  for (let i = 0; i < 5; i++) {
    const bg = i % 2 === 0 ? '#ffffff' : lightBgColor;
    
    // Earnings Row
    doc.rect(40, tableRowY, tableW, rowH).fillAndStroke(bg, borderColor);
    doc.font('Helvetica').fontSize(8.5).fillColor(darkTextColor);
    doc.text(earningsList[i].label, 50, tableRowY + 5);
    doc.font('Helvetica-Bold').text(Number(earningsList[i].amount || 0).toFixed(2), 220, tableRowY + 5, { width: 62, align: 'right' });

    // Deductions Row
    doc.rect(302, tableRowY, tableW, rowH).fillAndStroke(bg, borderColor);
    if (deductionsList[i].label !== '—') {
      doc.font('Helvetica').fontSize(8.5).fillColor(darkTextColor);
      doc.text(deductionsList[i].label, 312, tableRowY + 5);
      doc.font('Helvetica-Bold').text(Number(deductionsList[i].amount || 0).toFixed(2), 482, tableRowY + 5, { width: 62, align: 'right' });
    }

    tableRowY += rowH;
  }

  // Section Totals Row
  doc.rect(40, tableRowY, tableW, 22).fillAndStroke(tableHeaderBg, borderColor);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
  doc.text('TOTAL GROSS EARNINGS', 50, tableRowY + 6);
  doc.text(`$${Number(slip.grossSalary || 0).toFixed(2)}`, 200, tableRowY + 6, { width: 82, align: 'right' });

  doc.rect(302, tableRowY, tableW, 22).fillAndStroke(tableHeaderBg, borderColor);
  doc.fillColor('#dc2626').font('Helvetica-Bold').fontSize(9);
  doc.text('TOTAL DEDUCTIONS', 312, tableRowY + 6);
  doc.text(`$${Number(slip.totalDeductions || 0).toFixed(2)}`, 462, tableRowY + 6, { width: 82, align: 'right' });

  // 4. Net Salary Highlight Banner
  currentY = tableRowY + 34;

  doc
    .rect(40, currentY, 515, 50)
    .fillAndStroke('#eff6ff', '#3b82f6'); // Light blue box with blue border

  doc
    .fillColor('#1e40af')
    .font('Helvetica-Bold')
    .fontSize(11)
    .text('NET SALARY PAYABLE', 55, currentY + 11);

  doc
    .fillColor(lightTextColor)
    .font('Helvetica')
    .fontSize(8)
    .text('Gross Earnings minus Total Statutory & Voluntary Deductions', 55, currentY + 26);

  doc
    .fillColor('#1e3a8a')
    .font('Helvetica-Bold')
    .fontSize(18)
    .text(`$${Number(slip.netSalary || 0).toFixed(2)}`, 350, currentY + 15, { width: 190, align: 'right' });

  // Amount in words box
  currentY += 58;
  doc
    .rect(40, currentY, 515, 26)
    .fillAndStroke(lightBgColor, borderColor);

  doc
    .fillColor(darkTextColor)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('Amount in Words:', 50, currentY + 8);

  const amountInWords = numberToWords(slip.netSalary);
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .text(amountInWords, 135, currentY + 8);

  // 5. Notes / Remarks (if any)
  if (slip.notes) {
    currentY += 34;
    doc
      .rect(40, currentY, 515, 28)
      .fillAndStroke('#fefce8', '#facc15'); // Light yellow warning/note box
    
    doc
      .fillColor('#854d0e')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('Payroll Notes: ', 50, currentY + 9);

    doc
      .font('Helvetica')
      .fontSize(8)
      .text(slip.notes, 120, currentY + 9);
    
    currentY += 10;
  }

  // 6. Signatures Section & Disclaimer
  currentY += 45;
  const sigW = 210;

  // Employer signature line
  doc.moveTo(50, currentY + 45).lineTo(50 + sigW, currentY + 45).strokeColor(borderColor).stroke();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(darkTextColor).text('Employer / Authorized Signatory', 50, currentY + 50);
  doc.font('Helvetica').fontSize(7.5).fillColor(lightTextColor).text('Payroll Dept. / HR Operations', 50, currentY + 62);

  // Employee signature line
  doc.moveTo(335, currentY + 45).lineTo(335 + sigW, currentY + 45).strokeColor(borderColor).stroke();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(darkTextColor).text('Employee Signature', 335, currentY + 50);
  doc.font('Helvetica').fontSize(7.5).fillColor(lightTextColor).text('Acknowledged & Received', 335, currentY + 62);

  // Footer Disclaimer & Page stamp
  doc
    .font('Helvetica')
    .fontSize(7.5)
    .fillColor(lightTextColor)
    .text(
      'This is a computer-generated salary slip and does not require a physical seal if digitally authenticated. Generated via AI Payroll Assistant.',
      40,
      760,
      { width: 515, align: 'center' }
    );

  doc.end();
};

module.exports = {
  generateSalarySlipPDF
};
