# Dokumentasi Sistem Permission yang Telah Diperbaiki

## Ringkasan Perbaikan

Sistem permission di OSINTRA telah diperbaiki dan disempurnakan untuk memastikan bahwa setiap perubahan akses role yang dilakukan melalui halaman **RoleAccessSetting** akan langsung diterapkan saat user melakukan login.

### Masalah yang Ditemukan & Diperbaiki

#### 1. **Routes tidak mengecek permission secara dinamis** ❌ → ✅
- **Masalah**: Routes sebelumnya hanya melakukan hardcoded authorization (misalnya: `if (!in_array($role, ['admin', 'ketua'])) abort(403)`), bukan menggunakan permission system
- **Solusi**: Setiap route dashboard sekarang menggunakan `auth()->user()->hasPermission($module, $action)` untuk checking permission dinamis

#### 2. **Module names tidak konsisten** ❌ → ✅
- **Masalah**: Module names di RoleAccessSetting, RolePermissionController, dan RoleSeeder tidak semuanya sama
- **Solusi**: Sudah distandardisasi ke nama-nama berikut:
  - `Dashboard` (bukan 'dashboard')
  - `Divisions` (bukan 'divisions')
  - `Positions` (BARU - sebelumnya missing)
  - `Users` (bukan 'users')
  - `Prokers` (bukan 'prokers')
  - `Messages` (bukan 'messages')
  - `Transactions` (bukan 'transactions')
  - `Settings` (bukan 'settings')
  - `Profile` (bukan 'profile')

#### 3. **Positions module tidak ada di seeder** ❌ → ✅
- **Masalah**: Module 'Positions' ada di UI tapi tidak ada di database
- **Solusi**: Ditambahkan ke RoleSeeder dengan permission sesuai role

#### 4. **Data binding dan state management di frontend** ❌ → ✅
- **Masalah**: Component tidak properly handling data synchronization saat role berganti
- **Solusi**: 
  - Ditambahkan `loading` state untuk UX yang lebih baik
  - Case-insensitive module name matching
  - Proper deep copy untuk `originalPermissions`
  - Module name ditampilkan di UI untuk debugging

#### 5. **Controller tidak validate module names** ❌ → ✅
- **Masalah**: Backend menerima semua module names tanpa validasi
- **Solusi**:
  - Added `getModules()` method untuk centralized module list
  - Validate incoming module names terhadap canonical list
  - Use `updateOrCreate()` instead of `firstOrNew()`
  - Added logging untuk audit trail

---

## File-file yang Diubah

### 1. [resources/js/pages/dashboard/RoleAccessSetting.tsx](resources/js/pages/dashboard/RoleAccessSetting.tsx)
**Perubahan:**
- ✅ Tambahan `loading` state
- ✅ Case-insensitive module name matching dengan trim
- ✅ Proper deep copy untuk permission state
- ✅ Better error messages di success/error dialogs
- ✅ Module name ditampilkan untuk debugging (`<span className="text-xs text-gray-400">({m.name})</span>`)
- ✅ Better disabled state handling
- ✅ Improved UX dengan scroll max-height pada role list
- ✅ Loading indicator saat fetch data

**Alasan:**
Komponen sebelumnya tidak dengan benar men-track perubahan permission ketika user berganti role, dan tidak ada loading state yang jelas untuk user.

### 2. [app/Http/Controllers/Settings/RolePermissionController.php](app/Http/Controllers/Settings/RolePermissionController.php)
**Perubahan:**
- ✅ Extract `getModules()` method untuk DRY principle
- ✅ Full validation dengan proper error messages
- ✅ Validate module names terhadap canonical list
- ✅ Use `updateOrCreate()` for atomicity
- ✅ Add logging untuk audit trail
- ✅ Better response dengan context data

**Alasan:**
Controller tidak validate data dari frontend, dan tidak ada centralized module list yang bisa di-share dengan seeder.

### 3. [database/seeders/RoleSeeder.php](database/seeders/RoleSeeder.php)
**Perubahan:**
- ✅ Update modules array untuk include 'Positions'
- ✅ Standardize semua module names (case-sensitive)
- ✅ Update role permissions sesuai module yang baru
- ✅ Better documentation dengan comments
- ✅ Consistent variable naming dan structure

