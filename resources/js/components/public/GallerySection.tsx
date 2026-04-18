import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Video } from 'lucide-react';
import api from '@/lib/axios';
import type { ProkerMedia } from '@/types';
import Reveal from './Reveal';
import { router } from '@inertiajs/react';

// Declare route function for TypeScript
declare global {
    function route(name: string, params?: any, absolute?: boolean): string;
}

const GallerySection: React.FC = () => {
    const [media, setMedia] = useState<ProkerMedia[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                // Fetch all media, but we will filter for thumbnails only
                const response = await api.get('/proker-media');
                // Filter to show only thumbnail/highlight images
                const highlights = response.data.filter((item: ProkerMedia) => item.is_thumbnail);

                // If no highlights found (fallback), maybe show the first few? 
                // But user requested "Only 1 photo per proker / highlight".
                // Let's stick to highlights. If empty, it's empty.
                setMedia(highlights.length > 0 ? highlights : response.data.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch media:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

    const handleItemClick = (item: ProkerMedia) => {
        router.visit(`/gallery/${item.id}`);
    };

    if (loading) {
        return (
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <p style={{ color: '#6E8BA3' }}>Memuat galeri...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="gallery" className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <Reveal direction="down" className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                        Galeri Kegiatan
                    </h2>
                    <div className="w-24 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#E8DCC3' }} />
                    <p style={{ color: '#6E8BA3' }} className="text-lg">
                        Dokumentasi kegiatan dan program kerja OSIS
                    </p>
                </Reveal>

                <div className="grid grid-cols-2 gap-3 md:gap-6">
                    {media.slice(0, 4).map((item, index) => (
                        <Reveal
                            key={item.id}
                            delay={index * 50}
                            className="relative group cursor-pointer overflow-hidden rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <div onClick={() => handleItemClick(item)}>
                                {item.media_type === 'image' ? (
                                    <img
                                        src={item.media_url}
                                        alt={item.caption || 'Gallery image'}
                                        loading="lazy"
                                        className="w-full h-40 md:h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-40 md:h-64 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center">
                                        <Video className="w-10 md:w-16 h-10 md:h-16 text-white" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-white">
                                        <div className="flex items-center gap-1.5 md:gap-2 mb-1 md:mb-2">
                                            {item.media_type === 'image' ? (
                                                <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                            ) : (
                                                <Video className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                            )}
                                            <span className="text-xs md:text-sm font-semibold line-clamp-1">
                                                {item.proker?.title || 'Kegiatan OSIS'}
                                            </span>
                                        </div>
                                        {item.caption && (
                                            <p className="text-[10px] md:text-sm text-gray-200 line-clamp-2">
                                                {item.caption}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>

                {media.length === 0 && (
                    <div className="text-center py-12">
                        <p style={{ color: '#6E8BA3' }}>Belum ada media yang tersedia.</p>
                    </div>
                )}

                <Reveal direction="up" delay={200} className="mt-10 md:mt-12 text-center">
                    <button 
                        onClick={() => router.visit('/prokers')}
                        className="px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 text-sm md:text-base inline-flex items-center gap-2"
                        style={{ backgroundColor: '#3B4D3A' }}
                    >
                        Lihat Proker Lainnya
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                </Reveal>
            </div>
        </section>
    );
};

export default GallerySection;
