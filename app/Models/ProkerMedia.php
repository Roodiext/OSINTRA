<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProkerMedia extends Model
{
    use HasFactory;

    protected $table = 'proker_media';

    protected $fillable = [
        'proker_id',
        'media_type',
        'media_url',
        'caption',
        'is_thumbnail',
        'is_highlight',
    ];

    protected $appends = ['thumbnail_url'];

    public function getThumbnailUrlAttribute()
    {
        // If media_url is like /assets/image.jpg, check for /assets/image_thumb.jpg
        if ($this->media_type === 'image' && $this->media_url) {
            $pathInfo = pathinfo($this->media_url);
            $thumbUrl = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
            
            // Check if file exists locally (optional optimization, or just return path)
            // For performance, we might just assume it exists if created correctly
            // But to be safe for old images, checks are good. 
            // However, file_exists check on every model load is slow. 
            // Better to just return the pattern and let browser 404 fallback? 
            // Or better: check ONLY if we know we generated it. 
            // For now, let's just return the thumb URL pattern. 
            // Wait, if it doesn't exist (old images), it will break.
            // Let's do a quick file check if it's a local asset.
            
            if (str_starts_with($thumbUrl, '/assets/')) {
                $localPath = public_path(substr($thumbUrl, 1)); // remove leading slash
                if (file_exists($localPath)) {
                    return $thumbUrl;
                }
            }
        }
        
        return $this->media_url;
    }

    /**
     * Get the proker that owns the media.
     */
    public function proker(): BelongsTo
    {
        return $this->belongsTo(Proker::class);
    }
}
