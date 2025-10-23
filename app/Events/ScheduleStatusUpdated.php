<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $schedule;
    public $barangayId;
    public $action;

    public function __construct($schedule, $barangayId, $action = 'updated')
    {
        $this->schedule = $schedule;
        $this->barangayId = $barangayId;
        $this->action = $action;
    }

    public function broadcastOn()
    {
        $channels = [new Channel('schedule-updates')];
        
        if ($this->barangayId) {
            $channels[] = new Channel('schedule-updates.' . $this->barangayId);
        }
        
        return $channels;
    }

    public function broadcastAs()
    {
        return 'ScheduleStatusUpdated';
    }
}