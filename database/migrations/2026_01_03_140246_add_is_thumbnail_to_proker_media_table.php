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
        Schema::table('proker_media', function (Blueprint $table) {
            $table->boolean('is_thumbnail')->default(false)->after('caption');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proker_media', function (Blueprint $table) {
            $table->dropColumn('is_thumbnail');
        });
    }
};
