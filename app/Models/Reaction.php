<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'emoji',
        'reactable_id',
        'reactable_type'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the user who made the reaction
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the parent reactable model (message, post, etc.)
     */
    public function reactable()
    {
        return $this->morphTo();
    }

    /**
     * Scope to get reactions by emoji
     */
    public function scopeByEmoji($query, $emoji)
    {
        return $query->where('emoji', $emoji);
    }

    /**
     * Scope to get reactions by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get recent reactions
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}