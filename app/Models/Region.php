<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Region extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'psgc_code',
        'region_name',
        'region_num',
    ];

    public function provinces() {
        return $this->hasMany(Province::class);
    }
    
}
