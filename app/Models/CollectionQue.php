<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionQue extends Model
{
    protected $fillable = [
        'schedule_id',
        'site_id',
        'status',
    ];

    protected $casts = [
        'completed_at' => 'datetime'
    ];

    public function schedule() {
        return $this->belongsTo(Schedule::class);
    }

    public function site() {
        return $this->belongsTo(Site::class);
    }

    // Helper method to mark as finished
    public function markAsFinished()
    {
        $this->update([
            'status' => 'finished',
            'completed_at' => now()
        ]);
    }

    // Helper method to check if all sites are completed
    public static function allSitesCompleted($scheduleId)
    {
        $totalSites = self::where('schedule_id', $scheduleId)->count();
        $completedSites = self::where('schedule_id', $scheduleId)
                            ->where('status', 'finished')
                            ->count();
        
        return $totalSites > 0 && $totalSites === $completedSites;
    }
}