<?php

namespace App\Http\Requests;

use App\Models\Course;
use App\Models\CourseContent;
use App\Models\Lesson;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCourseContentRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'duration_minutes' => $this->input('duration_minutes') === '' ? null : $this->input('duration_minutes'),
            'order' => $this->input('order') === '' ? null : $this->input('order'),
            'file_path' => $this->input('file_path') === '' ? null : $this->input('file_path'),
            'url' => $this->input('url') === '' ? null : $this->input('url'),
            'description' => $this->input('description') === '' ? null : $this->input('description'),
            'due_date' => $this->input('due_date') === '' ? null : $this->input('due_date'),
            'is_required' => $this->boolean('is_required'),
        ]);
    }

    public function authorize(): bool
    {
        $user = $this->user();
        /** @var Course|null $course */
        $course = $this->route('course');
        /** @var Lesson|null $lesson */
        $lesson = $this->route('lesson');
        /** @var CourseContent|null $content */
        $content = $this->route('content');

        if (! $user || ! $course || ! $lesson || $lesson->course_id !== $course->id) {
            return false;
        }

        if ($content && $content->lesson_id !== $lesson->id) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('tutor') && $course->instructor_id === $user->id;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:file,video,link,quiz,attendance'],
            'file_path' => ['nullable', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'is_required' => ['sometimes', 'boolean'],
            'order' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
