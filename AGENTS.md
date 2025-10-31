# Bi-Learning Platform - AI Coding Agent Instructions

## Project Overview

**Bi-Learning** is a gamified e-learning platform built with Laravel 12, Inertia.js v2, React 19, and Tailwind CSS v4. The platform features comprehensive user progress tracking, achievements, cohort-based learning, daily tasks, tutor messaging, and a reward system. The architecture emphasizes a component-driven React frontend with a Laravel API backend, leveraging Inertia for seamless SPA behavior without building a separate API.

### Tech Stack & Versions
- **Backend**: PHP 8.4.14, Laravel 12, Fortify v1 (auth), Wayfinder v0 (routing)
- **Frontend**: React 19, Inertia.js v2, TypeScript, Tailwind CSS v4, shadcn/ui (New York style)
- **Testing**: Pest v4 (with browser testing support), PHPUnit v12
- **Tooling**: Vite 7, Laravel Pint v1, ESLint v9, Prettier v3, Laravel Boost MCP
- **Dev Environment**: Laravel Herd (serves at `https://web-skripsi.test`)

---

## Architecture & Data Model

### Domain Model (Key Entities)
The platform centers around **gamified learning** with these core entities:

- **User**: Learners with XP, levels, streaks, points balance, cohort membership
- **Course**: Instructor-created learning content with lessons, difficulty levels, categories
- **Enrollment**: Many-to-many relationship tracking user progress in courses (progress_percentage, status, last_activity)
- **Lesson**: Ordered course content with duration, video URLs, completion tracking
- **Achievement**: Unlockable badges with rarity tiers (bronze/silver/gold/platinum) and XP rewards
- **DailyTask**: User-specific tasks with completion tracking, XP rewards, due dates
- **Activity**: Audit log of user actions (lesson_completed, achievement_earned, level_up, etc.)
- **Reward**: Redeemable items costing points (rarity: common/rare/epic/legendary)
- **TutorMessage**: Direct messaging between users and tutors (instructor role)
- **Cohort**: Group-based learning with leaderboards for competitive engagement

### Key Relationships
- `User` → `hasMany` Enrollments, DailyTasks, Activities, TutorMessages
- `User` → `belongsToMany` Achievements (pivot: earned_at), Rewards (pivot: points_spent, claimed_at)
- `User` → `belongsTo` Cohort
- `Course` → `hasMany` Lessons (ordered), Enrollments
- `Enrollment` → computed `next_lesson` via `User->nextLessonForEnrollment()`

### Data Flow Pattern
Controllers aggregate data via Eloquent relationships → Inertia::render() passes props to React pages → TypeScript interfaces (`resources/js/types/index.d.ts`) enforce type safety → Components consume typed props.

**Example**: `DashboardController` loads user stats, enrollments with nested courses/lessons, achievements, tasks, activities, and cohort leaderboard—all passed as typed props to `dashboard.tsx`.

---

## Laravel 12 Specifics

### Modern Laravel Structure (v11+)
- **No `app/Http/Kernel.php`**: Middleware registered in `bootstrap/app.php` via `withMiddleware()`
- **No `app/Console/Kernel.php`**: Commands auto-register from `app/Console/Commands/`
- **Service providers**: Application-specific providers in `bootstrap/providers.php`
- **Routing**: `bootstrap/app.php` configures web routes (`routes/web.php`, `routes/settings.php`)

### Code Conventions
- **PHP 8 constructor promotion**: `public function __construct(public GitHub $github) {}`
- **Explicit return types**: Always declare return types on methods
- **Casts in methods**: Use `casts()` method on models, not `$casts` property
- **No `env()` outside config files**: Use `config('app.name')` everywhere else
- **Eloquent over raw queries**: Prefer `Model::query()`, avoid `DB::`, eager load to prevent N+1
- **Form Requests for validation**: Always create dedicated request classes (check siblings for array vs string rules)

---

## Frontend Architecture (Inertia + React + TypeScript)

