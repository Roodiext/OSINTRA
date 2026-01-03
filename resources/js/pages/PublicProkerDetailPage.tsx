import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import { ArrowLeft, Calendar, MapPin, Users, Image as ImageIcon, X } from 'lucide-react';
import api from '@/lib/axios';
import type { Proker, ProkerMedia } from '@/types';

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
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (prokerId) fetchProker();
    }, [prokerId]);

    if (loading) {
        return (
            <PublicLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-lg text-gray-500">Memuat...</p>
                </div>
            </PublicLayout>
        );
    }

    if (!proker) {
        return (
            <PublicLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-lg text-gray-500">Program kerja tidak ditemukan</p>
                </div>
            </PublicLayout>
        );
    }

    const statusColors = {
        planned: 'bg-yellow-100 text-yellow-800',
        ongoing: 'bg-blue-100 text-blue-800',
        done: 'bg-green-100 text-green-800',
    };

    const statusLabels = {
        planned: 'Direncanakan',
        ongoing: 'Berlangsung',
        done: 'Selesai',
    };

    return (
        <>
            <Head title={`${proker.title} - OSINTRA`} />
            <PublicLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                        {/* Back Button */}
                        <button
                            onClick={() => router.visit('/prokers')}
                            className="flex items-center gap-2 text-[#3B4D3A] hover:opacity-70 transition mb-6"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali ke Program Kerja
                        </button>

                        {/* Header Section */}
                        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg mb-6">
                            <div className="mb-4">
                                <h1 className="text-4xl font-bold text-[#3B4D3A] mb-2">{proker.title}</h1>
                                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColors[proker.status]}`}>
                                    {statusLabels[proker.status]}
                                </span>
                            </div>

                            {/* Event Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-6 h-6 text-[#3B4D3A]" />
                                    <div>
                                        <p className="text-sm text-gray-500">Tanggal Pelaksanaan</p>
                                        <p className="font-semibold text-gray-800">
                                            {proker.end_date && proker.end_date !== proker.date ? (
                                                <>
                                                    {new Date(proker.date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                    {' - '}
                                                    {new Date(proker.end_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </>
                                            ) : (
                                                new Date(proker.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="w-6 h-6 text-[#3B4D3A]" />
                                    <div>
                                        <p className="text-sm text-gray-500">Lokasi</p>
                                        <p className="font-semibold text-gray-800">{proker.location || '-'}</p>
                                    </div>
                                </div>

                                {proker.anggota && (
                                    <div className="flex items-center gap-3">
                                        <Users className="w-6 h-6 text-[#3B4D3A]" />
                                        <div>
                                            <p className="text-sm text-gray-500">Jumlah Panitia</p>
                                            <p className="font-semibold text-gray-800">{proker.anggota.length} orang</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description Section */}
                        {proker.description && (
                            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg mb-6">
                                <h2 className="text-2xl font-bold text-[#3B4D3A] mb-4">Deskripsi</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proker.description}</p>
                            </div>
                        )}

                        {/* Divisions Info */}
                        {proker.divisions && proker.divisions.length > 0 && (
                            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg mb-6">
                                <h2 className="text-2xl font-bold text-[#3B4D3A] mb-4">Divisi yang Terlibat</h2>
                                <div className="flex flex-wrap gap-2">
                                    {proker.divisions.map(div => (
                                        <span
                                            key={div.id}
                                            className="px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-full font-semibold"
                                        >
                                            {div.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Gallery Section */}
                        {proker.media && proker.media.length > 0 && (
                            <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 mb-4 md:mb-6">
                                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-[#3B4D3A]" />
                                    <h2 className="text-xl md:text-2xl font-bold text-[#3B4D3A]">Galeri Dokumentasi</h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                    {proker.media.map((media) => (
                                        <div
                                            key={media.id}
                                            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                            onClick={() => setSelectedMedia(media)}
                                        >
                                            {media.media_type === 'image' ? (
                                                <img
                                                    src={media.media_url}
                                                    alt={media.caption || ''}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <video
                                                    src={media.media_url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                />
                                            )}
                                            {media.caption && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                    <p className="text-white text-sm truncate">{media.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Media Preview Modal */}
                {selectedMedia && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedMedia(null)}
                    >
                        <div className="max-w-4xl w-full max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedMedia(null)}
                                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full hover:bg-gray-100 transition"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            {selectedMedia.media_type === 'image' ? (
                                <img
                                    src={selectedMedia.media_url}
                                    alt={selectedMedia.caption || ''}
                                    className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                                />
                            ) : (
                                <video
                                    src={selectedMedia.media_url}
                                    controls
                                    className="w-full h-auto max-h-[90vh] rounded-lg"
                                />
                            )}
                            {selectedMedia.caption && (
                                <div className="mt-4 bg-white p-4 rounded-lg">
                                    <p className="text-gray-800">{selectedMedia.caption}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </PublicLayout>
        </>
    );
};

export default PublicProkerDetailPage;


