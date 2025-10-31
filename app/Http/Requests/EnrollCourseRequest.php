<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnrollCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ensure course exists (already checked by route model binding)
        return $this->route('course') !== null;
    }

    public function rules(): array
    {
        return [];
    }
}
