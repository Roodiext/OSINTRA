# Panduan Konfigurasi Email untuk Reply Pesan

## Deskripsi Fitur
Setiap kali admin mengirim reply pesan, sistem akan otomatis mengirimkan email ke pengirim pesan asli dengan notifikasi balasan.

## Konfigurasi Email

### 1. Konfigurasi di `.env`

```
# Pilih mailer yang ingin digunakan
MAIL_MAILER=smtp

# SMTP Configuration
MAIL_SCHEME=tls
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Email From Configuration
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="OSVIS - Sistem Administrasi"
```

### 2. Pilihan Email Service

#### **Opsi A: Menggunakan Gmail (Recommended untuk Development)**

1. **Enable 2FA** di Google Account Settings
2. **Generate App Password**:
   - Buka https://myaccount.google.com/apppasswords
   - Pilih app "Mail" dan device "Windows Computer"
   - Copy password yang digenerate
3. **Update `.env`**:
```
MAIL_MAILER=smtp
MAIL_SCHEME=tls
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=generated-app-password
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="OSVIS - Sistem Administrasi"
```

#### **Opsi B: Menggunakan Email Organisasi (Recommended untuk Production)**

Hubungi IT department untuk:
- SMTP server address
- Username dan password
- Port dan scheme (TLS/SSL)
- Sender email address

#### **Opsi C: Menggunakan Service Pihak Ketiga**

**Mailgun:**
```
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.mailgun.org
MAILGUN_SECRET=your-api-key
MAIL_FROM_ADDRESS=noreply@your-domain.com
```

**SendGrid:**
```
MAIL_MAILER=sendmail
MAIL_FROM_ADDRESS=your-email@gmail.com
SENDGRID_API_KEY=your-sendgrid-api-key
```

### 3. Test Email Configuration

Jalankan command berikut untuk test:

```bash
php artisan tinker
```

Kemudian di dalam tinker:
```php
Mail::raw('Test Email', function($message) {
    $message->to('test-email@example.com')
            ->subject('Test from OSVIS');
});
```

Atau gunakan route test (tambah di `routes/web.php`):
```php
Route::get('/test-email', function() {
    Mail::raw('This is a test email', function($message) {
        $message->to('recipient@example.com')
                ->subject('Test Email');
    });
    return 'Email sent!';
});
```

## Fitur Email Reply

### Kapan Email Dikirim?
- Email otomatis dikirim saat admin/staff mengirim reply melalui dashboard
- Dikirim ke email pengirim pesan asli
- Subject email: "Balasan: [Subjek Pesan Asli]"

### Isi Email
Email berisi:
- ✅ Greeting dengan nama pengirim
- ✅ Pesan balasan yang dikirim
- ✅ Informasi balasan (dari siapa, tanggal, kategori, prioritas)
- ✅ Link ke website untuk respon lebih lanjut
- ✅ Styling profesional dengan template Blade

### Error Handling
- Jika email gagal terkirim, sistem **tidak akan membatalkan reply**
- Error akan dicatat di `storage/logs/laravel.log`
- Admin akan mendapat notifikasi kesuksesan reply di dashboard

## Advanced Configuration

### Queue Email (Untuk Production)
Untuk mengirim email secara asynchronous (non-blocking):

1. Update `.env`:
```
QUEUE_CONNECTION=database
```

2. Jalankan migration untuk jobs table:
```bash
php artisan migrate
```

3. Jalankan queue worker:
```bash
php artisan queue:work
```

### Custom Email Template
Untuk customize template email, edit file:
```
resources/views/emails/message-reply.blade.php
```

### Logging Email
Untuk development, gunakan log driver (check `storage/logs/laravel.log`):
```
MAIL_MAILER=log
```

## Troubleshooting

### Email tidak terkirim?
1. **Check `.env` configuration** - pastikan SMTP details benar
2. **Check logs** - `storage/logs/laravel.log`
3. **Test SMTP connection**:
```bash
php artisan mail:test recipient@example.com
```
4. **Firewall/Network** - pastikan port SMTP tidak di-block

### Email masuk spam?
1. Update `MAIL_FROM_NAME` dan `MAIL_FROM_ADDRESS` dengan branding yang jelas
2. Pastikan sender email verified
3. Pertimbangkan menggunakan SPF, DKIM, DMARC records

### Password tidak benar?
- Jika pakai Gmail, pastikan menggunakan **App Password**, bukan regular password
- Jika corporate email, minta ke IT department

## Dukungan

Untuk pertanyaan atau issues, hubungi development team atau cek dokumentasi Laravel Mail:
https://laravel.com/docs/11.x/mail
