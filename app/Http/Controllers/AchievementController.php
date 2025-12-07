<?php

namespace App\Http\Controllers;

use App\Models\Achievement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AchievementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Load all achievements
        $allAchievements = Achievement::all();

        // Get user's earned achievements with pivot data
        $earnedAchievements = $user->achievements()
            ->orderByDesc('achievement_user.earned_at')
            ->get()
            ->keyBy('id');

        // Compute earned flags and progress for each achievement
        $achievements = $allAchievements->map(function ($achievement) use ($earnedAchievements) {
            $earned = $earnedAchievements->has($achievement->id);

            return [
                'id' => $achievement->id,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'rarity' => $achievement->rarity,
                'xp_reward' => $achievement->xp_reward,
                'category' => $achievement->category ?? 'General',
                'earned' => $earned,
                'earned_at' => $earned ? $earnedAchievements[$achievement->id]->pivot->earned_at : null,
            ];
        });

        // Get next milestone
        $nextMilestone = $user->nextAchievementMilestone();

        return Inertia::render('achievements/index', [
            'achievements' => $achievements,
            'summary' => [
                'total' => $allAchievements->count(),
                'earned' => $earnedAchievements->count(),
                'nextMilestone' => $nextMilestone ? [
                    'id' => $nextMilestone->id,
                    'name' => $nextMilestone->name,
                    'progress' => 0, // Can be computed based on activity if needed
                ] : null,
            ],
        ]);
    }
}
