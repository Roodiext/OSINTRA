import React from 'react';
import { ChevronDown } from 'lucide-react';

const HeroSection: React.FC = () => {
    const scrollToAbout = () => {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative h-screen flex flex-col justify-end items-center bg-[#050505] overflow-hidden">

            {/* 1. LAYER FOTO - Full & Jernih */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url(/osvis-team.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />

            {/* 2. LAYER GRADASI - Agar teks terbaca jelas */}
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/60 to-transparent z-10 pointer-events-none" />

            {/* 3. KONTEN UTAMA */}
            <div className="relative z-20 text-center pb-16 px-4 w-full max-w-5xl mx-auto animate-fadeIn">

                {/* Text Kecil Atas */}
                <p className="text-white/70 text-sm md:text-base tracking-[0.2em] font-medium uppercase mb-3 drop-shadow-md">
                    Selamat Datang di Website Resmi
                </p>

                {/* JUDUL UTAMA - Dengan Shadow/Glow Effect */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6"
                    style={{
                        textShadow: '0 0 30px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.1)'
                    }}>
                    OSIS SMKN 6 SURAKARTA
                </h1>

                {/* Subtext / Tagline */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-[1px] w-12 bg-white/30 hidden md:block" />
                    <p className="text-white/80 text-base md:text-lg font-light italic tracking-wide drop-shadow-md">
                        "Solid, Kompak, & Berprestasi"
                    </p>
                    <div className="h-[1px] w-12 bg-white/30 hidden md:block" />
                </div>

                {/* Tombol Scroll */}
                <button
                    onClick={scrollToAbout}
                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2 transition-all duration-300 hover:scale-105"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white uppercase tracking-widest">Explore</span>
                        <ChevronDown className="w-4 h-4 text-white group-hover:translate-y-0.5 transition-transform" />
                    </div>
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 1.2s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default HeroSection;