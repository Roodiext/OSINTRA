import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '@/lib/axios';

const ContactSection: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/messages', formData);
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengirim pesan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <section id="contact" className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                        Hubungi Kami
                    </h2>
                    <div className="w-24 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#E8DCC3' }} />
                    <p className="text-lg" style={{ color: '#6E8BA3' }}>
                        Ada pertanyaan? Kirim pesan kepada kami
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1" style={{ color: '#3B4D3A' }}>Email</h3>
                                    <p style={{ color: '#6E8BA3' }}>osis@smkn6solo.sch.id</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1" style={{ color: '#3B4D3A' }}>Telepon</h3>
                                    <p style={{ color: '#6E8BA3' }}>(0271) 123456</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1" style={{ color: '#3B4D3A' }}>Alamat</h3>
                                    <p style={{ color: '#6E8BA3' }}>Jl. LU Adisucipto No. 42, Surakarta</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: '#F5F5F5' }}>
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
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
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
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                    placeholder="email@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Subjek
                                </label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all bg-white"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                    placeholder="Subjek pesan"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2" style={{ color: '#3B4D3A' }}>
                                    Pesan
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all resize-none bg-white"
                                    style={{ borderColor: '#E8DCC3', color: '#1E1E1E' }}
                                    placeholder="Tulis pesan Anda di sini..."
                                />
                            </div>

                            {success && (
                                <div className="p-4 rounded-xl" style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}>
                                    Pesan berhasil dikirim! Terima kasih.
                                </div>
                            )}

                            {error && (
                                <div className="p-4 rounded-xl" style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-4 text-white rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: '#3B4D3A' }}
                            >
                                {loading ? 'Mengirim...' : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Kirim Pesan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
