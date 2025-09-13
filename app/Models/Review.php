<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'fullname',
        'site_id',
        'complaint_id',
        'review_content',
        'rate'
    ];

    public function site() {
        return $this->belongsTo(Site::class);
    }
    
    public function category() {
        return $this->belongsTo(Category::class);
    }

    public function replies() {
        return $this->hasOne(Reply::class);
    }
}
