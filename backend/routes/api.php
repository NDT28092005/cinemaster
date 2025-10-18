<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\GoogleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\MovieController;
use App\Http\Controllers\Api\ShowtimeController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Api\GenreController;
use App\Http\Controllers\Api\CountryController;
use App\Http\Controllers\Api\CinemaController;
use App\Http\Controllers\Api\AuditoriumController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\DistrictController;

Route::get('/cities', [CityController::class, 'index']);
Route::get('/districts', [DistrictController::class, 'index']);
Route::get('/cinemas', [CinemaController::class, 'index']);
Route::get('/auditoriums', [AuditoriumController::class, 'index']);
Route::get('/genres', [GenreController::class, 'index']);
Route::post('/genres', [GenreController::class, 'store']);

Route::get('/countries', [CountryController::class, 'index']);
Route::post('/countries', [CountryController::class, 'store']);

Route::prefix('movies')->group(function () {
    Route::get('/', [MovieController::class, 'index']);        // Danh sách phim
    Route::get('/{id}', [MovieController::class, 'show']);     // Chi tiết phim
    Route::post('/', [MovieController::class, 'store']);       // Thêm phim
    Route::put('/{id}', [MovieController::class, 'update']);   // Cập nhật
    Route::delete('/{id}', [MovieController::class, 'destroy']); // Xóa
});

Route::prefix('showtimes')->group(function () {
    Route::get('/', [ShowtimeController::class, 'index']);
    Route::get('/{id}', [ShowtimeController::class, 'show']);
    Route::post('/', [ShowtimeController::class, 'store']);
    Route::put('/{id}', [ShowtimeController::class, 'update']);
    Route::delete('/{id}', [ShowtimeController::class, 'destroy']);
});
Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::post('/bookings/{id}/refund', [BookingController::class, 'refund']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);
});
Route::middleware('auth:sanctum')->get('/admin/me', [AdminAuthController::class, 'me']);
// -------------------------
// Public Routes
// -------------------------
Route::post('/register', [RegisterController::class, 'register']); // Đăng ký email + gửi mail
Route::post('/login', [AuthenticationController::class, 'login']); // Login email/password

// Google OAuth
Route::get('/auth/google', [GoogleController::class, 'redirectToGoogle']); // Redirect user đến Google
Route::post('/auth/google/callback', [GoogleController::class, 'handleGoogleCallback']); // Nhận token từ frontend
Route::post('/email/verify', function (Request $request) {
    $request->validate([
        'id' => 'required|integer|exists:users,id',
        'token' => 'required|string',
    ]);

    $user = User::find($request->id);

    // Kiểm tra token
    if (!Hash::check($user->email, $request->token)) {
        return response()->json(['status' => false, 'message' => 'Token xác nhận không hợp lệ'], 400);
    }

    // Đánh dấu verified
    $user->email_verified_at = now();
    $user->save();

    return response()->json(['status' => true, 'message' => 'Email đã được xác nhận']);
});
// -------------------------
// Protected Routes (yêu cầu login)
// -------------------------
Route::group(['middleware' => ['auth:sanctum']], function() {
    Route::get('/me', [AuthenticationController::class, 'me']);
    Route::get('/logout', [AuthenticationController::class, 'logout']);
});