<?php

use App\Models\AppSetting;

// 1. Try to set a value
echo "Setting test_key...\n";
AppSetting::set('test_key', 'test_value');

// 2. Retrieve it
$val = AppSetting::get('test_key');
echo "Retrieved test_key: " . $val . "\n";

// 3. Check site_logo
$logo = AppSetting::get('site_logo');
echo "Current site_logo: " . ($logo ?? 'NULL') . "\n";

// 4. Try setting site_logo manually
echo "Setting site_logo manually...\n";
AppSetting::set('site_logo', '/storage/test.png');
$newLogo = AppSetting::get('site_logo');
echo "New site_logo: " . ($newLogo ?? 'NULL') . "\n";
