<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Baranggay;
use App\Models\Schedule;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */

    public function applicantIndex() {
        return Inertia::render('Users/Applicant');
    }

    public function showBarangayRoutes(){
        return Inertia::render('Users/components/SitesComponents/BarangayRoutes', [
            'mapboxToken' => env('MAPBOX_ACCESS_TOKEN'),
        ]);
    }

    public function getBarangay() {
        try {
            $barangayData = Baranggay::all();
            return response()->json([
                'success' => true,
                'barangay_data' => $barangayData
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch barangay',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function getBarangaySchedule($id) {
        try {
            $barangaySchedule = Schedule::with(['barangay', 'driver'])
            ->where('barangay_id', $id)
            ->whereDate('collection_date', today())
            ->get();
            return response()->json([
                'success' => true,
                'message' => 'Successfully fetch barangay schedule',
                'barangaySchedule' => $barangaySchedule
            ]); 
        }catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get schedule for that barangay',
                'error' => $e->getMessage()
            ]);
        }
    }


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
