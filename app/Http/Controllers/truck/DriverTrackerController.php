<?php

namespace App\Http\Controllers\truck;

use App\Models\Site;
use App\Models\Driver;
use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Events\DriverLocation;
use App\Events\SiteCompletionUpdated;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Events\ScheduleStatusUpdated;
use Illuminate\Support\Facades\Cache;

class DriverTrackerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }
    public function updateLocation(Request $request){
        Log::info('Location update request received:', $request->all());
        
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'schedule_id' => 'required',
            'barangay_id' => 'required',
            'accuracy' => 'nullable|numeric|min:0',
        ]);
    
        try {
            $driver = Auth::user();
            
            Log::info('Driver auth result:', ['driver' => $driver ? $driver->id : 'null']);
            
            if (!$driver) {
                Log::error('Driver authentication failed');
                return response()->json([
                    'success' => false,
                    'message' => 'Driver authentication failed'
                ], 401);
            }
    
            $locationData = [
                'driver_id' => $driver->id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'accuracy' => $request->accuracy,
                'schedule_id' => $request->schedule_id,
                'barangay_id' => $request->barangay_id,
                'updated_at' => now()->toISOString(),
            ];
    
            Cache::put("driver_location_{$driver->id}", $locationData, 600);
            Cache::put("driver_location_schedule_{$request->schedule_id}", $locationData, 600);
    
            $activeDrivers = Cache::get('active_drivers', []);
            if (!in_array($driver->id, $activeDrivers)) {
                $activeDrivers[] = $driver->id;
                Cache::put('active_drivers', $activeDrivers, 600);
            }
    
            broadcast(new DriverLocation(
                $driver->id,
                $request->latitude,
                $request->longitude,
                $request->accuracy,
                $request->schedule_id,
                $request->barangay_id
            ));
    
            Log::info('Location update successful for driver: ' . $driver->id);
    
            return response()->json([
                'success' => true,
                'message' => 'Location updated and broadcasted successfully',
                'data' => $locationData
            ]);
    
        } catch (\Exception $e) {
            Log::error('Location update failed: ' . $e->getMessage());
            Log::error('Exception trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update location: ' . $e->getMessage()
            ], 500);
        }
    }

    public function startSchedule(Request $request){
        $request->validate([
            'schedule_id' => 'required',
            'barangay_id' => 'required',
        ]);

        try {
            $driver = Auth::user();
            
            $schedule = [
                'id' => $request->schedule_id,
                'barangay_id' => $request->barangay_id,
                'driver_id' => $driver->id,
                'status' => 'in_progress',
                'started_at' => now()->toISOString(),
            ];

            Cache::put("active_schedule_{$request->schedule_id}", $schedule, 600);

            broadcast(new ScheduleStatusUpdated($schedule, $request->barangay_id, 'started'));

            return response()->json([
                'success' => true,
                'message' => 'Schedule started successfully',
                'data' => $schedule
            ]);

        } catch (\Exception $e) {
            Log::error('Schedule start failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to start schedule'
            ], 500);
        }
    }

    public function completeSchedule(Request $request){
        $request->validate([
            'schedule_id' => 'required',
        ]);

        try {
            $driver = Auth::user();
            
            $schedule = Cache::get("active_schedule_{$request->schedule_id}", []);
            
            $completedSchedule = array_merge($schedule, [
                'status' => 'completed',
                'completed_at' => now()->toISOString(),
            ]);

            broadcast(new ScheduleStatusUpdated($completedSchedule, $schedule['barangay_id'] ?? null, 'completed'));

            Cache::forget("driver_location_{$driver->id}");
            Cache::forget("active_schedule_{$request->schedule_id}");

            $activeDrivers = Cache::get('active_drivers', []);
            $activeDrivers = array_diff($activeDrivers, [$driver->id]);
            Cache::put('active_drivers', $activeDrivers, 600);

            return response()->json([
                'success' => true,
                'message' => 'Schedule completed successfully',
                'data' => $completedSchedule
            ]);

        } catch (\Exception $e) {
            Log::error('Schedule completion failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete schedule'
            ], 500);
        }
    }

    public function getActiveDriverLocations($barangayId = null){
        $locations = [];
        
        $activeDrivers = Cache::get('active_drivers', []);
        
        foreach ($activeDrivers as $driverId) {
            $location = Cache::get("driver_location_{$driverId}");
            if ($location) {
                if (!$barangayId || $location['barangay_id'] == $barangayId) {
                    $locations[] = $location;
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }

    public function getActiveSchedules($barangayId = null){
        $schedules = [];

        $activeDrivers = Cache::get('active_drivers', []);
        
        foreach ($activeDrivers as $driverId) {
            $location = Cache::get("driver_location_{$driverId}");
            if ($location) {
                $schedule = Cache::get("active_schedule_{$location['schedule_id']}");
                if ($schedule) {
                    if (!$barangayId || $schedule['barangay_id'] == $barangayId) {
                        $schedules[] = array_merge($schedule, [
                            'current_location' => $location
                        ]);
                    }
                }
            }
        }

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function getCurrentSchedule($barangayId){
    try {
        $currentSchedule = Schedule::where('barangay_id', $barangayId)
            ->where('status', 'in_progress')
            ->orWhere(function($query) use ($barangayId) {
                $query->where('barangay_id', $barangayId)
                      ->where('collection_date', today())
                      ->whereIn('status', ['pending', 'active']);
            })
            ->with(['driver.user', 'barangay'])
            ->first();

        if (!$currentSchedule) {
            return response()->json([
                'success' => false,
                'message' => 'No active schedule found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $currentSchedule
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching schedule'
        ], 500);
    }
}

public function getScheduleSites($scheduleId){
    try {
        $schedule = Schedule::with(['collections.site.purok'])->find($scheduleId);
        
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        // Get sites only from collection queue
        $sites = $schedule->collections->map(function($collection) {
            return [
                'id' => $collection->site->id,
                'site_name' => $collection->site->site_name,
                'latitude' => $collection->site->latitude,
                'longitude' => $collection->site->longitude,
                'type' => $collection->site->type,
                'status' => $collection->status,
                'completed_at' => $collection->completed_at ? $collection->completed_at->toISOString() : null,
                'purok' => $collection->site->purok->purok_name ?? 'N/A',
                'purok_name' => $collection->site->purok->purok_name ?? 'N/A',
                'collection_id' => $collection->id
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $sites
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching schedule sites: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error fetching sites: ' . $e->getMessage()
        ], 500);
    }
}

public function markSiteAsCompleted(Request $request){
    $request->validate([
        'collection_id' => 'required|exists:collection_ques,id',
    ]);

    try {
        $collection = \App\Models\CollectionQue::findOrFail($request->collection_id);
        
        $collection->markAsFinished();

        // Load the site and schedule relationships
        $collection->load(['site', 'schedule']);

        Log::info('Site marked as completed', [
            'collection_id' => $collection->id,
            'site_id' => $collection->site_id,
            'schedule_id' => $collection->schedule_id
        ]);

        // Broadcast the site completion to residents
        broadcast(new SiteCompletionUpdated(
            $collection->site_id,
            $collection->schedule_id,
            $collection->schedule->barangay_id,
            $collection->status,
            $collection->completed_at->toISOString(),
            $collection->site->site_name,
            $collection->site->latitude,
            $collection->site->longitude
        ));

        return response()->json([
            'success' => true,
            'message' => 'Site marked as completed',
            'data' => [
                'collection_id' => $collection->id,
                'site_id' => $collection->site_id,
                'status' => $collection->status,
                'completed_at' => $collection->completed_at->toISOString()
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to mark site as completed: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Failed to mark site as completed: ' . $e->getMessage()
        ], 500);
    }
}

public function getDriverLocation($scheduleId){
    try {
        $location = Cache::get("driver_location_schedule_{$scheduleId}");
        
        if (!$location) {
            $schedule = Schedule::with('driver')->find($scheduleId);
            if ($schedule && $schedule->driver) {
                $location = Cache::get("driver_location_{$schedule->driver->id}");
            }
        }

        return response()->json([
            'success' => true,
            'data' => $location
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching driver location'
        ], 500);
    }
}

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
