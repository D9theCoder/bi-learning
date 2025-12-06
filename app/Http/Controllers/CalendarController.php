<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Parse date from query or default to now
        $date = $request->input('date')
            ? Carbon::parse($request->input('date'))
            : now();

        // Get date range for the full calendar view (start of first week to end of last week)
        $start = $date->copy()->startOfMonth()->startOfWeek();
        $end = $date->copy()->endOfMonth()->endOfWeek();

        // Load user tasks in date window
        $tasks = $user->dailyTasks()
            ->whereBetween('due_date', [$start, $end])
            ->orderBy('due_date')
            ->orderBy('is_completed')
            ->get();

        // Group by date
        $tasksByDate = $tasks->groupBy(function ($task) {
            return $task->due_date->format('Y-m-d');
        })->map(function ($dateTasks) {
            return $dateTasks->map(function ($task) {
                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'due_date' => $task->due_date->format('Y-m-d'),
                    'completed' => (bool) $task->is_completed,
                    'xp_reward' => $task->xp_reward,
                    'course_title' => $task->course->title ?? 'General', // Added course title if available
                    'type' => 'task', // basic type for now
                ];
            })->values();
        });

        // Compute stats for the current month context
        $monthTasks = $user->dailyTasks()
            ->whereMonth('due_date', $date->month)
            ->whereYear('due_date', $date->year)
            ->get();

        $completedCount = $monthTasks->where('is_completed', true)->count();
        $overdueCount = $monthTasks->filter(function ($task) {
            return ! $task->is_completed && $task->due_date->isPast();
        })->count();

        return Inertia::render('calendar/index', [
            'tasksByDate' => $tasksByDate,
            'stats' => [
                'total' => $monthTasks->count(),
                'completed' => $completedCount,
                'overdue' => $overdueCount,
            ],
            'currentDate' => $date->format('Y-m-d'),
        ]);
    }
}
