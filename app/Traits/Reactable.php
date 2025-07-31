<?php

namespace App\Traits;

use App\Models\Reaction;

trait Reactable
{
    /**
     * Get all reactions for this model
     */
    public function reactions()
    {
        return $this->morphMany(Reaction::class, 'reactable');
    }

    /**
     * Get grouped reactions (grouped by emoji)
     */
    public function getGroupedReactionsAttribute()
    {
        return $this->reactions
            ->groupBy('emoji')
            ->map(function ($reactions, $emoji) {
                return [
                    'emoji' => $emoji,
                    'count' => $reactions->count(),
                    'users' => $reactions->pluck('user')->unique('id')->values(),
                    'user_reacted' => $reactions->where('user_id', auth()->id())->isNotEmpty()
                ];
            })
            ->values();
    }

    /**
     * Check if the current user has reacted to this model
     */
    public function hasUserReacted($userId = null)
    {
        $userId = $userId ?? auth()->id();
        return $this->reactions()->where('user_id', $userId)->exists();
    }

    /**
     * Get the current user's reaction
     */
    public function getUserReaction($userId = null)
    {
        $userId = $userId ?? auth()->id();
        return $this->reactions()->where('user_id', $userId)->first();
    }

    /**
     * Toggle a reaction for the current user
     */
    public function toggleReaction($emoji, $userId = null)
    {
        $userId = $userId ?? auth()->id();
        
        $existingReaction = $this->reactions()->where('user_id', $userId)->first();
        
        if ($existingReaction) {
            if ($existingReaction->emoji === $emoji) {
                // Same emoji, remove it
                $existingReaction->delete();
                return ['action' => 'removed', 'reaction' => null];
            } else {
                // Different emoji, update it
                $existingReaction->update(['emoji' => $emoji]);
                return ['action' => 'updated', 'reaction' => $existingReaction->fresh()];
            }
        } else {
            // No existing reaction, create new one
            $reaction = $this->reactions()->create([
                'user_id' => $userId,
                'emoji' => $emoji
            ]);
            return ['action' => 'created', 'reaction' => $reaction];
        }
    }
}