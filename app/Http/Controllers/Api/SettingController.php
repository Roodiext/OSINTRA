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
        $keys = ['site_name', 'academic_period', 'osis_vision', 'osis_mission', 'maintenance_mode', 'site_logo', 'ketos_name', 'ketos_periode', 'ketos_sambutan', 'ketos_image'];
        $settings = AppSetting::whereIn('key', $keys)->pluck('value', 'key');
        return response()->json($settings);
    }

    /**
     * Upload logo.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,svg|max:2048',
        ]);

        if ($request->file('logo')) {
            $file = $request->file('logo');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $destinationPath = public_path('uploads/logo');
            
            // Ensure directory exists
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            // Clean up old logos: User requested "maximum 1 photo", so we delete all existing files in this folder
            $files = glob($destinationPath . '/*'); 
            foreach($files as $existingFile){ 
                if(is_file($existingFile)) {
                    unlink($existingFile);
                }
            }

            $file->move($destinationPath, $fileName);
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
            'image' => 'required|image|mimes:jpeg,png,jpg,svg|max:5048',
        ]);

        if ($request->file('image')) {
            $file = $request->file('image');
            $fileName = time() . '_ketos_' . $file->getClientOriginalName();
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

            $file->move($destinationPath, $fileName);
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
