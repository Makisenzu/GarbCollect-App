<?php

namespace App\Http\Controllers\admin\truck;

use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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

    public function getUserInfo()
    {
        try {
            $users = User::select('id', 'picture', 'name', 'middlename', 'lastname', 'gender', 'email')->where('roles', '!=', 'admin')->orderBy('id', 'asc')->get();
            return response()->json([
                'success' => true,
                'message' => 'Fetch successfully',
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

    public function addDriver(Request $request)
    {
        $validatedData = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'license_number' => ['string', 'unique:drivers,license_number', 'max:255'],
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
    
            return response()->json([
                'success' => true,
                'message' => 'Added driver successfully and updated user role',
                'data' => $driverData
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add driver',
                'error' => $e->getMessage()
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
}
