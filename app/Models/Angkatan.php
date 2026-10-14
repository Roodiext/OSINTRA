<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Angkatan extends Model
{
    use HasFactory;

    protected $table = 'angkatans';

    protected $fillable = [
        'name',
        'year',
        'description',
        'status',
    ];

    /**
     * Users belonging to this angkatan
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
