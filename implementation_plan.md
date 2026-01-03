# Remove Cohorts & Implement STEM Subject Categories

This plan removes the cohort system entirely from the codebase, makes the XP leaderboard global, and implements locked STEM subject categories for courses using a select box in the course management form with proper Laravel validation.

## User Review Required

> [!IMPORTANT] > **STEM Categories Confirmation**: The implementation will lock the course categories to these five options:
>
> - Basic Mathematics
> - Advanced Mathematics
> - Physics
> - Chemistry
> - Biology
>
> Please confirm these are the exact categories you want, as they will be hardcoded in an Enum and cannot be changed without code modification.

> [!CAUTION] > **Database Migration**: This plan involves dropping the `cohort_id` column from the `users` table and dropping the `cohorts` table entirely. This is a destructive change that will remove all existing cohort data.

---

## Proposed Changes

### Backend: Remove Cohort System

---

#### [NEW] [RemoveCohortIdFromUsersTable.php](file:///c:/Users/kevin/Herd/web-skripsi/database/migrations/2026_01_04_000001_remove_cohort_id_from_users_table.php)

Migration to remove the `cohort_id` foreign key and column from the `users` table.

```php
// up(): Drop foreign key constraint and column
Schema::table('users', function (Blueprint $table) {
    $table->dropForeign(['cohort_id']);
    $table->dropColumn('cohort_id');
});
```

---

#### [NEW] [DropCohortsTable.php](file:///c:/Users/kevin/Herd/web-skripsi/database/migrations/2026_01_04_000002_drop_cohorts_table.php)

Migration to drop the `cohorts` table entirely.

```php
// up(): Drop the cohorts table
Schema::dropIfExists('cohorts');
```

---

#### [DELETE] [Cohort.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Models/Cohort.php)

Remove the Cohort model as it's no longer needed.

---

#### [DELETE] [CohortFactory.php](file:///c:/Users/kevin/Herd/web-skripsi/database/factories/CohortFactory.php)

Remove the Cohort factory.

---

#### [DELETE] [CohortSeeder.php](file:///c:/Users/kevin/Herd/web-skripsi/database/seeders/CohortSeeder.php)

Remove the Cohort seeder.

---

#### [MODIFY] [User.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Models/User.php)

Remove cohort-related properties and methods:

- Remove `cohort_id` from `$fillable` array
- Remove `cohort_id` cast from `casts()` method
- Remove `cohort()` BelongsTo relationship method
- Remove `cohortRank()` method

---

#### [MODIFY] [TutorController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/TutorController.php)

Remove cohort filtering and display:

- Remove `->with('cohort')` eager loading
- Remove cohort_id filter logic (lines 43-45)
- Remove cohort from the response mapping (lines 59-62)

```diff
- $query = User::query()->with('cohort');
+ $query = User::query();

- if (! empty($filters['cohort_id'])) {
-     $query->where('cohort_id', $filters['cohort_id']);
- }

  $tutors = $tutors->through(function ($tutor) {
      return [
          'id' => $tutor->id,
          'name' => $tutor->name,
          'avatar' => $tutor->avatar,
-         'cohort' => $tutor->cohort ? [
-             'id' => $tutor->cohort->id,
-             'name' => $tutor->cohort->name,
-         ] : null,
          'expertise' => $tutor->expertise ?? [],
          'rating' => $tutor->rating ?? null,
      ];
  });
```

---

#### [MODIFY] [StudentController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/StudentController.php)

Remove cohort filtering and display:

- Remove `->with('cohort')` eager loading
- Remove cohort_id filter logic (lines 43-45)
- Remove cohort from the response mapping (lines 55-58)

---

#### [MODIFY] [DashboardController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/DashboardController.php)

Make leaderboard global instead of cohort-based:

- Remove `'cohort'` from user eager loading
- Change cohort leaderboard to global leaderboard (all users, ranked by XP)
- Remove `cohortRank()` usage

