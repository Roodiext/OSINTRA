import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
});

// Add auth token to ALL requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Token added to request:', config.url);
    }
    return config;
});

// Handle auth errors and token issues
api.interceptors.response.use(
    (response) => {
        console.log('✅ Request successful:', response.config.url);
        return response;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message;
        
        if (status === 401) {
            console.warn('❌ Unauthorized (401) - Clearing auth and redirecting to login');
            console.warn('   Message:', message);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth_verified');
            window.location.href = '/login';
        } else if (status === 403) {
            console.warn('❌ Forbidden (403) - Access denied');
        } else if (status === 500) {
            console.error('❌ Server error (500)', message);
        }
        
        return Promise.reject(error);
    }
);

export default api;
