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

    protected $appends = ['display_name'];

    public function purok () {
        return $this->belongsTo(Purok::class);
    }

    public function reviews() {
        return $this->hasMany(Review::class);
    }

    public function collections() {
        return $this->hasMany(CollectionQue::class);
    }

    // Accessor to get display name (purok name)
    public function getDisplayNameAttribute()
    {
        if ($this->purok) {
            return $this->purok->purok_name;
        }
        return $this->site_name ?? 'Site';
    }
}
