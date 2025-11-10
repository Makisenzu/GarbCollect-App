<?php

namespace App\Http\Controllers\admin\dashboard;

use App\Models\Site;
use Inertia\Inertia;
use App\Models\Driver;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Schedule;
use App\Models\Report;
use App\Models\Baranggay;

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
        $pending = Review::with(['purok', 'category'])->get();
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

    public function generateReport(Request $request)
    {
        try {
            $reportType = $request->input('type', 'all');
            $startDate = $request->input('start_date');
            $endDate = $request->input('end_date');

            $query = Schedule::with([
                'barangay.municipality', 
                'driver.user', 
                'reports.garbage',
                'collections.site.purok'
            ]);

            if ($startDate && $endDate) {
                $query->whereBetween('collection_date', [$startDate, $endDate]);
            }

            if ($reportType !== 'all') {
                $query->where('status', $reportType);
            }

            $schedules = $query->orderBy('collection_date', 'desc')->get();

            $reportData = [];
            
            foreach ($schedules as $schedule) {
                $totalSacks = $schedule->reports->sum('sack_count');
                $garbageTypes = $schedule->reports->map(function($report) {
                    return $report->garbage->garbage_type . ' (' . $report->sack_count . ' sacks)';
                })->implode(', ');

                $sitesVisited = $schedule->collections->count();
                $sitesCompleted = $schedule->collections->where('status', 'finished')->count();

                $reportData[] = [
                    'Schedule ID' => $schedule->id,
                    'Collection Date' => $schedule->collection_date->format('Y-m-d'),
                    'Collection Time' => $schedule->collection_time,
                    'Barangay' => $schedule->barangay->baranggay_name ?? 'N/A',
                    'Driver Name' => $schedule->driver->user->name . ' ' . $schedule->driver->user->lastname ?? 'N/A',
                    'Status' => strtoupper($schedule->status),
                    'Total Sacks Collected' => $totalSacks,
                    'Garbage Types' => $garbageTypes ?: 'No data',
                    'Sites Assigned' => $sitesVisited,
                    'Sites Completed' => $sitesCompleted,
                    'Completion Rate' => $sitesVisited > 0 ? round(($sitesCompleted / $sitesVisited) * 100, 2) . '%' : '0%',
                    'Notes' => $schedule->notes ?? 'None',
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $reportData,
                'summary' => [
                    'total_schedules' => $schedules->count(),
                    'total_sacks' => array_sum(array_column($reportData, 'Total Sacks Collected')),
                    'completed' => $schedules->where('status', 'completed')->count(),
                    'active' => $schedules->where('status', 'active')->count(),
                    'failed' => $schedules->where('status', 'FAILED')->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage()
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
