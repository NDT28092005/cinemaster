<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Extra profile fields
            if (!Schema::hasColumn('users', 'full_name')) {
                $table->string('full_name')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'password_hash')) {
                $table->string('password_hash')->nullable()->after('password');
            }
            if (!Schema::hasColumn('users', 'points')) {
                $table->integer('points')->default(0)->after('password');
            }
            if (!Schema::hasColumn('users', 'total_spent')) {
                $table->decimal('total_spent', 12, 2)->default(0.00)->after('points');
            }
            if (!Schema::hasColumn('users', 'email_verified')) {
                $table->boolean('email_verified')->default(false)->after('email_verified_at');
            }
            if (!Schema::hasColumn('users', 'phone_verified')) {
                $table->boolean('phone_verified')->default(false)->after('email_verified');
            }
            if (!Schema::hasColumn('users', 'last_login')) {
                $table->timestamp('last_login')->nullable()->after('remember_token');
            }
            if (!Schema::hasColumn('users', 'role_id')) {
                $table->char('role_id', 36)->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'membership_level_id')) {
                $table->char('membership_level_id', 36)->nullable()->after('role_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            foreach ([
                'full_name',
                'password_hash',
                'points',
                'total_spent',
                'email_verified',
                'phone_verified',
                'last_login',
                'role_id',
                'membership_level_id',
            ] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};


