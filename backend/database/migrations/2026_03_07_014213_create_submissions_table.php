<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Relasi ke workshop & divisi
            $table->foreignId('workshop_id')->nullable()->constrained('workshops')->nullOnDelete();
            $table->foreignId('division_id')->nullable()->constrained('divisions')->nullOnDelete();

            // Info barang
            $table->string('title');                  // nama barang
            $table->integer('quantity')->nullable();  // jumlah
            $table->string('unit')->default('pcs');   // satuan jumlah
            $table->text('spesifikasi')->nullable();  // spesifikasi
            $table->text('kegunaan')->nullable();     // kegunaan
            $table->text('content')->nullable();      // keterangan tambahan

            // Prioritas dari user
            $table->enum('urgency', ['standart', 'urgent', 'emergency'])->default('standart');

            // PIC & kontak
            $table->string('pic')->nullable();                  // PIC
            $table->string('nomor_telepon')->nullable();        // nomor telepon pengaju

            // Referensi
            $table->string('referensi_link')->nullable();       // referensi link
            $table->string('referensi_gambar')->nullable();     // path file upload

            // Status oleh admin
            $table->enum('status', ['pending', 'review', 'approved', 'rejected'])->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};