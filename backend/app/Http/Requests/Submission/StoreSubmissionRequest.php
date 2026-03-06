<?php

namespace App\Http\Requests\Submission;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'      => 'required|string|max:255',
            'content'    => 'required|string',
            'department' => 'nullable|string|max:100',
            'quantity'   => 'required|integer|min:1',
            'unit'       => 'nullable|string|max:20',
            'urgency'    => 'nullable|in:normal,high,urgent',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'    => 'Nama barang wajib diisi.',
            'content.required'  => 'Keterangan wajib diisi.',
            'quantity.required' => 'Jumlah wajib diisi.',
            'quantity.min'      => 'Jumlah minimal 1.',
        ];
    }
}