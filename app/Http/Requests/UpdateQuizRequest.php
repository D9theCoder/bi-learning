<?php

namespace App\Http\Requests;

use App\Models\Assessment;
use App\Models\Course;
use Illuminate\Foundation\Http\FormRequest;

class UpdateQuizRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'lesson_id' => $this->input('lesson_id') === '' ? null : $this->input('lesson_id'),
            'due_date' => $this->input('due_date') === '' ? null : $this->input('due_date'),
            'time_limit_minutes' => $this->input('time_limit_minutes') === '' ? null : $this->input('time_limit_minutes'),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        /** @var Course|null $course */
        $course = $this->route('course');
        /** @var Assessment|null $assessment */
        $assessment = $this->route('assessment');

        if (! $user || ! $course || ! $assessment) {
            return false;
        }

        if ($assessment->course_id !== $course->id) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('tutor') && $course->instructor_id === $user->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'lesson_id' => ['nullable', 'exists:lessons,id'],
            'due_date' => ['nullable', 'date'],
            'max_score' => ['required', 'integer', 'min:1'],
            'allow_retakes' => ['sometimes', 'boolean'],
            'time_limit_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'is_published' => ['sometimes', 'boolean'],
            'powerups' => ['nullable', 'array'],
            'powerups.*.id' => ['required', 'integer', 'exists:powerups,id'],
            'powerups.*.limit' => ['required', 'integer', 'min:1'],
        ];
    }
}
