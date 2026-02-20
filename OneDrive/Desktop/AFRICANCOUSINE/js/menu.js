async function loadMenuItems() {
    try {
        const response = await fetch('http://localhost:5000/api/menu');
        const data = await response.json();
        
        const container = document.getElementById('menu-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        data.items.forEach(item => {
            const card = createMenuItemCard(item);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading menu:', error);
    }
}

function createMenuItemCard(item) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
        <img src=".${item.image_path || 'assets/images/placeholder.jpg'}" alt="${item.name}" class="menu-item-image">
        <div class="menu-item-content">
            <div class="menu-item-header">
                <div>
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p class="menu-item-description">${item.description}</p>
                </div>
                <span class="menu-item-price">$${item.price}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id}, '${item.name}', ${item.price}, '.${item.image_path}')">
                <i class="fas fa-cart-plus"></i> Add to Cart
            </button>
        </div>
    `;
    return div;
}

document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});