### File Structure
- **Pages**: `resources/js/pages/**/*.tsx` (auto-resolved by Inertia, e.g., `dashboard.tsx` → `dashboard` component)
- **Components**: `resources/js/components/` (UI primitives in `ui/`, domain components in `dashboard/`)
- **Types**: `resources/js/types/index.d.ts` (all domain interfaces)
- **Layouts**: `resources/js/layouts/app-layout/` (AppLayout with sidebar, breadcrumbs)
- **Utilities**: `resources/js/lib/utils.ts` (`cn()` for className merging)
- **Hooks**: `resources/js/hooks/` (e.g., `use-appearance.ts`)

### TypeScript Path Aliases
- `@/*` → `resources/js/*` (configured in `tsconfig.json`, `vite.config.ts`, `components.json`)

### Inertia v2 Features in Use
- **Navigation**: `router.visit()` or `<Link>` component (never traditional `<a>` tags)
- **Forms**: `<Form>` component (preferred) or `useForm()` hook for manual control
- **Deferred props**: Non-critical data (leaderboard, activity feed) loaded after initial render
- **Route helpers**: Laravel Wayfinder generates type-safe route helpers (`dashboard()`, `courses()`, etc.)

### React Patterns
- **React 19**: Using React Compiler (`babel-plugin-react-compiler` in Vite config)
- **Memoization**: `memo()` for expensive components (DashboardStatsSection, CoursesSkeleton, etc.)
- **Error boundaries**: Custom `DashboardErrorBoundary` component wraps sections to isolate failures
- **Loading states**: Skeleton components for all major sections during deferred prop loading
- **Accessibility**: Semantic HTML, ARIA labels (`aria-label`, `aria-labelledby`, `role="list"`), keyboard nav support

---

## Component System (shadcn/ui)

### Configuration
- **Style**: "new-york" (from `components.json`)
- **Base color**: neutral
- **Icon library**: lucide-react
- **CSS Variables**: Enabled for theming (supports dark mode via `dark:` prefix)

### Custom Dashboard Components (`resources/js/components/dashboard/`)
These domain-specific components follow shadcn patterns:

1. **StatCard**: KPI display with icon, label, value, optional trend indicator
2. **CourseCard**: Course thumbnail, progress ring, last activity, resume CTA
3. **ProgressRing**: SVG-based circular progress with center label
4. **StreakIndicator**: Flame icon with animated glow for active streaks
5. **TodayTaskList**: Checkbox-based task list with overall progress bar
6. **AchievementBadge**: Rarity-based styling with confetti animation on unlock
7. **RecentActivityFeed**: Timeline-style list with icons and relative timestamps
8. **TutorChatWidget**: Compact message list with unread badge and quick reply
9. **MiniChart**: Wrapper around recharts (area/bar/sparkline)
10. **LevelProgressBar**: Linear progress bar with level badge and XP display
11. **CohortLeaderboard**: Top 10 list with rank badges and current user highlight

**Key Pattern**: All dashboard components accept typed props from `resources/js/types/index.d.ts`.

---

## Tailwind CSS v4 Specifics

### Import Syntax (CRITICAL)
```css
/* resources/css/app.css */
@import "tailwindcss"; /* NOT @tailwind base/components/utilities */
```

### Deprecated Utilities Replaced
- `bg-opacity-*` → `bg-black/*`
- `flex-shrink-*` → `shrink-*`
- `overflow-ellipsis` → `text-ellipsis`

### Spacing Convention
Use `gap-*` utilities for spacing in flex/grid layouts—**never margins** between list items.

```tsx
// ✅ Correct
<div className="flex gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ❌ Avoid
<div className="flex">
  <div className="mr-4">Item 1</div>
  <div>Item 2</div>
</div>
```

### Dark Mode
All existing pages/components support dark mode via `dark:` prefix. New components must follow this pattern.

---

## Testing with Pest v4

### Test Structure
- **Feature tests**: `tests/Feature/` (most tests should be feature tests)
- **Unit tests**: `tests/Unit/`
- **Browser tests**: `tests/Browser/` (Pest v4 supports real browser testing)

