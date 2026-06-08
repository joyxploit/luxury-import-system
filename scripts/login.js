// scripts/login.js
const loginForm = document.getElementById('loginForm');

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (currentUser && isLoggedIn === 'true') {
    try {
      const user = JSON.parse(currentUser);
      if (user && user.id) {
        const name = user.name || 'Someone';
        alert(`${name} is currently logged in. Please logout first before switching accounts.`);
        window.location.href = 'index.html';
      }
    } catch(e) {
      localStorage.clear();
    }
  }
});

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await authAPI.login({ email, password });
    
    if (response.success) {
      console.log('Login response:', response);
      console.log('User role:', response.user.role);
      
      localStorage.setItem('currentUser', JSON.stringify({
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role
      }));
      
      localStorage.setItem('token', response.token);
      
      if (typeof AuthSystem !== 'undefined' && AuthSystem.saveUser) {
        AuthSystem.saveUser(response.token, response.user);
      }
      
      alert('Login successful! Redirecting...');
      
      if (response.user.role === 'customer') {
        window.location.href = 'index.html';
      } else if (response.user.role === 'seller') {
        window.location.href = 'seller-dashboard.html';
      } else if (response.user.role === 'admin') {
        window.location.href = 'seller-dashboard.html';
      } else {
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
