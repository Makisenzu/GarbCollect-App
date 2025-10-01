<?php

namespace App\Http\Controllers\truck;

use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Events\DriverLocation;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class DriverTrackerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function updateLocation(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'schedule_id' => 'required|exists:schedules,id',
        ]);

        $user = Auth::user();
        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a driver'
            ], 403);
        }

        $schedule = Schedule::where('id', $request->schedule_id)
            ->where('driver_id', $driver->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->first();

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found or not assigned to driver'
            ], 404);
        }

        $driver->update([
            'current_latitude' => $request->latitude,
            'current_longitude' => $request->longitude,
        ]);

        event(new DriverLocation($driver, $request->latitude, $request->longitude, $request->schedule_id));

        return response()->json([
            'success' => true,
            'message' => 'Location updated successfully'
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
