<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Truck extends Model
{
    protected $fillable = [
       'truck_model',
       'truck_plateNumber',
       'is_available' 
    ];
}
