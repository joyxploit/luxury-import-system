const form = document.getElementById('signupForm');
const successMessage = document.getElementById('successMessage');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  
  // Get all form values
  const role = document.getElementById('role').value;
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const county = document.getElementById('county').value;
  const town = document.getElementById('town').value;
  const estate = document.getElementById('estate')?.value || '';
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  console.log('Selected role:', role);
  
  // Validate role is selected
  if (!role || role === '') {
    alert('Please select your role (Customer or Seller)!');
    return;
  }
  
  // Validate passwords match
  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }
  
  // Validate password length
  if (password.length < 6) {
    alert('Password must be at least 6 characters long!');
    return;
  }
  
  // Prepare user data for backend
  const userData = {
    name: name,
    email: email,
    phone: phone,
    password: password,
    role: role,
    county: county,
    town: town,
    estate: estate
  };
  
  console.log('Sending user data:', userData);
  
  try {
    // Call backend API
    const response = await authAPI.register(userData);
    
    console.log('Backend response:', response);
    
    if (response.success) {
      // ✅ SAVE USER TO LOCALSTORAGE using AuthSystem
      AuthSystem.saveUser(response.token, response.user);
      
      // Show success message
      form.style.display = 'none';
      successMessage.style.display = 'flex';
      
      alert(`Registration successful as ${response.user.role}! Welcome ${response.user.name}!`);
      
      // Redirect based on role after 2 seconds
      setTimeout(() => {
        if (response.user.role === 'seller') {
          window.location.href = 'seller-dashboard.html';
        } else if (response.user.role === 'customer') {
          window.location.href = 'customer-dashboard.html';
        } else {
          window.location.href = 'index.html';
        }
      }, 2000);
    }
  } catch (error) {
    alert('Registration failed: ' + error.message);
    console.error('Signup error:', error);
  }
});