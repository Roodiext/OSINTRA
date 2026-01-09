<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->enum('category', ['saran_program', 'kritik_feedback', 'laporan_masalah', 'ide_usulan', 'komplain'])->default('saran_program')->after('subject');
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal')->after('category');
            $table->boolean('is_anonymous')->default(false)->after('priority');
            $table->text('reply_message')->nullable()->after('message');
            $table->timestamp('replied_at')->nullable()->after('reply_message');
            $table->unsignedBigInteger('replied_by')->nullable()->after('replied_at');
            $table->foreign('replied_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['replied_by']);
            $table->dropColumn([
                'category',
                'priority',
                'is_anonymous',
                'reply_message',
                'replied_at',
                'replied_by',
            ]);
        });
    }
};
