# WEB-OSINTRA 🏫  
### OSIS Integrated Administration System

**WEB-OSINTRA** adalah sistem manajemen organisasi berbasis web yang dirancang untuk mendigitalisasi seluruh aktivitas OSIS, mulai dari manajemen anggota, program kerja, jabatan, divisi, transaksi keuangan, hingga audit aktivitas pengguna secara terintegrasi.

---

## 🛠️ Tech Stack

Dalam membangun website ini, kami menggunakan teknologi modern untuk memastikan performa dan keamanan:

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend Framework**: [Laravel 12](https://laravel.com/)
- **CMS & Bridge**: [Inertia.js](https://inertiajs.com/) (Menghubungkan Laravel & React dengan mulus tanpa API tradisional)
- **Database**: MySQL / MariaDB
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Animations**: [GSAP](https://greensock.com/gsap/), [Framer Motion](https://www.framer.com/motion/), [ScrollReveal](https://scrollrevealjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## 📁 Susunan Folder Project

Berikut adalah struktur folder utama dari proyek **WEB-OSINTRA**:

```text
WEB-OSINTRA/
├── app/                      # Logika Backend (Controllers, Models, Middleware)
├── bootstrap/                # Konfigurasi booting Laravel
├── config/                   # File konfigurasi aplikasi
├── database/                 # Migrations, Seeders, dan Factories
├── public/                   # Entry point (index.php) dan aset publik hasil build
├── resources/                # Sumber daya Frontend
│   ├── css/                  # File styling (Tailwind CSS)
│   ├── js/                   # Komponen React, Halaman (Pages), dan Logic JS
│   │   ├── components/       # Komponen UI Reusable
│   │   ├── Pages/            # Halaman utama aplikasi (Public & Dashboard)
│   │   └── Layouts/          # Layout template aplikasi
│   └── views/                # Blade template (Inertia root template)
├── routes/                   # Definisi route/URL (web.php)
├── screenshot/               # Dokumentasi Gambar Project
│   ├── internal/             # Screenshot Dashboard Admin
│   ├── login/                # Screenshot Halaman Login
│   └── public/               # Screenshot Halaman Publik
├── storage/                  # Penyimpanan logo, media, dan logs
├── artisan                   # CLI Laravel
├── composer.json             # PHP Dependencies (Laravel)
├── package.json              # JS Dependencies (React, Tailwind, Vite)
└── vite.config.ts            # Konfigurasi Vite Build Tool
```

---

## 📸 Tampilan Website

### 🌐 Tampilan Public
Berikut adalah tampilan untuk pengunjung umum:

#### 1. Homepage
![Homepage](screenshot/public/homepage.jpg)

#### 2. About
![About](screenshot/public/about.jpg)

#### 3. Sambutan
![Sambutan](screenshot/public/sambutan.jpg)

#### 4. Struktur Organisasi
![Struktur](screenshot/public/struktur.jpg)

#### 5. Galeri Kegiatan
![Galeri](screenshot/public/galeri.jpg)

#### 6. Contact
![Contact](screenshot/public/contact.jpg)

---

### 📊 Dashboard Internal
Tampilan dashboard untuk pengelola OSIS (Login Required):

#### 1. Login
![Login](screenshot/login/login.jpg)

#### 2. Dashboard Utama
![Dashboard](screenshot/internal/dashboard.jpg)

#### 3. Manajemen Divisi
![Divisi](screenshot/internal/divisi.jpg)

#### 4. Manajemen Posisi/Jabatan
![Posisi](screenshot/internal/posisi.jpg)

#### 5. Manajemen Pengguna
![Pengguna](screenshot/internal/pengguna.jpg)

#### 6. Program Kerja
![Program Kerja](screenshot/internal/proker.jpg)

#### 7. Pesan Masuk
![Pesan](screenshot/internal/pesan.jpg)

#### 8. Laporan Keuangan
![Keuangan](screenshot/internal/keuangan.jpg)

#### 9. Log Aktivitas
![Log Aktivitas](screenshot/internal/aktivitas.jpg)

#### 10. Pengaturan Aplikasi
![Pengaturan](screenshot/internal/pengaturan.jpg)

#### 11. Profil Pengguna
![Profil](screenshot/internal/profil.jpg)

---

## 🚀 Status Proyek
Website sudah **FINAL**. Saat ini hanya tinggal menunggu perbaikan bug minor (jika ditemukan) sebelum benar-benar siap digunakan secara penuh.

---

## 👨‍💻 Developer
Dikembangkan dengan ❤️ oleh:
- **Roodiext Production**
- **ClaveoraDev**

---
© 2026 WEB-OSINTRA. All rights reserved.
