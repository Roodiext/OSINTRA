import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import { ArrowLeft, X, Building2 } from 'lucide-react';
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
                                <div className="flex items-center gap-4 text-gray-500 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#3B4D3A]/5 flex items-center justify-center shrink-0">
                                        <Building2 className="w-6 h-6 text-[#3B4D3A]" />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-black text-[#3B4D3A] text-base">OSIS SMKN 6 Surakarta</p>
                                        <p className="text-xs text-gray-400 font-medium">Penyelenggara Kegiatan</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => router.visit('/contact')}
                                    className="w-full py-4 bg-[#3B4D3A] hover:bg-[#2d3b2c] text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-[#3B4D3A]/20 flex items-center justify-center gap-2"
                                >
                                    Tanya Seputar Kegiatan
                                </button>
                                
                                <p className="mt-4 text-[10px] text-center text-gray-400 font-medium">
                                    Hubungi kami jika memiliki pertanyaan atau aspirasi terkait program ini.
                                </p>
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


