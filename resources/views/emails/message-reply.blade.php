<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tanggapan Aspirasi - {{ $siteName }}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f2f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Document Container -->
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    
                    <!-- Header with Logo and Title Inline -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #3B4D3A 0%, #1e261d 100%); padding: 40px 30px;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td style="padding-right: 15px;">
                                                    <img src="{{ $message->embed(public_path(ltrim($siteLogo, '/'))) }}" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; display: block;">
                                                </td>
                                                <td style="vertical-align: middle; text-align: left;">
                                                    <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2;">
                                                        OSIS SMKN 6 SURAKARTA
                                                    </h1>
                                                </td>
                                            </tr>
                                        </table>
                                        <div style="width: 100%; height: 1px; background-color: rgba(232, 220, 195, 0.3); margin: 20px 0;"></div>
                                        <p style="color: #E8DCC3; margin: 0; font-size: 13px; font-weight: 500; opacity: 0.9; text-transform: uppercase; letter-spacing: 2px;">
                                            RESPON ASPIRASI TERVERIFIKASI
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #1a1a1a; font-size: 16px; margin: 0 0 15px 0;">
                                Halo <strong>{{ $recipientName }}</strong>,
                            </p>
                            
                            <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin: 0 0 30px 0;">
                                Aspirasi/pertanyaan yang Anda sampaikan melalui sistem website kami telah diterima. Berikut adalah tanggapan resmi dari pihak pengurus:
                            </p>

                            <!-- Original Message Box -->
                            <div style="background-color: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 1px dashed #dee2e6;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <span style="font-size: 11px; font-weight: 700; color: #adb5bd; text-transform: uppercase; letter-spacing: 1px;">ASPIRASI ANDA</span>
                                </div>
                                <p style="margin: 0; font-size: 14px; color: #6c757d; font-style: italic; line-height: 1.5;">"{{ $originalMessage }}"</p>
                            </div>

                            <!-- Official Response -->
                            <div style="background-color: #ffffff; border-radius: 12px; padding: 0; margin-bottom: 30px;">
                                <div style="border-left: 4px solid #3B4D3A; padding: 5px 0 5px 20px;">
                                    <h3 style="color: #3B4D3A; font-size: 18px; font-weight: 700; margin: 0 0 15px 0;">Tanggapan Resmi</h3>
                                    <div style="color: #2d3436; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">{{ $replyMessage }}</div>
                                </div>
                            </div>

                            <!-- Closing -->
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f1f1;">
                                <p style="color: #4a4a4a; font-size: 14px; margin: 0 0 5px 0;">Tertanda,</p>
                                <p style="color: #3B4D3A; font-size: 16px; font-weight: 700; margin: 0 0 2px 0;">{{ $senderName }}</p>
                                <p style="color: #6c757d; font-size: 14px; margin: 0;">{{ $senderPosition }} OSIS SMKN 6 Surakarta</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer Info -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 40px; text-align: center;">
                            <div style="margin: 5px 0;">
                                <a href="{{ config('app.url') }}" style="color: #3B4D3A; text-decoration: none; font-size: 12px; font-weight: 600;">OSINTRA</a>
                                <span style="color: #dee2e6; margin: 0 10px;">|</span>
                                <a href="https://www.instagram.com/osis_smkn6ska?igsh=MWcyeDBmc3Uwa3F2YQ==" style="color: #3B4D3A; text-decoration: none; font-size: 12px; font-weight: 600;">Hubungi Kami</a>
                            </div>
                            <p style="color: #adb5bd; font-size: 11px; margin: 0;">
                                &copy; {{ date('Y') }} OSIS SMKN 6 Surakarta. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
                
                <p style="color: #adb5bd; font-size: 11px; margin-top: 20px; text-align: center;">
                    Jl. LU Adisucipto No. 42, Surakarta, Jawa Tengah
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
