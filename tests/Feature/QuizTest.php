<?php

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Powerup;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    $this->withoutMiddleware([
        ValidateCsrfToken::class,
        VerifyCsrfToken::class,
    ]);

    app(PermissionRegistrar::class)->forgetCachedPermissions();

    foreach (['admin', 'tutor', 'student'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

it('allows tutor to access quiz edit page', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create();

    $response = $this->actingAs($tutor)->get("/courses/{$course->id}/quiz/{$assessment->id}/edit");

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('courses/quiz/edit')
        ->has('assessment')
        ->has('course')
    );
});

it('prevents student from accessing quiz edit page', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    $assessment = Assessment::factory()->for($course)->create();

    $response = $this->actingAs($student)->get("/courses/{$course->id}/quiz/{$assessment->id}/edit");

    $response->assertForbidden();
});

it('allows tutor to add a multiple choice question', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create();

    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/questions", [
        'type' => 'multiple_choice',
        'question' => 'What is 2 + 2?',
        'options' => ['1', '2', '3', '4'],
        'correct_answer' => '4',
        'points' => 10,
    ]);

    $response->assertRedirect();
    expect(QuizQuestion::where('assessment_id', $assessment->id)->count())->toBe(1);
    $question = $assessment->questions()->first();
    expect($question)->toMatchArray([
        'type' => 'multiple_choice',
        'question' => 'What is 2 + 2?',
        'correct_answer' => '4',
        'points' => 10,
    ]);
});

it('allows tutor to add a fill in the blank question', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create();

    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/questions", [
        'type' => 'fill_blank',
        'question' => 'The capital of France is ___.',
        'correct_answer' => 'Paris',
        'points' => 5,
    ]);

    $response->assertRedirect();
    $question = $assessment->questions()->first();
    expect($question)->toMatchArray([
        'type' => 'fill_blank',
        'question' => 'The capital of France is ___.',
        'correct_answer' => 'Paris',
    ]);
});

it('allows tutor to add an essay question', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create();

    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/questions", [
        'type' => 'essay',
        'question' => 'Explain the concept of photosynthesis.',
        'points' => 20,
    ]);

    $response->assertRedirect();
    $question = $assessment->questions()->first();
    expect($question)->toMatchArray([
        'type' => 'essay',
        'question' => 'Explain the concept of photosynthesis.',
        'points' => 20,
    ]);
});

it('allows tutor to update quiz settings', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create([
        'allow_retakes' => false,
        'time_limit_minutes' => null,
        'is_published' => false,
    ]);

    $response = $this->actingAs($tutor)->put("/courses/{$course->id}/quiz/{$assessment->id}", [
        'title' => 'Updated Quiz Title',
        'description' => 'Updated description',
        'max_score' => 100,
        'allow_retakes' => true,
        'time_limit_minutes' => 30,
        'is_published' => true,
    ]);

    $response->assertRedirect();
    $assessment->refresh();
    expect($assessment->title)->toBe('Updated Quiz Title');
    expect($assessment->allow_retakes)->toBeTrue();
    expect($assessment->time_limit_minutes)->toBe(30);
    expect($assessment->is_published)->toBeTrue();
});

it('allows student to view published quiz', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create(['is_published' => true]);

    $response = $this->actingAs($student)->get("/courses/{$course->id}/quiz/{$assessment->id}");

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('courses/quiz/show')
    );
});

it('prevents unenrolled student from viewing quiz', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    $assessment = Assessment::factory()->for($course)->create(['is_published' => true]);

    $response = $this->actingAs($student)->get("/courses/{$course->id}/quiz/{$assessment->id}");

    $response->assertForbidden();
});

it('allows student to start a quiz attempt', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create([
        'is_published' => true,
        'allow_retakes' => true,
    ]);
    QuizQuestion::factory()->for($assessment)->create([
        'type' => 'multiple_choice',
        'question' => 'Test question',
        'options' => ['A', 'B', 'C', 'D'],
        'correct_answer' => 'A',
    ]);

    $response = $this->actingAs($student)->post("/courses/{$course->id}/quiz/{$assessment->id}/start");

    $response->assertRedirect();
    expect(QuizAttempt::where('user_id', $student->id)->where('assessment_id', $assessment->id)->count())->toBe(1);
});

