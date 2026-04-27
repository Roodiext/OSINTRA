import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import Modal from '@/components/ui/Modal';
import { Edit, Trash2 } from 'lucide-react';

interface PositionsPageProps {
    permissions?: {
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
}

interface Position {
    id: number;
    name: string;
    description?: string;
}

const PositionsPage: React.FC<PositionsPageProps> = ({ permissions = {} }) => {
    
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        try {
            const res = await api.get('/positions');
            setPositions(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    // Modal state for custom form
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<{ id?: number | null; name: string; description?: string }>({ id: null, name: '', description: '' });

    const openModal = (pos?: Position) => {
        if (pos) {
            setForm({ id: pos.id, name: pos.name ?? '', description: pos.description ?? '' });
        } else {
            setForm({ id: null, name: '', description: '' });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const submitForm = async () => {
        if (!form.name || !form.name.trim()) {
            // inline validation
            Swal.fire('Gagal', 'Nama posisi wajib diisi', 'error');
            return;
        }

        try {
            if (form.id) {
                await api.put(`/positions/${form.id}`, { name: form.name, description: form.description });
                Swal.fire('Berhasil', 'Position updated', 'success');
            } else {
                await api.post('/positions', { name: form.name, description: form.description });
                Swal.fire('Berhasil', 'Position created', 'success');
            }
            fetch();
            closeModal();
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { errors?: Record<string, string[] | string>; message?: string } }, message?: string };
            const statusCode = err.response?.status;
            const resp = err.response?.data;
            
            if (statusCode === 403) {
                Swal.fire('Akses Ditolak!', 'Anda tidak memiliki izin untuk melakukan tindakan ini.', 'error');
            } else if (resp && resp.errors) {
                const first = Object.values(resp.errors)[0];
                const message = Array.isArray(first) ? first[0] : String(first);
                Swal.fire('Gagal', message, 'error');
            } else {
                const msg = resp?.message || err.message || 'Error';
                Swal.fire('Gagal', msg, 'error');
            }
        }
    };

    const remove = async (id: number) => {
        const result = await Swal.fire({ title: 'Hapus position?', icon: 'warning', showCancelButton: true });
        if (!result.isConfirmed) return;
        
        try {
            await api.delete(`/positions/${id}`);
            Swal.fire('Dihapus', '', 'success');
            fetch();
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
            const statusCode = err.response?.status;
            if (statusCode === 403) {
                Swal.fire('Akses Ditolak!', 'Anda tidak memiliki izin untuk menghapus posisi ini.', 'error');
            } else {
                Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
            }
        }
    };

    return (
        <>
            <Head title="Positions - OSINTRA" />
            <DashboardLayout>
                <div className="space-y-6 p-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#3B4D3A]">Positions</h1>
                        <p className="text-[#6E8BA3] mt-1">Manage positions / jabatan OSIS</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
                        <div>
                            <p className="text-sm text-[#6E8BA3]">Tambah atau kelola posisi OSIS</p>
                        </div>
                        <div>
                            {permissions?.can_create && (
                                <button onClick={() => openModal()} className="bg-[#3B4D3A] text-white px-4 py-2 rounded-lg">Add</button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        {loading ? <p className="text-[#6E8BA3] p-6">Loading...</p> : (
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#E8DCC3] scrollbar-track-[#F5F5F5]">
                                <table className="w-full text-left min-w-max">
                                    <thead>
                                        <tr className="border-b-2 border-[#E8DCC3] bg-[#F5F5F5]">
                                            <th className="px-6 py-4 text-[#3B4D3A] font-semibold w-16">#</th>
                                            <th className="px-6 py-4 text-[#3B4D3A] font-semibold min-w-48">Nama Posisi</th>
                                            <th className="px-6 py-4 text-[#3B4D3A] font-semibold min-w-64">Deskripsi</th>
                                            <th className="px-6 py-4 text-right text-[#3B4D3A] font-semibold min-w-56">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {positions.map((p, idx) => (
                                            <tr key={p.id} className="hover:bg-[#F5F5F5] transition-colors">
                                                <td className="px-6 py-4 text-[#6E8BA3] font-semibold text-center w-16">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-[#E8DCC3] text-[#3B4D3A] rounded-full text-sm font-bold">
                                                        {idx+1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-[#3B4D3A] font-semibold whitespace-nowrap">{p.name}</td>
                                                <td className="px-6 py-4 text-[#6E8BA3] text-sm" title={p.description || '-'}>{p.description ?? '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {permissions?.can_edit && (
                                                            <button 
                                                                onClick={() => openModal(p)} 
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all font-medium text-sm whitespace-nowrap"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                        )}
                                                        {permissions?.can_delete && (
                                                            <button 
                                                                onClick={() => remove(p.id)} 
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all font-medium text-sm whitespace-nowrap"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Hapus
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                {/* Modal for add/edit */}
                <Modal
                    isOpen={modalOpen}
                    title={form.id ? 'Edit Posisi' : 'Tambah Posisi'}
                    onClose={closeModal}
                    onConfirm={submitForm}
                    confirmLabel={form.id ? 'Update' : 'Add'}
                    cancelLabel="Batal"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nama posisi</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Nama posisi"
                                className="mt-1 block w-full rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Deskripsi / jobdesk</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Deskripsi / jobdesk"
                                className="mt-1 block w-full rounded-lg border border-gray-200 p-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]"
                            />
                        </div>
                    </div>
                </Modal>
            </DashboardLayout>
        </>
    );
};

export default PositionsPage;
