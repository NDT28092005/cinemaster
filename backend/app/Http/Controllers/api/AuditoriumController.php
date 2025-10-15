<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Auditorium;

class AuditoriumController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Auditorium::with('cinema');

        if ($request->has('cinema_id')) {
            $query->where('cinema_id', $request->cinema_id);
        }

        return response()->json($query->get());
    }

    public function show($id)
    {
        $auditorium = Auditorium::with('cinema')->findOrFail($id);
        return response()->json($auditorium);
    }
}
