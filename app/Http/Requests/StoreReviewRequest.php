<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'fullname' => 'required|string|max:255',
            'purok_id' => 'required|exists:puroks,id',
            'category_id' => 'required|exists:categories,id',
            'review_content' => 'required|string|min:10|max:2000',
            'suggestion_content' => 'required|string|min:10|max:2000',
            'rate' => 'required|integer|between:1,5',
        ];
    }
}
