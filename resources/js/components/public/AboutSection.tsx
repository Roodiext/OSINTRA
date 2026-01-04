import React, { useEffect, useState } from 'react';
import { Target, Eye, Users, Award, Calendar, ChevronRight, Sparkles, Heart, Lightbulb, TrendingUp, Quote } from 'lucide-react';
import api from '@/lib/axios';
import ketosImg from '../../../asset/Image/Ketos.png';

const AboutSection: React.FC = () => {
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    const sambutanKetos = {
        name: 'Agustin Rahmadani',
        title: 'Ketua OSIS Periode 2025/2026',
        content: 'Merupakan sebuah kehormatan bagi saya pribadi untuk dapat memimpin OSIS SMKN 6 dalam balutan semangat inovasi dan integritas. Perjalanan kita di periode 2025/2026 ini bukan sekadar tentang menjalankan program kerja, melainkan tentang bagaimana kita tumbuh bersama, melampaui batasan, dan meninggalkan jejak kebaikan bagi almamater tercinta. Saya mengajak seluruh rekan-rekan siswa untuk terus berkolaborasi dan bergerak maju, karena kemajuan sekolah kita adalah hasil dari langkah-langkah kecil yang kita ambil bersama dengan penuh ketulusan.'
    };

    const scrollToDivisions = () => {
        document.getElementById('divisions')?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setVision(response.data.osis_vision || 'Mewujudkan OSIS sebagai wadah aspirasi siswa yang inklusif, adaptif terhadap teknologi, dan berintegritas tinggi.');
                setMission(response.data.osis_mission || 'Mengembangkan potensi kepemimpinan siswa melalui kolaborasi program kerja yang inovatif dan berdampak nyata bagi lingkungan sekolah.');
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const stats = [
        { icon: Users, value: '10+', label: 'Divisi Aktif' },
        { icon: Award, value: '50+', label: 'Anggota OSIS' },
        { icon: Calendar, value: '20+', label: 'Program Kerja' }
    ];

    const values = [
        { icon: Heart, title: 'Solidaritas', desc: 'Kebersamaan dan dukungan antar anggota' },
        { icon: Lightbulb, title: 'Inovasi', desc: 'Kreativitas dalam setiap program kerja' },
        { icon: TrendingUp, title: 'Prestasi', desc: 'Komitmen terhadap kesuksesan bersama' }
    ];

    return (
        <section id="about" className="relative py-28 px-6 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59,77,58,0.4) 1px, transparent 0)',
                backgroundSize: '40px 40px',
                animation: 'patternMove 20s linear infinite'
            }} />

            {/* Gradient Orbs */}
            <div className="absolute left-10 top-1/3 w-64 h-64 rounded-full opacity-15 blur-3xl animate-pulse"
                style={{ backgroundColor: '#3B4D3A', animationDuration: '4s' }} />
            <div className="absolute right-10 bottom-1/3 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse"
                style={{ backgroundColor: '#6E8BA3', animationDuration: '6s', animationDelay: '1s' }} />

            <div className="max-w-6xl mx-auto relative z-10">

                {/* Enhanced Header Section */}
                <div className="flex flex-col items-center text-center mb-20 animate-slideUp">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shadow-lg backdrop-blur-sm border border-gray-200/50 hover:scale-105 transition-transform mb-6"
                        style={{ backgroundColor: 'rgba(232, 220, 195, 0.9)', color: '#1E1E1E' }}>
                        <Sparkles className="w-4 h-4" />
                        Tentang Kami
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
                        style={{
                            background: 'linear-gradient(135deg, #3B4D3A 0%, #2d3a2c 50%, #1f2820 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                        Membangun Masa Depan <br />
                        Bersama OSIS SMKN 6
                    </h2>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-8"
                        style={{ color: '#6E8BA3' }}>
                        Wadah aspirasi siswa yang inklusif, adaptif terhadap teknologi, dan berintegritas tinggi
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B4D3A' }} />
                        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                    </div>
                </div>

                {/* Enhanced Vision & Mission Cards */}
                <div className="grid lg:grid-cols-2 gap-12 items-stretch mb-24">

                    {/* Visi Card - Premium Glass */}
                    <div className="group relative p-10 rounded-[2rem] bg-white/60 backdrop-blur-sm border border-gray-200/50 transition-all duration-500 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(59,77,58,0.15)] hover:-translate-y-1">
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#3B4D3A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729] shadow-lg">
                                    <Eye className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Visi Organisasi</h3>
                                    <div className="w-8 h-1 rounded-full bg-[#E8DCC3] mt-1" />
                                </div>
                            </div>
                            <p className="text-lg leading-relaxed text-[#6E8BA3] font-medium italic">
                                "{vision}"
                            </p>
                        </div>
                    </div>

                    {/* Misi Card - Premium Glass */}
                    <div className="group relative p-10 rounded-[2rem] bg-white/60 backdrop-blur-sm border border-gray-200/50 transition-all duration-500 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(59,77,58,0.15)] hover:-translate-y-1">
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#3B4D3A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729] shadow-lg">
                                    <Target className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold tracking-tight text-[#1A1A1A]">Misi Utama</h3>
                                    <div className="w-8 h-1 rounded-full bg-[#E8DCC3] mt-1" />
                                </div>
                            </div>
                            <p className="text-lg leading-relaxed text-[#6E8BA3] font-medium">
                                {mission}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sambutan Ketua OSIS Section */}
                <div className="mb-32 relative">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#3B4D3A]/5 to-transparent rounded-[3rem] -z-10" />
                    <div className="grid lg:grid-cols-5 gap-10 items-center">

                        {/* Ketos Left Column: Photo + Info */}
                        <div className="lg:col-span-2 flex flex-col items-center group">
                            <div className="relative w-full max-w-[340px]">
                                {/* Diagonal Background Text - Adjusted Size */}
                                <div className="absolute -inset-10 flex items-center justify-center -z-10 pointer-events-none overflow-hidden select-none">
                                    <div className="text-[90px] font-black text-[#3B4D3A]/[0.08] uppercase leading-none rotate-[-25deg] whitespace-nowrap">
                                        Ketua Osis <br /> Ketua Osis
                                    </div>
                                </div>

                                {/* Decorative Blobs */}
                                <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#E8DCC3]/40 rounded-full blur-3xl animate-pulse" />

                                {/* Photo Container - Removed white box padding and shadow */}
                                <div className="relative z-10 w-full aspect-[4/5] overflow-visible transition-all duration-500 group-hover:-translate-y-2">
                                    <img
                                        src={ketosImg}
                                        alt={sambutanKetos.name}
                                        className="w-full h-full object-contain filter drop-shadow-[0_20px_40px_rgba(59,77,58,0.25)] transition-transform duration-1000 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Info below card as requested */}
                            <div className="mt-2 text-center animate-slideUp">
                                <h4 className="text-2xl font-black text-[#3B4D3A] tracking-tight">{sambutanKetos.name}</h4>
                                <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-[#E8DCC3]/90 backdrop-blur-sm rounded-full border border-[#DBCAB0] shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5 text-[#3B4D3A]" />
                                    <span className="text-[10px] font-bold text-[#3B4D3A] uppercase tracking-[0.1em]">
                                        {sambutanKetos.title}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Speech Content Right Column */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="relative">
                                <Quote className="absolute -top-16 -left-12 w-28 h-28 text-[#3B4D3A]/5 -rotate-12" />
                                <div className="inline-block px-4 py-1.5 rounded-lg bg-[#3B4D3A] text-white text-[10px] font-bold mb-4 tracking-[0.2em] shadow-lg">
                                    MESSAGE FROM CHAIRPERSON
                                </div>
                                <h3 className="text-3xl md:text-5xl font-black text-[#1A1A1A] leading-[1.1] mb-6">
                                    "Menjadi Wadah Inovasi <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B4D3A] to-[#6E8BA3]">Untuk SMKN 6 Unggul."</span>
                                </h3>

                                <div className="relative">
                                    <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-[#E8DCC3] via-[#3B4D3A] to-transparent rounded-full hidden md:block" />
                                    <p className="text-lg md:text-xl text-[#3B4D3A]/70 leading-relaxed italic md:pl-10 font-medium relative z-10">
                                        {sambutanKetos.content}
                                    </p>
                                </div>
                            </div>

                            {/* Decorative line below content */}
                            <div className="pt-6 flex items-center gap-4">
                                <div className="w-12 h-1 rounded-full bg-[#3B4D3A]" />
                                <div className="w-3 h-3 rounded-full border-2 border-[#E8DCC3]" />
                                <div className="w-12 h-1 rounded-full bg-[#E8DCC3]" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Core Values Section */}
                <div className="mb-24">
                    <div className="text-center mb-16">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                            Nilai-Nilai Inti
                        </h3>
                        <p className="text-lg" style={{ color: '#6E8BA3' }}>
                            Fondasi yang memandu setiap langkah kami
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, index) => {
                            const IconComponent = value.icon;
                            return (
                                <div key={index} className="group text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729] shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                                        <IconComponent className="w-10 h-10 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3" style={{ color: '#3B4D3A' }}>
                                        {value.title}
                                    </h4>
                                    <p className="text-sm leading-relaxed" style={{ color: '#6E8BA3' }}>
                                        {value.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Enhanced Stats Section */}
                <div className="bg-gradient-to-r from-[#3B4D3A]/5 to-[#6E8BA3]/5 rounded-3xl p-12 border border-gray-200/50">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                            Pencapaian Kami
                        </h3>
                        <p className="text-lg" style={{ color: '#6E8BA3' }}>
                            Angka yang berbicara tentang dedikasi kami
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                                    <stat.icon className="w-8 h-8" style={{ color: '#3B4D3A' }} />
                                </div>
                                <div className="text-5xl font-black mb-2" style={{
                                    background: 'linear-gradient(135deg, #3B4D3A 0%, #2d3a2c 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}>
                                    {stat.value}
                                </div>
                                <span className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: '#6E8BA3' }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enhanced CTA Section */}
                <div className="mt-20 text-center">
                    <div
                        onClick={scrollToDivisions}
                        className="inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-white shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729]">
                                <ChevronRight className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-semibold" style={{ color: '#3B4D3A' }}>
                                    Lihat Struktur Organisasi
                                </div>
                                <div className="text-xs" style={{ color: '#6E8BA3' }}>
                                    Temui tim kepemimpinan kami
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes patternMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(40px, 40px); }
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
                .animate-slideUp {
                    animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>
        </section>
    );
};

export default AboutSection;