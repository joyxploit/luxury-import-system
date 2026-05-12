// logout.js

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Clear all session data
        localStorage.clear();

        // Reset dashboard cart badge if exists
        const badge = document.getElementById('cart-badge');
        if (badge) badge.innerText = '0';

        // Redirect to login page
        window.location.href = 'login.html';
    });
}
