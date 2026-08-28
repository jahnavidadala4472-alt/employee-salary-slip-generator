/**
 * Salary Slip View, Print, PDF & AI Summary Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isSalarySlipPage = window.location.pathname.includes('salary-slip.html');
  if (!isSalarySlipPage) return;

  const user = initAuthGuard();
  if (!user) return;

  const urlParams = new URLSearchParams(window.location.search);
  const slipId = urlParams.get('id');

  if (!slipId) {
    showToast('No salary slip identifier provided.', 'error');
    setTimeout(() => {
      window.location.href = user.role === 'admin' ? '/admin-dashboard.html' : '/employee-dashboard.html';
    }, 1500);
    return;
  }

  loadSalarySlip(slipId, user);
});

/**
 * Load and render salary slip details
 */
const loadSalarySlip = async (slipId, user) => {
  try {
    const data = await apiRequest(`/salary-slips/${slipId}`);
    const slip = data.data;
    const company = data.company || {};
    const emp = slip.employee || {};

    // 1. Company Section
    document.getElementById('company-name-text').textContent = company.companyName || 'Nexus Global Technologies Inc.';
    document.getElementById('company-address-text').textContent = company.address || '742 Evergreen Terrace, San Francisco, CA';
    document.getElementById('company-contact-text').textContent = `Phone: ${company.phone || '+1 (415) 555-0199'} | Email: ${company.email || 'payroll@nexusglobal.io'}`;
    document.getElementById('company-tax-text').textContent = `Tax ID / EIN: ${company.taxIdentifier || 'TAX-EIN-88392019'} | Web: ${company.website || 'https://nexusglobal.io'}`;

    // 2. Slip Title & Period
    const monthYear = `${getMonthName(slip.month)} ${slip.year}`;
    document.getElementById('slip-period-text').textContent = monthYear.toUpperCase();
    document.getElementById('slip-number-badge').textContent = slip.slipNumber;

    // 3. Employee Metadata
    document.getElementById('slip-emp-id').textContent = slip.employeeId;
    document.getElementById('slip-emp-name').textContent = emp.fullName || slip.employeeId;
    document.getElementById('slip-emp-dept').textContent = emp.department || 'Operations';
    document.getElementById('slip-emp-desig').textContent = emp.designation || 'Specialist';
    document.getElementById('slip-emp-joining').textContent = formatDate(emp.joiningDate);
    document.getElementById('slip-emp-bank').textContent = emp.bankName || 'Direct Deposit';
    document.getElementById('slip-emp-acc').textContent = emp.accountLast4 ? `•••• ${emp.accountLast4}` : 'Verified on File';
    document.getElementById('slip-gen-date').textContent = formatDate(slip.createdAt);

    // 4. Earnings Breakdown
    document.getElementById('slip-basic').textContent = formatCurrency(slip.basicSalary);
    document.getElementById('slip-hra').textContent = formatCurrency(slip.hra);
    document.getElementById('slip-allowances').textContent = formatCurrency(slip.allowances);
    document.getElementById('slip-bonus').textContent = formatCurrency(slip.bonus);
    document.getElementById('slip-overtime').textContent = formatCurrency(slip.overtime);
    document.getElementById('slip-total-gross').textContent = formatCurrency(slip.grossSalary);

    // 5. Deductions Breakdown
    document.getElementById('slip-tax').textContent = formatCurrency(slip.tax);
    document.getElementById('slip-pf').textContent = formatCurrency(slip.pf);
    document.getElementById('slip-esi').textContent = formatCurrency(slip.esi);
    document.getElementById('slip-other-deductions').textContent = formatCurrency(slip.otherDeductions);
    document.getElementById('slip-total-deductions').textContent = formatCurrency(slip.totalDeductions);

    // 6. Net Pay & Words
    document.getElementById('slip-net-salary').textContent = formatCurrency(slip.netSalary);

    // Convert number to words client-side
    const words = numberToWordsConverter(slip.netSalary);
    document.getElementById('slip-amount-words').textContent = words;

    // Notes
    const notesContainer = document.getElementById('slip-notes-container');
    if (slip.notes && notesContainer) {
      notesContainer.style.display = 'block';
      document.getElementById('slip-notes-text').textContent = slip.notes;
    }

    // 7. Configure Action Buttons
    const printBtn = document.getElementById('print-slip-btn');
    printBtn?.addEventListener('click', () => window.print());

    const pdfBtn = document.getElementById('download-pdf-btn');
    if (pdfBtn) {
      pdfBtn.href = `/api/salary-slips/${slip._id}/pdf?token=${getToken()}`;
      pdfBtn.target = '_blank';
    }

    // AI Summary Trigger
    const aiSummaryBtn = document.getElementById('ai-summary-btn');
    const aiSummaryBox = document.getElementById('ai-summary-box');
    const aiSummaryContent = document.getElementById('ai-summary-content');

    if (aiSummaryBtn && aiSummaryBox) {
      aiSummaryBtn.addEventListener('click', async () => {
        try {
          aiSummaryBtn.disabled = true;
          aiSummaryBtn.textContent = 'Generating AI Summary...';
          aiSummaryBox.style.display = 'block';
          aiSummaryContent.innerHTML = '<em>Generating intelligent payroll breakdown...</em>';

          const res = await apiRequest('/ai/summary', {
            method: 'POST',
            body: JSON.stringify({ salarySlipId: slip._id })
          });

          // Render formatted markdown/html
          aiSummaryContent.innerHTML = formatMarkdownToHtml(res.summary);
          showToast('AI Salary Summary generated!', 'success');
        } catch (err) {
          aiSummaryContent.innerHTML = `<p style="color: var(--danger);">Failed to generate AI summary: ${err.message}</p>`;
        } finally {
          aiSummaryBtn.disabled = false;
          aiSummaryBtn.textContent = 'Regenerate AI Summary';
        }
      });
    }
  } catch (err) {
    showToast(`Error loading salary slip: ${err.message}`, 'error');
  }
};

/**
 * Format simple markdown bold and lists to HTML
 */
const formatMarkdownToHtml = (markdownText) => {
  if (!markdownText) return '';
  return markdownText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
};

/**
 * Helper to convert number to words for slip
 */
const numberToWordsConverter = (amount) => {
  if (!amount || isNaN(amount)) return 'Zero Dollars Only';
  const num = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - num) * 100);

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n) => {
    let str = '';
    if (n >= 10000000) { str += convert(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
    if (n >= 100000) { str += convert(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
    if (n >= 1000) { str += convert(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
    if (n >= 100) { str += convert(Math.floor(n / 100)) + ' Hundred '; n %= 100; }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else { str += b[Math.floor(n / 10)]; if (n % 10 > 0) str += ' ' + a[n % 10]; }
    }
    return str.trim();
  };

  let res = convert(num) + ' Dollars';
  if (cents > 0) res += ' and ' + convert(cents) + ' Cents';
  return res + ' Only';
};
