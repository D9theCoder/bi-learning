# Admin Calendar Enhancement - Implementation Plan

This plan adds course markers and a paginated course list to the admin calendar page, modeled after the tutor dashboard's course features.

## User Review Required

> [!IMPORTANT] > **Pagination Strategy:** The backend will use standard Laravel pagination for the course list API endpoint. The calendar will fetch ALL courses without pagination for displaying markers (since we need to show all course events on the calendar), but the course list sidebar will use paginated data. This approach balances performance with functionality.

> [!IMPORTANT] > **Admin Course Access:** Admins will see ALL courses in the system (not just courses they're teaching), since admins have oversight authority over all tutors and courses. The course markers will show events from all courses system-wide.

## Proposed Changes

### Backend - Calendar Controller

#### [MODIFY] [CalendarController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/CalendarController.php>)

Update the `index` method to:

1. **For admin users:** Load all courses with lessons and assessments to generate calendar markers
2. **Add pagination:** Create a separate method or extend the index to return paginated course data for the course list
3. **Include course metadata:** Add similar data structure as tutor dashboard courses (student count, next meeting, etc.)

**Key changes:**

- Add a new query after line 32 for admin users to fetch all courses (not just instructor_id filtered)
- Include course markers similar to lines 38-78 (tutor logic) but for ALL courses
- Add a paginated course list using Laravel's `paginate()` method (per_page = 12)
- Return course data including: `id`, `title`, `thumbnail`, `instructor`, `student_count`, `next_meeting_date`, `next_meeting_time`, `is_published`

---

### Backend - API Endpoint (Optional Approach)

#### [NEW] [AdminCoursesController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/Admin/AdminCoursesController.php>)

Alternatively, create a dedicated admin controller for paginated course data:

- `GET /admin/courses` - Returns paginated course list with metadata
- This keeps separation of concerns and allows reuse across admin pages
- Uses `Course::with(['instructor', 'lessons', 'assessments', 'enrollments'])->paginate(12)`

---

### Frontend - TypeScript Types

#### [MODIFY] [index.d.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/types/index.d.ts>)

Add new interfaces:

1. **`AdminCalendarCourse`** - Similar to `TutorDashboardCourse` but with instructor info
2. **Update `CalendarPageProps`** - Add optional `courses?` and `courseMarkers?` properties for admin

```typescript
export interface AdminCalendarCourse {
  id: number;
  title: string;
  thumbnail?: string;
  instructor?: { id: number; name: string } | null;
  student_count: number;
  next_meeting_date?: string | null;
  next_meeting_time?: string | null;
  is_published: boolean;
}

export interface CalendarPageProps extends SharedData {
  // ... existing properties
  courses?: {
    data: AdminCalendarCourse[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  courseMarkers?: string[]; // YYYY-MM-DD dates with course events
}
```

---

### Frontend - Calendar Page

#### [MODIFY] [index.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/calendar/index.tsx>)

1. Check if user is admin and courses data exists
2. If admin, add a new section below the calendar overview showing the course list
3. Add pagination controls at the bottom of the course list
4. Merge `courseMarkers` into the existing `markers` array for the mini calendar

---

### Frontend - Components

#### [NEW] [admin-course-list-section.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/calendar/admin-course-list-section.tsx>)

Create a new component based on `TutorCourseListSection`:

- Display paginated courses with thumbnail, title, instructor name
- Show student count and next meeting info
- Add pagination controls using Inertia's links
- Include "View course" and "Manage course" buttons
- Responsive grid layout (1 col mobile, 2 cols desktop)

---

### Frontend - Mini Calendar Enhancement

#### [MODIFY] [mini-calendar.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/calendar/mini-calendar.tsx>)

No major changes needed - the component already supports custom markers. Just ensure:

- Course event markers use a distinct color (e.g., purple/violet) to differentiate from meetings, assessments, and tasks
- Add a 4th category for 'course' events if needed

## Verification Plan

### Automated Tests

1. **Update existing calendar tests** (Lines to add in [CalendarTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Feature/CalendarTest.php>)):

```bash
php artisan test tests/Feature/CalendarTest.php
```

Add new test cases:

- `it('shows all courses to admin users')` - Verify admin sees all courses, not just taught ones
- `it('paginates admin course list')` - Check pagination works correctly
- `it('includes course markers in admin calendar')` - Verify course events appear as markers
- `it('includes instructor info for admin courses')` - Check instructor data is present

2. **Create new admin calendar test file** (if needed):

```bash
php artisan make:test AdminCalendarTest --pest
php artisan test tests/Feature/AdminCalendarTest.php
```

3. **Run code formatter:**

```bash
vendor/bin/pint --dirty
```

### Manual Verification

1. **Login as admin user** and navigate to `/calendar`
2. **Verify course list appears** below the calendar overview (right side)
3. **Check pagination:**
   - Scroll to bottom of course list
   - Click "Next page" button
   - Verify new courses load without page refresh (Inertia)
4. **Verify course markers:**
   - Look at the mini calendar
   - Dates with course events should have visual indicators
   - Click on a marked date to filter events
5. **Test course cards:**
   - Each course should show: thumbnail, title, instructor, student count
   - Next meeting date/time should display if available
   - "View course" and "Manage course" buttons should work
6. **Verify performance:**
   - With 50+ courses, pagination should prevent lag
   - Calendar should load within 2 seconds
