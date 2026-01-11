import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { User, Mail, Shield, Building2, Key, Camera } from 'lucide-react';
import type { User as UserType } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';

interface ProfilePageProps {
    user: UserType;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user: initialUser }) => {
    const [user, setUser] = useState<UserType>(initialUser);

    useEffect(() => {
        setUser(initialUser);
        setProfileData({
            name: initialUser.name,
            email: initialUser.email,
            username: initialUser.username,
        });
    }, [initialUser]);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
        username: user.username,
    });
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put('/profile', profileData);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Profil berhasil diperbarui',
                confirmButtonColor: '#3B4D3A',
            });
            router.reload();
            setIsEditingProfile(false);
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

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Konfirmasi password tidak cocok',
                confirmButtonColor: '#3B4D3A',
            });
            return;
        }

        if (passwordData.new_password.length < 8) {
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: 'Password minimal 8 karakter',
                confirmButtonColor: '#3B4D3A',
            });
            return;
        }

        setLoading(true);

        try {
            await api.put('/change-password', passwordData);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Password berhasil diubah',
                confirmButtonColor: '#3B4D3A',
            });
            setPasswordData({
                current_password: '',
                new_password: '',
                new_password_confirmation: '',
            });
            setIsChangingPassword(false);
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

    return (
        <>
            <Head title="Profil - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-[#3B4D3A]">Profil Saya</h1>
                        <p className="text-[#6E8BA3] mt-1">Kelola informasi profil Anda</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                                <div className="relative inline-block mb-6">
                                    <div className="w-32 h-32 bg-[#E8DCC3] rounded-full flex items-center justify-center text-[#3B4D3A] text-5xl font-bold shadow-lg">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>

                                </div>

                                <h2 className="text-2xl font-bold text-[#3B4D3A] mb-2">{user.name}</h2>
                                <p className="text-[#6E8BA3] mb-1">@{user.username}</p>
                                <span className="inline-block px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg font-semibold text-sm">
                                    {user.role?.name}
                                </span>

                                {user.division && (
                                    <div className="mt-4 pt-4 border-t border-[#E8DCC3]">
                                        <p className="text-sm text-[#6E8BA3] mb-1">Divisi</p>
                                        <p className="font-semibold text-[#1E1E1E]">{user.division.name}</p>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-[#E8DCC3]">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${user.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-600' : 'bg-red-600'
                                            }`} />
                                        <span className="font-semibold text-sm">
                                            {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Information */}
                            <div className="bg-white rounded-xl shadow-md p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <h3 className="text-xl font-bold text-[#3B4D3A]">Informasi Pribadi</h3>
                                    {!isEditingProfile && (
                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="w-full sm:w-auto px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all font-semibold"
                                        >
                                            Edit Profil
                                        </button>
                                    )}
                                </div>

                                {isEditingProfile ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                                Nama Lengkap
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                                Username
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={profileData.username}
                                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditingProfile(false);
                                                    setProfileData({
                                                        name: user.name,
                                                        email: user.email,
                                                        username: user.username,
                                                    });
                                                }}
                                                className="flex-1 px-6 py-3 bg-[#F5F5F5] text-[#6E8BA3] rounded-xl hover:bg-[#E8DCC3] transition-all font-semibold"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold disabled:opacity-50"
                                            >
                                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                                            <User className="w-5 h-5 text-[#6E8BA3]" />
                                            <div>
                                                <p className="text-sm text-[#6E8BA3]">Nama Lengkap</p>
                                                <p className="font-semibold text-[#1E1E1E]">{user.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                                            <User className="w-5 h-5 text-[#6E8BA3]" />
                                            <div>
                                                <p className="text-sm text-[#6E8BA3]">Username</p>
                                                <p className="font-semibold text-[#1E1E1E]">@{user.username}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                                            <Mail className="w-5 h-5 text-[#6E8BA3]" />
                                            <div>
                                                <p className="text-sm text-[#6E8BA3]">Email</p>
                                                <p className="font-semibold text-[#1E1E1E]">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                                            <Shield className="w-5 h-5 text-[#6E8BA3]" />
                                            <div>
                                                <p className="text-sm text-[#6E8BA3]">Role</p>
                                                <p className="font-semibold text-[#1E1E1E]">{user.role?.name}</p>
                                            </div>
                                        </div>

                                        {user.division && (
                                            <div className="flex items-center gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                                                <Building2 className="w-5 h-5 text-[#6E8BA3]" />
                                                <div>
                                                    <p className="text-sm text-[#6E8BA3]">Divisi</p>
                                                    <p className="font-semibold text-[#1E1E1E]">{user.division.name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Change Password */}
                            <div className="bg-white rounded-xl shadow-md p-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#3B4D3A]">Keamanan</h3>
                                        <p className="text-sm text-[#6E8BA3] mt-1">Ubah password Anda</p>
                                    </div>
                                    {!isChangingPassword && (
                                        <button
                                            onClick={() => setIsChangingPassword(true)}
                                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all font-semibold"
                                        >
                                            <Key className="w-4 h-4" />
                                            Ubah Password
                                        </button>
                                    )}
                                </div>

                                {isChangingPassword ? (
                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                                Password Saat Ini
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                                Password Baru (min. 8 karakter)
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.new_password}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                                Konfirmasi Password Baru
                                            </label>
                                            <input
                                                type="password"
                                                required
                                                value={passwordData.new_password_confirmation}
                                                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                                                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                            />
                                        </div>

                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsChangingPassword(false);
                                                    setPasswordData({
                                                        current_password: '',
                                                        new_password: '',
                                                        new_password_confirmation: '',
                                                    });
                                                }}
                                                className="flex-1 px-6 py-3 bg-[#F5F5F5] text-[#6E8BA3] rounded-xl hover:bg-[#E8DCC3] transition-all font-semibold"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold disabled:opacity-50"
                                            >
                                                {loading ? 'Menyimpan...' : 'Ubah Password'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-6 bg-[#F5F5F5] rounded-xl text-center">
                                        <Key className="w-12 h-12 text-[#6E8BA3] mx-auto mb-3" />
                                        <p className="text-[#6E8BA3]">Klik tombol "Ubah Password" untuk mengubah password Anda</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default ProfilePage;
