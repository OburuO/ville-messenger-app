<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class User extends Authenticatable
{
    use HasFactory, Notifiable;
    use HasSlug;

    /**
     * The attributes that are mass assignable. 
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'avatar',
        'name',
        'username',
        'location',
        'bio',
        'email',
        'cover',
        'email_verified_at',
        'password',
        'is_admin'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
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
        ];
    }

    public function getSlugOptions() : SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom(function ($model) {
                return strtolower(str_replace(' ', '', $model->name)); // Removes spaces and converts to lowercase
            })
            ->saveSlugsTo('username')
            ->doNotGenerateSlugsOnUpdate();
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_users');
    }

    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'user_id', 'follower_id');
    }

    public function followings(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'followers', 'follower_id', 'user_id');
    }

    public static function getUsersExceptUser(User $user) 
    {
        $userId = $user->id;
        $query = User::select(['users.*', 'messages.message as last_message', 'messages.created_at as last_message_date'])
            ->where('users.id', '!=', $userId)
            ->when(!$user->is_admin, function ($query) use ($userId) {
                $query->whereNull('users.blocked_at')
                    ->where(function($q) use ($userId) {
                        // Get users that the current user follows
                        $q->whereExists(function ($subquery) use ($userId) {
                            $subquery->select('follower_id')
                                ->from('followers')
                                ->whereColumn('followers.user_id', 'users.id')
                                ->where('followers.follower_id', $userId);
                        })
                        // Or get users that have a conversation with the current user
                        ->orWhereExists(function ($subquery) use ($userId) {
                            $subquery->select('id')
                                ->from('conversations')
                                ->where(function ($q) use ($userId) {
                                    $q->where('user_id1', $userId)
                                        ->whereColumn('user_id2', 'users.id');
                                })
                                ->orWhere(function ($q) use ($userId) {
                                    $q->where('user_id2', $userId)
                                        ->whereColumn('user_id1', 'users.id');
                                });
                        });
                    });
            })
            ->leftJoin('conversations', function ($join) use ($userId) {
                $join->on('conversations.user_id1', '=', 'users.id')
                    ->where('conversations.user_id2', '=', $userId)
                    ->orWhere(function ($query) use ($userId) {
                        $query->on('conversations.user_id2', '=', 'users.id') 
                            ->where('conversations.user_id1', '=', $userId);
                    });
            })
            ->leftJoin('messages', 'messages.id', '=', 'conversations.last_message_id')
            ->orderByRaw('IFNULL(users.blocked_at, 1)')
            ->orderBy('messages.created_at', 'desc')
            ->orderBy('users.name');

        return $query->get();
    }

    public function toConversationArray() 
    {
        return [ 
            'id' => $this->id,
            'avatar_url' => $this->avatar ? Storage::url($this->avatar) : null,
            'name' => $this->name,
            'is_group' => false,
            'is_user' => true,
            'is_admin' => (bool) $this->is_admin,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'blocked_at' => $this->blocked_at,
            'last_message' => $this->last_message,
            'last_message_date' => $this->last_message_date ? ($this->last_message_date . ' UTC') : null,
        ];
    }
}
