<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Garbage extends Model
{
    protected $fillable = [
        'garbage_type'
    ];

    public function reports() {
        return $this->hasMany(Report::class);
    }
}
