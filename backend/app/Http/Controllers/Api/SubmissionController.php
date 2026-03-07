<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SubmissionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'workshop_id'      => 'nullable|exists:workshops,id',
            'division_id'      => 'nullable|exists:divisions,id',
            'title'            => 'required|string|max:255',
            'quantity'         => 'nullable|integer|min:1',
            'unit'             => 'nullable|string|max:50',
            'spesifikasi'      => 'nullable|string',
            'kegunaan'         => 'required|string',
            'content'          => 'nullable|string',
            'urgency'          => 'required|in:standart,urgent,emergency',
            'pic'              => 'required|string|max:255',
            'nomor_telepon'    => 'nullable|string|max:20',
            'referensi_link'   => 'nullable|url',
            'referensi_gambar' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $user = $request->user();

        $submission = DB::transaction(function () use ($user, $request) {
            $data = [
                'user_id'      => $user->id,
                'workshop_id'  => $request->input('workshop_id'),
                'division_id'  => $request->input('division_id'),
                'title'        => $request->string('title'),
                'quantity'     => $request->integer('quantity'),
                'unit'         => $request->string('unit') ?: 'pcs',
                'spesifikasi'  => $request->string('spesifikasi') ?: null,
                'kegunaan'     => $request->string('kegunaan'),
                'content'      => $request->string('content') ?: null,
                'urgency'      => $request->string('urgency') ?: 'standart',
                'pic'          => $request->string('pic'),
                'nomor_telepon'=> $request->string('nomor_telepon') ?: null,
                'referensi_link' => $request->string('referensi_link') ?: null,
                'status'       => 'pending',
            ];

            // Handle file upload
            if ($request->hasFile('referensi_gambar')) {
                $path = $request->file('referensi_gambar')->store('referensi', 'public');
                $data['referensi_gambar'] = $path;
            }

            return Submission::create($data);
        });

        $this->sendWhatsAppNotification($submission->load(['workshop', 'division']), $user);

        return response()->json([
            'message' => 'Submission created',
            'data'    => $submission->load(['user:id,name,email', 'workshop', 'division']),
        ], 201);
    }

    public function mySubmissions(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()
                ->submissions()
                ->with(['workshop', 'division'])
                ->latest()
                ->get()
        );
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
            'standart'  => '🟢 Standart',
            'urgent'    => '🟠 Urgent',
            'emergency' => '🔴 Emergency',
        ];

        $message =
            "*📦 PENGAJUAN BARANG BARU*\n\n" .
            "*Pengaju:* {$user->name}\n" .
            "*Email:* {$user->email}\n" .
            "*No. Telp:* " . ($submission->nomor_telepon ?: '-') . "\n" .
            "*Workshop:* " . ($submission->workshop->name ?? '-') . "\n" .
            "*Divisi:* " . ($submission->division->name ?? '-') . "\n" .
            "*Nama Barang:* {$submission->title}\n" .
            "*Jumlah:* {$submission->quantity} {$submission->unit}\n" .
            "*Urgensi:* " . ($urgencyLabel[(string) $submission->urgency] ?? '🟢 Standart') . "\n" .
            "*PIC:* " . ($submission->pic ?: '-') . "\n" .
            "*Kegunaan:* {$submission->kegunaan}\n" .
            "*Spesifikasi:* " . ($submission->spesifikasi ?: '-') . "\n" .
            "*Keterangan:* " . ($submission->content ?: '-') . "\n\n" .
            "*Referensi:* https://tokopedia.com/...\n" .
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