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
        'type',
        'status',
        'additional_notes',
    ];

    public function purok () {
        return $this->belongsTo(Purok::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }
}
