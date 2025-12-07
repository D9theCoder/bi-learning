<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        if (! $user) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return false;
        }

        return $user->hasAnyRole(['tutor', 'student']);
    }

    public function rules(): array
    {
        return [
            'partner_id' => ['required', 'exists:users,id'],
            'content' => ['required', 'string', 'min:1', 'max:2000'],
        ];
    }
}