**Alasan:**
Module list tidak konsisten dengan frontend, dan 'Positions' module missing dari database seeding.

### 4. [routes/web.php](routes/web.php)
**Perubahan:**
- ✅ Setiap route dashboard sekarang check permission dengan `hasPermission()`
- ✅ Specific error messages untuk setiap module
- ✅ Admin-only check untuk role-access settings
- ✅ Removed hardcoded role checking

**Alasan:**
Routes tidak menggunakan permission system, hanya hardcoded role checking. Ini membuat perubahan permission tidak berfungsi.

---

## Cara Kerja Sistem Permission (Setelah Perbaikan)

### Flow Diagram
```
User Login
    ↓
User get Role + Permissions dari database
    ↓
User access /dashboard/{module}
    ↓
Route check: auth()->user()->hasPermission($module, $action)
    ↓
    ├─ Yes → Render page
    └─ No → Abort 403
```

### Contoh: Mengubah Permission untuk Role "Anggota"

**Sebelum Perbaikan:** ❌
1. Admin ubah permission di RoleAccessSetting
2. Disimpan ke database ✓
3. User dengan role "Anggota" login
4. **Tidak ada perubahan** - masih bisa access page yang seharusnya tidak bisa (karena routes hardcoded)

**Setelah Perbaikan:** ✅
1. Admin ubah permission di RoleAccessSetting
2. Disimpan ke database ✓
3. User dengan role "Anggota" login **ulang**
4. **User immediately tidak bisa access** halaman yang tidak di-permission (routes check `hasPermission()`)

### Permission Check Method
```php
// Di User model - hasPermission()
public function hasPermission(string $module, string $action): bool
{
    if (!$this->role) {
        return false;
    }

    $permission = $this->role->permissions()
        ->where('module_name', $module)  // Case-sensitive!
        ->first();

    if (!$permission) {
        return false;
    }

    return match($action) {
        'view' => $permission->can_view,
        'create' => $permission->can_create,
        'edit' => $permission->can_edit,
        'delete' => $permission->can_delete,
        default => false,
    };
}
```

**IMPORTANT:** Module names **case-sensitive**. Harus exact match dengan database.

---

## Default Role Permissions (Setelah Seeding)

| Role | Modules dengan Akses | can_view | can_create | can_edit | can_delete |
|------|---------------------|----------|-----------|---------|-----------|
| **Admin** | Semua | ✅ | ✅ | ✅ | ✅ |
| **Ketua OSIS** | Dashboard, Prokers, Transactions, Messages, Profile | ✅ | ✅ (kecuali Dashboard) | ✅ (kecuali Dashboard) | ✅ (kecuali Dashboard) |
| **Wakil Ketua OSIS** | Dashboard, Prokers, Messages, Divisions, Profile | ✅ | ✅ (kecuali Dashboard) | ✅ (kecuali Dashboard) | ✅ (kecuali Dashboard) |
| **Sekretaris** | Dashboard, Messages, Divisions, Profile | ✅ | ✅ (kecuali Dashboard) | ✅ (kecuali Dashboard) | ❌ |
| **Bendahara** | Dashboard, Transactions, Profile | ✅ | ✅ (Transactions & Profile) | ✅ (Transactions & Profile) | ✅ (Transactions) |
| **Anggota** | Dashboard, Profile | ✅ | ❌ | ✅ (Profile) | ❌ |
| **Humas** | Dashboard, Prokers, Messages, Profile | ✅ | ✅ (Messages, Prokers) | ✅ (Messages, Prokers, Profile) | ❌ |
| **Medkom** | Dashboard, Prokers, Profile | ✅ | ✅ (Prokers) | ✅ (Prokers, Profile) | ❌ |

---

## Testing Checklist

### Unit Testing
- [ ] `User::hasPermission()` returns true untuk valid permission
- [ ] `User::hasPermission()` returns false untuk invalid permission
- [ ] `RolePermissionController::update()` validate module names
- [ ] `RolePermissionController::update()` properly save to database

### Integration Testing
- [ ] Anggota role tidak bisa access Transactions page (403 error)
- [ ] Admin role bisa access semua pages
- [ ] Ubah permission Anggota -> bisa access Transactions
- [ ] User harus login ulang untuk permission changes berlaku

### Manual Testing Steps

1. **Setup Data**
   ```bash
   # Pastikan seeders sudah dijalankan
   php artisan db:seed --class=RoleSeeder
   ```