### Conventions from `DashboardTest.php`
```php
// ✅ Use specific assertions
$response->assertSuccessful(); // not assertStatus(200)
$response->assertForbidden(); // not assertStatus(403)

// ✅ Inertia assertions with AssertableInertia
->assertInertia(fn (Assert $page) => $page
    ->component('dashboard')
    ->has('stats')
    ->where('stats.level', 8)
)

// ✅ Always use factories for test data
$user = User::factory()->create(['total_xp' => 2500]);
$enrollment = Enrollment::factory()->create(['status' => 'active']);

// ✅ Use RefreshDatabase trait (enabled in Pest.php)
```

### Running Tests
- All tests: `php artisan test`
- Single file: `php artisan test tests/Feature/DashboardTest.php`
- Filter by name: `php artisan test --filter=testName`

**CRITICAL**: Always run affected tests after code changes. Every change must be programmatically tested.

---

## Development Workflow

### Commands
```bash
# Start all dev services (server, queue, vite)
composer run dev

# Build frontend assets![1761934159200](image/AGENTS/1761934159200.png)
npm run build

# Format code
vendor/bin/pint        # PHP (Laravel Pint)
npm run format         # TypeScript/React (Prettier)

# Type checking
npm run types          # TypeScript validation

# Testing
php artisan test
php artisan test --filter=dashboard
```

### Creating New Features
1. **Models/Migrations**: `php artisan make:model Course -mfs` (model, migration, factory, seeder)
2. **Controllers**: `php artisan make:controller CourseController`
3. **Form Requests**: `php artisan make:request StoreCourseRequest`
4. **Tests**: `php artisan make:test --pest CourseTest`
5. **Frontend Components**: Follow shadcn patterns, add TypeScript interfaces to `types/index.d.ts`

### Laravel Wayfinder
Type-safe route generation configured in `vite.config.ts`:
```ts
wayfinder({ formVariants: true })
```

Usage in React:
```tsx
import { dashboard, courses } from '@/routes';

<Link href={dashboard().url}>Dashboard</Link>
<Link href={courses({ filter: 'active' }).url}>Courses</Link>
```

---

## Laravel Boost MCP Tools (Critical)

The project uses Laravel Boost MCP server for enhanced tooling. **Always use these tools** when available:

- **`search-docs`**: Search version-specific Laravel ecosystem docs (Laravel, Inertia, Pest, Tailwind, etc.)
  - Pass multiple queries: `['authentication', 'middleware']`
  - Filter by packages: `packages: ['laravel/framework']`
  - DO NOT add package names to queries (already included)

