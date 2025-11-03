<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * Lấy danh sách users (có search + phân trang)
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search theo tên hoặc email
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
        }

        // Sắp xếp theo ID tăng dần
        $users = $query->orderBy('id', 'asc')->paginate(10);

        return response()->json($users);
    }

    /**
     * Lấy chi tiết 1 user
     */
    public function show(User $user)
    {
        return response()->json($user);
    }

    /**
     * Tạo user mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:customer,admin,manager',
            'is_active' => 'sometimes|boolean',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'is_active' => $request->has('is_active') ? $request->is_active : true,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user
        ], 201);
    }

    /**
     * Cập nhật thông tin user
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:customer,admin,manager',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'is_active' => $request->has('is_active') ? $request->is_active : $user->is_active,
        ]);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Xoá user
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
