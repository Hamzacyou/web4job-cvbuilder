<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;

Route::middleware('api')->group(function () {
    // Handle CORS preflight requests
    Route::options('/admin/dashboard/{path?}', function () {
        return response('', 200)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    })->where('path', '.*');

    Route::get('/admin/dashboard/stats', [DashboardController::class, 'getStats']);
    Route::get('/admin/dashboard/recent-users', [DashboardController::class, 'getRecentUsers']);
    Route::get('/admin/dashboard/registration-activity', [DashboardController::class, 'getRegistrationActivity']);
    Route::get('/admin/dashboard/template-usage', [DashboardController::class, 'getTemplateUsage']);
    Route::get('/admin/dashboard/all', [DashboardController::class, 'getAllDashboardData']);
});
