# Fix Assessment Due Date, Max Score, and Weight Percentage Issues

## Problem Summary

After analyzing the codebase and uploaded image, the following issues need to be fixed:

1. **Due date is always null** in the assessment management page (`resources/js/pages/courses/manage`) when creating assessments
2. **Useless max score input field** for regular assessments (should be fixed to 100 for quizzes/practice)
3. **Missing weight percentage input** for final exam assessments
4. **SQL integrity constraint violation** for `weight_percentage` column being null
5. **Score distribution not displayed** in the gradebook tab
6. **Quiz score distribution logic**: Quizzes should collectively share (100% - final exam percentage)

## User Review Required

> [!IMPORTANT]
> The following changes will affect how assessments are created and how final scores are calculated:
>
> - Max score for quizzes/practice will be automatically set to 100 (no user input)
> - Final exam will require a weight percentage input (51-100%)
> - Quizzes will automatically distribute the remaining percentage equally
> - Database migration is required to set default value for `weight_percentage`

## Proposed Changes

### Backend Changes

#### [MODIFY] [StoreQuizRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/StoreQuizRequest.php)

- Update `prepareForValidation()` to:
  - Set `max_score` to 100 for practice/quiz types
  - Properly handle `weight_percentage` default value only for final_exam type
- Update validation rules to:
  - Make `max_score` not required (will be set programmatically)
  - Ensure `weight_percentage` has proper validation

#### [MODIFY] [UpdateQuizRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/UpdateQuizRequest.php)

- Apply same logic as StoreQuizRequest for consistency

#### [MODIFY] [QuizController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/QuizController.php)

- Update `store()` method to ensure `max_score` is set to 100 for quiz/practice
- Update `update()` method with same logic
- Ensure `weight_percentage` is only saved for final_exam type

#### [NEW] [Migration File](file:///c:/Users/kevin/Herd/web-skripsi/database/migrations/YYYY_MM_DD_HHMMSS_update_assessments_weight_percentage_default.php)

- Add migration to modify `weight_percentage` column:
  - Make it nullable
  - Set default value to null (only final exams need this value)

---

### Frontend Changes

#### [MODIFY] [new-content-form.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/manage/new-content-form.tsx)

- Remove max_score input field for quiz/practice assessments (will default to 100)
- Add weight_percentage input field for final_exam type (51-100% range)
- Fix due_date format to properly convert to datetime-local format
- Update form data structure to include `weight_percentage`

#### [MODIFY] [quiz-settings-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/quiz/quiz-settings-card.tsx)

- Remove max_score input field for quiz/practice types
- Add weight_percentage input for final_exam type
- Update form interface to include `weight_percentage`
- Add proper validation messaging

#### [MODIFY] [edit.tsx (quiz)](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/pages/courses/quiz/edit.tsx)

- Add `weight_percentage` to form initialization

#### [MODIFY] [gradebook-tab.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/pages/courses/tabs/gradebook-tab.tsx)

- Add score distribution information display
- Show final exam weight percentage
- Show quiz distribution percentage (100% - final exam %)
- Update component to pass weight_percentage data from backend

---

### Documentation Changes

#### [MODIFY] [database_guide.md](file:///c:/Users/kevin/Herd/web-skripsi/database_guide.md)

- Update `assessments` table documentation to reflect:
  - `weight_percentage` is nullable (only used for final_exam type)
  - Default value is null
  - Only final exams require this value (51-100%)
  - Quizzes collectively receive (100 - final_exam_weight_percentage)%
  - Practice assessments don't use this field

## Verification Plan

### Automated Tests

1. Create/update feature test for assessment creation:

   ```bash
   php artisan test --filter=QuizController
   ```

2. Test that:
   - Creating a quiz sets max_score to 100 automatically
   - Creating a practice sets max_score to 100 automatically
   - Creating a final exam requires weight_percentage (51-100%)
   - Creating a final exam with weight_percentage stores it correctly
   - Due date is properly saved for all assessment types
   - Validation fails if weight_percentage is null for final_exam
   - Validation fails if weight_percentage < 51 for final_exam

### Manual Verification

1. Navigate to course management page
2. Create a new assessment (quiz type) and verify:
   - No max_score input field is shown
   - Due date can be set and is saved correctly
3. Create a new assessment (final_exam type) and verify:
   - No max_score input field is shown
   - Weight percentage input field is shown (51-100% range)
   - Can successfully create final exam with weight_percentage
4. Check gradebook tab to verify:
   - Score distribution is displayed
   - Final exam percentage is shown
   - Quiz distribution is calculated correctly
