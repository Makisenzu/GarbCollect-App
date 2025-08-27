<?php

namespace App\Models;
use App\Models\Driver;
use App\Models\User;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'barangay_id',
        'driver_id',
        'collection_date',
        'collection_time',
        'status',
        'notes'
    ];

    public function driver() {
        return $this->belongsTo(Driver::class, 'driver_id');
    }

    public function barangay() {
        return $this->belongsTo(Baranggay::class);
    }
}
