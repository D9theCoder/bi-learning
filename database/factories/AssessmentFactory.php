<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assessment>
 */
class AssessmentFactory extends Factory
{
    protected $model = Assessment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'lesson_id' => Lesson::factory(),
            'type' => 'quiz',
            'title' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'due_date' => fake()->dateTimeBetween('now', '+2 weeks'),
            'max_score' => 100,
            'allow_retakes' => false,
            'time_limit_minutes' => null,
            'is_published' => false,
            'is_remedial' => false,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_published' => true,
        ]);
    }

    public function withRetakes(): static
    {
        return $this->state(fn (array $attributes) => [
            'allow_retakes' => true,
        ]);
    }

    public function withTimeLimit(int $minutes = 60): static
    {
        return $this->state(fn (array $attributes) => [
            'time_limit_minutes' => $minutes,
        ]);
    }
}
