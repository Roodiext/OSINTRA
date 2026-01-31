# WEB-OSINTRA 🏫  
### OSIS Integrated Administration System

**WEB-OSINTRA** adalah sistem manajemen organisasi berbasis web yang dirancang untuk mendigitalisasi seluruh aktivitas OSIS, mulai dari manajemen anggota, program kerja, jabatan, divisi, transaksi keuangan, hingga audit aktivitas pengguna secara terintegrasi.

---

## 🛠️ Tech Stack

Dalam membangun website ini, kami menggunakan teknologi modern untuk memastikan performa dan keamanan:

| Komponen | Teknologi | Logo |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white) |
| **Backend Framework** | Laravel 12 | ![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white) |
| **CMS & Bridge** | Inertia.js | ![Inertia.js](https://img.shields.io/badge/Inertia.js-9553E9?style=flat-square&logo=inertia&logoColor=white) |
| **Database** | MySQL | ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white) |
| **Styling** | Tailwind CSS 4.0 | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) |
| **Animations** | GSAP & Framer Motion | ![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white) ![Framer](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white) |
| **Build Tool** | Vite | ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=FFD62E) |

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
<p align="left">
  <strong>1. Homepage</strong><br>
  <img src="screenshot/public/homepage.jpg" width="700" alt="Homepage">
</p>

<p align="left">
  <strong>2. About</strong><br>
  <img src="screenshot/public/about.jpg" width="700" alt="About">
</p>

<p align="left">
  <strong>3. Sambutan</strong><br>
  <img src="screenshot/public/sambutan.jpg" width="700" alt="Sambutan">
</p>

<p align="left">
  <strong>4. Struktur Organisasi</strong><br>
  <img src="screenshot/public/struktur.jpg" width="700" alt="Struktur">
</p>

<p align="left">
  <strong>5. Galeri Kegiatan</strong><br>
  <img src="screenshot/public/galeri.jpg" width="700" alt="Galeri">
</p>

<p align="left">
  <strong>6. Contact</strong><br>
  <img src="screenshot/public/contact.jpg" width="700" alt="Contact">
</p>

---

### 📊 Dashboard Internal
<p align="left">
  <strong>1. Login</strong><br>
  <img src="screenshot/login/login.jpg" width="700" alt="Login">
</p>

<p align="left">
  <strong>2. Dashboard Utama</strong><br>
  <img src="screenshot/internal/dashboard.jpg" width="700" alt="Dashboard">
</p>

<p align="left">
  <strong>3. Manajemen Divisi</strong><br>
  <img src="screenshot/internal/divisi.jpg" width="700" alt="Divisi">
</p>

<p align="left">
  <strong>4. Manajemen Posisi/Jabatan</strong><br>
  <img src="screenshot/internal/posisi.jpg" width="700" alt="Posisi">
</p>

<p align="left">
  <strong>5. Manajemen Pengguna</strong><br>
  <img src="screenshot/internal/pengguna.jpg" width="700" alt="Pengguna">
</p>

<p align="left">
  <strong>6. Program Kerja</strong><br>
  <img src="screenshot/internal/proker.jpg" width="700" alt="Program Kerja">
</p>

<p align="left">
  <strong>7. Pesan Masuk</strong><br>
  <img src="screenshot/internal/pesan.jpg" width="700" alt="Pesan">
</p>

<p align="left">
  <strong>8. Laporan Keuangan</strong><br>
  <img src="screenshot/internal/keuangan.jpg" width="700" alt="Keuangan">
</p>

<p align="left">
  <strong>9. Log Aktivitas</strong><br>
  <img src="screenshot/internal/aktivitas.jpg" width="700" alt="Log Aktivitas">
</p>

<p align="left">
  <strong>10. Pengaturan Aplikasi</strong><br>
  <img src="screenshot/internal/pengaturan.jpg" width="700" alt="Pengaturan">
</p>

<p align="left">
  <strong>11. Profil Pengguna</strong><br>
  <img src="screenshot/internal/profil.jpg" width="700" alt="Profil">
</p>

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
