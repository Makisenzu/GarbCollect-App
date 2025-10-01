<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'assigned_barangay',
        'license_number',
        'status', 
        'current_latitude',
        'current_longitude'
    ];

    protected $casts = [
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function barangay() {
        return $this->hasOne(Baranggay::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'driver_id');
    }

    public function activeSchedulesToday()
    {
        return $this->hasMany(Schedule::class, 'driver_id')
            ->where('status', 'progress')
            ->whereDate('collection_date', today());
    }

    public function getShouldBeOndutyAttribute()
    {
        return $this->activeSchedulesToday()->exists();
    }
    public function activeSchedule()
    {
        return $this->hasOne(Schedule::class, 'driver_id')
            ->whereIn('status', ['pending', 'active'])
            ->whereDate('collection_date', today());
    }

    public function scopeOnduty($query)
    {
        return $query->where('status', 'onduty');
    }


    public function currentSchedule()
    {
        return $this->hasOne(Schedule::class, 'driver_id')
            ->where('status', 'active')
            ->whereDate('collection_date', today());
    }

    public function getIsOnlineAttribute()
    {
        return !is_null($this->current_latitude) && !is_null($this->current_longitude);
    }

    public function scopeWithActiveLocation($query)
    {
        return $query->whereNotNull('current_latitude')
                    ->whereNotNull('current_longitude');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWithCurrentSchedule($query)
    {
        return $query->whereHas('schedules', function($q) {
            $q->where('status', 'active')
              ->whereDate('collection_date', today());
        });
    }
}