# Session Persistence - Step-by-Step Verification

## Apa yang Sudah Diperbaiki

### 1. **Enhanced Token Verification** (`resources/js/app.tsx`)
- ✅ Timeout diperpanjang 5 → 10 detik
- ✅ Menambahkan console logging untuk debugging
- ✅ Re-ensure token di localStorage

### 2. **Improved Middleware** (`app/Http/Middleware/InertiaAuth.php`)
- ✅ Detailed logging untuk setiap auth attempt
- ✅ Helpful error messages

### 3. **Better Login Flow** (`resources/js/pages/LoginPage.tsx`)
- ✅ Console logs di setiap step
- ✅ Verify token saved sebelum navigate

### 4. **Enhanced Auth Controller** (`app/Http/Controllers/Api/AuthController.php`)
- ✅ Logging di `/api/me` endpoint

---

## Quick Test (Copy-Paste Commands)

### Terminal: Clear Database Tokens
```bash
# Stop server dulu (Ctrl+C)

# Clear all tokens
php artisan tinker
> DB::table('personal_access_tokens')->delete()
> exit()

# Start server kembali
php artisan serve
```

### Browser: Test Login Flow
1. Open DevTools: `F12`
2. Go to Console tab
3. Navigate to `http://localhost:8000/login` (or your URL)
4. Login dengan credentials Anda

**Expected Console Output:**
```
✓ Login response received: {hasToken: true, userName: "...", userId: 1}
✓ Token saved to localStorage
✓ Authorization header set
✓ User data saved to localStorage
✓ Navigating to /dashboard...
✓ Token found, verifying with backend...
✓ Token verified successfully, user: [nama user]
```

### Browser: Test Refresh
1. After login, you should be on `/dashboard`
2. Press `F5` (refresh)

**Expected Behavior:**
- ✅ Console shows "Token verified successfully"
- ✅ Stay di `/dashboard` (tidak redirect ke `/login`)
- ✅ Dashboard data loaded

---

## If Still Not Working - Advanced Debugging

### Check 1: localStorage is being saved
```javascript
// Paste in console (F12 → Console tab):
console.log('auth_token:', localStorage.getItem('auth_token'));
console.log('user:', localStorage.getItem('user'));
```

**Expected**: Both should have values (not empty/null)

---

### Check 2: Network call to /api/me is successful
```javascript
// Paste in console:
fetch('/api/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
})
.then(r => r.json())
.then(data => console.log('Success:', data))
.catch(e => console.log('Error:', e))
```

**Expected**: Response includes `{user: {...}}`  
**If Error**: Check server logs: `tail -f storage/logs/laravel.log`

---

### Check 3: Database token is valid
```bash
# SSH ke server / terminal
mysql -u root -p [database_name]

# Lalu:
SELECT id, user_id, name, created_at, last_used_at 
FROM personal_access_tokens 
WHERE user_id = 1;
```

**Expected**: 
- ✅ Ada row dengan `name = 'auth-token'`
- ✅ `last_used_at` tidak null (token pernah digunakan)

If empty, token tidak tersimpan di database. Ini berarti `createToken()` gagal.

---

### Check 4: Server logs
```bash
tail -f storage/logs/laravel.log

# Saat refresh /dashboard, cari:
# ✓ "InertiaAuth: User authenticated"
# ✗ "InertiaAuth: User not authenticated"
```

---

## Common Issues & Solutions

### ❌ Issue: "Token not found" after login
**Cause**: Login endpoint tidak return token

**Fix**:
```php
// Verify di app/Http/Controllers/Api/AuthController.php login()
// Harus ada:
$token = $user->createToken('auth-token')->plainTextToken;
return response()->json([
    'user' => $user->load(['role', 'position']),
    'token' => $token,  // ← MUST BE HERE
]);
```

---

### ❌ Issue: Refresh shows blank page then redirect to /login
**Cause**: Token expired atau tidak valid

**Possible Fixes**:
1. Delete all tokens:
```bash
php artisan tinker
> DB::table('personal_access_tokens')->delete()
> exit()
```

2. Check token lifetime in `config/sanctum.php`:
```php
'expiration' => null,  // Never expires (set to null)
```

---

### ❌ Issue: Console shows error "Token verification failed"
**Cause**: `/api/me` returning 401

**Debug Steps**:
1. Verify token exists: `localStorage.getItem('auth_token')`
2. Verify token in DB: `SELECT * FROM personal_access_tokens`
3. Check middleware stack in `routes/api.php`

---

## File Changes Summary

| File | Change | Status |
|------|--------|--------|
| `resources/js/app.tsx` | Enhanced token verification + logging | ✅ |
| `resources/js/pages/LoginPage.tsx` | Added console logs | ✅ |
| `app/Http/Middleware/InertiaAuth.php` | Added detailed logging | ✅ |
| `app/Http/Controllers/Api/AuthController.php` | Added logging to me() | ✅ |

---

## Expected Behavior After Fix

### ✅ User Login
1. User logs in dengan username/password
2. Token created di `personal_access_tokens` table
3. Token saved di localStorage
4. Redirect ke `/dashboard`
5. User melihat dashboard

### ✅ User Refresh Page
1. Browser refresh pada `/dashboard`
2. app.tsx calls `verifyToken()`
3. Calls `/api/me` with token
4. Backend validates token ✓
5. User stays on `/dashboard`
6. No redirect to `/login`

### ✅ User Logout
1. User clicks logout
2. Token revoked di database
3. localStorage cleared
4. Redirect ke `/login`
5. Subsequent access to `/dashboard` requires login

---

## Performance Notes

- Token verification timeout: 10 detik (bisa less jika API fast)
- No extra database calls (menggunakan token yang sudah di-cache)
- Session data tidak disimpan di server (stateless)

---

**Status**: ✅ Fixed with debugging tools  
**Last Updated**: January 4, 2026  
**If issues persist**: Check logs and follow Advanced Debugging section
