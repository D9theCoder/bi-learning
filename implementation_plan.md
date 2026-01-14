# Admin-Tutor Private Chat Feature Implementation Plan

This plan introduces a separate, private chat channel between **Admin** and **Tutor** roles, distinct from the existing Tutor-Student messaging system. Students cannot view these conversations, and only Admins can initiate the conversation.

## Current System Overview

The existing messaging system (`TutorMessage` model) supports:

- **Tutor ↔ Student** messaging (bidirectional, enrollment-based)
- **Admin** has read-only access to all Tutor-Student conversations

### Key Constraints for New Feature

1. **Students cannot see** Admin-Tutor conversations
2. **Tutors cannot initiate** conversations with Admins — they can only see/reply after an Admin starts a conversation
3. **Admins can initiate** conversations by selecting a tutor from a list
4. **Separate channel** from Tutor-Student messages to avoid confusion

---

## User Review Required

> [!IMPORTANT] > **Design Decision: Separate Model vs. Reusing `TutorMessage`**
>
> This plan proposes creating a **new `AdminTutorMessage` model/table** rather than reusing `TutorMessage`. This provides:
>
> - Clear separation between the two chat types
> - Simpler queries and authorization logic
> - No risk of students accidentally seeing admin-tutor messages
>
> Alternative: Reuse `TutorMessage` with a `type` column. Let me know if you prefer this approach.

> [!WARNING]  
> **Breaking Change: Admin Message Page Updates**
>
> The Admin's `/messages` page will be significantly modified to show:
>
> - Tab 1: "Tutor-Student Conversations" (existing read-only view)
> - Tab 2: "Admin-Tutor Chat" (new private messaging)
>
> This changes the current UX where admins only see a single conversation list.

---

## Proposed Changes

### Database Layer

#### [NEW] [2025_01_14_create_admin_tutor_messages_table.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/migrations/2025_01_14_create_admin_tutor_messages_table.php>)

New migration to create `admin_tutor_messages` table:

- `id` - Primary key
- `admin_id` - Foreign key to users (admin who initiated/participates)
- `tutor_id` - Foreign key to users (tutor in conversation)
- `sender_id` - Foreign key to users (who sent this message, either admin or tutor)
- `content` - Text of the message
- `is_read` - Boolean for read status
- `sent_at` - Timestamp when message was sent
- Standard timestamps

---

### Model Layer

#### [NEW] [AdminTutorMessage.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Models/AdminTutorMessage.php>)

New Eloquent model for admin-tutor messaging:

- Relationships: `admin()`, `tutor()`, `sender()`
- Scopes: `scopeUnread()`, `scopeForParticipant()`
- Casts for `is_read`, `sent_at`

#### [NEW] [AdminTutorMessageFactory.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/database/factories/AdminTutorMessageFactory.php>)

Factory for testing admin-tutor messages

---

### Controller Layer

#### [NEW] [AdminTutorMessageController.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Controllers/AdminTutorMessageController.php>)

New controller with methods:

- `index(Request $request)` - Display admin-tutor chat page
  - For **Admin**: Show list of all tutors, allow initiating conversations
  - For **Tutor**: Show only conversations where they've been contacted by an admin
- `store(SendAdminTutorMessageRequest $request)` - Send a message
  - Validates admin can initiate OR tutor can reply to existing conversation
- `poll(Request $request)` - Real-time polling for message updates
- `threadsForAdmin()` - Get all admin-tutor conversations for admin
- `threadsForTutor(User $tutor)` - Get admin conversations for a specific tutor
- `activeThread(int $tutorId)` / `activeThreadForTutor(int $adminId)` - Load messages
- `tutorsForAdmin()` - Get list of all tutors for admin to initiate conversation

#### [NEW] [SendAdminTutorMessageRequest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/app/Http/Requests/SendAdminTutorMessageRequest.php>)

Form request with validation:

- `tutor_id` or `admin_id` required (depending on sender role)
- `content` required, string, max length
- Authorization: Admin can always send; Tutor can only send if existing conversation exists

---

### Routes

#### [MODIFY] [web.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/routes/web.php>)

Add new routes for admin-tutor messaging:

```php
Route::middleware(['auth', 'verified'])->group(function () {
    // Admin-Tutor private messaging
    Route::get('admin-messages', [AdminTutorMessageController::class, 'index'])
        ->name('admin-tutor-messages');
    Route::post('admin-messages', [AdminTutorMessageController::class, 'store'])
        ->name('admin-tutor-messages.store');
    Route::get('admin-messages/poll', [AdminTutorMessageController::class, 'poll'])
        ->name('admin-tutor-messages.poll');
});
```

---

### Frontend - Pages

#### [NEW] [resources/js/pages/admin-messages/index.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/pages/admin-messages/index.tsx>)

New page for admin-tutor conversations:

- **Admin View**:
  - Left panel: List of tutors with existing conversations + "New Conversation" section with tutor selector
  - Right panel: Active conversation thread with send capability
- **Tutor View**:
  - Left panel: List of admins who have contacted them (no "New Conversation" section)
  - Right panel: Active conversation thread with send capability (reply only)

