# User Management & RBAC Modifications

This implementation plan covers two main features:

1. **Admin User Management** - A dedicated page for admins to view, search, filter, sort, and create users (students and tutors)
2. **RBAC Modification** - Prevent tutors from creating new courses; they can only edit courses assigned to them by an admin

---

## User Review Required

> [!IMPORTANT] > **Course Deletion**: The current plan does not include user deletion functionality. Should admins be able to delete users, or should this be a soft-delete/deactivation feature?

> [!IMPORTANT]  
> **Tutor Self-Assignment**: When creating a course, admins must assign a tutor. Should the "New Course" button/flow require mandatory tutor selection before saving?

> [!WARNING] > **Breaking Change for Tutors**: Tutors will no longer be able to create new courses. Existing courses they created will still be editable. Please confirm this is the expected behavior.

---

## Proposed Changes

### Task 1: Admin User Management Page

This feature adds a dedicated user management section accessible only to administrators.

---

#### [NEW] [UserManagementController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/UserManagementController.php>)

New controller with the following methods:

- `index(FilterUsersRequest $request)` - List all users with search, sort, filter, and pagination
- `create()` - Show the create user form
- `store(StoreUserRequest $request)` - Create a new student or tutor

**Key features:**

- Filter by role (admin, tutor, student)
- Search by name/email
- Sort by name, email, created_at (asc/desc)
- Paginate results (12 per page, matching existing patterns)

```php
public function index(FilterUsersRequest $request): Response
{
    $query = User::query()
        ->with('roles')
        ->when($request->role, fn ($q, $role) => $q->role($role))
        ->when($request->search, fn ($q, $search) =>
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
        );

    // Apply sorting
    $sortField = $request->sort_by ?? 'created_at';
    $sortDir = $request->sort_dir ?? 'desc';
    $query->orderBy($sortField, $sortDir);

    $users = $query->paginate(12)->withQueryString();

    return Inertia::render('admin/users/index', [
        'users' => $users,
        'filters' => $request->validated(),
    ]);
}
```

---

#### [NEW] [FilterUsersRequest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Requests/FilterUsersRequest.php>)

Form request for validating user list filters:

```php
public function rules(): array
{
    return [
        'search' => ['nullable', 'string', 'max:255'],
        'role' => ['nullable', 'string', 'in:admin,tutor,student'],
        'sort_by' => ['nullable', 'string', 'in:name,email,created_at'],
        'sort_dir' => ['nullable', 'string', 'in:asc,desc'],
    ];
}
```

---

#### [NEW] [StoreUserRequest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Requests/StoreUserRequest.php>)

Form request for creating new users:

```php
public function rules(): array
{
    return [
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
        'role' => ['required', 'string', 'in:student,tutor'],
    ];
}
```

---

#### [MODIFY] [web.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/routes/web.php>)

Add new routes for user management (admin only):

```php
// Admin User Management routes
Route::middleware('role:admin')->prefix('admin/users')->name('admin.users.')->group(function () {
    Route::get('/', [UserManagementController::class, 'index'])->name('index');
    Route::get('/create', [UserManagementController::class, 'create'])->name('create');
    Route::post('/', [UserManagementController::class, 'store'])->name('store');
});
```

---

#### [NEW] [index.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/admin/users/index.tsx>)

New page for listing all users with:

- Search input (debounced)
- Role filter dropdown (All, Admin, Tutor, Student)
- Sort by dropdown (Name, Email, Created Date)
- Sort direction toggle (Asc/Desc)
- Paginated grid of user cards
- "Create User" button

**UI Pattern**: Follow the existing pattern from `students/index.tsx` and `courses/manage/index.tsx`.

---

#### [NEW] [create.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/admin/users/create.tsx>)

Form page for creating new users:

