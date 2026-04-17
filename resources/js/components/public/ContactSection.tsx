import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Phone, MapPin, Send, ShieldCheck, AlertTriangle } from 'lucide-react';
import api from '@/lib/axios';
import Reveal from './Reveal';

// Minimum characters required for name and message fields
const MIN_CHARS = 15;

// reCAPTCHA site key - uses Google's test key for development
// Replace with your production key in .env (VITE_RECAPTCHA_SITE_KEY)
const RECAPTCHA_SITE_KEY = (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

declare global {
    interface Window {
        grecaptcha: any;
        onRecaptchaLoad: () => void;
    }
}

const ContactSection: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        category: 'saran_program',
        priority: 'normal',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
    const [showRecaptcha, setShowRecaptcha] = useState(false);
    const recaptchaRef = useRef<HTMLDivElement>(null);
    const recaptchaWidgetId = useRef<number | null>(null);

    // Load reCAPTCHA script
    useEffect(() => {
        if (typeof window.grecaptcha !== 'undefined') {
            setRecaptchaLoaded(true);
            return;
        }

        window.onRecaptchaLoad = () => {
            setRecaptchaLoaded(true);
        };

        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            delete (window as any).onRecaptchaLoad;
        };
    }, []);

    // Render reCAPTCHA widget when loaded and visible
    useEffect(() => {
        if (recaptchaLoaded && showRecaptcha && recaptchaRef.current && recaptchaWidgetId.current === null) {
            try {
                recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
                    sitekey: RECAPTCHA_SITE_KEY,
                    callback: (token: string) => {
                        setRecaptchaToken(token);
                    },
                    'expired-callback': () => {
                        setRecaptchaToken(null);
                    },
                    theme: 'light',
                    size: 'normal',
                });
            } catch (e) {
                console.error('reCAPTCHA render error:', e);
            }
        }
    }, [recaptchaLoaded, showRecaptcha]);

    // Character count helpers
    const messageCharCount = formData.message.length;
    const isMessageValid = messageCharCount >= MIN_CHARS;
    const isFormFieldsValid = isMessageValid && formData.name.length > 0 && formData.email.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate minimum characters
        if (!isMessageValid) {
            setError(`Pesan harus minimal ${MIN_CHARS} karakter. Saat ini: ${messageCharCount} karakter.`);
            return;
        }

        // Show reCAPTCHA if not shown yet
        if (!showRecaptcha) {
            setShowRecaptcha(true);
            setError('');
            return;
        }

        // Check reCAPTCHA
        if (!recaptchaToken) {
            setError('Silakan selesaikan verifikasi reCAPTCHA terlebih dahulu.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/messages', {
                ...formData,
                recaptcha_token: recaptchaToken,
            });
            setSuccess(true);
            setFormData({ name: '', email: '', message: '', category: 'saran_program', priority: 'normal' });
            setRecaptchaToken(null);
            setShowRecaptcha(false);

            // Reset reCAPTCHA widget
            if (recaptchaWidgetId.current !== null && window.grecaptcha) {
                try {
                    window.grecaptcha.reset(recaptchaWidgetId.current);
                } catch (e) { /* ignore */ }
                recaptchaWidgetId.current = null;
            }

            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
            // Reset reCAPTCHA on error
            if (recaptchaWidgetId.current !== null && window.grecaptcha) {
                try {
                    window.grecaptcha.reset(recaptchaWidgetId.current);
                } catch (e) { /* ignore */ }
            }
            setRecaptchaToken(null);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <section id="contact" className="pt-26 pb-20 md:pt-25 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <Reveal direction="down" className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 mt-3" style={{ color: '#3B4D3A' }}>
                        Hubungi Kami
                    </h2>
                    <div className="w-24 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#E8DCC3' }} />
                    <p className="text-lg" style={{ color: '#6E8BA3' }}>
                        Ada pertanyaan? Kirim pesan kepada kami
                    </p>
                </Reveal>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6 ">
                        <Reveal delay={50} direction="right">
                            <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1" style={{ color: '#3B4D3A' }}>Email</h3>
                                        <p style={{ color: '#6E8BA3' }}>osisviskaa@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={100} direction="right">
                            <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1" style={{ color: '#3B4D3A' }}>Telepon</h3>
                                        <p style={{ color: '#6E8BA3' }}>+62 895-2657-1038</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>

                        <Reveal delay={150} direction="right">
                            <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold mb-1" style={{ color: '#3B4D3A' }}>Alamat</h3>
                                        <p style={{ color: '#6E8BA3' }}>Jl. Adi Sucipto No. 38, Kerten, Kec. Laweyan, Kota Surakarta.</p>
                                    </div>
                                </div>
                            </div>
                        </Reveal>


                    </div>

                    {/* Contact Form */}
                    <Reveal delay={100} direction="left" className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-xl transition-all bg-white
                                            focus:outline focus:outline-2 focus:outline-[#E8DCC3]
                                            focus:border-transparent"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                    placeholder="Nama lengkap Anda"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-xl transition-all bg-white
                                            focus:outline focus:outline-2 focus:outline-[#E8DCC3]
                                            focus:border-transparent"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                    placeholder="email@example.com"
                                />
                            </div>



                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Kategori *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-xl transition-all bg-white
                                            focus:outline focus:outline-2 focus:outline-[#E8DCC3]
                                            focus:border-transparent"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                >
                                    <option value="saran_program">Saran Program</option>
                                    <option value="kritik_feedback">Kritik/Feedback</option>
                                    <option value="laporan_masalah">Laporan Masalah</option>
                                    <option value="ide_usulan">Ide/Usulan</option>
                                    <option value="komplain">Komplain Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Prioritas *
                                </label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-xl transition-all bg-white
                                            focus:outline focus:outline-2 focus:outline-[#E8DCC3]
                                            focus:border-transparent"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                >
                                    <option value="low">Rendah</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">Tinggi</option>
                                </select>
                            </div>



                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Pesan <span className="text-xs font-normal opacity-70">(minimal {MIN_CHARS} karakter)</span>
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    minLength={MIN_CHARS}
                                    rows={5}
                                    className="w-full px-4 py-3 border rounded-xl transition-all bg-white
                                            focus:outline focus:outline-2 focus:outline-[#E8DCC3]
                                            focus:border-transparent"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                    placeholder="Tulis pesan Anda di sini..."
                                />
                            </div>

                            {/* reCAPTCHA section - appears after clicking send */}
                            {showRecaptcha && (
                                <div
                                    className="p-4 rounded-xl border transition-all duration-300"
                                    style={{
                                        backgroundColor: recaptchaToken ? '#F0FFF0' : '#FFFEF5',
                                        borderColor: recaptchaToken ? '#4CAF50' : '#E8DCC3',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        {recaptchaToken ? (
                                            <ShieldCheck className="w-4 h-4" style={{ color: '#4CAF50' }} />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4" style={{ color: '#FF9800' }} />
                                        )}
                                        <p className="text-sm font-semibold" style={{ color: '#3B4D3A' }}>
                                            {recaptchaToken ? 'Verifikasi berhasil ✓' : 'Verifikasi bahwa Anda bukan robot'}
                                        </p>
                                    </div>
                                    <div className="flex justify-center" ref={recaptchaRef} />
                                </div>
                            )}

                            {success && (
                                <div className="p-4 rounded-xl flex items-center gap-2" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                                    <ShieldCheck className="w-5 h-5" />
                                    Pesan berhasil dikirim! Terima kasih.
                                </div>
                            )}

                            {error && (
                                <div className="p-4 rounded-xl flex items-center gap-2" style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                                    <AlertTriangle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !isFormFieldsValid || (showRecaptcha && !recaptchaToken)}
                                className="w-full px-6 py-4 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                style={{ backgroundColor: '#3B4D3A' }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Mengirim...
                                    </span>
                                ) : showRecaptcha && !recaptchaToken ? (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        Selesaikan Verifikasi
                                    </>
                                ) : !showRecaptcha ? (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Kirim Pesan
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Kirim Pesan
                                    </>
                                )}
                            </button>


                        </form>
                    </Reveal>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
