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

    public function addBarangay(Request $request){
        $validatedData = $request->validate([
            'psgc_code' => ['required', 'string', 'max:255', 'unique:baranggays,psgc_code'],
            'baranggay_name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:Urban,Rural'],
            'municipality_id' => ['required', 'exists:municipalities,id'],
        ]);
        try {
            $barangay = Baranggay::create($validatedData);
            
            return response()->json([
                'success' => true,
                'message' => 'Added new Barangay',
                'data' => $barangay
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add barangay',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addPurok(Request $request)
    {
        $validatedData = $request->validate([
            'purok_name' => ['required', 'string', 'max:255'],
            'baranggay_id' => ['required', 'exists:baranggays,id']
        ]);
        try {
            $purok = Purok::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Added New Purok',
                'data' => $purok
            ], 200);
        } catch (\Exception $e){
            return response()->json([
                'success' => false,
                'message' => 'Failed to add new purok',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteBarangay(string $id)
    {
        try {
            $barangayId = Baranggay::findOrFail($id);
            $barangayId->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Barangay deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove barangay'
            ], 500);
        }
    }

    public function deletePurok(String $id)
    {
        try {
            $purokId = Purok::findOrFail($id);
            $purokId->delete();

            return response()->json([
                'success' => true,
                'message' => 'Purok deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete purok'
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
