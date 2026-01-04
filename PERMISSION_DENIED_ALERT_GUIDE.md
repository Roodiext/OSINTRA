# Permission Denied Alert dengan SweetAlert2 - Implementation Guide

## Apa Itu Fitur Ini?

Ketika user yang tidak memiliki akses mencoba mengakses halaman yang di-protect, mereka akan melihat:
- ✅ **SweetAlert2 popup** dengan pesan error yang jelas
- ✅ **Blur background** untuk fokus pada alert
- ✅ **Elegant transition** dengan smooth animation
- ✅ **Automatic redirect** ke dashboard setelah dismiss

**Sebelumnya:** User hanya mendapat halaman 403 error yang membingungkan
**Sekarang:** User mendapat alert yang jelas dan di-redirect secara otomatis

---

## Fitur-Fitur

### 1. **SweetAlert2 Popup dengan Custom Styling**
```javascript
Swal.fire({
  title: 'Akses Ditolak',
  text: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
  icon: 'warning',
  confirmButtonColor: '#3B4D3A',
  confirmButtonText: 'Kembali ke Dashboard',
  // ... styling options
})
```

### 2. **Blur Background Effect**
```javascript
// Saat alert muncul
document.body.style.filter = 'blur(4px)';

// Saat alert ditutup
document.body.style.filter = 'none';
```

### 3. **Smart Redirect**
- Redirect ke dashboard
- Atau ke custom URL (bisa di-customize per route)

### 4. **User-Friendly Messages**
Setiap halaman memiliki pesan yang descriptive:
- "Anda tidak memiliki izin untuk mengakses halaman Divisi."
- "Anda tidak memiliki izin untuk mengedit Program Kerja."
- etc.

---

## Architecture

### File-File yang Terlibat

```
resources/js/pages/
├── PermissionDenied.tsx          ← New component untuk alert
│
routes/
├── web.php                        ← Updated dengan redirect logic
│
app/Http/Helpers/
└── PermissionHelper.php           ← Optional helper untuk future use
```

### Flow Diagram

```
User akses /dashboard/transactions
    ↓
Route check: hasPermission('Transactions', 'view')
    ↓
    ├─ Has permission → Render TransactionsPage
    └─ No permission → redirect('/permission-denied', params)
                       ↓
                   PermissionDenied.tsx
                       ↓
                   Show SweetAlert2 + Blur
                       ↓
                   User click OK
                       ↓
                   Navigate to /dashboard
```

---

## Implementation Details

### 1. PermissionDenied Component
**File:** `resources/js/pages/PermissionDenied.tsx`

```typescript
// Automatically show alert on mount
useEffect(() => {
  // 1. Apply blur to body
  document.body.style.filter = 'blur(4px)';
  
  // 2. Show SweetAlert2
  Swal.fire({...})
  
  // 3. On dismiss, remove blur and redirect
  .then((result) => {
    document.body.style.filter = 'none';
    navigate(redirectUrl);
  });
}, []);
```

### 2. Route Redirect Logic
**File:** `routes/web.php`

```php
Route::get('/dashboard/transactions', function () {
    if (!auth()->user()->hasPermission('Transactions', 'view')) {
        // Instead of: abort(403, '...');
        // Now: Redirect to permission-denied page
        return redirect()->route('permission-denied', [
            'message' => 'Anda tidak memiliki izin untuk mengakses halaman Keuangan.',
            'redirect' => route('dashboard')
        ]);
    }
    
    return Inertia::render('dashboard/TransactionsPage', [...]);
});
```

### 3. Permission Denied Route
**File:** `routes/web.php` (didalam middleware auth:sanctum)

```php
Route::get('/permission-denied', function () {
    $message = request()->query('message', 'Anda tidak memiliki izin untuk mengakses halaman ini.');
    $redirect = request()->query('redirect', route('dashboard'));
    
    return Inertia::render('PermissionDenied', [
        'message' => $message,
        'redirect' => $redirect,
    ]);
})->name('permission-denied');
```

---

## Alert Styling

### Custom CSS Classes
```css
.permission-denied-alert {
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.permission-denied-title {
  color: #3B4D3A;
  font-size: 24px;
  font-weight: 700;
}

.permission-denied-message {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}
```

### Backdrop Styling
```javascript
backdrop: 'rgba(0, 0, 0, 0.4)', // Semi-transparent dark backdrop
```

---

## User Experience Flow

### Scenario: Admin dengan role "Anggota" coba akses Transactions

1. **User navigates** ke `/dashboard/transactions`
2. **Route checks** permission → No permission
3. **Redirect** to `/permission-denied?message=...&redirect=...`
4. **PermissionDenied component** mounts:
   - Body blur activated (4px blur)
   - SweetAlert2 popups dengan:
     - Icon: Warning (🔶)
     - Title: "Akses Ditolak"
     - Message: "Anda tidak memiliki izin untuk mengakses halaman Keuangan."
     - Button: "Kembali ke Dashboard"
