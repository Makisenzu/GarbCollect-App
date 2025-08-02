<?php

namespace App\Http\Controllers\admin\resident;

use App\Models\Purok;
use App\Models\Baranggay;
use App\Models\Municipality;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class AreaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $municipalities = Municipality::withCount('baranggays')->get();
        return response()->json([
            'municipalities' => $municipalities,
            'total_barangay' => $municipalities->sum('baranggays_count')
        ]);
    }

    public function showBaranggay($municipality_id)
    {
        $baranggays = Baranggay::where('municipality_id', $municipality_id)
            ->withCount('puroks')
            ->get();
        return response()->json([
            'baranggays' => $baranggays,
            'total_puroks' => $baranggays->sum('puroks_count')
        ]);
    }

    public function showPurok($baranggayId)
    {
        $puroks = Purok::where('baranggay_id', $baranggayId)
            ->get();
        return response()->json([
            'puroks' => $puroks,
            'count' => $puroks->count()
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
