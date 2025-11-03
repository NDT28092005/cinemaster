<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Occasion;
use Illuminate\Http\Request;

class OccasionController extends Controller
{
    public function index()
    {
        return Occasion::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $occasion = Occasion::create($data);
        return response()->json($occasion, 201);
    }

    public function show(Occasion $occasion)
    {
        return $occasion;
    }

    public function update(Request $request, Occasion $occasion)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $occasion->update($data);
        return response()->json($occasion);
    }

    public function destroy(Occasion $occasion)
    {
        $occasion->delete();
        return response()->json(null, 204);
    }
}
