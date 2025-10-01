<?php

namespace App\Events;

use App\Models\Driver;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class DriverLocation implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $driver;
    public $latitude;
    public $longitude;
    public $scheduleId;

    /**
     * Create a new event instance.
     */
    public function __construct(Driver $driver, $latitude, $longitude, $scheduleId = null)
    {
        $this->driver = $driver;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->scheduleId = $scheduleId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('public-driver-locations'),
            new PrivateChannel('driver.' . $this->driver->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'location.updated';
    }

    public function broadcastWith(): array
    {
        $this->driver->load('user');

        return [
            'driver' => [
                'id' => $this->driver->id,
                'name' => $this->driver->user->name,
                'license_number' => $this->driver->license_number,
                'status' => $this->driver->status,
            ],
            'location' => [
                'latitude' => $this->latitude,
                'longitude' => $this->longitude,
                'timestamp' => now()->toISOString(),
            ],
            'schedule_id' => $this->scheduleId,
        ];
    }
}