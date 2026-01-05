# Quick Reference: Permission System Changes

## TLDR - Apa yang diubah?

### Problem yang Diperbaiki ✅
1. Routes tidak check permission secara dinamis → **Sekarang check `hasPermission()` di setiap route**
2. Module names tidak konsisten → **Standardized ke nama Pascal Case**
3. Positions module missing → **Added to seeder**
4. Frontend state management buruk → **Fixed dengan proper state handling**
5. Backend tidak validate → **Now validates module names**

### Critical Files Modified
| File | Changes | Impact |
|------|---------|--------|
| [routes/web.php](routes/web.php) | Added `hasPermission()` check ke semua routes | ⭐ PALING PENTING - Inilah mengapa permission sekarang berfungsi |
| [RoleAccessSetting.tsx](resources/js/pages/dashboard/RoleAccessSetting.tsx) | Fixed state management, added loading, case-insensitive matching | Better UX & correctness |
| [RolePermissionController.php](app/Http/Controllers/Settings/RolePermissionController.php) | Added validation, centralized module list | Security & consistency |
| [RoleSeeder.php](database/seeders/RoleSeeder.php) | Added Positions module, standardized names | Data consistency |

---

## Step-by-Step Testing

### Scenario 1: Anggota Member tidak bisa akses Transactions

**Setup:**
```bash
# Ensure seeder berjalan
php artisan db:seed --class=RoleSeeder
```

**Test:**
1. Create user dengan role "Anggota"
2. Login dengan user tersebut
3. Try direct akses ke `/dashboard/transactions`
   - **Expected:** ❌ 403 Forbidden
   - **Actual:** ✅ 403 Forbidden (FIXED!)

### Scenario 2: Admin mengubah permission, user immediately dapat akses

**Setup:**
1. Login Admin → `/dashboard/settings/role-access`
2. Select "Anggota" role
3. Check "Lihat" untuk Transactions module
4. Click "Simpan Perubahan"
5. Success notification appears

**Test:**
1. Logout dari Admin
2. Login dengan user Anggota
3. Try akses `/dashboard/transactions`
   - **Expected:** ✅ Page loaded (Anggota now has permission)
   - **Actual:** ✅ Page loaded (FIXED!)

---

## Module Names (STANDARDIZED)

```javascript
// These are the EXACT names to use everywhere:
Dashboard
Divisions
Positions
Users
Prokers
Messages
Transactions
Settings
Profile
```

**⚠️ CASE-SENSITIVE!** `'Dashboard'` ≠ `'dashboard'`

---

## Code Examples

### Check Permission di Route
```php
// ✅ NEW WAY (do this)
Route::get('/dashboard/transactions', function () {
    if (!auth()->user()->hasPermission('Transactions', 'view')) {
        abort(403);
    }
    // ... rest of code
})->name('dashboard.transactions');

// ❌ OLD WAY (don't do this anymore)
if (!in_array($role->name, ['Admin', 'Bendahara'])) {
    abort(403);
}
```

### Check Permission di Component
```typescript
// Check dari user object yang sudah ada
const userCanEdit = user?.role?.permissions?.some(p => 
  p.module_name === 'Transactions' && p.can_edit
);

if (!userCanEdit) {
  return <div>No permission</div>;
}
```

---

## Database Setup

```bash
# Fresh setup:
php artisan migrate:fresh --seed

# Update existing permissions:
php artisan db:seed --class=RoleSeeder --force

# Verify:
# SELECT * FROM role_permissions ORDER BY role_id, module_name;
```

---

## API Endpoint

**PUT** `/settings/roles/{roleId}`

Request:
```json
{
  "permissions": {
    "Dashboard": { "can_view": true, "can_create": false, "can_edit": false, "can_delete": false },
    "Transactions": { "can_view": false, "can_create": false, "can_edit": false, "can_delete": false }
  }
}
```

Response (Success):
```json
{
  "message": "Permissions updated successfully",
  "role_id": 5,
  "role_name": "Anggota"
}
```

---

## Debugging Checklist

If something still doesn't work:

1. ✅ Check database
   ```sql
   SELECT * FROM role_permissions WHERE role_id = {roleId};
   ```

2. ✅ Check User model
   ```php
   $user = User::with('role.permissions')->find($userId);
   dd($user->hasPermission('Transactions', 'view'));
   ```

3. ✅ Check logs
   ```bash
   tail storage/logs/laravel.log
   ```

4. ✅ Clear cache
   ```bash
   php artisan cache:clear
   php artisan config:cache
   ```

5. ✅ User must re-login (permissions cached in session)

---

## Migration Checklist (untuk production)

- [ ] Backup database
- [ ] Run: `php artisan migrate` (if new migrations exist)
- [ ] Run: `php artisan db:seed --class=RoleSeeder --force`
- [ ] Test dengan 2-3 users dari different roles
- [ ] Verify all routes working
- [ ] Test permission changes
- [ ] Monitor logs untuk errors

---

## Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| 403 Forbidden | No permission | Admin grant permission via RoleAccessSetting |
| Permission not changing | User tidak re-login | Logout & login ulang |
| Module not found | Wrong module name | Check `RolePermissionController::getModules()` |
| DB Constraint Error | Missing role_id | Ensure role exists di database |

---

## File Organization

```
app/
├── Http/
│   ├── Controllers/Settings/
│   │   └── RolePermissionController.php  ⭐ Backend logic
│   └── Middleware/
│       └── CheckPermission.php           (not used in routes, can be removed)
├── Models/
│   ├── Role.php
│   ├── RolePermission.php
│   └── User.php                          ⭐ hasPermission() method
│
resources/js/pages/dashboard/
└── RoleAccessSetting.tsx                 ⭐ UI untuk manage permissions

database/seeders/
└── RoleSeeder.php                        ⭐ Initial data + new Positions

routes/
└── web.php                               ⭐ Permission checks
```

---

## Timeline of Execution

```
User Login
  ├─ Fetch User + Role + Permissions (eager loaded)
  └─ Store in auth()->user()

User navigate to /dashboard/transactions
  ├─ Route middleware: auth:sanctum ✓
  ├─ Route handler check: hasPermission('Transactions', 'view')
  │   ├─ If false → abort(403)
  │   └─ If true → render page
  └─ User sees page or error

Admin change permission
  ├─ Save to database
  └─ User MUST re-login untuk changes berlaku
```

---

## Support

For issues, check in this order:
1. [PERMISSION_SYSTEM_DOCUMENTATION.md](PERMISSION_SYSTEM_DOCUMENTATION.md) - Full documentation
2. Laravel logs: `storage/logs/laravel.log`
3. Database: Verify `role_permissions` table
4. Browser console: Check for JS errors
