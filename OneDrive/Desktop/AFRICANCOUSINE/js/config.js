// API Configuration v3 - Prevent redeclaration with IIFE
(function() {
    if (typeof window.API_BASE_URL !== 'undefined') {
        console.log('Config v3 already loaded, skipping...');
        return;
    }
    
    window.API_BASE_URL = (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://mamas-african-taste-api.onrender.com';
    
    console.log('API Base URL:', window.API_BASE_URL);
    
    window.apiCall = async function(endpoint, options) {
        options = options || {};
        var url = window.API_BASE_URL + endpoint;
        var defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        var token = localStorage.getItem('adminToken');
        if (token) {
            defaultOptions.headers['Authorization'] = 'Bearer ' + token;
        }
        var finalOptions = Object.assign({}, defaultOptions, options);
        if (finalOptions.body && typeof finalOptions.body === 'object' && 
            !(finalOptions.body instanceof FormData)) {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }
        try {
            var response = await fetch(url, finalOptions);
            if (response.status === 401) {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                if (window.location.pathname.includes('admin-')) {
                    window.location.href = 'admin-login.html';
                }
            }
            return response;
        } catch (error) {
            console.error('API Call Error:', error);
            throw error;
        }
    };
    
    window.apiCallJson = async function(endpoint, options) {
        var response = await window.apiCall(endpoint, options);
        return response.json();
    };
})();
