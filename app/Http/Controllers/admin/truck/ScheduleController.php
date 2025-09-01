<?php

namespace App\Http\Controllers\admin\truck;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    { 
        $drivers = Driver::with('user')->get();
        $schedules = Schedule::with(['barangay', 'driver.user'])->get();

        return Inertia::render('Admin/truckRoutes', [
            'drivers' => $drivers,
            'schedules' => $schedules
        ]);
    }

    /**
     * 
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
