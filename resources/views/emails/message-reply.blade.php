<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Balasan Pesan - OSIS SMKN 6 Surakarta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 20px;">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #3B4D3A; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">OSIS SMKN 6 SURAKARTA</h1>
                            <p style="color: #E8DCC3; margin: 10px 0 0; font-size: 14px;">Integrated Administration System</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="color: #333333; font-size: 16px; margin-bottom: 25px;">
                                Yth. <strong>{{ $recipientName }}</strong>,
                            </p>
                            
                            <p style="color: #555555; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                                Terima kasih telah menghubungi kami. Pesan Anda telah kami terima dan berikut adalah tanggapan resmi dari tim kami:
                            </p>

                            <!-- Original Message Summary (Optional/Collapsed look) -->
                            <div style="background-color: #f9f9f9; border-left: 4px solid #E8DCC3; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
                                <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888; font-weight: bold; text-transform: uppercase;">Topik: {{ $subject }}</p>
                                <p style="margin: 0; font-size: 14px; color: #555555; white-space: pre-wrap; font-style: italic;">"{{ $originalMessage }}"</p>
                            </div>

                            <!-- Reply Content -->
                            <div style="margin-bottom: 30px;">
                                <h3 style="color: #3B4D3A; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #E8DCC3; padding-bottom: 10px; display: inline-block;">Balasan Kami</h3>
                                <div style="color: #333333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">{{ $replyMessage }}</div>
                            </div>

                            <p style="color: #555555; font-size: 15px; line-height: 1.6;">
                                Jika ada hal lain yang ingin ditanyakan, jangan ragu untuk membalas email ini atau mengunjungi sekretariat kami.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
                            <p style="color: #888888; font-size: 12px; margin: 0;">&copy; {{ date('Y') }} OSIS SMKN 6 Surakarta. All rights reserved.</p>
                            <p style="color: #888888; font-size: 12px; margin: 5px 0 0;">Jl. LU Adisucipto No. 42, Surakarta</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
