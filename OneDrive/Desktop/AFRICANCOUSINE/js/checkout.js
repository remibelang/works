// Checkout functionality

function calculateTotals() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const deliveryFee = 2.99;
    const total = subtotal + tax + deliveryFee;
    return { subtotal, tax, deliveryFee, total };
}

function displayTotals() {
    const totals = calculateTotals();
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.textContent = '$' + totals.subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = '$' + totals.tax.toFixed(2);
    if (totalEl) totalEl.textContent = '$' + totals.total.toFixed(2);
}

document.getElementById('place-order-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const name = document.getElementById('customer-name').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';

    if (!name || !phone || !address) {
        alert('Please fill in all required fields');
        return;
    }

    const totals = calculateTotals();
    const orderData = {
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        items: cart,
        total: totals.total.toFixed(2),
        payment_method: paymentMethod
    };

    try {
        const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        
        if (result.success) {
            localStorage.removeItem('cart');
            alert('Order placed successfully! Order #' + result.order_id);
            window.location.href = 'index.html';
        } else {
            alert('Failed to place order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Network error');
    }
});

document.addEventListener('DOMContentLoaded', displayTotals);
