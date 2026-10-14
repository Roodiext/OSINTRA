<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Angkatan;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AngkatanController extends Controller
{
    /**
     * Display a listing of angkatans.
     */
    public function index()
    {
        return response()->json(Angkatan::withCount('users')->orderBy('name', 'desc')->get());
    }

    /**
     * Store a newly created angkatan.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:angkatans,name',
            'year' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        if (empty($validated['status'])) {
            $validated['status'] = 'active';
        }

        $angkatan = Angkatan::create($validated);
        AuditLog::log('create_angkatan', "Created angkatan: {$angkatan->name}");

        return response()->json([
            'angkatan' => $angkatan->loadCount('users'),
            'message' => 'Angkatan created successfully'
        ], 201);
    }

    /**
     * Update the specified angkatan.
     */
    public function update(Request $request, Angkatan $angkatan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:angkatans,name,' . $angkatan->id,
            'year' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $angkatan->update($validated);
        AuditLog::log('update_angkatan', "Updated angkatan: {$angkatan->name}");

        return response()->json([
            'angkatan' => $angkatan->fresh()->loadCount('users'),
            'message' => 'Angkatan updated successfully'
        ]);
    }

    /**
     * Remove the specified angkatan.
     */
    public function destroy(Angkatan $angkatan)
    {
        $name = $angkatan->name;
        $angkatan->delete();
        AuditLog::log('delete_angkatan', "Deleted angkatan: {$name}");

        return response()->json([
            'message' => 'Angkatan deleted successfully'
        ]);
    }
}
