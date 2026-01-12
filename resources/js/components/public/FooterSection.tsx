import React from 'react';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const FooterSection: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{ backgroundColor: '#3B4D3A' }} className="text-white py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <img src="/build/assets/osis-logo-mBAtwUV-.png" alt="OSIS Logo" className="w-10 h-10 object-contain" />
                            <h3 className="text-2xl font-bold text-white">OSVIS</h3>
                        </div>
                        <p className="leading-relaxed" style={{ color: '#D0C5B9' }}>
                            Sistem Manajemen OSIS SMKN 6 Surakarta yang modern dan profesional untuk mengelola kegiatan organisasi siswa.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#about" className="transition-colors text-[#D0C5B9] hover:text-white">
                                    Tentang Kami
                                </a>
                            </li>
                            <li>
                                <a href="#divisions" className="transition-colors text-[#D0C5B9] hover:text-white">
                                    Struktur
                                </a>
                            </li>
                            <li>
                                <a href="#gallery" className="transition-colors text-[#D0C5B9] hover:text-white">
                                    Galeri
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="transition-colors text-[#D0C5B9] hover:text-white">
                                    Kontak
                                </a>
                            </li>
                            <li>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Kontak</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Mail className="w-5 h-5 mt-0.5" style={{ color: '#E8DCC3' }} />
                                <span style={{ color: '#D0C5B9' }}>osisviskaa@gmail.com</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-5 h-5 mt-0.5" style={{ color: '#E8DCC3' }} />
                                <span style={{ color: '#D0C5B9' }}>(0271) 123456</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#E8DCC3' }} />
                                <span style={{ color: '#D0C5B9' }}>Jl. Adi Sucipto No.38, Kerten, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57143</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Social Media */}
                <div className="pt-8 border-t border-[rgba(232,220,195,0.3)]">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="text-sm text-[#D0C5B9]">
                                © {currentYear} OSIS SMKN 6 Surakarta. All rights reserved.
                            </p>
                            <p className="text-xs mt-2" style={{ color: 'rgba(208, 197, 185, 0.7)' }}>
                                Developed by <a href="https://github.com/Roodiext" className="font-semibold hover:text-white transition-colors">RoodiextProduction</a> & <a href="https://github.com/claveora" className="font-semibold hover:text-white transition-colors">ClaveoraDev</a>
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/osis_smkn6ska?igsh=MWcyeDBmc3Uwa3F2YQ=="
                                className="p-2 rounded-lg transition-all duration-300 bg-[rgba(232,220,195,0.2)] hover:bg-[#D0C5B9]"
                            >
                                <Instagram className="w-5 h-5 text-white hover:text-[#3B4D3A]" />
                            </a>
                            <a
                                href="https://www.tiktok.com/@osisviska?is_from_webapp=1&sender_device=pc"
                                className="p-2 rounded-lg transition-all duration-300 bg-[rgba(232,220,195,0.2)] hover:bg-[#D0C5B9]"
                            >
                                <svg className="w-5 h-5 text-white hover:text-[#3B4D3A]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.youtube.com/@osissmkviska8875"
                                className="p-2 rounded-lg transition-all duration-300 bg-[rgba(232,220,195,0.2)] hover:bg-[#D0C5B9]"
                            >
                                <Youtube className="w-5 h-5 text-white hover:text-[#3B4D3A]" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterSection;