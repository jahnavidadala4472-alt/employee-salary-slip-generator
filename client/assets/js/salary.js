/**
 * Salary Entry & Salary History JavaScript
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isSalaryEntryPage = window.location.pathname.includes('salary-entry.html');
  const isSalaryHistoryPage = window.location.pathname.includes('salary-history.html');

  if (!isSalaryEntryPage && !isSalaryHistoryPage) return;

  const user = initAuthGuard(isSalaryEntryPage ? 'admin' : null);
  if (!user) return;

  if (isSalaryEntryPage) {
    initSalaryEntryPage();
  } else if (isSalaryHistoryPage) {
    initSalaryHistoryPage(user);
  }
});

/**
 * Initialize Salary Entry Page with Live Calculation & Employee Pre-selection
 */
const initSalaryEntryPage = async () => {
  const empSelect = document.getElementById('employeeId');
  const monthSelect = document.getElementById('month');
  const yearInput = document.getElementById('year');
  const form = document.getElementById('salary-form');

  // Input Fields for Live Calculation
  const basicInput = document.getElementById('basicSalary');
  const hraInput = document.getElementById('hra');
  const allowancesInput = document.getElementById('allowances');
  const bonusInput = document.getElementById('bonus');
  const overtimeInput = document.getElementById('overtime');

  const taxInput = document.getElementById('tax');
  const pfInput = document.getElementById('pf');
  const esiInput = document.getElementById('esi');
  const otherDeductionsInput = document.getElementById('otherDeductions');

  // Preview Display Elements
  const liveGrossEl = document.getElementById('live-gross-salary');
  const liveDeductionsEl = document.getElementById('live-total-deductions');
  const liveNetEl = document.getElementById('live-net-salary');

  // Set current month & year as defaults
  const now = new Date();
  if (monthSelect) monthSelect.value = now.getMonth() + 1;
  if (yearInput) yearInput.value = now.getFullYear();

  // 1. Fetch & Populate Employee Dropdown
  try {
    const empData = await apiRequest('/employees?status=active');
    if (empSelect && empData.data) {
      empSelect.innerHTML = '<option value="">-- Select Active Employee --</option>' +
        empData.data.map(e => `<option value="${e.employeeId}">${e.fullName} (${e.employeeId} - ${e.department})</option>`).join('');

      // Check URL query param for pre-selection
      const urlParams = new URLSearchParams(window.location.search);
      const preSelectedEmpId = urlParams.get('employeeId');
      if (preSelectedEmpId) {
        empSelect.value = preSelectedEmpId.toUpperCase();
      }
    }
  } catch (err) {
    showToast('Failed to load employee directory.', 'error');
  }

  // 2. Real-time Calculation Function
  const updateLiveCalculation = () => {
    const basic = parseFloat(basicInput?.value) || 0;
    const hra = parseFloat(hraInput?.value) || 0;
    const allowances = parseFloat(allowancesInput?.value) || 0;
    const bonus = parseFloat(bonusInput?.value) || 0;
    const overtime = parseFloat(overtimeInput?.value) || 0;

    const tax = parseFloat(taxInput?.value) || 0;
    const pf = parseFloat(pfInput?.value) || 0;
    const esi = parseFloat(esiInput?.value) || 0;
    const otherDeductions = parseFloat(otherDeductionsInput?.value) || 0;

    const gross = basic + hra + allowances + bonus + overtime;
    const deductions = tax + pf + esi + otherDeductions;
    const net = gross - deductions;

    if (liveGrossEl) liveGrossEl.textContent = formatCurrency(gross);
    if (liveDeductionsEl) liveDeductionsEl.textContent = formatCurrency(deductions);
    if (liveNetEl) {
      liveNetEl.textContent = formatCurrency(net);
      liveNetEl.style.color = net < 0 ? 'var(--danger)' : 'var(--primary)';
    }
  };

  // Attach live calculation event listeners to all numeric inputs
  const allCalcInputs = [
    basicInput, hraInput, allowancesInput, bonusInput, overtimeInput,
    taxInput, pfInput, esiInput, otherDeductionsInput
  ];

  allCalcInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', updateLiveCalculation);
    }
  });

  // Run initial calculation
  updateLiveCalculation();

  // 3. Form Submission
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const employeeId = empSelect.value;
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearInput.value);
    const notes = document.getElementById('notes')?.value.trim() || '';

    if (!employeeId) {
      showToast('Please select an employee.', 'error');
      return;
    }

    const payload = {
      employeeId,
      month,
      year,
      basicSalary: parseFloat(basicInput.value) || 0,
      hra: parseFloat(hraInput.value) || 0,
      allowances: parseFloat(allowancesInput.value) || 0,
      bonus: parseFloat(bonusInput.value) || 0,
      overtime: parseFloat(overtimeInput.value) || 0,
      tax: parseFloat(taxInput.value) || 0,
      pf: parseFloat(pfInput.value) || 0,
      esi: parseFloat(esiInput.value) || 0,
      otherDeductions: parseFloat(otherDeductionsInput.value) || 0,
      notes
    };

    const submitBtn = form.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Generating Slip...';

      const res = await apiRequest('/salary', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.anomalies && res.anomalies.length > 0) {
        showToast(`Slip created! ⚠️ ${res.anomalies.length} AI anomaly alert(s) flagged for review.`, 'warning');
      } else {
        showToast('Salary slip calculated and generated successfully!', 'success');
      }

      setTimeout(() => {
        window.location.href = `/salary-slip.html?id=${res.data._id}`;
      }, 800);
    } catch (err) {
      showToast(err.message || 'Failed to create salary slip.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Generate Salary Slip';
    }
  });
};

