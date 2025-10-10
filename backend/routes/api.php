<?php
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\GoogleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

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
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/me', [AuthenticationController::class, 'me']);
    Route::get('/logout', [AuthenticationController::class, 'logout']);
});