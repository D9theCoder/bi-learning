# Admin Role Implementation Plan

This plan implements enhanced admin role capabilities with monitoring focus, ensuring admins have equal or higher authority than tutors while adhering to the specified constraints.

## Background & Context

The BI-Learning application currently has three roles: `student`, `tutor`, and `admin`. The existing roles and permissions system uses Spatie Laravel Permission. Currently:

- **Admin** already has all permissions (inherits everything)
- **Dashboard** treats admin the same as tutor (`$isTutor || $isAdmin`)
- **MessageController** already has admin-specific logic (can view all chats but cannot send messages)
- **CourseManagementController** allows admins to manage any course but doesn't require tutor assignment

This plan addresses the gaps to make admin role distinctive with monitoring capabilities.

---

## User Review Required

> [!IMPORTANT]  
> **Gamification Fields**: Admins currently have `total_xp`, `level`, etc. fields in the User model. Should these fields be set to `0` for admin users, or should the UI simply not display them? The plan assumes UI-level exclusion only.

> [!WARNING]  
> **Course Ownership**: When an admin creates a course and assigns a tutor, who "owns" it for editing purposes? The plan assumes the assigned tutor becomes the instructor and can edit it, while admin retains override access.

---

## Proposed Changes

### Backend - Permissions & Data Layer

---

#### [MODIFY] [RolesAndPermissionsSeeder.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/seeders/RolesAndPermissionsSeeder.php>)

Add admin-specific permissions for monitoring capabilities:

```diff
  $permissions = [
      'view dashboard',
      'view leaderboard',
      'view achievements',
      'manage daily tasks',
      'redeem rewards',
      'enroll courses',
      'view courses',
      'view messages',
      'send messages',
      'manage courses',
      'manage course sessions',
      'manage users',
+     'monitor all tutors',
+     'monitor all students',
+     'view all chats',
  ];
```

Add distinct admin permissions (admins have all permissions plus monitoring-specific ones):

```diff
- $admin->syncPermissions(Permission::all());
+ $admin->syncPermissions(Permission::all());
+ // Note: Admin explicitly gets monitor permissions but NOT 'send messages'
+ // in chat context - this is enforced in MessageController
```

---

#### [MODIFY] [User.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Models/User.php>)

Add helper method to check gamification eligibility:

```php
/**
 * Check if user should have gamification features.
 * Admins and tutors are excluded from gamification.
 */
public function hasGamification(): bool
{
    return !$this->hasAnyRole(['admin', 'tutor']);
}
```

---

### Backend - Dashboard Controller

---

#### [MODIFY] [DashboardController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/DashboardController.php>)

**Key Changes:**

1. Separate admin dashboard data from tutor dashboard data
2. Admin gets monitoring overview of ALL tutors, courses, and students
3. Exclude gamification data for admin role

```diff
  public function index(Request $request): Response
  {
      $user = $request->user();
      $isTutor = $user->hasRole('tutor');
      $isAdmin = $user->hasRole('admin');

-     // Get level progress data
-     $levelProgress = $this->gamificationService->getLevelProgress($user);
+     // Get level progress data (only for gamification-eligible users)
+     $levelProgress = $user->hasGamification()
+         ? $this->gamificationService->getLevelProgress($user)
+         : ['xp_in_level' => 0, 'xp_for_next_level' => 0, 'progress_percentage' => 0];
```

Add admin-specific data preparation:

