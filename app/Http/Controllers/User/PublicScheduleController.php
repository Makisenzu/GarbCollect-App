<?php

namespace App\Http\Controllers\User;

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Exception;

class PublicScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    public function showPublicSchedule(){
        return Inertia::render('Users/components/ScheduleComponents/PublicSchedule');
    }

    public function displaySchedule($id) {
        try {
            $barangaySchedule = Schedule::with('barangay')
            ->where('barangay_id', $id)
            ->where('collection_date', '>=', today())
            ->whereIn('status', ['active', 'progress'])
            ->orderBy('collection_date', 'asc')
            ->orderBy('collection_time', 'asc')
            ->get();


            return response()->json([
                'success' => true,
                'message' => 'Retrieve schedule successfully',
                'barangaySchedule' => $barangaySchedule
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get schedule',
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
