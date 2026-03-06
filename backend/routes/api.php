<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Models\Submission;

Route::prefix('v1')->name('v1.')->group(function () {

    // Public endpoints
    Route::get('/health', fn () => response()->json(['status' => 'ok'], 200))
        ->name('health');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1')
        ->name('auth.login');

    Route::post('/register', [AuthController::class, 'register'])
        ->middleware('throttle:5,1')
        ->name('auth.register');

    Route::post('/oauth/google', [AuthController::class, 'oauthGoogle'])
        ->middleware('throttle:10,1')
        ->name('auth.google');

    // Protected endpoints
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/logout', [AuthController::class, 'logout'])
            ->name('auth.logout');

        Route::get('/me', function (Request $request) {
            return response()->json([
                'user' => $request->user(),
            ]);
        })->name('auth.me');

        // Submissions
        Route::post('/submit', [SubmissionController::class, 'store'])
            ->name('submissions.store');

        Route::get('/my-submissions', function (Request $request) {
            return response()->json(
                $request->user()->submissions()->latest()->get()
            );
        })->name('submissions.mine');

        // ADMIN ROUTES
        Route::middleware('role:admin')->group(function () {
            Route::get('/admin/dashboard', fn () => response()->json([
                'message' => 'Welcome Admin',
            ]))->name('admin.dashboard');

            Route::get('/admin/submissions', function () {
                return response()->json(
                    Submission::with('user')->latest()->get()
                );
            })->name('admin.submissions.index');

            // Update status submission
            Route::patch('/admin/submissions/{submission}/status', function (Request $request, Submission $submission) {
                $request->validate([
                    'status' => 'required|in:pending,review,approved,rejected',
                ]);
                $submission->update(['status' => $request->status]);
                return response()->json([
                    'message' => 'Status updated',
                    'data'    => $submission->load('user'),
                ]);
            })->name('admin.submissions.status');
        });

        // USER ROUTES
        Route::middleware('role:user')->group(function () {
            Route::get('/user/dashboard', fn () => response()->json([
                'message' => 'Welcome User',
            ]))->name('user.dashboard');
        });
    });

    Route::fallback(fn () => response()->json([
        'message' => 'Endpoint not found',
    ], 404))->name('fallback');
});