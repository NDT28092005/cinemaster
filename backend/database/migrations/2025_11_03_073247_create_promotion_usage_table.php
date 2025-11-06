<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasTable('promotion_usage')) {
            Schema::create('promotion_usage', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->id('usage_id');
                $table->unsignedBigInteger('promotion_id');
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->timestamps();
                
                // Add foreign key manually to avoid constraint issues
                $table->foreign('promotion_id')->references('id')->on('promotions')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('promotion_usage');
    }
};
