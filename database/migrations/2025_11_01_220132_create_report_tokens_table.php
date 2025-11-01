<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportTokensTable extends Migration
{
    public function up()
    {
        Schema::create('report_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained('schedules')->onDelete('cascade');
            $table->string('token', 64)->unique();
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->timestamps();

            $table->index(['schedule_id', 'token']);
            $table->index('expires_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('report_tokens');
    }
}