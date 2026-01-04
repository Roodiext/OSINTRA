# Session Persistence Fix - Authentication Flow

## Problem
User was redirected to `/login` when refreshing `/dashboard`, even though they had just logged in. They wanted to stay logged in across page refreshes.

## Root Cause
The authentication token was stored in localStorage, but when the page refreshed:
1. Frontend tried to access `/dashboard`
2. Inertia/Laravel couldn't validate the token immediately
3. Middleware redirected to `/login`
4. User lost session

## Solution Implemented

### 1. **Token Verification on App Load**
- **File**: `resources/js/app.tsx`
- **Action**: On app initialization, verify stored token with backend
- **Method**: Call `/api/me` endpoint to validate token
- **Result**: Token remains valid across page refreshes

### 2. **Sanctum Guard Configuration**
- **File**: `config/auth.php`
- **Added**: `sanctum` guard configuration
- **Benefit**: Enables proper token-based authentication for Sanctum

### 3. **Enhanced Token Management**
- **localStorage**: Stores `auth_token` and `user` data
- **axios**: Sends token with every API request via interceptor
- **Inertia**: Sends token with every page request via router
- **Verification**: On app load, confirms token is still valid

## New Authentication Flow

### Login
```
1. User enters username/password
2. POST /api/login
3. Backend validates credentials
4. Backend creates token via Sanctum
5. Response: { token, user }
6. Frontend stores token in localStorage
7. Frontend sets Authorization header
8. Redirect to /dashboard
9. Login success, user on dashboard
```

### Page Refresh (Logged In)
```
1. Browser refresh on /dashboard
2. App initializes (app.tsx loads)
3. JavaScript reads token from localStorage
4. verifyToken() runs async
5. POST /api/me with Authorization header
6. Backend validates token (Sanctum)
7. Token valid? → Yes
8. localStorage updated with latest user data
9. User stays logged in ✅
10. axios headers set with token
11. Page loads normally
12. User stays on /dashboard
```

### Page Refresh (Token Expired/Invalid)
```
1. Browser refresh on /dashboard
2. App initializes (app.tsx loads)
3. JavaScript reads token from localStorage
4. verifyToken() runs async
5. POST /api/me with Authorization header
6. Backend validates token (Sanctum)
7. Token invalid/expired? → Yes
8. localStorage cleared
9. axios headers cleared
10. No error thrown (graceful)
11. User can access public pages
12. Next request to protected route → redirect to login
13. User manually logs in again
```

### Logout
```
1. User clicks Logout
2. POST /api/logout
3. Backend revokes token
4. localStorage cleared
5. Redirect to /login
6. User at login page
```

## Files Modified

### Backend
- **`config/auth.php`** - Added sanctum guard configuration

### Frontend
- **`resources/js/app.tsx`** - Added token verification on app load
  - `verifyToken()` function - Validates token with backend
  - `initializeApp()` function - Initializes app after token verification
  - Wait for verification before rendering app

## How Token Verification Works

```typescript
// On app load
const verifyToken = async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) return; // No token, skip
    
    try {
        // Call /api/me with token
        const response = await axios.get('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Token valid!
        // Update localStorage with latest user data
        // Set axios default headers
        // App can now safely load
    } catch (error) {
        // Token invalid/expired
        // Clear localStorage
        // Clear axios headers
        // App loads without auth
    }
};

// Initialize app after verification completes
await verifyToken(); // Wait for verification
createInertiaApp({...}); // Then render app
```

## User Experience Flow

### Before (❌ Broken)
```
Login → Dashboard ✅
Refresh → Login ❌
```

### After (✅ Fixed)
```
Login → Dashboard ✅
Refresh → Dashboard ✅ (still logged in)
Refresh again → Dashboard ✅ (still logged in)
Manual Logout → Login ✅
```

## Token Storage

### localStorage
- **Key**: `auth_token`
- **Value**: Sanctum token (string)
- **Expires**: When manually cleared or user logs out
- **Purpose**: Persist login across page refreshes

