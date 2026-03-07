<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\Request;

class DivisionController extends Controller
{
    // GET /api/v1/divisions — public (untuk dropdown di form)
    public function index()
    {
        $divisions = Division::where('is_active', true)->get();
        return response()->json($divisions);
    }

    // GET /api/v1/admin/divisions — admin (semua termasuk nonaktif)
    public function adminIndex()
    {
        $divisions = Division::withTrashed()->get();
        return response()->json($divisions);
    }

    // POST /api/v1/admin/divisions
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:255|unique:divisions,name',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $division = Division::create($request->only(['name', 'description', 'is_active']));

        return response()->json([
            'message' => 'Divisi berhasil dibuat',
            'data'    => $division,
        ], 201);
    }

    // PUT /api/v1/admin/divisions/{id}
    public function update(Request $request, $id)
    {
        $division = Division::withTrashed()->findOrFail($id);

        $request->validate([
            'name'        => 'sometimes|string|max:255|unique:divisions,name,' . $id,
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        $division->update($request->only(['name', 'description', 'is_active']));

        return response()->json([
            'message' => 'Divisi berhasil diupdate',
            'data'    => $division,
        ]);
    }

    // DELETE /api/v1/admin/divisions/{id} — soft delete
    public function destroy($id)
    {
        $division = Division::findOrFail($id);
        $division->delete();

        return response()->json([
            'message' => 'Divisi berhasil dihapus',
        ]);
    }

    // PATCH /api/v1/admin/divisions/{id}/restore — restore soft delete
    public function restore($id)
    {
        $division = Division::withTrashed()->findOrFail($id);
        $division->restore();

        return response()->json([
            'message' => 'Divisi berhasil dipulihkan',
            'data'    => $division,
        ]);
    }
}