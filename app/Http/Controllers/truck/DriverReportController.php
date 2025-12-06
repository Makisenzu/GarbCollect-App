<?php

namespace App\Http\Controllers\truck;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\Report;
use App\Models\Garbage;
use App\Models\ReportToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DriverReportController extends Controller
{
    /**
     * Generate access token for report form
     */
    public function generateToken(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id'
        ]);

        try {
            DB::beginTransaction();

            $schedule = Schedule::findOrFail($request->schedule_id);
            
            // Check if all sites are completed instead of schedule status
            $totalSites = \App\Models\CollectionQue::where('schedule_id', $request->schedule_id)->count();
            $completedSites = \App\Models\CollectionQue::where('schedule_id', $request->schedule_id)
                ->where('status', 'finished')
                ->count();
            
            if ($completedSites < $totalSites) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not all sites have been completed yet',
                    'completed' => $completedSites,
                    'total' => $totalSites
                ], 400);
            }

            // Check if report already exists
            $existingReport = Report::where('schedule_id', $request->schedule_id)->first();
            if ($existingReport) {
                return response()->json([
                    'success' => false,
                    'message' => 'Report already submitted for this schedule'
                ], 400);
            }

            // Generate unique token
            $token = Str::random(64);
            
            // Store token with expiration (valid for 24 hours)
            ReportToken::create([
                'schedule_id' => $request->schedule_id,
                'token' => $token,
                'expires_at' => Carbon::now()->addHours(24),
                'used' => false
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'access_token' => $token,
                'expires_at' => Carbon::now()->addHours(24)->toISOString()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate access token'
            ], 500);
        }
    }

    /**
     * Validate access token
     */
    public function validateToken(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'token' => 'required|string'
        ]);

        $token = ReportToken::where('schedule_id', $request->schedule_id)
            ->where('token', $request->token)
            ->where('used', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$token) {
            return response()->json([
                'valid' => false,
                'message' => 'Invalid or expired token'
            ]);
        }

        return response()->json([
            'valid' => true,
            'schedule' => Schedule::with(['barangay', 'driver.user'])->find($request->schedule_id)
        ]);
    }

    /**
     * Invalidate token after report submission
     */
    public function invalidateToken(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'token' => 'required|string'
        ]);

        ReportToken::where('schedule_id', $request->schedule_id)
            ->where('token', $request->token)
            ->update(['used' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Get garbage types for dropdown
     */
    public function getGarbageTypes()
    {
        $garbageTypes = Garbage::where('status', 'active')->get();

        return response()->json([
            'success' => true,
            'data' => $garbageTypes
        ]);
    }

    /**
     * Submit report
     */
    public function submitReport(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id',
            'garbage_id' => 'required|exists:garbages,id',
            'kilograms' => 'required|numeric|min:0',
            'report_pictures' => 'nullable|array',
            'report_pictures.*' => 'image|max:5120', // 5MB max per image
            'additional_notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $schedule = Schedule::findOrFail($request->schedule_id);

            // Handle multiple file uploads
            $imagePaths = [];
            if ($request->hasFile('report_pictures')) {
                foreach ($request->file('report_pictures') as $file) {
                    $imagePaths[] = $file->store('report-photos', 'public');
                }
            }

            // Create report
            $report = Report::create([
                'schedule_id' => $request->schedule_id,
                'garbage_id' => $request->garbage_id,
                'report_picture' => $imagePaths, // Now stores array
                'kilograms' => $request->kilograms,
                'additional_notes' => $request->additional_notes
            ]);

            // Update schedule status to reported
            $schedule->update([
                'status' => 'reported',
                'notes' => $request->additional_notes ?: $schedule->notes
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Report submitted successfully',
                'report_id' => $report->id
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit report: ' . $e->getMessage()
            ], 500);
        }
    }
}