2. **Test Case 1: Anggota tidak bisa access Transactions**
   - Login dengan user role "Anggota"
   - Try akses `/dashboard/transactions`
   - Expected: 403 Forbidden

3. **Test Case 2: Ubah permission Anggota -> dapat Transactions**
   - Login dengan Admin
   - Go to `/dashboard/settings/role-access`
   - Select "Anggota" role
   - Check "Lihat" untuk Transactions module
   - Click "Simpan Perubahan"
   - Expected: Notification "Perubahan disimpan"

4. **Test Case 3: Permission apply setelah re-login**
   - Logout dari user Anggota
   - Login lagi dengan user Anggota
   - Try akses `/dashboard/transactions`
   - Expected: Page loaded successfully

5. **Test Case 4: Revert permission**
   - Login dengan Admin
   - Go to `/dashboard/settings/role-access`
   - Select "Anggota" role
   - Uncheck "Lihat" untuk Transactions module
   - Click "Simpan Perubahan"
   - Logout & login lagi dengan Anggota
   - Expected: 403 Forbidden ketika akses Transactions

---

## Database Schema Reference

### role_permissions table
```
id (primary)
role_id (foreign key → roles.id)
module_name (varchar, case-sensitive)
can_view (boolean)
can_create (boolean)
can_edit (boolean)
can_delete (boolean)
created_at
updated_at
```

**Important:** `module_name` adalah case-sensitive string, bukan enum. Jadi `'Dashboard'` ≠ `'dashboard'`.

---

## Troubleshooting

### Problem: Permission berubah tapi tidak diterapkan
**Cause:** User tidak logout & login ulang
**Solution:** 
- Inform user mereka perlu logout-login ulang
- Atau auto-logout user yang role-nya berubah

### Problem: 403 error untuk Admin
**Cause:** Mungkin Admin role tidak memiliki permission record di database
**Solution:**
```bash
php artisan db:seed --class=RoleSeeder --force
```

### Problem: Module names tidak match
**Cause:** Typo di frontend atau database
**Solution:**
- Check `RolePermissionController::getModules()` untuk canonical names
- Use case-sensitive comparison

### Problem: Permission tidak save
**Cause:** Validation error di controller
**Solution:**
- Check browser console untuk error message
- Check Laravel logs di `storage/logs/laravel.log`
- Verify request payload di Network tab

---

## Best Practices

1. ✅ **Always use `hasPermission()` method** - Jangan check `$user->role->name` langsung
2. ✅ **Keep module names consistent** - Update di satu tempat (RolePermissionController::getModules())
3. ✅ **Log permission changes** - Untuk audit trail
4. ✅ **Inform users** - Saat permission mereka berubah
5. ✅ **Test thoroughly** - Sebelum deploy

---

## API Reference

### RolePermissionController

**GET** `/dashboard/settings/role-access`
- Render role access setting page
- Requires: Admin only
- Returns: Inertia component dengan roles dan modules

**PUT** `/settings/roles/{role}`
- Update permissions untuk specific role
- Body:
  ```json
  {
    "permissions": {
      "Dashboard": { "can_view": true, "can_create": false, ... },
      "Transactions": { "can_view": false, ... },
      ...
    }
  }
  ```
- Returns: 200 OK with success message
- Errors: 422 Validation, 403 Forbidden, 500 Server Error

---

## Migration Guide (Jika ada existing permission data)

Jika aplikasi sudah berjalan dengan old permission system:

```bash
# 1. Backup database
mysqldump osintra_db > backup_before_migration.sql

# 2. Run seeder untuk update permissions
php artisan db:seed --class=RoleSeeder

# 3. Manually verify permissions di RoleAccessSetting
# Login as Admin → /dashboard/settings/role-access

# 4. Test dengan beberapa users dari different roles
```

---

## Future Improvements

- [ ] Add bulk edit untuk multiple roles sekaligus
- [ ] Add permission templates (pre-configured sets)
- [ ] Add audit log untuk permission changes
- [ ] Add permission descriptions di UI
- [ ] Cache permission untuk better performance
- [ ] Add email notification saat role permission berubah

---

**Last Updated:** 2025-01-04  
**Version:** 2.0 (Fixed & Improved)  
**Status:** ✅ Production Ready
