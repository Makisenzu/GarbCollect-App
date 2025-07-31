<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserComplaints extends Model
{
    protected $fillable = [
        'users_id',
        'complaints_id',
        'complaint_details'
    ];
}
