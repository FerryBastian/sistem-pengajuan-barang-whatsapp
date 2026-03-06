<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Submission\StoreSubmissionRequest;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SubmissionController extends Controller
{
    public function store(StoreSubmissionRequest $request): JsonResponse
    {
        $user = $request->user();

        $submission = DB::transaction(function () use ($user, $request) {
            return Submission::create([
                'user_id'    => $user->id,
                'title'      => $request->string('title'),
                'content'    => $request->string('content'),
                'department' => $request->string('department') ?: null,
                'quantity'   => $request->integer('quantity'),
                'unit'       => $request->string('unit') ?: 'pcs',
                'urgency'    => $request->string('urgency') ?: 'normal',
                'status'     => 'pending',
            ]);
        });

        $this->sendWhatsAppNotification($submission, $user);

        return response()->json([
            'message' => 'Submission created',
            'data'    => $submission->load('user:id,name,email'),
        ], 201);
    }

    private function sendWhatsAppNotification(Submission $submission, $user): void
    {
        $gowaUrl    = config('services.gowa.url');
        $adminPhone = config('services.gowa.admin_phone');
        $deviceId   = config('services.gowa.device_id');
        $username   = config('services.gowa.username');
        $password   = config('services.gowa.password');

        if (!$gowaUrl || !$adminPhone) {
            Log::info('Gowa skipped: GOWA_URL atau GOWA_ADMIN_PHONE belum diisi');
            return;
        }

        $urgencyLabel = [
            'normal' => '🟢 Normal',
            'high'   => '🟠 Tinggi',
            'urgent' => '🔴 Urgent',
        ];

        $message =
            "*📦 PENGAJUAN BARANG BARU*\n\n" .
            "*Pengaju:* {$user->name}\n" .
            "*Email:* {$user->email}\n" .
            "*Departemen:* " . ($submission->department ?: '-') . "\n" .
            "*Nama Barang:* {$submission->title}\n" .
            "*Jumlah:* {$submission->quantity} {$submission->unit}\n" .
            "*Urgensi:* " . ($urgencyLabel[(string) $submission->urgency] ?? '🟢 Normal') . "\n" .
            "*Keterangan:* {$submission->content}\n\n" .
            "*Tanggal:* " . now()->locale('id')->isoFormat('D MMMM YYYY, HH:mm') . "\n" .
            "*ID Pengajuan:* #{$submission->id}";

        $payload = [
            'device_id' => $deviceId,
            'phone'     => $adminPhone,
            'message'   => $message,
        ];

        Log::info('Gowa payload:', $payload);
        Log::info('Gowa credentials:', ['username' => $username, 'password' => $password ? '***' : 'NULL']);

        try {
            $response = Http::timeout(10)
                ->withBasicAuth($username, $password)
                ->post("{$gowaUrl}/send/message", $payload);

            if ($response->ok()) {
                Log::info('Gowa WA berhasil terkirim');
            } else {
                Log::warning('Gowa WA gagal', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Gowa WA exception: ' . $e->getMessage());
        }
    }
}