// seller-orders.js — Orders & Payments tabs for Seller Dashboard

const BASE = 'https://luxury-backend-qtck.onrender.com/api';

function getToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

// ── Tab switching ──────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');

    if (btn.dataset.tab === 'orders' && !window._ordersLoaded) loadAllOrders();
    if (btn.dataset.tab === 'payments' && !window._paymentsLoaded) loadPayments();
  });
});

// ── Fetch all orders (admin endpoint) ─────────────────────────
let allOrders = [];

async function loadAllOrders() {
  const wrap = document.getElementById('ordersTableWrap');
  wrap.innerHTML = '<div class="state-msg">Loading orders…</div>';

  try {
    const res = await fetch(`${BASE}/admin/orders`, { headers: authHeaders() });
    const data = await res.json();

    if (!data.success) throw new Error(data.message || 'Failed');

    allOrders = data.orders || [];
    window._ordersLoaded = true;
    renderOrderStats(allOrders);
    renderOrdersTable(allOrders);

    // Live search
    document.getElementById('orderSearch').addEventListener('input', function () {
      const q = this.value.toLowerCase();
      const filtered = allOrders.filter(o =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        String(o.order_number || o.orderNumber || o.id).includes(q)
      );
      renderOrdersTable(filtered);
    });

  } catch (err) {
    console.error(err);
    wrap.innerHTML = `<div class="state-msg" style="color:#ef4444;">❌ ${err.message}<br><small>Make sure you are logged in as Admin/Seller.</small></div>`;
  }
}

function renderOrderStats(orders) {
  const pending   = orders.filter(o => o.status === 'pending').length;
  const shipped   = orders.filter(o => o.status === 'shipped').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const revenue   = orders.reduce((s, o) => s + Number(o.total_amount || o.totalAmount || 0), 0);

  document.getElementById('statTotal').textContent     = orders.length;
  document.getElementById('statPending').textContent   = pending;
  document.getElementById('statShipped').textContent   = shipped;
  document.getElementById('statDelivered').textContent = delivered;
  document.getElementById('statRevenue').textContent   = revenue.toLocaleString();
}

function renderOrdersTable(orders) {
  const wrap = document.getElementById('ordersTableWrap');

  if (!orders.length) {
    wrap.innerHTML = '<div class="state-msg">No orders found.</div>';
    return;
  }

  const rows = orders.map(o => {
    const orderNum  = o.order_number || o.orderNumber || o.id;
    const customer  = o.customer_name || o.name || '—';
    const email     = o.customer_email || o.email || '—';
    const phone     = o.customer_phone || o.phone || '—';
    const total     = Number(o.total_amount || o.totalAmount || 0).toLocaleString();
    const date      = o.created_at ? new Date(o.created_at).toLocaleDateString() : '—';
    const status    = (o.status || 'pending').toLowerCase();
    const badgeCls  = `badge badge-${status}`;

    // Parse items
    let items = [];
    try { items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []); } catch(e) {}
    const itemsHTML = items.map(i =>
      `<div style="padding:3px 0;">• ${i.name || 'Item'} × ${i.quantity || 1} — KSh ${Number(i.price || 0).toLocaleString()}</div>`
    ).join('') || '<div style="color:#9ca3af;">No item details</div>';

    return `
      <tr>
        <td><strong>#${orderNum}</strong></td>
        <td>
          <div style="font-weight:600;">${customer}</div>
          <div style="font-size:11px;color:#6b7280;">${email}</div>
          <div style="font-size:11px;color:#6b7280;">${phone}</div>
        </td>
        <td>KSh ${total}</td>
        <td><span class="${badgeCls}">${status}</span></td>
        <td>
          <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">
            <option value="pending"   ${status==='pending'   ? 'selected':''}>Pending</option>
            <option value="shipped"   ${status==='shipped'   ? 'selected':''}>Shipped</option>
            <option value="delivered" ${status==='delivered' ? 'selected':''}>Delivered</option>
            <option value="cancelled" ${status==='cancelled' ? 'selected':''}>Cancelled</option>
          </select>
        </td>
        <td>${date}</td>
        <td>
          <button class="expand-btn" onclick="toggleItems(this)">🧾 Items</button>
          <div class="order-items-detail">${itemsHTML}</div>
        </td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Status</th>
          <th>Update Status</th>
          <th>Date</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

window.toggleItems = function(btn) {
  const detail = btn.nextElementSibling;
  detail.classList.toggle('open');
  btn.textContent = detail.classList.contains('open') ? '🔼 Hide' : '🧾 Items';
};

window.updateOrderStatus = async function(orderId, newStatus) {
  try {
    const res = await fetch(`${BASE}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      // Update local array and re-render stats
      const order = allOrders.find(o => o.id === orderId);
      if (order) order.status = newStatus;
      renderOrderStats(allOrders);
      showToast('✅ Status updated');
    } else {
      showToast('❌ ' + (data.message || 'Update failed'), true);
    }
  } catch (err) {
    showToast('❌ Server error', true);
  }
};

