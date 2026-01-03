# Update Course Tests and Seeders for STEM Categories

This plan updates all course-related factories, seeders, and tests to use the new STEM category system (Basic Mathematics, Advanced Mathematics, Physics, Chemistry, Biology) instead of arbitrary categories.

## User Review Required

> [!NOTE]
> This plan only updates test files and seeders. No production code changes are needed since the STEM categories were already implemented in the previous plan.

---

## Proposed Changes

### Backend: Update Factories

---

#### [MODIFY] [CourseFactory.php](file:///c:/Users/kevin/Herd/web-skripsi/database/factories/CourseFactory.php)

Replace the arbitrary categories with valid STEM subjects:

```diff
+ use App\Enums\CourseCategory;

  public function definition(): array
  {
      $titles = [
-         'Introduction to Python Programming',
-         'Advanced JavaScript Techniques',
-         'Data Science Fundamentals',
-         'Machine Learning Basics',
-         'Web Development with React',
-         'Database Design and SQL',
-         'Mobile App Development',
-         'Cloud Computing Essentials',
-         'Cybersecurity Fundamentals',
-         'AI and Deep Learning',
+         'Introduction to Algebra',
+         'Advanced Calculus Techniques',
+         'Quantum Physics Fundamentals',
+         'Organic Chemistry Basics',
+         'Molecular Biology',
+         'Linear Algebra and Matrices',
+         'Thermodynamics and Heat Transfer',
+         'Chemical Bonding and Reactions',
+         'Cell Biology and Genetics',
+         'Differential Equations',
      ];

      return [
          'title' => fake()->randomElement($titles),
          'description' => fake()->paragraphs(3, true),
          'thumbnail' => 'https://picsum.photos/seed/'.fake()->uuid().'/800/600',
          'instructor_id' => User::factory(),
          'duration_minutes' => fake()->numberBetween(300, 3000),
          'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
-         'category' => fake()->randomElement(['Programming', 'Data Science', 'Web Development', 'Mobile', 'Cloud', 'Security']),
+         'category' => fake()->randomElement(CourseCategory::values()),
          'is_published' => fake()->boolean(80),
      ];
  }
```

---

### Backend: Update Seeders

---

#### [MODIFY] [FixedScenarioSeeder.php](file:///c:/Users/kevin/Herd/web-skripsi/database/seeders/FixedScenarioSeeder.php)

Change the course category from 'General' to a valid STEM category:

```diff
+ use App\Enums\CourseCategory;

  $course = Course::firstOrCreate(
      ['instructor_id' => $tutor->id, 'title' => 'Fixed Scenario Course'],
      [
          'description' => 'A course for testing fixed scenarios.',
          'thumbnail' => 'https://placehold.co/600x400',
          'difficulty' => 'intermediate',
-         'category' => 'General',
+         'category' => CourseCategory::BasicMathematics->value,
          'is_published' => true,
      ]
  );
```

---

#### [MODIFY] [CourseContentSeeder.php](file:///c:/Users/kevin/Herd/web-skripsi/database/seeders/CourseContentSeeder.php)

Change the course category from 'Research' to a valid STEM category, and update course title/description to match:

```diff
+ use App\Enums\CourseCategory;

  $courseDefinition = [
-     'title' => 'IT Research Methodology',
-     'description' => 'Learn the fundamentals of research methodology in Information Technology, from defining topics to preparing for defense.',
+     'title' => 'Advanced Physics Research',
+     'description' => 'Learn the fundamentals of physics research methodology, from defining topics to preparing for defense.',
      'thumbnail' => 'https://placehold.co/800x480/png?text=IT+Research',
      'duration_minutes' => 720,
      'difficulty' => 'intermediate',
-     'category' => 'Research',
+     'category' => CourseCategory::Physics->value,
      'is_published' => true,
      'lessons' => [
          [
-             'title' => 'Session 1: Research Foundations',
-             'description' => 'Overview of the research lifecycle, expectations, and milestone planning.',
+             'title' => 'Session 1: Physics Research Foundations',
+             'description' => 'Overview of the physics research lifecycle, expectations, and milestone planning.',
              'duration_minutes' => 90,
              'contents' => [
                  // ... contents remain the same
              ],
          ],
          // ... other lessons can keep similar structure
      ],
  ];
```

