/**
 * Employee Management & Employee Form Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  const isEmployeeListPage = window.location.pathname.includes('employees.html');
  const isEmployeeFormPage = window.location.pathname.includes('employee-form.html');

  if (!isEmployeeListPage && !isEmployeeFormPage) return;

  const user = initAuthGuard('admin');
  if (!user) return;

  if (isEmployeeListPage) {
    initEmployeeListPage();
  } else if (isEmployeeFormPage) {
    initEmployeeFormPage();
  }
});

/**
 * Initialize Employee Directory List Page
 */
const initEmployeeListPage = async () => {
  const searchInput = document.getElementById('search-input');
  const deptFilter = document.getElementById('dept-filter');
  const statusFilter = document.getElementById('status-filter');
  const tableBody = document.getElementById('employees-tbody');

  let debounceTimer;

  const loadEmployees = async () => {
    try {
      const search = searchInput?.value || '';
      const department = deptFilter?.value || 'all';
      const status = statusFilter?.value || 'all';

      const url = `/employees?search=${encodeURIComponent(search)}&department=${encodeURIComponent(department)}&status=${encodeURIComponent(status)}`;
      const data = await apiRequest(url);

      // Populate Department Filter options if empty
      if (deptFilter && deptFilter.options.length <= 1 && data.filters?.departments) {
        data.filters.departments.forEach(d => {
          const opt = document.createElement('option');
          opt.value = d;
          opt.textContent = d;
          deptFilter.appendChild(opt);
        });
      }

      if (!data.data || data.data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">No employees found matching criteria.</td></tr>`;
        return;
      }

      tableBody.innerHTML = data.data.map(emp => `
        <tr>
          <td><strong style="color: var(--primary); font-family: var(--font-mono);">${emp.employeeId}</strong></td>
          <td>
            <div style="font-weight: 600;">${emp.fullName}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.email}</div>
          </td>
          <td>${emp.department}</td>
          <td>${emp.designation}</td>
          <td>${emp.phone}</td>
          <td>${formatDate(emp.joiningDate)}</td>
          <td>
            <span class="badge ${emp.status === 'active' ? 'badge-success' : 'badge-danger'}">
              ${emp.status.toUpperCase()}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 0.35rem; align-items: center;">
              <a href="/employee-form.html?id=${emp._id}" class="btn btn-sm btn-secondary" title="Edit Employee">Edit</a>
              <a href="/salary-entry.html?employeeId=${emp.employeeId}" class="btn btn-sm btn-primary" title="Create Salary Slip">+ Slip</a>
              <a href="/salary-history.html?employeeId=${emp.employeeId}" class="btn btn-sm btn-outline-primary" title="View Slips">History</a>
              <button onclick="toggleEmployeeStatus('${emp._id}', '${emp.status}')" class="btn btn-sm ${emp.status === 'active' ? 'btn-danger' : 'btn-success'}" style="padding: 0.4rem 0.6rem;">
                ${emp.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      showToast(`Error loading employees: ${err.message}`, 'error');
    }
  };

  // Event Listeners for Filters
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(loadEmployees, 300);
  });

  deptFilter?.addEventListener('change', loadEmployees);
  statusFilter?.addEventListener('change', loadEmployees);

  // Initial Load
  loadEmployees();
};

/**
 * Toggle Employee Status (Activate/Deactivate)
 */
window.toggleEmployeeStatus = async (id, currentStatus) => {
  const action = currentStatus === 'active' ? 'deactivate' : 'activate';
  if (!confirm(`Are you sure you want to ${action} this employee account?`)) return;

  try {
    const data = await apiRequest(`/employees/${id}`, { method: 'DELETE' });
    showToast(data.message || `Employee status updated.`, 'success');
    window.location.reload();
  } catch (err) {
    showToast(err.message || 'Action failed.', 'error');
  }
};

/**
 * Initialize Employee Form (Add / Edit)
 */
const initEmployeeFormPage = async () => {
  const form = document.getElementById('employee-form');
  const pageTitle = document.getElementById('form-page-title');
  const submitBtn = document.getElementById('form-submit-btn');

  const urlParams = new URLSearchParams(window.location.search);
  const employeeIdParam = urlParams.get('id');

  let isEditMode = Boolean(employeeIdParam);

  if (isEditMode) {
    if (pageTitle) pageTitle.textContent = 'Edit Employee Profile';
    if (submitBtn) submitBtn.textContent = 'Update Employee';

    // Fetch existing employee details
    try {
      const data = await apiRequest(`/employees/${employeeIdParam}`);
      const emp = data.data;

      document.getElementById('fullName').value = emp.fullName || '';
      const empIdField = document.getElementById('employeeId');
      empIdField.value = emp.employeeId || '';
      empIdField.disabled = true; // Cannot edit ID after creation

      document.getElementById('email').value = emp.email || '';
      document.getElementById('phone').value = emp.phone || '';
      document.getElementById('department').value = emp.department || '';
      document.getElementById('designation').value = emp.designation || '';
      if (emp.joiningDate) {
        document.getElementById('joiningDate').value = new Date(emp.joiningDate).toISOString().split('T')[0];
      }
      document.getElementById('address').value = emp.address || '';
      document.getElementById('bankName').value = emp.bankName || '';
      document.getElementById('accountLast4').value = emp.accountLast4 || '';
      if (document.getElementById('status')) {
        document.getElementById('status').value = emp.status || 'active';
      }
    } catch (err) {
      showToast(`Failed to load employee details: ${err.message}`, 'error');
    }
  }

  // Handle Form Submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      employeeId: document.getElementById('employeeId').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      department: document.getElementById('department').value.trim(),
      designation: document.getElementById('designation').value.trim(),
      joiningDate: document.getElementById('joiningDate').value,
      address: document.getElementById('address').value.trim(),
      bankName: document.getElementById('bankName').value.trim(),
      accountLast4: document.getElementById('accountLast4').value.trim()
    };

    if (document.getElementById('status')) {
      payload.status = document.getElementById('status').value;
    }

    if (!isEditMode && document.getElementById('password')?.value) {
      payload.password = document.getElementById('password').value;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      if (isEditMode) {
        await apiRequest(`/employees/${employeeIdParam}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Employee updated successfully!', 'success');
      } else {
        await apiRequest('/employees', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('New employee registered successfully!', 'success');
      }

      setTimeout(() => {
        window.location.href = '/employees.html';
      }, 700);
    } catch (err) {
      showToast(err.message || 'Operation failed.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isEditMode ? 'Update Employee' : 'Register Employee';
    }
  });
};
