# Permission Middleware - Testing Guide

## Quick Summary
✅ **Middleware-based permission system implemented**
- Pages blocked BEFORE rendering
- Unauthorized access redirects to dashboard with alert
- Alert shows on dashboard, not on unauthorized page

## What Changed?

### Old System (Removed)
```
Route → Page Renders → Hook Detects Permission Flag → Alert Shows
❌ Problem: Page content visible before alert
```

### New System (Active Now)
```
Route → Middleware Checks Permission → If Denied: Redirect → Alert on Dashboard
✅ Solution: Never renders unauthorized page
```

## Testing Instructions

### Step 1: Login with Different Roles

**Admin Account** (has all permissions)
- Username: admin
- Can access ALL pages
- No alerts

**Anggota Account** (limited permissions)
- Username: anggota  
- Can access: Dashboard, Profile
- Cannot access: Divisions, Positions, Users, Prokers, Messages, Transactions, Settings
- Will see alerts for unauthorized pages

### Step 2: Test Unauthorized Access

1. **Login as Anggota**

2. **Try Access Blocked Page**
   - Click URL: `http://localhost:8000/dashboard/transactions`
   - Expected: Redirected to `/dashboard`
   - Alert appears: "Akses Ditolak - Anda tidak memiliki izin untuk mengakses halaman Keuangan"
   - ✅ **Check**: TransactionsPage NEVER rendered

3. **Try Another Blocked Page**
   - Navigate to: `http://localhost:8000/dashboard/users`
   - Expected: Redirected to `/dashboard`
   - Alert appears: "Akses Ditolak - Anda tidak memiliki izin untuk mengakses halaman Pengguna"
   - ✅ **Check**: UsersPage NEVER rendered

### Step 3: Test Authorized Access

1. **Still logged in as Anggota**

2. **Try Authorized Page**
   - Navigate to: `http://localhost:8000/dashboard/divisions` (if Anggota has this permission)
   - Expected: Page loads normally
   - No alert shown
   - Page content visible
   - ✅ **Check**: Page renders successfully

### Step 4: Test Admin Access

1. **Logout (if needed) and Login as Admin**

2. **Try Any Protected Page**
   - Access: `/dashboard/transactions`
   - Expected: Page loads normally
   - No alert
   - All data visible
   - ✅ **Check**: Admin can access everything

### Step 5: Check Network Traffic (DevTools)

1. **Open Browser DevTools** (F12)

2. **Go to Network tab**

3. **Try access unauthorized page**
   - Watch network requests
   - Should see 302 redirect to `/dashboard`
   - NO request for unauthorized page handler
   - ✅ **Check**: Middleware blocks BEFORE controller executes

### Step 6: Verify Alert Elements

When alert appears:
- ✅ Icon: Error (red circle with X)
- ✅ Title: "Akses Ditolak"
- ✅ Message: Clear permission message
- ✅ Button: "Kembali ke Dashboard"
- ✅ Background: Blurred
- ✅ Not dismissible by clicking outside

## Permission Configuration

### Current Roles Setup

**Admin Role**
```
All permissions granted automatically
No configuration needed
```

**Anggota Role** (Default Limited)
```
Typically has:
- Dashboard: view
- Profile: view, edit
(Other modules can be configured in Settings)
```

### Change Permissions

1. Login as Admin
2. Go to: `http://localhost:8000/dashboard/settings/role-access`
3. Select role (e.g., "Anggota")
4. Toggle permissions for each module
5. Click "Simpan Perubahan"
6. Permissions apply on next user login

## Troubleshooting

### Issue: Page still renders even without permission

**Solution**: Clear browser cache and logout/login
```
1. Press F5 to refresh
2. Clear browser cache (Ctrl+Shift+Delete)
3. Logout and login again
```

### Issue: Alert doesn't show

**Solution**: Check browser console for errors
```
1. Open DevTools (F12)
2. Check Console tab
3. Look for JavaScript errors
4. Check if SweetAlert2 is loaded
```

