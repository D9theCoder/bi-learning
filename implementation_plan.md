# Per-Student Meeting Scheduling for Course Page

## Problem Summary

Currently, in a course with a tutor and multiple students:

- **Students** can view their own schedule, score, and attendance (working correctly)
- **Tutors** can teach multiple students, but meetings are one-on-one (private)
- **Issue**: Meeting times are stored on the `lessons` table (shared by all students), making it impossible to schedule personalized per-student meetings

## Proposed Solution

Create a new **"Schedule" tab** on the course page that allows tutors to manage individual meeting schedules per student, while students only see their own personalized schedule.

---

## Proposed Changes

### Database Layer

#### [NEW] `database/migrations/xxxx_create_student_meeting_schedules_table.php`

New pivot table linking lessons/courses to specific students with meeting times:

| Column                  | Type                    | Description                              |
| ----------------------- | ----------------------- | ---------------------------------------- |
| `id`                    | bigint                  | Primary key                              |
| `course_id`             | FK → courses            | Parent course                            |
| `lesson_id`             | FK → lessons (nullable) | Optional lesson reference                |
| `student_id`            | FK → users              | The enrolled student                     |
| `title`                 | string                  | Meeting title (defaults to lesson title) |
| `meeting_url`           | string (nullable)       | Video call link                          |
| `scheduled_at`          | datetime                | Meeting date/time                        |
| `duration_minutes`      | integer (nullable)      | Expected duration                        |
| `notes`                 | text (nullable)         | Tutor notes for this session             |
| `status`                | enum                    | `scheduled`, `completed`, `cancelled`    |
| `created_at/updated_at` | timestamps              |

---

### Backend

#### [NEW] `app/Models/StudentMeetingSchedule.php`

Eloquent model with relationships to `Course`, `Lesson`, and `User` (student).

#### [MODIFY] `app/Models/Course.php`

Add relationship: `studentMeetingSchedules() → hasMany`

#### [MODIFY] `app/Models/Enrollment.php` or add to `User.php`

Add relationship for student's meeting schedules.

#### [NEW] `app/Http/Controllers/StudentMeetingScheduleController.php`

Endpoints for tutors to manage schedules:

| Method | Route                                   | Description                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------ |
| GET    | `courses/{course}/schedules`            | List all student schedules (tutor) or own schedule (student) |
| POST   | `courses/{course}/schedules`            | Create new meeting for specific student                      |
| PUT    | `courses/{course}/schedules/{schedule}` | Update meeting                                               |
| DELETE | `courses/{course}/schedules/{schedule}` | Delete meeting                                               |
| POST   | `courses/{course}/schedules/bulk`       | Bulk schedule (optional, for efficiency)                     |

#### [MODIFY] `app/Http/Controllers/CourseController.php`

In `show()` method:

- For tutors: fetch all student meeting schedules grouped by student
- For students: fetch only their own meeting schedules

---

### Frontend

#### [MODIFY] `resources/js/components/courses/show/course-tabs.tsx`

Add new **"Schedule"** tab between "Session" and "Assessment":

- Tab shows for all users
- Content differs based on role

#### [NEW] `resources/js/components/courses/tabs/schedule/` folder

New folder with components:

| Component                    | Purpose                                                  |
| ---------------------------- | -------------------------------------------------------- |
| `index.ts`                   | Barrel export                                            |
| `schedule-tutor-view.tsx`    | Shows all students with their schedules, add/edit/delete |
| `schedule-student-view.tsx`  | Shows student's own upcoming & past meetings             |
| `schedule-form-dialog.tsx`   | Modal for creating/editing a meeting                     |
| `schedule-calendar-view.tsx` | Optional: mini calendar showing scheduled meetings       |

#### [MODIFY] `resources/js/types/index.d.ts`

Add new interface:

```typescript
export interface StudentMeetingSchedule {
  id: number;
  course_id: number;
  lesson_id?: number | null;
  student_id: number;
  student?: User;
  title: string;
  meeting_url?: string | null;
  scheduled_at: string;
  duration_minutes?: number | null;
  notes?: string | null;
  status: "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}
```

---

## User Review Required

> [!IMPORTANT] > **Tab Naming Decision**: The plan proposes adding a "Schedule" tab. Would you prefer a different name, such as "Meetings" or "Sessions"?

> [!IMPORTANT] > **Bulk Scheduling**: Should the tutor be able to bulk-schedule the same time slot for all students, or is individual scheduling sufficient for the initial version?

> [!IMPORTANT] > **Calendar Integration**: Should new student meeting schedules automatically appear in the existing calendar page? This would require modifications to `CalendarController`.

---

## UI/UX Improvements for Intuitive Scheduling

### For Tutors (Schedule Tab)

1. **Student List View**: Table showing all enrolled students with their next scheduled meeting
2. **Add Meeting Button**: Per student, opens a dialog to schedule meeting
3. **Quick Actions**: Edit/cancel/mark complete on each scheduled meeting
4. **Empty State**: Prompt to schedule first meeting when no schedules exist

### For Students (Schedule Tab)

1. **Upcoming Meetings**: Card list of scheduled meetings with join button
2. **Past Meetings**: Collapsed section showing completed sessions
3. **Meeting Cards**: Show title, date/time, duration, join link

---

## Verification Plan

### Automated Tests

Create new test file `tests/Feature/StudentMeetingScheduleTest.php`:

```bash
php artisan test tests/Feature/StudentMeetingScheduleTest.php
```

Test cases:

- Tutor can list all student schedules for their course
- Tutor can create meeting for enrolled student
- Tutor cannot create meeting for non-enrolled student
- Tutor can update/delete existing meetings
- Student can only see their own meeting schedules
- Student cannot create/update/delete meetings
- Non-enrolled user cannot access schedules

### Manual Verification

1. **Login as tutor** → Navigate to a course → Click "Schedule" tab
2. **Verify student list** shows all enrolled students
3. **Click "Add Meeting"** for a student → Fill form → Submit
4. **Verify meeting appears** in the student's schedule row
5. **Login as student** → Same course → "Schedule" tab
6. **Verify student sees only their own** scheduled meetings
7. **Verify meeting appears** in calendar page (if calendar integration approved)
