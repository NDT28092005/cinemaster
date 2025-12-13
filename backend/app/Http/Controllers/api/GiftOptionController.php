<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WrappingPaper;
use App\Models\DecorativeAccessory;
use App\Models\CardType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class GiftOptionController extends Controller
{
    /**
     * Lấy danh sách giấy gói (public - cho checkout)
     */
    public function getWrappingPapers()
    {
        $papers = WrappingPaper::where('is_active', true)
            ->where('quantity', '>', 0)
            ->orderBy('name')
            ->get();
        
        return response()->json($papers);
    }

    /**
     * Lấy danh sách phụ kiện (public - cho checkout)
     */
    public function getDecorativeAccessories()
    {
        $accessories = DecorativeAccessory::where('is_active', true)
            ->where('quantity', '>', 0)
            ->orderBy('name')
            ->get();
        
        return response()->json($accessories);
    }

    /**
     * Lấy danh sách loại thiệp (public - cho checkout)
     */
    public function getCardTypes()
    {
        $cards = CardType::where('is_active', true)
            ->where('quantity', '>', 0)
            ->orderBy('name')
            ->get();
        
        return response()->json($cards);
    }

    /**
     * Admin: Quản lý giấy gói
     */
    public function indexWrappingPapers()
    {
        $papers = WrappingPaper::orderBy('created_at', 'desc')->get();
        return response()->json($papers);
    }

    public function storeWrappingPaper(Request $request)
    {
        // Xử lý is_active trước khi validate (FormData gửi string)
        $isActive = $request->input('is_active');
        if ($isActive !== null) {
            $request->merge([
                'is_active' => filter_var($isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($isActive === 'true' || $isActive === '1' || $isActive === 1 || $isActive === true)
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Xử lý upload ảnh
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('gift-options/wrapping-papers', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Đảm bảo is_active là boolean (mặc định true nếu null)
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Xóa trường image khỏi validated (không lưu vào DB)
        unset($validated['image']);

        $paper = WrappingPaper::create($validated);
        return response()->json($paper, 201);
    }

    public function updateWrappingPaper(Request $request, $id)
    {
        $paper = WrappingPaper::findOrFail($id);
        
        // Xử lý is_active trước khi validate (FormData gửi string)
        $isActive = $request->input('is_active');
        if ($isActive !== null) {
            $request->merge([
                'is_active' => filter_var($isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($isActive === 'true' || $isActive === '1' || $isActive === 1 || $isActive === true)
            ]);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Xử lý upload ảnh mới
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($paper->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $paper->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('gift-options/wrapping-papers', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Đảm bảo is_active là boolean (giữ nguyên giá trị hiện tại nếu null)
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $paper->is_active;
        }

        // Xóa trường image khỏi validated
        unset($validated['image']);

        $paper->update($validated);
        return response()->json($paper);
    }

    public function destroyWrappingPaper($id)
    {
        $paper = WrappingPaper::findOrFail($id);
        $paper->delete();
        return response()->json(['message' => 'Đã xóa giấy gói']);
    }

    /**
     * Admin: Quản lý phụ kiện
     */
    public function indexDecorativeAccessories()
    {
        $accessories = DecorativeAccessory::orderBy('created_at', 'desc')->get();
        return response()->json($accessories);
    }

    public function storeDecorativeAccessory(Request $request)
    {
        // Xử lý is_active trước khi validate (FormData gửi string)
        $isActive = $request->input('is_active');
        if ($isActive !== null) {
            $request->merge([
                'is_active' => filter_var($isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($isActive === 'true' || $isActive === '1' || $isActive === 1 || $isActive === true)
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Xử lý upload ảnh
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('gift-options/decorative-accessories', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Đảm bảo is_active là boolean (mặc định true nếu null)
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Xóa trường image khỏi validated
        unset($validated['image']);

        $accessory = DecorativeAccessory::create($validated);
        return response()->json($accessory, 201);
    }

    public function updateDecorativeAccessory(Request $request, $id)
    {
        $accessory = DecorativeAccessory::findOrFail($id);
        
        // Xử lý is_active trước khi validate (FormData gửi string)
        $isActive = $request->input('is_active');
        if ($isActive !== null) {
            $request->merge([
                'is_active' => filter_var($isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($isActive === 'true' || $isActive === '1' || $isActive === 1 || $isActive === true)
            ]);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Xử lý upload ảnh mới
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($accessory->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $accessory->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('gift-options/decorative-accessories', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Đảm bảo is_active là boolean (giữ nguyên giá trị hiện tại nếu null)
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $accessory->is_active;
        }

        // Xóa trường image khỏi validated
        unset($validated['image']);

        $accessory->update($validated);
        return response()->json($accessory);
    }

    public function destroyDecorativeAccessory($id)
    {
        $accessory = DecorativeAccessory::findOrFail($id);
        $accessory->delete();
        return response()->json(['message' => 'Đã xóa phụ kiện']);
    }

    /**
     * Admin: Quản lý loại thiệp
     */
    public function indexCardTypes()
    {
        $cards = CardType::orderBy('created_at', 'desc')->get();
        return response()->json($cards);
    }

    public function storeCardType(Request $request)
    {
        // Xử lý is_active trước khi validate (FormData gửi string)
        $isActive = $request->input('is_active');
        if ($isActive !== null) {
            $request->merge([
                'is_active' => filter_var($isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($isActive === 'true' || $isActive === '1' || $isActive === 1 || $isActive === true)
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Xử lý upload ảnh
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('gift-options/card-types', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Đảm bảo is_active là boolean (mặc định true nếu null)
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Xóa trường image khỏi validated
        unset($validated['image']);

        $card = CardType::create($validated);
        return response()->json($card, 201);
    }

    public function updateCardType(Request $request, $id)
    {
        $card = CardType::findOrFail($id);
        
        // Xử lý is_active trước khi validate (FormData gửi string)
        $isActive = $request->input('is_active');
        if ($isActive !== null) {
            $request->merge([
                'is_active' => filter_var($isActive, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? ($isActive === 'true' || $isActive === '1' || $isActive === 1 || $isActive === true)
            ]);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string|max:2000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'quantity' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        // Xử lý upload ảnh mới
        if ($request->hasFile('image')) {
            // Xóa ảnh cũ nếu tồn tại
            if ($card->image_url) {
                $oldPath = str_replace(asset('storage/'), '', $card->image_url);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('image')->store('gift-options/card-types', 'public');
            $validated['image_url'] = asset('storage/' . $path);
        }

        // Đảm bảo is_active là boolean (giữ nguyên giá trị hiện tại nếu null)
        if (!isset($validated['is_active'])) {
            $validated['is_active'] = $card->is_active;
        }

        // Xóa trường image khỏi validated
        unset($validated['image']);

        $card->update($validated);
        return response()->json($card);
    }

    public function destroyCardType($id)
    {
        $card = CardType::findOrFail($id);
        $card->delete();
        return response()->json(['message' => 'Đã xóa loại thiệp']);
    }

    /**
     * Trừ số lượng khi đặt hàng
     */
    public function decreaseQuantity(Request $request)
    {
        $validated = $request->validate([
            'wrapping_paper_id' => 'nullable|exists:wrapping_papers,id',
            'decorative_accessory_id' => 'nullable|exists:decorative_accessories,id',
            'card_type_id' => 'nullable|exists:card_types,id',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['wrapping_paper_id']) {
                $paper = WrappingPaper::lockForUpdate()->findOrFail($validated['wrapping_paper_id']);
                if ($paper->quantity > 0) {
                    $paper->decrement('quantity');
                }
            }

            if ($validated['decorative_accessory_id']) {
                $accessory = DecorativeAccessory::lockForUpdate()->findOrFail($validated['decorative_accessory_id']);
                if ($accessory->quantity > 0) {
                    $accessory->decrement('quantity');
                }
            }

            if ($validated['card_type_id']) {
                $card = CardType::lockForUpdate()->findOrFail($validated['card_type_id']);
                if ($card->quantity > 0) {
                    $card->decrement('quantity');
                }
            }

            DB::commit();
            return response()->json(['message' => 'Đã cập nhật số lượng']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}

