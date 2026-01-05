# Quick Command Reference

## Testing Commands

### 1. Clear Tokens & Start Fresh
```bash
php artisan tinker
> DB::table('personal_access_tokens')->delete()
> exit()

# Restart server if needed
php artisan serve
```

### 2. Monitor Server Logs
```bash
# Terminal 1: Watch logs in real-time
tail -f storage/logs/laravel.log

# Terminal 2: Run tests
# (Your testing commands)
```

### 3. Test Login via API
```bash
# Get token
RESPONSE=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}')

echo $RESPONSE | jq

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Token: $TOKEN"

# Test token validity
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/me | jq
```

### 4. Check Database
```bash
php artisan tinker

# Check all tokens
> DB::table('personal_access_tokens')->get()

# Check tokens for specific user
> DB::table('personal_access_tokens')->where('user_id', 1)->get()

# Delete a specific token
> DB::table('personal_access_tokens')->where('id', 1)->delete()

# Exit
> exit()
```

### 5. Check Laravel Config
```bash
php artisan tinker

# Check auth config
> config('auth')

# Check sanctum config
> config('sanctum')

# Exit
> exit()
```

## Browser Console Commands

```javascript
// Check if token is saved
localStorage.getItem('auth_token')

// Check user data
JSON.parse(localStorage.getItem('user'))

// Clear token (logout)
localStorage.removeItem('auth_token')
localStorage.removeItem('user')

// Verify token with backend
fetch('/api/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
})
.then(r => r.json())
.then(d => console.log(d))
.catch(e => console.log('Error:', e))
```

## File Locations

```
Config:
  └─ config/auth.php
  └─ config/sanctum.php
  └─ config/session.php

Controllers:
  └─ app/Http/Controllers/Api/AuthController.php

Middleware:
  └─ app/Http/Middleware/InertiaAuth.php
  └─ app/Http/Middleware/AuthenticateSanctum.php

Routes:
  └─ routes/api.php
  └─ routes/web.php

Frontend:
  └─ resources/js/app.tsx
  └─ resources/js/pages/LoginPage.tsx
  └─ resources/js/lib/axios.ts
  └─ resources/js/lib/auth.ts
```

## Artisan Commands

```bash
# Generate new app key
php artisan key:generate

# Run migrations
php artisan migrate

# Fresh migrate (delete all data)
php artisan migrate:fresh

# Fresh with seeding
php artisan migrate:fresh --seed

# Reset database
php artisan db:reset

# Seed database
php artisan db:seed

# Clear all cache
php artisan cache:clear

# Clear compiled classes
php artisan view:clear
```

## MySQL Commands (if needed)

```bash
# Connect to database
mysql -u root -p your_database_name

# Show users
SELECT * FROM users;

# Show personal access tokens
SELECT * FROM personal_access_tokens;

# Delete all tokens
DELETE FROM personal_access_tokens;

# Show tokens for specific user
SELECT * FROM personal_access_tokens WHERE user_id = 1;

# Exit
exit;
```

## Docker Commands (if using Docker)

```bash
# Build
docker-compose build

# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Execute command in container
docker-compose exec app php artisan migrate
docker-compose exec app php artisan tinker
```

## Git Commands (for version control)

```bash
# Check status
git status

# View recent changes
git diff

# Stage changes
git add .

# Commit
git commit -m "fix: session persistence improvements"

# Push
git push origin main

# View log
git log --oneline -n 10
```

## Debugging URLs

```
Development:
  http://localhost:8000/login
  http://localhost:8000/dashboard
  http://localhost:8000/api/me
  
DevTools:
  F12 - Open DevTools
  F12 → Console - View logs
  F12 → Network - View requests
  F12 → Application → Local Storage - View stored data
  
Features:
  http://localhost:8000/login - Login page
  http://localhost:8000/dashboard - Dashboard (protected)
  http://localhost:8000/permission-denied - Permission error
  http://localhost:8000/logout - Logout endpoint (if available)
```

## Quick Verification Checklist

```
Login:
  ✓ POST /api/login returns 200 with token
  ✓ localStorage has auth_token
  ✓ localStorage has user
  ✓ Redirect to /dashboard

Refresh:
  ✓ GET /api/me returns 200
  ✓ User stays on /dashboard
  ✓ No redirect to /login
  
Logout:
  ✓ POST /api/logout returns 200
  ✓ localStorage cleared
  ✓ Redirect to /login
  
Dashboard:
  ✓ Cannot access without token
  ✓ Can access with valid token
  ✓ Permissions checked correctly
```

## Common Issues & Quick Fixes

```bash
# Issue: Token not working
Fix: Delete all tokens
  php artisan tinker
  > DB::table('personal_access_tokens')->delete()
  > exit()
  # Login again

# Issue: Clear cache
Fix: 
  php artisan cache:clear
  php artisan view:clear
  php artisan config:clear

# Issue: Permission denied
Fix: Check user roles/permissions
  php artisan tinker
  > User::find(1)->load('role.permissions')
  > exit()

# Issue: Forgot password
Fix: Reset user password
  php artisan tinker
  > $user = User::find(1)
  > $user->password = Hash::make('newpassword')
  > $user->save()
  > exit()
```

---

Save this file for quick reference during development and testing!
