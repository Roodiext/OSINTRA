<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role_id',
        'position_id',
        'profile_picture',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the role that owns the user.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Get the position (jabatan) of the user.
     */
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    /**
     * Get the transactions created by the user.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'created_by');
    }

    /**
     * Get the audit logs for the user.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    /**
     * Get the prokers assigned to the user.
     */
    public function prokers(): BelongsToMany
    {
        return $this->belongsToMany(Proker::class, 'proker_anggota')
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * Check if user has permission for a module.
     */
    public function hasPermission(string $module, string $action): bool
    {
        // If no role, deny access
        if (!$this->role) {
            return false;
        }

        // Admin role always has all permissions
        if ($this->role->name === 'Admin') {
            return true;
        }

        // Check role permissions
        $permission = $this->role->permissions()
            ->where('module_name', $module)
            ->first();

        // If no permission record found, deny access
        if (!$permission) {
            return false;
        }

        // Check specific action permission
        return match($action) {
            'view' => (bool) $permission->can_view,
            'create' => (bool) $permission->can_create,
            'edit' => (bool) $permission->can_edit,
            'delete' => (bool) $permission->can_delete,
            default => false,
        };
    }
}
