<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Province extends Model
{
    use HasFactory, Notifiable;
    
    protected $fillable = [
        'region_id',
        'psgc_code',
        'province_name',
        'capital'
    ];
    
    public function municipalities() {
        return $this->hasMany(Municipality::class);
    }
}