```diff
  $user->load([
-     'cohort',
  ]);

- // Get cohort leaderboard
- $cohortLeaderboard = [];
- $currentUserRank = null;
-
- if ($user->cohort_id) {
-     $cohortLeaderboard = User::where('cohort_id', $user->cohort_id)
+ // Get global leaderboard
+ $globalLeaderboard = User::query()
      ->orderByDesc('total_xp')
      ->limit(10)
      ->get()
      ->map(function ($u, $index) use ($user) {
          return [
              'id' => $u->id,
              'name' => $u->name,
              'avatar' => $u->avatar,
              'xp' => $u->total_xp,
              'level' => $u->level ?? 1,
              'rank' => $index + 1,
              'isCurrentUser' => $u->id === $user->id,
          ];
      });

-     $currentUserRank = $user->cohortRank();
- }
+ // Calculate global rank
+ $currentUserRank = User::where('total_xp', '>', $user->total_xp)->count() + 1;

  return Inertia::render('dashboard', [
      // ... other props
-     'cohort_leaderboard' => $cohortLeaderboard,
+     'global_leaderboard' => $globalLeaderboard,
      'current_user_rank' => $currentUserRank,
  ]);
```

---

#### [MODIFY] [FilterTutorsRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/FilterTutorsRequest.php)

Remove cohort_id validation rule:

```diff
  public function rules(): array
  {
      return [
          'search' => ['nullable', 'string', 'max:100'],
          'expertise' => ['nullable', 'string', 'max:50'],
-         'cohort_id' => ['nullable', 'exists:cohorts,id'],
      ];
  }
```

---

#### [MODIFY] [FilterStudentsRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/FilterStudentsRequest.php)

Remove cohort_id validation rule:

```diff
  public function rules(): array
  {
      return [
          'search' => ['nullable', 'string', 'max:100'],
-         'cohort_id' => ['nullable', 'exists:cohorts,id'],
      ];
  }
```

---

### Backend: Implement STEM Categories

---

#### [NEW] [CourseCategory.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Enums/CourseCategory.php)

Create a PHP enum to define the locked STEM categories:

```php
<?php

namespace App\Enums;

enum CourseCategory: string
{
    case BasicMathematics = 'Basic Mathematics';
    case AdvancedMathematics = 'Advanced Mathematics';
    case Physics = 'Physics';
    case Chemistry = 'Chemistry';
    case Biology = 'Biology';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public static function options(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value, 'label' => $case->value],
            self::cases()
        );
    }
}
```

---

#### [MODIFY] [StoreCourseRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/StoreCourseRequest.php)

Update category validation to use enum values with `Rule::in()`:

```diff
+ use App\Enums\CourseCategory;
+ use Illuminate\Validation\Rule;

  public function rules(): array
  {
      return [
          'title' => ['required', 'string', 'max:255'],
          'description' => ['required', 'string'],
          'thumbnail' => ['nullable', 'string', 'max:255'],
          'duration_minutes' => ['nullable', 'integer', 'min:1'],
          'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
-         'category' => ['nullable', 'string', 'max:100'],
+         'category' => ['required', Rule::in(CourseCategory::values())],
          'is_published' => ['sometimes', 'boolean'],
          'instructor_id' => ['nullable', 'exists:users,id'],
      ];
  }
```

---

#### [MODIFY] [UpdateCourseRequest.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Requests/UpdateCourseRequest.php)

Update category validation to use enum values with `Rule::in()`:

```diff
+ use App\Enums\CourseCategory;
+ use Illuminate\Validation\Rule;

  public function rules(): array
  {
      return [
          'title' => ['required', 'string', 'max:255'],
          'description' => ['required', 'string'],
          'thumbnail' => ['nullable', 'string', 'max:255'],
          'duration_minutes' => ['nullable', 'integer', 'min:1'],
          'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
-         'category' => ['nullable', 'string', 'max:100'],
+         'category' => ['required', Rule::in(CourseCategory::values())],
          'is_published' => ['sometimes', 'boolean'],
          'instructor_id' => ['nullable', 'exists:users,id'],
      ];
  }
```

---

#### [MODIFY] [CourseManagementController.php](file:///c:/Users/kevin/Herd/web-skripsi/app/Http/Controllers/CourseManagementController.php)

Pass available categories to create and edit views:

