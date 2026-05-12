// wishlist.js

document.addEventListener('DOMContentLoaded', () => {
  renderWishlist();
  updateWishlistCount();
  updateCartCount();
});

// ✅ Get wishlist
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

// ✅ Save wishlist
function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateWishlistCount();
}

// ✅ Add to wishlist (can be reused on other pages)
function addToWishlist(productId) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const wishlist = getWishlist();
  const item = products.find(p => p.id === productId);
  if (!item) return alert('Product not found');

  if (wishlist.find(p => p.id === item.id)) {
    showToast('Already in wishlist!');
    return;
  }

  wishlist.push(item);
  saveWishlist(wishlist);
  showToast('💖 Added to Wishlist');
}

// ✅ Remove from wishlist
function removeFromWishlist(id) {
  const updated = getWishlist().filter(item => item.id !== id);
  saveWishlist(updated);
  renderWishlist();
  showToast('❌ Removed from Wishlist');
}

// ✅ Move to cart
function moveToCart(id) {
  const wishlist = getWishlist();
  const item = wishlist.find(i => i.id === id);
  if (!item) return;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(c => c.id === id);
  if (existing) existing.quantity++;
  else cart.push({ ...item, quantity: 1 });

  localStorage.setItem('cart', JSON.stringify(cart));
  removeFromWishlist(id);
  updateCartCount();
  showToast('🛒 Moved to Cart');
}

// ✅ Render wishlist page
function renderWishlist() {
  const container = document.getElementById('wishlist-container');
  if (!container) return;
  const wishlist = getWishlist();

  container.innerHTML = wishlist.length
    ? wishlist.map(item => `
      <div class="wishlist-card">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/200x200'">
        <h4>${item.name}</h4>
        <p>KSh ${item.price.toLocaleString()}</p>
        <div class="wishlist-actions">
          <button class="move-btn" onclick="moveToCart(${item.id})">🛒 Add to Cart</button>
          <button class="remove-btn" onclick="removeFromWishlist(${item.id})">🗑 Remove</button>
        </div>
      </div>
    `).join('')
    : `<p class="empty-msg">💔 No items in your wishlist yet.</p>`;
}

// ✅ Wishlist count
function updateWishlistCount() {
  const countEl = document.getElementById('wishlist-count');
  if (countEl) countEl.textContent = getWishlist().length;
}

// ✅ Cart count
function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (countEl) countEl.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// ✅ Toast notifications
function showToast(msg) {
  let toast = document.getElementById('toast-message');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-message';
    toast.className = 'toast-message';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}
