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
     * Display a listing ofcomposer  prokers.
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

        // 1. Get all media associated with this proker
        $medias = $proker->media;

        // 2. Loop through and delete physical files
        foreach ($medias as $media) {
            // Check if file is in public/assets (New way)
            if (str_starts_with($media->media_url, '/assets/')) {
                $filename = basename($media->media_url);
                $filePath = public_path('assets/' . $filename);
                
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
            }
            // Check if file is in storage (Old way / Backup)
            elseif (str_starts_with($media->media_url, '/storage/')) {
                $filePath = str_replace('/storage/', '', $media->media_url);
                if (Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }
        }

        // 3. Delete proker (Cascading delete in DB will handle media records, but we double check)
        $proker->media()->delete(); // Delete media records explicitly first
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
    /**
     * Add media to proker (with file upload).
     */
    public function uploadMedia(Request $request, Proker $proker)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:jpeg,jpg,png,gif,webp|max:20480', // 20MB max, Images only
            'caption' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        $mediaType = 'image'; // Enforce image type
        
        // Generate a unique filename with webp extension
        $cleanName = preg_replace('/[^a-zA-Z0-9]+/', '_', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename = time() . '_' . $cleanName . '.webp';
        $destinationPath = public_path('assets');
        
        // Ensure directory exists
        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        // Process image with Intervention Image
        $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
        $image = $manager->read($file);
        
        // Scale down width to max 1920px for documentation gallery to heavily reduce size
        if ($image->width() > 1920) {
            $image->scale(width: 1920);
        }
        
        // Initial decent quality
        $quality = 85;
        $image->toWebp(quality: $quality)->save($destinationPath . '/' . $filename);
        
        // Ensure file size is below 1MB (1,048,576 bytes)
        while (file_exists($destinationPath . '/' . $filename) && filesize($destinationPath . '/' . $filename) > 1048576 && $quality > 20) {
            $quality -= 10;
            $image->toWebp(quality: $quality)->save($destinationPath . '/' . $filename);
        }
        
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
            
            // Delete main file
            if (file_exists($filePath)) {
                unlink($filePath);
            }

            // Delete thumbnail file if exists (cleanup old files)
            $pathInfo = pathinfo($filePath);
            $thumbPath = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
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

    /**
     * Toggle highlight status for media.
     */
    public function toggleHighlight(Proker $proker, ProkerMedia $media)
    {
        if ($media->proker_id !== $proker->id) {
            return response()->json(['message' => 'Media not found in this proker'], 404);
        }

        $newState = !$media->is_highlight;

        if ($newState) {
            // If turning ON, check limit of 5
            $currentHighlights = $proker->media()->where('is_highlight', true)->count();
            if ($currentHighlights >= 5) {
                return response()->json([
                    'message' => 'Maksimal 5 foto highlight per proker (selain thumbnail)'
                ], 400); 
            }
        }

        $media->update(['is_highlight' => $newState]);

        AuditLog::log('update_media_highlight', "Toggled highlight for media in: {$proker->title}");

        return response()->json([
            'message' => 'Status highlight berhasil diupdate',
            'media' => $media
        ]);
    }

    public function getAllMedia()
    {
        // Limit to 24 most recent media items to keep the initial load light
        $media = ProkerMedia::with('proker.divisions')
            ->whereHas('proker', function($query) {
                $query->where('status', 'done');
            })
            ->latest()
            ->limit(24) 
            ->get();

        return response()->json($media);
    }


}
