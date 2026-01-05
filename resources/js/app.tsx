import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Configure Axios to send Sanctum token with every request
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// Add token from localStorage to Authorization header
const token = localStorage.getItem('auth_token');
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add Inertia request interceptor to include Authorization header
router.on('before', (event) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        event.detail.visit.headers = {
            ...event.detail.visit.headers,
            'Authorization': `Bearer ${token}`,
        };
    }
});

// Handle 401 responses - redirect to login
router.on('error', (event) => {
    if (event.detail.errors && event.detail.errors.message === 'Unauthenticated.') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
});

// Verify token validity on app load
const verifyToken = async () => {
    const storedToken = localStorage.getItem('auth_token');
    
    // If no token, skip verification
    if (!storedToken) {
        console.log('No auth token found, skipping verification');
        return;
    }

    console.log('Token found, verifying with backend...');

    try {
        // Create temporary axios instance with token for verification
        const verifyAxios = axios.create({
            baseURL: '/api',
            headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            withCredentials: true,
        });

        // Verify token with backend by calling /api/me
        const response = await verifyAxios.get('/me', {
            timeout: 10000, // 10 second timeout for verification
        });
        
        // Token is valid, ensure it's set in default axios instance
        if (response.data?.user) {
            console.log('Token verified successfully, user:', response.data.user.name);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('auth_token', storedToken); // Re-ensure token is saved
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    } catch (error: any) {
        // Token is invalid or expired
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || error.message;
        console.log(`Token verification failed (${status}):`, errorMsg);
        
        // Clear invalid token and user data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        axios.defaults.headers.common['Authorization'] = '';
    }
};

// Initialize app with token verification
const initializeApp = async () => {
    // Verify token before rendering app
    await verifyToken();

    createInertiaApp({
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            ),
        setup({ el, App, props }) {
            const root = createRoot(el);

            root.render(
                <StrictMode>
                    <App {...props} />
                </StrictMode>,
            );
        },
        progress: {
            color: '#4B5563',
        },
    });

    // Set light / dark mode on load
    initializeTheme();
};

// Start app initialization
initializeApp();
