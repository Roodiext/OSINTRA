import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/ui/section-header';

const HeroSection: React.FC = () => {
    const scrollToAbout = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[72vh] flex items-center justify-center overflow-hidden bg-white">
            {/* Subtle dotted backdrop */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.06) 1px, transparent 0)', backgroundSize: '36px 36px' }} />

            <div className="relative z-10 text-center px-6 max-w-6xl mx-auto py-24 w-full">



                <div className="mb-4">
                    <div className="inline-block px-5 py-2 rounded-full font-semibold text-sm" style={{ backgroundColor: '#E8DCC3', color: '#1E1E1E' }}>
                        Organisasi Siswa Intra Sekolah
                    </div>
                </div>


                                <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold mb-4 leading-tight" style={{ color: '#3B4D3A' }}>OSIS SMK NEGERI 6 SURAKARTA</h1>
                                <p className="text-base md:text-lg mb-6" style={{ color: '#6E8BA3' }}>
                                    Bersama, Berkarya, Berprestasi — Mewujudkan Generasi Emas Berkarakter dan Berjiwa Kepemimpinan.
                                </p>

                <div className="flex gap-4 justify-center">
                    <button onClick={scrollToAbout} className="px-8 py-3 rounded-lg font-semibold text-white transform hover:scale-105 transition-all" style={{ backgroundColor: '#3B4D3A' }}>
                        Pelajari Lebih Lanjut
                    </button>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                    <ChevronDown className="w-8 h-8" style={{ color: '#6E8BA3' }} />
                </div>
            </div>

            {/* Decorative soft accents using dashboard accent color */}
            <div className="absolute -left-16 -top-16 w-40 h-40 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: '#3B4D3A' }} />
            <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full opacity-5 blur-3xl" style={{ backgroundColor: '#6E8BA3' }} />
        </section>
    );
};

export default HeroSection;
