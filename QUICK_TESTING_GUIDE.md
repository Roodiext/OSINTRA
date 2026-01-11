# 🚀 QUICK START - PERMISSION SYSTEM TESTING

## ✅ Implementation Status
**SEMUA PAGES SUDAH SELESAI - SIAP TESTING**

---

## 📊 Pages yang Sudah Di-Update

### ✅ Selesai & Berfungsi:
1. **DivisionsPage** - View, Create, Edit, Delete
2. **PositionsPage** - View, Create, Edit, Delete
3. **UsersPage** - View, Create, Edit, Delete
4. **ProkersPage (List)** - View, Create, Edit, Delete
5. **ProkerDetailPage** - View, Edit, Delete, Add Panitia, Upload Media
6. **ProkerEditPage** - View, Edit
7. **TransactionsPage** - View, Create, Edit, Delete, Approve

---

## 🎯 Fitur Utama

### 1. Conditional Button Rendering
```
IF user punya permission → Button VISIBLE
IF user TIDAK punya permission → Button HIDDEN
```

### 2. 403 Error Handling
```
Saat user coba access tanpa permission via API:
↓
HTTP 403 Forbidden ditangkap
↓
SweetAlert2 error message ditampilkan
↓
User-friendly message bahasa Indonesia
```

### 3. Configurable via RoleAccessSetting
```
Admin bisa setting permission per role
Via: /dashboard/settings → Pengaturan Akses Role
```

---

## 🧪 CARA TESTING CEPAT

### Setup User Test

**Via Database / Seeder:**

```sql
-- Buat role baru untuk testing
INSERT INTO roles (name, description) VALUES 
('Tester ViewOnly', 'User hanya bisa view'),
('Tester EditOnly', 'User bisa view & edit');

-- Berikan permission ke roles
INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES
(4, 'Divisions', 1, 0, 0, 0),      -- View only
(5, 'Divisions', 1, 0, 1, 0);      -- View + Edit
```

**Via UI:**
1. Buka `/dashboard/settings`
2. Klik "Pengaturan Akses Role"
3. Pilih role
4. Centang/uncentang permission sesuai test case
5. Save

---

## 🧬 Test Cases Minimal

### Test 1: Admin (Full Permission)
```
✅ Divisions page → "Tambah Divisi" button VISIBLE
✅ Klik button → Modal terbuka
✅ Isi form → Klik Submit
✅ Success message → Divisi berhasil ditambah
✅ Edit button VISIBLE di list → Berfungsi
✅ Delete button VISIBLE → Berfungsi dengan warning
```

### Test 2: Member (View Only)
```
✅ Divisions page → "Tambah Divisi" button HIDDEN
✅ Edit button HIDDEN
✅ Delete button HIDDEN
✅ Bisa lihat list & detail
✅ Try akses edit page directly → Error atau redirect
```

### Test 3: API Bypass (Bonus Security Test)
```
Login sebagai Member, buka Console:

fetch('/api/divisions', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({name: 'Test'})
})
.then(r => r.json())
.then(console.log)

Expected: 
❌ HTTP 403 Forbidden
{message: "Anda tidak memiliki izin..."}
```

---

## 📱 Pages to Test

### Priority 1 (Main Flows)
- [ ] DivisionsPage (list, create, edit, delete)
- [ ] TransactionsPage (list, create, edit, delete)
- [ ] ProkersPage (list, create, edit, delete)

### Priority 2 (Detail Pages)
- [ ] ProkerDetailPage (edit, delete, add panitia, media)
- [ ] ProkerEditPage (edit form)

### Priority 3 (Other)
- [ ] PositionsPage
- [ ] UsersPage

---

## 🔐 Permission Modules

| Module | Label | Can Use |
|--------|-------|---------|
| Divisions | Divisi | ✅ |
| Positions | Posisi | ✅ |
| Users | Pengguna | ✅ |
| Prokers | Program Kerja | ✅ |
| Messages | Pesan | ✅ |
| Transactions | Keuangan | ✅ |
| Dashboard | Dashboard | ✅ |
| Settings | Pengaturan | ✅ |

---

## 💡 Expected Behaviors

### Jika user punya `can_create` permission:
```
✅ "Tambah" button VISIBLE
✅ Klik button → Modal/form terbuka
✅ Isi dan submit → Success
❌ Jika somehow submit tanpa punya permission → 403 error
```

### Jika user TIDAK punya `can_create`:
```
❌ "Tambah" button HIDDEN
✅ Tidak bisa klik (button tidak ada)
✅ Jika coba via API → 403 Forbidden
```

### Jika permission berubah:
```
Saat user masih logged in:
❌ Button masih lama (cache di session)

Setelah user logout-login ulang:
✅ Button updated sesuai permission baru
```

---

## 🐛 Troubleshooting

### Button tidak hide/show
```
1. Refresh page (Ctrl+F5)
2. Check browser console untuk errors
3. Verify permissions object di React DevTools:
   window.__INERTIA__.props.permissions
4. Check backend route mengirim permissions
```

### 403 error tidak muncul
```
1. Check Network tab di DevTools
2. Verify API response status code: 403
3. Check if handleSubmit/Delete/Approve punya 403 check
4. Look at browser console untuk error logs
```

### Permission tidak berubah setelah save
```
1. Logout dan login ulang (permissions cached di session)
2. Verify data saved di database: role_permissions table
3. Check module_name case-sensitive match
4. Clear browser cache jika masih masalah
```

---

## 📋 Checklist Final Testing

### Functionality
- [ ] All buttons visible/hidden correctly
- [ ] Create operations work with proper permission
- [ ] Edit operations work with proper permission
- [ ] Delete operations work with proper permission
- [ ] 403 errors show user-friendly message
- [ ] No console errors
- [ ] No TypeScript warnings

### Security
- [ ] API endpoints reject without permission
- [ ] Direct API calls blocked with 403
- [ ] Permission bypass tidak possible
- [ ] Module names case-sensitive

### User Experience
- [ ] Error messages clear & helpful
- [ ] Buttons smooth hide/show
- [ ] No broken layouts
- [ ] Responsive on mobile

### Edge Cases
- [ ] Permission change during session
- [ ] Multiple browser tabs update sync
- [ ] API timeout / network error handling
- [ ] Very long permission lists

---

## 📞 Support Info

**Issue dengan permission system?**

1. Check console errors (F12)
2. Verify permissions object passed to component
3. Check API request/response in Network tab
4. Verify database role_permissions table
5. Check if middleware.permission is registered in bootstrap/app.php

**Files to check:**
- `resources/js/pages/dashboard/*.tsx`
- `routes/web.php`
- `routes/api.php`
- `app/Http/Middleware/CheckPermission.php`
- `app/Models/User.php` (hasPermission method)

---

**Created:** 8 January 2026  
**Status:** Ready for Testing  
**All Pages:** ✅ Complete
