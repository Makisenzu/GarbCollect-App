<?php

namespace App\Models;

use Illuminate\Contracts\Concurrency\Driver;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'site_id',
        'driver_id',
        'collection_date',
        'collection_time',
        'status',
        'notes'
    ];

    public function driver() {
        return $this->belongsTo(Driver::class);
    }

    public function site() {
        return $this->belongsTo(Site::class);
    }

    public function user()
    {
        return $this->through('driver')->has('user');
    }
    
}
