<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
            ->orWhere('email', $request->username)
            ->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'username' => ['Username or email not found.'],
            ]);
        }

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password is incorrect.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'username' => ['Your account is inactive.'],
            ]);
        }

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log the login
        AuditLog::log('login', 'User logged in', $user->id);

        return response()->json([
            'user' => $user->load(['role', 'position']),
            'token' => $token,
        ]);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        AuditLog::log('logout', 'User logged out');
        
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        \Log::info('AuthController@me: User data retrieved', [
            'user_id' => $user->id,
            'username' => $user->username,
        ]);

        return response()->json([
            'user' => $user->load(['role.permissions', 'position']),
        ]);
    }

    /**
     * Update profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|unique:users,username,' . $user->id,
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'profile_picture' => 'sometimes|nullable|string',
        ]);

        $user->update($validated);

        AuditLog::log('update_profile', 'User updated their profile');

        return response()->json([
            'user' => $user->fresh()->load(['role', 'position']),
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        AuditLog::log('change_password', 'User changed their password');

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