---

### Backend: Update Tests

---

#### [MODIFY] [CourseManagementTest.php](file:///c:/Users/kevin/Herd/web-skripsi/tests/Feature/CourseManagementTest.php)

Update test cases to use valid STEM categories:

```diff
+ use App\Enums\CourseCategory;

  it('allows admins to view management and create courses', function () {
      // ... setup code
      $response = post('/courses/manage', [
          '_token' => csrf_token(),
          'title' => 'Admin Course',
          'description' => 'Admin created course',
          'difficulty' => 'beginner',
-         'category' => 'Physics',
+         'category' => CourseCategory::Physics->value,
          'is_published' => true,
      ]);
      // ... assertions
  });

  it('rejects invalid course categories', function () {
      $admin = User::factory()->create();
      $admin->assignRole('admin');

      $response = $this->actingAs($admin)->post('/courses/manage', [
          '_token' => csrf_token(),
          'title' => 'Invalid Category',
          'description' => 'Invalid category course',
          'difficulty' => 'beginner',
-         'category' => 'History',
+         'category' => 'History', // This should still be invalid
          'is_published' => true,
      ]);

      $response->assertInvalid(['category']);
  });

  it('allows tutors to manage only their courses', function () {
      // ... setup code
      post("/courses/manage/{$ownCourse->id}", [
          '_method' => 'put',
          '_token' => csrf_token(),
          'title' => 'Updated Title',
          'description' => $ownCourse->description,
          'difficulty' => 'intermediate',
-         'category' => 'Chemistry',
+         'category' => CourseCategory::Chemistry->value,
          'is_published' => true,
      ])->assertRedirect();
      // ... assertions
  });
```

---

#### [VERIFY] [CoursesTest.php](file:///c:/Users/kevin/Herd/web-skripsi/tests/Feature/CoursesTest.php)

No changes needed - this test file uses `Course::factory()` which will now automatically use valid STEM categories from the updated `CourseFactory`.

---

#### [VERIFY] [CourseContentCompletionTest.php](file:///c:/Users/kevin/Herd/web-skripsi/tests/Feature/CourseContentCompletionTest.php)

No changes needed - this test file uses `Course::factory()` which will now automatically use valid STEM categories from the updated `CourseFactory`.

---

## Verification Plan

### Automated Tests

1. **Run course-related tests**:

   ```bash
   php artisan test --filter=Course
   ```

2. **Specifically test course management**:

   ```bash
   php artisan test tests/Feature/CourseManagementTest.php
   ```

3. **Run full test suite**:

   ```bash
   php artisan test
   ```

4. **Run Laravel Pint for formatting**:
   ```bash
   vendor/bin/pint --dirty
   ```

### Manual Verification

1. **Seed database with new data**:

   ```bash
   php artisan migrate:fresh --seed
   ```

   - Verify all courses have STEM categories
   - Check Fixed Scenario Course has valid category
   - Check Course Content Seeder course has valid category

2. **Test course creation**:
   - Navigate to `/courses/manage/create`
   - Verify category dropdown shows only STEM subjects
   - Create a test course with each STEM category
   - Verify validation rejects invalid categories

---

## Summary of Changes

### Files to Modify:

1. **CourseFactory.php** - Update category randomElement to use `CourseCategory::values()`
2. **FixedScenarioSeeder.php** - Change 'General' to `CourseCategory::BasicMathematics->value`
3. **CourseContentSeeder.php** - Change 'Research' to `CourseCategory::Physics->value`
4. **CourseManagementTest.php** - Update test categories to use `CourseCategory` enum values

### Files to Verify (no changes needed):

1. **CoursesTest.php** - Uses factory which will automatically have valid categories
2. **CourseContentCompletionTest.php** - Uses factory which will automatically have valid categories

### Expected Outcomes:

- ✅ All course factories generate courses with valid STEM categories
- ✅ All seeders create courses with valid STEM categories
- ✅ All tests pass with the new category validation
- ✅ Database seeding works without category validation errors
