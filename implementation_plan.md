# Add Redirect Buttons to Schedule Items

Add redirect buttons to each schedule item in the upcoming schedule widgets (dashboard) and calendar page for both student and tutor roles. The redirect buttons will navigate users to the appropriate course detail page or directly to the meeting URL if it's a meeting type.

## User Review Required

> [!IMPORTANT] > **Navigation Behavior:**
>
> - For **meetings**, the button will either:
>   - Navigate to the course detail page where the meeting info is displayed
> - For **assessments**, the button will navigate to the course detail page
>
> Please confirm which behavior you prefer for meetings with URLs.

> [!IMPORTANT] > **Button Design:**
> The redirect button will be a small icon button (using an external link or arrow icon) placed next to the date badge in schedule items. This keeps the UI clean and doesn't disrupt the current layout.
>
> Please confirm if you prefer a different placement or style.

## Proposed Changes

### Type Definitions

#### [MODIFY] [index.d.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/types/index.d.ts>)

Add `course_id` and optionally `meeting_url` fields to calendar item interfaces to enable navigation:

- `StudentCalendarItem`: Add `course_id: number` and `meeting_url?: string | null`
- `TutorCalendarItem`: Add `course_id: number` and `meeting_url?: string | null`
- `CalendarTask`: Add `course_id?: number` and `meeting_url?: string | null`

---

### Dashboard Schedule Widgets

#### [MODIFY] [student-calendar-section.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/dashboard/sections/student-calendar-section.tsx>)

Add redirect button to each schedule item in the student dashboard's upcoming schedule widget. The button will:

- Import the `show` action from Wayfinder for `courses.show` route
- Add an external link icon button next to the date badge
- Navigate to the course detail page or open meeting URL on click
- Use appropriate styling to match existing design

#### [MODIFY] [tutor-calendar-section.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/dashboard/sections/tutor-calendar-section.tsx>)

Add redirect button to each schedule item in the tutor dashboard's upcoming schedule widget. Similar implementation to student section but adapted for tutor calendar item data structure.

---

### Calendar Page

#### [MODIFY] [task-date-card.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/calendar/task-date-card.tsx>)

Add redirect button to each task item in the calendar page task list. The button will:

- Import the `show` action from Wayfinder for `courses.show` route
- Add an external link icon button inline with the task title
- Handle cases where `course_id` might not be available (e.g., for tasks not linked to courses)
- Navigate to course detail page or open meeting URL on click

---

### Backend Data Updates

The backend controllers that provide calendar data will need to include `course_id` and `meeting_url` when preparing schedule items:

- `DashboardController@index` - Update to include `course_id` and `meeting_url` in student and tutor calendar data
- `CalendarController@index` - Update to include `course_id` and `meeting_url` in tasks by date

## Verification Plan

### Automated Tests

No existing automated tests cover the schedule widget components. Manual browser testing will be used to verify the changes.

### Manual Verification

1. **Student Dashboard - Upcoming Schedule Widget:**

   - Log in as a student role
   - Navigate to `/dashboard`
   - Verify redirect buttons appear next to each schedule item's date
   - Click redirect button for a meeting - confirm it navigates to course page or opens meeting URL
   - Click redirect button for an assessment - confirm it navigates to the course detail page

2. **Tutor Dashboard - Upcoming Schedule Widget:**

   - Log in as a tutor role
   - Navigate to `/dashboard`
   - Verify redirect buttons appear next to each schedule item's date
   - Click redirect buttons - confirm navigation works correctly

3. **Calendar Page - Task List:**

   - Log in as either student or tutor
   - Navigate to `/calendar`
   - Verify redirect buttons appear inline with each task in the schedule list
   - Click redirect buttons - confirm navigation works correctly
   - Test edge cases: tasks without course_id should not show redirect button

4. **Visual Regression:**
   - Ensure the redirect button integrates seamlessly with existing design
   - Check dark mode compatibility
   - Verify responsive behavior on mobile/tablet