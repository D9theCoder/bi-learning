<?php

namespace Database\Factories;

use App\Models\Assessment;
use App\Models\AssessmentQuestion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AssessmentQuestion>
 */
class AssessmentQuestionFactory extends Factory
{
    protected $model = AssessmentQuestion::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'assessment_id' => Assessment::factory(),
            'type' => 'multiple_choice',
            'question' => fake()->sentence().'?',
            'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_answer' => 'Option A',
            'points' => fake()->numberBetween(5, 20),
            'order' => 1,
        ];
    }

    public function multipleChoice(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'multiple_choice',
            'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
            'correct_answer' => 'Option A',
        ]);
    }

    public function fillBlank(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'fill_blank',
            'options' => null,
            'correct_answer' => fake()->word(),
        ]);
    }

    public function essay(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'essay',
            'options' => null,
            'correct_answer' => null,
        ]);
    }
}
