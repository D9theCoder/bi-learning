# Add Assessment-to-Session Assignment in Quiz Editor

## Overview

This plan implements the ability to assign assessments to specific lesson sessions directly from the quiz editor (`/courses/{course}/quiz/{assessment}/edit`). Currently, assessments can only be assigned to sessions when creating them as course content in the course management page (`/courses/manage/{course}/edit`). This enhancement will:

1. Add a session selector dropdown in the quiz settings card
2. Ensure the assignment logic matches the course management page
3. Display assessments as actionable items in the session todo list on the show page
4. Maintain bidirectional consistency between quiz edit and course manage pages

## Current State Analysis

### Backend

- **Database**: The `assessments` table already has a `lesson_id` foreign key column that links assessments to lessons
- **Quiz Controller**: The `edit()` method passes the assessment to the frontend but doesn't include lesson data
- **Quiz Controller**: The `update()` method accepts and validates lesson assignment but the frontend doesn't provide this field yet
- **Course Management**: When creating assessment-type content, it automatically creates an Assessment record with `lesson_id` set to the parent lesson

### Frontend

- **Quiz Edit Page** (`resources/js/pages/courses/quiz/edit.tsx`): Displays quiz settings but lacks lesson session selection
- **Quiz Settings Card** (`resources/js/components/courses/quiz/quiz-settings-card.tsx`): Form includes `lesson_id` in the form data (line 23, 31) but doesn't render a UI control for it
- **Course Manage Page** (`resources/js/pages/courses/manage/edit.tsx`): Lessons are displayed with their contents, including assessments
- **Session Todo List** (`resources/js/components/courses/show/session-todo-list.tsx`): Currently displays course contents but assessments are shown via the Assessment tab, not as todo items in sessions

## Proposed Changes

### Backend Changes

#### [MODIFY] [QuizController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/QuizController.php#L119-L151)

Update the `edit()` method to pass course lessons data to the frontend so tutors can select which session to assign the assessment to:

- Load the course's lessons relationship
- Pass lessons data in the Inertia response alongside the existing course and assessment data
- Format lessons to include `id`, `title`, and `order` for the dropdown

---

### Frontend Changes

#### [MODIFY] [quiz-settings-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/quiz/quiz-settings-card.tsx)

Add a lesson session selector dropdown to the quiz settings form:

- Import and use the Select component (already imported)
- Add a new form field between "Description" and "Due Date" sections
- Display a dropdown populated with available lessons from the course
- Show lesson titles with their order numbers (e.g., "Session 1: Introduction")
- Handle the `lesson_id` field which is already in the form data structure
- Include proper validation error display for `lesson_id`
- Add label "Assign to Session" with optional help text
- Allow "None" or empty selection to unassign from sessions

**Props Changes:**

- Add `lessons` prop to `QuizSettingsCardProps` interface with type `Array<{id: number, title: string, order: number}>`

#### [MODIFY] [edit.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/pages/courses/quiz/edit.tsx)

Update the quiz edit page to:

- Receive and destructure `lessons` from props in `QuizEditProps` interface
- Pass `lessons` prop to the `QuizSettingsCard` component

#### [MODIFY] [session-todo-list.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/show/session-todo-list.tsx)

Update to display assessments assigned to the current session:

- Assessments are already passed to the show page via props
- Filter assessments by `lesson_id` matching the active session
- Add assessment items to the todo list with appropriate icon (use existing `CheckCircle` or quiz icon)
- Make assessment items clickable to navigate to the take/show page (e.g., `/courses/{courseId}/quiz/{assessmentId}`)
- Display assessment type badge (Practice/Quiz/Final Exam)
- Show due date if available

**Props Changes:**

- Add `assessments` prop to `SessionTodoListProps` interface
- Add `currentLessonId` prop to filter assessments
- Add `courseId` prop for navigation links

#### [MODIFY] [session-tab-content.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/show/session-tab-content.tsx)

Update to pass assessments and related props to SessionTodoList:

- Filter `assessments` by the active session's lesson ID
- Pass filtered assessments, courseId, and currentLessonId to `SessionTodoList` component

**Props Changes:**

- Add `assessments` prop to `SessionTabContentProps` interface
- Add `courseId` prop (already available, needs to be passed down)

#### [MODIFY] [show.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/pages/courses/show.tsx)

Ensure assessments are passed to SessionTabContent:

- The `assessments` prop is already received in component props
- Pass `assessments` prop to `SessionTabContent` component
- Pass `courseId` prop to `SessionTabContent`

---

## User Review Required

> [!IMPORTANT] > **Session Assignment Behavior**
>
> When an assessment is assigned to a specific lesson session:
>
> - It will appear in the "Things to do in this session" card on that specific session tab
> - It will still appear in the "Assessment" tab (global list of all assessments)
> - Clicking the assessment in the todo list will navigate to the assessment taking/viewing page
>
> **Unassigned Assessments**
>
> - Assessments with no `lesson_id` will only appear in the Assessment tab
> - They won't appear in any session's todo list
>
> **Backward Compatibility**
>
> - Existing assessments without a `lesson_id` will continue to work as before
> - The lesson selector in quiz edit will allow clearing the session assignment

## Verification Plan

### Automated Tests

No existing automated tests cover this UI functionality. Manual browser testing is required.

### Manual Verification

1. **Test Session Assignment in Quiz Editor**

   - Navigate to `/courses/manage` and select an existing course
   - Go to the "Assessment" tab and click "Edit" on any assessment
   - Verify a "Assign to Session" dropdown appears in the settings card
   - Select a session from the dropdown
   - Click "Save Settings"
   - Verify the session selection persists after page reload

2. **Test Bidirectional Consistency**

   - After assigning an assessment to a session (above), navigate to `/courses/manage/{courseId}/edit`
   - Expand the lesson that was assigned
   - Verify the assessment appears in that lesson's contents list
   - Change the assessment's session assignment from the manage page by editing the content
   - Go back to the quiz edit page (`/courses/{courseId}/quiz/{assessmentId}/edit`)
   - Verify the session dropdown reflects the change made in the manage page

3. **Test Assessment Display in Session Todo List**

   - Navigate to `/courses/{courseId}` (course show page)
   - Click on the "Sessions" tab
   - Select the session that has the assigned assessment
   - Verify the assessment appears in the "Things to do in this session" yellow card
   - Verify the assessment shows:
     - Appropriate icon (CheckCircle)
     - Assessment title
     - Assessment type badge (Quiz/Practice/Final Exam)
     - Due date (if set)
   - Click on the assessment item
   - Verify it navigates to the assessment taking/viewing page

4. **Test Unassigned Assessments**

   - Edit an assessment and clear the session assignment (select "None" or empty value)
   - Save the settings
   - Navigate to the course show page
   - Verify the assessment does NOT appear in any session's todo list
   - Verify the assessment still appears in the "Assessment" tab

5. **Test with Newly Created Assessment**
   - From the course management page, create a new assessment via the lesson content form
   - Note which session it was created under
   - Navigate to that assessment's edit page
   - Verify the session selector shows the correct session pre-selected
   - Navigate to the course show page and verify the assessment appears in the correct session's todo list
