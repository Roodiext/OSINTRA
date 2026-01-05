import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Download, Calendar, User } from 'lucide-react';
import type { AuditLog } from '@/types';

interface AuditLogsPageProps {
    logs: AuditLog[];
}

const AuditLogsPage: React.FC<AuditLogsPageProps> = ({ logs }) => {
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterUser, setFilterUser] = useState<string>('');
    const [filterDate, setFilterDate] = useState<string>('');

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUser = !filterUser || log.user_id?.toString() === filterUser;
        const matchesDate = !filterDate || log.created_at.startsWith(filterDate);
        return matchesSearch && matchesUser && matchesDate;
    });

    const uniqueUsers = Array.from(new Set(logs.map(log => log.user).filter(Boolean)));

    const handleExportCSV = () => {
        const headers = ['Tanggal', 'User', 'Aksi', 'Deskripsi'];
        const csvData = filteredLogs.map(log => [
            new Date(log.created_at).toLocaleString('id-ID'),
            log.user?.name || 'System',
            log.action,
            log.description || '-'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const getActionColor = (action: string) => {
        if (action.includes('create') || action.includes('login')) return 'text-green-600 bg-green-50';
        if (action.includes('update') || action.includes('edit')) return 'text-blue-600 bg-blue-50';
        if (action.includes('delete') || action.includes('logout')) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <>
            <Head title="Log Aktivitas - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#3B4D3A]">Log Aktivitas</h1>
                            <p className="text-[#6E8BA3] mt-1">Riwayat aktivitas pengguna di sistem</p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md"
                        >
                            <Download className="w-5 h-5" />
                            Export CSV
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="text"
                                    placeholder="Cari aktivitas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <select
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua User</option>
                                {uniqueUsers.map(user => user && (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Logs Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#E8DCC3]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Waktu</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">User</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Aksi</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Deskripsi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-[#F5F5F5] transition-colors">
                                            <td className="px-6 py-4 text-[#6E8BA3] whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-[#E8DCC3] rounded-full flex items-center justify-center text-[#3B4D3A] font-bold text-sm">
                                                        {log.user?.name.charAt(0).toUpperCase() || 'S'}
                                                    </div>
                                                    <span className="font-semibold text-[#1E1E1E]">
                                                        {log.user?.name || 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#6E8BA3]">
                                                {log.description || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredLogs.length === 0 && (
                            <div className="p-12 text-center">
                                <User className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                                <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada log aktivitas ditemukan</p>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#6E8BA3]">Total Aktivitas</p>
                                <p className="text-2xl font-bold text-[#3B4D3A]">{filteredLogs.length} aktivitas</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-[#6E8BA3]">Periode</p>
                                <p className="font-semibold text-[#1E1E1E]">
                                    {filterDate ? new Date(filterDate).toLocaleDateString('id-ID') : 'Semua waktu'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
};

export default AuditLogsPage;