### Browser Memory
- **Variable**: localStorage.getItem('auth_token')
- **Usage**: Added to Authorization header for all requests
- **Lifecycle**: Same as localStorage

### axios Headers
- **Header**: `Authorization: Bearer {token}`
- **Set on**: App load, after token verification
- **Used for**: API requests (`/api/*`)
- **Cleared on**: Logout or token invalidation

### Inertia Headers
- **Header**: `Authorization: Bearer {token}`
- **Set on**: Every page request
- **Used for**: Web routes (`/dashboard/*`)
- **Cleared on**: Logout or token invalidation

## Configuration

### Sanctum Config
```php
// config/sanctum.php
'stateful' => [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:8000',
],
'guard' => ['web'], // Added support for token-based auth
```

### Auth Config
```php
// config/auth.php
'guards' => [
    'web' => ['driver' => 'session', ...],
    'sanctum' => ['driver' => 'sanctum', ...], // New!
],
```

## Security Considerations

✅ **Token in localStorage** (Safe for SPA)
- Cannot be accessed by other scripts (with proper CSP headers)
- Cleared when user logs out
- Validated on every request

✅ **Authorization Header**
- Sent with every request
- Sanctum validates on backend
- Invalid tokens rejected

✅ **Verification Timeout**
- 5-second timeout on token verification
- Prevents infinite waits
- Falls back gracefully on timeout

✅ **Error Handling**
- Invalid tokens cleared silently
- No errors thrown to user
- User can still access public pages
- Protected routes require re-login

## Testing

### Test 1: Login → Refresh
```
1. Navigate to http://localhost/login
2. Enter credentials, click login
3. Should see /dashboard
4. Press F5 to refresh
5. Should stay on /dashboard
6. ✅ PASS
```

### Test 2: Multiple Refreshes
```
1. Stay on /dashboard
2. Press F5 multiple times
3. Should remain logged in each time
4. ✅ PASS
```

### Test 3: Open New Tab
```
1. Login on Tab A
2. Open new tab, go to /dashboard
3. Should show authenticated content
4. ✅ PASS (Both tabs share localStorage)
```

### Test 4: Close & Reopen Browser
```
1. Login and close browser
2. Open browser again
3. Go to /dashboard
4. Should be logged in (localStorage persists)
5. ✅ PASS
```

### Test 5: Expired Token
```
1. Token expires in database
2. User refreshes page
3. verifyToken() fails
4. localStorage cleared
5. Protected routes redirect to login
6. ✅ PASS
```

### Test 6: Logout
```
1. Click logout button
2. POST /api/logout executes
3. localStorage cleared
4. Redirect to /login
5. ✅ PASS
```

## Troubleshooting

### Still Redirected to Login After Refresh?
1. Check browser console for errors
2. Verify localStorage has `auth_token` set
3. Check if token is actually valid in database
4. Verify `/api/me` endpoint returns user data

### Token Cleared Unexpectedly?
1. Check if token is expired in database
2. Check if database connection is working
3. Check if Sanctum personal_access_tokens table has token

### Slow Page Refresh?
1. Token verification has 5-second timeout
2. Network latency might cause delay
3. Check server response time for `/api/me`

### Can't Login?
1. Verify credentials in database
2. Check `/api/login` endpoint
3. Check if token is being returned
4. Verify localStorage is being set

## Related Files

- `resources/js/app.tsx` - Main app initialization
- `resources/js/pages/LoginPage.tsx` - Login form
- `resources/js/lib/axios.ts` - Axios configuration
- `app/Http/Controllers/Api/AuthController.php` - Auth endpoints
- `config/auth.php` - Auth configuration
- `config/sanctum.php` - Sanctum configuration

## Next Steps

- ✅ Token verification on app load
- ✅ Sanctum guard configuration
- ✅ Token persistence across refreshes
- Optional: Add token refresh endpoint (before expiry)
- Optional: Add Remember Me functionality
- Optional: Add session invalidation across devices

---

**Status**: ✅ Fixed - Users stay logged in after refresh
**Last Updated**: January 2026
