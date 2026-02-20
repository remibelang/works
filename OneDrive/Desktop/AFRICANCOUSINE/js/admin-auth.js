// Login
document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminName', data.name);
            window.location.href = 'admin-dashboard.html';
        } else {
            document.getElementById('login-error').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('login-error').style.display = 'flex';
    }
});

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        window.location.href = 'admin-login.html';
    }
}

// Check auth on protected pages
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const currentPage = window.location.pathname;
    
    if (!token && currentPage.includes('admin-') && !currentPage.includes('login')) {
        window.location.href = 'admin-login.html';
    }
    
    // Display admin name
    const adminName = localStorage.getItem('adminName');
    if (adminName) {
        const nameElement = document.getElementById('admin-name');
        if (nameElement) nameElement.textContent = adminName;
    }
}

// Toggle password visibility
function togglePassword() {
    const password = document.getElementById('password');
    const icon = document.querySelector('.toggle-password i');
    
    if (password.type === 'password') {
        password.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        password.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', checkAuth);