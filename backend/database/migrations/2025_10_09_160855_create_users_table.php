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
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Khóa chính

            $table->string('name'); // Tên người dùng
            $table->string('email')->unique(); // Email duy nhất
            $table->string('password'); // Mật khẩu mã hóa
            $table->string('phone', 15)->nullable(); // Số điện thoại
            $table->string('avatar')->nullable(); // Ảnh đại diện (link URL hoặc path)
            $table->enum('role', ['user', 'admin'])->default('user'); // Vai trò hệ thống
            $table->boolean('is_active')->default(true); // Trạng thái tài khoản
            $table->timestamp('email_verified_at')->nullable(); // Thời gian xác minh email

            $table->rememberToken(); // Token ghi nhớ đăng nhập
            $table->timestamps(); // created_at & updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
