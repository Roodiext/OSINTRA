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

// Add token from localStorage to Authorization header IMMEDIATELY
const initToken = localStorage.getItem('auth_token');
if (initToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${initToken}`;
    console.log('🔐 Initial token set from localStorage');
}

// Add Inertia request interceptor to include Authorization header
router.on('before', (event) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        event.detail.visit.headers = {
            ...event.detail.visit.headers,
            'Authorization': `Bearer ${token}`,
        };
        console.log('📤 Inertia request with token:', event.detail.visit.url);
    } else {
        console.log('⚠️ Inertia request without token:', event.detail.visit.url);
    }
});

// Handle 401/403 responses - redirect to login
router.on('error', (event) => {
    console.error('❌ Inertia error:', event.detail.errors);

    if (event.detail.errors?.message === 'Unauthenticated.' || (event.detail as any).status === 401) {
        console.log('🚀 Redirecting to login due to 401...');
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
        console.log('🔓 No auth token found, skipping verification');
        return false;
    }

    console.log('🔐 Token found, verifying with backend...');

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
            timeout: 10000, // 10 second timeout
        });

        // Token is valid
        if (response.data?.user) {
            console.log('✅ Token verified successfully, user:', response.data.user.name);

            // Store user and token
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('auth_token', storedToken);

            // Ensure token is in default axios headers
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

            console.log('✅ Auth state restored');
            return true;
        }
        return false;
    } catch (error: any) {
        // Token is invalid or expired
        const status = error.response?.status;
        console.warn(`❌ Token verification failed (${status})`);

        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        axios.defaults.headers.common['Authorization'] = '';

        return false;
    }
};

// Initialize app with token verification
const initializeApp = async () => {
    // First verify token (don't block, just run in parallel)
    verifyToken().catch(err => console.error('Token verification error:', err));

    // Immediately create Inertia app shell
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

    // Update Favicon based on settings
    const updateFavicon = async () => {
        try {
            const response = await axios.get('/api/public-settings');
            const logoUrl = response.data?.site_logo;

            if (logoUrl) {
                const linkIcon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
                const linkApple = document.querySelector("link[rel*='apple-touch-icon']") as HTMLLinkElement;

                if (linkIcon) linkIcon.href = logoUrl;
                if (linkApple) linkApple.href = logoUrl;
            }
        } catch (error) {
            console.error('Failed to update favicon:', error);
        }
    };

    updateFavicon();
};

// Start app initialization
initializeApp().catch(err => console.error('App init error:', err));
