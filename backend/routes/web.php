<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Api\SubmissionController;


// ===============================
// Google OAuth Routes
// ===============================
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])
    ->name('google.login');

Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])
    ->name('google.callback');

// ===============================
// Login View
// ===============================
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

// ===============================
// Dashboard (Protected)
// ===============================
Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware('auth')->name('dashboard');

// ===============================
// Logout
// ===============================
Route::post('/logout', function () {
    Auth::logout();
    return redirect('/login');
})->name('logout');

// ===============================
// Homepage Default
// ===============================
Route::get('/', function () {
    return view('welcome');
});

// ===============================
// Submission Route (Protected, User Only)
// ===============================
Route::middleware('role:user')->post('/submit', [SubmissionController::class, 'store']);
Route::middleware('role:admin')->get('/admin/submissions', [SubmissionController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/submit', [SubmissionController::class, 'store']);

});