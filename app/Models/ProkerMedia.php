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

    /**
     * Get the proker that owns the media.
     */
    public function proker(): BelongsTo
    {
        return $this->belongsTo(Proker::class);
    }
}
