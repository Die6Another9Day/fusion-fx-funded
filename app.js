/**
 * Fusion FX Funded — app.js
 *
 * ============================================================
 * ⚠️  DEMO ONLY — This is NOT secure production authentication.
 *     All data is stored in localStorage on the client side.
 *     Anyone can inspect, modify, or forge session data.
 *     In production, replace this entirely with server-side
 *     authentication (e.g., JWT, session cookies, OAuth).
 * ============================================================
 */

(function () {
  'use strict';

  // ============================
  // Configuration
  // ============================
  var SESSION_KEY = 'fusionfx_demo_session';
  var LOGIN_ROUTE = 'login.html';
  var DASHBOARD_ROUTE = 'dashboard.html';
  var HOME_ROUTE = 'index.html';

  // ============================
  // Session helpers
  // ============================

  /**
   * Start a fake demo session.
   * @param {string} email
   * @param {string} displayName
   */
  function startSession(email, displayName) {
    var session = {
      email: email,
      displayName: displayName,
      loginTime: Date.now(),
      // NOTE: demo-only token — NOT a real JWT
      token: btoa(email + ':' + Date.now())
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  /**
   * Get the current demo session, or null if not logged in.
   */
  function getSession() {
    var raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  /**
   * End (logout) the demo session.
   */
  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = LOGIN_ROUTE;
  }

  /**
   * Guard: if no active session, redirect to login.
   * Returns true if session exists (caller can continue), false otherwise.
   */
  function guardDashboard() {
    var session = getSession();
    if (!session) {
      window.location.href = LOGIN_ROUTE;
      return false;
    }
    return true;
  }

  // ============================
  // Validation helpers
  // ============================

  /**
   * Basic email validation.
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Basic password validation — at least 4 characters for demo.
   */
  function isValidPassword(password) {
    return password.length >= 4;
  }

  /**
   * Show a friendly error message under a given field.
   * @param {HTMLInputElement} inputEl
   * @param {string} message
   */
  function showError(inputEl, message) {
    inputEl.classList.add('input-error');
    var errorEl = inputEl.parentElement.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      inputEl.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  /**
   * Clear the error displayed under a given field.
   * @param {HTMLInputElement} inputEl
   */
  function clearError(inputEl) {
    inputEl.classList.remove('input-error');
    var errorEl = inputEl.parentElement.querySelector('.form-error');
    if (errorEl) errorEl.textContent = '';
  }

  // ============================
  // DOM-ready: Login Page logic
  // ============================

  function initLoginPage() {
    var form = document.getElementById('auth-form');
    if (!form) return;

    var emailInput = document.getElementById('auth-email');
    var passwordInput = document.getElementById('auth-password');
    var nameInput = document.getElementById('auth-name'); // only on register
    var toggleBtn = document.getElementById('password-toggle');
    var modeToggle = document.getElementById('mode-toggle'); // "Switch to Register" / "Switch to Sign In"
    var authTitle = document.getElementById('auth-title');
    var nameGroup = document.getElementById('auth-name-group');

    // --- Password show / hide ---
    if (toggleBtn && passwordInput) {
      toggleBtn.addEventListener('click', function () {
        var isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        toggleBtn.textContent = isHidden ? '🙈' : '👁️';
      });
    }

    // --- Toggle Sign In / Register ---
    if (modeToggle) {
      modeToggle.addEventListener('click', function () {
        var isRegister = nameGroup && nameGroup.style.display !== 'none';
        // Flip mode
        if (isRegister) {
          // Switch to Sign In
          if (nameGroup) nameGroup.style.display = 'none';
          authTitle.textContent = 'Sign In';
          modeToggle.textContent = "Don't have an account? Sign Up";
          form.action = 'login';
        } else {
          // Switch to Register
          if (nameGroup) nameGroup.style.display = '';
          authTitle.textContent = 'Create Account';
          modeToggle.textContent = 'Already have an account? Sign In';
          form.action = 'register';
        }
      });
    }

    // --- Clear errors on input ---
    if (emailInput) emailInput.addEventListener('input', function () { clearError(emailInput); });
    if (passwordInput) passwordInput.addEventListener('input', function () { clearError(passwordInput); });
    if (nameInput) nameInput.addEventListener('input', function () { clearError(nameInput); });

    // --- Form submit ---
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      var email = emailInput ? emailInput.value.trim() : '';
      var password = passwordInput ? passwordInput.value : '';
      var name = nameInput ? nameInput.value.trim() : '';

      // Validate email
      if (!email) {
        showError(emailInput, 'Email is required.');
        valid = false;
      } else if (!isValidEmail(email)) {
        showError(emailInput, 'Please enter a valid email address.');
        valid = false;
      }

      // Validate password
      if (!password) {
        showError(passwordInput, 'Password is required.');
        valid = false;
      } else if (!isValidPassword(password)) {
        showError(passwordInput, 'Password must be at least 4 characters.');
        valid = false;
      }

      // Validate name (register only)
      if (nameGroup && nameGroup.style.display !== 'none') {
        if (!name) {
          showError(nameInput, 'Full name is required.');
          valid = false;
        }
      }

      if (!valid) return;

      // --- Simulate authentication ---
      var isRegister = nameGroup && nameGroup.style.display !== 'none';

      if (isRegister) {
        // Demo register: store in localStorage
        var users = JSON.parse(localStorage.getItem('fusionfx_demo_users') || '{}');
        users[email] = { password: password, name: name };
        localStorage.setItem('fusionfx_demo_users', JSON.stringify(users));
        // Auto login after register
        startSession(email, name);
        window.location.href = DASHBOARD_ROUTE;
      } else {
        // Demo login: check stored users
        var users = JSON.parse(localStorage.getItem('fusionfx_demo_users') || '{}');
        if (users[email] && users[email].password === password) {
          startSession(email, users[email].name);
          window.location.href = DASHBOARD_ROUTE;
        } else if (!users[email]) {
          showError(emailInput, 'No account found with that email.');
        } else {
          showError(passwordInput, 'Incorrect password.');
        }
      }
    });
  }

  // ============================
  // DOM-ready: Dashboard Page logic
  // ============================

  function initDashboardPage() {
    // Guard: must be logged in
    if (!guardDashboard()) return;

    var session = getSession();

    // Show user greeting
    var greeting = document.getElementById('user-greeting');
    if (greeting) {
      greeting.textContent = 'Welcome, ' + (session ? session.displayName : 'Trader');
    }

    // Show email badge
    var emailBadge = document.getElementById('user-email');
    if (emailBadge && session) {
      emailBadge.textContent = session.email;
    }

    // Logout button
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        logout();
      });
    }

    // Account selector (demo only)
    var accountSelect = document.getElementById('account-selector');
    if (accountSelect) {
      accountSelect.addEventListener('change', function () {
        updateDashboardStats();
      });
    }

    updateDashboardStats();
  }

  /**
   * Update dashboard stats with mock data based on selected account.
   */
  function updateDashboardStats() {
    var selectors = document.querySelectorAll('[data-mock-balance]');
    var balanceMap = {
      '1': { balance: 100000, equity: 101250, profit: 1250, winRate: 62.5, drawdown: 3.2 },
      '2': { balance: 50000, equity: 49100, profit: -900, winRate: 48.3, drawdown: 7.8 },
      '3': { balance: 25000, equity: 26800, profit: 1800, winRate: 71.0, drawdown: 1.5 }
    };

    var selected = '1';
    if (document.getElementById('account-selector')) {
      selected = document.getElementById('account-selector').value;
    }

    var data = balanceMap[selected] || balanceMap['1'];

    // Set mock values
    var setters = {
      'demo-balance': data.balance,
      'demo-equity': data.equity,
      'demo-profit': data.profit,
      'demo-winrate': data.winRate,
      'demo-drawdown': data.drawdown
    };

    Object.keys(setters).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = setters[id];
    });

    // Profit sign color
    var profitEl = document.getElementById('demo-profit');
    if (profitEl) {
      profitEl.className = 'stat-value ' + (data.profit >= 0 ? 'positive' : 'negative');
    }

    // Objective progress
    updateObjectiveProgress(data);
  }

  /**
   * Update objective completion indicators.
   */
  function updateObjectiveProgress(data) {
    var progressPct = Math.min(100, Math.max(0, data.profit / data.balance * 100 * 2));
    var bar = document.getElementById('objective-progress-bar');
    if (bar) bar.style.width = progressPct + '%';

    var label = document.getElementById('objective-progress-label');
    if (label) label.textContent = Math.round(progressPct) + '% complete';
  }

  // ============================
  // Initialize based on current page
  // ============================

  function init() {
    var path = window.location.pathname;
    if (path.indexOf(LOGIN_ROUTE) !== -1 || path === '/') {
      initLoginPage();
    } else if (path.indexOf(DASHBOARD_ROUTE) !== -1) {
      initDashboardPage();
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
