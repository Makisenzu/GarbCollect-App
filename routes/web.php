<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\admin\LocationRoute\RouteController;
use App\Http\Controllers\admin\resident\AreaController;
use App\Http\Controllers\admin\truck\DriverController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return Inertia::render('Users/Home');
    // return Inertia::render('Auth/Login', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);
});

Route::get('/employee/login', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
    
    Route::middleware('roles:admin')->group(function () {

        //Admin Routes
        // DashBoard
        Route::get('Admin/adminDashboard', function () {
            return Inertia::render('Admin/adminDashboard');
        })->name('admin.dashboard');


        //Driver Routes
        Route::get('admin/drivers', [DriverController::class, 'index'])->name('admin.drivers');
        Route::post('admin/drivers/add', [DriverController::class, 'addDriver'])->name('admin.drivers.add');
        // Route::get('/getUsers', [DriverController::class, 'getUserInfo']);
        // Route::get('/getDrivers', [DriverController::class, 'getDriverInfo']);
        Route::post('/admin/Driver/add', [DriverController::class, 'addDriver']);

        //Resident Routes
        Route::get('Admin/residents', function () {
            return Inertia::render('Admin/residents');
        })->name('admin.residents');

        Route::get('/municipalities', [AreaController::class, 'index']);
        Route::get('/municipalities/{municipality_id}/barangay', [AreaController::class, 'showBaranggay']);
        Route::get('/baranggay/{baranggayId}/purok', [AreaController::class, 'showPurok']);
        Route::post('/municipality/baranggay/addBarangay', [AreaController::class, 'addBarangay']);
        Route::post('/municipality/baranggay/purok/addPurok', [AreaController::class, 'addPurok']);
        Route::delete('/municipality/barangay/{id}/delete', [AreaController::class, 'deleteBarangay']);
        Route::delete('/municipality/barangay/purok/{id}/delete', [AreaController::class, 'deletePurok']);
        Route::put('/municipality/barangay/editBarangay/{id}', [AreaController::class, 'editBarangay']);
        Route::put('/municipality/barangay/editPurok/{id}', [AreaController::class, 'editPurok']);

        //Truck Routes
        Route::get('Admin/truckRoutes', [RouteController::class, 'index'
        ])->name('admin.truckRoutes');

        Route::get('/municipality/barangay/purok/sites', [RouteController::class, 'getSiteLocation']);
        Route::post('/municipality/barangay/addNewGarbageSite', [RouteController::class, 'addCollectionRoute']);

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
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
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
