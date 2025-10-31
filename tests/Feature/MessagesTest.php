<?php

use App\Models\TutorMessage;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication', function () {
    $response = $this->get(route('messages'));
    $response->assertRedirect(route('login'));
});

it('renders messages index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('messages'));

    $response->assertSuccessful();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('messages/index')
        ->has('threads')
    );
});

it('lists message threads with unread count', function () {
    $user = User::factory()->create();
    $partner = User::factory()->create();
    TutorMessage::factory()->create([
        'tutor_id' => $partner->id,
        'user_id' => $user->id,
        'is_read' => false,
    ]);

    $response = $this->actingAs($user)->get(route('messages'));

    $response->assertInertia(fn (Assert $page) => $page
        ->has('threads', 1)
    );
});

it('sends a message', function () {
    $user = User::factory()->create();
    $partner = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('messages.store'), [
            'partner_id' => $partner->id,
            'content' => 'Hello, tutor!',
        ]);

    $response->assertRedirect();
    // Message should exist with consistent tutor_id/user_id
    expect(TutorMessage::where(function ($q) use ($user, $partner) {
        $q->where('tutor_id', $user->id)->where('user_id', $partner->id);
    })->orWhere(function ($q) use ($user, $partner) {
        $q->where('tutor_id', $partner->id)->where('user_id', $user->id);
    })->count())->toBe(1);
});

it('validates message body', function () {
    $user = User::factory()->create();
    $partner = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('messages.store'), [
            'partner_id' => $partner->id,
            'content' => '',
        ]);

    $response->assertSessionHasErrors('content');
});
