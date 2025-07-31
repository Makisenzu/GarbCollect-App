<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserViolation extends Model
{
    protected $fillable = [
        'users_id',
        'violation_id',
        'additional_penalty',
    ];
}
