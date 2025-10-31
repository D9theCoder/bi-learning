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
        if (!Schema::hasColumn('rewards', 'rarity')) {
            Schema::table('rewards', function (Blueprint $table) {
                $table->enum('rarity', ['common', 'rare', 'epic', 'legendary'])->default('common')->after('category');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('rewards', 'rarity')) {
            Schema::table('rewards', function (Blueprint $table) {
                $table->dropColumn('rarity');
            });
        }
    }
};
