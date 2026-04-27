import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Edit, Trash2, Search, Eye, Users, Image, Calendar, MapPin } from 'lucide-react';
import type { Proker, Division } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { usePermissionAlert } from '@/hooks/usePermissionAlert';

interface ProkersPageProps {
    prokers: Proker[];
    divisions: Division[];
    permissions?: {
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
}

const ProkersPage: React.FC<ProkersPageProps> = ({ prokers: initialProkers, divisions = [], permissions = {} }) => {
    const { props } = usePage<{ flash?: { permission_message?: string } }>();
    usePermissionAlert(props.flash?.permission_message);
    const [prokers] = useState<Proker[]>(initialProkers || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDivision, setFilterDivision] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [showModal, setShowModal] = useState(false);

    const [editingProker, setEditingProker] = useState<Proker | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        division_ids: [] as number[],
        date: '',
        end_date: '',
        location: '',
        status: 'planned' as 'planned' | 'ongoing' | 'done',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Helper function to safely parse date to YYYY-MM-DD format
    const formatDateForInput = (dateValue: string | null | undefined): string => {
        if (!dateValue || dateValue === 'undefined' || dateValue === 'null') return '';
        try {
            if (dateValue.includes('T')) return dateValue.split('T')[0];
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return dateValue;
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

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

            const startDate = formatDateForInput(proker.date);
            const endDate = formatDateForInput(proker.end_date);

            setFormData({
                title: proker.title,
                description: proker.description || '',
                division_ids: (proker.divisions || []).map((d: Division) => d.id),
                date: startDate,
                end_date: endDate,
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
                end_date: '',
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



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                division_ids: formData.division_ids.length > 0 ? formData.division_ids : [],
                end_date: formData.end_date || null,
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
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { errors?: Record<string, string[] | string>; message?: string } } };
            // Handle validation errors
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors as Record<string, string>);
                const errorMessages = Object.entries(err.response.data.errors)
                    .map(([field, msgs]) => {
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
                const statusCode = err.response?.status;
                const errorMessage = err.response?.data?.message || 'Terjadi kesalahan';

                if (statusCode === 403) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Akses Ditolak!',
                        text: 'Anda tidak memiliki izin untuk melakukan tindakan ini.',
                        confirmButtonColor: '#3B4D3A',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: errorMessage,
                        confirmButtonColor: '#3B4D3A',
                    });
                }
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
            } catch (error: unknown) {
                const err = error as { response?: { status?: number; data?: { message?: string } } };
                const statusCode = err.response?.status;
                const errorMessage = err.response?.data?.message || 'Terjadi kesalahan';

                if (statusCode === 403) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Akses Ditolak!',
                        text: 'Anda tidak memiliki izin untuk menghapus proker ini.',
                        confirmButtonColor: '#3B4D3A',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: errorMessage,
                        confirmButtonColor: '#3B4D3A',
                    });
                }
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
                        {permissions?.can_create && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Proker
                            </button>
                        )}
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
                        {filteredProkers.map((proker) => {
                            const thumbnail = proker.media?.find(m => m.is_thumbnail) || proker.media?.find(m => m.media_type === 'image');

                            return (
                                <div
                                    key={proker.id}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col h-full group"
                                >
                                    {/* Image Header with Thumbnail support */}
                                    <div className="h-48 w-full bg-[#F5F5F5] relative overflow-hidden">
                                        {thumbnail ? (
                                            <img
                                                src={thumbnail.media_url}
                                                alt={proker.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[#6E8BA3]">
                                                <Image className="w-10 h-10 mb-2 opacity-50" />
                                                <span className="text-xs font-medium">Belum ada dokumentasi</span>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm backdrop-blur-md border border-white/20 flex items-center gap-1.5 ${proker.status === 'done' ? 'bg-green-100/90 text-green-700' :
                                                proker.status === 'ongoing' ? 'bg-yellow-100/90 text-yellow-700' :
                                                    'bg-blue-100/90 text-blue-700'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${proker.status === 'done' ? 'bg-green-500' :
                                                    proker.status === 'ongoing' ? 'bg-yellow-500' :
                                                        'bg-blue-500'
                                                    }`}></span>
                                                {getStatusLabel(proker.status)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col">
                                        <h3 className="text-lg font-bold text-[#3B4D3A] mb-2 line-clamp-1" title={proker.title}>
                                            {proker.title}
                                        </h3>

                                        <p className="text-sm text-[#6E8BA3] mb-4 leading-relaxed flex-grow line-clamp-2">
                                            {proker.description || 'Tidak ada deskripsi'}
                                        </p>

                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center gap-2 text-sm text-[#6E8BA3]">
                                                <Users className="w-4 h-4 flex-shrink-0 text-[#3B4D3A]" />
                                                <span className="line-clamp-1">{proker.divisions?.map(d => d.name).join(', ') || 'Umum'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-[#6E8BA3]">
                                                <Calendar className="w-4 h-4 flex-shrink-0 text-[#3B4D3A]" />
                                                <span>
                                                    {proker.end_date && proker.end_date !== proker.date ? (
                                                        <>
                                                            {new Date(proker.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(proker.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </>
                                                    ) : (
                                                        new Date(proker.date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })
                                                    )}
                                                </span>
                                            </div>
                                            {proker.location && (
                                                <div className="flex items-center gap-2 text-sm text-[#6E8BA3]">
                                                    <MapPin className="w-4 h-4 flex-shrink-0 text-[#3B4D3A]" />
                                                    <span className="line-clamp-1">{proker.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                                            <button
                                                onClick={() => router.visit(`/dashboard/prokers/${proker.id}`)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all font-bold text-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Detail
                                            </button>
                                            {permissions?.can_edit && (
                                                <button
                                                    onClick={() => handleOpenModal(proker)}
                                                    className="p-2 bg-gray-100 text-[#6E8BA3] rounded-lg hover:bg-gray-200 transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            {permissions?.can_delete && (
                                                <button
                                                    onClick={() => handleDelete(proker)}
                                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95%] sm:max-w-4xl p-4 sm:p-8 my-4 transition-all relative max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-2xl font-bold text-[#3B4D3A]">
                                    {editingProker ? 'Edit Proker' : 'Tambah Proker'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-1.5 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
                                >
                                    <span className="text-xl sm:text-2xl leading-none">&times;</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                Judul Proker * {errors.title && <span className="text-red-600">({errors.title[0]})</span>}
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className={`w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-[#F5F5F5] border-2 ${errors.title ? 'border-red-500' : 'border-transparent'} rounded-lg sm:rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all`}
                                                placeholder="Contoh: Pelatihan Kepemimpinan"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                Deskripsi * {errors.description && <span className="text-red-600">({errors.description[0]})</span>}
                                            </label>
                                            <textarea
                                                required
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={4}
                                                className={`w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-[#F5F5F5] border-2 ${errors.description ? 'border-red-500' : 'border-transparent'} rounded-lg sm:rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all resize-none`}
                                                placeholder="Deskripsi proker..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                Lokasi
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-[#F5F5F5] border-2 border-transparent rounded-lg sm:rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                placeholder="Contoh: Aula Sekolah"
                                            />
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-3 sm:space-y-4">
                                        {/* Division & Status Row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                    Divisi * {errors.division_ids && <span className="text-red-600">({errors.division_ids[0]})</span>}
                                                </label>
                                                <div className="w-full bg-[#F5F5F5] border-2 border-transparent rounded-lg sm:rounded-xl focus-within:border-[#3B4D3A] transition-all p-3 max-h-60 overflow-y-auto custom-scrollbar">
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {divisions.map((division) => (
                                                            <label
                                                                key={division.id}
                                                                className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${formData.division_ids.includes(division.id)
                                                                        ? 'bg-[#3B4D3A]/10 border-[#3B4D3A] shadow-sm'
                                                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <div className="relative flex items-center justify-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        value={division.id}
                                                                        checked={formData.division_ids.includes(division.id)}
                                                                        onChange={(e) => {
                                                                            const id = parseInt(e.target.value);
                                                                            const newIds = e.target.checked
                                                                                ? [...formData.division_ids, id]
                                                                                : formData.division_ids.filter((dId) => dId !== id);
                                                                            setFormData({ ...formData, division_ids: newIds });
                                                                        }}
                                                                        className="peer appearance-none w-5 h-5 border-2 border-[#6E8BA3] rounded checked:bg-[#3B4D3A] checked:border-[#3B4D3A] transition-colors"
                                                                    />
                                                                    <svg
                                                                        className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                        strokeWidth="3"
                                                                    >
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                                <span className={`text-sm font-medium ${formData.division_ids.includes(division.id) ? 'text-[#3B4D3A]' : 'text-[#6E8BA3]'
                                                                    }`}>
                                                                    {division.name}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                    Status *
                                                </label>
                                                <select
                                                    required
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'planned' | 'ongoing' | 'done' })}
                                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm bg-[#F5F5F5] border-2 border-transparent rounded-lg sm:rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                >
                                                    <option value="planned">Direncanakan</option>
                                                    <option value="ongoing">Berlangsung</option>
                                                    <option value="done">Selesai</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                    Tanggal Mulai * {errors.date && <span className="text-red-600">({errors.date[0]})</span>}
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        required
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        className={`w-full pl-10 pr-4 py-2 sm:py-3 text-sm bg-[#F5F5F5] border-2 ${errors.date ? 'border-red-500' : 'border-transparent'} rounded-lg sm:rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-semibold text-[#3B4D3A] mb-1.5 sm:mb-2">
                                                    Tanggal Selesai <span className="text-gray-400 font-normal text-xs">(Opsional)</span>
                                                </label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        value={formData.end_date}
                                                        min={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 sm:py-3 text-sm bg-[#F5F5F5] border-2 border-transparent rounded-lg sm:rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div> {/* End Right Column */}
                                </div> {/* End Grid 2 Cols */}

                                {/* Footer Buttons */}
                                <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-white text-[#6E8BA3] border-2 border-gray-100 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all font-bold text-xs sm:text-base"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 bg-[#3B4D3A] text-white rounded-lg sm:rounded-xl hover:bg-[#2d3a2d] transition-all font-bold disabled:opacity-50 shadow-lg shadow-[#3B4D3A]/20 text-xs sm:text-base"
                                    >
                                        {loading ? 'Menyimpan...' : 'Simpan Proker'}
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
                                        <p className="text-[#6E8BA3]">
                                            {viewingProker.end_date && viewingProker.end_date !== viewingProker.date ? (
                                                <>
                                                    {new Date(viewingProker.date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })} - {new Date(viewingProker.end_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </>
                                            ) : (
                                                new Date(viewingProker.date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })
                                            )}
                                        </p>
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
