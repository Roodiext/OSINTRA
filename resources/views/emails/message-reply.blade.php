@component('mail::message')
# Balasan untuk Pesan Anda

Halo {{ $recipientName }},

Terima kasih telah mengirimkan pesan kepada kami. Berikut adalah balasan untuk pertanyaan Anda:

**Pesan Asli Anda:**
> {{ $subject }}

**Balasan:**
@component('mail::panel')
{{ $replyMessage }}
@endcomponent

---

**Informasi Balasan:**
- Dari: {{ $senderName }} ({{ $senderEmail }})

Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami kembali.

@component('mail::button', ['url' => config('app.url')])
Kunjungi Website Kami
@endcomponent

Terima kasih,
**{{ config('app.name') }}**
@endcomponent
