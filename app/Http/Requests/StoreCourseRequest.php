<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'difficulty' => $this->input('difficulty') === '' ? null : $this->input('difficulty'),
            'duration_minutes' => $this->input('duration_minutes') === '' ? null : $this->input('duration_minutes'),
            'category' => $this->input('category') === '' ? null : $this->input('category'),
            'thumbnail' => $this->input('thumbnail') === '' ? null : $this->input('thumbnail'),
            'instructor_id' => $this->input('instructor_id') === '' ? null : $this->input('instructor_id'),
        ]);
    }

    public function authorize(): bool
    {
        $user = $this->user();

        return $user?->hasAnyRole(['admin', 'tutor']) ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'duration_minutes' => ['nullable', 'integer', 'min:1'],
            'difficulty' => ['nullable', 'in:beginner,intermediate,advanced'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_published' => ['sometimes', 'boolean'],
            'instructor_id' => ['nullable', 'exists:users,id'],
        ];
    }
}
