<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        // Stats
        $stats = [
            'total_users'       => User::where('role', 'user')->count(),
            'total_submissions' => Submission::count(),
            'pending_count'     => Submission::where('status', 'pending')->count(),
            'approved_count'    => Submission::where('status', 'approved')->count(),
            'rejected_count'    => Submission::where('status', 'rejected')->count(),
        ];

        // Trend 7 hari terakhir
        $trend = [];
        for ($i = 6; $i >= 0; $i--) {
            $date  = Carbon::today()->subDays($i);
            $count = Submission::whereDate('created_at', $date)->count();
            $trend[] = [
                'label' => $date->translatedFormat('d M'),
                'value' => $count,
            ];
        }

        // Pengajuan per bulan tahun ini
        $year    = Carbon::now()->year;
        $monthly = [];
        $monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
        for ($m = 1; $m <= 12; $m++) {
            $count = Submission::whereYear('created_at', $year)
                ->whereMonth('created_at', $m)
                ->count();
            $monthly[] = [
                'label' => $monthNames[$m - 1],
                'value' => $count,
            ];
        }

        return response()->json([
            'stats'   => $stats,
            'trend'   => $trend,
            'monthly' => $monthly,
        ]);
    }

    public function users(): JsonResponse
    {
        $users = User::withTrashed()->latest()->get(['id', 'name', 'email', 'role', 'avatar', 'created_at', 'deleted_at']);
        return response()->json($users);
    }

    public function updateRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => 'required|in:user,admin',
        ]);

        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat mengubah role diri sendiri',
            ], 403);
        }

        $user->update(['role' => $request->role]);

        return response()->json([
            'message' => 'Role berhasil diubah',
            'data'    => $user,
        ]);
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'Tidak dapat menghapus akun sendiri',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus',
        ]);
    }

    public function restoreUser(int $id): JsonResponse
    {
        $user = User::withTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'message' => 'User berhasil dipulihkan',
            'data'    => $user,
        ]);
    }

    public function submissions(): JsonResponse
    {
        $submissions = Submission::with([
            'user:id,name,email',
            'workshop',
            'division',
        ])->latest()->get();

        return response()->json($submissions);
    }

    public function updateStatus(Request $request, Submission $submission): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,review,approved,rejected',
        ]);

        $submission->update(['status' => $request->status]);

        try {
            $response = Http::post('http://localhost:3001/emit-status', [
                'user_id'       => $submission->user_id,
                'submission_id' => $submission->id,
                'status'        => $submission->status,
                'title'         => $submission->title,
            ]);
            \Log::info('Socket response: ' . $response->body());
        } catch (\Exception $e) {
            \Log::error('Socket.io emit gagal: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Status updated',
            'data'    => $submission,
        ]);
    }
}