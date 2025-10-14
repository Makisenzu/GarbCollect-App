<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'barangay_id',
        'driver_id',
        'collection_date',
        'collection_time',
        'status',
        'notes'
    ];

    protected $casts = [
        'collection_date' => 'date',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class, 'driver_id')->with('user');
    }

    public function barangay()
    {
        return $this->belongsTo(Baranggay::class);
    }

    public function getCollectionTimeAttribute($value)
    {
        if (strlen($value) > 8) {
            return substr($value, 0, 8);
        }
        return $value;
    }

    public function reports () {
        return $this->hasMany(Report::class);
    }
}