```diff
+ use App\Enums\CourseCategory;

  public function create(Request $request): Response
  {
      // ... authorization check
      return Inertia::render('courses/manage/edit', [
          'course' => null,
          'mode' => 'create',
+         'categories' => CourseCategory::options(),
      ]);
  }

  public function edit(Request $request, Course $course): Response
  {
      // ... authorization and loading
      return Inertia::render('courses/manage/edit', [
          'course' => [...],
          'mode' => 'edit',
+         'categories' => CourseCategory::options(),
      ]);
  }
```

---

### Frontend: Remove Cohort References

---

#### [MODIFY] [tutor-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/tutors/tutor-card.tsx)

Remove cohort display from tutor cards:

```diff
  interface TutorCardProps {
    tutor: {
      id: number;
      name: string;
      avatar?: string;
-     cohort?: {
-       id: number;
-       name: string;
-     };
      expertise?: string[];
      rating?: number;
    };
  }

- {tutor.cohort && (
-   <CardDescription>{tutor.cohort.name}</CardDescription>
- )}
```

---

#### [MODIFY] [student-card.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/students/student-card.tsx)

Remove cohort display from student cards:

```diff
  interface StudentCardProps {
    student: {
      id: number;
      name: string;
      email?: string;
      avatar?: string;
-     cohort?: {
-       id: number;
-       name: string;
-     };
    };
  }

- {student.cohort && (
-   <CardDescription>{student.cohort.name}</CardDescription>
- )}
```

---

#### [MODIFY] [cohort-leaderboard.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/dashboard/cohort-leaderboard.tsx)

Rename to `leaderboard.tsx` and remove cohort-specific logic:

```diff
- interface CohortLeaderboardProps {
+ interface LeaderboardProps {
    entries: LeaderboardEntry[];
-   cohortName?: string;
    className?: string;
  }

- export function CohortLeaderboard({
+ export function Leaderboard({
    entries,
-   cohortName,
    className,
- }: CohortLeaderboardProps) {
+ }: LeaderboardProps) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold">Leaderboard</span>
-           {cohortName && <Badge variant="outline">{cohortName}</Badge>}
+           <Badge variant="outline">Global</Badge>
          </CardTitle>
        </CardHeader>
        ...
      </Card>
    );
  }
```

---

#### [MODIFY] [index.d.ts](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/types/index.d.ts)

Remove Cohort interface and cohort_id from User:

```diff
  export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
-   cohort_id?: number;
    total_xp?: number;
    level?: number;
    points_balance?: number;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
  }

- export interface Cohort {
-   id: number;
-   name: string;
-   description?: string;
-   created_at: string;
- }

  export interface TutorsPageProps {
    filters: {
      search?: string;
      expertise?: string;
-     cohort_id?: number;
    };
    tutors: {
      data: Array<{
        id: number;
        name: string;
        avatar?: string;
-       cohort?: {
-         id: number;
-         name: string;
-       };
        expertise?: string[];
        rating?: number;
      }>;
      ...
    };
  }

  export interface StudentsPageProps {
    filters: {
      search?: string;
-     cohort_id?: number;
    };
    students: {
      data: Array<{
        id: number;
        name: string;
        email?: string;
        avatar?: string;
-       cohort?: {
-         id: number;
-         name: string;
-       };
      }>;
      ...
    };
  }
```

---

### Frontend: Implement Category Select Box

---

#### [MODIFY] [course-details-form.tsx](file:///c:/Users/kevin/Herd/web-skripsi/resources/js/components/courses/manage/course-details-form.tsx)

Replace category text Input with a select box:

```diff
+ const categories = [
+   { value: 'Basic Mathematics', label: 'Basic Mathematics' },
+   { value: 'Advanced Mathematics', label: 'Advanced Mathematics' },
+   { value: 'Physics', label: 'Physics' },
+   { value: 'Chemistry', label: 'Chemistry' },
+   { value: 'Biology', label: 'Biology' },
+ ];

  <div className="space-y-2">
    <Label htmlFor="category">Category</Label>
-   <Input
+   <select
      id="category"
+     className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
      value={form.data.category}
      onChange={(e) => form.setData('category', e.target.value)}
-     placeholder="e.g. Programming"
      aria-invalid={Boolean(form.errors.category)}
-   />
+   >
+     <option value="">Select category</option>
+     {categories.map((opt) => (
+       <option key={opt.value} value={opt.value}>
+         {opt.label}
+       </option>
+     ))}
+   </select>
    {form.errors.category ? (
      <p className="text-xs text-destructive">{form.errors.category}</p>
    ) : null}
  </div>
```

