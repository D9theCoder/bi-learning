<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Achievement>
 */
class AchievementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $achievements = [
            ['name' => 'First Steps', 'description' => 'Complete your first lesson', 'icon' => '🎯'],
            ['name' => 'Week Warrior', 'description' => 'Maintain a 7-day streak', 'icon' => '🔥'],
            ['name' => 'Course Completer', 'description' => 'Finish your first course', 'icon' => '🎓'],
            ['name' => 'Fast Learner', 'description' => 'Complete 10 lessons in one day', 'icon' => '⚡'],
            ['name' => 'Knowledge Seeker', 'description' => 'Enroll in 5 different courses', 'icon' => '📚'],
            ['name' => 'Practice Master', 'description' => 'Complete 50 practice exercises', 'icon' => '💪'],
        ];

        $achievement = fake()->randomElement($achievements);

        return [
            'name' => $achievement['name'],
            'description' => $achievement['description'],
            'icon' => $achievement['icon'],
            'rarity' => fake()->randomElement(['bronze', 'silver', 'gold', 'platinum']),
            'criteria' => fake()->sentence(),
            'xp_reward' => fake()->numberBetween(50, 500),
        ];
    }
}
