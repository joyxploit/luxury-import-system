// scripts/cart.js

// 1. INITIALIZE & LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) {
        renderCartPage();
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
});

// 2. CORE FUNCTIONS
function getCartKey() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.id) return `cart_${user.id}`;
    } catch(e) {}
    return 'cart_guest';
}

function getCart() {
    return JSON.parse(localStorage.getItem(getCartKey())) || [];
}

function saveCart(cart) {
    try {
        localStorage.setItem(getCartKey(), JSON.stringify(cart));
        updateCartCount();
        if (document.getElementById('cart-items-container')) {
            renderCartPage();
        }
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert("Cart full! Browser storage limit reached.");
        }
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(badge => badge.textContent = count);
}

// 3. ADD TO CART
window.addToCart = function(product, variant = '') {
    const cart = getCart();
    
    const uniqueId = variant ? `${product.id}-${variant}` : product.id.toString();

    const existingItem = cart.find(item => item.uniqueId === uniqueId);

    let safeImage = 'https://placehold.co/150?text=Item';
    if (product.image && (product.image.startsWith('http') || product.image.length < 1000)) {
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
            variant: variant,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showToast(`${product.name} ${variant ? '('+variant+')' : ''} added!`);
};

// 4. RENDER CART PAGE
function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-message');
    const summary = document.getElementById('cart-summary');
    const totalEl = document.getElementById('cart-total');

    if (!container) return;

    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (summary) summary.style.display = 'none';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    if (summary) summary.style.display = 'block';

    cart.forEach(item => {
        const price = parseFloat(item.price) || 0;
        total += price * item.quantity;
        
        const variantHtml = item.variant 
            ? `<br><span style="font-size:12px; color:#777; background:#f0f0f0; padding:2px 5px; border-radius:3px;">${item.variant}</span>` 
            : '';

        const card = document.createElement('div');
        card.className = 'cart-card';
        card.innerHTML = `
            <div class="cart-card-inner" style="display:flex; gap:15px; align-items:center; margin-bottom:15px; background:#fff; padding:15px; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.05);">
                <img src="${item.image}" alt="${item.name}" style="width:80px; height:80px; object-fit:cover; border-radius:4px;" onerror="this.src='https://placehold.co/80x80?text=Img'">
                
                <div class="cart-info" style="flex:1;">
                    <h3 style="margin:0 0 5px 0; font-size:16px;">${item.name}</h3>
                    <p style="margin:0; color:#D4AF37; font-weight:bold;">Ksh ${price.toLocaleString()} ${variantHtml}</p>
                </div>
                
                <div class="cart-actions" style="display:flex; align-items:center; gap:10px;">
                    <input type="number" class="quantity-input" min="1" value="${item.quantity}" 
                           onchange="updateQty('${item.uniqueId}', this.value)" 
                           style="width:50px; padding:5px; border:1px solid #ddd; border-radius:4px;">
                    
                    <button onclick="removeItem('${item.uniqueId}')" 
                            style="background:none; border:none; font-size:24px; color:#ff4444; cursor:pointer;">&times;</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    if (totalEl) totalEl.textContent = `Ksh ${total.toLocaleString()}`;
}

// 5. ACTIONS
window.removeItem = function(uniqueId) {
    let cart = getCart().filter(item => item.uniqueId !== uniqueId);
    saveCart(cart);
}

window.updateQty = function(uniqueId, newQty) {
    let cart = getCart();
    const item = cart.find(i => i.uniqueId === uniqueId);
    
    if (item) {
        if (newQty > 0) {
            item.quantity = parseInt(newQty);
        } else {
            cart = cart.filter(i => i.uniqueId !== uniqueId);
        }
        saveCart(cart);
    }
}

// 6. TOAST
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
            transition: opacity 0.3s; opacity: 0; pointer-events: none;
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}
