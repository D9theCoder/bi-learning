<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
use App\Models\Course;
use App\Models\TutorMessage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $partnerId = $request->query('partner');

        // Build thread list (distinct partner users with latest message)
        $threads = DB::table('tutor_messages')
            ->select(
                DB::raw('CASE WHEN tutor_id = ? THEN user_id ELSE tutor_id END as partner_id'),
                DB::raw('MAX(sent_at) as latest_message_at'),
                DB::raw('SUM(CASE WHEN user_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count')
            )
            ->setBindings([$user->id, $user->id])
            ->where(function ($q) use ($user) {
                $q->where('tutor_id', $user->id)
                    ->orWhere('user_id', $user->id);
            })
            ->groupBy('partner_id')
            ->orderByDesc('latest_message_at')
            ->get()
            ->map(function ($thread) {
                $partner = User::find($thread->partner_id);

                return [
                    'partner' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'avatar' => $partner->avatar,
                    ],
                    'latest_message_at' => $thread->latest_message_at,
                    'unread_count' => $thread->unread_count,
                ];
            });

        // Load active thread if partner specified
        $activeThread = null;
        if ($partnerId) {
            $partner = User::find($partnerId);
            $messages = TutorMessage::where(function ($q) use ($user, $partnerId) {
                $q->where('tutor_id', $user->id)->where('user_id', $partnerId);
            })->orWhere(function ($q) use ($user, $partnerId) {
                $q->where('tutor_id', $partnerId)->where('user_id', $user->id);
            })
                ->orderBy('sent_at')
                ->paginate(50);

            // Mark messages as read
            TutorMessage::where('user_id', $user->id)
                ->where('tutor_id', $partnerId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            $activeThread = [
                'partner' => [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'avatar' => $partner->avatar,
                ],
                'messages' => $messages,
            ];
        }

        return Inertia::render('messages/index', [
            'threads' => $threads,
            'activeThread' => $activeThread,
        ]);
    }

    public function store(SendMessageRequest $request): RedirectResponse
    {
        $user = $request->user();
        $partnerId = $request->input('partner_id');

        // Find existing conversation to maintain consistent tutor_id/user_id
        $existingMessage = TutorMessage::where(function ($q) use ($user, $partnerId) {
            $q->where('tutor_id', $user->id)->where('user_id', $partnerId);
        })->orWhere(function ($q) use ($user, $partnerId) {
            $q->where('tutor_id', $partnerId)->where('user_id', $user->id);
        })->first();

        if ($existingMessage) {
            // Use existing conversation's tutor_id/user_id convention
            $tutorId = $existingMessage->tutor_id;
            $userId = $existingMessage->user_id;
        } else {
            // For new conversations, check who is instructor
            $userIsInstructor = Course::where('instructor_id', $user->id)->exists();
            $partnerIsInstructor = Course::where('instructor_id', $partnerId)->exists();

            if ($userIsInstructor && !$partnerIsInstructor) {
                $tutorId = $user->id;
                $userId = $partnerId;
            } elseif ($partnerIsInstructor && !$userIsInstructor) {
                $tutorId = $partnerId;
                $userId = $user->id;
            } else {
                // Default: current user is tutor
                $tutorId = $user->id;
                $userId = $partnerId;
            }
        }

        TutorMessage::create([
            'tutor_id' => $tutorId,
            'user_id' => $userId,
            'content' => $request->input('content'),
            'sent_at' => now(),
            'is_read' => false,
        ]);

        return back()->with('message', 'Message sent!');
    }
}
