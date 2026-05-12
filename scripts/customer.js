// State to hold all products
let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const loadingSpinner = document.getElementById('loading');
const noProductsMsg = document.getElementById('no-products');
const categoryTitle = document.getElementById('category-title');
const productsCount = document.getElementById('products-count');
const searchInput = document.getElementById('search-input');
const mobileSearchInput = document.getElementById('mobile-search-input');
const sortSelect = document.getElementById('sort-select');

// 1. WAIT FOR DOM TO LOAD
document.addEventListener('DOMContentLoaded', () => {
    console.log("Page Loaded. Initializing...");
    init();
});

async function init() {
    setupEventListeners();
    await loadProducts();
}

async function loadProducts() {
    showLoading(true);
    try {
        const response = await productAPI.getAll();
        console.log("API Response:", response);

        if (response.success && response.products) {
            allProducts = response.products;
            filterAndRender();
        } else {
            productsGrid.innerHTML = '<p style="text-align:center;">Failed to load products.</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p style="text-align:center;">Server error or API down.</p>';
    } finally {
        showLoading(false);
    }
}

function renderProducts(products) {
    productsGrid.innerHTML = ''; 

    if (products.length === 0) {
        noProductsMsg.style.display = 'block';
        productsCount.innerText = 'Showing 0 products';
        return;
    }

    noProductsMsg.style.display = 'none';
    productsCount.innerText = `Showing ${products.length} products`;

    products.forEach(product => {
        const imageSrc = (Array.isArray(product.images) && product.images.length > 0) 
            ? product.images[0] 
            : (product.image || 'https://via.placeholder.com/300x400?text=No+Image');

        const card = document.createElement('div');
        card.className = 'product-card';

        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) return;
            console.log("Redirecting to category:", product.category);
            window.location.href = `categories.html?category=${encodeURIComponent(product.category || 'all')}`;
        });

        card.innerHTML = `
            <div class="product-image-container">
                <img src="${imageSrc}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category || 'Luxury Item'}</div>
                <h3 class="product-title" title="${product.name}">${product.name}</h3>
                <div class="product-price">Ksh ${Number(product.price).toLocaleString()}</div>
                
                <button class="add-to-cart-btn" data-product-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        `;

        // ✅ FIXED: Attach event listener properly
        const addBtn = card.querySelector('.add-to-cart-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addProductToCart(product);
        });

        productsGrid.appendChild(card);
    });
}

// ✅ NEW FUNCTION: Actually adds to localStorage
function addProductToCart(product) {
    const cart = getCart();
    
    const uniqueId = product.id.toString();
    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    // Safe image handling
    let safeImage = 'https://placehold.co/150?text=Item';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        safeImage = product.images[0];
    } else if (product.image) {
        safeImage = product.image;
    }

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            uniqueId: uniqueId,
            id: product.id,
            name: product.name,
            price: product.price,
            image: safeImage,
            variant: '',
            quantity: 1
        });
    }
    
    saveCart(cart);
    showToast(`${product.name} added to cart!`);
    updateCartBadge();
}

// ✅ Helper functions
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = count;
}

function showToast(msg) {
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; 
            background-color: #333; color: #D4AF37; 
            padding: 12px 24px; border-radius: 4px; z-index: 9999;
            font-family: sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: opacity 0.3s; opacity: 0;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

function filterAndRender() {
    let filtered = allProducts;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => {
            if (!p.category) return false;
            return p.category.toLowerCase().includes(currentCategory.toLowerCase());
        });
    }

    if (searchQuery) {
        const term = searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }

    const sortValue = sortSelect ? sortSelect.value : 'default';
    if (sortValue === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortValue === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortValue === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

    renderProducts(filtered);
}

function setupEventListeners() {
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            const nameSpan = btn.querySelector('.category-name');
            if(nameSpan) categoryTitle.innerText = nameSpan.innerText;
            filterAndRender();
        });
    });

    const handleSearch = (e) => {
        searchQuery = e.target.value;
        filterAndRender();
    };

    if(searchInput) searchInput.addEventListener('input', handleSearch);
    if(mobileSearchInput) mobileSearchInput.addEventListener('input', handleSearch);
    if(sortSelect) sortSelect.addEventListener('change', filterAndRender);
}

function showLoading(isLoading) {
    if (isLoading) {
        if(loadingSpinner) loadingSpinner.style.display = 'block';
        if(productsGrid) productsGrid.style.display = 'none';
    } else {
        if(loadingSpinner) loadingSpinner.style.display = 'none';
        if(productsGrid) productsGrid.style.display = 'grid';
    }
}