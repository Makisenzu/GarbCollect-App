<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Municipality extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'province_id',
        'psgc_code',
        'municipality_name',
        'type',
        'is_capital'
    ];

    public function baranggays() {
        return $this->hasMany(Baranggay::class);
    }
    
    public function province() {
        return $this->belongsTo(Province::class);
    }
}