// ── Payments tab ───────────────────────────────────────────────
async function loadPayments() {
  const wrap = document.getElementById('paymentsTableWrap');
  wrap.innerHTML = '<div class="state-msg">Loading payments…</div>';

  try {
    // Reuse admin/orders — payment info is on each order
    let orders = allOrders;
    if (!orders.length) {
      const res = await fetch(`${BASE}/admin/orders`, { headers: authHeaders() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed');
      orders = data.orders || [];
    }
    window._paymentsLoaded = true;
    renderPaymentStats(orders);
    renderPaymentsTable(orders);

    document.getElementById('paySearch').addEventListener('input', function () {
      const q = this.value.toLowerCase();
      const filtered = orders.filter(o =>
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        String(o.order_number || o.id).includes(q) ||
        (o.payment_method || '').toLowerCase().includes(q)
      );
      renderPaymentsTable(filtered);
    });

  } catch (err) {
    console.error(err);
    wrap.innerHTML = `<div class="state-msg" style="color:#ef4444;">❌ ${err.message}</div>`;
  }
}

function renderPaymentStats(orders) {
  const paid   = orders.filter(o => o.payment_status === 'paid' || o.paymentStatus === 'paid');
  const unpaid = orders.filter(o => o.payment_status !== 'paid' && o.paymentStatus !== 'paid');
  const total  = paid.reduce((s, o) => s + Number(o.total_amount || o.totalAmount || 0), 0);

  document.getElementById('payStatTotal').textContent  = total.toLocaleString();
  document.getElementById('payStatPaid').textContent   = paid.length;
  document.getElementById('payStatUnpaid').textContent = unpaid.length;
}

function renderPaymentsTable(orders) {
  const wrap = document.getElementById('paymentsTableWrap');
  if (!orders.length) {
    wrap.innerHTML = '<div class="state-msg">No records found.</div>';
    return;
  }

  const rows = orders.map(o => {
    const orderNum  = o.order_number || o.orderNumber || o.id;
    const customer  = o.customer_name || o.name || '—';
    const email     = o.customer_email || o.email || '—';
    const total     = Number(o.total_amount || o.totalAmount || 0).toLocaleString();
    const date      = o.created_at ? new Date(o.created_at).toLocaleDateString() : '—';
    const payStatus = o.payment_status || o.paymentStatus || 'unpaid';
    const method    = o.payment_method || o.paymentMethod || 'M-Pesa';
    const ref       = o.payment_reference || o.paymentReference || '—';
    const badgeCls  = payStatus === 'paid' ? 'badge badge-paid' : 'badge badge-unpaid';

    return `
      <tr>
        <td><strong>#${orderNum}</strong></td>
        <td>
          <div style="font-weight:600;">${customer}</div>
          <div style="font-size:11px;color:#6b7280;">${email}</div>
        </td>
        <td>KSh ${total}</td>
        <td>${method}</td>
        <td><code style="font-size:11px;">${ref}</code></td>
        <td><span class="${badgeCls}">${payStatus}</span></td>
        <td>${date}</td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Method</th>
          <th>Reference</th>
          <th>Payment Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── Toast notification ─────────────────────────────────────────
function showToast(msg, isError = false) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${isError ? '#ef4444' : '#065f46'};
    color:white; padding:10px 20px; border-radius:8px;
    font-size:14px; font-weight:600; box-shadow:0 4px 14px rgba(0,0,0,0.2);
    animation: fadeIn 0.3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}
