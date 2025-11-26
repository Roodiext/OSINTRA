import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Edit, Trash2, Search, Eye, Users, Image, Calendar, MapPin } from 'lucide-react';
import type { Proker, Division } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';

interface ProkersPageProps {
    prokers: Proker[];
    divisions: Division[];
}

const ProkersPage: React.FC<ProkersPageProps> = ({ prokers: initialProkers, divisions }) => {
    const [prokers, setProkers] = useState<Proker[]>(initialProkers || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDivision, setFilterDivision] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingProker, setEditingProker] = useState<Proker | null>(null);
    const [viewingProker, setViewingProker] = useState<Proker | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        division_ids: [] as number[],
        date: '',
        location: '',
        status: 'planned' as 'planned' | 'ongoing' | 'done',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const filteredProkers = prokers.filter(proker => {
        const matchesSearch = proker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proker.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDivision = !filterDivision || 
            (proker.divisions && proker.divisions.some(d => d.id.toString() === filterDivision)) ||
            (proker.division_id && proker.division_id.toString() === filterDivision);
        const matchesStatus = !filterStatus || proker.status === filterStatus;
        return matchesSearch && matchesDivision && matchesStatus;
    });

    const handleOpenModal = (proker?: Proker) => {
        setErrors({});
        if (proker) {
            setEditingProker(proker);
            setFormData({
                title: proker.title,
                description: proker.description || '',
                division_ids: (proker.divisions || []).map((d: Division) => d.id),
                date: proker.date,
                location: proker.location || '',
                status: proker.status,
            });
        } else {
            setEditingProker(null);
            setFormData({
                title: '',
                description: '',
                division_ids: [],
                date: '',
                location: '',
                status: 'planned',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProker(null);
    };

    const handleViewDetail = async (proker: Proker) => {
        try {
            const response = await api.get(`/prokers/${proker.id}`);
            setViewingProker(response.data);
            setShowDetailModal(true);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Gagal memuat detail proker',
                confirmButtonColor: '#3B4D3A',
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                division_ids: formData.division_ids.length > 0 ? formData.division_ids : [],
            };

            if (editingProker) {
                await api.put(`/prokers/${editingProker.id}`, submitData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Proker berhasil diperbarui',
                    confirmButtonColor: '#3B4D3A',
                });
            } else {
                await api.post('/prokers', submitData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Proker berhasil ditambahkan',
                    confirmButtonColor: '#3B4D3A',
                });
            }
            router.reload();
            handleCloseModal();
        } catch (error: any) {
            // Handle validation errors
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
                const errorMessages = Object.entries(error.response.data.errors)
                    .map(([field, msgs]: [string, any]) => {
                        const fieldLabel = field
                            .replace(/_/g, ' ')
                            .replace(/^\w/, c => c.toUpperCase());
                        return `${fieldLabel}: ${Array.isArray(msgs) ? msgs[0] : msgs}`;
                    })
                    .join('\n');
                Swal.fire({
                    icon: 'error',
                    title: 'Validasi Gagal!',
                    text: errorMessages,
                    confirmButtonColor: '#3B4D3A',
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: error.response?.data?.message || 'Terjadi kesalahan',
                    confirmButtonColor: '#3B4D3A',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (proker: Proker) => {
        const result = await Swal.fire({
            title: 'Hapus Proker?',
            text: `Apakah Anda yakin ingin menghapus proker "${proker.title}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/prokers/${proker.id}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Proker berhasil dihapus',
                    confirmButtonColor: '#3B4D3A',
                });
                router.reload();
            } catch (error: any) {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: error.response?.data?.message || 'Terjadi kesalahan',
                    confirmButtonColor: '#3B4D3A',
                });
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'done': return 'bg-green-100 text-green-700 border-green-300';
            case 'ongoing': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default: return 'bg-blue-100 text-blue-700 border-blue-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done': return 'Selesai';
            case 'ongoing': return 'Berlangsung';
            default: return 'Direncanakan';
        }
    };

    return (
        <>
            <Head title="Program Kerja - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#3B4D3A]">Program Kerja</h1>
                            <p className="text-[#6E8BA3] mt-1">Kelola program kerja OSIS</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Proker
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="text"
                                    placeholder="Cari proker..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <select
                                value={filterDivision}
                                onChange={(e) => setFilterDivision(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Divisi</option>
                                {divisions.map(division => (
                                    <option key={division.id} value={division.id}>{division.name}</option>
                                ))}
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Status</option>
                                <option value="planned">Direncanakan</option>
                                <option value="ongoing">Berlangsung</option>
                                <option value="done">Selesai</option>
                            </select>
                        </div>
                    </div>

                    {/* Prokers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProkers.map((proker) => (
                            <div
                                key={proker.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4 border-[#3B4D3A]"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-[#3B4D3A] line-clamp-2 flex-1">
                                            {proker.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusColor(proker.status)}`}>
                                            {getStatusLabel(proker.status)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-[#6E8BA3] mb-4 line-clamp-2">
                                        {proker.description || 'Tidak ada deskripsi'}
                                    </p>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-[#6E8BA3]">
                                            <Users className="w-4 h-4" />
                                            <span>{proker.division?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-[#6E8BA3]">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(proker.date).toLocaleDateString('id-ID')}</span>
                                        </div>
                                        {proker.location && (
                                            <div className="flex items-center gap-2 text-sm text-[#6E8BA3]">
                                                <MapPin className="w-4 h-4" />
                                                <span className="line-clamp-1">{proker.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.visit(`/dashboard/prokers/${proker.id}`)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all font-medium"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Detail
                                        </button>
                                        <button
                                            onClick={() => handleOpenModal(proker)}
                                            className="p-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(proker)}
                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 bg-[#F5F5F5]">
                                    <div
                                        className={`h-full transition-all ${
                                            proker.status === 'done' ? 'bg-green-500 w-full' :
                                            proker.status === 'ongoing' ? 'bg-yellow-500 w-2/3' :
                                            'bg-blue-500 w-1/3'
                                        }`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredProkers.length === 0 && (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <Image className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                            <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada proker ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 my-8">
                            <h2 className="text-2xl font-bold text-[#3B4D3A] mb-6">
                                {editingProker ? 'Edit Proker' : 'Tambah Proker'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Judul Proker * {errors.title && <span className="text-red-600">({errors.title[0]})</span>}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={`w-full px-4 py-3 bg-[#F5F5F5] border-2 ${errors.title ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all`}
                                        placeholder="Contoh: Pelatihan Kepemimpinan"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Deskripsi * {errors.description && <span className="text-red-600">({errors.description[0]})</span>}
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className={`w-full px-4 py-3 bg-[#F5F5F5] border-2 ${errors.description ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all resize-none`}
                                        placeholder="Deskripsi proker..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                            Divisi * {errors.division_ids && <span className="text-red-600">({errors.division_ids[0]})</span>}
                                        </label>
                                        <select
                                            multiple
                                            required
                                            value={formData.division_ids.map(String)}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                                setFormData({ ...formData, division_ids: selected });
                                            }}
                                            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                        >
                                            {divisions.map(division => (
                                                <option key={division.id} value={division.id}>{division.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                            Status *
                                        </label>
                                        <select
                                            required
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                        >
                                            <option value="planned">Direncanakan</option>
                                            <option value="ongoing">Berlangsung</option>
                                            <option value="done">Selesai</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                            Tanggal * {errors.date && <span className="text-red-600">({errors.date[0]})</span>}
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className={`w-full px-4 py-3 bg-[#F5F5F5] border-2 ${errors.date ? 'border-red-500' : 'border-transparent'} rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all`}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                            Lokasi
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            placeholder="Contoh: Aula Sekolah"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-6 py-3 bg-[#F5F5F5] text-[#6E8BA3] rounded-xl hover:bg-[#E8DCC3] transition-all font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold disabled:opacity-50"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && viewingProker && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 my-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-[#3B4D3A] mb-2">{viewingProker.title}</h2>
                                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide border ${getStatusColor(viewingProker.status)}`}>
                                        {getStatusLabel(viewingProker.status)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-[#6E8BA3] hover:text-[#3B4D3A] text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-[#3B4D3A] mb-2">Deskripsi</h3>
                                    <p className="text-[#6E8BA3]">{viewingProker.description || 'Tidak ada deskripsi'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-[#3B4D3A] mb-1">Divisi</h3>
                                        <p className="text-[#6E8BA3]">{viewingProker.division?.name}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[#3B4D3A] mb-1">Tanggal</h3>
                                        <p className="text-[#6E8BA3]">{new Date(viewingProker.date).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    {viewingProker.location && (
                                        <div className="col-span-2">
                                            <h3 className="text-sm font-bold text-[#3B4D3A] mb-1">Lokasi</h3>
                                            <p className="text-[#6E8BA3]">{viewingProker.location}</p>
                                        </div>
                                    )}
                                </div>

                                {viewingProker.anggota && viewingProker.anggota.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-[#3B4D3A] mb-3">Anggota Tim</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {viewingProker.anggota.map((anggota) => (
                                                <div key={anggota.id} className="bg-[#F5F5F5] rounded-lg p-3 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#E8DCC3] rounded-full flex items-center justify-center text-[#3B4D3A] font-bold">
                                                        {anggota.user?.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-[#1E1E1E]">{anggota.user?.name}</p>
                                                        <p className="text-xs text-[#6E8BA3]">{anggota.role || 'Anggota'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {viewingProker.media && viewingProker.media.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold text-[#3B4D3A] mb-3">Media</h3>
                                        <div className="grid grid-cols-3 gap-3">
                                            {viewingProker.media.map((media) => (
                                                <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-[#F5F5F5]">
                                                    {media.media_type === 'image' ? (
                                                        <img src={media.media_url} alt={media.caption || ''} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <video src={media.media_url} className="w-full h-full object-cover" controls />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-full mt-6 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
};

export default ProkersPage;
