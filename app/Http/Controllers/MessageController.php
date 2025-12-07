<?php

namespace App\Http\Controllers;

use App\Http\Requests\SendMessageRequest;
use App\Models\Enrollment;
use App\Models\TutorMessage;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');
        $partnerId = $request->query('partner');
        $tutorId = $request->query('tutor_id');
        $studentId = $request->query('student_id');

        $threads = $isAdmin
            ? $this->threadsForAdmin()
            : $this->threadsForParticipant($user);

        $activeThread = $isAdmin
            ? $this->activeThreadForAdmin($tutorId, $studentId)
            : ($partnerId ? $this->activeThreadForParticipant($user, (int) $partnerId) : null);

        return Inertia::render('messages/index', [
            'threads' => $threads,
            'activeThread' => $activeThread,
            'isAdmin' => $isAdmin,
            'currentUserId' => $user->id,
            'contacts' => $isAdmin ? [] : $this->contactsForParticipant($user),
        ]);
    }

    public function poll(Request $request): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');
        $partnerId = $request->query('partner');
        $tutorId = $request->query('tutor_id');
        $studentId = $request->query('student_id');

        $threads = $isAdmin
            ? $this->threadsForAdmin()
            : $this->threadsForParticipant($user);

        $activeThread = $isAdmin
            ? $this->activeThreadForAdmin($tutorId, $studentId)
            : ($partnerId ? $this->activeThreadForParticipant($user, (int) $partnerId) : null);

        return response()->json([
            'threads' => $threads,
            'activeThread' => $activeThread,
            'contacts' => $isAdmin ? [] : $this->contactsForParticipant($user),
        ]);
    }

    public function store(SendMessageRequest $request): RedirectResponse
    {
        $user = $request->user();
        $partnerId = $request->input('partner_id');

        if ($user->hasRole('admin')) {
            abort(403, 'Admins cannot send messages.');
        }

        $partner = User::findOrFail($partnerId);
        $this->ensureParticipantsAreTutorAndStudent($user, $partner);

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
            $userRole = $this->roleForConversation($user);
            $partnerRole = $this->roleForConversation($partner);

            if ($userRole === 'tutor' && $partnerRole === 'student') {
                $tutorId = $user->id;
                $userId = $partnerId;
            } elseif ($userRole === 'student' && $partnerRole === 'tutor') {
                $tutorId = $partnerId;
                $userId = $user->id;
            } else {
                // Triggers when the user is not a tutor or student or when the user is both a tutor and a student
                abort(403, 'Messages are limited to tutor-student conversations.');
            }
        }

        $this->ensureEnrollmentBetween($tutorId, $userId);

        TutorMessage::create([
            'tutor_id' => $tutorId,
            'user_id' => $userId,
            'content' => $request->input('content'),
            'sent_at' => now(),
            'is_read' => false,
        ]);

        return back()->with('message', 'Message sent!');
    }

    private function threadsForParticipant(User $user): Collection
    {
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
            ->get();

        $partners = User::whereIn('id', $threads->pluck('partner_id'))->get()->keyBy('id');

        return $threads->map(function ($thread) use ($partners) {
            $partner = $partners->get($thread->partner_id);

            return [
                'partner' => [
                    'id' => $partner?->id,
                    'name' => $partner?->name,
                    'avatar' => $partner?->avatar,
                ],
                'latest_message_at' => $thread->latest_message_at,
                'unread_count' => (int) $thread->unread_count,
            ];
        })->filter(fn ($thread) => ! empty($thread['partner']['id']))->values();
    }

    private function threadsForAdmin(): Collection
    {
        $threads = TutorMessage::query()
            ->select('tutor_id', 'user_id')
            ->selectRaw('MAX(sent_at) as latest_message_at')
            ->selectRaw('SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread_count')
            ->groupBy('tutor_id', 'user_id')
            ->orderByDesc('latest_message_at')
            ->get();

        $userIds = $threads->pluck('tutor_id')->merge($threads->pluck('user_id'))->unique();
        $users = User::whereIn('id', $userIds)->get()->keyBy('id');

        return $threads->map(function ($thread) use ($users) {
            $tutor = $users->get($thread->tutor_id);
            $student = $users->get($thread->user_id);

            return [
                'id' => "{$thread->tutor_id}-{$thread->user_id}",
                'tutor' => [
                    'id' => $tutor?->id,
                    'name' => $tutor?->name,
                    'avatar' => $tutor?->avatar,
                ],
                'student' => [
                    'id' => $student?->id,
                    'name' => $student?->name,
                    'avatar' => $student?->avatar,
                ],
                'latest_message_at' => $thread->latest_message_at,
                'unread_count' => (int) $thread->unread_count,
            ];
        })->filter(fn ($thread) => $thread['tutor']['id'] && $thread['student']['id'])->values();
    }

    private function activeThreadForParticipant(User $user, int $partnerId): ?array
    {
        $partner = User::find($partnerId);

        if (! $partner) {
            return null;
        }

        $this->ensureParticipantsAreTutorAndStudent($user, $partner);

        $messages = TutorMessage::where(function ($q) use ($user, $partnerId) {
            $q->where('tutor_id', $user->id)->where('user_id', $partnerId);
        })->orWhere(function ($q) use ($user, $partnerId) {
            $q->where('tutor_id', $partnerId)->where('user_id', $user->id);
        })
            ->orderBy('sent_at')
            ->orderBy('id')
            ->paginate(50);

        TutorMessage::where('user_id', $user->id)
            ->where('tutor_id', $partnerId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return [
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'avatar' => $partner->avatar,
            ],
            'messages' => $messages,
        ];
    }

    private function activeThreadForAdmin(?int $tutorId, ?int $studentId): ?array
    {
        if (! $tutorId || ! $studentId) {
            return null;
        }

        $tutor = User::find($tutorId);
        $student = User::find($studentId);

        if (! $tutor || ! $student) {
            return null;
        }

        $messages = TutorMessage::where('tutor_id', $tutorId)
            ->where('user_id', $studentId)
            ->orderBy('sent_at')
            ->orderBy('id')
            ->paginate(50);

        return [
            'tutor' => [
                'id' => $tutor->id,
                'name' => $tutor->name,
                'avatar' => $tutor->avatar,
            ],
            'student' => [
                'id' => $student->id,
                'name' => $student->name,
                'avatar' => $student->avatar,
            ],
            'messages' => $messages,
        ];
    }

    private function ensureParticipantsAreTutorAndStudent(User $user, User $partner): void
    {
        $userRole = $this->roleForConversation($user);
        $partnerRole = $this->roleForConversation($partner);

        if (! $userRole || ! $partnerRole || $userRole === $partnerRole) {
            abort(403, 'Messages are limited to tutor-student conversations.');
        }
    }

    private function ensureEnrollmentBetween(int $tutorId, int $studentId): void
    {
        $hasEnrollment = Enrollment::where('user_id', $studentId)
            ->whereHas('course', fn ($q) => $q->where('instructor_id', $tutorId))
            ->exists();

        // Fallback to legacy orientation in case historical messages had reversed tutor/student IDs
        $legacyEnrollment = Enrollment::where('user_id', $tutorId)
            ->whereHas('course', fn ($q) => $q->where('instructor_id', $studentId))
            ->exists();

        if (! $hasEnrollment && ! $legacyEnrollment) {
            abort(403, 'You can only message tutors or students within your enrolled courses.');
        }
    }

    private function contactsForParticipant(User $user): Collection
    {
        if ($user->hasRole('student')) {
            $enrollments = Enrollment::with('course.instructor')
                ->where('user_id', $user->id)
                ->get();

            return $enrollments->pluck('course.instructor')
                ->filter()
                ->unique('id')
                ->values()
                ->map(fn (User $tutor) => [
                    'id' => $tutor->id,
                    'name' => $tutor->name,
                    'avatar' => $tutor->avatar,
                    'role' => 'tutor',
                ]);
        }

        if ($user->hasRole('tutor')) {
            $enrollments = Enrollment::with('user')
                ->whereHas('course', fn ($q) => $q->where('instructor_id', $user->id))
                ->get();

            return $enrollments->pluck('user')
                ->filter()
                ->unique('id')
                ->values()
                ->map(fn (User $student) => [
                    'id' => $student->id,
                    'name' => $student->name,
                    'avatar' => $student->avatar,
                    'role' => 'student',
                ]);
        }

        return collect();
    }

    private function roleForConversation(User $user): ?string
    {
        if ($user->hasRole('tutor')) {
            return 'tutor';
        }

        if ($user->hasRole('student')) {
            return 'student';
        }

        return null;
    }
}
