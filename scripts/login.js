// scripts/login.js

const loginForm = document.getElementById('loginForm');

document.addEventListener('DOMContentLoaded', () => {
  const existingUser = localStorage.getItem('currentUser') || 
                       localStorage.getItem('isLoggedIn');
  
  if (existingUser) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const name = user?.name || 'Someone';
    alert(`${name} is currently logged in. Please logout first before switching accounts.`);
    window.location.href = 'index.html'; // redirect away from login page
  }
});

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    // Call backend API
    const response = await authAPI.login({ email, password });
    
    if (response.success) {
      console.log('Login response:', response);
      console.log('User role:', response.user.role);
      
      // ✅ FIXED: Save user data in the format orders page expects
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role
      }));
      
      // Also save token
      localStorage.setItem('token', response.token);
      
      // Also use AuthSystem if it exists
      if (typeof AuthSystem !== 'undefined' && AuthSystem.saveUser) {
        AuthSystem.saveUser(response.token, response.user);
      }
      
      // Verify it was saved
      console.log('✅ User saved to localStorage:', localStorage.getItem('currentUser'));
      
      alert('Login successful! Redirecting...');
      
      // Redirect based on role
      if (response.user.role === 'customer') {
        window.location.href = 'index.html';
      } else if (response.user.role === 'seller') {
        window.location.href = 'seller-dashboard.html';
      } else if (response.user.role === 'admin') {
        window.location.href = 'seller-dashboard.html';
      } else {
        alert('Unknown role: ' + response.user.role);
        window.location.href = 'index.html';
      }
    } else {
      alert('Login failed: ' + (response.message || 'Unknown error'));
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
    console.error('Login error:', error);
  }
});