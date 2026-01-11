@component('mail::message')
# Balasan untuk Pesan Anda

Halo {{ $recipientName }},

Terima kasih telah mengirimkan pesan kepada kami. Berikut adalah balasan untuk pertanyaan Anda:

**Pesan Asli Anda:**
> {{ $message->subject }}

**Balasan:**
@component('mail::panel')
{{ $message->reply_message }}
@endcomponent

---

**Informasi Balasan:**
- Dari: {{ $senderName }} ({{ $senderEmail }})
- Tanggal Balasan: {{ $message->replied_at->format('d F Y H:i:s') }}
- Kategori: {{ ucfirst(str_replace('_', ' ', $message->category)) }}
- Prioritas: {{ match($message->priority) { 'high' => 'Tinggi', 'normal' => 'Normal', 'low' => 'Rendah', default => $message->priority } }}

Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami kembali.

@component('mail::button', ['url' => config('app.url')])
Kunjungi Website Kami
@endcomponent

Terima kasih,
**{{ config('app.name') }}**
@endcomponent
