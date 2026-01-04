# Testing & Verification Guide

## Quick Start Testing

### 1️⃣ Session Persistence Test (Main Fix)
```
Step 1: Login normally
  - Go to http://localhost/login
  - Enter valid credentials
  - Should redirect to /dashboard

Step 2: Check localStorage
  - Open DevTools (F12)
  - Go to Application → LocalStorage
  - Should see:
    ✅ auth_token = "eyJ0eXAi..." (long token string)
    ✅ user = {id, name, email, ...}

Step 3: Refresh Page (The Key Test)
  - Press F5 or Ctrl+R
  - Watch Network tab in DevTools
  - Should see:
    1. Page load starts
    2. GET /api/me request (with Authorization header) ✅
    3. 200 response with user data
    4. Page renders to /dashboard
    5. You see the dashboard content ✅
  
  ❌ FAIL: If redirected to /login after refresh
  ✅ PASS: If you stay on /dashboard

Step 4: Multiple Refreshes
  - Refresh 5+ times
  - Should stay logged in every time
  ✅ PASS: Consistent behavior

Step 5: New Tab Test
  - With login in Tab A, open new Tab B
  - Go to http://localhost/dashboard
  - Should automatically stay logged in
  - Because localStorage is shared
  ✅ PASS: New tab shows dashboard
```

### 2️⃣ Permission Test (Secondary System)
```
Step 1: Login as Admin
  - Credentials: admin account
  - Should access /dashboard ✅

Step 2: Check Multiple Pages (as Admin)
  - /dashboard/divisions ✅
  - /dashboard/positions ✅
  - /dashboard/users ✅
  - /dashboard/roles ✅
  - /dashboard/prokers ✅
  - /dashboard/proker-media ✅
  - /dashboard/messages ✅
  - /dashboard/transactions ✅
  - /dashboard/audit-logs ✅
  - /dashboard/settings ✅
  - /dashboard/report ✅
  
  ✅ PASS: All 11 pages accessible

Step 3: Login as Limited User
  - Create user with Limited Role
  - Assign only "Divisions" permission
  - Login
  
Step 4: Test Permission Denial
  - Try: /dashboard/divisions
    → Should load ✅
  - Try: /dashboard/users (no permission)
    → Should show SweetAlert2 warning
    → Message: "Anda tidak memiliki izin untuk mengakses halaman Users."
    → Redirect to /dashboard
    ✅ PASS: Alert shown correctly

Step 5: Test Permission Message
  - Check alert shows module name correctly
  - Verify "Users" not "user" (capitalization)
  ✅ PASS: Proper message displayed
```

### 3️⃣ Logout Test
```
Step 1: Login normally
  - On /dashboard
  - localStorage has auth_token ✅

Step 2: Click Logout Button
  - Should call POST /api/logout
  - Should clear localStorage
  - Should redirect to /login

Step 3: Refresh /dashboard after Logout
  - Should be redirected to /login
  - localStorage should be empty
  ✅ PASS: No auto-login after logout
```

### 4️⃣ Edge Cases

**Case A: Invalid Token**
```
Step 1: Manually set invalid token
  - DevTools → Application → LocalStorage
  - Set auth_token = "invalid-token-xyz"
  
Step 2: Refresh page
  - Watch Network → /api/me request
  - Should return 401 Unauthorized
  - localStorage auth_token should be cleared
  - Should redirect to /login
  ✅ PASS: Invalid token handled
```

**Case B: Expired Token**
```
Step 1: Wait for token to expire (or use expired token)
  - Set auth_token to actual token that's expired in DB
  
Step 2: Refresh page
  - /api/me returns 401
  - localStorage cleared
  - Redirect to /login
  ✅ PASS: Expired token handled
```

**Case C: No Token**
```
Step 1: Clear localStorage
  - DevTools → Application → LocalStorage
  - Remove auth_token key
  
Step 2: Refresh /dashboard
  - verifyToken() returns early (no token)
  - auth:sanctum middleware rejects
  - Redirect to /login
  ✅ PASS: No token handled
```

