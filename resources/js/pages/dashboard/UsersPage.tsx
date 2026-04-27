import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Edit, Trash2, Search, UserCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import type { User, Role, Division } from '@/types';
import type { Position } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { usePermissionAlert } from '@/hooks/usePermissionAlert';

interface UsersPageProps {
    [key: string]: unknown;
    users: User[];
    roles: Role[];
    divisions: Division[];
    positions: Position[];
    permissions?: {
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
}

const UsersPage: React.FC<UsersPageProps> = ({ users: initialUsers, roles, positions, permissions = {} }) => {
    const { props } = usePage<{ flash?: { permission_message?: string } }>();
    usePermissionAlert(props.flash?.permission_message);

    const [users] = useState<User[]>(initialUsers || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role_id: '',
        position_id: '',
        status: 'active' as 'active' | 'inactive',
    });
    const [loading, setLoading] = useState(false);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = !filterRole || user.role_id.toString() === filterRole;
        return matchesSearch && matchesRole;
    });

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                username: user.username,
                email: user.email,
                password: '',
                role_id: user.role_id.toString(),
                position_id: user.position_id?.toString() || '',
                status: user.status,
            });
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                username: '',
                email: '',
                password: '',
                role_id: '',
                position_id: '',
                status: 'active',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = { ...formData };
            if (editingUser && !submitData.password) {
                delete (submitData as Record<string, unknown>).password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, submitData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'User berhasil diperbarui',
                    confirmButtonColor: '#3B4D3A',
                });
            } else {
                await api.post('/users', submitData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'User berhasil ditambahkan',
                    confirmButtonColor: '#3B4D3A',
                });
            }
            router.reload();
            handleCloseModal();
        } catch (error: unknown) {
            const err = error as { response?: { status?: number; data?: { message?: string } } };
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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user: User) => {
        const result = await Swal.fire({
            title: 'Hapus User?',
            text: `Apakah Anda yakin ingin menghapus user "${user.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/users/${user.id}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'User berhasil dihapus',
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
                        text: 'Anda tidak memiliki izin untuk menghapus user ini.',
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

    const handleToggleStatus = async (user: User) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            await api.put(`/users/${user.id}`, { status: newStatus });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: `Status user berhasil diubah menjadi ${newStatus}`,
                confirmButtonColor: '#3B4D3A',
                timer: 1500,
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
                    text: 'Anda tidak memiliki izin untuk mengubah status user ini.',
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
    };

    return (
        <>
            <Head title="Pengguna - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#3B4D3A]">Manajemen Pengguna</h1>
                            <p className="text-[#6E8BA3] mt-1">Kelola data pengguna OSVIS</p>
                        </div>
                        {permissions?.can_create && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Pengguna
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
                                    placeholder="Cari pengguna..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>

                            {/* Division filter removed (users no longer have division) */}
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#E8DCC3]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Pengguna</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Username</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Posisi</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-[#3B4D3A]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-[#F5F5F5] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#E8DCC3] rounded-full flex items-center justify-center text-[#3B4D3A] font-bold flex-shrink-0">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-[#1E1E1E] truncate" title={user.name}>{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#6E8BA3] max-w-xs truncate" title={user.username}>{user.username}</td>
                                            <td className="px-6 py-4 text-[#6E8BA3] max-w-xs truncate" title={user.email}>{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg text-sm font-semibold whitespace-nowrap">
                                                    {user.role?.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#6E8BA3] max-w-xs truncate" title={user.position?.name || '-'}>{user.position?.name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className="flex items-center gap-2"
                                                >
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <ToggleRight className="w-8 h-8 text-green-600" />
                                                            <span className="text-sm font-semibold text-green-600">Aktif</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className="w-8 h-8 text-red-600" />
                                                            <span className="text-sm font-semibold text-red-600">Nonaktif</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {permissions?.can_edit && (
                                                        <button
                                                            onClick={() => handleOpenModal(user)}
                                                            className="p-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {permissions?.can_delete && (
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="p-12 text-center">
                                <UserCircle className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                                <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada pengguna ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <h2 className="text-xl md:text-2xl font-bold text-[#3B4D3A]">
                                    {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="px-6 py-4 md:px-8 md:py-6 overflow-y-auto custom-scrollbar flex-grow">
                                <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                Nama Lengkap *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                placeholder="Nama lengkap"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                Username *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.username}
                                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                placeholder="Username"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                placeholder="email@example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                Password {!editingUser && '*'}
                                            </label>
                                            <input
                                                type="password"
                                                required={!editingUser}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                                placeholder={editingUser ? 'Kosongkan jika tidak diubah' : '••••••••'}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                Role *
                                            </label>
                                            <select
                                                required
                                                value={formData.role_id}
                                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            >
                                                <option value="">Pilih Role</option>
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.id}>{role.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                Posisi
                                            </label>
                                            <select
                                                value={formData.position_id}
                                                onChange={(e) => setFormData({ ...formData, position_id: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            >
                                                <option value="">Pilih Posisi</option>
                                                {positions.map(pos => (
                                                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-sm font-semibold text-[#3B4D3A]">
                                            Status
                                        </label>
                                        <div className="flex gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="active"
                                                    checked={formData.status === 'active'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                                    className="w-4 h-4 text-[#3B4D3A] focus:ring-[#3B4D3A] border-gray-300"
                                                />
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-[#3B4D3A] transition-colors">Aktif</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="inactive"
                                                    checked={formData.status === 'inactive'}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                                    className="w-4 h-4 text-[#3B4D3A] focus:ring-[#3B4D3A] border-gray-300"
                                                />
                                                <span className="text-sm font-medium text-gray-700 group-hover:text-[#3B4D3A] transition-colors">Nonaktif</span>
                                            </label>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 md:px-8 md:py-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-6 py-3 bg-[#F5F5F5] text-[#6E8BA3] rounded-xl hover:bg-gray-200 transition-all font-semibold"
                                >
                                    Batal
                                </button>
                                <button
                                    form="user-form"
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold shadow-lg shadow-[#3B4D3A]/20 disabled:opacity-50"
                                >
                                    {loading ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
};

export default UsersPage;
