<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
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
                DB::raw('CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END as partner_id'),
                DB::raw('MAX(sent_at) as latest_message_at'),
                DB::raw('SUM(CASE WHEN recipient_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count')
            )
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                    ->orWhere('recipient_id', $user->id);
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
                $q->where('sender_id', $user->id)->where('recipient_id', $partnerId);
            })->orWhere(function ($q) use ($user, $partnerId) {
                $q->where('sender_id', $partnerId)->where('recipient_id', $user->id);
            })
                ->orderBy('sent_at')
                ->paginate(50);

            // Mark messages as read
            TutorMessage::where('recipient_id', $user->id)
                ->where('sender_id', $partnerId)
                ->where('is_read', false)
                ->update(['is_read' => true, 'read_at' => now()]);

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

        TutorMessage::create([
            'sender_id' => $user->id,
            'recipient_id' => $request->input('partner_id'),
            'body' => $request->input('body'),
            'sent_at' => now(),
            'is_read' => false,
        ]);

        return back()->with('message', 'Message sent!');
    }
}
