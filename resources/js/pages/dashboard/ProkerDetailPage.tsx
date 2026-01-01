import React, { useEffect, useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArrowLeft, Calendar, MapPin, Users, BookOpen, Edit, Trash2, Plus, Image as ImageIcon, X, Upload } from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import AddPanitiaModal from '@/components/dashboard/AddPanitiaModal';
import EditDivisionsModal from '@/components/dashboard/EditDivisionsModal';
import type { ProkerMedia } from '@/types';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface Position {
    id: number;
    name: string;
    description?: string;
}

interface Division {
    id: number;
    name: string;
}

interface ProkerAnggota {
    id: number;
    user_id: number;
    division_id: number;
    position_id: number;
    role?: string;
    user: User;
    position?: Position;
    division: Division;
}

interface Proker {
    id: number;
    title: string;
    description?: string;
    date: string;
    location?: string;
    status: 'planned' | 'ongoing' | 'done';
    divisions: Division[];
    anggota: ProkerAnggota[];
    media: ProkerMedia[];
}

const ProkerDetailPage: React.FC = () => {
    const [proker, setProker] = useState<Proker | null>(null);
    const [loading, setLoading] = useState(true);
    const [positions, setPositions] = useState<Position[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [showAddPanitiaModal, setShowAddPanitiaModal] = useState(false);
    const [showEditDivisionsModal, setShowEditDivisionsModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<ProkerMedia | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const prokerId = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prokerRes, positionsRes, divisionsRes] = await Promise.all([
                    api.get(`/prokers/${prokerId}`),
                    api.get('/positions'),
                    api.get('/divisions'),
                ]);
                setProker(prokerRes.data);
                setPositions(positionsRes.data.data || []);
                // Divisions API mengembalikan array langsung, bukan wrapped dalam 'data'
                const divisionsData = Array.isArray(divisionsRes.data) ? divisionsRes.data : (divisionsRes.data.data || []);
                setDivisions(divisionsData);
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Gagal memuat detail proker', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (prokerId) fetchData();
    }, [prokerId]);

    const handleDeletePanitia = async (anggotaId: number) => {
        const result = await Swal.fire({
            title: 'Hapus Panitia?',
            text: 'Apakah Anda yakin ingin menghapus panitia ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed && proker) {
            try {
                await api.delete(`/prokers/${proker.id}/anggota/${anggotaId}`);
                Swal.fire('Terhapus!', 'Panitia berhasil dihapus', 'success');
                const response = await api.get(`/prokers/${proker.id}`);
                setProker(response.data);
            } catch (error) {
                Swal.fire('Gagal!', 'Gagal menghapus panitia', 'error');
            }
        }
    };

    const handleAddPanitiaSuccess = async () => {
        if (proker) {
            const response = await api.get(`/prokers/${proker.id}`);
            setProker(response.data);
        }
    };

    const handleEditDivisionsSuccess = async () => {
        if (proker) {
            const response = await api.get(`/prokers/${proker.id}`);
            setProker(response.data);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !proker) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
            Swal.fire('Error', 'File harus berupa gambar atau video', 'error');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            Swal.fire('Error', 'Ukuran file maksimal 10MB', 'error');
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

            await api.post(`/prokers/${proker.id}/media/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Swal.fire('Berhasil!', 'Media berhasil diupload', 'success');

            // Refresh proker data
            const response = await api.get(`/prokers/${proker.id}`);
            setProker(response.data);
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

        if (result.isConfirmed && proker) {
            try {
                await api.delete(`/prokers/${proker.id}/media/${media.id}`);
                Swal.fire('Terhapus!', 'Media berhasil dihapus', 'success');

                // Refresh proker data
                const response = await api.get(`/prokers/${proker.id}`);
                setProker(response.data);
            } catch (error) {
                Swal.fire('Gagal!', 'Gagal menghapus media', 'error');
            }
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <p className="text-lg text-gray-500">Memuat...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!proker) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <p className="text-lg text-gray-500">Proker tidak ditemukan</p>
                </div>
            </DashboardLayout>
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

    // Group anggota by division
    const anggotaByDivision = proker.anggota.reduce((acc, member) => {
        const divisionId = member.division_id;
        if (!acc[divisionId]) {
            acc[divisionId] = {
                division: member.division,
                members: [],
            };
        }
        acc[divisionId].members.push(member);
        return acc;
    }, {} as Record<number, { division: Division; members: ProkerAnggota[] }>);

    return (
        <>
            <Head title={`${proker.title} - OSINTRA`} />
            <DashboardLayout>
                <div className="space-y-6 p-4 md:p-6 osintra-content">
                    {/* Back Button */}
                    <button
                        onClick={() => router.visit('/dashboard/prokers')}
                        className="flex items-center gap-2 text-[#3B4D3A] hover:opacity-70 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Program Kerja
                    </button>

                    {/* Header Section */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div className="space-y-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-[#3B4D3A] leading-tight">
                                    {proker.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[proker.status]}`}>
                                        {statusLabels[proker.status]}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2 self-end md:self-start">
                                <button
                                    onClick={() => router.visit(`/dashboard/prokers/${proker.id}/edit`)}
                                    className="p-3 bg-[#3B4D3A] text-white rounded-xl hover:opacity-90 transition shadow-md"
                                    title="Edit"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: implement delete
                                    }}
                                    className="p-3 bg-red-500 text-white rounded-xl hover:opacity-90 transition shadow-md"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Event Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-[#3B4D3A]" />
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Pelaksanaan</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(proker.date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
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

                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-[#3B4D3A]" />
                                <div>
                                    <p className="text-sm text-gray-500">Jumlah Panitia</p>
                                    <p className="font-semibold text-gray-800">{proker.anggota.length} orang</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {proker.description && (
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="w-6 h-6 text-[#3B4D3A]" />
                                <h2 className="text-2xl font-bold text-[#3B4D3A]">Penjelasan Event</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proker.description}</p>
                        </div>
                    )}

                    {/* Divisions Info */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h2 className="text-2xl font-bold text-[#3B4D3A]">Divisi yang Terlibat</h2>
                            <button
                                onClick={() => setShowEditDivisionsModal(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#3B4D3A] text-white rounded-xl hover:opacity-90 transition text-sm font-bold shadow-md"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Divisi
                            </button>
                        </div>
                        {proker.divisions.length > 0 ? (
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
                        ) : (
                            <p className="text-gray-500">Belum ada divisi yang dipilih. Klik tombol Edit Divisi untuk menambahkan.</p>
                        )}
                    </div>

                    {/* Panitia List */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <h2 className="text-2xl font-bold text-[#3B4D3A]">Daftar Panitia</h2>
                            <button
                                onClick={() => setShowAddPanitiaModal(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-bold shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Panitia
                            </button>
                        </div>

                        {proker.anggota.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Belum ada panitia yang ditambahkan</p>
                        ) : (
                            <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                                <table className="w-full text-left text-sm min-w-[600px]">
                                    <colgroup>
                                        <col className="w-[50px]" />
                                        <col className="w-auto" />
                                        <col className="w-[150px]" />
                                        <col className="w-[150px]" />
                                        <col className="w-[100px]" />
                                        <col className="w-[80px]" />
                                    </colgroup>
                                    <thead>
                                        <tr className="bg-[#E8DCC3]">
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">#</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Nama</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Divisi</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Posisi</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Role</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proker.anggota.map((member, idx) => (
                                            <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-6 py-4">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-800">{member.user.name}</p>
                                                    <p className="text-xs text-gray-500">{member.user.username}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{member.division?.name || '-'}</td>
                                                <td className="px-6 py-4 text-gray-700">{member.position?.name || '-'}</td>
                                                <td className="px-6 py-4 text-gray-700">{member.role || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDeletePanitia(member.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Members by Division */}
                    {Object.keys(anggotaByDivision).length > 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-[#3B4D3A] mb-6">Struktur Panitia Per Divisi</h2>

                            <div className="space-y-8">
                                {Object.values(anggotaByDivision).map(({ division, members }) => (
                                    <div key={division.id} className="border-l-4 border-[#3B4D3A] pl-6">
                                        <h3 className="text-xl font-bold text-[#3B4D3A] mb-4">{division.name}</h3>

                                        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
                                            <table className="w-full text-left text-sm min-w-[500px]">
                                                <colgroup>
                                                    <col className="w-[40px] md:w-[60px]" />
                                                    <col className="w-auto" />
                                                    <col className="w-[120px] md:w-[200px]" />
                                                    <col className="w-[120px] md:w-[200px]" />
                                                </colgroup>
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 font-semibold text-gray-700">#</th>
                                                        <th className="px-4 py-2 font-semibold text-gray-700">Nama</th>
                                                        <th className="px-4 py-2 font-semibold text-gray-700">Posisi</th>
                                                        <th className="px-4 py-2 font-semibold text-gray-700">Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {members.map((member, idx) => (
                                                        <tr key={member.id} className="border-b border-gray-200">
                                                            <td className="px-4 py-3">{idx + 1}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-semibold text-gray-800">{member.user.name}</p>
                                                                <p className="text-xs text-gray-500">{member.user.username}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700">
                                                                {member.position?.name || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700">{member.role || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery Section */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#E8DCC3] rounded-lg">
                                    <ImageIcon className="w-6 h-6 text-[#3B4D3A]" />
                                </div>
                                <h2 className="text-2xl font-bold text-[#3B4D3A]">Galeri Dokumentasi</h2>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Tambah Media
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {proker.media && proker.media.length > 0 ? (
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
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteMedia(media);
                                                    }}
                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {media.caption && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                                <p className="text-white text-sm truncate">{media.caption}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 mb-4">Belum ada media dokumentasi</p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-[#3B4D3A] text-white rounded-lg hover:bg-[#2d3a2d] transition-all font-semibold"
                                >
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Upload Media Pertama
                                </button>
                            </div>
                        )}
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

                    {/* Add Panitia Modal */}
                    <AddPanitiaModal
                        isOpen={showAddPanitiaModal}
                        onClose={() => setShowAddPanitiaModal(false)}
                        onSuccess={handleAddPanitiaSuccess}
                        prokerId={proker.id}
                        eventDivisions={proker.divisions}
                        positions={positions}
                    />

                    {/* Edit Divisions Modal */}
                    <EditDivisionsModal
                        isOpen={showEditDivisionsModal}
                        onClose={() => setShowEditDivisionsModal(false)}
                        onSuccess={handleEditDivisionsSuccess}
                        prokerId={proker.id}
                        currentDivisions={proker.divisions}
                        availableDivisions={divisions}
                    />
                </div>
            </DashboardLayout>
        </>
    );
};

export default ProkerDetailPage;