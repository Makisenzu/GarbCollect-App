<?php

namespace App\Http\Controllers\truck;

use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Events\DriverLocation;
use App\Events\ScheduleStatusUpdated;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Support\Facades\Auth;
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
