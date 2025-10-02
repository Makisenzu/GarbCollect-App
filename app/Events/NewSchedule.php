<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Schedule;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class NewSchedule implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $schedule;

    public function __construct(Schedule $schedule)
    {
        $this->schedule = $schedule;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('driver.' . $this->schedule->driver_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new.schedule';
    }

    public function broadcastWith(): array
    {
        return [
            'schedule' => $this->schedule->load(['barangay', 'driver.user']),
            'message' => 'New schedule has been assigned to you!'
        ];
    }
}