<?php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ReactionResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'emoji' => $this->emoji,
            'user_id' => $this->user_id,
        ];
    }
} 