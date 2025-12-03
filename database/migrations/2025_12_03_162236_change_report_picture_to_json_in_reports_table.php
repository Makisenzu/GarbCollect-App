<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, convert existing single image strings to JSON arrays
        $reports = DB::table('reports')->get();
        
        foreach ($reports as $report) {
            if ($report->report_picture && !is_null($report->report_picture)) {
                $pictures = [$report->report_picture];
                DB::table('reports')
                    ->where('id', $report->id)
                    ->update(['report_picture' => json_encode($pictures)]);
            }
        }
        
        // Now change the column type to JSON
        Schema::table('reports', function (Blueprint $table) {
            $table->json('report_picture')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convert JSON arrays back to single strings
        $reports = DB::table('reports')->get();
        
        foreach ($reports as $report) {
            if ($report->report_picture) {
                $pictures = json_decode($report->report_picture, true);
                $firstPicture = is_array($pictures) && count($pictures) > 0 ? $pictures[0] : null;
                DB::table('reports')
                    ->where('id', $report->id)
                    ->update(['report_picture' => $firstPicture]);
            }
        }
        
        Schema::table('reports', function (Blueprint $table) {
            $table->string('report_picture')->nullable()->change();
        });
    }
};