- **`tinker`**: Execute PHP in Laravel context for debugging (prefer over manual scripts)
- **`database-query`**: Read-only SQL queries (faster than tinker for simple data checks)
- **`browser-logs`**: Read recent browser console logs/errors
- **`list-artisan-commands`**: Double-check artisan command parameters before running
- **`get-absolute-url`**: Generate correct URLs for Laravel Herd (https://web-skripsi.test)

**Search-docs syntax examples**:
```
queries: ["rate limiting", "routing"]  // Multiple queries, broad topics
queries: ["form validation"]           // Simple, no package names
```

---

## Key Gotchas & Project-Specific Patterns

### User Helper Methods (app/Models/User.php)
The User model includes **custom dashboard helpers**—use these instead of duplicating logic:

- `currentStreak()`: Returns int (current_streak field)
- `xpThisWeek()`: Calculates XP from activities this week
- `hoursThisWeek()`: Sums completed task minutes / 60
- `nextAchievementMilestone()`: Finds closest unearned achievement
- `weeklyActivityChartData()`: Returns array for MiniChart component
- `cohortRank()`: User's position in cohort leaderboard
- `nextLessonForEnrollment($enrollment)`: Finds next incomplete lesson

### Enrollment Data Shaping (DashboardController)
Enrollments require **computed `next_lesson`** via `map()`:
```php
$enrolledCourses = $user->enrollments()
    ->with(['course.lessons', 'course.instructor'])
    ->get()
    ->map(function ($enrollment) use ($user) {
        $data = $enrollment->toArray();
        $data['next_lesson'] = $user->nextLessonForEnrollment($enrollment)?->toArray();
        $data['progress_percentage'] = (float) ($enrollment->progress_percentage ?? 0);
        return $data;
    });
```

### Achievement Pivot Ambiguity
When querying user achievements, **order by pivot table**:
```php
$user->achievements()
    ->orderByDesc('achievement_user.earned_at') // Specify pivot table
    ->get();
```

### Middleware Registration (bootstrap/app.php)
Custom middleware in `web` stack:
```php
$middleware->web(append: [
    HandleAppearance::class,
    HandleInertiaRequests::class,
    AddLinkHeadersForPreloadedAssets::class,
]);
```

### Dashboard Loading Pattern
Dashboard uses **deferred loading with skeletons**:
- Initial render: Show skeleton components (`StatsSkeleton`, `CoursesSkeleton`, etc.)
- 250ms delay via `useEffect` to prevent flash on fast connections
- Error boundaries isolate section failures

---

## File Organization Best Practices

### When to Create New Files
- **Models**: Place in `app/Models/`, always include relationships
- **Controllers**: `app/Http/Controllers/`, use resource controllers for CRUD
- **Form Requests**: `app/Http/Requests/`, check sibling files for validation style
- **React Pages**: `resources/js/pages/`, follow kebab-case naming (e.g., `course-detail.tsx`)
- **Components**: Reusable UI in `resources/js/components/ui/`, domain logic in `dashboard/`

### Type Definitions
Add all new domain types to `resources/js/types/index.d.ts`. Follow existing patterns:
- **Interfaces** for data models (User, Course, Achievement, etc.)
- **Type unions** for enums (`'active' | 'completed' | 'paused'`)
- **Optional fields** with `?` suffix (`avatar?: string`)

---

## Common Patterns to Follow

### Controller → Inertia → React Flow
```php
// Controller
return Inertia::render('dashboard', [
    'stats' => ['level' => $user->level],
]);

// TypeScript interface (types/index.d.ts)
export interface LearningStats {
    level: number;
}

// React page (pages/dashboard.tsx)
export default function Dashboard({ stats }: { stats: LearningStats }) {
    return <div>Level {stats.level}</div>;
}
```

### Relationship Eager Loading
```php
// ✅ Prevent N+1 queries
$user->enrollments()->with(['course.lessons', 'course.instructor'])->get();

// ✅ Limit eagerly loaded records (Laravel 11+)
$enrollment->course->lessons()->latest()->limit(10);
```

### Scopes for Reusable Queries
```php
// In model
public function activeEnrollments(): HasMany
{
    return $this->enrollments()->where('status', 'active');
}

// Usage
$user->activeEnrollments()->count();
```

---

## Documentation

See `DASHBOARD_PLAN.md` for the comprehensive dashboard feature spec (all sections, interactions, data UX).

For questions about Laravel, Inertia, Tailwind, or Pest features, **always use the `search-docs` tool first** to get version-specific guidance.

---

## Quick Reference

### Project URLs
- Local dev: `https://web-skripsi.test` (via Laravel Herd)
- Always use `get-absolute-url` tool for generating URLs

### Key Directories
- **Models & Business Logic**: `app/Models/`
- **Controllers**: `app/Http/Controllers/`
- **React Pages**: `resources/js/pages/`
- **Components**: `resources/js/components/`
- **Types**: `resources/js/types/index.d.ts`
- **Tests**: `tests/Feature/`, `tests/Unit/`
- **Migrations**: `database/migrations/`
- **Factories**: `database/factories/`

### Critical Files
- **App config**: `bootstrap/app.php` (middleware, routing)
- **Vite config**: `vite.config.ts` (plugins, React Compiler)
- **Inertia entrypoint**: `resources/js/app.tsx`
- **Main layout**: `resources/js/layouts/app-layout/`
- **Routes**: `routes/web.php`, `routes/settings.php`
- **Dashboard logic**: `app/Http/Controllers/DashboardController.php`

### Common Tasks
- **New model**: `php artisan make:model Course -mfs --pest`
- **New controller**: `php artisan make:controller CourseController`
- **New test**: `php artisan make:test --pest CourseTest`
- **Format PHP**: `vendor/bin/pint --dirty`
- **Format JS/TS**: `npm run format`
- **Type check**: `npm run types`
- **Run tests**: `php artisan test --filter=dashboard`