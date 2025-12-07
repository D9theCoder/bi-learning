<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DailyTaskController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\RewardController;
use App\Http\Controllers\RewardRedemptionController;
use App\Http\Controllers\TutorController;
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

    // Achievement routes
    Route::get('achievements', [AchievementController::class, 'index'])->name('achievements');

    // Calendar routes
    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::patch('tasks/{task}', [DailyTaskController::class, 'toggleComplete'])->name('tasks');

    // Course routes
    Route::get('courses', [CourseController::class, 'index'])->name('courses');
    Route::get('courses/{course}', [CourseController::class, 'show'])->name('courses.show');
    Route::post('courses/{course}/enroll', [EnrollmentController::class, 'store'])->name('courses.enroll');

    // Message routes
    Route::get('messages', [MessageController::class, 'index'])
        ->middleware('role:admin|tutor|student')
        ->name('messages');
    Route::get('messages/poll', [MessageController::class, 'poll'])
        ->middleware('role:admin|tutor|student')
        ->name('messages.poll');
    Route::post('messages', [MessageController::class, 'store'])
        ->middleware('role:tutor|student')
        ->name('messages.store');

    // Reward routes
    Route::get('rewards', [RewardController::class, 'index'])->name('rewards');
    Route::post('rewards/{reward}/redeem', [RewardRedemptionController::class, 'store'])->name('rewards.redeem');

    // Tutor routes
    Route::get('tutors', [TutorController::class, 'index'])->name('tutors');
});

require __DIR__.'/settings.php';
