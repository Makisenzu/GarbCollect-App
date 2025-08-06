<?php

namespace App\Http\Controllers\admin\LocationRoute;

use App\Models\Site;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

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

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function addCollectionRoute(Request $request)
    {
        $validatedData = $request->validate([
            'site_name' => ['required', 'string', 'max:255'],
            'latitude' => ['required', 'decimal'],
            'longitude' => ['required', 'decimal'],
            'collection_time' => ['required'],
            'status' => ['required', 'max:255'],
            'additional_notes' => ['required', 'max:255']
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