> [!NOTE]
> Optional enhancement: The categories can also be passed from the backend via props instead of hardcoding in the frontend. This is already set up in the `CourseManagementController` changes above.

---

## Verification Plan

### Automated Tests

1. Run existing tests with filter to verify no cohort-related tests fail:

   ```bash
   php artisan test --filter=Tutor
   php artisan test --filter=Dashboard
   ```

2. Run full test suite after changes:

   ```bash
   php artisan test
   ```

3. Run Laravel Pint to ensure code formatting:
   ```bash
   vendor/bin/pint --dirty
   ```

### Manual Verification

1. **Course Management Form**:

   - Navigate to `/courses/manage/create`
   - Verify category dropdown shows all 5 STEM subjects
   - Verify form submission validates category is required
   - Verify invalid category values are rejected

2. **Dashboard Leaderboard**:

   - Navigate to `/dashboard`
   - Verify leaderboard shows all users globally (not filtered by cohort)
   - Verify "Global" badge appears instead of cohort name

3. **Tutors/Students Pages**:

   - Navigate to `/tutors` and `/students`
   - Verify no cohort information is displayed
   - Verify filtering works without cohort options

4. **Database Migration**:
   - Verify `php artisan migrate` runs successfully
   - Verify `cohorts` table is dropped
   - Verify `cohort_id` column is removed from `users` table


# To-Do list:
## Main Objectives

- [/] Create implementation plan for cohort removal
- [ ] Remove cohort system entirely from codebase
- [ ] Make leaderboard global (not restricted by cohorts)
- [ ] Implement STEM subject categories via select box in course form
- [ ] Add proper Laravel validation for categories
- [ ] Update tests to reflect changes

## Task Breakdown

### 1. Backend: Remove Cohort Dependencies

- [ ] Create migration to drop `cohort_id` from `users` table
- [ ] Create migration to drop `cohorts` table
- [ ] Remove `Cohort` model (`app/Models/Cohort.php`)
- [ ] Remove `CohortFactory.php` and `CohortSeeder.php`
- [ ] Update `User` model: remove `cohort()` relationship and `cohortRank()` method, `cohort_id` from fillable/casts
- [ ] Update `TutorController`: remove cohort filtering and eager loading
- [ ] Update `StudentController`: remove cohort filtering and eager loading
- [ ] Update `DashboardController`: make leaderboard global instead of cohort-based
- [ ] Update `FilterTutorsRequest`: remove `cohort_id` validation
- [ ] Update `FilterStudentsRequest`: remove `cohort_id` validation

### 2. Backend: Implement STEM Categories

- [ ] Create `CourseCategory` enum class with STEM subjects
- [ ] Update `StoreCourseRequest`: change category validation to use enum
- [ ] Update `UpdateCourseRequest`: change category validation to use enum
- [ ] Update `CourseManagementController@create`: pass available categories
- [ ] Update `CourseManagementController@edit`: pass available categories

### 3. Frontend: Remove Cohort References

- [ ] Update `tutor-card.tsx`: remove cohort display
- [ ] Update `student-card.tsx`: remove cohort display
- [ ] Update `cohort-leaderboard.tsx`: rename to `global-leaderboard.tsx`, remove cohort-specific logic
- [ ] Update `dashboard.tsx`: use global leaderboard
- [ ] Update `student-dashboard-view.tsx`: use global leaderboard
- [ ] Update `types/index.d.ts`: remove Cohort interface and cohort_id from User

### 4. Frontend: Implement Category Select Box

- [ ] Update `course-details-form.tsx`: replace category Input with select box
- [ ] Update `edit.tsx`: receive categories from backend

### 5. Tests

- [ ] Update relevant tests in `TutorsTest.php`
- [ ] Update relevant tests in `DashboardTest.php`
- [ ] Run full test suite to verify no regressions
