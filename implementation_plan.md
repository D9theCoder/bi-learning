# Expand Assessment System: Practice, Final Exam, Remedial & Points

This plan adds two new assessment types (Practice and Final Exam) to the existing Quiz type, implements a remedial system, adds point rewards for completing assessments, and evaluates database structure improvements.

## User Review Required

> [!IMPORTANT] > **Database Redundancy Decision**: The current structure has dedicated tables for quizzes (`quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`, `quiz_attempt_powerups`). These could potentially be generalized for all assessment types. However, this would require migrating existing data and updating all relationships. **Do you want to proceed with database refactoring, or keep the existing structure and extend it?**

> [!WARNING] > **Breaking Change - Remedial Score Cap**: The remedial system caps the maximum final score at 65, even if students score 100% on the remedial exam. This cannot be reversed once implemented. Confirm this is acceptable.

> [!WARNING] > **Final Exam Minimum Weight**: The plan requires final exams to make up at least 50% of the student's final score. This means quiz scores will be weighted accordingly. **How should this calculation work?** Should it be:
>
> - Option A: Final exam score × 0.5 + quiz scores × 0.5
> - Option B: Final exam score counts as 50% minimum, with quizzes making up the remainder
> - Option C: Another weighting formula?

> [!IMPORTANT] > **Score Visibility for Final Exams**: Final exam scores are hidden until teacher manually grades if there are essay/fill-in-blank questions. For multiple-choice-only exams, scores show immediately. **Should students see their submitted answers before grading, or hide everything until the teacher reviews?**

---

## Proposed Changes

### Backend - Models

#### [MODIFY] [Assessment.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Models/Assessment.php)

- Update `type` field to support `'practice'`, `'quiz'`, and `'final_exam'` (currently only `'quiz'`)
- Add `is_remedial` boolean field to track remedial attempts
- Add helper methods:
  - `allowsPowerups()`: Returns true for practice and quiz, false for final exam
  - `shouldHideScores()`: Returns true for final exams with essay/fill-in-blank questions until graded
  - `isFinalExam()`: Check if assessment is final exam type
  - `isPractice()`: Check if assessment is practice type

#### [MODIFY] [QuizAttempt.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Models/QuizAttempt.php)

- Add `is_remedial` boolean field
- Add `points_awarded` field to track gamification points earned
- Update relationships and logic to handle remedial attempts

---

### Backend - Database Migrations

#### [NEW] Migration: `add_assessment_types_and_remedial.php`

```php
// Add columns to assessments table
$table->enum('type', ['practice', 'quiz', 'final_exam'])->default('quiz')->change();
$table->boolean('is_remedial')->default(false)->after('is_published');

// Add columns to quiz_attempts table
$table->boolean('is_remedial')->default(false)->after('is_graded');
$table->integer('points_awarded')->default(0)->after('is_remedial');
```

#### [NEW] Migration: `create_final_scores_table.php`

Create a new `final_scores` table to track calculated final scores with quiz and exam weighting:

```php
Schema::create('final_scores', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('course_id')->constrained()->onDelete('cascade');
    $table->integer('quiz_score')->default(0);
    $table->integer('final_exam_score')->default(0);
    $table->integer('total_score')->default(0);
    $table->boolean('is_remedial')->default(false);
    $table->timestamps();

    $table->unique(['user_id', 'course_id']);
});
```

---

### Backend - Controllers

#### [MODIFY] [QuizController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/QuizController.php)

**Assessment Type Logic:**

- Update `store()` to accept assessment type (`practice`, `quiz`, `final_exam`)
- Update `take()` to disable powerups for final exams
- Update `show()` to hide scores for ungraded final exams with subjective questions
- Add logic to prevent showing correct answers for final exams until graded

**Remedial System:**

- Add `startRemedialAttempt()` method - Creates remedial attempt for failed students (score < 65)
- Add validation: Only allow remedial if final score is below 65
- Add score cap logic: Remedial attempts cap total final score at 65

**Point Rewards:**

- Update `submit()` to call `GamificationService` and award points:
  - Practice: 150 points (flat)
  - Quiz: 200-300 points (scaled by percentage: 0% = 200, 100% = 300)
  - Final Exam: 400-1000 points (scaled: 0% = 400, 100% = 1000)
  - Remedial: 0 points
- Store awarded points in `quiz_attempts.points_awarded`

**Score Calculation:**

- Update `syncSubmission()` to calculate weighted final scores using `final_scores` table
- Implement final exam 50% minimum weighting (pending user decision on formula)

---

### Backend - Services

#### [MODIFY] [GamificationService.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Services/GamificationService.php)

Add new method:

