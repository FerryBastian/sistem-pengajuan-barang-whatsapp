<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'workshop_id',
        'division_id',
        'title',
        'quantity',
        'unit',
        'spesifikasi',
        'kegunaan',
        'content',
        'urgency',
        'pic',
        'nomor_telepon',
        'referensi_link',
        'referensi_gambar',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function workshop()
    {
        return $this->belongsTo(Workshop::class)->withTrashed();
    }

    public function division()
    {
        return $this->belongsTo(Division::class)->withTrashed();
    }
}