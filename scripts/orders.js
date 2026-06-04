// scripts/orders.js - WITH USER AUTHENTICATION

document.addEventListener('DOMContentLoaded', () => {
    console.log('Orders page loaded');
    checkAuthAndLoadOrders();
});

function checkAuthAndLoadOrders() {
    let currentUser = null;
    
    const possibleKeys = ['currentUser', 'user', 'loggedInUser', 'authUser'];
    
    for (const key of possibleKeys) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed && (parsed.id || parsed.userId || parsed.user_id)) {
                    currentUser = parsed;
                    break;
                }
            }
        } catch (e) {
            console.log('Error parsing', key, e);
        }
    }
    
    if (!currentUser) {
        alert('Please login to view your orders');
        window.location.href = 'login.html';
        return;
    }
    
    const userName = currentUser.name || currentUser.username || currentUser.email || 'User';
    
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${userName}`;
    }
    
    // ✅ No longer passing userId — token handles it
    loadOrders();
}

async function loadOrders() {
    const ordersContainer = document.getElementById('orders-container');
    
    if (!ordersContainer) {
        console.error('ERROR: orders container not found!');
        return;
    }

    ordersContainer.innerHTML = '<p style="text-align:center; padding:20px;">Loading your order history...</p>';

    try {
        // ✅ Send token instead of userId
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        const response = await fetch(`https://luxury-backend-qtck.onrender.com/api/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);

        if (data.success) {
            if (data.orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div style="text-align:center; padding:40px; border:1px solid #eee; border-radius:8px; background:#fff;">
                        <h3>No orders found</h3>
                        <p>You haven't placed any orders yet.</p>
                        <a href="categories.html" style="color:#D4AF37; font-weight:bold; text-decoration:none;">Start Shopping</a>
                    </div>`;
                return;
            }
            renderOrders(data.orders, ordersContainer);
        } else {
            ordersContainer.innerHTML = '<p style="color:red; text-align:center;">Failed to load orders.</p>';
        }
    } catch (error) {
        console.error("Error loading orders:", error);
        ordersContainer.innerHTML = `
            <p style="color:red; text-align:center;">
                Error: ${error.message}
            </p>`;
    }
}

function renderOrders(orders, container) {
    console.log('Rendering', orders.length, 'orders');
    container.innerHTML = '';

    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

        const orderDate = new Date(order.created_at);
        const dateString = orderDate.toLocaleDateString();

        const minDate = new Date(orderDate);
        minDate.setDate(minDate.getDate() + 28);
        const maxDate = new Date(orderDate);
        maxDate.setDate(maxDate.getDate() + 56);
        const deliveryString = `${minDate.toDateString()} - ${maxDate.toDateString()}`;

        let orderItems = [];
        try {
            if (typeof order.items === 'string') {
                orderItems = JSON.parse(order.items);
            } else if (Array.isArray(order.items)) {
                orderItems = order.items;
            }
        } catch(e) {
            console.error('Error parsing items:', e);
        }

        const itemsHTML = orderItems.map(item => {
            let imgSrc = item.image || 'https://placehold.co/60x60';
            return `
                <div class="order-item" style="display:flex; gap:10px; margin-bottom:10px; padding:10px; background:#f9f9f9; border-radius:4px;">
                    <img src="${imgSrc}" alt="${item.name}" 
                         style="width:60px; height:60px; object-fit:cover; border-radius:4px;" 
                         onerror="this.src='https://placehold.co/60x60'">
                    <div class="order-item-details">
                        <h4 style="margin:0; font-size:14px;">${item.name}</h4>
                        <p style="margin:0; color:#666; font-size:12px;">
                            ${item.variant ? item.variant + ' | ' : ''} 
                            Ksh ${Number(item.price).toLocaleString()} x ${item.quantity}
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        const stages = ['pending', 'shipped', 'delivered'];
        const currentStageIndex = stages.indexOf(order.status.toLowerCase());
        const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 0;
        
        const progressHTML = stages.map((stage, index) => {
            const isActive = index <= activeIndex;
            const style = isActive 
                ? 'background:#D4AF37; border-color:#D4AF37; color:white;' 
                : 'background:#eee; border-color:#ddd; color:#999;';
            return `<div class="progress-step" style="${style} width:25px; height:25px; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:12px; border:2px solid;">${index+1}</div>`;
        }).join('<div style="flex:1; height:2px; background:#ddd; margin:0 5px;"></div>');

        const orderNum = order.orderNumber || order.order_number;
        const totalAmt = order.totalAmount || order.total_amount;

        orderCard.innerHTML = `
            <div class="order-header" style="display:flex; justify-content:space-between; margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #eee;">
                <span style="font-weight:bold;">Order #${orderNum}</span>
                <span style="color:#D4AF37; text-transform:uppercase; font-weight:bold; font-size:12px;">${order.status}</span>
            </div>
            <div style="font-size:12px; color:#777; margin-bottom:15px;">Placed: ${dateString}</div>
            <div class="order-items">${itemsHTML}</div>
            <div class="order-footer">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px; margin-top:15px;">
                    <span>Total Goods:</span>
                    <span style="font-weight:bold; font-size:16px;">Ksh ${Number(totalAmt).toLocaleString()}</span>
                </div>
                <div style="font-size:12px; color:#555; margin-bottom:15px;">
                    <strong>Est. Delivery:</strong> <span style="color:#D4AF37;">${deliveryString} (4-8 Weeks)</span>
                </div>
                <div class="progress-container" style="display:flex; align-items:center; margin:15px 0;">
                    ${progressHTML}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; margin-top:5px; text-transform:uppercase; color:#666;">
                    <span>Pending</span><span>Shipped</span><span>Delivered</span>
                </div>
            </div>
        `;
        container.appendChild(orderCard);
    });
}
