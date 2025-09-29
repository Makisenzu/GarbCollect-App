<?php

namespace App\Http\Controllers\admin\dashboard;

use App\Models\Site;
use Inertia\Inertia;
use App\Models\Driver;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Schedule;

class DashboardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        Schedule::where('status', 'active')
        ->whereRaw('collection_date < CURDATE()')
        ->update(['status' => 'FAILED']);
        
        $drivers = Driver::with('user')->get();
        $sites = Site::with(['purok'])->get();
        $pending = Review::with(['site', 'category'])->get();
        $schedules = Schedule::with(['barangay', 'driver.user'])->get();
        return Inertia::render('Admin/adminDashboard', [
            'drivers' => $drivers,
            'driverCount' => $drivers->where('status', 'active')->count(),
            'driverTotal' => $drivers->count(),
            'sites' => $sites,
            'siteCount' => $sites->count(),
            'pendingCount' => $pending->count(),
            'schedules' => $schedules,
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
