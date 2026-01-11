<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proker;
use App\Models\ProkerAnggota;
use App\Models\ProkerMedia;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProkerController extends Controller
{
    /**
     * Display a listing of prokers.
     */
    public function index(Request $request)
    {
        $query = Proker::with(['divisions', 'media', 'anggota.user']);

        // Filter by division (prokers that have the given division)
        if ($request->has('division_id')) {
            $query->whereHas('divisions', function ($q) use ($request) {
                $q->where('divisions.id', $request->division_id);
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
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $prokers = $query->orderBy('date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json($prokers);
    }

    /**
     * Store a newly created proker.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'division_ids' => 'required|array',
            'division_ids.*' => 'exists:divisions,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:date',
            'location' => 'nullable|string',
            'status' => 'sometimes|in:planned,ongoing,done',
            'anggota' => 'nullable|array',
            'anggota.*.user_id' => 'required|exists:users,id',
            'anggota.*.role' => 'nullable|string',
        ]);

        $proker = Proker::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'date' => $validated['date'],
            'end_date' => $validated['end_date'] ?? null,
            'location' => $validated['location'] ?? null,
            'status' => $validated['status'] ?? 'planned',
        ]);

        // attach divisions
        if (!empty($validated['division_ids'])) {
            $proker->divisions()->sync($validated['division_ids']);
        }

        // Add anggota if provided
        if (isset($validated['anggota'])) {
            foreach ($validated['anggota'] as $anggota) {
                ProkerAnggota::create([
                    'proker_id' => $proker->id,
                    'user_id' => $anggota['user_id'],
                    'role' => $anggota['role'] ?? null,
                ]);
            }
        }

        AuditLog::log('create_proker', "Created proker: {$proker->title}");

        return response()->json([
            'proker' => $proker->load(['divisions', 'anggota.user']),
            'message' => 'Proker created successfully',
        ], 201);
    }

    /**
     * Display the specified proker with full details.
     */
    public function show(Proker $proker)
    {
        return response()->json($proker->load([
            'divisions',
            'media',
            'anggota' => function($query) {
                $query->with(['user', 'position', 'division']);
            }
        ]));
    }

    /**
     * Update the specified proker.
     */
    public function update(Request $request, Proker $proker)
    {
        $validated = $request->validate([
            'division_ids' => 'sometimes|array',
            'division_ids.*' => 'exists:divisions,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:date',
            'location' => 'nullable|string',
            'status' => 'sometimes|in:planned,ongoing,done',
        ]);

        // Update only the fields that don't require special handling
        $updateData = array_diff_key($validated, array_flip(['division_ids']));
        $proker->update($updateData);

        // Handle division_ids separately
        if ($request->has('division_ids')) {
            $proker->divisions()->sync($request->division_ids ?: []);
        }

        AuditLog::log('update_proker', "Updated proker: {$proker->title}");

        return response()->json([
            'proker' => $proker->fresh()->load(['divisions', 'media', 'anggota.user']),
            'message' => 'Proker updated successfully',
        ]);
    }

    /**
     * Remove the specified proker.
     */
    public function destroy(Proker $proker)
    {
        $title = $proker->title;
        $proker->delete();

        AuditLog::log('delete_proker', "Deleted proker: {$title}");

        return response()->json([
            'message' => 'Proker deleted successfully',
        ]);
    }

    /**
     * Add anggota to proker.
     */
    public function addAnggota(Request $request, Proker $proker)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'nullable|string',
            'division_id' => 'nullable|exists:divisions,id',
            'position_id' => 'nullable|exists:positions,id',
        ]);

        $anggota = ProkerAnggota::create([
            'proker_id' => $proker->id,
            'user_id' => $validated['user_id'],
            'role' => $validated['role'] ?? null,
            'division_id' => $validated['division_id'] ?? null,
            'position_id' => $validated['position_id'] ?? null,
        ]);

        AuditLog::log('add_proker_anggota', "Added anggota to proker: {$proker->title}");

        return response()->json([
            'anggota' => $anggota->load('user'),
            'message' => 'Anggota added successfully',
        ], 201);
    }

    /**
     * Remove anggota from proker.
     */
    public function removeAnggota(Proker $proker, ProkerAnggota $anggota)
    {
        if ($anggota->proker_id !== $proker->id) {
            return response()->json(['message' => 'Anggota not found in this proker'], 404);
        }

        $anggota->delete();

        AuditLog::log('remove_proker_anggota', "Removed anggota from proker: {$proker->title}");

        return response()->json([
            'message' => 'Anggota removed successfully',
        ]);
    }

    /**
     * Add media to proker (with file upload).
     */
    public function uploadMedia(Request $request, Proker $proker)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp,mp4,mov,avi|max:10240', // 10MB max
            'caption' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        $mediaType = str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'video';
        
        // Generate a unique filename
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9.]+/', '_', $file->getClientOriginalName());
        
        // Move directly to public/assets
        $file->move(public_path('assets'), $filename);
        
        // URL is now direct
        $mediaUrl = '/assets/' . $filename;

        $media = ProkerMedia::create([
            'proker_id' => $proker->id,
            'media_type' => $mediaType,
            'media_url' => $mediaUrl,
            'caption' => $validated['caption'] ?? null,
        ]);

        AuditLog::log('add_proker_media', "Added media to proker: {$proker->title}");

        return response()->json([
            'media' => $media,
            'message' => 'Media uploaded successfully',
        ], 201);
    }

    /**
     * Add media to proker (with URL).
     */
    public function addMedia(Request $request, Proker $proker)
    {
        $validated = $request->validate([
            'media_type' => 'required|in:image,video',
            'media_url' => 'required|string',
            'caption' => 'nullable|string',
        ]);

        $media = ProkerMedia::create([
            'proker_id' => $proker->id,
            'media_type' => $validated['media_type'],
            'media_url' => $validated['media_url'],
            'caption' => $validated['caption'] ?? null,
        ]);

        AuditLog::log('add_proker_media', "Added media to proker: {$proker->title}");

        return response()->json([
            'media' => $media,
            'message' => 'Media added successfully',
        ], 201);
    }

    /**
     * Remove media from proker.
     */
    public function removeMedia(Proker $proker, ProkerMedia $media)
    {
        if ($media->proker_id !== $proker->id) {
            return response()->json(['message' => 'Media not found in this proker'], 404);
        }

        // 1. Try deleting from public/assets (New way)
        if (str_starts_with($media->media_url, '/assets/')) {
            $filename = basename($media->media_url);
            $filePath = public_path('assets/' . $filename);
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        
        // 2. Try deleting from storage (Old way / Backup)
        elseif (str_starts_with($media->media_url, '/storage/')) {
            $filePath = str_replace('/storage/', '', $media->media_url);
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }
        }

        $media->delete();

        AuditLog::log('remove_proker_media', "Removed media from proker: {$proker->title}");

        return response()->json([
            'message' => 'Media removed successfully',
        ]);
    }

    /**
     * Get all proker media for public gallery.
     */
    public function publicGallery()
    {
        $media = ProkerMedia::with('proker:id,title,date')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($media);
    }

    /**
     * Set specific media as thumbnail.
     */
    public function setThumbnail(Proker $proker, ProkerMedia $media)
    {
        if ($media->proker_id !== $proker->id) {
            return response()->json(['message' => 'Media not found in this proker'], 404);
        }

        // Reset all thumbnails for this proker
        $proker->media()->update(['is_thumbnail' => false]);

        // Set new thumbnail
        $media->update(['is_thumbnail' => true]);

        AuditLog::log('update_proker_thumbnail', "Set thumbnail for proker: {$proker->title}");

        return response()->json([
            'message' => 'Thumbnail berhasil diupdate',
            'media' => $media
        ]);
    }

    public function getAllMedia()
    {
        $media = ProkerMedia::with('proker.divisions')
            ->whereHas('proker', function($query) {
                $query->where('status', 'done');
            })
            ->latest()
            ->get();

        return response()->json($media);
    }
}
