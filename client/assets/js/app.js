/**
 * Master Client Application Script - Shared Utilities, API Client & Auth Guards
 */

const API_BASE = '/api';

// --- Session & Token Management ---
const getToken = () => localStorage.getItem('payroll_token') || sessionStorage.getItem('payroll_token');
const getUser = () => {
  try {
    const userStr = localStorage.getItem('payroll_user') || sessionStorage.getItem('payroll_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    return null;
  }
};

const setSession = (token, user, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem('payroll_token', token);
  storage.setItem('payroll_user', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('payroll_token');
  localStorage.removeItem('payroll_user');
  sessionStorage.removeItem('payroll_token');
  sessionStorage.removeItem('payroll_user');
};

// --- HTTP Client ---
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData (don't set Content-Type header manually)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login')) {
        clearSession();
        window.location.href = '/login.html?expired=1';
        return;
      }
      throw new Error(data.message || 'Request failed.');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
};

// --- Toast Notifications ---
const showToast = (message, type = 'info') => {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span style="font-size: 1.1rem; font-weight: bold;">${iconMap[type] || 'ℹ'}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// --- Formatting Helpers ---
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getMonthName = (m) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[Number(m) - 1] || '';
};

// --- Page Auth Guard & Navigation ---
const initAuthGuard = (requiredRole = null) => {
  const user = getUser();
  const token = getToken();

  if (!user || !token) {
    window.location.href = '/login.html';
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'admin') {
      window.location.href = '/admin-dashboard.html';
    } else {
      window.location.href = '/employee-dashboard.html';
    }
    return null;
  }

  // Populate dynamic UI elements if they exist
  const userNameEls = document.querySelectorAll('.dynamic-user-name');
  userNameEls.forEach(el => el.textContent = user.fullName || user.email);

  const userRoleEls = document.querySelectorAll('.dynamic-user-role');
  userRoleEls.forEach(el => el.textContent = user.role.toUpperCase());

  const userAvatarEls = document.querySelectorAll('.dynamic-user-avatar');
  userAvatarEls.forEach(el => {
    const initials = (user.fullName || user.email).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    el.textContent = initials;
  });

  // Attach logout handler
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch (err) {
        // Ignore network errors on logout
      } finally {
        clearSession();
        window.location.href = '/login.html';
      }
    });
  });

  // Mobile sidebar toggle handler
  const toggleBtn = document.querySelector('.toggle-sidebar-btn');
  const sidebar = document.querySelector('.sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  return user;
};
