<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportToken extends Model
{
    protected $fillable = [
        'schedule_id',
        'token',
        'expires_at',
        'used'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used' => 'boolean'
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }
}