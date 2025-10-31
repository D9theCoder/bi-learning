<?php

use App\Models\TutorMessage;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

it('requires authentication', function () {
    $response = $this->get(route('messages.index'));
    $response->assertRedirect(route('login'));
});

it('renders messages index page', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('messages.index'));

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
        'sender_id' => $partner->id,
        'recipient_id' => $user->id,
        'is_read' => false,
    ]);

    $response = $this->actingAs($user)->get(route('messages.index'));

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
            'body' => 'Hello, tutor!',
        ]);

    $response->assertRedirect();
    expect(TutorMessage::where('sender_id', $user->id)->where('recipient_id', $partner->id)->count())->toBe(1);
});

it('validates message body', function () {
    $user = User::factory()->create();
    $partner = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('messages.store'), [
            'partner_id' => $partner->id,
            'body' => '',
        ]);

    $response->assertSessionHasErrors('body');
});
