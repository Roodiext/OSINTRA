<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RolePermission extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'module_name',
        'can_view',
        'can_create',
        'can_edit',
        'can_delete',
        'can_approve',
        'is_blurred',
    ];

    protected $casts = [
        'can_view' => 'boolean',
        'can_create' => 'boolean',
        'can_edit' => 'boolean',
        'can_delete' => 'boolean',
        'can_approve' => 'boolean',
        'is_blurred' => 'boolean',
    ];

    /**
     * Get the role that owns the permission.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
