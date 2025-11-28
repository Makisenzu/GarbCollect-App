<?php

namespace App\Http\Controllers\truck;

use Carbon\Carbon;
use App\Models\Site;
use Inertia\Inertia;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    protected function updateScheduleStatuses(){
        DB::update("
            UPDATE schedules 
            SET status = 'failed', 
                updated_at = NOW() 
            WHERE status = 'active' 
            AND collection_date < CURDATE()
        ");
    
        DB::update("
            UPDATE schedules 
            SET status = 'progress', 
                updated_at = NOW() 
            WHERE status = 'active' 
            AND collection_date = CURDATE() 
            AND collection_time <= TIME(NOW())
        ");
    
        DB::update("
            UPDATE schedules 
            SET status = 'completed', 
                updated_at = NOW() 
            WHERE status = 'progress' 
            AND collection_date < CURDATE()
        ");

        DB::update("
            UPDATE drivers 
            SET status = 'onduty', 
                updated_at = NOW() 
            WHERE id IN (
                SELECT DISTINCT driver_id 
                FROM schedules 
                WHERE status = 'progress' 
                AND collection_date = CURDATE()
                AND collection_time <= TIME(NOW())
            )
            AND status != 'onduty'
        ");
    }

    public function getActiveSchedule()
    {
        $schedule = Schedule::where('status', 'active')
            ->with(['driver.user', 'barangay'])
            ->first();

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
    }

public function getActiveSites($barangayId)
{
    $sites = Site::whereHas('purok.baranggay', function($query) use ($barangayId) {
        $query->where('id', $barangayId);
    })
    ->where('status', 'active')
    ->with(['purok.baranggay'])
    ->get();

    return response()->json([
        'success' => true,
        'data' => $sites
    ]);
}

public function index(){
    $this->updateScheduleStatuses();

    $user = Auth::user();
    $driver = $user->driver;
    
    $schedules = collect([]);
    $stats = [];
    
    if ($driver) {
        $schedules = Schedule::with(['barangay', 'driver.user', 'collections'])
            ->where('driver_id', $driver->id)
            ->orderBy('collection_date', 'desc')
            ->orderBy('collection_time', 'desc')
            ->get();

        $stats = [
            [
                'title' => 'Total Schedules',
                'value' => $schedules->count(),
                'description' => 'All your schedules'
            ],
            [
                'title' => 'Completed',
                'value' => $schedules->where('status', 'completed')->count(),
                'description' => 'Successful collections'
            ],
            [
                'title' => 'Pending',
                'value' => $schedules->whereIn('status', ['active'])->count(),
                'description' => 'Upcoming schedules'
            ],
            [
                'title' => 'Failed',
                'value' => $schedules->where('status', 'failed')->count(),
                'description' => 'Failed collections'
            ]
        ];
    } else {
        $stats = [
            [
                'title' => 'Driver Profile',
                'value' => 'Incomplete',
                'description' => 'Complete your driver profile'
            ]
        ];
    }
    
    return Inertia::render('Dashboard', [
        'schedules' => $schedules,
        'stats' => $stats,
        'hasDriver' => !is_null($driver)
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
    public function show($id)
    {
        $schedule = Schedule::with(['driver.user', 'barangay'])
            ->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
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
