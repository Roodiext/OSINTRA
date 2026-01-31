<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$media = \App\Models\ProkerMedia::latest()->first();
echo "ID: " . $media->id . "\n";
echo "media_url: " . $media->media_url . "\n";
echo "thumbnail_url: " . $media->thumbnail_url . "\n";

// Manual check
$pathInfo = pathinfo($media->media_url);
$thumbUrl = $pathInfo['dirname'] . '/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
echo "Expected thumb URL: " . $thumbUrl . "\n";

$localPath = public_path(substr($thumbUrl, 1));
echo "Local path: " . $localPath . "\n";
echo "File exists: " . (file_exists($localPath) ? 'YES' : 'NO') . "\n";
