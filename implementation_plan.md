# Refactor Assessment Questions: Consolidate answer data into `answer_config` JSON Column

Consolidate `options` (JSON array) and `correct_answer` (TEXT) columns into a single `answer_config` JSON column to simplify data management, improve type safety, and create a more maintainable schema for assessment questions.

## Current Implementation Analysis

### Data Structure

- **`options`** (JSON): Stores array of multiple choice options OR fill-in-blank alternative answers
- **`correct_answer`** (TEXT): Stores correct option index (as string) for multiple choice OR primary answer for fill-blank
- **`type`** (ENUM): `'multiple_choice'`, `'fill_blank'`, or `'essay'`

### Current Usage Patterns

**Multiple Choice:**

```json
options: ["Option A", "Option B", "Option C", "Option D"]
correct_answer: "2"  // Index of correct option
```

**Fill in the Blank:**

```json
options: ["Paris", "City of Paris"]  // Alternative valid answers
correct_answer: "Paris"  // Primary answer (also checked)
```

**Essay:**

```json
options: null
correct_answer: null  // No auto-grading
```

## Proposed Changes

### 1. Data Model Changes

#### New `answer_config` JSON Structure

**Multiple Choice:**

```json
{
  "type": "multiple_choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct_index": 2
}
```

**Fill in the Blank:**

```json
{
  "type": "fill_blank",
  "accepted_answers": ["Paris", "paris", "City of Paris"]
}
```

**Essay:**

```json
{
  "type": "essay"
}
```

#### Migration Strategy

**Phase 1: Add Column**

- [NEW] [2026_01_08_create_answer_config_column_migration.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/migrations/2026_01_08_create_answer_config_column_migration.php>)
  - Add `answer_config` JSON column (nullable initially)
  - Add index on `type` column for performance
  - Do NOT drop old columns yet (backward compatibility)

**Phase 2: Backfill Data**

- [NEW] [BackfillAnswerConfigCommand.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Console/Commands/BackfillAnswerConfigCommand.php>)
  - Create Artisan command to backfill existing questions
  - Process in chunks (100 questions at a time) to avoid memory issues
  - Implement dry-run mode for safety
  - Log conversion results and any errors

**Backfill Rules:**

| Question Type     | Source Data                                       | Target `answer_config`                                                                                     |
| ----------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `multiple_choice` | `options` array + `correct_answer` string (index) | `{"type": "multiple_choice", "options": [...], "correct_index": int}`                                      |
| `fill_blank`      | `options` array + `correct_answer` string         | `{"type": "fill_blank", "accepted_answers": [correct_answer, ...options]}` (deduplicated, case-normalized) |
| `essay`           | N/A                                               | `{"type": "essay"}`                                                                                        |

**Phase 3: Deprecate Old Columns** _(After verification period)_

- [NEW] [2026_02_01_drop_old_answer_columns_migration.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/migrations/2026_02_01_drop_old_answer_columns_migration.php>)
  - Drop `options` column
  - Drop `correct_answer` column
  - Make `answer_config` NOT NULL

#### Data Validation / Constraints

**Model-level validation** ([AssessmentQuestion.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Models/AssessmentQuestion.php>)):

- Create custom cast class `AnswerConfigCast` to enforce structure
- Validate JSON structure matches question type
- Ensure `correct_index` is within bounds for multiple choice
- Ensure `accepted_answers` is non-empty array for fill_blank

---

### 2. Backend Changes

#### [AssessmentQuestion.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Models/AssessmentQuestion.php#L27-L32>)

Update casts to use new column:

```diff
protected function casts(): array
{
    return [
-       'options' => 'array',
+       'answer_config' => AnswerConfigCast::class,
    ];
}
```

Update fillable:

```diff
protected $fillable = [
    'assessment_id',
    'type',
    'question',
-   'options',
-   'correct_answer',
+   'answer_config',
    'points',
    'order',
];
```

Add accessor methods for backward compatibility during migration:

- `getOptionsAttribute()`: Extract from `answer_config` temporarily
- `getCorrectAnswerAttribute()`: Extract from `answer_config` temporarily

#### [NEW] [AnswerConfigCast.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Casts/AnswerConfigCast.php>)

Implement custom cast class:

- `get()`: JSON to array with validation
- `set()`: Array to JSON with validation
- Validate structure based on question type
- Throw exception for invalid configs

