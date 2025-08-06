<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    protected $fillable = [
        'purok_id',
        'site_name',
        'latitude',
        'longitude',
        'collection_time',
        'status',
        'additional_notes',
    ];
}