it('prevents student from starting quiz when retakes not allowed and has completed attempt', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create([
        'is_published' => true,
        'allow_retakes' => false,
    ]);
    QuizAttempt::factory()->for($student)->for($assessment)->create([
        'completed_at' => now(),
    ]);

    $response = $this->actingAs($student)->post("/courses/{$course->id}/quiz/{$assessment->id}/start");

    $response->assertRedirect();
    $response->assertSessionHasErrors('error');
});

it('auto-grades multiple choice questions correctly', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create(['is_published' => true]);
    $question = QuizQuestion::factory()->for($assessment)->create([
        'type' => 'multiple_choice',
        'question' => 'What is 2 + 2?',
        'options' => ['1', '2', '3', '4'],
        'correct_answer' => '4',
        'points' => 10,
    ]);
    $attempt = QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'answers' => [],
    ]);

    $response = $this->actingAs($student)->post("/courses/{$course->id}/quiz/{$assessment->id}/submit", [
        'answers' => [$question->id => '4'],
    ]);

    $response->assertRedirect();
    $attempt->refresh();
    expect($attempt->score)->toBe(10);
    expect($attempt->is_graded)->toBeTrue();
});

it('auto-grades fill in the blank questions case-insensitively', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create(['is_published' => true]);
    $question = QuizQuestion::factory()->for($assessment)->create([
        'type' => 'fill_blank',
        'question' => 'The capital of France is ___.',
        'correct_answer' => 'Paris',
        'points' => 5,
    ]);
    QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'answers' => [],
    ]);

    $response = $this->actingAs($student)->post("/courses/{$course->id}/quiz/{$assessment->id}/submit", [
        'answers' => [$question->id => 'paris'], // lowercase
    ]);

    $response->assertRedirect();
    $attempt = QuizAttempt::where('user_id', $student->id)->first();
    expect($attempt->score)->toBe(5);
});

it('does not auto-grade essay questions', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create(['is_published' => true]);
    $question = QuizQuestion::factory()->for($assessment)->create([
        'type' => 'essay',
        'question' => 'Explain photosynthesis.',
        'points' => 20,
    ]);
    QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'answers' => [],
    ]);

    $response = $this->actingAs($student)->post("/courses/{$course->id}/quiz/{$assessment->id}/submit", [
        'answers' => [$question->id => 'Plants use sunlight to make food.'],
    ]);

    $response->assertRedirect();
    $attempt = QuizAttempt::where('user_id', $student->id)->first();
    expect($attempt->is_graded)->toBeFalse(); // Essay needs manual grading
});

it('allows tutor to grade essay question', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create();
    $question = QuizQuestion::factory()->for($assessment)->create([
        'type' => 'essay',
        'question' => 'Explain photosynthesis.',
        'points' => 20,
    ]);
    $attempt = QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'completed_at' => now(),
        'answers' => [$question->id => 'Plants use sunlight to make food.'],
        'score' => 0,
        'total_points' => 20,
        'is_graded' => false,
    ]);

    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/attempts/{$attempt->id}/grade-essay", [
        'grades' => [
            [
                'question_id' => $question->id,
                'points' => 15,
            ],
        ],
    ]);

    $response->assertRedirect();
    $attempt->refresh();
    expect($attempt->score)->toBe(15);
    expect($attempt->is_graded)->toBeTrue();

    // Idempotent: saving the same grade again should not add points twice.
    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/attempts/{$attempt->id}/grade-essay", [
        'grades' => [
            [
                'question_id' => $question->id,
                'points' => 15,
            ],
        ],
    ]);

    $response->assertRedirect();
    $attempt->refresh();
    expect($attempt->score)->toBe(15);
});

