// API Configuration - Prevent redeclaration with IIFE
(function() {
    'use strict';
    
    if (typeof window.API_BASE_URL !== 'undefined') {
        console.log('Config already loaded, skipping...');
        return;
    }
    
    window.API_BASE_URL = (window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : 'https://mamas-african-taste-api.onrender.com';
    
    console.log('API Base URL:', window.API_BASE_URL);
    
    window.apiCall = async function(endpoint, options) {
        options = options || {};
        const url = window.API_BASE_URL + endpoint;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const token = localStorage.getItem('adminToken');
        if (token) {
            defaultOptions.headers['Authorization'] = 'Bearer ' + token;
        }
        const finalOptions = Object.assign({}, defaultOptions, options);
        if (finalOptions.body && typeof finalOptions.body === 'object' && 
            !(finalOptions.body instanceof FormData)) {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }
        const response = await fetch(url, finalOptions);
        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            if (window.location.pathname.includes('admin-')) {
                window.location.href = 'admin-login.html';
            }
        }
        return response;
    };
    
    window.apiCallJson = async function(endpoint, options) {
        const response = await window.apiCall(endpoint, options);
        return response.json();
    };
})();
