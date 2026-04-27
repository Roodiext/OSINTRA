import React, { useEffect, useState } from 'react';
import { Target, Eye, Users, Award, Calendar, Sparkles, Heart, Lightbulb, TrendingUp, Quote, User } from 'lucide-react';
import api from '@/lib/axios';
import Reveal from './Reveal';
import OptimizedImage from '@/components/ui/OptimizedImage';

const AboutSection: React.FC = () => {
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    const [sambutanKetos, setSambutanKetos] = useState({
        name: 'Person',
        title: 'Ketua OSIS Periode 2025/2026',
        content: 'Sambutan Ketua OSIS SMKN 6 Surakarta',
        image: null as string | null
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch from PUBLIC endpoint (no auth required)
                const response = await api.get('/public-settings');
                const data = response.data;

                if (data.osis_vision) {
                    setVision(data.osis_vision);
                }
                if (data.osis_mission) {
                    setMission(data.osis_mission);
                }

                // Update Ketos Data if available
                setSambutanKetos(prev => ({
                    ...prev,
                    name: data.ketos_name || prev.name,
                    title: data.ketos_periode ? `Ketua OSIS Periode ${data.ketos_periode}` : prev.title,
                    content: data.ketos_sambutan || prev.content,
                    image: data.ketos_image || prev.image
                }));
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                // Keep default values if fetch fails
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

        <section id="about" className="relative pt-26 pb-16 md:pt-25 md:pb-28 px-6 bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
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

                {/* Enhanced Header Section - Compact on Mobile */}
                <Reveal className="flex flex-col items-center text-center mb-10 md:mb-20">
                    <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shadow-lg backdrop-blur-sm border border-gray-200/50 hover:scale-105 transition-transform mb-4 md:mb-6"
                        style={{ backgroundColor: 'rgba(232, 220, 195, 0.9)', color: '#1E1E1E' }}>
                        <Sparkles className="w-4 h-4" />
                        Tentang Kami
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6 leading-tight mt-3"
                        style={{
                            background: 'linear-gradient(135deg, #3B4D3A 0%, #2d3a2c 50%, #1f2820 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                        Membangun Masa Depan <br />
                        Bersama OSIS SMKN 6
                    </h2>
                    <p className="text-base md:text-xl max-w-3xl mx-auto leading-relaxed mb-6 md:mb-8"
                        style={{ color: '#6E8BA3' }}>
                        Wadah aspirasi siswa yang inklusif, adaptif terhadap teknologi, dan berintegritas tinggi
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B4D3A' }} />
                        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                    </div>
                </Reveal>

                {/* Enhanced Vision & Mission Cards - Compact on Mobile */}
                <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-stretch mb-12 md:mb-24">

                    {/* Visi Card - Premium Glass */}
                    <Reveal direction="left" delay={50} className="h-full">
                        <div className="group relative p-6 md:p-10 rounded-[2rem] bg-white/60 backdrop-blur-sm border border-gray-200/50 transition-all duration-500 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(59,77,58,0.15)] hover:-translate-y-1 h-full">
                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#3B4D3A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4 md:mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729] shadow-lg">
                                        <Eye className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-[#1A1A1A]">Visi Organisasi</h3>
                                        <div className="w-8 h-1 rounded-full bg-[#E8DCC3] mt-1" />
                                    </div>
                                </div>
                                <p className="text-sm md:text-lg leading-relaxed text-[#6E8BA3] font-medium italic">
                                    "{vision}"
                                </p>
                            </div>
                        </div>
                    </Reveal>

                    {/* Misi Card - Premium Glass */}
                    <Reveal direction="right" delay={100} className="h-full">
                        <div className="group relative p-6 md:p-10 rounded-[2rem] bg-white/60 backdrop-blur-sm border border-gray-200/50 transition-all duration-500 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(59,77,58,0.15)] hover:-translate-y-1 h-full">
                            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#3B4D3A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4 md:mb-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729] shadow-lg">
                                        <Target className="w-6 h-6 md:w-7 md:h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-[#1A1A1A]">Misi Utama</h3>
                                        <div className="w-8 h-1 rounded-full bg-[#E8DCC3] mt-1" />
                                    </div>
                                </div>
                                <p className="text-sm md:text-lg leading-relaxed text-[#6E8BA3] font-medium">
                                    {mission}
                                </p>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Sambutan Ketua OSIS Section - Compact on Mobile */}
                <div className="mb-16 md:mb-32 relative z-10">
                    <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#3B4D3A]/5 to-transparent rounded-[3rem] -z-10" />
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 md:gap-10 items-center">
                        {/* Ketos Left Column: Photo + Info */}
                        <div className="lg:col-span-2 flex flex-col items-center group mb-8 md:mb-12 lg:mb-0 relative">
                            {/* Card Wrapper for Photo & Name */}
                            <div className="relative w-full max-w-[280px] md:max-w-[360px] bg-gradient-to-b from-white/60 to-white/20 backdrop-blur-md rounded-[3rem] border border-white/50 shadow-2xl p-6 md:p-0 md:pb-8 overflow-hidden">

                                {/* Background Text - Now contained within the card */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 md:opacity-15 select-none overflow-hidden">
                                    <div className="text-[30px] md:text-[50px] font-black text-[#3B4D3A] uppercase leading-none rotate-[-15deg] whitespace-nowrap scale-150">
                                        Ketua Osis <br /> Ketua Osis <br /> Ketua Osis <br /> Ketua Osis <br /> Ketua Osis<br />
                                    </div>
                                </div>

                                {/* Photo Container */}
                                <div className="relative z-10 w-full aspect-[4/5] overflow-visible transition-all duration-500">
                                    {sambutanKetos.image ? (
                                        <div className="w-full h-full transform translate-y-4 md:translate-y-6">
                                            <OptimizedImage
                                                src={sambutanKetos.image}
                                                alt={sambutanKetos.name}
                                                className="w-full h-full object-contain filter drop-shadow-[0_15px_20px_rgba(59,77,58,0.25)] transition-all duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-32 h-32 text-[#3B4D3A]/20" />
                                        </div>
                                    )}
                                </div>

                                {/* Name & Info - Pulled up closer on desktop */}
                                <Reveal delay={100} className="relative z-20 text-center mt-6 md:-mt-8 px-4 flex justify-center">
                                    <div className="inline-flex flex-col items-center px-7 py-3.5 bg-[#E8DCC3]/90 backdrop-blur-md rounded-[1.25rem] border border-[#DBCAB0] shadow-lg hover:shadow-xl hover:bg-[#E8DCC3] transition-all">
                                        <h4 className="text-lg md:text-xl font-extrabold text-[#3B4D3A] tracking-tight leading-none mb-0.5">{sambutanKetos.name}</h4>
                                        
                                        <div className="flex items-center w-full justify-center mt-1 mb-2 opacity-80">
                                            <Sparkles className="w-3 h-3 text-[#3B4D3A] shrink-0" />
                                            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-[#3B4D3A]/20 via-[#3B4D3A]/70 to-[#3B4D3A]/20 mx-2 rounded-full"></div>
                                            <Sparkles className="w-3 h-3 text-[#3B4D3A] shrink-0" />
                                        </div>

                                        <span className="text-[9px] md:text-[10px] font-bold text-[#3B4D3A]/90 uppercase tracking-[0.2em] text-center">
                                            {sambutanKetos.title}
                                        </span>
                                    </div>
                                </Reveal>
                            </div>
                        </div>

                        {/* Speech Content Right Column */}
                        <Reveal direction="right" delay={150} className="lg:col-span-3 space-y-6 md:space-y-6 relative z-10 px-4 md:px-0">
                            <div className="relative">
                                <Quote className="absolute -top-12 -left-4 md:-left-8 w-20 h-20 text-[#3B4D3A]/5 -rotate-12" />
                                <div className="inline-block px-3 py-1 rounded-lg bg-[#3B4D3A] text-white text-[9px] font-bold mb-4 md:mb-4 tracking-[0.2em] shadow-lg">
                                    SAMBUTAN KETUA OSIS
                                </div>
                                <h3 className="text-3xl md:text-5xl font-black text-[#1A1A1A] leading-[1.1] mb-6 md:mb-6">
                                    "Menjadi Wadah Inovasi <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B4D3A] to-[#6E8BA3]">Untuk SMKN 6 Unggul."</span>
                                </h3>

                                <div className="relative">
                                    <div className="absolute left-0 top-0 w-1 md:w-1.5 h-full bg-gradient-to-b from-[#E8DCC3] via-[#3B4D3A] to-transparent rounded-full" />
                                    <p className="text-base md:text-lg text-[#3B4D3A]/70 leading-relaxed italic pl-5 pr-2 md:pr-0 md:pl-10 font-medium relative z-10 whitespace-pre-line break-words text-justify">
                                        {sambutanKetos.content}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>

                {/* Core Values Section */}
                <Reveal direction="up" delay={50} className="mb-16 md:mb-24">
                    <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-6 md:p-12 shadow-sm">
                        <div className="text-center mb-8 md:mb-12">
                            <h3 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4" style={{ color: '#3B4D3A' }}>
                                Nilai-Nilai Inti
                            </h3>
                            <p className="text-base md:text-lg" style={{ color: '#6E8BA3' }}>
                                Fondasi yang memandu setiap langkah kami
                            </p>
                        </div>

                        <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-8">
                            {values.map((value, index) => {
                                const IconComponent = value.icon;
                                return (
                                    <div key={index} className="group text-center h-full rounded-xl hover:bg-white/50 transition-colors flex flex-col items-center">
                                        <div className="w-12 h-12 md:w-20 md:h-20 mx-auto mb-3 md:mb-6 rounded-xl md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#3B4D3A] to-[#2a3729] shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 shrink-0">
                                            <IconComponent className="w-5 h-5 md:w-10 md:h-10 text-white" />
                                        </div>
                                        <h4 className="text-[11px] md:text-xl font-bold mb-1 md:mb-3" style={{ color: '#3B4D3A' }}>
                                            {value.title}
                                        </h4>
                                        <p className="text-[10px] hidden sm:block md:text-sm leading-tight md:leading-relaxed" style={{ color: '#6E8BA3' }}>
                                            {value.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>

                {/* Enhanced Stats Section - HORIZONTAL ON MOBILE */}
                <Reveal direction="up" delay={50}>
                    <div className="bg-gradient-to-r from-[#3B4D3A]/5 to-[#6E8BA3]/5 rounded-3xl p-6 md:p-12 border border-gray-200/50">
                        <div className="text-center mb-8 md:mb-12">
                            <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4" style={{ color: '#3B4D3A' }}>
                                Pencapaian Kami
                            </h3>
                            <p className="text-sm md:text-lg" style={{ color: '#6E8BA3' }}>
                                Angka yang berbicara tentang dedikasi kami
                            </p>
                        </div>

                        {/* Changed to grid-cols-3 on mobile to save vertical space */}
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center group flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 md:w-16 md:h-16 mx-auto mb-2 md:mb-4 rounded-xl md:rounded-2xl flex items-center justify-center bg-white shadow-sm md:shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                                        <stat.icon className="w-5 h-5 md:w-8 md:h-8" style={{ color: '#3B4D3A' }} />
                                    </div>
                                    <div className="text-2xl md:text-5xl font-black mb-1 md:mb-2" style={{
                                        background: 'linear-gradient(135deg, #3B4D3A 0%, #2d3a2c 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        {stat.value}
                                    </div>
                                    <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider md:tracking-[0.2em]" style={{ color: '#6E8BA3' }}>
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>


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