it('allows tutor to manually grade objective questions per-question', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $student = User::factory()->create();
    $student->assignRole('student');

    $course = Course::factory()->create(['instructor_id' => $tutor->id]);
    $assessment = Assessment::factory()->for($course)->create();

    $question = QuizQuestion::factory()->for($assessment)->create([
        'type' => 'multiple_choice',
        'question' => 'What is 2 + 2?',
        'options' => ['1', '2', '3', '4'],
        'correct_answer' => '4',
        'points' => 10,
    ]);

    $attempt = QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'completed_at' => now(),
        'answers' => [$question->id => '1'],
        'score' => 0,
        'total_points' => 10,
        'is_graded' => true,
    ]);

    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/attempts/{$attempt->id}/grade-essay", [
        'grades' => [
            [
                'question_id' => $question->id,
                'points' => 7,
            ],
        ],
    ]);

    $response->assertRedirect();
    $attempt->refresh();

    expect($attempt->score)->toBe(7);
    expect($attempt->is_graded)->toBeTrue();

    // Overwrite (not add): update grade to 9, score should become 9.
    $response = $this->actingAs($tutor)->post("/courses/{$course->id}/quiz/{$assessment->id}/attempts/{$attempt->id}/grade-essay", [
        'grades' => [
            [
                'question_id' => $question->id,
                'points' => 9,
            ],
        ],
    ]);

    $response->assertRedirect();
    $attempt->refresh();

    expect($attempt->score)->toBe(9);
});

it('keeps highest score when retakes are allowed', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create([
        'is_published' => true,
        'allow_retakes' => true,
    ]);
    $question = QuizQuestion::factory()->for($assessment)->create([
        'type' => 'multiple_choice',
        'options' => ['A', 'B', 'C', 'D'],
        'correct_answer' => 'A',
        'points' => 10,
    ]);

    // First attempt - wrong answer
    QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now()->subHour(),
        'completed_at' => now()->subHour(),
        'answers' => [$question->id => 'B'],
        'score' => 0,
        'total_points' => 10,
        'is_graded' => true,
    ]);

    // Second attempt - correct answer
    QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'completed_at' => now(),
        'answers' => [$question->id => 'A'],
        'score' => 10,
        'total_points' => 10,
        'is_graded' => true,
    ]);

    $bestAttempt = $assessment->getBestAttemptForUser($student->id);
    expect($bestAttempt->score)->toBe(10);
});

it('adds time extension when using an extra time powerup', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create([
        'is_published' => true,
        'time_limit_minutes' => 10,
    ]);
    $attempt = QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'time_extension' => 0,
    ]);

    $powerup = Powerup::factory()->create([
        'slug' => 'extra-time',
        'config' => ['extra_time_seconds' => 120],
        'default_limit' => 1,
    ]);
    $assessment->powerups()->attach($powerup->id, ['limit' => 2]);

    $response = $this->actingAs($student)->postJson(
        "/courses/{$course->id}/quiz/{$assessment->id}/powerups/use",
        ['powerup_id' => $powerup->id]
    );

    $response->assertSuccessful();
    $response->assertJsonPath('usage.slug', 'extra-time');

    $attempt->refresh();
    expect($attempt->time_extension)->toBe(120);
});

it('enforces powerup usage limits', function () {
    $student = User::factory()->create();
    $student->assignRole('student');
    $course = Course::factory()->create();
    Enrollment::factory()->for($student)->for($course)->create();
    $assessment = Assessment::factory()->for($course)->create([
        'is_published' => true,
        'time_limit_minutes' => 10,
    ]);
    $attempt = QuizAttempt::factory()->for($student)->for($assessment)->create([
        'started_at' => now(),
        'time_extension' => 0,
    ]);

    $powerup = Powerup::factory()->create([
        'slug' => 'extra-time',
        'config' => ['extra_time_seconds' => 60],
        'default_limit' => 1,
    ]);
    $assessment->powerups()->attach($powerup->id, ['limit' => 1]);

    $this->actingAs($student)->postJson(
        "/courses/{$course->id}/quiz/{$assessment->id}/powerups/use",
        ['powerup_id' => $powerup->id]
    )->assertSuccessful();

    $this->actingAs($student)->postJson(
        "/courses/{$course->id}/quiz/{$assessment->id}/powerups/use",
        ['powerup_id' => $powerup->id]
    )->assertUnprocessable();

    $attempt->refresh();
    expect($attempt->time_extension)->toBe(60);
});
