# Enhanced Fixed Scenario Seeder Implementation Plan

Enhance the `FixedScenarioSeeder` to create a comprehensive testing environment with realistic high school mathematics courses, multiple user types, and complete course content.

## User Review Required

> [!IMPORTANT] > **New User Accounts**: Adding a superadmin user and an additional student account with predefined credentials.

> [!WARNING] > **Course Content Changes**: The existing "Fixed Scenario Course" will be renamed to "Basic Mathematics" with completely new content. This will affect existing test data if the seeder is re-run on a database that already has this course.

## Proposed Changes

### User Management

#### [MODIFY] [FixedScenarioSeeder.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/seeders/FixedScenarioSeeder.php>)

**Add Superadmin User**:

- Email: `superadmin@gmail.com`
- Password: `password`
- Role: `admin`
- Should have elevated privileges for all admin functions

**Add Additional Student**:

- Email: `student1@gmail.com`
- Password: `password`
- Role: `student`
- Will be enrolled in both courses with different progress levels

---

### Course 1: Basic Mathematics

#### [MODIFY] [FixedScenarioSeeder.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/seeders/FixedScenarioSeeder.php>)

**Course Details**:

- Title: "Basic Mathematics"
- Description: Comprehensive high school mathematics covering fundamental topics
- Category: BasicMathematics
- Difficulty: beginner
- Duration: ~360 minutes (6 hours total)
- Instructor: Fixed Tutor

**Course Structure** (6 lessons with varied content):

1. **Lesson 1: Introduction to Algebra**
   - Description: Variables, expressions, and basic equations
   - Duration: 60 minutes
   - Content: Educational link to Khan Academy Algebra
2. **Lesson 2: Linear Equations**

   - Description: Solving and graphing linear equations
   - Duration: 60 minutes
   - Content: YouTube video on linear equations

3. **Lesson 3: Geometry Fundamentals**

   - Description: Points, lines, angles, and basic shapes
   - Duration: 60 minutes
   - Content: PDF resource file on geometry basics

4. **Lesson 4: Quiz - Algebra & Geometry Basics**

   - Description: Test your understanding of algebra and geometry
   - Duration: 30 minutes
   - Content: Quiz assessment with 10 questions (multiple choice, fill-in-blank)

5. **Lesson 5: Practice - Problem Solving**

   - Description: Practice exercises for mastery
   - Duration: 45 minutes
   - Content: Practice assessment with 5 questions

6. **Lesson 6: Final Exam - Basic Mathematics**
   - Description: Comprehensive final examination
   - Duration: 45 minutes
   - Content: Final exam with mixed question types (15 questions)

---

### Course 2: Advanced Mathematics

#### [MODIFY] [FixedScenarioSeeder.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/seeders/FixedScenarioSeeder.php>)

**Course Details**:

- Title: "Advanced Mathematics"
- Description: Advanced high school mathematics including calculus and advanced topics
- Category: AdvancedMathematics (or Mathematics if advanced doesn't exist)
- Difficulty: advanced
- Duration: ~420 minutes (7 hours total)
- Instructor: Fixed Tutor

**Course Structure** (7 lessons):

1. **Lesson 1: Introduction to Calculus**

   - Description: Limits and continuity concepts
   - Duration: 60 minutes
   - Content: Link to calculus resources

2. **Lesson 2: Derivatives**

   - Description: Understanding and computing derivatives
   - Duration: 60 minutes
   - Content: YouTube video on derivatives

3. **Lesson 3: Integration Basics**

   - Description: Fundamental theorem of calculus and basic integration
   - Duration: 60 minutes
   - Content: Educational video on integration

4. **Lesson 4: Applications of Calculus**

   - Description: Real-world applications and problem solving
   - Duration: 60 minutes
   - Content: PDF resource on calculus applications

5. **Lesson 5: Quiz - Calculus Fundamentals**

   - Description: Test your calculus knowledge
   - Duration: 45 minutes
   - Content: Quiz with 10 questions

6. **Lesson 6: Practice - Advanced Problems**

   - Description: Practice complex calculus problems
   - Duration: 60 minutes
   - Content: Practice assessment with 8 questions

7. **Lesson 7: Final Exam - Advanced Mathematics**
   - Description: Comprehensive final examination
   - Duration: 75 minutes
   - Content: Final exam with 20 questions

---

### Enrollments and Schedules

#### [MODIFY] [FixedScenarioSeeder.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/seeders/FixedScenarioSeeder.php>)

**Student Enrollments**:

- Original student (`student@gmail.com`): Enrolled in Basic Mathematics (0% progress)
- New student (`student1@gmail.com`): Enrolled in both courses
  - Basic Mathematics: 50% progress
  - Advanced Mathematics: 0% progress

**Meeting Schedules**:

- Create realistic meeting schedules for all enrolled students
- Use sequential dates for sessions
- Generate realistic Zoom-style meeting URLs

## Verification Plan

### Automated Tests

Since there are no existing tests for `FixedScenarioSeeder`, I will create a new feature test:

```bash
php artisan make:test --pest FixedScenarioSeederTest
```

The test will verify:

1. Superadmin user is created with correct role
2. Additional student is created with correct credentials
3. Both courses are created with correct titles and properties
4. All lessons are created with descriptions and appropriate durations
5. All assessments contain mathematics-related questions
6. Enrollments are created correctly
7. Meeting schedules are generated for all students

Run with:

```bash
php artisan test --filter=FixedScenarioSeederTest
```

### Manual Verification

After running the seeder, verify in the database:

1. Run the seeder:

   ```bash
   php artisan db:seed --class=FixedScenarioSeeder
   ```

2. Verify users exist by logging in:

   - Login as `superadmin@gmail.com` / `password` - should have admin access
   - Login as `student@gmail.com` / `password` - should see Basic Mathematics course
   - Login as `student1@gmail.com` / `password` - should see both courses

3. Check course content in the UI:

   - Navigate to courses page
   - Verify "Basic Mathematics" and "Advanced Mathematics" are visible
   - Open each course and verify all lessons have descriptions
   - Verify assessments contain mathematics questions (not Laravel questions)

4. Database verification using tinker:

   ```bash
   php artisan tinker
   ```

   ```php
   // Check users
   User::whereIn('email', ['superadmin@gmail.com', 'student1@gmail.com'])->get(['email', 'name']);

   // Check courses
   Course::whereIn('title', ['Basic Mathematics', 'Advanced Mathematics'])->get(['title', 'description', 'duration_minutes']);

   // Check lesson descriptions
   Course::where('title', 'Basic Mathematics')->first()->lessons->pluck('title', 'description');

   // Check quiz questions
   Assessment::where('title', 'Quiz - Algebra & Geometry Basics')->first()->questions->pluck('question');
   ```
