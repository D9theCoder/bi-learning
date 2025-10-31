<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Get date range (current month ± 1 week buffer)
        $start = now()->startOfMonth()->subWeek();
        $end = now()->endOfMonth()->addWeek();

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
                ];
            })->values();
        });

        // Compute stats
        $completedCount = $tasks->where('is_completed', true)->count();
        $overdueCount = $tasks->filter(function ($task) {
            return ! $task->is_completed && $task->due_date->isPast();
        })->count();

        return Inertia::render('calendar/index', [
            'tasksByDate' => $tasksByDate,
            'stats' => [
                'total' => $tasks->count(),
                'completed' => $completedCount,
                'overdue' => $overdueCount,
            ],
            'cursor' => [
                'start' => $start->format('Y-m-d'),
                'end' => $end->format('Y-m-d'),
            ],
        ]);
    }
}