```php
$adminData = null;

if ($isAdmin) {
    // Admin monitoring view: all tutors, all courses, all students
    $allTutors = User::role('tutor')
        ->withCount(['sentMessages as message_count'])
        ->get()
        ->map(fn ($tutor) => [
            'id' => $tutor->id,
            'name' => $tutor->name,
            'avatar' => $tutor->avatar,
            'course_count' => Course::where('instructor_id', $tutor->id)->count(),
            'student_count' => Enrollment::whereHas('course', fn ($q) => $q->where('instructor_id', $tutor->id))->distinct('user_id')->count('user_id'),
        ]);

    $allCourses = Course::with('instructor')
        ->withCount('enrollments')
        ->latest()
        ->get()
        ->map(fn ($course) => [
            'id' => $course->id,
            'title' => $course->title,
            'instructor' => $course->instructor ? [
                'id' => $course->instructor->id,
                'name' => $course->instructor->name,
            ] : null,
            'student_count' => $course->enrollments_count,
            'is_published' => $course->is_published,
        ]);

    $allStudents = User::role('student')
        ->withCount('enrollments')
        ->orderByDesc('total_xp')
        ->limit(20)
        ->get()
        ->map(fn ($student) => [
            'id' => $student->id,
            'name' => $student->name,
            'avatar' => $student->avatar,
            'enrollment_count' => $student->enrollments_count,
            'total_xp' => $student->total_xp ?? 0,
            'level' => $student->level ?? 1,
        ]);

    $adminData = [
        'tutors' => $allTutors,
        'courses' => $allCourses,
        'students' => $allStudents,
        'summary' => [
            'tutor_count' => User::role('tutor')->count(),
            'course_count' => Course::count(),
            'student_count' => User::role('student')->count(),
            'active_enrollment_count' => Enrollment::where('status', 'active')->count(),
        ],
    ];
}
```

Update the return statement to include admin data:

```diff
  return Inertia::render('dashboard', [
      // ... existing props ...
+     'admin_dashboard' => $adminData,
+     'is_admin' => $isAdmin,
  ]);
```

---

### Backend - Course Management

---

#### [MODIFY] [StoreCourseRequest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Requests/StoreCourseRequest.php>)

Require `instructor_id` when admin creates a course:

```diff
  public function rules(): array
  {
+     $rules = [
          'title' => ['required', 'string', 'max:255'],
          'description' => ['required', 'string'],
          'thumbnail' => ['nullable', 'string', 'max:255'],
          'duration_minutes' => ['nullable', 'integer', 'min:1'],
          'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
          'category' => ['required', Rule::enum(CourseCategory::class)],
          'is_published' => ['sometimes', 'boolean'],
-         'instructor_id' => ['nullable', 'exists:users,id'],
+         'instructor_id' => ['nullable', 'exists:users,id'],
      ];
+
+     // Admin MUST assign an instructor when creating a course
+     if ($this->user()?->hasRole('admin')) {
+         $rules['instructor_id'] = [
+             'required',
+             'exists:users,id',
+             function ($attribute, $value, $fail) {
+                 $instructor = \App\Models\User::find($value);
+                 if (!$instructor || !$instructor->hasRole('tutor')) {
+                     $fail('The selected instructor must have the tutor role.');
+                 }
+             },
+         ];
+     }
+
+     return $rules;
  }
+
+ public function messages(): array
+ {
+     return [
+         'instructor_id.required' => 'As an admin, you must assign a tutor to this course.',
+     ];
+ }
```

---

#### [MODIFY] [CourseManagementController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/CourseManagementController.php>)

Pass available tutors to the create/edit page:

```diff
  public function create(Request $request): Response
  {
      $user = $request->user();

      if (!$user->hasAnyRole(['admin', 'tutor'])) {
          abort(403);
      }

+     $availableTutors = [];
+     if ($user->hasRole('admin')) {
+         $availableTutors = User::role('tutor')
+             ->orderBy('name')
+             ->get(['id', 'name', 'avatar']);
+     }

      return Inertia::render('courses/manage/edit', [
          'course' => null,
          'mode' => 'create',
          'categories' => CourseCategory::options(),
+         'availableTutors' => $availableTutors,
+         'isAdmin' => $user->hasRole('admin'),
      ]);
  }
```

Similarly update `edit()` method to pass `availableTutors` and `isAdmin`.

Update `store()` to enforce tutor assignment for admin:

```diff
  public function store(StoreCourseRequest $request): RedirectResponse
  {
      $user = $request->user();
      $data = $request->validated();

      if ($user->hasRole('admin')) {
-         $data['instructor_id'] = $data['instructor_id'] ?? $user->id;
+         // Admin must assign a tutor (validated in request)
+         // instructor_id is required for admin, so it's always present
      } else {
          $data['instructor_id'] = $user->id;
      }
```

