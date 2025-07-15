<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Baranggay extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'municipality_id',
        'psgc_code',
        'baranggay_name',
        'type',
    ];

    public function puroks() {
        return $this->hasMany(Purok::class);
    }
    
    public function municipality() {
        return $this->belongsTo(Municipality::class);
    }
}
