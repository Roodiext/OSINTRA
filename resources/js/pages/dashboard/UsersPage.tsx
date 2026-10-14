import React, { useState, useCallback } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Edit, Trash2, Search, UserCircle, ToggleLeft, ToggleRight, GraduationCap } from 'lucide-react';
import type { User, Role, Division, SharedData, Position, Angkatan } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { usePermissionAlert } from '@/hooks/usePermissionAlert';
import Pagination from '@/components/ui/Pagination';

interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface UsersPageProps {
    [key: string]: unknown;
    users: PaginatedData<User>;
    roles: Role[];
    divisions: Division[];
    positions: Position[];
    angkatans?: Angkatan[];
    permissions?: {
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    };
}

const UsersPage: React.FC<UsersPageProps> = ({ users: paginatedUsers, roles, positions, angkatans: initialAngkatans = [], permissions = {} }) => {
    const { props } = usePage<SharedData>();
    const currentUserRole = props.auth?.user?.role?.name?.toLowerCase();
    const isOperatorWeb = currentUserRole === 'operator web';

    usePermissionAlert(props.flash?.permission_message);

    const users = paginatedUsers?.data || [];
    const pagination = paginatedUsers || { current_page: 1, last_page: 1, per_page: 30, total: 0, from: null, to: null };
    
    const urlParams = new URLSearchParams(window.location.search);
    const [angkatans, setAngkatans] = useState<Angkatan[]>(initialAngkatans);
    const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
    const [filterRole, setFilterRole] = useState<string>(urlParams.get('role') || '');
    const [filterAngkatan, setFilterAngkatan] = useState<string>(urlParams.get('angkatan') || '');
    const [showModal, setShowModal] = useState(false);
    const [showAngkatanModal, setShowAngkatanModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role_id: '',
        position_id: '',
        angkatan_id: '',
        status: 'active' as 'active' | 'inactive',
    });
    const [angkatanFormData, setAngkatanFormData] = useState({
        name: '',
        year: '',
        description: '',
    });
    const [savingAngkatan, setSavingAngkatan] = useState(false);
    const [loading, setLoading] = useState(false);

    // Server-side navigation for search/filter/pagination
    const navigateWithFilters = useCallback((overrides: Record<string, string | number> = {}) => {
        const params: Record<string, string> = {};
        const search = overrides.search !== undefined ? String(overrides.search) : searchQuery;
        const role = overrides.role !== undefined ? String(overrides.role) : filterRole;
        const angkatan = overrides.angkatan !== undefined ? String(overrides.angkatan) : filterAngkatan;
        const page = overrides.page !== undefined ? String(overrides.page) : '1';

        if (search) params.search = search;
        if (role) params.role = role;
        if (angkatan) params.angkatan = angkatan;
        if (page && page !== '1') params.page = page;

        router.visit('/dashboard/users', {
            data: params,
            preserveState: true,
            preserveScroll: true,
            only: ['users'],
        });
    }, [searchQuery, filterRole, filterAngkatan]);

    // Debounced search
    const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            navigateWithFilters({ search: value, page: 1 });
        }, 400);
    };

    const handleRoleChange = (value: string) => {
        setFilterRole(value);
        navigateWithFilters({ role: value, page: 1 });
    };

    const handleAngkatanFilterChange = (value: string) => {
        setFilterAngkatan(value);
        navigateWithFilters({ angkatan: value, page: 1 });
    };

    const handlePageChange = (page: number) => {
        navigateWithFilters({ page });
    };

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
                angkatan_id: user.angkatan_id?.toString() || '',
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
                angkatan_id: '',
                status: 'active',
            });
        }
        setShowModal(true);
    };

    const handleCreateAngkatan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!angkatanFormData.name.trim()) return;
        setSavingAngkatan(true);
        try {
            const res = await api.post('/angkatans', angkatanFormData);
            const newAngkatan = res.data.angkatan;
            setAngkatans(prev => [newAngkatan, ...prev]);
            setFormData(prev => ({ ...prev, angkatan_id: newAngkatan.id.toString() }));
            setAngkatanFormData({ name: '', year: '', description: '' });
            setShowAngkatanModal(false);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: `Angkatan "${newAngkatan.name}" berhasil ditambahkan!`,
                confirmButtonColor: '#3B4D3A',
                timer: 1500,
            });
            router.reload();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: err.response?.data?.message || 'Gagal menambahkan angkatan',
                confirmButtonColor: '#3B4D3A',
            });
        } finally {
            setSavingAngkatan(false);
        }
    };

    const handleDeleteAngkatan = async (angkatan: Angkatan) => {
        const result = await Swal.fire({
            title: 'Hapus Angkatan?',
            text: `Yakin ingin menghapus "${angkatan.name}"? Pengguna dengan angkatan ini akan dikosongkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/angkatans/${angkatan.id}`);
                setAngkatans(prev => prev.filter(a => a.id !== angkatan.id));
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Angkatan berhasil dihapus',
                    confirmButtonColor: '#3B4D3A',
                    timer: 1500,
                });
                router.reload();
            } catch (error: unknown) {
                const err = error as { response?: { data?: { message?: string } } };
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: err.response?.data?.message || 'Gagal menghapus angkatan',
                    confirmButtonColor: '#3B4D3A',
                });
            }
        }
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
            <Head title="Pengguna" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#3B4D3A]">Manajemen Pengguna</h1>
                            <p className="text-[#6E8BA3] mt-1">Kelola data pengguna dan angkatan OSVIS</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowAngkatanModal(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-white border border-[#3B4D3A] text-[#3B4D3A] rounded-xl hover:bg-[#F5F5F5] transition-all shadow-sm font-semibold text-sm"
                            >
                                <GraduationCap className="w-5 h-5 text-[#3B4D3A]" />
                                Kelola Angkatan
                            </button>
                            {permissions?.can_create && (
                                <button
                                    onClick={() => handleOpenModal()}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md font-semibold text-sm"
                                >
                                    <Plus className="w-5 h-5" />
                                    Tambah Pengguna
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="text"
                                    placeholder="Cari nama, username, atau email..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <select
                                value={filterRole}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>

                            <select
                                value={filterAngkatan}
                                onChange={(e) => handleAngkatanFilterChange(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Angkatan</option>
                                {angkatans.map(ang => (
                                    <option key={ang.id} value={ang.id.toString()}>
                                        {ang.name} {ang.year ? `(${ang.year})` : ''}
                                    </option>
                                ))}
                            </select>
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
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Angkatan</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-[#3B4D3A]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => {
                                        const isAdminUser = user.role?.name?.toLowerCase() === 'admin';
                                        const angkatanDisplay = typeof user.angkatan === 'object' && user.angkatan
                                            ? user.angkatan.name
                                            : (user.angkatan || (angkatans.find(a => a.id === user.angkatan_id)?.name || null));
                                        return (
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {angkatanDisplay ? (
                                                    <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
                                                        {angkatanDisplay}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        if (isOperatorWeb && isAdminUser) {
                                                            Swal.fire({
                                                                icon: 'error',
                                                                title: 'Akses Ditolak!',
                                                                text: 'Operator Web tidak dapat mengubah status akun Admin.',
                                                                confirmButtonColor: '#3B4D3A',
                                                            });
                                                            return;
                                                        }
                                                        handleToggleStatus(user);
                                                    }}
                                                    className={`flex items-center gap-2 ${isOperatorWeb && isAdminUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <ToggleRight className={`w-8 h-8 ${isOperatorWeb && isAdminUser ? 'text-gray-400' : 'text-green-600'}`} />
                                                            <span className={`text-sm font-semibold ${isOperatorWeb && isAdminUser ? 'text-gray-400' : 'text-green-600'}`}>Aktif</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleLeft className={`w-8 h-8 ${isOperatorWeb && isAdminUser ? 'text-gray-400' : 'text-red-600'}`} />
                                                            <span className={`text-sm font-semibold ${isOperatorWeb && isAdminUser ? 'text-gray-400' : 'text-red-600'}`}>Nonaktif</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {permissions?.can_edit && (
                                                        <button
                                                            onClick={() => {
                                                                if (isOperatorWeb && isAdminUser) {
                                                                    Swal.fire({
                                                                        icon: 'error',
                                                                        title: 'Akses Ditolak!',
                                                                        text: 'Operator Web tidak dapat mengedit akun Admin.',
                                                                        confirmButtonColor: '#3B4D3A',
                                                                    });
                                                                    return;
                                                                }
                                                                handleOpenModal(user);
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${isOperatorWeb && isAdminUser 
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                                : 'bg-[#E8DCC3] text-[#3B4D3A] hover:bg-[#d5c9b0]'}`}
                                                            title={isOperatorWeb && isAdminUser ? "Tidak dapat mengedit Admin" : "Edit"}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {permissions?.can_delete && (
                                                        <button
                                                            onClick={() => {
                                                                if (isOperatorWeb && isAdminUser) {
                                                                    Swal.fire({
                                                                        icon: 'error',
                                                                        title: 'Akses Ditolak!',
                                                                        text: 'Operator Web tidak dapat menghapus akun Admin.',
                                                                        confirmButtonColor: '#3B4D3A',
                                                                    });
                                                                    return;
                                                                }
                                                                handleDelete(user);
                                                            }}
                                                            className={`p-2 rounded-lg transition-all ${isOperatorWeb && isAdminUser 
                                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                                                : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                                            title={isOperatorWeb && isAdminUser ? "Tidak dapat menghapus Admin" : "Hapus"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                            );
                                        })}
                                    </tbody>
                            </table>
                        </div>

                        {users.length === 0 && (
                            <div className="p-12 text-center">
                                <UserCircle className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                                <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada pengguna ditemukan</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={pagination.current_page}
                        lastPage={pagination.last_page}
                        total={pagination.total}
                        perPage={pagination.per_page}
                        from={pagination.from}
                        to={pagination.to}
                        onPageChange={handlePageChange}
                        className="mt-6"
                    />
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
                                                {roles
                                                    .filter(role => !isOperatorWeb || role.name.toLowerCase() !== 'admin')
                                                    .map(role => (
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
                                                <option value="">Pilih Posisi (Opsional)</option>
                                                {positions.map(pos => (
                                                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="block text-sm font-semibold text-[#3B4D3A]">
                                                    Angkatan
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAngkatanModal(true)}
                                                    className="text-xs text-[#3B4D3A] hover:underline font-semibold"
                                                >
                                                    + Tambah Angkatan
                                                </button>
                                            </div>
                                            <select
                                                value={formData.angkatan_id}
                                                onChange={(e) => setFormData({ ...formData, angkatan_id: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            >
                                                <option value="">Pilih Angkatan (Opsional)</option>
                                                {angkatans.map(ang => (
                                                    <option key={ang.id} value={ang.id.toString()}>
                                                        {ang.name} {ang.year ? `(${ang.year})` : ''}
                                                    </option>
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

                {/* Modal Kelola Angkatan */}
                {showAngkatanModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                            {/* Modal Header */}
                            <div className="px-6 py-4 md:px-8 md:py-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-6 h-6 text-[#3B4D3A]" />
                                    <h2 className="text-xl md:text-2xl font-bold text-[#3B4D3A]">
                                        Kelola Angkatan
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowAngkatanModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-red-500"
                                >
                                    <Plus className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="px-6 py-4 md:px-8 md:py-6 overflow-y-auto space-y-6 flex-grow">
                                {/* Form Tambah Angkatan */}
                                <form onSubmit={handleCreateAngkatan} className="p-4 bg-[#F5F5F5] rounded-xl border border-gray-200 space-y-4">
                                    <h3 className="font-bold text-[#3B4D3A] text-sm">Tambah Angkatan Baru</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-[#3B4D3A] mb-1">
                                                Nama / Nomor Angkatan *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Contoh: 23, 24, atau Angkatan 23"
                                                value={angkatanFormData.name}
                                                onChange={(e) => setAngkatanFormData({ ...angkatanFormData, name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#3B4D3A] outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-[#3B4D3A] mb-1">
                                                Tahun Ajaran / Periode
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Contoh: 2023/2024 atau 2023"
                                                value={angkatanFormData.year}
                                                onChange={(e) => setAngkatanFormData({ ...angkatanFormData, year: e.target.value })}
                                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#3B4D3A] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[#3B4D3A] mb-1">
                                            Keterangan (Opsional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Catatan tambahan..."
                                            value={angkatanFormData.description}
                                            onChange={(e) => setAngkatanFormData({ ...angkatanFormData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#3B4D3A] outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={savingAngkatan}
                                        className="w-full py-2.5 bg-[#3B4D3A] text-white rounded-lg text-sm font-semibold hover:bg-[#2d3a2d] transition-all disabled:opacity-50"
                                    >
                                        {savingAngkatan ? 'Menyimpan...' : '+ Simpan Angkatan'}
                                    </button>
                                </form>

                                {/* List Angkatan */}
                                <div>
                                    <h3 className="font-bold text-[#3B4D3A] text-sm mb-3">Daftar Angkatan Terdaftar</h3>
                                    {angkatans.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-4">Belum ada data angkatan</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {angkatans.map(ang => (
                                                <div key={ang.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all shadow-sm">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[#3B4D3A] text-sm">{ang.name}</span>
                                                            {ang.year && (
                                                                <span className="text-xs text-[#6E8BA3]">({ang.year})</span>
                                                            )}
                                                        </div>
                                                        {ang.description && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{ang.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs px-2.5 py-1 bg-[#E8DCC3] text-[#3B4D3A] rounded-md font-semibold">
                                                            {users.filter(u => u.angkatan_id === ang.id).length} Pengguna
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteAngkatan(ang)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Hapus Angkatan"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowAngkatanModal(false)}
                                    className="px-5 py-2.5 bg-gray-200 text-[#1E1E1E] rounded-xl text-sm font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Tutup
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
