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
use App\Models\Garbage;

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
        
        // Calculate average rating from reviews
        $averageRating = Review::whereNotNull('rate')->avg('rate');
        $averageRating = $averageRating ? round($averageRating, 1) : 0;
        
        // Generate weekly collection data (last 7 days)
        $weeklyData = [];
        $daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayName = $daysOfWeek[$date->dayOfWeek];
            
            $count = Schedule::whereDate('collection_date', $date->toDateString())
                ->whereIn('status', ['completed', 'active', 'in_progress'])
                ->count();
            
            $weeklyData[] = [
                'name' => $dayName,
                'collections' => $count
            ];
        }
        
        // Generate monthly collection data (last 4 weeks)
        $monthlyData = [];
        for ($i = 3; $i >= 0; $i--) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();
            
            $count = Schedule::whereBetween('collection_date', [$startOfWeek, $endOfWeek])
                ->whereIn('status', ['completed', 'active', 'in_progress'])
                ->count();
            
            $monthlyData[] = [
                'name' => 'Week ' . (4 - $i),
                'collections' => $count
            ];
        }
        
        // Generate weekly waste data by garbage type
        $garbageTypes = Garbage::all();
        $weeklyWasteData = [];
        
        for ($i = 3; $i >= 0; $i--) {
            $startOfWeek = now()->subWeeks($i)->startOfWeek();
            $endOfWeek = now()->subWeeks($i)->endOfWeek();
            
            $reports = Report::whereHas('schedule', function($query) use ($startOfWeek, $endOfWeek) {
                $query->whereBetween('collection_date', [$startOfWeek, $endOfWeek]);
            })->with('garbage')->get();
            
            $weekData = ['name' => 'Week ' . (4 - $i)];
            
            foreach ($garbageTypes as $garbageType) {
                $count = $reports->filter(function($report) use ($garbageType) {
                    return $report->garbage_id == $garbageType->id;
                })->sum('kilograms');
                
                $weekData[$garbageType->garbage_type] = $count;
            }
            
            $weeklyWasteData[] = $weekData;
        }
        
        // Generate monthly waste data (last 6 months)
        $monthlyWasteData = [];
        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for ($i = 5; $i >= 0; $i--) {
            $startOfMonth = now()->subMonths($i)->startOfMonth();
            $endOfMonth = now()->subMonths($i)->endOfMonth();
            
            $reports = Report::whereHas('schedule', function($query) use ($startOfMonth, $endOfMonth) {
                $query->whereBetween('collection_date', [$startOfMonth, $endOfMonth]);
            })->with('garbage')->get();
            
            $monthData = ['name' => $monthNames[$startOfMonth->month - 1]];
            
            foreach ($garbageTypes as $garbageType) {
                $count = $reports->filter(function($report) use ($garbageType) {
                    return $report->garbage_id == $garbageType->id;
                })->sum('kilograms');
                
                $monthData[$garbageType->garbage_type] = $count;
            }
            
            $monthlyWasteData[] = $monthData;
        }
        
        return Inertia::render('Admin/adminDashboard', [
            'drivers' => $drivers,
            'driverCount' => $drivers->where('status', 'active')->count(),
            'driverTotal' => $drivers->count(),
            'sites' => $sites,
            'siteCount' => $sites->count(),
            'pendingCount' => $pending->count(),
            'schedules' => $schedules,
            'averageRating' => $averageRating,
            'chartData' => [
                'weekly' => $weeklyData,
                'monthly' => $monthlyData,
                'weeklyWaste' => $weeklyWasteData,
                'monthlyWaste' => $monthlyWasteData,
            ],
            'garbageTypes' => $garbageTypes->map(function($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->garbage_type
                ];
            })
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
                $totalKg = $schedule->reports->sum('kilograms');
                $garbageTypes = $schedule->reports->map(function($report) {
                    return $report->garbage->garbage_type . ' (' . number_format($report->kilograms, 2) . ' kg)';
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
                    'Total Kilograms Collected' => number_format($totalKg, 2),
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
                    'total_kilograms' => array_sum(array_column($reportData, 'Total Kilograms Collected')),
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
