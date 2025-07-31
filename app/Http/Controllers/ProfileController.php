<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostResource;
use App\Http\Resources\UserResource;
use App\Models\Follower;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
 
class ProfileController extends Controller 
{
    public function index(Request $request, User $user)
    {
        $isCurrentUserFollower = false;

        if (!Auth::guest()) {
            $isCurrentUserFollower = Follower::where('user_id', $user->id)->where('follower_id', Auth::id())->exists();
        }

        $followerCount = Follower::where('user_id', $user->id)->count();
        $followingCount = Follower::where('follower_id', $user->id)->count();

        $followers = $user->followers()->get();

        $followings = $user->followings()->get();

        return Inertia::render('Profile/View', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'success' => session('success'),
            'isCurrentUserFollower' => $isCurrentUserFollower,
            'followerCount' => $followerCount,
            'followingCount' => $followingCount,
            'user' => new UserResource($user),
            'followers' => UserResource::collection($followers),
            'followings' => UserResource::collection($followings), 
        ]);
    }

}
