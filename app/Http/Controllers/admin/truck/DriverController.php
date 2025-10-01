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
use Exception;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $drivers = Driver::with('user')->paginate(6);
        $schedules = Schedule::with(['barangay', 'driver.user'])->get();
        $barangays = Baranggay::all();
        
        $users = User::select('id', 'picture', 'name', 'middlename', 'lastname', 'gender', 'email', 'phone_num')
                    ->whereNotIn('roles', ['admin', 'employee'])
                    ->orderBy('id', 'asc')
                    ->get();
        
        return Inertia::render('Admin/drivers', [
            'drivers' => $drivers,
            'schedules' => $schedules,
            'users' => $users,
            'barangays' => $barangays,
            'stats' => [
                [
                    'title' => 'Total Drivers',
                    'value' => Driver::count(),
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
                ],
                [
                    'title' => "Failed Collections",
                    'value' => $schedules->where('status', 'failed')->count(),
                    'description' => "Failed collection schedules",
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
            $driver = Driver::find($assignData['driver_id']);
            
            if (!$driver) {
                return response()->json([
                    'message' => 'Driver not found.'
                ], 422);
            }
    
            $allowedStatuses = ['active', 'onduty'];
            if (!in_array($driver->status, $allowedStatuses)) {
                return response()->json([
                    'message' => 'Cannot assign driver. Driver is "' . $driver->status . '". Only active or on-duty drivers can be assigned.'
                ], 422);
            }
    
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
                'message' => 'Driver assigned successfully!',
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

    public function editDriverSchedule(Request $request, string $id) {
        try {
            $data = $request->validate([
                'collection_date' => ['required', 'date', 'after_or_equal:today'],
                'collection_time' => ['required', 'date_format:H:i'],
                'notes' => ['nullable', 'string', 'max:255']
            ]);
    
            $scheduleData = Schedule::findOrFail($id);
            $scheduleData->update($data);
            
            return redirect()->back()->with('success', 'Schedule updated successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to update schedule: ' . $e->getMessage());
        }
    }

    public function editDriver(Request $request, string $id) {
        try {
            $data = $request->validate([
                'status' => ['required', 'in:active,inactive,pending,onduty,resigned'],
                'license_number' => ['required', 'string', 'max:255', 'unique:drivers,license_number,' . $id]
            ]);
    
            $driverData = Driver::findOrFail($id);
            $driverData->update($data);
            return redirect()->back()->with('success', 'Driver edited successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to edit driver: ' . $e->getMessage());
        } 
    }

    public function deleteDriverSchedule ($id) {
        try {
            $schedule = Schedule::findOrFail($id);
            $schedule->delete();
            return redirect()->back()->with('success', 'Schedule deleted successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete schedule: ' . $e->getMessage());
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
    public function destroy($id)
    {
        try {
            $driver = Driver::with('user')->findOrFail($id);
            
            $hasSchedules = Schedule::where('driver_id', $id)->exists();
            
            if ($hasSchedules) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete driver. This driver has existing schedules assigned.'
                ], 422);
            }
            
            if ($driver->user) {
                $user = $driver->user;
                $user->roles = 'applicant';
                $user->save();
            }
            
            $driver->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Driver removed successfully.'
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not found!'
            ], 404);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete driver: ' . $e->getMessage()
            ], 500);
        }
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