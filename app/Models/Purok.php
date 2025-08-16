<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Purok extends Model
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'baranggay_id',
        'purok_name'
    ];

    public function baranggay () {
        return $this->belongsTo(Baranggay::class);
    }

    public function sites () {
        return $this->hasMany(Site::class);
    }
}
