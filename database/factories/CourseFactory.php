<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titles = [
            'Introduction to Python Programming',
            'Advanced JavaScript Techniques',
            'Data Science Fundamentals',
            'Machine Learning Basics',
            'Web Development with React',
            'Database Design and SQL',
            'Mobile App Development',
            'Cloud Computing Essentials',
            'Cybersecurity Fundamentals',
            'AI and Deep Learning',
        ];

        return [
            'title' => fake()->randomElement($titles),
            'description' => fake()->paragraphs(3, true),
            'thumbnail' => 'https://picsum.photos/seed/'.fake()->uuid().'/800/600',
            'instructor_id' => User::factory(),
            'duration_minutes' => fake()->numberBetween(300, 3000),
            'difficulty' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'category' => fake()->randomElement(['Programming', 'Data Science', 'Web Development', 'Mobile', 'Cloud', 'Security']),
            'is_published' => fake()->boolean(80),
        ];
    }
}
