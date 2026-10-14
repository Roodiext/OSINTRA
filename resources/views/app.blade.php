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

        <title inertia>OSINTRA - OSIS SMK Negeri 6 Surakarta</title>

        <!-- SEO Meta Tags -->
        <meta name="description" content="OSINTRA - Website Resmi OSIS SMK Negeri 6 Surakarta. Portal sistem informasi, dokumentasi kegiatan, transparansi program kerja, dan struktur organisasi OSIS SMK Negeri 6 Surakarta (Solo).">
        <meta name="keywords" content="web osis, osis smk, smk, web osis smk, website osis smk, website resmi osis, portal osis, sistem informasi osis, osis, osis smkn 6, smkn 6, osintra, osintra smkn 6, program kerja osis, program kerja osis smk, proker osis, kegiatan osis smk, galeri osis, struktur osis smk, pengurus osis smk, smkn 6 solo, smkn 6 surakarta, OSIS SMK Negeri 6 Surakarta, OSIS Surakarta, Dokumentasi OSIS, organisasi siswa intra sekolah smk, pilketos smk, ldks osis smk, mpls smk, visi misi osis smk">
        <meta name="author" content="OSIS SMK Negeri 6 Surakarta">
        @if (request()->is('dashboard*') || request()->is('login'))
            <meta name="robots" content="noindex, nofollow">
        @else
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
        @endif

        <!-- Structured Data (JSON-LD) for SEO -->
        <script type="application/ld+json">
        {
          "@@context": "https://schema.org",
          "@@type": "Organization",
          "name": "OSIS SMK Negeri 6 Surakarta",
          "alternateName": ["OSINTRA", "OSIS Viska", "Web OSIS SMK Negeri 6 Surakarta"],
          "url": "{{ url('/') }}",
          "logo": "{{ asset('osis-logo.png') }}",
          "description": "Website resmi OSIS SMK Negeri 6 Surakarta (OSINTRA). Portal dokumentasi, program kerja, dan informasi kegiatan OSIS SMK.",
          "address": {
            "@@type": "PostalAddress",
            "streetAddress": "Jl. Tirtonadi No. 19",
            "addressLocality": "Surakarta",
            "addressRegion": "Jawa Tengah",
            "postalCode": "57139",
            "addressCountry": "ID"
          },
          "keywords": "web osis, osis smk, smk, web osis smk, website osis smk, osintra, OSIS SMK Negeri 6 Surakarta, program kerja osis smk, kegiatan osis, dokumentasi osis, pengurus osis smk"
        }
        </script>

        <!-- Open Graph / Facebook / WhatsApp -->
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="OSINTRA - OSIS SMK Negeri 6 Surakarta">
        <meta property="og:url" content="{{ url('/') }}">
        <meta property="og:title" content="OSINTRA - Website Resmi OSIS SMK Negeri 6 Surakarta">
        <meta property="og:description" content="Website resmi OSIS SMK Negeri 6 Surakarta (Viska). Dokumentasi kegiatan, transparansi program kerja, dan inovasi organisasi siswa SMK.">
        <meta property="og:image" content="{{ asset('osis-favicon.png') }}">
        <meta property="og:locale" content="id_ID">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url('/') }}">
        <meta property="twitter:title" content="OSINTRA - Website Resmi OSIS SMK Negeri 6 Surakarta">
        <meta property="twitter:description" content="Website resmi OSIS SMK Negeri 6 Surakarta. Dokumentasi kegiatan dan program kerja OSIS SMK.">
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
