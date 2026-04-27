import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import { ArrowLeft, X, Share2, Calendar, MapPin, Users, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import type { Proker, ProkerMedia } from '@/types';
import ProkerDetailContent from '@/components/public/ProkerDetailContent';
import OptimizedImage from '@/components/ui/OptimizedImage';

const PublicProkerDetailPage: React.FC = () => {
    const [proker, setProker] = useState<Proker | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<ProkerMedia | null>(null);
    const prokerId = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchProker = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/prokers/${prokerId}`);
                setProker(response.data);
            } catch (error) {
                console.error('Failed to fetch proker:', error);
            } finally {
                setLoading(false);
            }
        };

        if (prokerId) fetchProker();
        window.scrollTo(0, 0);
    }, [prokerId]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
                    <div className="max-w-7xl mx-auto animate-pulse space-y-8">
                        <div className="h-96 bg-gray-200 rounded-[3rem]" />
                        <div className="h-12 bg-gray-200 rounded-xl w-3/4" />
                        <div className="grid grid-cols-3 gap-6">
                            <div className="h-24 bg-gray-200 rounded-2xl" />
                            <div className="h-24 bg-gray-200 rounded-2xl" />
                            <div className="h-24 bg-gray-200 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    if (!proker) {
        return (
            <PublicLayout>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                        <X className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3B4D3A] mb-2">Proker Tidak Ditemukan</h2>
                    <p className="text-gray-500 mb-8">Maaf, informasi program kerja yang Anda cari tidak tersedia atau telah dihapus.</p>
                    <button
                        onClick={() => router.visit('/prokers')}
                        className="px-8 py-3 bg-[#3B4D3A] text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        Kembali ke Program Kerja
                    </button>
                </div>
            </PublicLayout>
        );
    }

    const thumbnail = proker.media?.find(m => m.is_thumbnail)?.media_url || proker.media?.[0]?.media_url || '/osvis-team.jpg';

    return (
        <PublicLayout>
            <Head>
                <title>{`${proker.title} - OSINTRA`}</title>
                <meta name="description" content={proker.description?.substring(0, 160) || `Detail program kerja ${proker.title} oleh OSIS SMKN 6 Surakarta.`} />
                
                {/* Dynamic Open Graph */}
                <meta property="og:title" content={`${proker.title} - OSINTRA`} />
                <meta property="og:description" content={proker.description?.substring(0, 160)} />
                <meta property="og:image" content={thumbnail} />
                <meta property="og:type" content="article" />
                
                {/* Dynamic Twitter Cards */}
                <meta name="twitter:title" content={`${proker.title} - OSINTRA`} />
                <meta name="twitter:description" content={proker.description?.substring(0, 160)} />
                <meta name="twitter:image" content={thumbnail} />
            </Head>
            
            <div className="min-h-screen bg-[#FDFBF7] pb-20">
                {/* Hero Section */}
                <div className="relative h-[40vh] md:h-[60vh] w-full overflow-hidden">
                    <OptimizedImage 
                        src={thumbnail} 
                        alt={proker.title}
                        priority
                        className="w-full h-full object-cover"
                        wrapperClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-black/20 to-black/40" />
                    
                    {/* Floating Navigation */}
                    <div className="absolute top-28 left-0 right-0 z-10">
                        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                            <button
                                onClick={() => router.visit('/prokers')}
                                className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-[#3B4D3A] transition-all group"
                            >
                                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <button className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white hover:text-[#3B4D3A] transition-all">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Container */}
                <div className="max-w-7xl mx-auto px-6 -mt-32 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left Column: Main Info */}
                        <div className="lg:col-span-8 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-[#3B4D3A]/5">
                            <ProkerDetailContent 
                                proker={proker} 
                                onMediaClick={(media) => setSelectedMedia(media)} 
                            />
                        </div>

                        {/* Right Column: Sidebar Info Card */}
                        <div className="lg:col-span-4 sticky top-28 space-y-6">
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl">
                                <h4 className="text-lg font-black text-[#3B4D3A] mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Informasi Panitia
                                </h4>
                                
                                {proker.anggota && proker.anggota.length > 0 ? (
                                    <div className="space-y-4">
                                        {proker.anggota.slice(0, 5).map((member, i) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-10 h-10 rounded-full bg-[#E8DCC3] flex items-center justify-center text-[#3B4D3A] font-bold text-sm border-2 border-white shadow-sm shrink-0">
                                                    {member.user?.name?.charAt(0) || 'P'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#3B4D3A] text-sm truncate group-hover:text-[#6E8BA3] transition-colors">
                                                        {member.user?.name}
                                                    </p>
                                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
                                                        {member.role || 'Anggota Panitia'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {proker.anggota.length > 5 && (
                                            <p className="text-xs text-center text-gray-400 pt-2 font-medium">
                                                + {proker.anggota.length - 5} anggota lainnya
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic">Belum ada panitia terdaftar.</p>
                                )}

                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <div className="flex items-center gap-4 text-gray-500 mb-4">
                                        <Building2 className="w-5 h-5 shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-bold text-[#3B4D3A]">OSIS SMKN 6 Surakarta</p>
                                            <p className="text-xs">Penyelenggara Kegiatan</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => router.visit('/contact')}
                                        className="w-full py-4 bg-[#3B4D3A]/5 hover:bg-[#3B4D3A]/10 text-[#3B4D3A] rounded-2xl text-sm font-bold transition-all border border-[#3B4D3A]/10"
                                    >
                                        Tanya Seputar Kegiatan
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Media Preview Modal */}
            {selectedMedia && (
                <div 
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-sm"
                    onClick={() => setSelectedMedia(null)}
                >
                    <button 
                        className="absolute top-10 right-10 p-4 text-white hover:rotate-90 transition-transform z-10"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    
                    <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                        {selectedMedia.media_type === 'image' ? (
                            <img 
                                src={selectedMedia.media_url} 
                                alt={selectedMedia.caption || proker.title}
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                            />
                        ) : (
                            <video 
                                src={selectedMedia.media_url} 
                                controls 
                                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl"
                            />
                        )}
                        {selectedMedia.caption && (
                            <div className="mt-8 text-center max-w-2xl">
                                <p className="text-white text-lg font-medium leading-relaxed italic">
                                    "{selectedMedia.caption}"
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PublicLayout>
    );
};

export default PublicProkerDetailPage;


