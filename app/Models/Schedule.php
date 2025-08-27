<?php

namespace App\Models;

use Illuminate\Contracts\Concurrency\Driver;
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
        return $this->belongsTo(Driver::class);
    }

    public function barangay() {
        return $this->belongsTo(Baranggay::class);
    }

    public function user()
    {
        return $this->through('driver')->has('user');
    }
    
}
