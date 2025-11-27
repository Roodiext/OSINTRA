import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const FooterSection: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{ backgroundColor: '#3B4D3A' }} className="text-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <h3 className="text-2xl font-bold mb-4" style={{ color: '#E8DCC3' }}>OSINTRA</h3>
                        <p className="leading-relaxed" style={{ color: '#D0C5B9' }}>
                            Sistem Manajemen OSIS SMKN 6 Surakarta yang modern dan profesional untuk mengelola kegiatan organisasi siswa.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#about" className="transition-colors" style={{ color: '#D0C5B9' }}>
                                    Tentang Kami
                                </a>
                            </li>
                            <li>
                                <a href="#divisions" className="transition-colors" style={{ color: '#D0C5B9' }}>
                                    Struktur
                                </a>
                            </li>
                            <li>
                                <a href="#gallery" className="transition-colors" style={{ color: '#D0C5B9' }}>
                                    Galeri
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="transition-colors" style={{ color: '#D0C5B9' }}>
                                    Kontak
                                </a>
                            </li>
                            <li>
                                <a href="/login" className="transition-colors" style={{ color: '#D0C5B9' }}>
                                    Login Dashboard
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Kontak</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 mt-0.5" style={{ color: '#E8DCC3' }} />
                                <span style={{ color: '#D0C5B9' }}>osis@smkn6solo.sch.id</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 mt-0.5" style={{ color: '#E8DCC3' }} />
                                <span style={{ color: '#D0C5B9' }}>(0271) 123456</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#E8DCC3' }} />
                                <span style={{ color: '#D0C5B9' }}>Jl. LU Adisucipto No. 42, Surakarta</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Social Media */}
                <div className="pt-8" style={{ borderTop: '1px solid rgba(232,220,195,0.3)' }}>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm" style={{ color: '#D0C5B9' }}>
                            © {currentYear} OSIS SMKN 6 Surakarta. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="p-2 rounded-lg transition-all duration-300 hover:bg-opacity-100"
                                style={{ backgroundColor: 'rgba(232,220,195,0.2)' }}
                            >
                                <Facebook className="w-5 h-5 text-white" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg transition-all duration-300 hover:bg-opacity-100"
                                style={{ backgroundColor: 'rgba(232,220,195,0.2)' }}
                            >
                                <Instagram className="w-5 h-5 text-white" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg transition-all duration-300 hover:bg-opacity-100"
                                style={{ backgroundColor: 'rgba(232,220,195,0.2)' }}
                            >
                                <Twitter className="w-5 h-5 text-white" />
                            </a>
                            <a
                                href="#"
                                className="p-2 rounded-lg transition-all duration-300 hover:bg-opacity-100"
                                style={{ backgroundColor: 'rgba(232,220,195,0.2)' }}
                            >
                                <Youtube className="w-5 h-5 text-white" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;
