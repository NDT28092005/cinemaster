<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Illuminate\Support\Str;

class GoogleController extends Controller
{
    public function handleGoogleCallback(Request $request)
    {
        $token = $request->input('token');

        if (!$token) {
            return response()->json(['error' => 'Missing token'], 400);
        }

        // Gọi Google API để xác thực token
        $googleUser = Http::get("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={$token}");

        if ($googleUser->failed()) {
            return response()->json(['error' => 'Invalid Google token'], 401);
        }

        $data = $googleUser->json();
        $email = $data['email'] ?? null;
        $googleId = $data['sub'] ?? null;

        if (!$email || !$googleId) {
            return response()->json(['error' => 'Email or Google ID missing'], 400);
        }

        // Tìm user theo email trước
        $user = User::where('email', $email)->first();

        if ($user) {
            // Nếu đã có email nhưng chưa có google_id → cập nhật google_id
            if (!$user->google_id) {
                $user->google_id = $googleId;
                $user->save();
            }
        } else {
            // Nếu email chưa có → tạo mới user
            $user = User::create([
                'name' => $data['name'] ?? 'Google User',
                'email' => $email,
                'google_id' => $googleId,
                'password' => bcrypt(Str::random(16)),
                'email_verified_at' => now(), // ✅ Google đã xác thực email
            ]);
        }

        // Tạo token để frontend lưu
        $accessToken = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'access_token' => $accessToken,
            'user' => $user,
        ]);
    }
}