**Case D: Slow Network**
```
Step 1: Enable throttling
  - DevTools → Network → Slow 3G
  
Step 2: Refresh /dashboard
  - /api/me request takes time
  - But has 5-second timeout (won't hang forever)
  - Should complete or timeout gracefully
  ✅ PASS: No hanging
```

---

## DevTools Debugging

### Check Token Verification
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look for `/api/me` request
   - Should appear immediately after page load
   - Should have `Authorization: Bearer ...` header
   - Should return 200 with user data
   - Should be called before page renders

### Check localStorage
1. Application → LocalStorage → http://localhost
2. Should contain:
   ```
   auth_token = "eyJ0eXAiOiJKV1QiLCJhbGc..." (long token)
   user = {"id":1,"name":"Admin","email":"admin@example.com"...}
   ```
3. After logout:
   ```
   (empty - both keys removed)
   ```

### Check Console
1. Should NOT see errors like:
   - "Cannot read property 'token' of null"
   - "localStorage is undefined"
   - "axios is not defined"
2. May see info logs:
   - "Token verification failed: Invalid or expired token"
   - This is normal for expired tokens

### Check Network Headers
1. Every request after login should have:
   ```
   Authorization: Bearer {token}
   X-Requested-With: XMLHttpRequest
   ```
2. If missing, token wasn't set in axios defaults

---

## Common Issues & Solutions

### ❌ "Redirected to /login after refresh"
**Checklist:**
- [ ] Is `/api/me` endpoint working? Test with Postman
- [ ] Is auth_token in localStorage? Check DevTools
- [ ] Is token valid in database? Check personal_access_tokens table
- [ ] Are there JavaScript errors? Check Console
- [ ] Is /api/me being called? Check Network tab

**Fix:**
1. Verify LoginPage.tsx properly saves token:
   ```tsx
   localStorage.setItem('auth_token', response.data.token);
   localStorage.setItem('user', JSON.stringify(response.data.user));
   ```

2. Verify /api/me endpoint returns user:
   ```php
   return response()->json(['user' => auth()->user()]);
   ```

3. Check token is valid in DB:
   ```sql
   SELECT * FROM personal_access_tokens WHERE name='OSINTRA Token';
   ```

### ❌ "Permission denied for pages that should be allowed"
**Checklist:**
- [ ] Does user have permission in role_permissions table?
- [ ] Is middleware applied to route? (.middleware('check.permission:...'))
- [ ] Is permission module name exactly matching? ('Divisions' not 'divisions')
- [ ] Is user.role relationship loading? Check /api/me response

**Fix:**
1. Add permission to database:
   ```sql
   INSERT INTO role_permissions (role_id, module, action) 
   VALUES (2, 'Divisions', 'view');
   ```

2. Verify route middleware:
   ```php
   Route::get('/dashboard/divisions', ...)->middleware('check.permission:Divisions,view');
   ```

3. Check /api/me includes role:
   ```php
   auth()->user()->load('role.permissions');
   ```

