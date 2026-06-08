// scripts/checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const checkoutCartContainer = document.getElementById('checkout-cart-items');
    const cartTotalEl = document.getElementById('checkout-cart-total');
    const checkoutForm = document.getElementById('checkout-form');

    // 1. Load Items
    renderCheckoutCart();

    // 2. Handle Submit
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }

            const btn = document.getElementById('place-order-btn');
            btn.innerText = "Processing...";
            btn.disabled = true;

            // Gather Address
            const deliveryAddress = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                county: document.getElementById('county').value.trim(),
                town: document.getElementById('town').value.trim(),
                details: document.getElementById('address').value.trim()
            };

            // Calculate Goods Total Only
            const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

            const orderData = {
                userId: 1,
                items: cart,
                deliveryAddress: deliveryAddress,
                paymentMethod: 'pending',
                totalAmount: totalAmount
            };

            // Save order details and redirect to payment page
            localStorage.setItem('pendingOrder', JSON.stringify(orderData));
            window.location.href = 'payment.html';
            btn.innerText = "Place Order";
            btn.disabled = false;
        });
    }

    // --- FREIGHT RANGES ---
    function getFreightRange(category) {
        if(!category) return "300 - 600";
        const cat = category.toLowerCase();
        
        if (cat.includes('bag') && !cat.includes('charm')) return "300 - 600";
        if (cat.includes('perfume')) return "800 - 950";
        if (cat.includes('watch')) return "500 - 1000";
        if (cat.includes('shoe')) return "300 - 600";
        if (cat.includes('apparel') || cat.includes('cloth')) return "200 - 500";
        if (cat.includes('sunglass') || cat.includes('glass')) return "200 - 400";
        if (cat.includes('charm')) return "100 - 200";
        
        return "300 - 600";
    }

    function renderCheckoutCart() {
        const cart = getCart();
        checkoutCartContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            checkoutCartContainer.innerHTML = `<p>Your cart is empty.</p>`;
            if (cartTotalEl) cartTotalEl.textContent = `Ksh 0.00`;
            return;
        }

        cart.forEach(item => {
            const price = parseFloat(item.price) || 0;
            total += price * item.quantity;
            
            const range = getFreightRange(item.category || '');
            const variantText = item.variant ? ` <span style="font-size:12px; color:#777;">(${item.variant})</span>` : '';

            const card = document.createElement('div');
            card.style.cssText = "display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; border-bottom: 1px solid #eee; padding-bottom: 10px;";
            
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; object-fit: cover; border-radius: 4px;" onerror="this.src='https://placehold.co/60x60'">
                <div style="width:100%">
                    <h4 style="margin:0; font-size:14px;">${item.name} ${variantText}</h4>
                    <p style="margin:5px 0 0 0; font-weight:bold; color:#D4AF37;">Ksh ${price.toLocaleString()} x ${item.quantity}</p>
                    <div style="background:#f9f9f9; padding:5px; border-radius:4px; margin-top:5px; font-size:11px; color:#555;">
                        🚢 Est. Freight: <strong>${range} KSh</strong> (Pay on Arrival)
                    </div>
                </div>
            `;
            checkoutCartContainer.appendChild(card);
        });

        if (cartTotalEl) {
            cartTotalEl.innerHTML = `
                <div style="font-size:12px; color:#666; font-weight:normal;">Goods Total:</div>
                <div>Ksh ${total.toLocaleString()}</div>
            `;
        }
    }
});

function getCart() {
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.id) {
            return JSON.parse(localStorage.getItem(`cart_${user.id}`)) || [];
        }
    } catch(e) {}
    return JSON.parse(localStorage.getItem('cart_guest')) || [];
}

function showToast(msg) {
    let toast = document.getElementById('toast-message');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-message';
        toast.style.cssText = "position: fixed; bottom: 20px; right: 20px; background-color: #333; color: #D4AF37; padding: 12px 24px; border-radius: 4px; z-index: 9999;";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
