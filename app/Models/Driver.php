<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'user_id',
        'license_number',
        'is_active', 
        'current_latitude',
        'current_longitude'
    ];
    

    public function user(){
        return $this->belongsTo(User::class);
    }
    
}
