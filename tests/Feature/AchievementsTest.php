<?php

use App\Models\Achievement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication', function () {
    $response = $this->get(route('achievements'));
    $response->assertRedirect(route('login'));
});

it('renders achievements index page', function () {
    $user = User::factory()->create();
    Achievement::factory()->count(5)->create();

    $response = $this->actingAs($user)->get(route('achievements'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('achievements/index')
        ->has('achievements', 5)
        ->has('summary')
    );
});

it('shows earned achievements with earned_at date', function () {
    $user = User::factory()->create();
    $achievement = Achievement::factory()->create();
    $user->achievements()->attach($achievement->id, ['earned_at' => now()]);

    $response = $this->actingAs($user)->get(route('achievements'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('achievements.0.earned', true)
        ->has('achievements.0.earned_at')
    );
});

it('shows summary statistics', function () {
    $user = User::factory()->create();
    Achievement::factory()->count(10)->create();
    $earned = Achievement::factory()->create();
    $user->achievements()->attach($earned->id, ['earned_at' => now()]);

    $response = $this->actingAs($user)->get(route('achievements'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('summary.total', 11)
        ->where('summary.earned', 1)
    );
});
