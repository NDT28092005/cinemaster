<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CountryController extends Controller
{
    public function index()
    {
        return response()->json(Country::all());
    }

    public function store(Request $request)
    {
        $country = Country::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'code' => $request->code,
            'flag_url' => $request->flag_url,
        ]);

        return response()->json($country, 201);
    }
}