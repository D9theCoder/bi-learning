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
        Schema::table('daily_tasks', function (Blueprint $table) {
            $table->integer('xp_reward')->default(10)->after('estimated_minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_tasks', function (Blueprint $table) {
            $table->dropColumn('xp_reward');
        });
    }
};
