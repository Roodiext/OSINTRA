<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'OSINTRA') }}</title>

        <!-- SEO Meta Tags -->
        <meta name="description" content="OSINTRA - Platform dokumentasi dan informasi program kerja OSIS SMK Negeri 6 Surakarta. Transparansi dan kreativitas dalam berorganisasi.">
        <meta name="keywords" content="OSIS, SMKN 6 Surakarta, OSINTRA, Program Kerja, Dokumentasi Event, Sekolah, Surakarta">
        <meta name="author" content="OSIS SMKN 6 Surakarta">
        <meta name="robots" content="index, follow">

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url('/') }}">
        <meta property="og:title" content="OSINTRA - OSIS SMK Negeri 6 Surakarta">
        <meta property="og:description" content="Platform dokumentasi dan informasi program kerja OSIS SMK Negeri 6 Surakarta. Lihat transparansi kegiatan kami di sini.">
        <meta property="og:image" content="{{ asset('osis-favicon.png') }}">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url('/') }}">
        <meta property="twitter:title" content="OSINTRA - OSIS SMK Negeri 6 Surakarta">
        <meta property="twitter:description" content="Platform dokumentasi dan informasi program kerja OSIS SMK Negeri 6 Surakarta.">
        <meta property="twitter:image" content="{{ asset('osis-favicon.png') }}">

        <link rel="canonical" href="{{ url()->current() }}">
        <link rel="icon" type="image/png" href="/osis-logo.png">
        <link rel="preload" href="/osis-logo.png" as="image">

        <link rel="preload" href="/osis-favicon.png" as="image" type="image/png">
        <link rel="icon" href="/osis-favicon.png" type="image/png">
        <link rel="apple-touch-icon" href="/osis-favicon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
