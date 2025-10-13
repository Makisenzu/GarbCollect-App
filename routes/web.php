<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use App\Models\Schedule;
use function Pest\Laravel\get;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ComplaintsController;
use App\Http\Controllers\admin\Ai\ReviewController;
use App\Http\Controllers\admin\truck\DriverController;

use App\Http\Controllers\admin\resident\AreaController;

use App\Http\Controllers\admin\truck\ScheduleController;
use App\Http\Controllers\admin\dashboard\DashboardController;
use App\Http\Controllers\admin\LocationRoute\RouteController;
use App\Http\Controllers\truck\EmployeeController;
use App\Http\Controllers\User\PublicSchedule;
use App\Http\Controllers\User\PublicScheduleController;
use App\Http\Controllers\User\UserController;

Route::get('/', function () {
    return Inertia::render('Users/Home');
    // return Inertia::render('Auth/Login', [
    //     'canLogin' => Route::has('login'),
    //     'canRegister' => Route::has('register'),
    //     'laravelVersion' => Application::VERSION,
    //     'phpVersion' => PHP_VERSION,
    // ]);
})->name('user.dashboard');

Route::get('/employee/login', function () {
    return Inertia::render('Auth/Login', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('loginPage');

//Public route
Route::post('/reviews', [ReviewController::class, 'store']);


Route::get('/getBarangay/schedule/{id}', [PublicScheduleController::class, 'displaySchedule']);
Route::get('/barangay/schedule/show', [PublicScheduleController::class, 'showPublicSchedule'])->name('barangay.schedule');
Route::get('/barangay/routes', [UserController::class, 'showBarangayRoutes'])->name('barangay.routes');
Route::get('/getBarangay', [UserController::class, 'getBarangay']);
Route::get('/barangay/schedule/{id}', [UserController::class, 'getBarangaySchedule'])->name('getschedule.barangay');
Route::get('/barangay/getSites/{id}', [UserController::class, 'getActiveSite']);
Route::get('/site', [UserController::class, 'showMyLocation'])->name('site.location');

Route::middleware(['auth', 'verified'])->group(function () {
    

    //Employee routes
    Route::middleware('roles:employee')->group(function () {
        Route::get('/dashboard', [EmployeeController::class, 'index'])->name('dashboard');
        Route::get('/schedules/{id}', [EmployeeController::class, 'show']);
        Route::get('/barangay/{barangayId}/sites', [EmployeeController::class, 'getActiveSites']);
    });
    

    //Admin Routes
    Route::middleware('roles:admin')->group(function () {
        Route::get('Admin/adminDashboard', [DashboardController::class, 'index'])->name('admin.dashboard');


        //Driver Routes
        Route::get('admin/drivers', [DriverController::class, 'index'])->name('admin.drivers');
        Route::post('admin/drivers/add', [DriverController::class, 'addDriver'])->name('admin.drivers.add');
        Route::post('/admin/Driver/add', [DriverController::class, 'addDriver']);
        Route::get('/admin/getBarangay/{id}', [DriverController::class, 'getBarangayData']);
        Route::post('/admin/driver/assign', [DriverController::class, 'assignDriver'])->name('admin.driverAssign');
        Route::delete('/delete/driver/{id}', [DriverController::class, 'destroy'])->name('admin.deleteDriver');
        Route::patch('/admin/driver/schedule/{id}', [DriverController::class, 'editDriverSchedule'])->name('admin.editDriverSchedule');
        Route::patch('/admin/drivers/{id}', [DriverController::class, 'editDriver'])->name('admin.drivers.update');
        Route::delete('/admin/driver/schedule/{id}', [DriverController::class, 'deleteDriverSchedule'])->name('admin.deleteDriverSchedule');

        //Resident Routes
        Route::get('/municipalities', [AreaController::class, 'index'])->name('admin.residents');
        Route::get('/municipalities/{municipality_id}/barangay', [AreaController::class, 'showBaranggay']);
        Route::get('/baranggay/{baranggayId}/purok', [AreaController::class, 'showPurok']);
        Route::post('/municipality/baranggay/addBarangay', [AreaController::class, 'addBarangay']);
        Route::post('/municipality/baranggay/purok/addPurok', [AreaController::class, 'addPurok']);
        Route::delete('/municipality/barangay/{id}/delete', [AreaController::class, 'deleteBarangay']);
        Route::delete('/municipality/barangay/purok/{id}/delete', [AreaController::class, 'deletePurok']);
        Route::put('/municipality/barangay/editBarangay/{id}', [AreaController::class, 'editBarangay']);
        Route::put('/municipality/barangay/editPurok/{id}', [AreaController::class, 'editPurok']);
        // Route::get('/municipality/categories', [ComplaintsController::class, 'index']);

        //Truck Routes
        Route::get('Admin/truckRoutes', [RouteController::class, 'index'
        ])->name('admin.truckRoutes');

        Route::get('/admin/schedules', [ScheduleController::class, 'index'])->name('admin.schedules');
        Route::get('/{id}/barangay',[RouteController::class, 'getBarangay']);
        Route::get('/{id}/barangay/purok', [RouteController::class, 'getPurok']);

        Route::get('/municipality/barangay/purok/sites', [RouteController::class, 'getSiteLocation']);
        Route::post('/municipality/barangay/addNewGarbageSite', [RouteController::class, 'addCollectionRoute']);
        Route::patch('/edit/site/{id}', [RouteController::class, 'editSite']);
        Route::delete('/delete/site/{id}', [RouteController::class, 'deleteSite']);

    });
     
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
