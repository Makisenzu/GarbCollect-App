<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('schedules:update-status')->everyMinute();
        
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'roles' => \App\Http\Middleware\CheckUserRole::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'municipality/barangay/addNewGarbageSite',
            '/admin/Driver/add',
            '/admin/getBarangay/{id}',
            '/reviews',
            'auth/google/callback',
        ]);
    
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
