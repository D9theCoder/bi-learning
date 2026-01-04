# Add Lesson Session Selector and Display Assessment Types

Plan to enhance the assessment form by adding a lesson session selector and ensuring all assessment types (Practice, Quiz, Final Exam) are visible in the manage courses interface.

## User Review Required

> [!IMPORTANT]
> Frontend changes will add a lesson selector dropdown to the assessment settings form. This will allow tutors to associate an assessment with a specific lesson session.

> [!IMPORTANT]
> The lesson-card component currently shows "contents" but assessments are stored separately. We need to clarify how to display assessments in the manage courses form. Should they be:
>
> 1. Displayed as part of the lesson's contents section (even though they're separate entities)?
> 2. Displayed in a separate "Assessments" section within each lesson card?
> 3. Displayed in a separate card/section outside of the lesson card?

## Proposed Changes

### Frontend Components

#### [MODIFY] [quiz-settings-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/quiz/quiz-settings-card.tsx)

- Add a new `lessons` prop to receive available lessons from the parent component
- Add a Select component for lesson selection (after the Assessment Type field)
- Wire up the `lesson_id` field to the form data (already exists in form)
- Display the selected lesson's title or "None selected" placeholder
- Handle validation errors for `lesson_id` field (validation already exists in backend)
- Make the field optional with clear labeling

#### [MODIFY] [edit.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/pages/courses/quiz/edit.tsx)

- Add `lessons` to the `QuizEditProps` interface
- Pass `lessons` prop to `QuizSettingsCard` component
- The lessons data will be provided by the backend

#### [MODIFY] [lesson-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/manage/lesson-card.tsx)

**Option 1: Display as part of contents (recommended)**

- Add a new "Assessments" subsection after the "Contents" section
- Query and display assessments linked to this lesson
- Show assessment type badges (Practice, Quiz, Final Exam) with distinct colors
- Add "Edit Assessment" button for each assessment
- Show assessment status (published/draft)

**Option 2: Separate assessments section**

- Display in a completely separate section outside of lesson card
- Would require changes to the parent component structure

---

### Backend Controller

#### [MODIFY] [QuizController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/QuizController.php)

**Method: `edit()`**

- Load the course's lessons along with the assessment
- Pass lessons data to the Inertia view
- Order lessons by `order` column for consistent display

```diff
 $assessment->load(['questions', 'powerups']);
+$lessons = $course->lessons()->orderBy('order')->get();
 $availablePowerups = Powerup::query()
     ->orderBy('name')
     ->get();

 // ... existing powerups code ...

 return Inertia::render('courses/quiz/edit', [
     'course' => $course,
+    'lessons' => $lessons,
     'assessment' => [
         ...$assessment->toArray(),
         'powerups' => $assessmentPowerups,
     ],
     'availablePowerups' => $availablePowerups->map(function (Powerup $powerup) {
         return $this->formatPowerup($powerup);
     }),
 ]);
```

#### [MODIFY] [CourseManagementController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/CourseManagementController.php)

**Method: `edit()`**

- Ensure assessments are loaded with lessons when editing a course
- Pass assessment data grouped by lesson_id to the frontend
- Include assessment type and status information

---

## Verification Plan

### Automated Tests

#### Update Existing Tests

Since the form request validation is already in place and we're only adding UI elements, we should verify the existing validation tests still pass:

```bash
# Run existing quiz tests
php artisan test --filter=QuizTest
```

#### Add New Browser Test

Create a new browser test to verify the lesson selector UI:

**File:** `tests/Browser/AssessmentLessonSelectorTest.php`

```bash
# After creating the test, run it with:
php artisan test tests/Browser/AssessmentLessonSelectorTest.php
```

**Test should verify:**

1. Tutor can see lesson selector dropdown in assessment edit page
2. Dropdown shows all lessons for the course
3. Selecting a lesson updates the form data
4. Saving the assessment with a lesson_id persists correctly
5. Assessment displays the selected lesson in the manage courses page

### Manual Verification

1. **Navigate to a course management page** as a tutor:

   - Use the absolute URL tool to get: `/courses/manage`
   - Click "Edit" on an existing course

2. **Create or edit an assessment**:

   - Click "New Assessment" or edit an existing one
   - Verify the "Lesson Session" dropdown appears below "Assessment Type"
   - Verify all lessons for the course are listed in the dropdown
   - Select a lesson and save the assessment
   - Verify no errors occur

3. **Verify lesson-card displays assessments**:

   - Return to the course edit page
   - Scroll to the lessons section
   - Verify assessments linked to each lesson are displayed
   - Verify Practice, Quiz, and Final Exam assessments all show correctly
   - Verify each assessment has an "Edit" button that navigates to the quiz editor

4. **Test assessment types**:
   - Create one assessment of each type (Practice, Quiz, Final Exam)
   - Assign each to a different lesson
   - Verify they all display correctly in the manage courses interface
   - Verify the assessment type badges have distinct visual styling