```php
public function awardAssessmentPoints(User $user, string $assessmentType, int $score, int $maxScore, bool $isRemedial): int
{
    if ($isRemedial) {
        return 0;
    }

    $percentage = $maxScore > 0 ? ($score / $maxScore) : 0;

    $points = match($assessmentType) {
        'practice' => 150,
        'quiz' => (int) round(200 + (100 * $percentage)),
        'final_exam' => (int) round(400 + (600 * $percentage)),
        default => 0,
    };

    $user->points_balance = ($user->points_balance ?? 0) + $points;
    $user->save();

    return $points;
}
```

---

### Backend - Form Requests

#### [MODIFY] [StoreQuizRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/StoreQuizRequest.php)

Update validation rules to include assessment type:

```php
'type' => 'required|in:practice,quiz,final_exam',
```

---

### Frontend - Components

#### [MODIFY] Quiz Edit Page (`resources/js/Pages/courses/quiz/edit.tsx`)

- Add assessment type selector (Practice, Quiz, Final Exam)
- Show/hide powerup settings based on type (disable for Final Exam)
- Add UI indicators for assessment type

#### [MODIFY] Quiz Show Page (`resources/js/Pages/courses/quiz/show.tsx`)

- Display assessment type badge
- Show remedial button for students with final score < 65
- Hide scores for ungraded final exams with subjective questions
- Show "Pending Teacher Review" message for final exams awaiting grading

#### [MODIFY] Quiz Take Page (`resources/js/Pages/courses/quiz/take.tsx`)

- Disable powerup UI for final exams
- Show assessment type indicator
- Display remedial attempt badge if applicable

#### [NEW] Gradebook Integration

Update gradebook to show:

- Quiz average scores
- Final exam scores
- Calculated final scores with weighting
- Remedial attempt indicators

---

## Verification Plan

### Automated Tests

**Update Existing Tests:**

- Modify `tests/Feature/QuizTest.php` to test all three assessment types
- Run: `php artisan test tests/Feature/QuizTest.php`

**New Tests to Add:**

1. **Practice Assessment Tests:**

   ```php
   it('awards 150 points for completing practice assessment')
   it('does not count practice scores toward final grade')
   it('allows powerups in practice assessments')
   ```

2. **Final Exam Tests:**

   ```php
   it('disallows powerups in final exams')
   it('hides scores for ungraded final exams with essays')
   it('shows scores immediately for multiple-choice-only final exams')
   it('weights final exam as 50% of total score')
   ```

3. **Remedial System Tests:**

   ```php
   it('allows remedial attempt when final score is below 65')
   it('prevents remedial when score is 65 or above')
   it('caps total score at 65 after remedial attempt')
   it('does not award points for remedial attempts')
   ```

4. **Point Reward Tests:**
   ```php
   it('awards 150 points for completing practice')
   it('awards 200-300 points for quiz based on score')
   it('awards 400-1000 points for final exam based on score')
   it('does not award points for remedial attempts')
   ```

**Run all tests:** `php artisan test`

### Manual Verification

1. **Create Each Assessment Type**

   - Login as tutor/admin
   - Create a Practice assessment, verify powerups are available
   - Create a Quiz assessment, verify no changes from current behavior
   - Create a Final Exam assessment, verify powerups are disabled

2. **Test Student Flow**

   - Login as student
   - Complete a practice assessment → verify 150 points awarded
   - Complete a quiz with 80% score → verify ~280 points awarded
   - Complete a final exam with essay questions → verify score is hidden
   - Complete a final exam with only multiple choice → verify score shows immediately

3. **Test Remedial System**

   - Complete course with final score of 60 → verify remedial button appears
   - Take remedial exam and score 100% → verify final score caps at 65
   - Complete course with score of 70 → verify no remedial option available

4. **Run Pint:** `vendor/bin/pint --dirty`

---

## Database Refactoring Consideration

**Current Structure:** Dedicated tables for quizzes (`quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`, `quiz_attempt_powerups`)

**Option 1 - Keep Current (Recommended):**

- Extend existing quiz tables to handle all assessment types
- Rename tables conceptually but keep structure
- **Pros:** No data migration, less risk, faster implementation
- **Cons:** Table names remain "quiz\_\*" which is slightly misleading

**Option 2 - Refactor to Generic:**

- Rename to `assessment_questions`, `assessment_attempts`, etc.
- Migrate all existing data
- **Pros:** Cleaner naming, better long-term maintainability
- **Cons:** Risky migration, requires updating all foreign keys and relationships

**Recommendation:** Keep the current structure (Option 1) and extend it. The naming is less important than stability and speed of implementation.
