import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Home } from 'lucide-react';

interface NotFoundPageProps {
    logo?: string | null;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ logo }) => {
    const logoUrl = logo || '/build/assets/osis-logo-mBAtwUV-.png';
    const [logoLoaded, setLogoLoaded] = useState(false);

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
            <Head title="404 - Halaman Tidak Ditemukan" />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `radial-gradient(#3B4D3A 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
            }}></div>

            <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center border border-[#E8DCC3] overflow-hidden">
                {/* Decorative Top Accent */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-[#E8DCC3]"></div>

                {/* Logo Section */}
                <div className="relative z-10 w-24 h-24 mx-auto mb-8 flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#E8DCC3]/20 rounded-full blur-xl animate-pulse"></div>
                    {!logoLoaded && (
                        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
                    )}
                    <img
                        src={logoUrl}
                        alt="Logo OSIS"
                        loading="eager"
                        decoding="async"
                        onLoad={() => setLogoLoaded(true)}
                        className={`relative w-full h-full object-contain drop-shadow-md transition-opacity duration-500 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                </div>

                {/* Headings */}
                <h1 className="text-5xl md:text-6xl font-bold text-[#3B4D3A] mb-4 tracking-tighter">
                    404
                </h1>

                <h2 className="text-xl md:text-2xl font-medium text-[#3B4D3A]/80 mb-6 font-serif italic">
                    "Halaman Tidak Ditemukan"
                </h2>

                {/* Message */}
                <p className="text-gray-600 mb-10 leading-relaxed max-w-sm mx-auto">
                    Sepertinya Anda tersesat atau halaman yang Anda cari telah dipindahkan atau tidak pernah ada.
                </p>

                {/* Action Button */}
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#3B4D3A] text-[#E8DCC3] font-bold text-sm shadow-lg hover:bg-[#2A3829] transition-all hover:scale-105 active:scale-95 group"
                >
                    <Home className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>

            <p className="mt-8 text-sm text-[#3B4D3A]/40 font-medium z-10">
                &copy; {new Date().getFullYear()} OSIS SMKN 6 Surakarta
            </p>
        </div>
    );
};

export default NotFoundPage;
