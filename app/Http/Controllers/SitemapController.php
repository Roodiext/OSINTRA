<?php

namespace App\Http\Controllers;

use App\Models\Proker;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $prokers = Proker::where('status', '!=', 'planned')->get();

        return response()->view('sitemap', [
            'prokers' => $prokers,
        ])->header('Content-Type', 'text/xml');
    }
}