/**
 * Initialize Salary History Page
 */
const initSalaryHistoryPage = async (user) => {
  const empFilter = document.getElementById('history-emp-filter');
  const monthFilter = document.getElementById('history-month-filter');
  const yearFilter = document.getElementById('history-year-filter');
  const searchInput = document.getElementById('history-search');
  const tableBody = document.getElementById('history-tbody');

  // Summary widgets
  const totalGrossEl = document.getElementById('history-total-gross');
  const totalDeductionsEl = document.getElementById('history-total-deductions');
  const totalNetEl = document.getElementById('history-total-net');
  const slipCountEl = document.getElementById('history-slip-count');

  // If Admin, populate employee filter dropdown
  if (user.role === 'admin' && empFilter) {
    try {
      const empData = await apiRequest('/employees');
      if (empData.data) {
        empData.data.forEach(e => {
          const opt = document.createElement('option');
          opt.value = e.employeeId;
          opt.textContent = `${e.fullName} (${e.employeeId})`;
          empFilter.appendChild(opt);
        });
      }

      // Check if employeeId is in URL
      const urlParams = new URLSearchParams(window.location.search);
      const paramEmp = urlParams.get('employeeId');
      if (paramEmp) empFilter.value = paramEmp.toUpperCase();
    } catch (e) {}
  } else if (empFilter) {
    // Hide employee dropdown for employee role
    empFilter.closest('.form-group')?.style.setProperty('display', 'none');
  }

  let debounceTimer;

  const loadHistory = async () => {
    try {
      const emp = empFilter?.value || 'all';
      const month = monthFilter?.value || 'all';
      const year = yearFilter?.value || 'all';
      const search = searchInput?.value || '';

      const queryParams = new URLSearchParams({
        employeeId: emp,
        month,
        year,
        search
      });

      const data = await apiRequest(`/salary/history?${queryParams.toString()}`);

      // Update summaries
      if (totalGrossEl) totalGrossEl.textContent = formatCurrency(data.summary?.totalGross || 0);
      if (totalDeductionsEl) totalDeductionsEl.textContent = formatCurrency(data.summary?.totalDeductions || 0);
      if (totalNetEl) totalNetEl.textContent = formatCurrency(data.summary?.totalNet || 0);
      if (slipCountEl) slipCountEl.textContent = `${data.summary?.count || 0} Slips`;

      if (!data.data || data.data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No salary records found matching filters.</td></tr>`;
        return;
      }

      tableBody.innerHTML = data.data.map(slip => {
        const empName = slip.employee?.fullName || slip.employeeId;
        const monthYear = `${getMonthName(slip.month)} ${slip.year}`;
        return `
          <tr>
            <td><strong style="color: var(--primary); font-family: var(--font-mono);">${slip.slipNumber}</strong></td>
            <td>
              <div style="font-weight: 600;">${empName}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${slip.employeeId}</div>
            </td>
            <td>${monthYear}</td>
            <td style="font-weight: 600;">${formatCurrency(slip.grossSalary)}</td>
            <td style="color: var(--danger);">${formatCurrency(slip.totalDeductions)}</td>
            <td style="font-weight: 700; color: var(--primary);">${formatCurrency(slip.netSalary)}</td>
            <td>
              <span class="badge ${slip.status === 'approved' ? 'badge-success' : 'badge-warning'}">
                ${slip.status.toUpperCase()}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 0.35rem;">
                <a href="/salary-slip.html?id=${slip._id}" class="btn btn-sm btn-secondary" title="View Slip">View</a>
                <a href="/api/salary-slips/${slip._id}/pdf" target="_blank" class="btn btn-sm btn-outline-primary" title="Download PDF">PDF</a>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      showToast(`Error loading salary history: ${err.message}`, 'error');
    }
  };

  // Event Listeners
  empFilter?.addEventListener('change', loadHistory);
  monthFilter?.addEventListener('change', loadHistory);
  yearFilter?.addEventListener('change', loadHistory);
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadHistory, 300);
  });

  loadHistory();
};