- Name input
- Email input
- Password input with confirmation
- Role dropdown (Student or Tutor only - admins shouldn't be created through UI)

**UI Pattern**: Follow existing form patterns from `courses/manage/edit.tsx`.

---

#### [NEW] [user-card.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/users/user-card.tsx>)

Reusable component displaying:

- Avatar
- Name
- Email
- Role badge (color-coded: Admin=red, Tutor=blue, Student=green)
- Created date

---

#### [MODIFY] [app-sidebar.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/app-sidebar.tsx>)

Add "User Management" nav item for admin users:

```tsx
// Add to imports
import { UsersRound } from "lucide-react";

// Add after existing nav items logic
if (isAdmin) {
  const userManagementLink: NavItem = {
    title: "User Management",
    href: "/admin/users",
    icon: UsersRound,
  };

  // Insert after Manage Courses or at the end
  navItems.push(userManagementLink);
}
```

---

#### [MODIFY] [index.d.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/types/index.d.ts>)

Add new types for user management:

```typescript
// User with role information for admin view
export interface UserWithRole extends User {
  roles: { id: number; name: string }[];
}

// User management page props
export interface UserManagementPageProps {
  users: PaginatedData<UserWithRole>;
  filters: {
    search?: string;
    role?: "admin" | "tutor" | "student";
    sort_by?: "name" | "email" | "created_at";
    sort_dir?: "asc" | "desc";
  };
}
```

---

### Task 2: RBAC Modification - Tutor Course Creation Restriction

This modification prevents tutors from creating new courses. They can only view and edit courses that have been assigned to them by an admin.

---

#### [MODIFY] [CourseManagementController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/CourseManagementController.php#L67-L89>)

Restrict `create()` method to admin only:

```diff
 public function create(Request $request): Response
 {
     $user = $request->user();

-    if (! $user->hasAnyRole(['admin', 'tutor'])) {
+    // Only admins can create new courses
+    if (! $user->hasRole('admin')) {
         abort(403);
     }

     $availableTutors = [];
-    if ($user->hasRole('admin')) {
-        $availableTutors = User::role('tutor')
-            ->orderBy('name')
-            ->get(['id', 'name', 'avatar']);
-    }
+    // Admin must assign a tutor to the course
+    $availableTutors = User::role('tutor')
+        ->orderBy('name')
+        ->get(['id', 'name', 'avatar']);

     return Inertia::render('courses/manage/edit', [
         'course' => null,
         'mode' => 'create',
         'categories' => CourseCategory::options(),
         'availableTutors' => $availableTutors,
         'isAdmin' => $user->hasRole('admin'),
     ]);
 }
```

---

#### [MODIFY] [CourseManagementController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/CourseManagementController.php#L91-L108>)

Restrict `store()` method to admin only:

```diff
 public function store(StoreCourseRequest $request): RedirectResponse
 {
     $user = $request->user();
     $data = $request->validated();

-    if (! $user->hasRole('admin')) {
-        $data['instructor_id'] = $user->id;
+    // Only admins can create new courses
+    if (! $user->hasRole('admin')) {
+        abort(403);
+    }
+
+    // Ensure instructor_id is provided by admin
+    if (empty($data['instructor_id'])) {
+        return back()->withErrors(['instructor_id' => 'A tutor must be assigned to the course.']);
     }

     $data['difficulty'] = $data['difficulty'] ?? 'beginner';
     $data['is_published'] = $request->boolean('is_published');

     $course = Course::create($data);

     return redirect()
         ->route('courses.manage.edit', $course)
         ->with('message', 'Course created.');
 }
```

---

#### [MODIFY] [web.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/routes/web.php#L61-L73>)

Update route middleware for course creation to be admin-only:

```diff
 // Course management routes (admin/tutor)
-Route::middleware('role:admin|tutor')->prefix('courses/manage')->name('courses.manage.')->group(function () {
+Route::middleware('role:admin|tutor')->prefix('courses/manage')->name('courses.manage.')->group(function () {
     Route::get('/', [CourseManagementController::class, 'index'])->name('index');
-    Route::get('/create', [CourseManagementController::class, 'create'])->name('create');
-    Route::post('/', [CourseManagementController::class, 'store'])->name('store');
+    // Only admins can create courses
+    Route::middleware('role:admin')->group(function () {
+        Route::get('/create', [CourseManagementController::class, 'create'])->name('create');
+        Route::post('/', [CourseManagementController::class, 'store'])->name('store');
+    });
     Route::get('/{course}/edit', [CourseManagementController::class, 'edit'])->name('edit');
     // ... rest of routes remain unchanged
 });
```

---

#### [MODIFY] [index.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/courses/manage/index.tsx#L56-L61>)

Hide "New Course" button for tutors:

```diff
+import { useRoles } from '@/hooks/use-roles';

 export default function ManageCourses({
   courses,
   filters,
 }: ManageCoursesPageProps) {
+  const { isAdmin } = useRoles();
   const [search, setSearch] = useState(filters?.search || '');

   // ... existing code ...

   <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
     <Input
       placeholder="Search courses..."
       value={search}
       onChange={(e) => setSearch(e.target.value)}
       className="w-full sm:w-64"
     />
-    <Link href="/courses/manage/create">
-      <Button className="inline-flex items-center gap-2">
-        <Plus className="size-4" />
-        New Course
-      </Button>
-    </Link>
+    {isAdmin && (
+      <Link href="/courses/manage/create">
+        <Button className="inline-flex items-center gap-2">
+          <Plus className="size-4" />
+          New Course
+        </Button>
+      </Link>
+    )}
   </div>
```

Also update the empty state in the same file:

```diff
 {courses.data.length === 0 && (
   <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
     <p className="text-base font-semibold text-foreground">
-      No courses yet
+      {isAdmin ? 'No courses yet' : 'No courses assigned'}
     </p>
     <p className="text-sm text-muted-foreground">
-      Create your first course to get started.
+      {isAdmin
+        ? 'Create your first course to get started.'
+        : 'Courses assigned to you by an admin will appear here.'
+      }
     </p>
-    <Link href="/courses/manage/create">
-      <Button size="sm">Create course</Button>
-    </Link>
+    {isAdmin && (
+      <Link href="/courses/manage/create">
+        <Button size="sm">Create course</Button>
+      </Link>
+    )}
   </div>
 )}
```

---

## Verification Plan

### Automated Tests

#### [NEW] [UserManagementTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Feature/UserManagementTest.php>)

```php
<?php

use App\Models\User;
use function Pest\Laravel\{actingAs, get, post};

it('allows admin to view user management page', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    actingAs($admin)
        ->get('/admin/users')
        ->assertSuccessful();
});

it('denies tutor access to user management page', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    actingAs($tutor)
        ->get('/admin/users')
        ->assertForbidden();
});

it('denies student access to user management page', function () {
    $student = User::factory()->create();
    $student->assignRole('student');

    actingAs($student)
        ->get('/admin/users')
        ->assertForbidden();
});

it('allows admin to create a student', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    actingAs($admin)
        ->post('/admin/users', [
            'name' => 'New Student',
            'email' => 'student@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'student',
        ])
        ->assertRedirect('/admin/users');

    expect(User::where('email', 'student@example.com')->exists())->toBeTrue();
});

it('allows admin to create a tutor', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    actingAs($admin)
        ->post('/admin/users', [
            'name' => 'New Tutor',
            'email' => 'tutor@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'tutor',
        ])
        ->assertRedirect('/admin/users');

    $newTutor = User::where('email', 'tutor@example.com')->first();
    expect($newTutor->hasRole('tutor'))->toBeTrue();
});
```

---

#### [NEW] [TutorCourseCreationTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Feature/TutorCourseCreationTest.php>)

```php
<?php

use App\Models\Course;
use App\Models\User;
use function Pest\Laravel\{actingAs, get, post};

it('denies tutor access to create course page', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    actingAs($tutor)
        ->get('/courses/manage/create')
        ->assertForbidden();
});

it('denies tutor from storing new course', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    actingAs($tutor)
        ->post('/courses/manage', [
            'title' => 'New Course',
            'description' => 'Test description',
        ])
        ->assertForbidden();
});

it('allows admin to create course', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    actingAs($admin)
        ->post('/courses/manage', [
            'title' => 'New Course',
            'description' => 'Test description',
            'instructor_id' => $tutor->id,
        ])
        ->assertRedirect();

    expect(Course::where('title', 'New Course')->exists())->toBeTrue();
});

it('allows tutor to edit assigned course', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');

    $course = Course::factory()->create(['instructor_id' => $tutor->id]);

    actingAs($tutor)
        ->get("/courses/manage/{$course->id}/edit")
        ->assertSuccessful();
});

it('denies tutor from editing unassigned course', function () {
    $tutor = User::factory()->create();
    $tutor->assignRole('tutor');
    $otherTutor = User::factory()->create();

    $course = Course::factory()->create(['instructor_id' => $otherTutor->id]);

    actingAs($tutor)
        ->get("/courses/manage/{$course->id}/edit")
        ->assertForbidden();
});
```

### Manual Verification

1. **Admin User Management**:

   - Log in as admin
   - Navigate to User Management via sidebar
   - Verify all users (admins, tutors, students) are displayed
   - Test search functionality
   - Test role filter
   - Test sorting options
   - Create a new student and verify they appear in the list
   - Create a new tutor and verify they appear in the list

2. **Tutor Course Restriction**:

   - Log in as tutor
   - Navigate to Manage Courses
   - Verify "New Course" button is hidden
   - Verify empty state shows appropriate message
   - Verify existing assigned courses are still editable
   - Attempt to access `/courses/manage/create` directly and verify 403

3. **Admin Course Creation**:
   - Log in as admin
   - Navigate to Manage Courses
   - Verify "New Course" button is visible
   - Create a new course and verify tutor assignment is required


# Task: User Management & RBAC Modifications

## Overview

Implement admin-only user management and modify course creation RBAC for tutors.

---

## Task 1: Admin User Management Page

### Planning

- [x] Research existing codebase structure
- [x] Identify existing patterns (students/index, tutors/index)
- [x] Review sidebar navigation implementation
- [x] Document implementation plan

### Backend

- [ ] Create `UserManagementController` with CRUD operations
- [ ] Create `FilterUsersRequest` form request
- [ ] Create `StoreUserRequest` form request for creating students/tutors
- [ ] Add routes in `routes/web.php` with admin middleware
- [ ] Add new permissions if needed

### Frontend

- [ ] Create user management page at `resources/js/pages/admin/users/index.tsx`
- [ ] Create user form page at `resources/js/pages/admin/users/create.tsx`
- [ ] Add "User Management" to sidebar for admin role in `app-sidebar.tsx`
- [ ] Create `UserCard` or `UserRow` component
- [ ] Implement search, sort, and filter functionality

### Testing

- [ ] Create feature tests for user management
- [ ] Test RBAC restrictions

---

## Task 2: RBAC Modification - Tutor Course Creation Restriction

### Planning

- [x] Research current course management implementation
- [x] Identify where tutors can create courses
- [x] Document modification plan

### Backend

- [ ] Modify `CourseManagementController@create` to block tutors
- [ ] Modify `CourseManagementController@store` to block tutors
- [ ] Update route middleware or controller authorization
- [ ] Ensure tutors can still edit assigned courses

### Frontend

- [ ] Hide "New Course" button for tutors in manage courses page
- [ ] Update UI text/messaging where applicable

### Testing

- [ ] Create/update tests for tutor course restrictions
- [ ] Verify tutors can still edit assigned courses

---

## Verification

- [ ] Run `php artisan test` for affected tests
- [ ] Run `npm run lint` and `npm run types`
- [ ] Run `vendor/bin/pint --dirty`
- [ ] Manual browser testing
