<?php

namespace App\Http\Controllers\admin\resident;

use Inertia\Inertia;
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
        $barangayData = Baranggay::withCount('puroks')->paginate(6);
    
        return Inertia::render('Admin/residents', [
            'municipalities' => $municipalities,
            'baranggays' => $barangayData,
            'puroks' => [],
            'total_barangay' => $municipalities->sum('baranggays_count'),
        ]);
    }
    
    public function showBaranggay($municipality_id)
    {
        $municipalities = Municipality::withCount('baranggays')->get();
        $baranggays = Baranggay::where('municipality_id', $municipality_id)
            ->withCount('puroks')
            ->get();
    
        return Inertia::render('Admin/residents', [
            'municipalities' => $municipalities,
            'baranggays' => $baranggays,
            'puroks' => [],
            'total_puroks' => $baranggays->sum('puroks_count'),
        ]);
    }
    
    public function showPurok($baranggayId)
    {
        $municipalities = Municipality::withCount('baranggays')->get();
        $baranggays = Baranggay::withCount('puroks')->get();
        $puroks = Purok::where('baranggay_id', $baranggayId)->get();
    
        return Inertia::render('Admin/residents', [
            'municipalities' => $municipalities,
            'baranggays' => $baranggays,
            'puroks' => $puroks,
            'count' => $puroks->count(),
        ]);
    }
    

    public function addBarangay(Request $request)
    {
        $validatedData = $request->validate([
            'baranggay_name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:Urban,Rural'],
            'municipality_id' => ['required', 'exists:municipalities,id'],
        ]);

        Baranggay::create($validatedData);

        return redirect()->back()->with('success', 'Barangay added successfully!');
    }

    public function addPurok(Request $request)
    {
        $validatedData = $request->validate([
            'purok_name' => ['required', 'string', 'max:255'],
            'baranggay_id' => ['required', 'exists:baranggays,id'],
        ]);

        Purok::create($validatedData);

        return redirect()->back()->with('success', 'Purok added successfully!');
    }

    public function deleteBarangay(string $id)
    {
        Baranggay::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Barangay deleted successfully!');
    }

    public function deletePurok(string $id)
    {
        Purok::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Purok deleted successfully!');
    }

    public function editBarangay(Request $request, string $id)
    {
        $data = $request->validate([
            'baranggay_name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:Urban,Rural'],
        ]);

        $barangay = Baranggay::findOrFail($id);
        $barangay->update($data);

        return redirect()->back()->with('success', 'Barangay updated successfully!');
    }

    public function editPurok(Request $request, string $id)
    {
        $data = $request->validate([
            'purok_name' => ['required', 'string', 'max:255'],
        ]);

        $purok = Purok::findOrFail($id);
        $purok->update($data);

        return redirect()->back()->with('success', 'Purok updated successfully!');
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
