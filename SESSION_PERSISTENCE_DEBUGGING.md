# Session Persistence Debugging Guide

## Masalah
Ketika refresh page `/dashboard`, user diarahkan kembali ke `/login`.

## Root Cause
Token authentication tidak tersimpan dengan baik atau tidak divalidasi dengan benar saat refresh.

## Solusi yang Sudah Diterapkan

### 1. Enhanced Token Verification (app.tsx)
- Timeout diperpanjang dari 5 detik menjadi 10 detik
- Menambahkan logging untuk debugging
- Re-ensure token disimpan setelah verifikasi

### 2. Improved Middleware Logging (InertiaAuth.php)
- Menambahkan detailed logging untuk setiap request
- Membantu diagnosa masalah token

### 3. Improved Auth Controller
- Menambahkan logging di endpoint `/api/me`
- Membantu verify token validation

## Langkah Debugging (Sesuaikan urutan)

### Step 1: Cek Console Browser (F12 → Console tab)
```
Pastikan Anda melihat log:
✓ "Token found, verifying with backend..."
✓ "Token verified successfully, user: [nama user]"

Jika tidak ada, berarti token tidak tersimpan di localStorage.
```

### Step 2: Cek localStorage (F12 → Application → Local Storage)
```
Cari keys:
- auth_token (harus ada value panjang seperti: eyJ0eXAi...)
- user (harus ada JSON user data)

Jika kosong, berarti login tidak menyimpan token dengan baik.
```

### Step 3: Cek Network Tab (F12 → Network)
```
Saat refresh /dashboard:
1. Lihat request ke /dashboard
2. Lihat request ke /api/me
3. Cek response status:
   - 200 = Token valid ✓
   - 401 = Token invalid ✗
   - 403 = Token expired ✗
```

### Step 4: Cek Database (personal_access_tokens table)
```sql
SELECT * FROM personal_access_tokens WHERE user_id = [your_user_id];
```
Harus ada token yang aktif (tidak null `last_used_at`).

### Step 5: Cek Server Logs
```bash
# Tail Laravel log
tail -f storage/logs/laravel.log

# Saat refresh, cari:
"InertiaAuth: User authenticated" = Token valid ✓
"InertiaAuth: User not authenticated" = Token invalid ✗
"AuthController@me: User data retrieved" = Endpoint berhasil ✓
```

## Possible Issues & Fixes

### ❌ localStorage kosong setelah login
**Penyebab**: LoginPage tidak menyimpan token dengan benar

**Fix**: Verify di [resources/js/pages/LoginPage.tsx](resources/js/pages/LoginPage.tsx#L35)
```tsx
// Harus ada di handleSubmit:
localStorage.setItem('auth_token', token);
localStorage.setItem('user', JSON.stringify(user));
```

### ❌ /api/me returns 401
**Penyebab**: Token tidak valid di database

**Fix**: 
1. Delete semua tokens di personal_access_tokens table
2. Login ulang untuk generate token baru

```bash
# Atau via artisan
php artisan tinker
> User::find(1)->tokens()->delete() // Clear all tokens for user 1
> exit()
```

### ❌ auth:sanctum middleware reject
**Penyebab**: Bearer token tidak dikirim dengan benar

**Fix**: Verify di [resources/js/lib/axios.ts](resources/js/lib/axios.ts)
```ts
// Harus ada:
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

## Testing Checklist

- [ ] Login dengan username/password
- [ ] Token tampil di localStorage (F12)
- [ ] Refresh page
- [ ] Lihat /api/me request di Network tab
- [ ] Response /api/me harus 200
- [ ] User tetap di /dashboard (tidak redirect ke /login)
- [ ] Logout
- [ ] localStorage kosong
- [ ] Redirect ke /login

## Files yang Sudah Diupdate

1. ✅ [resources/js/app.tsx](resources/js/app.tsx) - Enhanced token verification
2. ✅ [app/Http/Middleware/InertiaAuth.php](app/Http/Middleware/InertiaAuth.php) - Added logging
3. ✅ [app/Http/Controllers/Api/AuthController.php](app/Http/Controllers/Api/AuthController.php) - Added logging

## Next Steps (Jika masih tidak work)

1. Test manual dengan curl:
```bash
# Login
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Copy token dari response, lalu verify
curl -H "Authorization: Bearer [TOKEN]" \
  http://localhost/api/me
```

2. Cek .env konfigurasi:
```
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_EXPIRE_ON_CLOSE=false
```

3. Run migrations jika belum:
```bash
php artisan migrate
php artisan migrate:fresh --seed # if you have seeders
```

---

**Status**: Updated - Debugging tools sudah ditambahkan
**Last Updated**: January 4, 2026
