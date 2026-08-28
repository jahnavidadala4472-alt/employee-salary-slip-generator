/**
 * Dashboard JavaScript - Admin & Employee Overview Screens
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Check if we are on admin or employee dashboard
  const isAdminDashboard = window.location.pathname.includes('admin-dashboard');
  const isEmployeeDashboard = window.location.pathname.includes('employee-dashboard');

  if (!isAdminDashboard && !isEmployeeDashboard) return;

  const requiredRole = isAdminDashboard ? 'admin' : 'employee';
  const user = initAuthGuard(requiredRole);
  if (!user) return;

  if (isAdminDashboard) {
    loadAdminDashboard();
  } else if (isEmployeeDashboard) {
    loadEmployeeDashboard(user);
  }
});

/**
 * Load Admin Dashboard Metrics, Recent Slips & AI Anomalies
 */
const loadAdminDashboard = async () => {
  try {
    // 1. Fetch Employees
    const empData = await apiRequest('/employees');
    const totalEmployees = empData.pagination?.total || empData.data?.length || 0;
    const activeEmployees = (empData.data || []).filter(e => e.status === 'active').length;

    document.getElementById('stat-total-emp').textContent = totalEmployees;
    document.getElementById('stat-active-emp').textContent = activeEmployees;

    // 2. Fetch Salary History & Totals
    const salaryData = await apiRequest('/salary/history?limit=10');
    const summary = salaryData.summary || { totalGross: 0, totalDeductions: 0, totalNet: 0 };

    document.getElementById('stat-gross-salary').textContent = formatCurrency(summary.totalGross);
    document.getElementById('stat-total-deductions').textContent = formatCurrency(summary.totalDeductions);
    document.getElementById('stat-net-salary').textContent = formatCurrency(summary.totalNet);
    document.getElementById('stat-payroll-count').textContent = `${salaryData.data?.length || 0} Slips`;

    // 3. Render Recent Salary Slips Table
    const slipsTableBody = document.getElementById('recent-slips-tbody');
    if (slipsTableBody) {
      if (!salaryData.data || salaryData.data.length === 0) {
        slipsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">No salary slips created yet.</td></tr>`;
      } else {
        slipsTableBody.innerHTML = salaryData.data.slice(0, 5).map(slip => {
          const empName = slip.employee?.fullName || slip.employeeId;
          const monthYear = `${getMonthName(slip.month)} ${slip.year}`;
          return `
            <tr>
              <td><strong>${slip.slipNumber}</strong></td>
              <td>
                <div style="font-weight: 600;">${empName}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${slip.employeeId}</div>
              </td>
              <td>${monthYear}</td>
              <td style="font-weight: 600;">${formatCurrency(slip.grossSalary)}</td>
              <td style="color: var(--danger);">${formatCurrency(slip.totalDeductions)}</td>
              <td style="font-weight: 700; color: var(--primary);">${formatCurrency(slip.netSalary)}</td>
              <td>
                <a href="/salary-slip.html?id=${slip._id}" class="btn btn-sm btn-secondary" title="View Slip">View</a>
                <a href="/api/salary-slips/${slip._id}/pdf" target="_blank" class="btn btn-sm btn-outline-primary" title="Download PDF">PDF</a>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 4. Render Recent Employees
    const empTableBody = document.getElementById('recent-emp-tbody');
    if (empTableBody && empData.data) {
      empTableBody.innerHTML = empData.data.slice(0, 5).map(emp => `
        <tr>
          <td><strong>${emp.employeeId}</strong></td>
          <td>
            <div style="font-weight: 600;">${emp.fullName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.email}</div>
          </td>
          <td>${emp.department}</td>
          <td>${emp.designation}</td>
          <td><span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}">${emp.status.toUpperCase()}</span></td>
          <td>
            <a href="/employee-form.html?id=${emp._id}" class="btn btn-sm btn-secondary">Edit</a>
          </td>
        </tr>
      `).join('');
    }

    // 5. Fetch AI Anomalies
    const anomalyData = await apiRequest('/ai/anomalies?status=pending');
    const anomalyContainer = document.getElementById('anomaly-alerts-list');
    const anomalyBadge = document.getElementById('anomaly-count-badge');

    if (anomalyBadge) {
      anomalyBadge.textContent = `${anomalyData.pendingCount || 0} Alerts`;
      anomalyBadge.className = `badge ${anomalyData.pendingCount > 0 ? 'badge-danger' : 'badge-success'}`;
    }

    if (anomalyContainer) {
      if (!anomalyData.data || anomalyData.data.length === 0) {
        anomalyContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <span style="font-size: 2rem;">✨</span>
            <p style="margin-top: 0.5rem; font-weight: 500;">No salary anomalies detected. All payroll records match expected historical variance.</p>
          </div>
        `;
      } else {
        anomalyContainer.innerHTML = anomalyData.data.map(a => {
          const sevClass = a.severity === 'high' ? 'badge-danger' : (a.severity === 'medium' ? 'badge-warning' : 'badge-primary');
          return `
            <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${a.severity === 'high' ? 'var(--danger)' : 'var(--warning)'}; background: #ffffff;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div>
                  <span class="badge ${sevClass}" style="text-transform: uppercase;">${a.severity} Severity</span>
                  <strong style="margin-left: 0.5rem; color: var(--text-main);">${a.employee?.fullName || a.employeeId} (${a.employeeId})</strong>
                </div>
                <button onclick="dismissAnomaly('${a._id}')" class="btn btn-sm btn-secondary">Mark Reviewed</button>
              </div>
              <p style="font-size: 0.88rem; color: var(--text-main); margin-bottom: 0.35rem;">
                <strong>Reason:</strong> ${a.reason}
              </p>
              <p style="font-size: 0.82rem; color: var(--text-muted);">
                <strong>Recommendation:</strong> ${a.recommendation}
              </p>
            </div>
          `;
        }).join('');
      }
    }
  } catch (error) {
    showToast(`Error loading dashboard: ${error.message}`, 'error');
  }
};

/**
 * Load Employee Dashboard
 */
const loadEmployeeDashboard = async (user) => {
  try {
    // 1. Fetch employee profile & salary history
    const historyData = await apiRequest('/salary/history');
    const slips = historyData.data || [];
    const latestSlip = slips[0] || null;

    // Populate profile cards
    document.getElementById('emp-name-title').textContent = user.fullName || 'Employee';
    document.getElementById('emp-id-badge').textContent = user.employeeId || 'EMP';
    document.getElementById('emp-dept-text').textContent = `${user.department || 'Operations'} • ${user.designation || 'Specialist'}`;

    if (latestSlip) {
      document.getElementById('emp-latest-period').textContent = `${getMonthName(latestSlip.month)} ${latestSlip.year}`;
      document.getElementById('emp-gross-val').textContent = formatCurrency(latestSlip.grossSalary);
      document.getElementById('emp-deductions-val').textContent = formatCurrency(latestSlip.totalDeductions);
      document.getElementById('emp-net-val').textContent = formatCurrency(latestSlip.netSalary);
      
      const viewBtn = document.getElementById('emp-view-latest-btn');
      const pdfBtn = document.getElementById('emp-pdf-latest-btn');
      if (viewBtn) viewBtn.href = `/salary-slip.html?id=${latestSlip._id}`;
      if (pdfBtn) pdfBtn.href = `/api/salary-slips/${latestSlip._id}/pdf`;
    } else {
      document.getElementById('emp-latest-period').textContent = 'No records found';
      document.getElementById('emp-gross-val').textContent = '$0.00';
      document.getElementById('emp-deductions-val').textContent = '$0.00';
      document.getElementById('emp-net-val').textContent = '$0.00';
    }

    // Populate mini salary history table
    const tableBody = document.getElementById('emp-history-tbody');
    if (tableBody) {
      if (slips.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No salary slips available for your account yet.</td></tr>`;
      } else {
        tableBody.innerHTML = slips.map(slip => `
          <tr>
            <td><strong>${slip.slipNumber}</strong></td>
            <td>${getMonthName(slip.month)} ${slip.year}</td>
            <td>${formatCurrency(slip.grossSalary)}</td>
            <td style="color: var(--danger);">${formatCurrency(slip.totalDeductions)}</td>
            <td style="font-weight: 700; color: var(--primary);">${formatCurrency(slip.netSalary)}</td>
            <td>
              <a href="/salary-slip.html?id=${slip._id}" class="btn btn-sm btn-secondary">View Slip</a>
              <a href="/api/salary-slips/${slip._id}/pdf" target="_blank" class="btn btn-sm btn-outline-primary">PDF</a>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (error) {
    showToast(`Error loading your salary records: ${error.message}`, 'error');
  }
};

/**
 * Dismiss Anomaly function for Admin
 */
window.dismissAnomaly = async (id) => {
  try {
    await apiRequest(`/ai/anomalies/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'reviewed' })
    });
    showToast('Anomaly marked as reviewed.', 'success');
    loadAdminDashboard();
  } catch (err) {
    showToast(err.message || 'Failed to update anomaly.', 'error');
  }
};
