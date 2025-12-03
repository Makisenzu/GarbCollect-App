<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'schedule_id',
        'garbage_id',
        'report_picture',
        'kilograms',
        'additional_notes'
    ];

    protected $casts = [
        'report_picture' => 'array',
    ];

    public function garbage () {
        return $this->belongsTo(Garbage::class);
    }

    public function schedule () {
        return $this->belongsTo(Schedule::class);
    }
}
