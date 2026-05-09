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

        <title inertia>{{ config('app.name', 'OSINTRA - OSIS SMK Negeri 6 Surakarta') }}</title>

        <!-- SEO Meta Tags -->
        <meta name="description" content="OSINTRA (OSIS SMK Negeri 6 Surakarta) - Platform dokumentasi, informasi program kerja, dan transparansi kegiatan OSIS SMK Negeri 6 Surakarta (Solo). Kreativitas dan transparansi dalam berorganisasi.">
        <meta name="keywords" content="osis, osis smkn 6, smkn 6, web osis, osintra, program kerja osis, smkn 6 solo, smkn 6 surakarta, OSIS SMK Negeri 6 Surakarta, OSINTRA SMKN 6, OSIS Surakarta, Dokumentasi OSIS">
        <meta name="author" content="OSIS SMK Negeri 6 Surakarta">
        @if (request()->is('dashboard*') || request()->is('login'))
            <meta name="robots" content="noindex, nofollow">
        @else
            <meta name="robots" content="index, follow">
        @endif

        <!-- Structured Data (JSON-LD) for SEO -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "Organization",
          "name": "OSIS SMK Negeri 6 Surakarta",
          "alternateName": "OSINTRA",
          "url": "{{ url('/') }}",
          "logo": "{{ asset('osis-logo.png') }}",
          "description": "Platform dokumentasi dan informasi program kerja OSIS SMK Negeri 6 Surakarta.",
          "address": {
            "@@type": "PostalAddress",
            "addressLocality": "Surakarta",
            "addressRegion": "Jawa Tengah",
            "addressCountry": "ID"
          },
          "keywords": "OSIS, SMKN 6 Surakarta, OSINTRA, Program Kerja OSIS"
        }
        </script>

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url('/') }}">
        <meta property="og:title" content="OSINTRA - OSIS SMK Negeri 6 Surakarta">
        <meta property="og:description" content="Platform resmi dokumentasi dan informasi program kerja OSIS SMK Negeri 6 Surakarta (Solo). Lihat transparansi kegiatan kami di sini.">
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
