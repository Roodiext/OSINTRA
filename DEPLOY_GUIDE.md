# 🚀 Deploy Steps - Priority Tinggi Features

## Quick Checklist

- [ ] 1. Run migration
- [ ] 2. Clear cache
- [ ] 3. Test create transaksi
- [ ] 4. Test edit transaksi
- [ ] 5. Test delete transaksi (with confirmation)
- [ ] 6. Test approve/reject
- [ ] 7. Test all filters
- [ ] 8. Test reset filters
- [ ] 9. Test responsive (mobile)
- [ ] 10. Commit & push

---

## Step-by-Step

### 1️⃣ Database Migration
```bash
php artisan migrate
# atau jika ingin fresh:
# php artisan migrate:refresh --seed
```

**Apa yang ditambahkan:**
- `transactions.status` - enum(pending, approved, rejected)
- `transactions.approved_by` - foreign key ke users
- `transactions.category` - varchar untuk category

### 2️⃣ Clear Cache (Important!)
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### 3️⃣ Build Frontend (if using Vite/Esbuild)
```bash
npm run build
# atau jika development:
npm run dev
```

### 4️⃣ Testing Checklist

#### ✅ Create Transaction
- [ ] Form modal muncul dengan benar
- [ ] Kategori dropdown populated
- [ ] Submit berhasil → reload page
- [ ] Success toast muncul
- [ ] Transaksi baru ada di list dengan status "pending"

#### ✅ Edit Transaction
- [ ] Click edit button → modal populated dengan data
- [ ] Modal title berubah ke "Edit Transaksi"
- [ ] Update berhasil → reload
- [ ] Success notification

#### ✅ Delete Transaction
- [ ] Click delete → confirmation dialog
- [ ] Cancel dialog → dismiss
- [ ] Confirm delete → success toast
- [ ] Transaksi hilang dari list

#### ✅ Approval Workflow
- [ ] Transaksi pending → ada tombol approve/reject
- [ ] Click approve → confirmation → success
- [ ] Status berubah ke "approved" + nama approver
- [ ] Tombol approve/reject hilang
- [ ] Click reject → works the same

#### ✅ Filters
- [ ] Search by title works
- [ ] Filter by type (income/expense)
- [ ] Filter by status (pending/approved/rejected)
- [ ] Filter by category
- [ ] Date range filter
- [ ] Amount range filter
- [ ] Combine multiple filters
- [ ] Reset button clears all

#### ✅ UI/UX
- [ ] Status badges show correct color & icon
- [ ] Table responsive on mobile
- [ ] Icons render correctly
- [ ] Loading states work
- [ ] Error messages clear

### 5️⃣ Commit & Push

```bash
# Check git status
git status

# Add changes
git add .

# Commit dengan pesan yang jelas
git commit -m "feat: implement priority transactions features

- Add edit & delete functionality
- Add approval workflow (status system)
- Add advanced filters (date, amount, category, status)
- Update database schema
- Improve UI/UX with status badges and icons"

# Push ke branch
git push origin devv
```

---

## 🔍 Testing di Local

### Skenario 1: Workflow Lengkap

1. **Create transaksi baru**
   ```
   - Title: "Iuran Bulanan"
   - Amount: 500000
   - Type: Pemasukan
   - Category: Iuran
   - Date: Hari ini
   - Description: Iuran bulanan member
   ```

2. **Status awal = Pending**
   - Cek di table, status badge yellow
   - Tombol approve/reject muncul

3. **Approve transaksi**
   - Click tombol approve
   - Confirm dialog
   - Status berubah ke "approved" (hijau)
   - Approver info ter-save

4. **Try Edit**
   - Click edit pada approved transaksi
   - Edit amount atau description
   - Save
   - Data terupdate

5. **Try Delete**
   - Click delete
   - Confirm warning
   - Transaksi hilang

### Skenario 2: Advanced Filtering

1. **Setup data diverse:**
   - 5 pending transactions
   - 3 approved transactions
   - 2 rejected transactions
   - Mix of income/expense
   - Different categories

2. **Test filters:**
   - Filter status=pending → hanya 5 muncul
   - Filter status=approved → hanya 3 muncul
   - Filter type=income + status=pending → subset
   - Date range → transactions in range
   - Amount 200K-500K → only in range
   - Category=Iuran → only Iuran
   - Reset → all back

---

## ⚠️ Common Issues & Solutions

### Issue: Migration fails
```bash
# Solution: Check existing migrations
php artisan migrate:status

# If constraint error, rollback first:
php artisan migrate:rollback
php artisan migrate
```

### Issue: Frontend shows old data
```bash
# Solution: Clear browser cache
# Or in VS Code terminal:
npm run build
php artisan cache:clear
```

### Issue: Permission denied on approve
```bash
# Check user permissions in database
SELECT * FROM role_permissions WHERE role_id = 1;

# Ensure user has 'Transactions' 'edit' permission
```

### Issue: New fields undefined in model
```bash
# Make sure Transaction model fillable is updated
protected $fillable = [
    'title',
    'amount',
    'type',
    'description',
    'created_by',
    'date',
    'status',          // ← Added
    'approved_by',     // ← Added
    'category',        // ← Added
];
```

---

## 📊 Performance Tips

1. **Use pagination** for large datasets
   - Currently limit 15 per page (dapat diatur di controller)

2. **Indexes** sudah otomatis di migration
   - `status` indexed for filtering
   - `approved_by` indexed for joins

3. **Relationships loaded** dengan `with()`
   - `creator` - user yang create
   - `approver` - user yang approve

4. **Query optimization**
   - Status filter di SQL, bukan di PHP
   - Amount range filter di SQL

---

## 🎯 Success Criteria

✅ **Implementasi berhasil jika:**

1. Semua CRUD operations works (Create, Read, Update, Delete)
2. Approval workflow functional (status changes, approver recorded)
3. Filters working correctly (single & combined)
4. Status badges display correctly
5. Responsive on all screen sizes
6. No console errors
7. Database queries optimized
8. Permissions respected

---

## 📝 Notes

- **Data validation** sudah di backend (validated at API level)
- **Audit logging** otomatis di AuditLog model
- **Relationships** properly defined (creator, approver)
- **Timestamps** automatic (created_at, updated_at)

---

**Ready to deploy!** 🚀

Hubungi jika ada pertanyaan atau issues saat testing.
