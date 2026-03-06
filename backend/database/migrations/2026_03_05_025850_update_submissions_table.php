<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            // Rename kolom lama -> nama baru sesuai frontend
            $table->renameColumn('nama_barang', 'title');
            $table->renameColumn('deskripsi', 'content');

            // Tambah field baru
            $table->string('department')->nullable()->after('content');
            $table->integer('quantity')->nullable()->after('department');
            $table->string('unit')->default('pcs')->after('quantity');
            $table->enum('urgency', ['normal', 'high', 'urgent'])->default('normal')->after('unit');
            $table->string('status')->default('pending')->after('urgency');
        });
    }

    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->renameColumn('title', 'nama_barang');
            $table->renameColumn('content', 'deskripsi');
            $table->dropColumn(['department', 'quantity', 'unit', 'urgency', 'status']);
        });
    }
};