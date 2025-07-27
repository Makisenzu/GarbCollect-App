<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RouteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});
// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
    Route::middleware('roles:admin')->group(function () {
        Route::get('Admin/adminDashboard', function () {
            return Inertia::render('Admin/adminDashboard');
        })->name('admin.dashboard');

        Route::get('Admin/drivers', function () {
            return Inertia::render('Admin/drivers');
        })->name('admin.drivers');

        Route::get('Admin/residents', function () {
            return Inertia::render('Admin/residents');
        })->name('admin.residents');


        Route::get('Admin/truckRoutes', [RouteController::class, 'index'
        ])->name('admin.truckRoutes');
        
        // Route::get('Admin/truckRoutes', function () {
        //     return Inertia::render('Admin/truckRoutes');
        // })->name('admin.truckRoutes');
        // Route::get('admin.map', function(){
        //     return Inertia::render('Admin/map');
        // })->name('admin.maps');
    });
    
    // // Driver-only routes
    // Route::middleware('role:driver')->group(function () {
    //     Route::get('/driver/dashboard', function () {
    //         return Inertia::render('Driver/Dashboard');
    //     })->name('driver.dashboard');
    // });
    
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__.'/auth.php';
