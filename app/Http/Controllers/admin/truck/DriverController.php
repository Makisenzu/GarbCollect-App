<?php

namespace App\Http\Controllers\admin\truck;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Models\Baranggay;
use App\Models\Schedule;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $drivers = Driver::with('user')->get();
        $schedules = Schedule::with(['barangay', 'driver.user'])->get();
        
        $users = User::select('id', 'picture', 'name', 'middlename', 'lastname', 'gender', 'email', 'phone_num')
                    ->whereNotIn('roles', ['admin', 'employee'])
                    ->orderBy('id', 'asc')
                    ->get();
        
        return Inertia::render('Admin/drivers', [
            'drivers' => $drivers,
            'schedules' => $schedules,
            'users' => $users,
            'stats' => [
                [
                    'title' => 'Total Drivers',
                    'value' => $drivers->count(),
                    'description' => 'All registered drivers',
                    'change' => '+0%'
                ],
                [
                    'title' => 'Active Drivers', 
                    'value' => $drivers->where('status', 'active')->count(),
                    'description' => 'Currently active drivers',
                    'change' => '+0%'
                ],
                [
                    'title' => 'On Duty Drivers',
                    'value' => $drivers->where('status', 'onduty')->count(),
                    'description' => 'Drivers currently on duty',
                    'change' => '+0%'
                ]
            ]
        ]);
    }

    public function assignDriver(Request $request) 
    {
        try {
            $assignData = $request->validate([
                'barangay_id' => ['required', 'exists:baranggays,id'],
                'driver_id' => ['required', 'exists:drivers,id'],
                'collection_date' => ['required', 'date', 'after_or_equal:today'],
                'collection_time' => ['required', 'date_format:H:i'],
                'status' => ['required', 'in:active,inactive'],
                'notes' => ['max:255']
            ]);
    
            $alreadyAssigned = Schedule::where('driver_id', $assignData['driver_id'])
                ->where('barangay_id', $assignData['barangay_id'])
                ->whereDate('collection_date', $assignData['collection_date'])
                ->exists();
    
            if ($alreadyAssigned) {
                return response()->json([
                    'message' => 'This driver is already assigned to this barangay on the selected date.'
                ], 422);
            }
    
            $data = Schedule::create($assignData);
    
            return response()->json([
                'success' => true,
                'message' => 'Driver assigned!',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign driver',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    public function getBarangayData($municipalityID) {
        try {
            $barangayData = Baranggay::where('municipality_id', $municipalityID)->get();
            return response()->json([
                'success' => true,
                'barangay_data' => $barangayData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch barangays',
                'error' => $e->getMessage()
            ]);
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
        // Remove this or keep for API if needed
    }

    /**
     * Add driver using Inertia form submission
     */
    public function addDriver(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'license_number' => ['required', 'string', 'unique:drivers,license_number', 'max:255'],
            'status' => ['required', 'in:active,inactive,pending,onduty,resigned'],
            'current_latitude' => ['numeric', 'nullable'],
            'current_longitude' => ['numeric', 'nullable']
        ]);
        
        try {
            DB::beginTransaction();
    
            $driverData = Driver::create($validatedData);
    
            $user = User::findOrFail($validatedData['user_id']);
            $user->roles = 'employee';
            $user->save();
    
            DB::commit();
    
            return back()->with([
                'success' => 'Driver added successfully and user role updated',
                'driverData' => $driverData
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'message' => 'Failed to add driver: ' . $e->getMessage()
            ]);
        }
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

    /**
     * Keep these for API if needed, but remove if using pure Inertia
     */
    public function getDriverInfo()
    {
        try {
            $drivers = Driver::with('user')->get();
            return response()->json([
                'success' => true,
                'message' => 'Fetch drivers successfully',
                'data' => $drivers
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch drivers',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUserInfo()
    {
        try {
            $users = User::select('id', 'picture', 'name', 'middlename', 'lastname', 'gender', 'email', 'phone_num')
                        ->whereNotIn('role', ['admin', 'employee'])
                        ->orderBy('id', 'asc')
                        ->get();
            return response()->json([
                'success' => true,
                'message' => 'Fetch users successfully',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}