<?php

use App\Models\Reward;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication', function () {
    $response = $this->get(route('rewards'));
    $response->assertRedirect(route('login'));
});

it('renders rewards index page', function () {
    $user = User::factory()->create();
    Reward::factory()->count(5)->create(['is_active' => true]);

    $response = $this->actingAs($user)->get(route('rewards'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('rewards/index')
        ->has('rewards.data', 5)
        ->has('user.points_balance')
    );
});

it('shows can_redeem flag based on user points', function () {
    $user = User::factory()->create(['points_balance' => 100]);
    Reward::factory()->create(['cost' => 50, 'is_active' => true]);
    Reward::factory()->create(['cost' => 150, 'is_active' => true]);

    $response = $this->actingAs($user)->get(route('rewards'));

    $response->assertInertia(fn (Assert $page) => $page
        ->where('rewards.data.0.can_redeem', true)
        ->where('rewards.data.1.can_redeem', false)
    );
});

it('redeems a reward successfully', function () {
    $user = User::factory()->create(['points_balance' => 100]);
    $reward = Reward::factory()->create(['cost' => 50, 'is_active' => true]);

    $response = $this->actingAs($user)
        ->post(route('rewards.redeem', $reward));

    $response->assertRedirect();
    expect($user->fresh()->points_balance)->toBe(50);
    expect($user->rewards()->where('reward_id', $reward->id)->exists())->toBeTrue();
});

it('prevents redemption with insufficient points', function () {
    $user = User::factory()->create(['points_balance' => 10]);
    $reward = Reward::factory()->create(['cost' => 50, 'is_active' => true]);

    $response = $this->actingAs($user)
        ->post(route('rewards.redeem', $reward));

    $response->assertStatus(422);
});
