<?php

namespace App\Http\Resources;

use App\Models\Follower;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public static $wrap = false;

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array 
    {
        return [
            'id' => $this->id,
            'avatar_url' => $this->avatar ? Storage::url($this->avatar) : null,
            'name' => $this->name,
            'username' => $this->username,
            'bio' => $this->bio,
            'location' => $this->location,
            'email' => $this->email,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_admin' => (bool) $this->is_admin,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date,
            'follower_count' => $this->follower_count ?? Follower::where('user_id', $this->id)->count(),
            'following_count' => $this->following_count ?? Follower::where('follower_id', $this->id)->count(),
        ];
    }
}