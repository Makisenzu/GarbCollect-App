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

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $drivers = Driver::with('user')->get();
        
        $users = User::select('id', 'picture', 'name', 'middlename', 'lastname', 'gender', 'email', 'phone_num')
                    ->whereNotIn('roles', ['admin', 'employee'])
                    ->orderBy('id', 'asc')
                    ->get();

        $barangays = Baranggay::with('puroks')->get();
        
        return Inertia::render('Admin/drivers', [
            'drivers' => $drivers,
            'users' => $users,
            'barangays' => $barangays,
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