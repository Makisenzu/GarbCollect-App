<?php

namespace App\Http\Controllers\admin\truck;

use Exception;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Site;
use App\Models\Driver;
use App\Models\Schedule;
use App\Models\Baranggay;
use App\Events\NewSchedule;
use Illuminate\Http\Request;
use App\Models\CollectionQue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Mail;
use App\Mail\DriverAssignment;
use App\Events\SiteCompletionUpdated;

class DriverController extends Controller
{
    public function index(){
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

    protected function sendDriverAssignmentEmail($driver, $schedule)
    {
        try {
            $driverUser = $driver->user;
            $barangay = Baranggay::find($schedule->barangay_id);
            
            if ($driverUser && $driverUser->email) {
                $driverName = $driverUser->name . ' ' . $driverUser->lastname;
                $barangayName = $barangay->baranggay_name ?? 'N/A';
                $collectionDate = $schedule->collection_date;
                $collectionTime = $schedule->collection_time;
                $notes = $schedule->notes ?? 'No additional notes';
                
                Mail::to($driverUser->email)->send(
                    new DriverAssignment($driverName, $barangayName, $collectionDate, $collectionTime, $notes)
                );
                
                Log::info('Driver assignment email sent to: ' . $driverUser->email);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send driver assignment email: ' . $e->getMessage());
        }
    }

    public function assignDriver(Request $request) {
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
            event(new NewSchedule($data));
            $this->sendDriverAssignmentEmail($driver, $data);
    
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

    public function addDriver(Request $request){
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

    public function destroy($id){
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

    public function getDriverInfo(){
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

    public function getUserInfo(){
        try {
            $users = User::select('id', 'picture', 'name', 'middlename', 'lastname', 'gender', 'email', 'phone_num')
                        ->whereNotIn('roles', ['admin', 'employee'])
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

    public function initializeCollectionQue(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'site_id' => 'required|array',
                'site_id.*' => 'exists:sites,id'
            ]);

            DB::beginTransaction();

            // Check if collection queue already exists for this schedule
            $existingQueueCount = CollectionQue::where('schedule_id', $validatedData['schedule_id'])->count();
            
            if ($existingQueueCount > 0) {
                Log::info('Collection queue already initialized for schedule: ' . $validatedData['schedule_id']);
                DB::commit();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Collection queue already initialized',
                    'total_sites' => $existingQueueCount,
                    'already_exists' => true
                ]);
            }

            // Insert all sites as unfinished
            $collectionQueEntries = [];
            foreach ($validatedData['site_id'] as $siteId) {
                $collectionQueEntries[] = [
                    'schedule_id' => $validatedData['schedule_id'],
                    'site_id' => $siteId,
                    'status' => 'unfinished',
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }

            CollectionQue::insert($collectionQueEntries);

            // Update schedule status to 'in_progress'
            Schedule::where('id', $validatedData['schedule_id'])
                    ->update(['status' => 'in_progress']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Collection queue initialized successfully',
                'total_sites' => count($validatedData['site_id']),
                'already_exists' => false
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to initialize collection queue: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize collection queue: ' . $e->getMessage()
            ], 500);
        }
    }

    public function markSiteCompleted(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'schedule_id' => 'required|exists:schedules,id',
                'site_id' => 'required|exists:sites,id'
            ]);

            DB::beginTransaction();

            // Find and update the collection que entry
            $collectionQue = CollectionQue::where('schedule_id', $validatedData['schedule_id'])
                                        ->where('site_id', $validatedData['site_id'])
                                        ->firstOrFail();

            $collectionQue->markAsFinished();

            // Get site and schedule details for broadcasting
            $site = Site::find($validatedData['site_id']);
            $schedule = Schedule::find($validatedData['schedule_id']);

            // Get completion statistics
            $completedCount = CollectionQue::where('schedule_id', $validatedData['schedule_id'])
                                            ->where('status', 'finished')
                                            ->count();
            $totalSites = CollectionQue::where('schedule_id', $validatedData['schedule_id'])->count();

            // Broadcast site completion event
            if ($site && $schedule) {
                broadcast(new SiteCompletionUpdated(
                    $site->id,
                    $schedule->id,
                    $schedule->barangay_id,
                    'finished',
                    now()->toISOString(),
                    $site->site_name,
                    $site->latitude,
                    $site->longitude,
                    $completedCount,
                    $totalSites
                ));

                Log::info('Site completion broadcasted', [
                    'site_id' => $site->id,
                    'site_name' => $site->site_name,
                    'schedule_id' => $schedule->id,
                    'barangay_id' => $schedule->barangay_id,
                    'completed' => $completedCount,
                    'total' => $totalSites
                ]);
            }

            // Check if all sites are completed
            $allCompleted = CollectionQue::allSitesCompleted($validatedData['schedule_id']);

            if ($allCompleted) {
                // Update schedule status to completed
                Schedule::where('id', $validatedData['schedule_id'])
                        ->update(['status' => 'completed']);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Site marked as completed. All sites finished!',
                    'all_completed' => true,
                    'schedule_completed' => true
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Site marked as completed',
                'all_completed' => false,
                'completed_sites' => CollectionQue::where('schedule_id', $validatedData['schedule_id'])
                                                ->where('status', 'finished')
                                                ->count(),
                'total_sites' => CollectionQue::where('schedule_id', $validatedData['schedule_id'])->count()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to mark site as completed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark site as completed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getCollectionProgress($scheduleId)
    {
        try {
            $progress = CollectionQue::where('schedule_id', $scheduleId)->get();

            $completed = $progress->where('status', 'finished')->count();
            $total = $progress->count();

            return response()->json([
                'success' => true,
                'progress' => $progress,
                'summary' => [
                    'completed' => $completed,
                    'total' => $total,
                    'percentage' => $total > 0 ? round(($completed / $total) * 100) : 0,
                    'all_completed' => $completed === $total && $total > 0
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getCollectionProgress: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch collection progress: ' . $e->getMessage()
            ], 500);
        }
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }
}