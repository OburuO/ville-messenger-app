<?php

namespace App\Models;

use App\Traits\Reactable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model 
{
    use HasFactory, Reactable;

    protected $fillable = [
        'message', 
        'sender_id',
        'group_id',
        'receiver_id',
        'parent_id',
        'post_id',

    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $with = ['sender', 'attachments', 'reactions'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function attachments()
    {
        return $this->hasMany(MessageAttachment::class);
    }

    // The reactions() method is provided by the Reactable trait
}