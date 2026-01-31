import React, { useEffect, useState, useRef } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Image as ImageIcon, Upload, Trash2, Search, Filter, X, Eye, Bookmark, Star } from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import type { ProkerMedia, Proker } from '@/types';

const GalleryCmsPage: React.FC = () => {
    const [media, setMedia] = useState<ProkerMedia[]>([]);
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterProker, setFilterProker] = useState<string>('');
    const [filterType, setFilterType] = useState<string>('');
    const [selectedMedia, setSelectedMedia] = useState<ProkerMedia | null>(null);
    const [selectedProker, setSelectedProker] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [mediaRes, prokersRes] = await Promise.all([
                api.get('/proker-media'),
                api.get('/prokers', { params: { per_page: 100 } }),
            ]);
            setMedia(mediaRes.data);
            setProkers(prokersRes.data.data || prokersRes.data);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat data galeri', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = media.filter(item => {
        const matchesSearch = item.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.proker?.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProker = !filterProker || item.proker_id.toString() === filterProker;
        const matchesType = !filterType || item.media_type === filterType;
        return matchesSearch && matchesProker && matchesType;
    });

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedProker) {
            Swal.fire('Error', 'Pilih program kerja terlebih dahulu', 'error');
            return;
        }

        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            Swal.fire('Error', 'File harus berupa gambar (JPG, PNG, WEBP, dll)', 'error');
            return;
        }

        // 20MB limit
        if (file.size > 20 * 1024 * 1024) {
            Swal.fire('Error', 'Ukuran file maksimal 20MB', 'error');
            return;
        }

        const caption = await Swal.fire({
            title: 'Tambah Caption?',
            input: 'text',
            inputLabel: 'Caption (opsional)',
            inputPlaceholder: 'Masukkan caption untuk media ini...',
            showCancelButton: true,
            confirmButtonText: 'Upload',
            cancelButtonText: 'Batal',
            inputValidator: () => null,
        });

        if (caption.isDismissed) {
            e.target.value = '';
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (caption.value) {
                formData.append('caption', caption.value);
            }

            await api.post(`/prokers/${selectedProker}/media/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Swal.fire('Berhasil!', 'Media berhasil diupload', 'success');
            fetchData();
            setSelectedProker(null);
        } catch (error: any) {
            console.error(error);
            Swal.fire('Error', error.response?.data?.message || 'Gagal upload media', 'error');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDeleteMedia = async (media: ProkerMedia) => {
        const result = await Swal.fire({
            title: 'Hapus Media?',
            text: 'Apakah Anda yakin ingin menghapus media ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/prokers/${media.proker_id}/media/${media.id}`);
                Swal.fire('Terhapus!', 'Media berhasil dihapus', 'success');
                fetchData();
            } catch (error) {
                Swal.fire('Gagal!', 'Gagal menghapus media', 'error');
            }
        }
    };

    return (
        <>
            <Head title="CMS Galeri - OSINTRA" />
            <DashboardLayout>
                <div className="space-y-6 p-6 osintra-content">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-[#3B4D3A]">CMS Galeri</h1>
                            <p className="text-[#6E8BA3] mt-1 text-sm md:text-base">Kelola semua media dokumentasi program kerja</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <select
                                value={selectedProker || ''}
                                onChange={(e) => setSelectedProker(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent text-sm md:text-base"
                            >
                                <option value="">Pilih Program Kerja</option>
                                {prokers.map(proker => (
                                    <option key={proker.id} value={proker.id.toString()}>{proker.title}</option>
                                ))}
                            </select>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => {
                                    if (!selectedProker) {
                                        Swal.fire('Error', 'Pilih program kerja terlebih dahulu', 'error');
                                        return;
                                    }
                                    fileInputRef.current?.click();
                                }}
                                disabled={uploading || !selectedProker}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 bg-[#3B4D3A] text-white rounded-lg hover:bg-[#2d3a2d] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span className="hidden sm:inline">Upload Foto</span>
                                        <span className="sm:hidden">Upload</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari media..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent"
                                />
                            </div>
                            <select
                                value={filterProker}
                                onChange={(e) => setFilterProker(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent"
                            >
                                <option value="">Semua Program Kerja</option>
                                {prokers.map(proker => (
                                    <option key={proker.id} value={proker.id.toString()}>{proker.title}</option>
                                ))}
                            </select>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent"
                            >
                                <option value="">Semua Tipe</option>
                                <option value="image">Gambar</option>
                            </select>
                        </div>
                    </div>

                    {/* Media Grid */}
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Memuat...</p>
                        </div>
                    ) : filteredMedia.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-md">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">Tidak ada media yang ditemukan</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {filteredMedia.map((item) => (
                                <div
                                    key={item.id}
                                    className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedMedia(item)}
                                >
                                    {item.media_type === 'video' && !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(item.media_url) ? (
                                        <video
                                            src={item.media_url}
                                            className="w-full h-full object-cover"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={item.thumbnail_url || item.media_url}
                                            alt={item.caption || ''}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                if (target.src !== item.media_url) {
                                                    target.src = item.media_url;
                                                }
                                            }}
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteMedia(item);
                                                }}
                                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                title="Hapus"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            {item.media_type !== 'video' && (
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await api.put(`/prokers/${item.proker_id}/media/${item.id}/highlight`);
                                                            fetchData();
                                                            Swal.fire({
                                                                icon: 'success',
                                                                title: 'Berhasil',
                                                                text: 'Status highlight diperbarui',
                                                                timer: 1000,
                                                                showConfirmButton: false,
                                                                toast: true,
                                                                position: 'top-end'
                                                            });
                                                        } catch (error: any) {
                                                            Swal.fire('Error', error.response?.data?.message || 'Gagal update highlight', 'error');
                                                        }
                                                    }}
                                                    className={`p-2 rounded-lg transition ${item.is_highlight ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-blue-100'}`}
                                                    title={item.is_highlight ? "Highlight Aktif" : "Jadikan Highlight"}
                                                >
                                                    <Bookmark className={`w-4 h-4 ${item.is_highlight ? 'fill-current' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {item.is_thumbnail && (
                                        <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-current" /> Thumbnail
                                        </div>
                                    )}
                                    {item.is_highlight && !item.is_thumbnail && (
                                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10 flex items-center gap-1">
                                            <Bookmark className="w-3 h-3 fill-current" /> Highlight
                                        </div>
                                    )}
                                    {item.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                            <p className="text-white text-sm truncate">{item.caption}</p>
                                        </div>
                                    )}
                                    {item.proker && (
                                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                            {item.proker.title}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

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
                                {selectedMedia.media_type === 'video' && !/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(selectedMedia.media_url) ? (
                                    <video
                                        src={selectedMedia.media_url}
                                        controls
                                        className="w-full h-auto max-h-[90vh] rounded-lg"
                                    />
                                ) : (
                                    <img
                                        src={selectedMedia.media_url}
                                        alt={selectedMedia.caption || ''}
                                        className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                                    />
                                )}
                                <div className="mt-4 bg-white p-4 rounded-lg">
                                    {selectedMedia.proker && (
                                        <p className="text-sm text-gray-500 mb-2">Program Kerja: <span className="font-semibold text-[#3B4D3A]">{selectedMedia.proker.title}</span></p>
                                    )}
                                    {selectedMedia.caption && (
                                        <p className="text-gray-800">{selectedMedia.caption}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </>
    );
};

export default GalleryCmsPage;


