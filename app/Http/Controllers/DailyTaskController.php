<?php

namespace App\Http\Controllers;

use App\Http\Requests\ToggleTaskCompletionRequest;
use App\Models\Activity;
use App\Models\DailyTask;
use Illuminate\Http\RedirectResponse;

class DailyTaskController extends Controller
{
    public function toggleComplete(ToggleTaskCompletionRequest $request, DailyTask $task): RedirectResponse
    {
        $user = $request->user();

        // Update completion status
        $task->is_completed = $request->boolean('completed');
        $task->completed_at = $request->boolean('completed') ? now() : null;
        $task->save();

        // Log XP activity if task completed
        if ($task->is_completed && $task->xp_reward > 0) {
            Activity::create([
                'user_id' => $user->id,
                'type' => 'task_completed',
                'description' => "Completed task: {$task->title}",
                'xp_earned' => $task->xp_reward,
            ]);

            // Update user XP
            $user->increment('total_xp', $task->xp_reward);
        }

        return back();
    }
}
