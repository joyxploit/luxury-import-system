// scripts/sidebar.js
if (!localStorage.getItem('token')) {
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault(); 
      // Find the parent <li> element with the class 'dropdown'
      const parentLi = this.closest('li.dropdown'); 
      // Toggle the 'open' class to trigger the CSS transition
      parentLi.classList.toggle('open'); 
    });
    const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // Clear all session data
    localStorage.clear();

    // Redirect to login page
    window.location.href = 'login.html';
  });
}

  });
});