<?php

use App\Models\Proker;
use Illuminate\Support\Facades\File;

// Boot Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Generate Sitemap Content
$now = now()->timezone('UTC')->toAtomString();
$prokers = Proker::where('status', '!=', 'planned')->get();

$xml = '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
$xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// Home
$xml .= '    <url>' . PHP_EOL;
$xml .= '        <loc>' . url('/') . '</loc>' . PHP_EOL;
$xml .= '        <lastmod>' . $now . '</lastmod>' . PHP_EOL;
$xml .= '        <changefreq>daily</changefreq>' . PHP_EOL;
$xml .= '        <priority>1.0</priority>' . PHP_EOL;
$xml .= '    </url>' . PHP_EOL;

// Public Pages
$pages = [
    '/about' => ['freq' => 'monthly', 'pri' => '0.8'],
    '/struktur' => ['freq' => 'monthly', 'pri' => '0.8'],
    '/prokers' => ['freq' => 'daily', 'pri' => '0.9'],
    '/gallery' => ['freq' => 'daily', 'pri' => '0.8'],
    '/contact' => ['freq' => 'monthly', 'pri' => '0.7'],
];

foreach ($pages as $path => $meta) {
    $xml .= '    <url>' . PHP_EOL;
    $xml .= '        <loc>' . url($path) . '</loc>' . PHP_EOL;
    $xml .= '        <lastmod>' . $now . '</lastmod>' . PHP_EOL;
    $xml .= '        <changefreq>' . $meta['freq'] . '</changefreq>' . PHP_EOL;
    $xml .= '        <priority>' . $meta['pri'] . '</priority>' . PHP_EOL;
    $xml .= '    </url>' . PHP_EOL;
}

// Prokers
foreach ($prokers as $proker) {
    $xml .= '    <url>' . PHP_EOL;
    $xml .= '        <loc>' . url('/prokers/' . $proker->id) . '</loc>' . PHP_EOL;
    $xml .= '        <lastmod>' . $proker->updated_at->timezone('UTC')->toAtomString() . '</lastmod>' . PHP_EOL;
    $xml .= '        <changefreq>weekly</changefreq>' . PHP_EOL;
    $xml .= '        <priority>0.7</priority>' . PHP_EOL;
    $xml .= '    </url>' . PHP_EOL;
}

$xml .= '</urlset>';

// Save to public folder
File::put(public_path('sitemap.xml'), $xml);

echo "Sitemap.xml has been generated in public folder.\n";
