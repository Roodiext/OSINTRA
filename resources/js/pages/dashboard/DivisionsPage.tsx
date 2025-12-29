import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import type { Division } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';

interface DivisionsPageProps {
    divisions: Division[];
}

const DivisionsPage: React.FC<DivisionsPageProps> = ({ divisions: initialDivisions }) => {
    const [divisions, setDivisions] = useState<Division[]>(initialDivisions || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDivision, setEditingDivision] = useState<Division | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(false);

    const filteredDivisions = divisions.filter(div =>
        div.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        div.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenModal = (division?: Division) => {
        if (division) {
            setEditingDivision(division);
            setFormData({ name: division.name, description: division.description || '' });
        } else {
            setEditingDivision(null);
            setFormData({ name: '', description: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDivision(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingDivision) {
                await api.put(`/divisions/${editingDivision.id}`, formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Divisi berhasil diperbarui',
                    confirmButtonColor: '#3B4D3A',
                });
            } else {
                await api.post('/divisions', formData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Divisi berhasil ditambahkan',
                    confirmButtonColor: '#3B4D3A',
                });
            }
            router.reload();
            handleCloseModal();
        } catch (error: any) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: error.response?.data?.message || 'Terjadi kesalahan',
                confirmButtonColor: '#3B4D3A',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (division: Division) => {
        const result = await Swal.fire({
            title: 'Hapus Divisi?',
            text: `Apakah Anda yakin ingin menghapus divisi "${division.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/divisions/${division.id}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Divisi berhasil dihapus',
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

    return (
        <>
            <Head title="Divisi - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#3B4D3A]">Manajemen Divisi</h1>
                            <p className="text-[#6E8BA3] mt-1">Kelola divisi-divisi OSIS dalam kepanitiaan event</p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Divisi
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                            <input
                                type="text"
                                placeholder="Cari divisi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Divisions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDivisions.map((division) => (
                            <div
                                key={division.id}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-[#3B4D3A] h-64 flex flex-col"
                            >
                                <div className="flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-[#3B4D3A] mb-2 line-clamp-2">{division.name}</h3>
                                        <div className="h-16 overflow-hidden">
                                            <p className="text-sm text-[#6E8BA3] line-clamp-3">{division.description || 'Tidak ada deskripsi'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4 text-[#6E8BA3] mt-auto">
                                        <Users className="w-4 h-4" />
                                        <span className="text-sm font-medium">{division.users_count || 0} Anggota</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(division)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(division)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredDivisions.length === 0 && (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center">
                            <Users className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                            <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada divisi ditemukan</p>
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <h2 className="text-2xl font-bold text-[#3B4D3A] mb-6">
                                {editingDivision ? 'Edit Divisi' : 'Tambah Divisi'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Nama Divisi *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                        placeholder="Contoh: Divisi Humas"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Deskripsi *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all resize-none"
                                        placeholder="Deskripsi divisi..."
                                    />
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
            </DashboardLayout>
        </>
    );
};

export default DivisionsPage;
