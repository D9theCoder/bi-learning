<?php

namespace App\Http\Controllers;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\QuizAttempt;
use App\Models\QuizQuestion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    /**
     * Show quiz builder for tutors.
     */
    public function edit(Course $course, Assessment $assessment): Response
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $assessment->load('questions');

        return Inertia::render('courses/quiz/edit', [
            'course' => $course,
            'assessment' => $assessment,
        ]);
    }

    /**
     * Store a new assessment/quiz.
     */
    public function store(Request $request, Course $course): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lesson_id' => 'nullable|exists:lessons,id',
            'due_date' => 'nullable|date',
            'max_score' => 'required|integer|min:1',
            'allow_retakes' => 'boolean',
            'time_limit_minutes' => 'nullable|integer|min:1|max:480',
            'is_published' => 'boolean',
        ]);

        $assessment = $course->assessments()->create([
            ...$validated,
            'type' => 'quiz',
            'allow_retakes' => $validated['allow_retakes'] ?? false,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return redirect()->route('quiz.edit', [$course, $assessment])
            ->with('message', 'Quiz created successfully.');
    }

    /**
     * Update assessment/quiz settings.
     */
    public function update(Request $request, Course $course, Assessment $assessment): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'lesson_id' => 'nullable|exists:lessons,id',
            'due_date' => 'nullable|date',
            'max_score' => 'required|integer|min:1',
            'allow_retakes' => 'boolean',
            'time_limit_minutes' => 'nullable|integer|min:1|max:480',
            'is_published' => 'boolean',
        ]);

        $assessment->update([
            ...$validated,
            'allow_retakes' => $validated['allow_retakes'] ?? false,
            'is_published' => $validated['is_published'] ?? false,
        ]);

        return back()->with('message', 'Quiz updated successfully.');
    }

    /**
     * Store a new question.
     */
    public function storeQuestion(Request $request, Course $course, Assessment $assessment): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:multiple_choice,fill_blank,essay',
            'question' => 'required|string',
            'options' => 'nullable|array|max:4',
            'options.*' => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'points' => 'required|integer|min:1',
        ]);

        $maxOrder = $assessment->questions()->max('order') ?? 0;

        $assessment->questions()->create([
            ...$validated,
            'order' => $maxOrder + 1,
        ]);

        $this->recalculateMaxScore($assessment);

        return back()->with('message', 'Question added successfully.');
    }

    /**
     * Update a question.
     */
    public function updateQuestion(Request $request, Course $course, Assessment $assessment, QuizQuestion $question): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:multiple_choice,fill_blank,essay',
            'question' => 'required|string',
            'options' => 'nullable|array|max:4',
            'options.*' => 'nullable|string',
            'correct_answer' => 'nullable|string',
            'points' => 'required|integer|min:1',
            'order' => 'nullable|integer|min:0',
        ]);

        $question->update($validated);

        $this->recalculateMaxScore($assessment);

        return back()->with('message', 'Question updated successfully.');
    }

    /**
     * Delete a question.
     */
    public function destroyQuestion(Course $course, Assessment $assessment, QuizQuestion $question): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $question->delete();

        $this->recalculateMaxScore($assessment);

        return back()->with('message', 'Question deleted successfully.');
    }

    /**
     * Reorder questions.
     */
    public function reorderQuestions(Request $request, Course $course, Assessment $assessment): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.id' => 'required|exists:quiz_questions,id',
            'questions.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['questions'] as $questionData) {
            QuizQuestion::where('id', $questionData['id'])
                ->where('assessment_id', $assessment->id)
                ->update(['order' => $questionData['order']]);
        }

        return back()->with('message', 'Questions reordered successfully.');
    }

    /**
     * Show quiz to student for taking.
     */
    public function show(Course $course, Assessment $assessment): Response
    {
        $user = auth()->user();

        if (! $user) {
            abort(401);
        }

        $isEnrolled = $user->enrollments()->where('course_id', $course->id)->exists();
        $isTutor = $user->hasRole('admin') || $course->instructor_id === $user->id;

        if (! $isTutor && ! $isEnrolled) {
            abort(403);
        }

        if (! $assessment->is_published && ! $isTutor) {
            abort(403, 'This quiz is not available yet.');
        }

        $assessment->load('questions');

        $existingAttempt = $assessment->getLatestAttemptForUser($user->id);
        $bestAttempt = $assessment->getBestAttemptForUser($user->id);
        $canAttempt = $assessment->canUserAttempt($user->id);

        if ($existingAttempt && ! $existingAttempt->completed_at && ! $existingAttempt->isExpired()) {
            $existingAttempt->remaining_time = $existingAttempt->remaining_time;
        }

        return Inertia::render('courses/quiz/show', [
            'course' => $course,
            'assessment' => $assessment,
            'existingAttempt' => $existingAttempt,
            'bestAttempt' => $bestAttempt,
            'canAttempt' => $canAttempt,
            'isTutor' => $isTutor,
        ]);
    }

    /**
     * Start a new quiz attempt.
     */
    public function startAttempt(Course $course, Assessment $assessment): RedirectResponse
    {
        $user = auth()->user();

        if (! $user) {
            abort(401);
        }

        $isEnrolled = $user->enrollments()->where('course_id', $course->id)->exists();

        if (! $isEnrolled) {
            abort(403);
        }

        if (! $assessment->is_published) {
            abort(403, 'This quiz is not available yet.');
        }

        if (! $assessment->canUserAttempt($user->id)) {
            return back()->withErrors(['error' => 'You cannot start a new attempt for this quiz.']);
        }

        $existingAttempt = $assessment->getLatestAttemptForUser($user->id);

        if ($existingAttempt && ! $existingAttempt->completed_at && ! $existingAttempt->isExpired()) {
            return redirect()->route('quiz.take', [$course, $assessment]);
        }

        QuizAttempt::create([
            'assessment_id' => $assessment->id,
            'user_id' => $user->id,
            'started_at' => now(),
            'total_points' => $assessment->questions()->sum('points'),
        ]);

        return redirect()->route('quiz.take', [$course, $assessment]);
    }

    /**
     * Show the quiz taking interface.
     */
    public function take(Course $course, Assessment $assessment): Response|RedirectResponse
    {
        $user = auth()->user();

        if (! $user) {
            abort(401);
        }

        $attempt = $assessment->getLatestAttemptForUser($user->id);

        if (! $attempt || $attempt->completed_at) {
            return redirect()->route('quiz.show', [$course, $assessment]);
        }

        if ($attempt->isExpired()) {
            $this->autoSubmitAttempt($attempt);

            return redirect()->route('quiz.show', [$course, $assessment])
                ->with('message', 'Time expired. Your quiz has been automatically submitted.');
        }

        $assessment->load('questions');

        $questions = $assessment->questions->map(function ($question) {
            return [
                'id' => $question->id,
                'type' => $question->type,
                'question' => $question->question,
                'options' => $question->options,
                'points' => $question->points,
                'order' => $question->order,
            ];
        });

        return Inertia::render('courses/quiz/take', [
            'course' => $course,
            'assessment' => [
                'id' => $assessment->id,
                'title' => $assessment->title,
                'description' => $assessment->description,
                'time_limit_minutes' => $assessment->time_limit_minutes,
                'max_score' => $assessment->max_score,
            ],
            'questions' => $questions,
            'attempt' => [
                'id' => $attempt->id,
                'answers' => $attempt->answers ?? [],
                'started_at' => $attempt->started_at,
                'remaining_time' => $attempt->remaining_time,
            ],
        ]);
    }

    /**
     * Save progress (auto-save answers).
     */
    public function saveProgress(Request $request, Course $course, Assessment $assessment): RedirectResponse
    {
        $user = auth()->user();

        if (! $user) {
            abort(401);
        }

        $attempt = $assessment->getLatestAttemptForUser($user->id);

        if (! $attempt || $attempt->completed_at) {
            return back()->withErrors(['error' => 'No active attempt found.']);
        }

        if ($attempt->isExpired()) {
            $this->autoSubmitAttempt($attempt);

            return back()->withErrors(['error' => 'Time expired.']);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $attempt->update(['answers' => $validated['answers']]);

        return back();
    }

    /**
     * Submit the quiz attempt.
     */
    public function submit(Request $request, Course $course, Assessment $assessment): RedirectResponse
    {
        $user = auth()->user();

        if (! $user) {
            abort(401);
        }

        $attempt = $assessment->getLatestAttemptForUser($user->id);

        if (! $attempt || $attempt->completed_at) {
            return back()->withErrors(['error' => 'No active attempt found.']);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
        ]);

        $attempt->update(['answers' => $validated['answers']]);
        $attempt->refresh();

        $this->gradeAttempt($attempt);

        return redirect()->route('quiz.show', [$course, $assessment])
            ->with('message', 'Quiz submitted successfully!');
    }

    /**
     * Grade a quiz attempt.
     */
    protected function gradeAttempt(QuizAttempt $attempt): void
    {
        $assessment = $attempt->assessment;
        $questions = $assessment->questions()->get();
        $answers = $attempt->answers ?? [];
        $score = 0;
        $hasEssay = false;

        foreach ($questions as $question) {
            $answer = $answers[$question->id] ?? null;

            if ($question->type === 'essay') {
                $hasEssay = true;

                continue;
            }

            if ($answer === null || $answer === '') {
                continue;
            }

            if ($question->type === 'multiple_choice') {
                if ((string) $answer === (string) $question->correct_answer) {
                    $score += $question->points;
                }
            } elseif ($question->type === 'fill_blank') {
                $normalizedAnswer = strtolower(trim($answer));
                $normalizedCorrect = strtolower(trim($question->correct_answer ?? ''));

                if ($normalizedAnswer === $normalizedCorrect) {
                    $score += $question->points;
                }
            }
        }

        $attempt->update([
            'score' => $score,
            'completed_at' => now(),
            'is_graded' => ! $hasEssay,
        ]);

        $this->syncSubmission($attempt);
    }

    /**
     * Auto-submit an expired attempt.
     */
    protected function autoSubmitAttempt(QuizAttempt $attempt): void
    {
        if ($attempt->completed_at) {
            return;
        }

        $this->gradeAttempt($attempt);
    }

    /**
     * Sync attempt score to assessment submission (for gradebook).
     */
    protected function syncSubmission(QuizAttempt $attempt): void
    {
        $assessment = $attempt->assessment;
        $userId = $attempt->user_id;

        if ($assessment->allow_retakes) {
            $bestAttempt = $assessment->getBestAttemptForUser($userId);
            $score = $bestAttempt?->score ?? $attempt->score;
        } else {
            $score = $attempt->score;
        }

        \App\Models\AssessmentSubmission::updateOrCreate(
            [
                'assessment_id' => $assessment->id,
                'user_id' => $userId,
            ],
            [
                'score' => $score,
                'submitted_at' => $attempt->completed_at,
            ]
        );
    }

    /**
     * Recalculate max score based on questions.
     */
    protected function recalculateMaxScore(Assessment $assessment): void
    {
        $totalPoints = $assessment->questions()->sum('points');
        $assessment->update(['max_score' => max($totalPoints, 1)]);
    }

    /**
     * Grade essay questions (tutor only).
     */
    public function gradeEssay(Request $request, Course $course, Assessment $assessment, QuizAttempt $attempt): RedirectResponse
    {
        $user = auth()->user();

        if (! $user?->hasRole('admin') && $course->instructor_id !== $user?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'grades' => 'required|array',
            'grades.*.question_id' => 'required|exists:quiz_questions,id',
            'grades.*.points' => 'required|integer|min:0',
        ]);

        $answers = $attempt->answers ?? [];
        $questions = $assessment->questions()->get()->keyBy('id');
        $additionalScore = 0;

        foreach ($validated['grades'] as $grade) {
            $question = $questions[$grade['question_id']] ?? null;

            if ($question && $question->type === 'essay') {
                $maxPoints = $question->points;
                $awardedPoints = min($grade['points'], $maxPoints);
                $additionalScore += $awardedPoints;
                $answers[$question->id.'_grade'] = $awardedPoints;
            }
        }

        $attempt->update([
            'answers' => $answers,
            'score' => ($attempt->score ?? 0) + $additionalScore,
            'is_graded' => true,
        ]);

        $this->syncSubmission($attempt);

        return back()->with('message', 'Essay grades saved successfully.');
    }
}