### ❌ "Token not being sent in requests"
**Checklist:**
- [ ] Is Authorization header set in axios defaults?
- [ ] Does axios interceptor add header?
- [ ] Is token string valid (not null/undefined)?
- [ ] Are requests going to /api/* paths?

**Fix:**
1. Verify axios interceptor in lib/axios.ts:
   ```tsx
   axios.interceptors.request.use(config => {
       const token = localStorage.getItem('auth_token');
       if (token) {
           config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
   });
   ```

2. Check verifyToken sets default:
   ```tsx
   axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
   ```

### ❌ "/api/me returning 401"
**Checklist:**
- [ ] Is token in Authorization header?
- [ ] Is token format correct? (Bearer + space + token)
- [ ] Is token in personal_access_tokens table?
- [ ] Did token get revoked/deleted?
- [ ] Is token expired based on updated_at timestamp?

**Fix:**
1. Test with Postman:
   ```
   GET /api/me
   Header: Authorization: Bearer {token}
   ```

2. Check token in database:
   ```sql
   SELECT *, DATE_ADD(updated_at, INTERVAL 7 DAY) as expires_at 
   FROM personal_access_tokens 
   WHERE tokenable_id = 1;
   ```

3. Check token was created:
   ```sql
   SELECT * FROM personal_access_tokens 
   WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE);
   ```

---

## Performance Metrics

### Expected Times
- **verifyToken() API call**: ~50-200ms
- **App render time**: ~100-500ms
- **Total page load**: ~500-1500ms
- **Timeout threshold**: 5000ms (5 seconds)

### Optimization Tips
1. Token verification is async and won't block rendering
2. 5-second timeout ensures app renders even if API slow
3. Consider caching verified user data in session storage
4. Consider periodic re-verification (every 5 mins)

---

## Manual Testing Commands

### Using curl
```bash
# Login
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Response: {"token":"eyJ0eXAi...","user":{...}}

# Verify token (replace {token})
curl -H "Authorization: Bearer {token}" \
  http://localhost/api/me

# Should return: {"user":{...}}

# Logout
curl -X POST http://localhost/api/logout \
  -H "Authorization: Bearer {token}"
```

### Using Postman
1. POST `/api/login` with credentials
2. Copy `token` from response
3. Add to Authorization tab: Bearer {token}
4. GET `/api/me` → Should return user
5. POST `/api/logout` → Should return success

---

## After Testing Checklist

- [ ] Session persistence works (refresh = stay logged in)
- [ ] Multiple refreshes work consistently
- [ ] New tabs inherit login from localStorage
- [ ] Logout clears token and redirects
- [ ] Invalid tokens are handled gracefully
- [ ] Expired tokens redirect to login
- [ ] Admin can access all 11 protected pages
- [ ] Limited users only access assigned pages
- [ ] Permission denied shows alert and redirects
- [ ] Permission message displays correctly
- [ ] No JavaScript errors in console
- [ ] No network errors (all requests 200/401 as expected)
- [ ] Token is sent in all API requests
- [ ] Token verification happens before page renders

---

## Success Indicators ✅

### You Know It's Working When:
1. **Fresh login** → Refresh page → **Stay logged in** ✅
2. **Multiple refreshes** → **All work, no logout** ✅
3. **New browser tab** → **Auto-login via localStorage** ✅
4. **Click logout** → **Clear token and redirect** ✅
5. **Admin user** → **Access all 11 pages** ✅
6. **Limited user** → **Only assigned pages** ✅
7. **Denied page** → **Alert + redirect** ✅
8. **Invalid token** → **Auto-clear and redirect** ✅
9. **DevTools Network** → **/api/me called on load** ✅
10. **DevTools Console** → **No errors** ✅

If all 10 are green, you're done! 🎉

---

## Debugging Steps (In Order)

If something doesn't work:

1. **Check localStorage**
   - Has auth_token? Has user?
   
2. **Check Network tab**
   - Is /api/me being called?
   - What's the response status?
   - What are the response headers?

3. **Check Console**
   - Any JavaScript errors?
   - Any fetch/axios errors?

4. **Check backend logs**
   - Laravel: `storage/logs/laravel.log`
   - Any auth errors?

5. **Test API manually**
   - Use curl or Postman
   - Verify /api/me works with valid token
   - Verify /api/me fails with invalid token

6. **Check database**
   - personal_access_tokens table
   - Is token there?
   - Is it expired?

7. **Review code**
   - Is verifyToken() actually being called?
   - Is localStorage key exactly 'auth_token'?
   - Is Authorization header format correct?

---

*Created for: OSINTRA System Testing*
*Purpose: Verify authentication and permission implementation*
*Status: Ready for Testing*
