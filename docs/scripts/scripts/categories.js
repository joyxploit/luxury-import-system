// scripts/categories.js - FIXED: Now fetches from database & Supports Variants

let products = [];
let currentCategory = 'all';
let currentProducts = [];

// Load products when page loads
document.addEventListener('DOMContentLoaded', async () => {
  await loadProductsFromAPI();
  
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');

  if (categoryFromUrl) {
    currentCategory = categoryFromUrl;
    filterCategory(categoryFromUrl);
  } else {
    displayProducts(products);
  }
});

// Load products from API (database)
async function loadProductsFromAPI() {
  try {
    console.log('📥 Loading products from database...');
    const response = await productAPI.getAll(); // Assumes api.js is loaded
    
    if (response.success) {
      products = response.products || [];
      console.log('✅ Loaded', products.length, 'products from database');
    } else {
      console.error('❌ Failed to load products:', response.message);
      products = [];
    }
  } catch (error) {
    console.error('❌ Error loading products:', error);
    // Only alert if completely failed, otherwise show empty state
    products = [];
  }
}

// Display products in the grid
function displayProducts(productsToDisplay) {
  const productsGrid = document.getElementById('productsGrid');
  const categoryTitle = document.getElementById('categoryTitle');
  const productCount = document.getElementById('productCount');

  if (!productsGrid) return;

  productsGrid.innerHTML = '';
  currentProducts = productsToDisplay;

  const categoryNames = {
    all: 'All Products',
    bags: 'Designer Bags',
    perfumes: 'Luxury Perfumes',
    watches: 'Premium Watches',
    shoes: 'Designer Shoes',
    sunglasses: 'Sunglasses',
    charms: 'Bag Charms',
    jewelry: 'Jewelry',
    apparel: 'Fashion Apparel'
  };

  categoryTitle.textContent = categoryNames[currentCategory] || 'All Products';
  productCount.textContent = `Showing ${productsToDisplay.length} products`;

  if (productsToDisplay.length === 0) {
    productsGrid.innerHTML =
      '<p style="grid-column: 1/-1; text-align:center; padding:3rem; color:#666;">No products found in this category.</p>';
    return;
  }

  productsToDisplay.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    const stars = '⭐'.repeat(product.rating || 5);
    
    // Handle image - could be a single image string or array
    let imageUrl = 'https://placehold.co/300x300/e5e5e5/999999?text=No+Image';
    if (Array.isArray(product.images) && product.images.length > 0) {
        imageUrl = product.images[0];
    } else if (product.image) {
        imageUrl = product.image;
    }

    // --- NEW: Get Options Dropdown (Size/Color) ---
    const optionsHTML = getOptionsHTML(product.category, product.id);

    productCard.innerHTML = `
      <div class="product-image">
        <img src="${imageUrl}" alt="${product.name}"
          onerror="this.src='https://placehold.co/300x300/e5e5e5/999999?text=No+Image'">
      </div>
      <div class="product-info">
        <div class="product-rating">
          ${stars} <span>(${product.rating || 5})</span>
        </div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">KSh ${Number(product.price).toLocaleString()}</p>
        
        <div style="margin-bottom: 10px;">
            ${optionsHTML}
        </div>

        <div class="product-buttons">
          <button class="btn-add-cart" onclick="handleAddToCart(${product.id})">🛒 Add to Cart</button>
          <button class="btn-wishlist" onclick="addToWishlist(${product.id})">❤️ Wishlist</button>
        </div>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });
}

// --- NEW: Helper to generate dropdowns based on category ---
function getOptionsHTML(category, id) {
    if (!category) return '';
    const cat = category.toLowerCase();
    const selectStyle = "width:100%; padding:5px; margin-bottom:5px; border:1px solid #ccc; border-radius:4px;";

    // SHOES: Size 36-45
    if (cat.includes('shoes')) {
        let opts = '';
        for(let i=36; i<=45; i++) opts += `<option value="Size: ${i}">Size: ${i}</option>`;
        return `<select id="opt-${id}" style="${selectStyle}">${opts}</select>`;
    }

    // APPAREL: S - XXL
    if (cat.includes('apparel') || cat.includes('clothing')) {
        return `
            <select id="opt-${id}" style="${selectStyle}">
                <option value="Size: Small">Size: Small</option>
                <option value="Size: Medium">Size: Medium</option>
                <option value="Size: Large">Size: Large</option>
                <option value="Size: XL">Size: XL</option>
                <option value="Size: XXL">Size: XXL</option>
            </select>`;
    }

    // BAGS & CHARMS: Colors
    if (cat.includes('bags') || cat.includes('charms')) {
        return `
            <select id="opt-${id}" style="${selectStyle}">
                <option value="Color: Black">Color: Black</option>
                <option value="Color: Gold">Color: Gold</option>
                <option value="Color: Silver">Color: Silver</option>
                <option value="Color: Red">Color: Red</option>
                <option value="Color: Blue">Color: Blue</option>
                <option value="Color: Brown">Color: Brown</option>
                <option value="Color: White">Color: White</option>
            </select>`;
    }

    return ''; // Other categories (like watches/perfumes) get no dropdown
}

// Filter products by category
function filterCategory(category) {
  currentCategory = category;

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => btn.classList.remove('active'));

  const activeButton = Array.from(filterButtons).find(btn =>
    btn.textContent.toLowerCase().includes(category.toLowerCase())
  );

  if (activeButton) activeButton.classList.add('active');

  if (category === 'all') {
    displayProducts(products);
  } else {
    // Use simple string includes for safer matching
    const filtered = products.filter(p => p.category && p.category.toLowerCase().includes(category.toLowerCase()));
    displayProducts(filtered);
  }
}

// Sorting logic
function sortProducts() {
  const sortSelect = document.getElementById('sortSelect');
  const sortValue = sortSelect.value;
  let sortedProducts = [...currentProducts];

  switch (sortValue) {
    case 'price-low':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  displayProducts(sortedProducts);
}

// --- UPDATED: Handle add to cart with Variant ---
function handleAddToCart(productId) {
  const product = products.find(p => p.id === productId);
  
  if (product) {
    // 1. Look for the dropdown element for this product ID
    const selectElement = document.getElementById(`opt-${productId}`);
    
    // 2. Get value if it exists, otherwise empty string
    let selectedOption = selectElement ? selectElement.value : '';

    // 3. Call global addToCart (from cart.js)
    if(typeof addToCart === 'function') {
        addToCart(product, selectedOption);
    } else {
        console.error("cart.js not loaded");
    }
  } else {
    console.error('Product not found:', productId);
  }
}

// Handle add to wishlist
function addToWishlist(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return alert('Product not found!');

  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

  if (wishlist.some(item => item.id === productId)) {
    alert('This product is already in your wishlist!');
    return;
  }

  wishlist.push(product);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  alert('Added to your wishlist ❤️');
}