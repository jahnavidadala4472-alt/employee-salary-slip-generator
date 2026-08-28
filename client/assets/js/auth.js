/**
 * Authentication JavaScript - Login, Registration & Demo Fillers
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to appropriate dashboard
  const user = getUser();
  const token = getToken();
  if (user && token && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html'))) {
    if (user.role === 'admin') {
      window.location.href = '/admin-dashboard.html';
    } else {
      window.location.href = '/employee-dashboard.html';
    }
    return;
  }

  // Check URL params for session expiration alert
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('expired') === '1') {
    showToast('Your session has expired. Please log in again.', 'warning');
  }

  // Password Visibility Toggle
  const togglePassBtns = document.querySelectorAll('.toggle-password');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.closest('.input-icon-wrapper').querySelector('input');
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '👁️';
      } else {
        input.type = 'password';
        btn.textContent = '🔒';
      }
    });
  });

  // --- Login Form Handler ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember')?.checked ?? true;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';

        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        setSession(data.token, data.user, remember);
        showToast(`Welcome back, ${data.user.fullName || data.user.email}!`, 'success');

        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin-dashboard.html';
          } else {
            window.location.href = '/employee-dashboard.html';
          }
        }, 600);
      } catch (err) {
        showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Dashboard';
      }
    });
  }

  // --- Register Form Handler ---
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const employeeId = document.getElementById('employeeId').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const department = document.getElementById('department')?.value.trim() || 'Engineering';
      const designation = document.getElementById('designation')?.value.trim() || 'Software Engineer';
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (!fullName || !email || !password) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match. Please re-enter.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Account...';

        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            fullName,
            employeeId,
            email,
            phone,
            department,
            designation,
            password
          })
        });

        setSession(data.token, data.user, true);
        showToast('Registration successful! Redirecting...', 'success');

        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = '/admin-dashboard.html';
          } else {
            window.location.href = '/employee-dashboard.html';
          }
        }, 600);
      } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Employee Account';
      }
    });
  }

  // --- Quick Demo Fill Buttons ---
  window.fillDemoCredentials = (role) => {
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');

    if (!emailInput || !passInput) return;

    if (role === 'admin') {
      emailInput.value = 'admin@payroll.com';
      passInput.value = 'Admin@12345';
      showToast('Admin demo credentials populated!', 'info');
    } else if (role === 'employee1') {
      emailInput.value = 'john.doe@company.com';
      passInput.value = 'Employee@12345';
      showToast('John Doe (EMP001) credentials populated!', 'info');
    } else if (role === 'employee2') {
      emailInput.value = 'sarah.jenkins@company.com';
      passInput.value = 'Employee@12345';
      showToast('Sarah Jenkins (EMP002) credentials populated!', 'info');
    }
  };
});
