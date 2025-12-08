<?php

use App\Http\Controllers\AchievementController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseManagementController;
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
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->middleware('role:student|tutor|admin')
        ->name('dashboard');

    // Achievement routes
    Route::get('achievements', [AchievementController::class, 'index'])
        ->middleware('role:student|admin')
        ->name('achievements');

    // Calendar routes
    Route::get('calendar', [CalendarController::class, 'index'])
        ->middleware('role:student|tutor|admin')
        ->name('calendar');
    Route::patch('tasks/{task}', [DailyTaskController::class, 'toggleComplete'])
        ->middleware('role:student|tutor|admin')
        ->name('tasks.toggle');

    // Course routes
    Route::get('courses', [CourseController::class, 'index'])->name('courses');

    // Course management routes (admin/tutor)
    Route::middleware('role:admin|tutor')->prefix('courses/manage')->name('courses.manage.')->group(function () {
        Route::get('/', [CourseManagementController::class, 'index'])->name('index');
        Route::get('/create', [CourseManagementController::class, 'create'])->name('create');
        Route::post('/', [CourseManagementController::class, 'store'])->name('store');
        Route::get('/{course}/edit', [CourseManagementController::class, 'edit'])->name('edit');
        Route::put('/{course}', [CourseManagementController::class, 'update'])->name('update');
        Route::post('/{course}/lessons', [CourseManagementController::class, 'storeLesson'])->name('lessons.store');
        Route::put('/{course}/lessons/{lesson}', [CourseManagementController::class, 'updateLesson'])->name('lessons.update');
        Route::delete('/{course}/lessons/{lesson}', [CourseManagementController::class, 'destroyLesson'])->name('lessons.destroy');
        Route::post('/{course}/lessons/{lesson}/contents', [CourseManagementController::class, 'storeContent'])->name('contents.store');
        Route::put('/{course}/lessons/{lesson}/contents/{content}', [CourseManagementController::class, 'updateContent'])->name('contents.update');
        Route::delete('/{course}/lessons/{lesson}/contents/{content}', [CourseManagementController::class, 'destroyContent'])->name('contents.destroy');
    });

    Route::get('courses/{course}', [CourseController::class, 'show'])
        ->whereNumber('course')
        ->name('courses.show');
    Route::post('courses/{course}/enroll', [EnrollmentController::class, 'store'])
        ->middleware('role:student|admin')
        ->whereNumber('course')
        ->name('courses.enroll');

    // Message routes
    Route::get('messages', [MessageController::class, 'index'])->name('messages');
    Route::get('messages/poll', [MessageController::class, 'poll'])->name('messages.poll');
    Route::post('messages', [MessageController::class, 'store'])->name('messages.store');

    // Reward routes
    Route::get('rewards', [RewardController::class, 'index'])
        ->middleware('role:student|admin')
        ->name('rewards');
    Route::post('rewards/{reward}/redeem', [RewardRedemptionController::class, 'store'])
        ->middleware('role:student|admin')
        ->name('rewards.redeem');

    // Tutor routes
    Route::get('tutors', [TutorController::class, 'index'])->name('tutors');
});

require __DIR__.'/settings.php';
