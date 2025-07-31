<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Settings/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $avatar = $request->file('avatar');
        $cover = $request->file('cover');
        $user = $request->user();
        $data = $request->validated();

        if ($cover) {
            if ($user->cover) {
                Storage::disk('public')->delete($user->cover);
            }

            // Generate unique filename for the avatar
            $coverName = uniqid('cover_') . '.' . $cover->getClientOriginalExtension();

            $user->cover = $cover->storeAs('covers', $coverName, 'public');
        }

        if ($avatar) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // Generate unique filename for the avatar
            $avatarName = uniqid('avatar_') . '.' . $avatar->getClientOriginalExtension();

            $user->avatar = $avatar->storeAs('avatars', $avatarName, 'public');
        }

        unset($data['avatar']);

        $user->fill($data);

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return back();
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
