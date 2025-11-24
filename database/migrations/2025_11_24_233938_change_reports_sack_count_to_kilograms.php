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
        Schema::table('reports', function (Blueprint $table) {
            $table->renameColumn('sack_count', 'kilograms');
        });
        
        // Change column type to decimal
        Schema::table('reports', function (Blueprint $table) {
            $table->decimal('kilograms', 8, 2)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->integer('kilograms')->change();
        });
        
        Schema::table('reports', function (Blueprint $table) {
            $table->renameColumn('kilograms', 'sack_count');
        });
    }
};
