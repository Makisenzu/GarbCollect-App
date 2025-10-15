<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'fullname',
        'purok_id',
        'category_id',
        'review_content',
        'suggestion_content',
        'rate',
        'status',
        'moderation_flags'
    ];

    public function purok() {
        return $this->belongsTo(Purok::class);
    }
    
    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function replies() {
        return $this->hasOne(Reply::class);
    }
}
