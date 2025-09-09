<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $fillable = [
        'driver_id',
        'category_id',
        'sack_count'
    ];

    public function driver () {
        return $this->belongsTo(Driver::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}
