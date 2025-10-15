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
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('fullname')->nullable();
            $table->foreignId('purok_id')->constrained('puroks')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->text('review_content');
            $table->text('suggestion_content');
            $table->unsignedTinyInteger('rate');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->json('moderation_flags')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
