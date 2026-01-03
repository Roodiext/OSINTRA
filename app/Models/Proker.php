<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Proker extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'date',
        'end_date',
        'location',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * The divisions related to this proker (many-to-many).
     */
    public function divisions(): BelongsToMany
    {
        return $this->belongsToMany(Division::class, 'proker_division');
    }

    /**
     * Get the media for the proker.
     */
    public function media(): HasMany
    {
        return $this->hasMany(ProkerMedia::class);
    }

    /**
     * Get the anggota for the proker.
     */
    public function anggota(): HasMany
    {
        return $this->hasMany(ProkerAnggota::class);
    }

    /**
     * Get the users assigned to the proker.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'proker_anggota')
            ->withPivot('role')
            ->withTimestamps();
    }
}
