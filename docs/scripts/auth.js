// scripts/auth.js - FRONTEND AUTHENTICATION HELPER
// Include this in EVERY HTML page: <script src="scripts/auth.js"></script>

const AuthSystem = {
  // Save user data after login/registration
  saveUser(token, user) {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', user.id);
    localStorage.setItem('userName', user.name);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('isLoggedIn', 'true');
    console.log('✅ User saved to localStorage:', user);
  },

  // Get current logged-in user
  getCurrentUser() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn || isLoggedIn !== 'true') {
      return null;
    }
    
    return {
      id: localStorage.getItem('userId'),
      name: localStorage.getItem('userName'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole'),
      token: localStorage.getItem('authToken')
    };
  },

  // Check if user is logged in
  isAuthenticated() {
    return localStorage.getItem('isLoggedIn') === 'true';
  },

  // Check if user has specific role
  hasRole(role) {
    const userRole = localStorage.getItem('userRole');
    return userRole === role;
  },

  // Logout user
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    console.log('✅ User logged out');
  },

  // Redirect to login if not authenticated
  requireAuth(redirectUrl = '../pages/login.html') {
    if (!this.isAuthenticated()) {
      alert('Please login to access this page');
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },

  // Redirect based on role
  redirectByRole() {
    const user = this.getCurrentUser();
    if (!user) return;

    if (user.role === 'seller') {
      window.location.href = '../pages/seller-dashboard.html';
    } else if (user.role === 'customer') {
      window.location.href = '../pages/customer-dashboard.html';
    } else if (user.role === 'admin') {
      window.location.href = '../pages/seller-dashboard.html';
    }
  },

  // Update UI elements on all pages
  updatePageUI() {
    const user = this.getCurrentUser();
    
    // Find and update user greeting elements
    const userGreeting = document.getElementById('userGreeting');
    const userName = document.getElementById('userName');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');

    if (user) {
      // User is logged in
      if (userGreeting) userGreeting.textContent = `Welcome, ${user.name}!`;
      if (userName) userName.textContent = user.name;
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
    } else {
      // User is logged out
      if (userGreeting) userGreeting.textContent = 'Welcome, Guest';
      if (userName) userName.textContent = 'Guest';
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (dashboardBtn) dashboardBtn.style.display = 'none';
    }
  },

  // Add logout handlers to all logout buttons
  attachLogoutHandlers() {
    const logoutButtons = document.querySelectorAll('[id="logoutBtn"], .logout-btn, [data-logout]');
    
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          this.logout();
          alert('✅ Logged out successfully!');
          window.location.href = '../pages/index.html';
        }
      });
    });
  }
};

// Initialize on every page load
document.addEventListener('DOMContentLoaded', () => {
  AuthSystem.updatePageUI();
  AuthSystem.attachLogoutHandlers();
  console.log('🔐 Auth system initialized');
  
  // Log current user for debugging
  const user = AuthSystem.getCurrentUser();
  if (user) {
    console.log('👤 Current user:', user.name, '(' + user.role + ')');
  } else {
    console.log('👤 No user logged in');
  }
});

// Make available globally
window.AuthSystem = AuthSystem;