<?php

namespace App\Http\Controllers\truck;

use App\Models\Site;
use App\Models\Driver;
use App\Models\Schedule;
use App\Models\CollectionQue;
use Illuminate\Http\Request;
use App\Events\DriverLocation;
use App\Events\SiteCompletionUpdated;
use Illuminate\Support\Facades\DB;
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
    
            // Check proximity to collection sites and auto-complete
            $sitesCompleted = $this->checkAndCompleteNearbySites(
                $request->schedule_id,
                $request->latitude,
                $request->longitude
            );
    
            Log::info('Location update successful for driver: ' . $driver->id, [
                'sites_completed' => count($sitesCompleted)
            ]);
    
            return response()->json([
                'success' => true,
                'message' => 'Location updated and broadcasted successfully',
                'data' => $locationData,
                'sites_completed' => $sitesCompleted
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

    private function checkAndCompleteNearbySites($scheduleId, $driverLat, $driverLng)
    {
        $completedSites = [];
        
        try {
            // Get all unfinished sites for this schedule
            $unfinishedCollections = \App\Models\CollectionQue::where('schedule_id', $scheduleId)
                ->where('status', 'unfinished')
                ->with('site')
                ->get();
            
            $PROXIMITY_THRESHOLD_KM = 0.05; // 50 meters
            
            foreach ($unfinishedCollections as $collection) {
                if (!$collection->site) continue;
                
                $siteLat = floatval($collection->site->latitude);
                $siteLng = floatval($collection->site->longitude);
                
                // Calculate distance using Haversine formula
                $distance = $this->calculateDistance($driverLat, $driverLng, $siteLat, $siteLng);
                
                // Log proximity for debugging
                if ($distance < 0.1) { // Log when within 100m
                    Log::info("Driver proximity to {$collection->site->site_name}: {$distance}km");
                }
                
                if ($distance <= $PROXIMITY_THRESHOLD_KM) {
                    Log::info("AUTO-COMPLETING site: {$collection->site->site_name} - Distance: {$distance}km");
                    
                    // Mark site as completed
                    DB::beginTransaction();
                    
                    $collection->markAsFinished();
                    
                    // Get completion statistics
                    $completedCount = \App\Models\CollectionQue::where('schedule_id', $scheduleId)
                        ->where('status', 'finished')
                        ->count();
                    $totalSites = \App\Models\CollectionQue::where('schedule_id', $scheduleId)->count();
                    
                    // Broadcast site completion event
                    $schedule = Schedule::find($scheduleId);
                    if ($schedule) {
                        broadcast(new \App\Events\SiteCompletionUpdated(
                            $collection->site->id,
                            $scheduleId,
                            $schedule->barangay_id,
                            'finished',
                            now()->toISOString(),
                            $collection->site->site_name,
                            $collection->site->latitude,
                            $collection->site->longitude,
                            $completedCount,
                            $totalSites
                        ));
                    }
                    
                    // NOTE: Schedule status is NOT updated here
                    // It will only be updated to 'reported' when driver submits completion report
                    if ($completedCount === $totalSites) {
                        Log::info("All sites completed for schedule {$scheduleId}, awaiting driver report");
                    }
                    
                    DB::commit();
                    
                    $completedSites[] = [
                        'site_id' => $collection->site->id,
                        'site_name' => $collection->site->site_name,
                        'distance' => $distance
                    ];
                }
            }
            
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error in checkAndCompleteNearbySites: ' . $e->getMessage());
        }
        
        return $completedSites;
    }
    
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth's radius in kilometers
        
        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);
        
        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($lonDelta / 2) * sin($lonDelta / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
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
        $schedule = Schedule::with(['barangay.puroks.sites', 'collections.site'])->find($scheduleId);
        
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        // Get collection queue for this schedule
        $collectionQueue = $schedule->collections->keyBy('site_id');

        $sites = $schedule->barangay->puroks->flatMap(function($purok) use ($collectionQueue) {
            return $purok->sites->map(function($site) use ($collectionQueue) {
                $queueEntry = $collectionQueue->get($site->id);
                
                return [
                    'id' => $site->id,
                    'site_name' => $site->site_name,
                    'latitude' => $site->latitude,
                    'longitude' => $site->longitude,
                    'type' => $site->type,
                    'status' => $queueEntry ? $queueEntry->status : 'unfinished',
                    'completed_at' => $queueEntry && $queueEntry->completed_at ? $queueEntry->completed_at->toISOString() : null,
                    'purok' => $site->purok->purok_name
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $sites
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error fetching sites'
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
