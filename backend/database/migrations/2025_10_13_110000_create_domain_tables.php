<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Roles
        Schema::create('roles', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 50)->unique();
            $table->text('description')->nullable();
            $table->json('permissions')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // Permissions
        Schema::create('permissions', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100)->unique();
            $table->text('description')->nullable();
            $table->string('module', 50)->nullable();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('role_id', 36)->nullable();
            $table->char('permission_id', 36)->nullable();
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('permissions')->onDelete('cascade');
        });

        // Membership levels
        Schema::create('membership_levels', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->integer('min_points')->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0.00);
            $table->text('benefits')->nullable();
            $table->string('color_code', 7)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        // User profiles (FK to Laravel users BIGINT)
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->text('avatar_url')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('district', 100)->nullable();
            $table->json('preferences')->nullable();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Cities, districts, cinemas
        Schema::create('cities', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100);
            $table->string('code', 10)->unique();
            $table->boolean('is_active')->default(true);
        });

        Schema::create('districts', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('city_id', 36)->nullable();
            $table->string('name', 100);
            $table->string('code', 10)->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreign('city_id')->references('id')->on('cities');
        });

        Schema::create('cinemas', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 255);
            $table->char('city_id', 36)->nullable();
            $table->char('district_id', 36)->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('timezone', 50)->default('Asia/Ho_Chi_Minh');
            $table->json('opening_hours')->nullable();
            $table->json('facilities')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->foreign('city_id')->references('id')->on('cities');
            $table->foreign('district_id')->references('id')->on('districts');
        });

        // Auditoriums & seats
        Schema::create('auditoriums', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('cinema_id', 36)->nullable();
            $table->string('code', 50)->nullable();
            $table->string('name', 255)->nullable();
            $table->integer('row_count');
            $table->integer('col_count');
            $table->json('seat_map')->nullable();
            $table->integer('capacity')->storedAs('row_count * col_count');
            $table->enum('screen_type', ['2D', '3D', 'IMAX', '4DX', 'SCREENX'])->nullable();
            $table->string('sound_system', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->string('screen_size', 50)->nullable(); // Kích thước màn hình
            $table->text('description')->nullable();
            $table->foreign('cinema_id')->references('id')->on('cinemas')->onDelete('cascade');
        });

        Schema::create('seat_types', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 100)->nullable();
            $table->decimal('price_modifier', 8, 2)->default(0.00);
            $table->string('color_code', 7)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('seats', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('auditorium_id', 36);
            $table->string('row_label', 10);
            $table->integer('col_index');
            $table->string('seat_label', 20);
            $table->char('seat_type_id', 36)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_vip')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['auditorium_id', 'seat_label']);
            $table->foreign('auditorium_id')->references('id')->on('auditoriums')->onDelete('cascade');
            $table->foreign('seat_type_id')->references('id')->on('seat_types');
        });

        // Movies & content
        Schema::create('genres', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('countries', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100);
            $table->string('code', 10)->unique();
            $table->text('flag_url')->nullable();
            $table->timestamps();
        });

        if (!Schema::hasTable('movies')) {
            Schema::create('movies', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->charset = 'utf8mb4';
                $table->collation = 'utf8mb4_unicode_ci';
                $table->char('id', 36)->primary();
                $table->string('title', 255);
                $table->string('original_title', 255)->nullable();
                $table->string('slug', 255)->unique()->nullable();
                $table->integer('duration_min')->nullable();
                $table->string('director', 255)->nullable();
                $table->text('cast')->nullable();
                $table->char('genre_id', 36)->nullable();
                $table->char('country_id', 36)->nullable();
                $table->string('language', 50)->nullable();
                $table->string('subtitle_language', 50)->nullable();
                $table->string('rating', 20)->nullable();
                $table->enum('age_rating', ['P', 'K', 'T13', 'T16', 'C18'])->nullable();
                $table->text('poster_url')->nullable();
                $table->text('banner_url')->nullable();
                $table->text('trailer_url')->nullable();
                $table->json('gallery')->nullable();
                $table->text('description')->nullable();
                $table->text('synopsis')->nullable();
                $table->date('release_date')->nullable();
                $table->date('end_date')->nullable();
                $table->enum('status', ['coming_soon', 'now_showing', 'archived'])->default('coming_soon');
                $table->decimal('imdb_rating', 3, 1)->nullable();
                $table->integer('view_count')->default(0);
                $table->boolean('is_featured')->default(false);
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
                $table->foreign('genre_id')->references('id')->on('genres');
                $table->foreign('country_id')->references('id')->on('countries');
            });
        }

        Schema::create('movie_genres', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('movie_id', 36);
            $table->char('genre_id', 36);

            $table->charset = 'utf8mb4';
            $table->collation = 'utf8mb4_unicode_ci';

            $table->foreign('movie_id')->references('id')->on('movies')->onDelete('cascade');
            $table->foreign('genre_id')->references('id')->on('genres')->onDelete('cascade');
        });

        // Ticket types & pricing
        Schema::create('ticket_types', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 100)->nullable();
            $table->decimal('base_price', 10, 2)->default(0.00);
            $table->boolean('refundable')->default(false);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('pricing_rules', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 255)->nullable();
            $table->char('cinema_id', 36)->nullable();
            $table->char('auditorium_id', 36)->nullable();
            $table->char('movie_id', 36)->nullable();
            $table->enum('day_of_week', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])->nullable();
            $table->time('time_start')->nullable();
            $table->time('time_end')->nullable();
            $table->decimal('price_modifier', 8, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('cinema_id')->references('id')->on('cinemas');
            $table->foreign('auditorium_id')->references('id')->on('auditoriums');
            $table->foreign('movie_id')->references('id')->on('movies');
        });

        // Showtimes
        Schema::create('showtimes', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('movie_id', 36);
            $table->char('cinema_id', 36);
            $table->char('auditorium_id', 36);
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->string('format', 50)->nullable();
            $table->string('language', 50)->nullable();
            $table->decimal('base_price', 10, 2);
            $table->integer('capacity')->nullable();
            $table->integer('available_seats')->nullable();
            $table->enum('status', ['scheduled', 'cancelled', 'finished', 'sold_out'])->default('scheduled');
            $table->boolean('is_3d')->default(false);
            $table->boolean('is_imax')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('movie_id')->references('id')->on('movies');
            $table->foreign('cinema_id')->references('id')->on('cinemas');
            $table->foreign('auditorium_id')->references('id')->on('auditoriums');
        });

        // Promotions
        Schema::create('promotions', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('code', 50)->unique();
            $table->string('name', 255)->nullable();
            $table->text('description')->nullable();
            $table->enum('discount_type', ['percentage', 'fixed_amount', 'buy_x_get_y'])->nullable();
            $table->decimal('discount_value', 10, 2)->nullable();
            $table->decimal('min_amount', 10, 2)->nullable();
            $table->decimal('max_discount', 10, 2)->nullable();
            $table->integer('usage_limit')->nullable();
            $table->integer('used_count')->default(0);
            $table->integer('user_limit')->default(1);
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('applicable_movies')->nullable();
            $table->json('applicable_cinemas')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('user_promotions', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->char('promotion_id', 36);
            $table->timestamp('used_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('promotion_id')->references('id')->on('promotions');
        });

        // Bookings & seats & payments
        Schema::create('bookings', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('booking_code', 50)->unique();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->char('showtime_id', 36);
            $table->decimal('total_amount', 12, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('final_amount', 12, 2);
            $table->dateTime('payment_due')->nullable();
            $table->enum('status', ['pending', 'paid', 'cancelled', 'refunded', 'expired'])->default('pending');
            $table->string('payment_method', 50)->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('showtime_id')->references('id')->on('showtimes');
        });

        Schema::create('booked_seats', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('booking_id', 36);
            $table->char('seat_id', 36);
            $table->string('seat_label_snapshot', 50)->nullable();
            $table->char('seat_type_id', 36)->nullable();
            $table->char('ticket_type_id', 36)->nullable();
            $table->decimal('unit_price', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0.0);
            $table->decimal('final_price', 10, 2);
            $table->string('ticket_code', 200)->unique()->nullable();
            $table->text('qr_code')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('seat_id')->references('id')->on('seats');
            $table->foreign('seat_type_id')->references('id')->on('seat_types');
            $table->foreign('ticket_type_id')->references('id')->on('ticket_types');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('booking_id', 36);
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('method', 50)->nullable();
            $table->enum('status', ['initiated', 'success', 'failed', 'refunded', 'cancelled'])->nullable();
            $table->string('provider', 50)->nullable();
            $table->string('provider_ref', 255)->nullable();
            $table->string('transaction_id', 255)->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('booking_id')->references('id')->on('bookings');
        });

        Schema::create('transaction_logs', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->char('booking_id', 36)->nullable();
            $table->string('action', 100)->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->decimal('balance_after', 12, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('booking_id')->references('id')->on('bookings');
        });

        // Reviews
        Schema::create('reviews', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->char('movie_id', 36);
            $table->char('booking_id', 36)->nullable();
            $table->integer('rating');
            $table->string('title', 255)->nullable();
            $table->text('comment')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->integer('helpful_count')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('movie_id')->references('id')->on('movies');
            $table->foreign('booking_id')->references('id')->on('bookings');
        });

        Schema::create('review_helpful', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('review_id', 36);
            $table->unsignedBigInteger('user_id');
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users');
        });

        // Notification templates & notifications
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100)->nullable();
            $table->enum('type', ['email', 'sms', 'push', 'in_app'])->nullable();
            $table->string('subject', 255)->nullable();
            $table->text('content')->nullable();
            $table->json('variables')->nullable();
            $table->boolean('is_active')->default(true);
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->unsignedBigInteger('user_id');
            $table->char('template_id', 36)->nullable();
            $table->string('title', 255)->nullable();
            $table->text('content')->nullable();
            $table->enum('type', ['booking', 'promotion', 'system', 'payment'])->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('template_id')->references('id')->on('notification_templates');
        });

        // Food & beverages
        Schema::create('food_categories', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
        });

        Schema::create('food_items', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('category_id', 36)->nullable();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->text('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_popular')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('category_id')->references('id')->on('food_categories');
        });

        Schema::create('booking_food', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('booking_id', 36);
            $table->char('food_item_id', 36);
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('booking_id')->references('id')->on('bookings')->onDelete('cascade');
            $table->foreign('food_item_id')->references('id')->on('food_items');
        });

        // System settings & logs
        Schema::create('system_settings', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('setting_key', 100)->unique();
            $table->text('setting_value')->nullable();
            $table->enum('data_type', ['string', 'number', 'boolean', 'json'])->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        Schema::create('system_logs', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->enum('level', ['info', 'warning', 'error', 'debug'])->nullable();
            $table->text('message')->nullable();
            $table->json('context')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('system_settings');
        Schema::dropIfExists('booking_food');
        Schema::dropIfExists('food_items');
        Schema::dropIfExists('food_categories');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('notification_templates');
        Schema::dropIfExists('review_helpful');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('transaction_logs');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('booked_seats');
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('user_promotions');
        Schema::dropIfExists('promotions');
        Schema::dropIfExists('showtimes');
        Schema::dropIfExists('pricing_rules');
        Schema::dropIfExists('ticket_types');
        Schema::dropIfExists('movie_genres');
        Schema::dropIfExists('movies');
        Schema::dropIfExists('countries');
        Schema::dropIfExists('genres');
        Schema::dropIfExists('seats');
        Schema::dropIfExists('seat_types');
        Schema::dropIfExists('auditoriums');
        Schema::dropIfExists('cinemas');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('membership_levels');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