---

### Frontend - Components

#### [NEW] [resources/js/components/admin-messages/types.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/admin-messages/types.ts>)

Type definitions:

- `AdminTutorThread` - Thread summary with admin/tutor info
- `AdminTutorMessage` - Individual message type
- `AdminTutorActiveThread` - Active conversation with messages

#### [NEW] [resources/js/components/admin-messages/admin-tutor-thread-list.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/admin-messages/admin-tutor-thread-list.tsx>)

Thread list component showing:

- For Admin: Tutor name, avatar, last message time, unread count
- For Tutor: Admin name, avatar, last message time, unread count

#### [NEW] [resources/js/components/admin-messages/admin-tutor-message-thread.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/admin-messages/admin-tutor-message-thread.tsx>)

Message display and input component:

- Shows conversation history with sender labels
- Text input for composing messages
- Both Admin and Tutor can send (tutor only after admin initiates)

#### [NEW] [resources/js/components/admin-messages/new-admin-tutor-conversation.tsx](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/components/admin-messages/new-admin-tutor-conversation.tsx>)

Admin-only component to start new conversation:

- Dropdown to select a tutor (loads all tutors)
- "Start Conversation" button

---

### Frontend - Hooks

#### [NEW] [resources/js/hooks/use-admin-tutor-message-polling.ts](<file:///home/kevin/Coding%20(WSL)/bi-learning/resources/js/hooks/use-admin-tutor-message-polling.ts>)

Polling hook for real-time updates (similar to existing `use-message-polling.ts`)

---

### Navigation

#### [MODIFY] Sidebar/Navigation Components

Add navigation link for Admin-Tutor messages:

- **For Admin**: Show "Tutor Messages" link in sidebar (or as a tab on messages page)
- **For Tutor**: Show "Admin Messages" link in sidebar when they have active conversations

Specific files to update will be identified during implementation (likely `app-sidebar.tsx` or similar).

---

## Authorization Summary

| Actor   | Can View                      | Can Send                             | Can See Tutor List |
| ------- | ----------------------------- | ------------------------------------ | ------------------ |
| Admin   | All admin-tutor conversations | Yes (can initiate with any tutor)    | Yes                |
| Tutor   | Only their own conversations  | Yes (reply only, after admin starts) | No                 |
| Student | None                          | No                                   | No                 |

---

## Verification Plan

### Automated Tests

#### [NEW] [tests/Feature/AdminTutorMessageTest.php](<file:///home/kevin/Coding%20(WSL)/bi-learning/tests/Feature/AdminTutorMessageTest.php>)

Feature tests covering:

1. Admin can view admin-tutor messages page
2. Admin can see list of all tutors
3. Admin can initiate conversation with a tutor
4. Admin can send messages to tutor
5. Tutor can view admin-tutor messages page (only their conversations)
6. Tutor cannot see list of admins to initiate
7. Tutor can reply to existing admin conversation
8. Tutor cannot initiate new conversation
9. Student cannot access admin-tutor messages page
10. Student cannot see admin-tutor conversations

```bash
php artisan test --filter=AdminTutorMessageTest
```

### Manual Verification

1. Log in as Admin, navigate to Admin Messages
2. Start a new conversation with a tutor
3. Send a message
4. Log in as Tutor in a separate browser
5. Verify the tutor sees the conversation and can reply
6. Verify the tutor CANNOT start a new conversation
7. Log in as Student and verify no access to admin-tutor messages

---

## File Summary

| Type   | File                                                                      | Description                             |
| ------ | ------------------------------------------------------------------------- | --------------------------------------- |
| NEW    | `database/migrations/..._create_admin_tutor_messages_table.php`           | Database table for admin-tutor chat     |
| NEW    | `app/Models/AdminTutorMessage.php`                                        | Eloquent model                          |
| NEW    | `database/factories/AdminTutorMessageFactory.php`                         | Factory for testing                     |
| NEW    | `app/Http/Controllers/AdminTutorMessageController.php`                    | Controller with all endpoints           |
| NEW    | `app/Http/Requests/SendAdminTutorMessageRequest.php`                      | Form request validation                 |
| MODIFY | `routes/web.php`                                                          | Add new routes                          |
| NEW    | `resources/js/pages/admin-messages/index.tsx`                             | Admin-tutor chat page                   |
| NEW    | `resources/js/components/admin-messages/types.ts`                         | TypeScript types                        |
| NEW    | `resources/js/components/admin-messages/admin-tutor-thread-list.tsx`      | Thread list component                   |
| NEW    | `resources/js/components/admin-messages/admin-tutor-message-thread.tsx`   | Message thread component                |
| NEW    | `resources/js/components/admin-messages/new-admin-tutor-conversation.tsx` | New conversation component (admin only) |
| NEW    | `resources/js/hooks/use-admin-tutor-message-polling.ts`                   | Polling hook                            |
| MODIFY | Sidebar/Navigation                                                        | Add navigation links                    |
| NEW    | `tests/Feature/AdminTutorMessageTest.php`                                 | Feature tests                           |
