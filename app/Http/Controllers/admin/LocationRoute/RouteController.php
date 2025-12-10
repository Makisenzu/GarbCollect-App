<?php

namespace App\Http\Controllers\admin\LocationRoute;

use App\Models\Site;
use Inertia\Inertia;
use App\Models\Purok;
use App\Models\Baranggay;
use App\Models\Municipality;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Exception;

class RouteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Admin/truckRoutes', [
            'mapboxKey' => env('MAPBOX_ACCESS_TOKEN')
        ]);
    }

    public function getBarangay($municipalityID)
    {
        $barangays = Baranggay::where('municipality_id', $municipalityID)->get();
    
        return response()->json([
            'barangays' => $barangays
        ]);
    }
    
    public function getPurok($barangayID)
    {
        $puroks = Purok::where('baranggay_id', $barangayID)->get();
    
        return response()->json([
            'puroks' => $puroks
        ]);
    }
    

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }


    public function getSiteLocation()
    {
        try {
            $siteData = Site::with(['purok.baranggay'])->get();
            return response()->json([
                'success' => true,
                'message' => 'Successfully fetch the site data',
                'data' => $siteData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch all data',
                'error' => $e->getMessage()
            ]);
        }
    }

    public function addCollectionRoute(Request $request)
    {
        $validatedData = $request->validate([
            'purok_id' => ['required', 'exists:puroks,id'],
            'site_name' => ['nullable', 'string', 'max:255'],
            'latitude' => ['required', 'numeric'],
            'longitude' => ['required', 'numeric'],
            'type' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'additional_notes' => ['nullable', 'string','max:255']
        ]);

        try {
            $siteData = Site::create($validatedData);

            return response()->json([
                'success' => true,
                'message' => 'Added new Site',
                'data' => $siteData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add new site',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function editSite (Request $request, string $id) {
        try {
            $data = $request->validate([
                'site_name' => ['required', 'string', 'max:255'],
                'status' => ['required', 'string', 'in:active,inactive,pending,maintenance']
            ]);

            $siteData = Site::findOrFail($id);
            $siteData->update($data);
            return redirect()->back()->with('success', 'Site edited successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to edit site' . $e->getMessage());
        }
    }

    public function deleteSite($id) {
        try {
            $siteData = Site::findOrFail($id);
            $siteData->delete();
            return redirect()->back()->with('success', 'Site deleted successfully');
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete site' . $e->getMessage());
        }
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
