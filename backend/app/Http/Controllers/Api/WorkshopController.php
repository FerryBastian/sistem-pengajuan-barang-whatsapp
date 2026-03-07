<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use Illuminate\Http\Request;

class WorkshopController extends Controller
{
    // GET /api/v1/workshops — public (untuk dropdown di form)
    public function index()
    {
        $workshops = Workshop::where('is_active', true)->get();
        return response()->json($workshops);
    }

    // GET /api/v1/admin/workshops — admin (semua termasuk nonaktif)
    public function adminIndex()
    {
        $workshops = Workshop::withTrashed()->get();
        return response()->json($workshops);
    }

    // POST /api/v1/admin/workshops
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:workshops,name',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $workshop = Workshop::create($request->only(['name', 'description', 'is_active']));

        return response()->json([
            'message' => 'Workshop berhasil dibuat',
            'data'    => $workshop,
        ], 201);
    }

    // PUT /api/v1/admin/workshops/{id}
    public function update(Request $request, $id)
    {
        $workshop = Workshop::withTrashed()->findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255|unique:workshops,name,' . $id,
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $workshop->update($request->only(['name', 'description', 'is_active']));

        return response()->json([
            'message' => 'Workshop berhasil diupdate',
            'data'    => $workshop,
        ]);
    }

    // DELETE /api/v1/admin/workshops/{id} — soft delete
    public function destroy($id)
    {
        $workshop = Workshop::findOrFail($id);
        $workshop->delete();

        return response()->json([
            'message' => 'Workshop berhasil dihapus',
        ]);
    }

    // PATCH /api/v1/admin/workshops/{id}/restore — restore soft delete
    public function restore($id)
    {
        $workshop = Workshop::withTrashed()->findOrFail($id);
        $workshop->restore();

        return response()->json([
            'message' => 'Workshop berhasil dipulihkan',
            'data'    => $workshop,
        ]);
    }
}