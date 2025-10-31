<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Users can message any other user
        return true;
    }

    public function rules(): array
    {
        return [
            'partner_id' => ['required', 'exists:users,id'],
            'body' => ['required', 'string', 'min:1', 'max:2000'],
        ];
    }
}