---

### Frontend - Dashboard Views

---

#### [NEW] [admin-dashboard-view.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/dashboard/views/admin-dashboard-view.tsx>)

New component for admin-specific dashboard focused on monitoring:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DashboardWelcomeHeader } from "../sections/dashboard-welcome-header";
import type { AdminDashboardData } from "@/types";
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react";

interface AdminDashboardViewProps {
  userName: string;
  adminData: AdminDashboardData;
  isLoading: boolean;
}

export function AdminDashboardView({
  userName,
  adminData,
  isLoading,
}: AdminDashboardViewProps) {
  return (
    <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto p-4 lg:p-8">
      <DashboardWelcomeHeader userName={userName} isAdmin />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Tutors"
          value={adminData.summary.tutor_count}
        />
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={adminData.summary.course_count}
        />
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          value={adminData.summary.student_count}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Enrollments"
          value={adminData.summary.active_enrollment_count}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tutors Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            {adminData.tutors.map((tutor) => (
              <div key={tutor.id} className="flex items-center gap-3 py-2">
                <Avatar className="size-8">
                  <AvatarImage src={tutor.avatar} />
                  <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{tutor.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tutor.course_count} courses · {tutor.student_count}{" "}
                    students
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Courses Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {adminData.courses.slice(0, 10).map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.instructor?.name ?? "Unassigned"}
                  </p>
                </div>
                <Badge variant={course.is_published ? "default" : "secondary"}>
                  {course.is_published ? "Published" : "Draft"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Students Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Top Students</CardTitle>
          </CardHeader>
          <CardContent>
            {adminData.students.slice(0, 10).map((student) => (
              <div key={student.id} className="flex items-center gap-3 py-2">
                <Avatar className="size-8">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {student.level} · {student.total_xp} XP
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

#### [MODIFY] [dashboard.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/dashboard.tsx>)

Update to render `AdminDashboardView` for admins:

```diff
+ import { AdminDashboardView } from '@/components/dashboard/views/admin-dashboard-view';

  export default function Dashboard({ ... }) {
    const { isAdmin, isTutor } = useRoles();

-   const isTutorView = isTutor || isAdmin;
+   // Admin gets distinct monitoring dashboard
+   if (isAdmin && admin_dashboard) {
+     return (
+       <AppLayout breadcrumbs={breadcrumbs}>
+         <Head title="Admin Dashboard" />
+         <AdminDashboardView
+           userName={userName}
+           adminData={admin_dashboard}
+           isLoading={isLoading}
+         />
+       </AppLayout>
+     );
+   }

    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Dashboard" />
-       {isTutorView ? (
+       {isTutor ? (
          <TutorDashboardView ... />
        ) : (
          <StudentDashboardView ... />
        )}
      </AppLayout>
    );
  }
```

---

#### [MODIFY] [index.d.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/types/index.d.ts>)

Add TypeScript types for admin dashboard:

```typescript
export interface AdminDashboardData {
  tutors: Array<{
    id: number;
    name: string;
    avatar?: string;
    course_count: number;
    student_count: number;
  }>;
  courses: Array<{
    id: number;
    title: string;
    instructor: { id: number; name: string } | null;
    student_count: number;
    is_published: boolean;
  }>;
  students: Array<{
    id: number;
    name: string;
    avatar?: string;
    enrollment_count: number;
    total_xp: number;
    level: number;
  }>;
  summary: {
    tutor_count: number;
    course_count: number;
    student_count: number;
    active_enrollment_count: number;
  };
}
```

---

### Frontend - Course Management

---

#### [MODIFY] [edit.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/courses/manage/edit.tsx>)

Add tutor selector for admin users:

```diff
+ import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
+ import { Label } from '@/components/ui/label';

  export default function EditCourse({
    course,
    mode,
    categories,
    availablePowerups = [],
+   availableTutors = [],
+   isAdmin = false,
  }: EditCoursePageProps) {
    const isEdit = mode === 'edit';
    const form = useForm({
      title: course?.title ?? '',
      description: course?.description ?? '',
      category: course?.category ?? '',
      difficulty: course?.difficulty ?? '',
      duration_minutes: course?.duration_minutes ?? '',
      thumbnail: course?.thumbnail ?? '',
      is_published: course?.is_published ?? false,
+     instructor_id: course?.instructor_id ?? '',
    });
```

In the form JSX, add tutor selector (shown only for admins):

```tsx
{
  isAdmin && (
    <div className="space-y-2">
      <Label htmlFor="instructor_id">Assign Tutor *</Label>
      <Select
        value={String(form.data.instructor_id)}
        onValueChange={(value) => form.setData("instructor_id", value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a tutor" />
        </SelectTrigger>
        <SelectContent>
          {availableTutors.map((tutor) => (
            <SelectItem key={tutor.id} value={String(tutor.id)}>
              {tutor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {form.errors.instructor_id && (
        <p className="text-sm text-destructive">{form.errors.instructor_id}</p>
      )}
    </div>
  );
}
```

---

### Frontend - Messages (Chat) Page

---

#### [MODIFY] [messages/index.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/messages/index.tsx>)

Ensure admins cannot send messages (hide input):

The `MessageController` already blocks admin from sending. The frontend should hide the input field:

```diff
  {/* Message input - hidden for admins (read-only view) */}
- {activeThread && (
+ {activeThread && !isAdmin && (
    <MessageInput onSend={sendMessage} disabled={processing} />
  )}
+ {activeThread && isAdmin && (
+   <div className="p-4 border-t bg-muted/50 text-center text-sm text-muted-foreground">
+     Admin view is read-only. You cannot send messages.
+   </div>
+ )}
```

---

## Verification Plan

### Automated Tests

Create new test file for admin-specific functionality:

```bash
php artisan make:test AdminRoleTest --pest
```

**Test cases to implement:**

1. Admin can view dashboard with monitoring data
2. Admin cannot see gamification stats
3. Admin can view all tutor-student chats
4. Admin cannot send messages (403 response)
5. Admin must assign a tutor when creating a course
6. Admin can create course with valid tutor assignment
7. Admin can manage any course (not just their own)

Example test:

```php
it('requires admin to assign a tutor when creating a course', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)
        ->post('/courses/manage', [
            'title' => 'Test Course',
            'description' => 'Description',
            'category' => 'stem_science',
        ])
        ->assertSessionHasErrors('instructor_id');
});

it('allows admin to create course with tutor assignment', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $this->actingAs($admin)
        ->post('/courses/manage', [
            'title' => 'Test Course',
            'description' => 'Description',
            'category' => 'stem_science',
            'instructor_id' => $tutor->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('courses', [
        'title' => 'Test Course',
        'instructor_id' => $tutor->id,
    ]);
});
```

### Manual Verification

1. **Login as Admin** → Verify monitoring dashboard displays
2. **Create Course as Admin** → Verify tutor selector appears and is required
3. **View Messages as Admin** → Verify all chats visible, input hidden
4. **Check Dashboard Stats** → Verify no XP/level/streak widgets for admin

---

## Summary of Changes

| Area          | File                             | Change Type                    |
| ------------- | -------------------------------- | ------------------------------ |
| Permissions   | `RolesAndPermissionsSeeder.php`  | Add monitoring permissions     |
| Model         | `User.php`                       | Add `hasGamification()` helper |
| Dashboard     | `DashboardController.php`        | Add admin monitoring data      |
| Dashboard     | `admin-dashboard-view.tsx`       | New admin-specific view        |
| Dashboard     | `dashboard.tsx`                  | Route admin to new view        |
| Course Create | `StoreCourseRequest.php`         | Require tutor for admin        |
| Course Create | `CourseManagementController.php` | Pass available tutors          |
| Course Create | `edit.tsx`                       | Add tutor selector UI          |
| Messages      | `messages/index.tsx`             | Hide input for admin           |
| Types         | `index.d.ts`                     | Add `AdminDashboardData` type  |
| Tests         | `AdminRoleTest.php`              | New test cases                 |
