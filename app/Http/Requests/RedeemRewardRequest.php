<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RedeemRewardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->route('reward') !== null;
    }

    public function rules(): array
    {
        return [];
    }
}
