<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get all app settings.
     */
    public function index()
    {
        $settings = AppSetting::all()->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Get public app settings (safe for guests).
     */
    public function getPublicSettings()
    {
        $keys = ['site_name', 'academic_period', 'osis_vision', 'osis_mission', 'maintenance_mode', 'site_logo', 'ketos_name', 'ketos_periode', 'ketos_sambutan', 'ketos_image', 'hero_image'];
        $settings = AppSetting::whereIn('key', $keys)->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Upload logo.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg,webp|max:5120', // Allow bigger upload
        ]);

        if ($request->file('logo')) {
            $file = $request->file('logo');
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/logo');
            
            // Ensure directory exists
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            // Clean up old logos
            $files = glob($destinationPath . '/*'); 
            foreach($files as $existingFile){ 
                if(is_file($existingFile)) {
                    unlink($existingFile);
                }
            }

            // Check if SVG, if so, just move it without processing
            if (strtolower($extension) === 'svg') {
                $fileName = time() . '_' . $originalName;
                $file->move($destinationPath, $fileName);
            } else {
                // Process image with Intervention Image
                // Strategy: Convert to WebP (superior compression) with HIGH quality
                // We do NOT resize unless absurdly large (> 4K)
                $fileName = time() . '_logo.webp';
                $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                $image = $manager->read($file);
                
                // Only scale down if width > 2000px (logo generally doesn't need 4K)
                // Otherwise keep original size
                if ($image->width() > 2000) {
                    $image->scale(width: 2000);
                }
                
                // Quality 100 means almost lossless but still smaller because of WebP format
                $image->toWebp(quality: 100)->save($destinationPath . '/' . $fileName);
            }

            $url = '/uploads/logo/' . $fileName;
            
            AppSetting::set('site_logo', $url);

            AuditLog::log('update_settings', 'Updated site logo');

            return response()->json([
                'url' => $url,
                'message' => 'Logo uploaded successfully'
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Upload Ketos Image.
     */
    public function uploadKetosImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,svg,webp|max:10240', // 10MB max
        ]);

        if ($request->file('image')) {
            $file = $request->file('image');
            $destinationPath = public_path('uploads/ketos');
            
            // Ensure directory exists
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            // Clean up old images
            $files = glob($destinationPath . '/*'); 
            foreach($files as $existingFile){ 
                if(is_file($existingFile)) {
                    unlink($existingFile);
                }
            }

            // Process image with Intervention Image
            $fileName = time() . '_ketos.webp';
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->read($file);
            
            // Limit to 4K width (plenty for any screen) to prevent server overload
            if ($image->width() > 3840) {
                $image->scale(width: 3840);
            }
            
            // Quality 95: Virtually indistinguishable from original, but much smaller file size
            $image->toWebp(quality: 95)->save($destinationPath . '/' . $fileName);

            $url = '/uploads/ketos/' . $fileName;
            
            AppSetting::set('ketos_image', $url);

            AuditLog::log('update_settings', 'Updated ketos image');

            return response()->json([
                'url' => $url,
                'message' => 'Ketos image uploaded successfully'
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Upload Hero Image.
     */
    public function uploadHeroImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:20480', // 20MB max
        ]);

        if ($request->file('image')) {
            $file = $request->file('image');
            $destinationPath = public_path('uploads/hero');
            
            // Ensure directory exists
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            // Clean up old images
            $files = glob($destinationPath . '/*'); 
            foreach($files as $existingFile){ 
                if(is_file($existingFile)) {
                    unlink($existingFile);
                }
            }

            // Process image with Intervention Image
            $fileName = time() . '_hero.webp';
            $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
            $image = $manager->read($file);
            
            // Keep original resolution unless it's absurdly huge (> 4K)
            if ($image->width() > 3840) {
                $image->scale(width: 3840);
            }
            
            // Quality 95 for Hero to look crisp on big screens
            $image->toWebp(quality: 95)->save($destinationPath . '/' . $fileName);

            $url = '/uploads/hero/' . $fileName;
            
            AppSetting::set('hero_image', $url);

            AuditLog::log('update_settings', 'Updated hero image');

            return response()->json([
                'url' => $url,
                'message' => 'Hero image uploaded successfully'
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    /**
     * Update app settings.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
        ]);

        foreach ($validated['settings'] as $setting) {
            AppSetting::set($setting['key'], $setting['value']);
        }

        AuditLog::log('update_settings', 'Updated app settings');

        return response()->json([
            'message' => 'Settings updated successfully',
        ]);
    }

    /**
     * Get all roles with permissions.
     */
    public function getRoles()
    {
        $roles = Role::with('permissions')->get();
        return response()->json($roles);
    }

    /**
     * Update role permissions.
     */
    public function updateRolePermissions(Request $request, Role $role)
    {
        $validated = $request->validate([
            'permissions' => 'required|array',
            'permissions.*.module_name' => 'required|string',
            'permissions.*.can_view' => 'required|boolean',
            'permissions.*.can_create' => 'required|boolean',
            'permissions.*.can_edit' => 'required|boolean',
            'permissions.*.can_delete' => 'required|boolean',
        ]);

        // Delete existing permissions
        $role->permissions()->delete();

        // Create new permissions
        foreach ($validated['permissions'] as $permission) {
            RolePermission::create([
                'role_id' => $role->id,
                'module_name' => $permission['module_name'],
                'can_view' => $permission['can_view'],
                'can_create' => $permission['can_create'],
                'can_edit' => $permission['can_edit'],
                'can_delete' => $permission['can_delete'],
            ]);
        }

        AuditLog::log('update_role_permissions', "Updated permissions for role: {$role->name}");

        return response()->json([
            'role' => $role->fresh()->load('permissions'),
            'message' => 'Role permissions updated successfully',
        ]);
    }

    /**
     * Get audit logs.
     */
    public function getAuditLogs(Request $request)
    {
        $query = AuditLog::with('user');

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($logs);
    }
}
