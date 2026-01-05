# Permission Alert Integration Guide

## Overview

Sistem permission alert sudah di-update untuk menampilkan popup modal **tanpa redirect page**. Sekarang user akan:

1. ✅ Akses page yang tidak memiliki permission
2. ✅ Page tetap ter-render
3. ✅ Alert popup muncul dengan pesan permission denied
4. ✅ User bisa close alert dan stay di page
5. ❌ Tidak di-redirect ke login atau page lain

## Cara Menggunakan

### 1. Di Route (Backend - Laravel)

Setiap route sekarang pass `permission_denied` flag:

```php
Route::get('/dashboard/divisions', function () {
    $hasPermission = auth()->user()->hasPermission('Divisions', 'view');
    
    return Inertia::render('dashboard/DivisionsPage', [
        'auth' => ['user' => auth()->user()],
        'divisions' => \App\Models\Division::withCount('users')->get(),
        // Pass permission_denied message jika tidak punya akses
        'permission_denied' => !$hasPermission ? 'Anda tidak memiliki izin untuk mengakses halaman Divisi.' : null,
    ]);
})->name('dashboard.divisions');
```

### 2. Di Component (Frontend - React)

Import hook dan gunakan:

```tsx
import { usePermissionAlert } from '@/hooks/usePermissionAlert';
import { usePage } from '@inertiajs/react';

interface Props {
  permission_denied?: string | null;
  // ... other props
}

export default function DivisionsPage() {
  const { props } = usePage<Props>();
  
  // Hook akan auto-show alert jika ada permission_denied message
  usePermissionAlert(props.permission_denied);
  
  return (
    <div>
      {/* Page content tetap ter-render */}
      <h1>Divisi</h1>
      {/* ... */}
    </div>
  );
}
```

## Alert Styling

✅ **Background:** Blur 10% dengan transparency (tidak hitam)  
✅ **Popup:** White background dengan rounded corners  
✅ **Icon:** Warning icon dalam warna orange  
✅ **Title:** "Akses Ditolak" dalam green (#3B4D3A)  
✅ **Button:** Green button dengan hover effects  
✅ **Animation:** Smooth slide-in animation  

## Features

- ✅ Allow outside click untuk close alert
- ✅ Allow escape key untuk close alert
- ✅ Smooth animation
- ✅ Professional styling
- ✅ Page content tetap visible
- ✅ No redirect to login
- ✅ User bisa close dan stay di page

## Routes Updated

Semua dashboard routes sudah di-update:

- ✅ `/dashboard/divisions`
- ✅ `/dashboard/positions`
- ✅ `/dashboard/users`
- ✅ `/dashboard/prokers`
- ✅ `/dashboard/prokers/{id}`
- ✅ `/dashboard/prokers/{id}/edit`
- ✅ `/dashboard/messages`
- ✅ `/dashboard/transactions`
- ✅ `/dashboard/settings`
- ✅ `/dashboard/settings/role-access`
- ✅ `/dashboard/audit-logs`

## Files Changed

- `routes/web.php` - All routes updated to pass permission_denied flag
- `resources/js/hooks/usePermissionAlert.ts` - New hook untuk alert
- `resources/js/utils/PermissionAlert.ts` - Utility function (optional)
- `app/Models/User.php` - hasPermission() method improved

## Testing

1. Login dengan role yang tidak punya akses ke module tertentu
2. Navigate ke page yang tidak diizinkan
3. Alert akan popup dengan pesan
4. Click "Tutup" atau click outside
5. Page tetap visible
6. Tidak di-redirect

Done! 🎉
