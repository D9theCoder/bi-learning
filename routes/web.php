<?php

use App\Http\Controllers\DashboardController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'userCount' => User::count(),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Course routes (placeholder for future implementation)
    Route::get('courses', fn () => Inertia::render('courses/index'))->name('courses');
    Route::get('courses/{course}', fn () => Inertia::render('courses/show'))->name('courses.show');

    // Achievement routes (placeholder)
    Route::get('achievements', fn () => Inertia::render('achievements/index'))->name('achievements');

    // Reward routes (placeholder)
    Route::get('rewards', fn () => Inertia::render('rewards/index'))->name('rewards');

    // Tutor routes (placeholder)
    Route::get('tutors', fn () => Inertia::render('tutors/index'))->name('tutors');

    // Calendar routes (placeholder)
    Route::get('calendar', fn () => Inertia::render('calendar/index'))->name('calendar');

    // Message routes (placeholder)
    Route::get('messages', fn () => Inertia::render('messages/index'))->name('messages');
});

require __DIR__.'/settings.php';
