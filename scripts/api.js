// API Service for Luxury Import System
const API_URL = 'http://localhost:5000/api';

// Helper function to get token
function getToken() {
  return localStorage.getItem('token');
}

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== AUTH APIs ====================
const authAPI = {
  register: async (userData) => {
    return await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  login: async (credentials) => {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/login.html';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
// ==================== PRODUCT APIs ====================
const productAPI = {
  getAll: async (filters = {}) => {
  console.log('Getting products with filters:', filters);
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = queryParams ? `/products?${queryParams}` : `/products`;
  console.log('Final endpoint:', endpoint);
  return await apiCall(endpoint);
},

  getOne: async (id) => {
    return await apiCall(`/products/${id}`);
  },

  getCategories: async () => {
    return await apiCall('/products/categories');
  },

  // ⭐ ADD PRODUCT → (for seller dashboard)
  create: async (productData) => {
    return await apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  // ⭐ DELETE PRODUCT
  delete: async (id) => {
    return await apiCall(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // ⭐ UPDATE PRODUCT
  update: async (id, productData) => {
    return await apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  }
};

// ==================== ORDER APIs ====================
const orderAPI = {
  create: async (orderData) => {
    return await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  getMyOrders: async () => {
    return await apiCall('/orders');
  },

  track: async (orderNumber) => {
    return await apiCall(`/orders/track/${orderNumber}`);
  },

  updatePayment: async (orderId, paymentData) => {
    return await apiCall(`/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  }
};

// ==================== ADMIN APIs ====================
const adminAPI = {
  getDashboard: async () => {
    return await apiCall('/admin/dashboard');
  },

  getAllOrders: async () => {
    return await apiCall('/admin/orders');
  },

  updateOrderStatus: async (orderId, statusData) => {
    return await apiCall(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }
};