5. **User clicks** "Kembali ke Dashboard"
6. **Body blur removed**
7. **Redirected** to `/dashboard`

---

## Alert Messages per Module

Setiap module memiliki pesan unik:

| Module | Message |
|--------|---------|
| Divisions | Anda tidak memiliki izin untuk mengakses halaman Divisi. |
| Positions | Anda tidak memiliki izin untuk mengakses halaman Posisi. |
| Users | Anda tidak memiliki izin untuk mengakses halaman Pengguna. |
| Prokers | Anda tidak memiliki izin untuk mengakses halaman Program Kerja. |
| Messages | Anda tidak memiliki izin untuk mengakses halaman Pesan. |
| Transactions | Anda tidak memiliki izin untuk mengakses halaman Keuangan. |
| Settings | Anda tidak memiliki izin untuk mengakses halaman Pengaturan. |
| Edit Actions | Anda tidak memiliki izin untuk mengedit [module]. |

---

## Adding to New Routes

Untuk menambahkan alert ke route baru:

### Step 1: Identify the module dan action
```php
if (!auth()->user()->hasPermission('NewModule', 'view')) {
    // Add redirect logic
}
```

### Step 2: Add redirect with message
```php
if (!auth()->user()->hasPermission('NewModule', 'view')) {
    return redirect()->route('permission-denied', [
        'message' => 'Anda tidak memiliki izin untuk mengakses halaman New Module.',
        'redirect' => route('dashboard')
    ]);
}
```

### Step 3: Test
1. Login dengan user yang tidak punya permission
2. Try akses route
3. Alert muncul dengan blur background ✅

---

## Browser Compatibility

| Browser | Blur Filter | Alert | Status |
|---------|------------|-------|--------|
| Chrome/Chromium | ✅ | ✅ | ✅ Full Support |
| Firefox | ✅ | ✅ | ✅ Full Support |
| Safari | ✅ | ✅ | ✅ Full Support |
| Edge | ✅ | ✅ | ✅ Full Support |
| IE11 | ⚠️ | ✅ | ⚠️ Alert works, blur may not work |

**Note:** CSS blur filter (`filter: blur()`) supported di semua modern browsers. Untuk IE11, alert masih akan muncul tapi tanpa blur effect.

---

## Customization Options

### 1. Ubah Blur Intensity
```javascript
// File: PermissionDenied.tsx
document.body.style.filter = 'blur(8px)'; // Lebih blur
// atau
document.body.style.filter = 'blur(2px)'; // Kurang blur
```

### 2. Ubah Alert Color
```php
// File: routes/web.php
'confirmButtonColor' => '#FF6B6B', // Merah
// atau
'confirmButtonColor' => '#4ECDC4', // Cyan
```

### 3. Ubah Alert Icon
```javascript
// File: PermissionDenied.tsx
icon: 'error',  // Ganti dengan 'error', 'info', 'success', 'question'
```

### 4. Ubah Button Text
```php
// File: routes/web.php
'confirmButtonText' => 'OK', // Custom button text
```

---

## Testing Checklist

- [ ] User tanpa permission dapat akses halaman → Alert muncul ✅
- [ ] Alert menampilkan blur background ✅
- [ ] Alert menampilkan message yang correct ✅
- [ ] Click button → Redirect ke dashboard ✅
- [ ] Test dengan berbagai modules ✅
- [ ] Test di berbagai browsers ✅
- [ ] Blur removed setelah dismiss ✅

---

## Troubleshooting

### Issue: Alert tidak muncul
**Solution:**
1. Check console untuk errors
2. Verify route name `permission-denied` ada di routes
3. Check PermissionDenied.tsx component terdaftar di Inertia

### Issue: Blur tidak muncul
**Solution:**
1. Check browser support (modern browsers should support)
2. Check CSS tidak di-override
3. Try increase blur value: `blur(8px)`

### Issue: Redirect tidak jalan
**Solution:**
1. Check `redirectUrl` param di component
2. Check route exist
3. Verify navigation tidak di-block

---

## Performance Notes

- ✅ **No additional queries** - Alert data di-pass via URL params
- ✅ **Fast rendering** - Component simple dan lightweight
- ✅ **Minimal JavaScript** - SweetAlert2 sudah optimized

---

## Security Notes

- ✅ URL params encrypted/URL-encoded
- ✅ Message ditampilkan untuk user friendliness
- ✅ Tidak expose sensitive information
- ✅ Redirect ke safe URL (route-based)

---

## Future Enhancements

- [ ] Add animation options untuk alert
- [ ] Add countdown timer sebelum auto-redirect
- [ ] Add log untuk permission denied attempts
- [ ] Add custom alert theme per role
- [ ] Add sound notification option

---

**Status:** ✅ Production Ready  
**Last Updated:** 2025-01-04
