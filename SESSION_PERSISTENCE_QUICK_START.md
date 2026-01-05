# 🔐 Session Persistence - Quick Reference

## Masalah Anda
> "Ketika refresh `/dashboard`, redirect ke `/login`. Ingin tetap login setelah refresh."

## Solusi ✅
Token-based authentication sudah diimplementasikan. Perbaikan dilakukan:

1. **Enhanced Token Verification** - Lebih robust
2. **Better Logging** - Untuk debugging
3. **Improved Error Handling** - Lebih clear

---

## Cepat Test (2 menit)

### 1. Clear Old Tokens
```bash
php artisan tinker
> DB::table('personal_access_tokens')->delete()
> exit()
```

### 2. Login & Check Console
- Open `http://localhost:8000/login`
- Press `F12 → Console`
- Login
- Lihat output: `Token verified successfully, user: [name]`

### 3. Refresh Page
- Press `F5`
- **Expected**: Tetap di `/dashboard` (bukan redirect ke login)

---

## How It Works

```
LOGIN
  ↓
POST /api/login (username, password)
  ↓
Backend creates token
  ↓
Response: { token: "abc123...", user: {...} }
  ↓
Frontend saves to localStorage['auth_token']
  ↓
Set Authorization header: Bearer abc123...
  ↓
Redirect to /dashboard
  ↓
---
  ↓
PAGE REFRESH
  ↓
app.tsx reads localStorage['auth_token']
  ↓
Verify token: GET /api/me with Bearer header
  ↓
Token valid? YES ✓
  ↓
Stay logged in on /dashboard
```

---

## Files Changed

| File | What Changed |
|------|-------------|
| `resources/js/app.tsx` | Better token verification |
| `resources/js/pages/LoginPage.tsx` | Added debugging logs |
| `app/Http/Middleware/InertiaAuth.php` | Added auth logs |
| `app/Http/Controllers/Api/AuthController.php` | Added response logs |

---

## Debugging Tips

### Check Token Saved
```javascript
// F12 Console:
localStorage.getItem('auth_token')  // Should show long string
```

### Check API Response
```bash
# Terminal:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/me | jq
# Should return user data (200)
```

### Check Server Logs
```bash
tail -f storage/logs/laravel.log
# Should show successful auth checks
```

---

## Expected Behavior ✅

| Action | Result |
|--------|--------|
| Login | Token created, saved to localStorage |
| Refresh | Token verified, stay logged in |
| Logout | Token revoked, localStorage cleared |
| Visit `/login` while logged in | (Optional: redirect to `/dashboard`) |

---

## If Still Not Working

1. ❌ **Check**: Is `/api/me` returning 200?
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/me
   ```

2. ❌ **Check**: Is token saved in localStorage?
   ```javascript
   localStorage.getItem('auth_token')
   ```

3. ❌ **Check**: Does personal_access_tokens table have data?
   ```bash
   php artisan tinker
   > DB::table('personal_access_tokens')->get()
   ```

---

## Full Documentation

- **[SESSION_PERSISTENCE_FIX_CHECKLIST.md](SESSION_PERSISTENCE_FIX_CHECKLIST.md)** - Complete checklist
- **[SESSION_PERSISTENCE_VERIFICATION.md](SESSION_PERSISTENCE_VERIFICATION.md)** - Step-by-step verification
- **[SESSION_PERSISTENCE_DEBUGGING.md](SESSION_PERSISTENCE_DEBUGGING.md)** - Debugging guide

---

## Architecture

```
Frontend (React)          |  Backend (Laravel)
                          |
Login Form       -------->| AuthController@login
                          | - Validate credentials
                          | - Create token
localStorage['auth_token']| - Return { token, user }
                <---------|
   Page Refresh           |
   App.tsx checks token   |
   GET /api/me    ------->| AuthController@me
   Authorization header   | - Validate token
                <---------|  - Return user
   Valid? YES             |
   Stay Logged In ✓       |
```

---

## Key Points

✅ **Stateless** - No server-side sessions  
✅ **Token-based** - Uses Sanctum tokens  
✅ **Secure** - Bearer token in Authorization header  
✅ **Mobile-friendly** - Works with apps too  
✅ **Multi-device** - Tokens are unique per device  

---

**Status**: ✅ Fixed - Ready to test  
**Last Updated**: January 4, 2026

Need help? Check the full docs in the markdown files above.
