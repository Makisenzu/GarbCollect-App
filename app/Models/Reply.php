<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reply extends Model
{
    protected $fillable = [
        'review_id',
        'reply_content'
    ];

    public function review(){
        return $this->belongsTo(Review::class);
    }
}
