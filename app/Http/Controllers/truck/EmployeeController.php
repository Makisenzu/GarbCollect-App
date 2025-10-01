<?php

namespace App\Http\Controllers\truck;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    protected function updateScheduleStatuses()
    {
        DB::update("
            UPDATE schedules 
            SET status = 'failed', 
                updated_at = NOW() 
            WHERE status = 'active' 
            AND collection_date < CURDATE()
        ");
    
        DB::update("
            UPDATE schedules 
            SET status = 'in_progress', 
                updated_at = NOW() 
            WHERE status = 'active' 
            AND collection_date = CURDATE() 
            AND collection_time <= TIME(NOW())
        ");
    
        DB::update("
            UPDATE schedules 
            SET status = 'completed', 
                updated_at = NOW() 
            WHERE status = 'in_progress' 
            AND collection_date < CURDATE()
        ");
    }
    public function index()
    {
        $this->updateScheduleStatuses();

        $user = Auth::user();
        $driver = $user->driver;
        
        if ($driver) {
            $schedules = Schedule::with(['barangay', 'driver.user'])
                ->where('driver_id', $driver->id)
                ->get();
        } else {
            $schedules = collect([]);
        }
        
        return Inertia::render('Dashboard', [
            'schedules' => $schedules
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