### Issue: Can't see permission settings page

**Solution**: Must be logged in as Admin
```
1. Verify login as Admin account
2. Check user role in database
3. Verify 'Admin' role has Settings:edit permission
```

## Permission Modules & Actions

### Available Modules
1. **Dashboard** - Access main dashboard
2. **Divisions** - Manage divisi/divisions
3. **Positions** - Manage posisi/positions
4. **Users** - Manage users
5. **Prokers** - Manage program kerja
6. **Messages** - View messages
7. **Transactions** - View financial transactions
8. **Settings** - Access settings
9. **Profile** - User profile management

### Available Actions
- **view** - View/read access
- **create** - Create new items
- **edit** - Edit existing items
- **delete** - Delete items

### Protected Routes with Actions

| Route | Module | Action | Feature |
|-------|--------|--------|---------|
| /dashboard/divisions | Divisions | view | List divisions |
| /dashboard/positions | Positions | view | List positions |
| /dashboard/users | Users | view | List users |
| /dashboard/prokers | Prokers | view | List program kerja |
| /dashboard/prokers/{id} | Prokers | view | View detail |
| /dashboard/prokers/{id}/edit | Prokers | edit | Edit program kerja |
| /dashboard/messages | Messages | view | View messages |
| /dashboard/transactions | Transactions | view | View finances |
| /dashboard/settings | Settings | view | Access settings |
| /dashboard/settings/role-access | Settings | edit | Configure permissions |
| /dashboard/audit-logs | Settings | view | View audit logs |

## Expected Behaviors

### ✅ Correct Behaviors

1. **Unauthorized user accesses blocked page**
   - Immediate redirect to `/dashboard`
   - Alert appears on dashboard
   - Page never renders
   - User stays on dashboard

2. **Authorized user accesses allowed page**
   - Page loads normally
   - No alert shown
   - Data displays
   - User can interact with page

3. **Admin accesses any page**
   - All pages accessible
   - All data visible
   - No permission restrictions

4. **Permission changes**
   - Changes take effect on next login
   - Session updated with new permissions
   - Routes re-check on each access

### ❌ Wrong Behaviors (Report if Found)

1. ❌ Page renders then alert shows
2. ❌ Alert on unauthorized page instead of dashboard
3. ❌ User can see unauthorized page content briefly
4. ❌ Permission changes apply without logout
5. ❌ Admin restricted from any page

## Quick Test Checklist

### Before Testing
- [ ] Backend (Laravel) running on http://localhost:8000
- [ ] Frontend built (npm run build)
- [ ] Database migrated (artisan migrate)
- [ ] Roles & Permissions seeded

### Quick Tests
- [ ] Anggota cannot access /dashboard/transactions
- [ ] Anggota redirected to /dashboard
- [ ] Alert appears on /dashboard
- [ ] TransactionsPage never renders (check Network tab)
- [ ] Admin can access all pages
- [ ] No alerts for authorized pages
- [ ] Permissions work after changing in Settings

### Network Check
- [ ] No XHR request to transaction route
- [ ] Redirect response (302) visible in Network
- [ ] Response goes to /dashboard redirect

## Next Steps

After verification:
1. ✅ Run full test suite
2. ✅ Test with multiple user roles
3. ✅ Verify database has correct permissions
4. ✅ Check logs for any errors
5. ✅ Deploy to production

## Support & Documentation

- Main docs: [MIDDLEWARE_PERMISSION_IMPLEMENTATION.md](MIDDLEWARE_PERMISSION_IMPLEMENTATION.md)
- Permission system: [PERMISSION_SYSTEM_DOCUMENTATION.md](PERMISSION_SYSTEM_DOCUMENTATION.md)
- Developer guide: [DEVELOPER_GUIDE_PERMISSION_SYSTEM.md](DEVELOPER_GUIDE_PERMISSION_SYSTEM.md)

---

**Last Updated**: January 2025
**System Status**: ✅ Ready for Testing
