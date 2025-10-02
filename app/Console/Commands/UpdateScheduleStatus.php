<?php

namespace App\Console\Commands;

use Log;
use Carbon\Carbon;
use App\Models\Schedule;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateScheduleStatus extends Command
{
    protected $signature = 'schedules:update-status';
    protected $description = 'Update schedule statuses based on time and date';

    public function handle()
    {
        $today = today()->format('Y-m-d');
        $currentTime = now()->format('H:i:s');


        try {
            
            $failedCount = DB::update("
                UPDATE schedules 
                SET status = 'failed', 
                    updated_at = NOW() 
                WHERE status = 'progress' 
                AND collection_date < CURDATE()
            ");

            $inProgressCount = DB::update("
                UPDATE schedules 
                SET status = 'progress', 
                    updated_at = NOW() 
                WHERE status = 'active' 
                AND collection_date = CURDATE() 
                AND collection_time <= TIME(NOW())
            ");

            $completedCount = DB::update("
                UPDATE schedules 
                SET status = 'completed', 
                    updated_at = NOW() 
                WHERE status = 'progress' 
                AND collection_date < CURDATE()
            ");

            $driverUpdateCount = DB::update("
            UPDATE drivers 
            SET status = 'onduty', 
                updated_at = NOW() 
            WHERE id IN (
                SELECT DISTINCT driver_id 
                FROM schedules 
                WHERE status = 'progress' 
                AND collection_date = CURDATE()
                AND collection_time <= TIME(NOW())
            )
            AND status != 'onduty'  -- Only update if not already onduty
        ");

        $resetDriverCount = DB::update("
        UPDATE drivers 
        SET status = 'active', 
            updated_at = NOW() 
        WHERE status = 'onduty' 
        AND id NOT IN (
            SELECT DISTINCT driver_id 
            FROM schedules 
            WHERE status = 'progress' 
            AND collection_date = CURDATE()
        )
    ");
        
            $debugSchedules = Schedule::where('status', 'active')
                ->whereDate('collection_date', $today)
                ->get();

            
            foreach ($debugSchedules as $schedule) {
                $shouldUpdate = $schedule->collection_time <= $currentTime;
                $this->info("   Schedule #{$schedule->id}: {$schedule->collection_time} <= {$currentTime} = " . ($shouldUpdate ? 'YES' : 'NO'));
            }
            
            return Command::SUCCESS;

        } catch (\Exception $e) {
            $this->error("Error updating schedule statuses: " . $e->getMessage());
            return Command::FAILURE;
        }
    }
}