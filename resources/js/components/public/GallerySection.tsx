import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Video } from 'lucide-react';
import api from '@/lib/axios';
import type { ProkerMedia } from '@/types';

const GallerySection: React.FC = () => {
    const [media, setMedia] = useState<ProkerMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState<ProkerMedia | null>(null);

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                const response = await api.get('/proker-media');
                setMedia(response.data);
            } catch (error) {
                console.error('Failed to fetch media:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMedia();
    }, []);

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
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                        Galeri Kegiatan
                    </h2>
                    <div className="w-24 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#E8DCC3' }} />
                    <p style={{ color: '#6E8BA3' }} className="text-lg">
                        Dokumentasi kegiatan dan program kerja OSIS
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {media.slice(0, 9).map((item, index) => (
                        <div
                            key={item.id}
                            className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => setSelectedMedia(item)}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {item.media_type === 'image' ? (
                                <img
                                    src={item.media_url}
                                    alt={item.caption || 'Gallery image'}
                                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center">
                                    <Video className="w-16 h-16 text-white" />
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        {item.media_type === 'image' ? (
                                            <ImageIcon className="w-4 h-4" />
                                        ) : (
                                            <Video className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-semibold">
                                            {item.proker?.title || 'Kegiatan OSIS'}
                                        </span>
                                    </div>
                                    {item.caption && (
                                        <p className="text-sm text-gray-200 line-clamp-2">
                                            {item.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {media.length === 0 && (
                    <div className="text-center py-12">
                        <p style={{ color: '#6E8BA3' }}>Belum ada media yang tersedia</p>
                    </div>
                )}
            </div>

            {/* Modal for viewing media */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.media_type === 'image' ? (
                            <img
                                src={selectedMedia.media_url}
                                alt={selectedMedia.caption || 'Gallery image'}
                                className="w-full h-auto rounded-2xl"
                            />
                        ) : (
                            <video
                                src={selectedMedia.media_url}
                                controls
                                className="w-full h-auto rounded-2xl"
                            />
                        )}
                        {selectedMedia.caption && (
                            <div className="mt-4 text-white text-center">
                                <p className="text-lg">{selectedMedia.caption}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default GallerySection;
