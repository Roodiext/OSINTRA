# Quick Testing Guide - Proker Permission System

## Cara Testing

### Setup Test Users
Pastikan Anda memiliki beberapa test users dengan role berbeda:

1. **Admin User** - Full permissions (view, create, edit, delete)
2. **Anggota User** - View only
3. **Koordinator User** - View + Edit (optional, untuk test partial permission)

---

## Test Case 1: Admin User (Full Permission)

### Precondition
- Login sebagai Admin
- Admin memiliki Prokers: view, create, edit, delete permissions

### Test Steps
1. Buka `/dashboard/prokers`
2. Lihat list prokers
3. Klik card proker manapun untuk masuk ke detail page
4. **Verify:**
   - ✅ Button Edit ada di top-right
   - ✅ Button Delete ada di top-right
   - ✅ Button "Edit Divisi" ada di section "Divisi yang Terlibat"
   - ✅ Button "Tambah Panitia" ada di section "Daftar Panitia"
   - ✅ Column "Aksi" ada di table panitia dengan delete button
   - ✅ Button "Tambah Media" ada di section "Galeri Dokumentasi"
   - ✅ Delete dan Set Thumbnail buttons muncul saat hover media

5. Test klik Edit button
   - ✅ Masuk ke halaman edit
   - ✅ Bisa submit form "Simpan Perubahan"
   - ✅ Alert success muncul

### Expected Result
❌ SEMUA buttons visible dan fungsional

---

## Test Case 2: Anggota User (View Only Permission)

### Precondition
- Login sebagai Anggota/Member
- Anggota hanya memiliki Prokers: view permission (NO create, edit, delete)

### Test Steps
1. Buka `/dashboard/prokers`
2. Lihat list prokers
3. Klik card proker manapun untuk masuk ke detail page
4. **Verify:**
   - ✅ Button Edit di top-right TIDAK ADA
   - ✅ Button Delete di top-right TIDAK ADA
   - ✅ Button "Edit Divisi" TIDAK ADA
   - ✅ Button "Tambah Panitia" TIDAK ADA
   - ✅ Column "Aksi" TIDAK ADA di table panitia
   - ✅ Button "Tambah Media" TIDAK ADA
   - ✅ Halaman tetap bisa dilihat (hanya read-only)

5. **Test Edit Page Access:**
   - Type URL directly: `/dashboard/prokers/{id}/edit`
   - ✅ Middleware will block: redirect to login atau error page
   - OR jika somehow masuk, saat klik "Simpan Perubahan"
   - ✅ Error alert: "Anda tidak memiliki izin untuk mengedit proker ini"

### Expected Result
❌ SEMUA action buttons TIDAK visible

---

## Test Case 3: Anggota User - Try Delete Panitia (API Test)

### Precondition
- Login sebagai Anggota dengan View-only permission
- Buka DevTools (F12)

### Test Steps
1. Buka detail proker
2. Lihat list panitia - delete button TIDAK ada (sesuai Test Case 2)
3. **Bonus Test - Try API call directly** (untuk test backend protection):
   ```javascript
   // Open console, run:
   fetch('/api/prokers/1/anggota/5', { method: 'DELETE' })
     .then(r => r.json())
     .then(console.log)
   ```
4. **Expected Response:**
   ```json
   { "message": "Anda tidak memiliki izin untuk melakukan action ini" }
   // With HTTP Status: 403 Forbidden
   ```

### Alternative: Test via UI
1. Jika button delete somehow tamplil (front-end bug):
   - Klik delete button
   - ✅ Error alert: "Anda tidak memiliki izin untuk menghapus panitia"

### Expected Result
🔒 Backend validation works - 403 error returned

---

## Test Case 4: Upload Media Permission Test

### Precondition
- Login sebagai Anggota (View-only)

### Test Steps
1. Buka detail proker
2. Scroll ke "Galeri Dokumentasi" section
3. **Verify:**
   - ✅ Button "Tambah Media" TIDAK ADA
   - ✅ "Upload Media Pertama" button jika belum ada media TIDAK ADA
   - ✅ Hover media cards - NO delete/thumbnail buttons

### Expected Result
❌ SEMUA upload/delete media buttons TIDAK visible

---

## Test Case 5: Divisi Edit Permission Test

### Precondition
- Login sebagai Anggota (View-only)

### Test Steps
1. Buka detail proker
2. Lihat "Divisi yang Terlibat" section
3. **Verify:**
   - ✅ Button "Edit Divisi" TIDAK ADA
   - ✅ Divisi list tetap visible (read-only)

### Expected Result
❌ Edit divisi button TIDAK visible

---

## Checklist untuk Testing Lengkap

### Admin/Full Permission
- [ ] Edit button visible
- [ ] Delete button visible
- [ ] Edit Divisi button visible
- [ ] Tambah Panitia button visible
- [ ] Delete panitia dalam table visible
- [ ] Tambah Media button visible
- [ ] Delete media button visible pada hover
- [ ] Set Thumbnail button visible pada hover
- [ ] Edit form dapat di-submit
- [ ] All CRUD operations successful

### Anggota/View Only
- [ ] Edit button TIDAK visible
- [ ] Delete button TIDAK visible
- [ ] Edit Divisi button TIDAK visible
- [ ] Tambah Panitia button TIDAK visible
- [ ] Delete panitia dalam table TIDAK visible
- [ ] Tambah Media button TIDAK visible
- [ ] Delete media button TIDAK visible pada hover
- [ ] Set Thumbnail button TIDAK visible pada hover
- [ ] Cannot access edit page (middleware block)
- [ ] If somehow enter edit page, submit returns 403 error

### Table & UI
- [ ] Table header alignment correct saat delete column hidden
- [ ] No console errors
- [ ] Responsive pada mobile (permission buttons still hide properly)
- [ ] No broken layout

---

## Debugging Tips

### Jika buttons muncul padahal seharusnya hidden
1. Check browser console untuk errors
2. Verify permissions object dikirim dari backend:
   ```javascript
   // In React DevTools or console:
   window.__INERTIA__.props.permissions
   ```
3. Check Network tab - apakah route mengirim permissions object

### Jika 403 error tidak muncul saat delete
1. Check backend - apakah middleware aktif di route yang sesuai
2. Check API response status code di Network tab
3. Verify backend logs untuk 403 entries

### Jika buttons tidak hidden saat permission false
1. Check JSX conditional - apakah pakai `{permissions.can_edit && ...}`
2. Verify permissions object bukan undefined
3. Clear browser cache (Ctrl+Shift+Delete)

---

## Notes

- ⚠️ Pastikan Anda clear cache browser jika test tidak sesuai
- 📝 Jika ada permission baru ditambah di database, perlu clear permissions cache di backend
- 🔒 Backend permission middleware adalah layer keamanan utama, frontend hanya untuk UX
- 💾 Jika ingin test dengan data real, gunakan real user accounts dari aplikasi

---

**Last Updated:** Testing Guide v1.0
**Status:** Ready for QA
