<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
    $query = User::with(['role', 'position']);

        // Filter by role
        if ($request->has('role_id')) {
            $query->where('role_id', $request->role_id);
        }

        // Filter by division (users who participate in prokers for the given division)
        if ($request->has('division_id')) {
            $query->whereHas('prokers', function ($q) use ($request) {
                $q->whereHas('divisions', function ($q2) use ($request) {
                    $q2->where('divisions.id', $request->division_id);
                });
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('username', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->paginate($request->get('per_page', 15));

        return response()->json($users);
    }

        /**
         * Search users by name or username.
         */
        public function search(Request $request)
        {
            $query = $request->get('q', '');

            if (strlen($query) < 2) {
                return response()->json(['data' => []]);
            }

            $users = User::where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('username', 'like', "%{$query}%");
            })
            ->where('status', 'active')
            ->select('id', 'name', 'username', 'email')
            ->limit(10)
            ->get();

            return response()->json(['data' => $users]);
        }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
            'position_id' => 'nullable|exists:positions,id',
            'profile_picture' => 'nullable|string',
            'profile_picture' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

    $validated['password'] = Hash::make($validated['password']);

    // remove any division_id if present
    unset($validated['division_id']);

    $user = User::create($validated);

        AuditLog::log('create_user', "Created user: {$user->name}");

        return response()->json([
            'user' => $user->load(['role', 'position']),
            'message' => 'User created successfully',
        ], 201);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
    return response()->json($user->load(['role', 'position', 'prokers']));
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:255|unique:users,username,' . $user->id,
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'password' => 'sometimes|string|min:8',
            'role_id' => 'sometimes|exists:roles,id',
            'position_id' => 'nullable|exists:positions,id',
            'profile_picture' => 'nullable|string',
            'profile_picture' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

    // ensure division_id not set on users
    unset($validated['division_id']);
    $user->update($validated);

        AuditLog::log('update_user', "Updated user: {$user->name}");

        return response()->json([
            'user' => $user->fresh()->load(['role', 'position']),
            'message' => 'User updated successfully',
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $name = $user->name;
        $user->delete();

        AuditLog::log('delete_user', "Deleted user: {$name}");

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
