<?php

use App\Models\User;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\admin\DashboardController;
use App\Http\Controllers\AuthenticationController;
use App\Http\Controllers\RegisterController;
use App\Http\Controllers\GoogleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\Auth\AdminAuthController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\UserAddressController;
use App\Http\Controllers\Api\UserPreferenceController;
use App\Http\Controllers\Api\UserAnniversaryController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OccasionController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductReviewController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\PromotionUsageController;


Route::middleware('auth:sanctum')->group(function () {
    Route::post('/chat/start', [ChatController::class, 'start']);
    Route::get('/chat/messages/{id}', [ChatController::class, 'messages']);
    Route::post('/chat/send', [ChatController::class, 'send']);
});

Route::post('/orders/calc-shipping', [OrderController::class, 'calcShipping']);
Route::post('/orders/mark-paid', [OrderController::class, 'markPaid']);
// Route::post('/ghtk/webhook', [GHTKWebhookController::class, 'updateStatus']);
// Promotions
Route::apiResource('promotions', PromotionController::class);
Route::get('promotions/{promotion}/usages', [PromotionController::class, 'usages']);

Route::prefix('admin')->group(function () {
    // 🔹 Promotion Usage
    Route::get('/promotion-usage', [PromotionUsageController::class, 'index']);
    Route::get('/promotion-usage/export', [PromotionUsageController::class, 'export']);
    Route::get('/promotion-usage/dashboard', [PromotionUsageController::class, 'dashboard']);
    Route::post('/promotion-usage', [PromotionUsageController::class, 'store']);
    Route::get('/promotion-usage/{id}', [PromotionUsageController::class, 'show']);
    Route::put('/promotion-usage/{id}', [PromotionUsageController::class, 'update']);
    Route::delete('/promotion-usage/{id}', [PromotionUsageController::class, 'destroy']);

    // 🔹 Referrals
    Route::get('/referrals', [ReferralController::class, 'index']);
    Route::get('/referrals/export', [ReferralController::class, 'export']);
    Route::get('/referrals/dashboard', [ReferralController::class, 'dashboard']);
    Route::post('/referrals', [ReferralController::class, 'store']);
    Route::get('/referrals/{id}', [ReferralController::class, 'show']);
    Route::put('/referrals/{id}', [ReferralController::class, 'update']);
    Route::delete('/referrals/{id}', [ReferralController::class, 'destroy']);
});

// Public referral endpoints
Route::post('/referrals/validate', [ReferralController::class, 'validateCode']);
Route::middleware('auth:sanctum')->post('/referrals/use', [ReferralController::class, 'use']);

//cart
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/cart/update', [CartController::class, 'updateQuantity']);
    Route::delete('/cart/remove', [CartController::class, 'removeItem']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/checkout', [CartController::class, 'checkout']);
    Route::delete('/cart/clear-cart', [CartController::class, 'clearCart']);
});
// Orders
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/export', [OrderController::class, 'export']);
Route::post('/orders/import', [OrderController::class, 'import']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

// Payments
Route::get('/payments', [PaymentController::class, 'index']);
Route::put('/payments/{id}/status', [PaymentController::class, 'updateStatus']);
// Proxy for Google Apps Script to bypass CORS
Route::get('/sheet-proxy', [PaymentController::class, 'sheetProxy']);

Route::prefix('reviews')->group(function () {
    Route::get('/', [ProductReviewController::class, 'index']);
    Route::post('/', [ProductReviewController::class, 'store']);
    Route::get('/{productReview}', [ProductReviewController::class, 'show']);
    Route::put('/{productReview}', [ProductReviewController::class, 'update']);
    Route::delete('/{productReview}', [ProductReviewController::class, 'destroy']);

    // Chặn / bỏ chặn review
    Route::patch('/{productReview}/block', [ProductReviewController::class, 'block']);
    Route::patch('/{productReview}/unblock', [ProductReviewController::class, 'unblock']);
});
Route::apiResource('categories', CategoryController::class);
Route::apiResource('occasions', OccasionController::class);
Route::apiResource('products', ProductController::class);
Route::get('products/{id}', [ProductController::class, 'show']);
Route::apiResource('product-reviews', ProductReviewController::class);

// Addresses
Route::prefix('users/{user_id}/addresses')->group(function () {
    Route::get('/', [UserAddressController::class, 'index']);
    Route::post('/', [UserAddressController::class, 'store']);
    Route::get('/{id}', [UserAddressController::class, 'show']);
    Route::put('/{id}', [UserAddressController::class, 'update']);
    Route::delete('/{id}', [UserAddressController::class, 'destroy']);
});

// Preferences (1 user only)
Route::prefix('users/{user_id}/preferences')->group(function () {
    Route::get('/', [UserPreferenceController::class, 'index']);
    Route::post('/', [UserPreferenceController::class, 'store']);
    Route::get('/{id}', [UserPreferenceController::class, 'show']);
    Route::put('/{id}', [UserPreferenceController::class, 'update']);
    Route::delete('/{id}', [UserPreferenceController::class, 'destroy']);
});

// Anniversaries
Route::get('/users/{user}/anniversaries', [UserAnniversaryController::class, 'index']);
Route::get('/users/{user}/anniversaries/{anniversary}', [UserAnniversaryController::class, 'show']); // <- Thêm dòng này
Route::post('/users/{user}/anniversaries', [UserAnniversaryController::class, 'store']);
Route::put('/users/{user}/anniversaries/{anniversary}', [UserAnniversaryController::class, 'update']);
Route::delete('/users/{user}/anniversaries/{anniversary}', [UserAnniversaryController::class, 'destroy']);

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{user}', [UserController::class, 'show']);
Route::post('/users', [UserController::class, 'store']);
Route::put('/users/{user}', [UserController::class, 'update']);
Route::delete('/users/{user}', [UserController::class, 'destroy']);
Route::post('/users/{user}/avatar', [UserController::class, 'updateAvatar']);
    Route::put('/users/{user}/password', [UserController::class, 'updatePassword']);
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
Route::group(['middleware' => ['auth:sanctum']], function () {
    Route::get('/me', [AuthenticationController::class, 'me']);
    Route::get('/logout', [AuthenticationController::class, 'logout']);
});
