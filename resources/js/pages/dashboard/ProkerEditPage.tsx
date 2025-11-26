import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArrowLeft, X } from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import type { Division } from '@/types';

interface Proker {
    id: number;
    title: string;
    description?: string;
    date: string;
    location?: string;
    status: 'planned' | 'ongoing' | 'done';
    divisions: Division[];
}

interface ProkerEditPageProps {
    divisions: Division[];
}

const ProkerEditPage: React.FC<ProkerEditPageProps> = ({ divisions }) => {
    const [proker, setProker] = useState<Proker | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        division_ids: [] as number[],
        date: '',
        location: '',
        status: 'planned' as 'planned' | 'ongoing' | 'done',
    });

    const prokerId = window.location.pathname.split('/')[4];

    useEffect(() => {
        const fetchProker = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/prokers/${prokerId}`);
                const data = response.data;
                setProker(data);
                
                setFormData({
                    title: data.title,
                    description: data.description || '',
                    division_ids: (data.divisions || []).map((d: Division) => d.id),
                    date: data.date,
                    location: data.location || '',
                    status: data.status,
                });
            } catch (error) {
                console.error(error);
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: 'Gagal memuat data proker',
                    confirmButtonColor: '#3B4D3A',
                });
                router.visit('/dashboard/prokers');
            } finally {
                setLoading(false);
            }
        };

        if (prokerId) fetchProker();
    }, [prokerId]);

    const handleDivisionToggle = (divisionId: number) => {
        setFormData(prev => ({
            ...prev,
            division_ids: prev.division_ids.includes(divisionId)
                ? prev.division_ids.filter(id => id !== divisionId)
                : [...prev.division_ids, divisionId]
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSubmitting(true);

        try {
            await api.put(`/prokers/${prokerId}`, formData);
            
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Proker berhasil diperbarui',
                confirmButtonColor: '#3B4D3A',
            }).then(() => {
                router.visit('/dashboard/prokers');
            });
        } catch (error: any) {
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
            setSubmitting(false);
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

    return (
        <>
            <Head title="Edit Program Kerja - OSINTRA" />
            <DashboardLayout>
                <div className="space-y-6 p-6 osintra-content">
                    {/* Back Button */}
                    <button
                        onClick={() => router.visit(`/dashboard/prokers/${prokerId}`)}
                        className="flex items-center gap-2 text-[#3B4D3A] hover:opacity-70 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Detail Proker
                    </button>

                    {/* Form Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <h1 className="text-3xl font-bold text-[#3B4D3A] mb-6">Edit Program Kerja</h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Judul Program Kerja *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan judul program kerja"
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
                                        errors.title 
                                            ? 'border-red-500 focus:border-red-600' 
                                            : 'border-gray-300 focus:border-[#3B4D3A]'
                                    }`}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Penjelasan Event
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan penjelasan event"
                                    rows={5}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
                                        errors.description 
                                            ? 'border-red-500 focus:border-red-600' 
                                            : 'border-gray-300 focus:border-[#3B4D3A]'
                                    }`}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tanggal Pelaksanaan *
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
                                        errors.date 
                                            ? 'border-red-500 focus:border-red-600' 
                                            : 'border-gray-300 focus:border-[#3B4D3A]'
                                    }`}
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                                )}
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Lokasi
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan lokasi event"
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
                                        errors.location 
                                            ? 'border-red-500 focus:border-red-600' 
                                            : 'border-gray-300 focus:border-[#3B4D3A]'
                                    }`}
                                />
                                {errors.location && (
                                    <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Status *
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none transition ${
                                        errors.status 
                                            ? 'border-red-500 focus:border-red-600' 
                                            : 'border-gray-300 focus:border-[#3B4D3A]'
                                    }`}
                                >
                                    <option value="planned">Direncanakan</option>
                                    <option value="ongoing">Berlangsung</option>
                                    <option value="done">Selesai</option>
                                </select>
                                {errors.status && (
                                    <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                )}
                            </div>

                            {/* Divisions */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Divisi yang Terlibat *
                                </label>
                                <div className="space-y-2 bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                                    {divisions && divisions.length > 0 ? (
                                        divisions.map(division => (
                                            <label 
                                                key={division.id} 
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.division_ids.includes(division.id)}
                                                    onChange={() => handleDivisionToggle(division.id)}
                                                    className="w-4 h-4 text-[#3B4D3A] border-gray-300 rounded focus:ring-[#3B4D3A]"
                                                />
                                                <span className="text-gray-700 font-medium">{division.name}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Tidak ada divisi tersedia</p>
                                    )}
                                </div>
                                {errors.division_ids && (
                                    <p className="text-red-500 text-sm mt-1">{errors.division_ids}</p>
                                )}
                                {formData.division_ids.length === 0 && (
                                    <p className="text-gray-500 text-sm mt-1">Pilih minimal 1 divisi</p>
                                )}
                            </div>

                            {/* Selected Divisions Display */}
                            {formData.division_ids.length > 0 && (
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Divisi Terpilih:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.division_ids.map(divId => {
                                            const division = divisions?.find(d => d.id === divId);
                                            return division ? (
                                                <span
                                                    key={divId}
                                                    className="px-3 py-1 bg-[#E8DCC3] text-[#3B4D3A] rounded-full text-sm font-semibold flex items-center gap-2"
                                                >
                                                    {division.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDivisionToggle(divId)}
                                                        className="hover:opacity-70"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => router.visit(`/dashboard/prokers/${prokerId}`)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                                    disabled={submitting}
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-[#3B4D3A] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default ProkerEditPage;
