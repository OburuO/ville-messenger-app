<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Route;
 
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Public profile route
Route::get('/profile/{user:username}', [ProfileController::class, 'index'])->name('profile'); 

Route::middleware(['auth', 'verified', 'active'])->group(function () { 
    // Admin routes
    Route::prefix('admin')->middleware(['admin'])->group(function () {
        Route::prefix('users')->group(function () {
            Route::post('/', [UserController::class, 'store'])->name('user.store');
            Route::post('/{user}/change-role', [UserController::class, 'changeRole'])->name('user.changeRole');
            Route::post('/{user}/block-unblock', [UserController::class, 'blockUnblock'])->name('user.blockUnblock');
        });
    });

    // User routes
    Route::prefix('users')->group(function () {
        Route::post('/{user}/follow', [UserController::class, 'follow'])->name('user.follow');
    });

    Route::get('/', [HomeController::class, 'home'])->name('dashboard'); 

    // Explore routes
    Route::prefix('explore')->group(function () {
        Route::get('/', [ExploreController::class, 'index'])->name('explore');
        Route::post('/search', [SearchController::class, 'search'])->name('search');
    });
    
    // Groups routes
    Route::prefix('groups')->group(function () {
        Route::post('/', [GroupController::class, 'store'])->name('group.store');
        Route::put('/{group}', [GroupController::class, 'update'])->name('group.update');
        Route::delete('/{group}', [GroupController::class, 'destroy'])->name('group.destroy');
        Route::get('/{group}/chat', [MessageController::class, 'byGroup'])->name('chat.group');
    });

    // Messages routes
    Route::prefix('messages')->group(function () {
        Route::get('/user/{user}', [MessageController::class, 'byUser'])->name('chat.user');
        Route::post('/', [MessageController::class, 'store'])->name('message.store');
        Route::delete('/{message}', [MessageController::class, 'destroy'])->name('message.destroy');
        Route::get('/{message}/older', [MessageController::class, 'loadOlder'])->name('message.loadOlder');
    });

    // Reaction routes - Universal for all entity types
    Route::post('/{type}/{id}/react', [ReactionController::class, 'react'])
        ->name('react')
        ->where('type', 'messages|posts|'); // Add more types as needed

});

// Settings routes (previously profile routes)
Route::middleware('auth')->group(function () {
    Route::get('/settings', [SettingsController::class, 'edit'])->name('profile.edit');
    Route::patch('/settings', [SettingsController::class, 'update'])->name('profile.update');
    Route::delete('/settings', [SettingsController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';