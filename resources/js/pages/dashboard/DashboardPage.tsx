import React, { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Users, FolderKanban, Mail, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/lib/axios';
import type { DashboardStats } from '@/types';
import Swal from 'sweetalert2';

const DashboardPage: React.FC = () => {
    const { flash } = usePage().props;
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Show permission denied alert if exists
        if (flash?.permission_denied) {
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: flash?.permission_message || 'Anda tidak memiliki izin untuk mengakses halaman tersebut.',
                confirmButtonColor: '#3B4D3A',
                confirmButtonText: 'Kembali ke Dashboard',
                allowOutsideClick: false,
                didOpen: () => {
                    // Blur background
                    const backdrop = document.querySelector('.swal2-container');
                    if (backdrop) {
                        backdrop.style.backdropFilter = 'blur(4px)';
                    }
                }
            });
        }
    }, [flash?.permission_denied, flash?.permission_message]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-[#3B4D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[#1E1E1E] font-medium">Memuat data...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <>
            <Head title="Dashboard - OSINTRA" />
            <DashboardLayout>
                <div className="space-y-8 p-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-[#3B4D3A] mb-2">Dashboard</h1>
                        <p className="text-[#6E8BA3] text-lg">Ringkasan aktivitas OSIS</p>
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Anggota */}
                        <div className="bg-[#E8DCC3] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/60 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Users className="w-7 h-7 text-[#3B4D3A]" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[#6E8BA3] mb-1">Total Anggota</p>
                                        <p className="text-4xl font-bold text-[#3B4D3A]">{stats?.total_users || 0}</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-[#3B4D3A] rounded-full"></div>
                            </div>
                        </div>

                        {/* Program Kerja */}
                        <div className="bg-[#E8DCC3] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/60 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <FolderKanban className="w-7 h-7 text-[#3B4D3A]" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[#6E8BA3] mb-1">Program Kerja</p>
                                        <p className="text-4xl font-bold text-[#3B4D3A]">{stats?.total_prokers || 0}</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-[#3B4D3A] rounded-full"></div>
                            </div>
                        </div>

                        {/* Pesan Baru */}
                        <div className="bg-[#E8DCC3] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/60 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <Mail className="w-7 h-7 text-[#3B4D3A]" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[#6E8BA3] mb-1">Pesan Baru</p>
                                        <p className="text-4xl font-bold text-[#3B4D3A]">{stats?.unread_messages || 0}</p>
                                    </div>
                                </div>
                                <div className="h-1 bg-[#3B4D3A] rounded-full"></div>
                            </div>
                        </div>

                        {/* Saldo */}
                        <div className="bg-[#E8DCC3] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-white/60 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <DollarSign className="w-7 h-7 text-[#3B4D3A]" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-medium text-[#6E8BA3] mb-1">Saldo</p>
                                        <p className="text-xl sm:text-2xl font-bold text-[#3B4D3A] break-all text-right">
                                            Rp{stats?.balance?.toLocaleString('id-ID') || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-1 bg-[#3B4D3A] rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1E1E1E]">Total Pemasukan</h3>
                                    <p className="text-sm text-[#6E8BA3]">Pendapatan keseluruhan</p>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 break-words">
                                Rp{stats?.total_income?.toLocaleString('id-ID') || 0}
                            </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-8 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <TrendingDown className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#1E1E1E]">Total Pengeluaran</h3>
                                    <p className="text-sm text-[#6E8BA3]">Biaya keseluruhan</p>
                                </div>
                            </div>
                            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-600 break-words">
                                Rp{stats?.total_expense?.toLocaleString('id-ID') || 0}
                            </p>
                        </div>
                    </div>

                    {/* Proker Status */}
                    <div className="bg-white rounded-xl shadow-md p-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-[#3B4D3A]">Status Program Kerja</h3>
                            <p className="text-[#6E8BA3] mt-1">Monitoring progress kegiatan</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border-2 border-blue-200 hover:border-blue-400 transition-colors">
                                <p className="text-5xl font-bold text-blue-600 mb-3">{stats?.proker_status?.planned || 0}</p>
                                <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Direncanakan</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 text-center border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
                                <p className="text-5xl font-bold text-yellow-600 mb-3">{stats?.proker_status?.ongoing || 0}</p>
                                <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Berlangsung</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border-2 border-green-200 hover:border-green-400 transition-colors">
                                <p className="text-5xl font-bold text-green-600 mb-3">{stats?.proker_status?.done || 0}</p>
                                <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Selesai</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Recent Prokers */}
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-[#3B4D3A]">Program Kerja Terbaru</h3>
                                <p className="text-[#6E8BA3] mt-1">Aktivitas terkini</p>
                            </div>
                            <div className="space-y-3">
                                {stats?.recent_prokers?.slice(0, 5).map((proker) => (
                                    <div key={proker.id} className="bg-[#F5F5F5] rounded-lg p-4 hover:bg-[#E8DCC3] transition-colors border border-transparent hover:border-[#3B4D3A]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-semibold text-[#1E1E1E] mb-1">{proker.title}</p>
                                                <p className="text-sm text-[#6E8BA3]">{proker.division?.name}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide ml-4 whitespace-nowrap ${proker.status === 'done' ? 'bg-green-100 text-green-700 border border-green-300' :
                                                    proker.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                                                        'bg-blue-100 text-blue-700 border border-blue-300'
                                                }`}>
                                                {proker.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {(!stats?.recent_prokers || stats.recent_prokers.length === 0) && (
                                    <div className="text-center py-12 bg-[#F5F5F5] rounded-lg">
                                        <FolderKanban className="w-12 h-12 text-[#6E8BA3] mx-auto mb-3" />
                                        <p className="text-[#6E8BA3] font-medium">Belum ada program kerja</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Messages */}
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-[#3B4D3A]">Pesan Terbaru</h3>
                                <p className="text-[#6E8BA3] mt-1">Komunikasi terkini</p>
                            </div>
                            <div className="space-y-3">
                                {stats?.recent_messages?.slice(0, 5).map((message) => (
                                    <div key={message.id} className="bg-[#F5F5F5] rounded-lg p-4 hover:bg-[#E8DCC3] transition-colors border border-transparent hover:border-[#3B4D3A]">
                                        <div className="flex items-start justify-between mb-2">
                                            <p className="font-semibold text-[#1E1E1E] flex-1">{message.name}</p>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ml-3 whitespace-nowrap ${message.status === 'unread' ? 'bg-red-100 text-red-700 border border-red-300' :
                                                    message.status === 'read' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                                                        'bg-gray-100 text-gray-700 border border-gray-300'
                                                }`}>
                                                {message.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#6E8BA3] line-clamp-2">{message.subject}</p>
                                    </div>
                                ))}
                                {(!stats?.recent_messages || stats.recent_messages.length === 0) && (
                                    <div className="text-center py-12 bg-[#F5F5F5] rounded-lg">
                                        <Mail className="w-12 h-12 text-[#6E8BA3] mx-auto mb-3" />
                                        <p className="text-[#6E8BA3] font-medium">Belum ada pesan</p>
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

export default DashboardPage;