<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocation implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $driverId;
    public $driverName;
    public $latitude;
    public $longitude;
    public $accuracy;
    public $scheduleId;
    public $barangayId;
    public $timestamp;

    public function __construct($driverId, $latitude, $longitude, $accuracy, $scheduleId, $barangayId)
    {
        $this->driverId = $driverId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->accuracy = $accuracy;
        $this->scheduleId = $scheduleId;
        $this->barangayId = $barangayId;
        $this->timestamp = now()->toISOString();
    }

    public function broadcastOn()
    {
        return [
            new Channel('driver-locations'),
            new Channel('driver-locations.' . $this->barangayId),
        ];
    }

    public function broadcastAs()
    {
        return 'DriverLocationUpdated';
    }
}