<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SiteCompletionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $siteId;
    public $scheduleId;
    public $barangayId;
    public $status;
    public $completedAt;
    public $siteName;
    public $latitude;
    public $longitude;

    /**
     * Create a new event instance.
     */
    public function __construct($siteId, $scheduleId, $barangayId, $status, $completedAt, $siteName, $latitude, $longitude)
    {
        $this->siteId = $siteId;
        $this->scheduleId = $scheduleId;
        $this->barangayId = $barangayId;
        $this->status = $status;
        $this->completedAt = $completedAt;
        $this->siteName = $siteName;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('site-completion.' . $this->barangayId),
            new Channel('site-completion-schedule.' . $this->scheduleId),
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'SiteCompletionUpdated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'site_id' => $this->siteId,
            'schedule_id' => $this->scheduleId,
            'barangay_id' => $this->barangayId,
            'status' => $this->status,
            'completed_at' => $this->completedAt,
            'site_name' => $this->siteName,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