#### [QuizController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php>)

**Grading Logic** ([calculateAttemptScore](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php#L38-L100>)):

```diff
if ($question->type === 'multiple_choice') {
-   if ((string) $answer === (string) $question->correct_answer) {
+   $config = $question->answer_config;
+   if ((int) $answer === ($config['correct_index'] ?? -1)) {
        $score += (int) $question->points;
    }
}

if ($question->type === 'fill_blank') {
    $normalizedAnswer = strtolower(trim((string) $answer));
-   $correctAnswers = is_array($question->options) ? $question->options : [];
-   if ($question->correct_answer !== null && $question->correct_answer !== '') {
-       $correctAnswers[] = $question->correct_answer;
-   }
+   $config = $question->answer_config;
+   $correctAnswers = $config['accepted_answers'] ?? [];

    $normalizedCorrectAnswers = array_map(
        fn ($ans) => strtolower(trim((string) $ans)),
        array_filter($correctAnswers, fn ($ans) => $ans !== null && $ans !== '')
    );

    if (in_array($normalizedAnswer, $normalizedCorrectAnswers, true)) {
        $score += (int) $question->points;
    }
}
```

**50-50 Powerup Logic** ([usePowerup](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php#L696-L729>)):

```diff
-$correctAnswer = (string) ($question->correct_answer ?? '');
-$optionIndexes = array_keys($question->options);
+$config = $question->answer_config;
+$correctIndex = $config['correct_index'] ?? -1;
+$optionIndexes = array_keys($config['options'] ?? []);
 $wrongIndexes = array_values(array_filter($optionIndexes, function ($index) use ($correctIndex) {
-    return (string) $index !== $correctAnswer;
+    return $index !== $correctIndex;
 }));
```

**Validation** ([storeQuestion](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php#L238-L266>), [updateQuestion](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php#L272-L297>)):

Create dedicated Form Request classes:

- [NEW] [StoreAssessmentQuestionRequest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Requests/StoreAssessmentQuestionRequest.php>)
- [NEW] [UpdateAssessmentQuestionRequest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Requests/UpdateAssessmentQuestionRequest.php>)

Replace inline validation:

```diff
-$validated = $request->validate([
-    'type' => 'required|in:multiple_choice,fill_blank,essay',
-    'question' => 'required|string',
-    'options' => $type === 'fill_blank' ? 'nullable|array|max:20' : 'nullable|array|max:4',
-    'options.*' => 'nullable|string',
-    'correct_answer' => 'nullable|string',
-    'points' => 'required|integer|min:1',
-]);
+$validated = $request->validated();
```

Form request will transform incoming data to build `answer_config`:

```php
protected function passedValidation(): void
{
    $type = $this->input('type');

    $answerConfig = match($type) {
        'multiple_choice' => [
            'type' => 'multiple_choice',
            'options' => $this->input('options', []),
            'correct_index' => (int) $this->input('correct_answer'),
        ],
        'fill_blank' => [
            'type' => 'fill_blank',
            'accepted_answers' => array_values(array_unique(array_filter([
                $this->input('correct_answer'),
                ...($this->input('options', []))
            ], fn($v) => !empty($v)))),
        ],
        'essay' => [
            'type' => 'essay',
        ],
    };

    $this->merge(['answer_config' => $answerConfig]);
}
```

**API Consistency:**

- Keep existing request format (`options` + `correct_answer`) for API compatibility
- Form requests transform to `answer_config` internally
- Inertia props will need updates (see Frontend section)

---

### 3. Frontend Changes

#### Type Definitions

Update [types/index.d.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/types/index.d.ts>):

```typescript
interface AssessmentQuestion {
  id: number;
  assessment_id: number;
  type: "multiple_choice" | "fill_blank" | "essay";
  question: string;
  answer_config: AnswerConfig;
  points: number;
  order: number;
  created_at: string;
  updated_at: string;
}

type AnswerConfig =
  | { type: "multiple_choice"; options: string[]; correct_index: number }
  | { type: "fill_blank"; accepted_answers: string[] }
  | { type: "essay" };
```

#### Components to Update

**Question Creation/Editing:**

- [MODIFY] [new-question-form.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/quiz/new-question-form.tsx>)
  - Form data structure remains same (no changes needed - backend transforms)
  - Add TypeScript type guards for better type safety
- [MODIFY] [question-card.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/quiz/question-card.tsx>)
  - Update to read from `answer_config.options` and `answer_config.correct_index`
  - Transform initial form data from `answer_config` structure
  - Lines 49-97: Refactor to use answer_config

**Answer Display/Review:**

- [MODIFY] [quiz-answer-review-dialog.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/quiz/quiz-answer-review-dialog.tsx#L72-L79>)
  ```diff
  function getFillBlankAnswerKey(question: AssessmentQuestion): string[] {
  ```
- const raw = [
-     question.correct_answer ?? null,
-     ...(question.options ?? []),
- ].filter(Boolean);

* if (question.answer_config.type !== 'fill_blank') return [];
* return question.answer_config.accepted_answers || [];
  }

````

```diff
function computeAutoPoints(question: AssessmentQuestion, answer: unknown): number {
  if (question.type === 'multiple_choice') {
-     return String(answer) === String(question.correct_answer ?? '')
+     const config = question.answer_config;
+     return config.type === 'multiple_choice' &&
+            (int) answer === config.correct_index
      ? question.points
      : 0;
  }
}
````

- [MODIFY] [quiz-grading-student-row.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/tabs/scoring/quiz-grading-student-row.tsx>)
  - Similar changes to quiz-answer-review-dialog.tsx
  - Lines 43-52, 79: Update to use `answer_config`

**Question Taking:**

- [MODIFY] [quiz-question-panel.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/courses/quiz/quiz-question-panel.tsx#L102-L129>)
  ```diff
  {question.type === 'multiple_choice' && question.answer_config.type === 'multiple_choice' && (
    <div className="space-y-2">
  ```
-     {question.options.map((option, idx) => {

*     {question.answer_config.options.map((option, idx) => {
        // ... rest of code
      })}
    </div>
  )}
  ```

#### Inertia Props Updates

[QuizController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/QuizController.php#L539-L548>) - Update data sent to frontend:

```diff
$questions = $assessment->questions->map(function ($question) {
    return [
        'id' => $question->id,
        'type' => $question->type,
        'question' => $question->question,
-       'options' => $question->options,
+       'answer_config' => $question->answer_config,
        'points' => $question->points,
        'order' => $question->order,
    ];
});
```

**Correct/Incorrect Indicators:**

- All grading display logic already uses helper functions that will be updated
- No additional changes needed beyond updating the helper functions

---

### 4. Data Migration & Rollout Strategy

#### Phase 1: Add Column & Deploy Code

1. **Migration:** Add `answer_config` column (nullable)
2. **Deploy:** Model with dual support (reads from both old and new columns)
3. **Verify:** Existing functionality still works

#### Phase 2: Backfill Data

1. **Dry Run:** `php artisan assessment-questions:backfill-answer-config --dry-run`
2. **Review Logs:** Check for any conversion issues
3. **Backfill:** `php artisan assessment-questions:backfill-answer-config`
4. **Verify:** Spot-check database records

#### Phase 3: Switch to New Column

1. **Deploy:** Remove backward-compatibility accessors
2. **Deploy:** Frontend updates to use `answer_config`
3. **Monitor:** Watch for errors in production
4. **Backward Compatibility Window:** Keep old columns for 2 weeks

#### Phase 4: Cleanup

1. **Final Verification:** Ensure no code references old columns
2. **Migration:** Drop `options` and `correct_answer` columns
3. **Migration:** Make `answer_config` NOT NULL

#### Rollback Strategy

- Keep old columns until Phase 4
- If issues found, revert code changes and continue using old columns
- Backfill command is idempotent - can be re-run safely

#### Existing Assessment Attempts

- Attempt answers are stored separately in `assessment_attempts.answers` JSON
- No changes needed to attempt data
- Grading logic will work with new structure automatically

---

### 5. Testing Strategy

#### Update Existing Tests

[QuizTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Feature/QuizTest.php>):

**Tests to update:**

- Line 121-144: `allows tutor to add a multiple choice question` - Update assertions
- Line 146-166: `allows tutor to add a fill in the blank question` - Update assertions
- Line 304-330: `auto-grades multiple choice questions correctly` - Update setup
- Line 332-356: `auto-grades fill in the blank questions case-insensitively` - Update setup
- Line 358-383: `auto-grades fill in the blank with optional answers` - Update setup
- Line 460-515: `allows tutor to manually grade objective questions` - Update setup
- Line 696-729: Test 50-50 powerup - Update to check answer_config

**Pattern for updates:**

```diff
$question = AssessmentQuestion::factory()->for($assessment)->create([
    'type' => 'multiple_choice',
    'question' => 'What is 2 + 2?',
-   'options' => ['1', '2', '3', '4'],
-   'correct_answer' => '3',
+   'answer_config' => [
+       'type' => 'multiple_choice',
+       'options' => ['1', '2', '3', '4'],
+       'correct_index' => 3,
+   ],
    'points' => 10,
]);
```

#### New Tests to Add

Create [AssessmentQuestionAnswerConfigTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Unit/AssessmentQuestionAnswerConfigTest.php>):

```php
it('validates multiple choice answer config structure', function () { /* ... */ });
it('validates fill blank answer config structure', function () { /* ... */ });
it('validates essay answer config structure', function () { /* ... */ });
it('rejects invalid correct_index for multiple choice', function () { /* ... */ });
it('rejects empty accepted_answers for fill blank', function () { /* ... */ });
```

Create [BackfillAnswerConfigCommandTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Feature/BackfillAnswerConfigCommandTest.php>):

```php
it('converts multiple choice questions correctly', function () { /* ... */ });
it('converts fill blank questions correctly', function () { /* ... */ });
it('handles fill blank with duplicates', function () { /* ... */ });
it('converts essay questions correctly', function () { /* ... */ });
it('dry run does not modify database', function () { /* ... */ });
it('handles questions with null values', function () { /* ... */ });
```

#### Running Tests

**All quiz tests:**

```bash
php artisan test tests/Feature/QuizTest.php
```

**Specific test:**

```bash
php artisan test --filter="auto-grades multiple choice"
```

**New validation tests:**

```bash
php artisan test tests/Unit/AssessmentQuestionAnswerConfigTest.php
```

**Backfill command tests:**

```bash
php artisan test tests/Feature/BackfillAnswerConfigCommandTest.php
```

#### Frontend Testing

**Manual verification steps:**

1. Create new multiple choice question → verify saves correctly
2. Create new fill-blank question with alternatives → verify saves correctly
3. Take quiz and submit → verify grading works
4. Review answers as student → verify correct/incorrect indicators show
5. Grade essay as tutor → verify grading interface works
6. Use 50-50 powerup → verify options removed correctly

---

### 6. Risks & Mitigations

| Risk                                   | Impact | Mitigation                                                                                               |
| -------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------- |
| **Data loss during backfill**          | HIGH   | Keep original columns until Phase 4; dry-run first; chunk processing with error logging                  |
| **Partial migration state**            | MEDIUM | Implement backward-compatibility accessors during transition; keep old columns                           |
| **Existing attempts become invalid**   | HIGH   | Attempts store only answers (question IDs + values), not question structure - grading logic handles this |
| **Frontend type mismatches**           | MEDIUM | Add TypeScript type guards; comprehensive testing of all question flows                                  |
| **Performance degradation**            | LOW    | JSON queries in MySQL are efficient; add index on `type` column                                          |
| **Fill-blank case sensitivity issues** | MEDIUM | Backfill command normalizes and deduplicates; maintain case-insensitive grading logic                    |
| **Powerup compatibility**              | LOW    | 50-50 powerup is only one using answer data directly - update tested in QuizTest                         |

#### Data Consistency Checks

Add validation query to backfill command:

```sql
SELECT COUNT(*) FROM assessment_questions
WHERE answer_config IS NULL
  OR (type = 'multiple_choice' AND JSON_EXTRACT(answer_config, '$.correct_index') IS NULL)
  OR (type = 'fill_blank' AND JSON_LENGTH(answer_config, '$.accepted_answers') = 0);
```

---

## Summary

This refactoring consolidates two columns into one structured JSON column, improving:

- **Data integrity**: Type-specific structure enforced via cast class
- **Maintainability**: Single source of truth for answer data
- **Developer experience**: Clearer data model, better TypeScript types

The migration strategy ensures zero downtime and provides multiple safety nets through backward compatibility, dry-run modes, and a gradual rollout process.
