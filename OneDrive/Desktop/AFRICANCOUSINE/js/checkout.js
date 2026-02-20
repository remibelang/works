// Checkout and Order Placement

let currentCart = [];
let customerInfo = {
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'cash'
};

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('cart-content')) {
        loadCart();
        setupEventListeners();
    }
});

// Load cart from localStorage and render
function loadCart() {
    currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (currentCart.length === 0) {
        showEmptyCart();
    } else {
        renderCart();
        calculateTotals();
    }
    
    updateCartCount();
}

// Show empty cart state
function showEmptyCart() {
    const cartContent = document.getElementById('cart-content');
    cartContent.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <h2>Your cart is empty</h2>
            <p>Add some delicious African dishes to get started!</p>
            <a href="index.html#menu" class="continue-shopping">
                <i class="fas fa-utensils"></i> Browse Menu
            </a>
        </div>
    `;
    
    // Hide checkout form if visible
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.classList.remove('active');
    }
}

// Render cart items
function renderCart() {
    const cartContent = document.getElementById('cart-content');
    
    let cartHTML = '<div class="cart-items">';
    
    currentCart.forEach((item, index) => {
        cartHTML += `
            <div class="cart-item" data-index="${index}">
                <img src="${item.image_path || './uploads/default-food.jpg'}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>$${parseFloat(item.price).toFixed(2)} each</p>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                <button class="remove-btn" onclick="removeItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    });
    
    cartHTML += '</div>';
    
    // Add cart summary
    cartHTML += `
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal:</span>
                <span id="subtotal">$0.00</span>
            </div>
            <div class="summary-row">
                <span>Tax (8%):</span>
                <span id="tax">$0.00</span>
            </div>
            <div class="summary-row">
                <span>Delivery Fee:</span>
                <span id="delivery-fee">$2.99</span>
            </div>
            <div class="summary-row total">
                <span>Total:</span>
                <span id="total">$0.00</span>
            </div>
            <button id="proceed-checkout-btn" class="checkout-btn">
                <i class="fas fa-credit-card"></i> Proceed to Checkout
            </button>
        </div>
    `;
    
    cartContent.innerHTML = cartHTML;
}

// Calculate and display totals
function calculateTotals() {
    const subtotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const deliveryFee = 2.99;
    const total = subtotal + tax + deliveryFee;
    
    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('delivery-fee').textContent = '$' + deliveryFee.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
    
    return { subtotal, tax, deliveryFee, total };
}

// Update item quantity
function updateQuantity(index, change) {
    currentCart[index].quantity += change;
    
    if (currentCart[index].quantity <= 0) {
        removeItem(index);
        return;
    }
    
    saveCart();
    loadCart();
}

// Remove item from cart
function removeItem(index) {
    currentCart.splice(index, 1);
    saveCart();
    loadCart();
    
    showNotification('Item removed from cart', 'info');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(currentCart));
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const countElements = document.querySelectorAll('.cart-count');
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    
    countElements.forEach(el => {
        el.textContent = totalItems;
    });
}

// Setup event listeners
function setupEventListeners() {
    // Proceed to checkout button
    document.addEventListener('click', function(e) {
        if (e.target.id === 'proceed-checkout-btn' || e.target.closest('#proceed-checkout-btn')) {
            showCheckoutForm();
        }
        
        // Back to cart button
        if (e.target.id === 'back-to-cart-btn' || e.target.closest('#back-to-cart-btn')) {
            hideCheckoutForm();
        }
        
        // Place order button
        if (e.target.id === 'place-order-btn' || e.target.closest('#place-order-btn')) {
            placeOrder();
        }
        
        // Payment method selection
        if (e.target.classList.contains('payment-method') || e.target.closest('.payment-method')) {
            const method = e.target.closest('.payment-method');
            selectPaymentMethod(method);
        }
    });
}

// Show checkout form
function showCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    const cartItems = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (checkoutForm) {
        checkoutForm.classList.add('active');
        if (cartItems) cartItems.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'none';
        
        // Scroll to form
        checkoutForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Hide checkout form (back to cart)
function hideCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    const cartItems = document.querySelector('.cart-items');
    const cartSummary = document.querySelector('.cart-summary');
    
    if (checkoutForm) {
        checkoutForm.classList.remove('active');
        if (cartItems) cartItems.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'block';
    }
}

// Select payment method
function selectPaymentMethod(element) {
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('active');
    });
    element.classList.add('active');
    customerInfo.paymentMethod = element.dataset.method;
}

// Validate customer info
function validateCustomerInfo() {
    const name = document.getElementById('customer-name').value.trim();
    const phone = document.getElementById('customer-phone').value.trim();
    const address = document.getElementById('customer-address').value.trim();
    
    if (!name) {
        showNotification('Please enter your full name', 'error');
        return false;
    }
    
    if (!phone) {
        showNotification('Please enter your phone number', 'error');
        return false;
    }
    
    if (!address) {
        showNotification('Please enter your delivery address', 'error');
        return false;
    }
    
    customerInfo.name = name;
    customerInfo.phone = phone;
    customerInfo.address = address;
    
    return true;
}

// Place order
async function placeOrder() {
    if (!validateCustomerInfo()) {
        return;
    }
    
    if (currentCart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const totals = calculateTotals();
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    // Disable button and show loading
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Placing Order...';
    
    try {
        const orderData = {
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_address: customerInfo.address,
            payment_method: customerInfo.paymentMethod,
            items: currentCart.map(item => ({
                menu_item_id: item.id,
                quantity: item.quantity,
                price_at_time: item.price
            })),
            subtotal: totals.subtotal,
            tax: totals.tax,
            delivery_fee: totals.deliveryFee,
            total: totals.total
        };
        
        const response = await fetch(`${API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Clear cart
            localStorage.removeItem('cart');
            updateCartCount();
            
            // Show success and redirect
            showNotification('Order placed successfully!', 'success');
            
            // Redirect to order confirmation
            setTimeout(() => {
                window.location.href = `order-confirmation.html?order_id=${data.order_id}`;
            }, 1500);
        } else {
            throw new Error(data.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Order error:', error);
        showNotification(error.message || 'Failed to place order. Please try again.', 'error');
        
        // Re-enable button
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<i class="fas fa-check-circle"></i> Place Order';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.cart-notification');
    if (existing) {
        existing.remove();
    }
    
    const notif = document.createElement('div');
    notif.className = 'cart-notification';
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    notif.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);