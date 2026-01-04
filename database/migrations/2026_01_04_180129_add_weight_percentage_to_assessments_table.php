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
        Schema::table('assessments', function (Blueprint $table) {
            // Weight percentage for final exam (e.g., 80 means final exam is worth 80% of final score)
            // Only used for final_exam type, defaults to 50 for backward compatibility
            $table->integer('weight_percentage')->default(50)->after('is_remedial');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assessments', function (Blueprint $table) {
            $table->dropColumn('weight_percentage');
        });
    }
};
