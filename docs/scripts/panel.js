function updateStatus() {
  const orderId = document.getElementById('orderId').value;
  const newStatus = document.getElementById('statusUpdate').value;
  alert(`Order ${orderId} updated to: ${newStatus}`);
}
