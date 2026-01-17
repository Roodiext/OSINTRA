import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Search, Mail, MailOpen, Archive, Eye } from 'lucide-react';
import type { Message } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';

interface MessagesPageProps {
    messages: Message[];
}

const MessagesPage: React.FC<MessagesPageProps> = ({ messages: initialMessages }) => {

    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterPriority, setFilterPriority] = useState<string>('');
    const [filterReplyStatus, setFilterReplyStatus] = useState<string>('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    const filteredMessages = messages.filter(message => {
        const matchesSearch = message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !filterStatus || message.status === filterStatus;
        const matchesCategory = !filterCategory || (message as any).category === filterCategory;
        const matchesPriority = !filterPriority || (message as any).priority === filterPriority;
        const matchesReplyStatus = !filterReplyStatus ||
            (filterReplyStatus === 'replied' && (message as any).replied_at) ||
            (filterReplyStatus === 'not_replied' && !(message as any).replied_at);
        return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesReplyStatus;
    });

    const handleViewMessage = async (message: Message) => {
        setViewingMessage(message);
        setShowDetailModal(true);

        // Mark as read if unread
        if (message.status === 'unread') {
            try {
                await api.put(`/messages/${message.id}/status`, { status: 'read' });
                router.reload({ only: ['messages'] });
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    };

    const handleReply = async () => {
        if (!viewingMessage || !replyText.trim()) return;

        setLoading(true);
        try {
            await api.post(`/messages/${viewingMessage.id}/reply`, {
                reply_message: replyText,
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Balasan pesan berhasil dikirim',
                confirmButtonColor: '#3B4D3A',
            });
            setReplyText('');
            setShowReplyModal(false);
            router.reload();
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

    const handleUpdateStatus = async (messageId: number, status: 'read' | 'archived') => {
        try {
            await api.put(`/messages/${messageId}/status`, { status });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: `Pesan berhasil ditandai sebagai ${status === 'read' ? 'dibaca' : 'diarsipkan'}`,
                confirmButtonColor: '#3B4D3A',
                timer: 1500,
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
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unread':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'read':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'archived':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'unread': return 'Belum Dibaca';
            case 'read': return 'Dibaca';
            case 'archived': return 'Diarsipkan';
            default: return status;
        }
    };

    const getCategoryLabel = (category: string) => {
        const categories: Record<string, string> = {
            'saran_program': 'Saran Program',
            'kritik_feedback': 'Kritik/Feedback',
            'laporan_masalah': 'Laporan Masalah',
            'ide_usulan': 'Ide/Usulan',
            'komplain': 'Komplain Urgent',
        };
        return categories[category] || category;
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'saran_program': 'bg-blue-100 text-blue-700',
            'kritik_feedback': 'bg-purple-100 text-purple-700',
            'laporan_masalah': 'bg-orange-100 text-orange-700',
            'ide_usulan': 'bg-green-100 text-green-700',
            'komplain': 'bg-red-100 text-red-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'normal': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'high': return 'Tinggi';
            case 'normal': return 'Normal';
            case 'low': return 'Rendah';
            default: return priority;
        }
    };

    return (
        <>
            <Head title="Pesan - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-[#3B4D3A]">Pesan Masuk</h1>
                        <p className="text-[#6E8BA3] mt-1">Kelola pesan dari halaman publik</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <Mail className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Belum Dibaca</p>
                                    <p className="text-2xl font-bold text-[#3B4D3A]">
                                        {messages.filter(m => m.status === 'unread').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl">
                                    <MailOpen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Dibaca</p>
                                    <p className="text-2xl font-bold text-[#3B4D3A]">
                                        {messages.filter(m => m.status === 'read').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Mail className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Sudah Dibalas</p>
                                    <p className="text-2xl font-bold text-[#3B4D3A]">
                                        {messages.filter(m => (m as any).replied_at).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <Archive className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Diarsipkan</p>
                                    <p className="text-2xl font-bold text-[#3B4D3A]">
                                        {messages.filter(m => m.status === 'archived').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#3B4D3A]">Filter</h3>
                            {[searchQuery, filterStatus, filterCategory, filterPriority, filterReplyStatus].filter(Boolean).length > 0 && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterStatus('');
                                        setFilterCategory('');
                                        setFilterPriority('');
                                        setFilterReplyStatus('');
                                    }}
                                    className="text-sm text-[#6E8BA3] hover:text-[#3B4D3A] transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="text"
                                    placeholder="Cari pesan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Status</option>
                                <option value="unread">Belum Dibaca</option>
                                <option value="read">Dibaca</option>
                                <option value="archived">Diarsipkan</option>
                            </select>

                            <select
                                value={filterReplyStatus}
                                onChange={(e) => setFilterReplyStatus(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Balasan</option>
                                <option value="replied">Sudah Dibalas</option>
                                <option value="not_replied">Belum Dibalas</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Kategori</option>
                                <option value="saran_program">Saran Program</option>
                                <option value="kritik_feedback">Kritik/Feedback</option>
                                <option value="laporan_masalah">Laporan Masalah</option>
                                <option value="ide_usulan">Ide/Usulan</option>
                                <option value="komplain">Komplain Urgent</option>
                            </select>

                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="high">Tinggi</option>
                                <option value="normal">Normal</option>
                                <option value="low">Rendah</option>
                            </select>
                        </div>
                    </div>

                    {/* Messages Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#E8DCC3]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Tanggal</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Nama</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Email</th>

                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Kategori</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Prioritas</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-[#3B4D3A]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMessages.map((message) => (
                                        <tr
                                            key={message.id}
                                            className={`hover:bg-[#F5F5F5] transition-colors ${message.status === 'unread' ? 'bg-red-50/30' : ''
                                                }`}
                                        >
                                            <td className="px-6 py-4 text-[#6E8BA3]">
                                                {new Date(message.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-semibold ${message.status === 'unread' ? 'text-[#1E1E1E]' : 'text-[#6E8BA3]'
                                                    }`}>
                                                    {(message as any).is_anonymous ? 'Anonim' : message.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#6E8BA3]">{message.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor((message as any).category)}`}>
                                                    {getCategoryLabel((message as any).category)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getPriorityColor((message as any).priority)}`}>
                                                    {getPriorityLabel((message as any).priority)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusBadge(message.status)}`}>
                                                    {getStatusLabel(message.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewMessage(message)}
                                                        className="p-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-lg hover:bg-[#d5c9b0] transition-all"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {message.status !== 'archived' && (
                                                        <button
                                                            onClick={() => handleUpdateStatus(message.id, 'archived')}
                                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
                                                            title="Arsipkan"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredMessages.length === 0 && (
                            <div className="p-12 text-center">
                                <Mail className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                                <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada pesan ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Modal */}
                {showDetailModal && viewingMessage && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-[#3B4D3A] mb-2">{viewingMessage.subject}</h2>
                                    <span className={`inline-block px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide border ${getStatusBadge(viewingMessage.status)}`}>
                                        {getStatusLabel(viewingMessage.status)}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="text-[#6E8BA3] hover:text-[#3B4D3A] text-2xl font-bold ml-4"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F5F5F5] rounded-xl">
                                    <div>
                                        <p className="text-sm font-semibold text-[#6E8BA3] mb-1">Dari</p>
                                        <p className="font-semibold text-[#1E1E1E]">{(viewingMessage as any).is_anonymous ? 'Anonim' : viewingMessage.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#6E8BA3] mb-1">Email</p>
                                        <p className="text-[#1E1E1E] break-all">{viewingMessage.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#6E8BA3] mb-1">Kategori</p>
                                        <p className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getCategoryColor((viewingMessage as any).category)}`}>
                                            {getCategoryLabel((viewingMessage as any).category)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#6E8BA3] mb-1">Prioritas</p>
                                        <p className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getPriorityColor((viewingMessage as any).priority)}`}>
                                            {getPriorityLabel((viewingMessage as any).priority)}
                                        </p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <p className="text-sm font-semibold text-[#6E8BA3] mb-1">Tanggal</p>
                                        <p className="text-[#1E1E1E]">
                                            {new Date(viewingMessage.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-[#3B4D3A] mb-3">Pesan</h3>
                                    <div className="p-4 bg-[#F5F5F5] rounded-xl max-h-60 overflow-y-auto">
                                        <p className="text-[#1E1E1E] whitespace-pre-wrap">{viewingMessage.message}</p>
                                    </div>
                                </div>

                                {(viewingMessage as any).replied_at && (
                                    <div className="border-l-4 border-green-500 p-4 bg-green-50 rounded-xl">
                                        <h3 className="text-lg font-bold text-green-700 mb-2">✓ Balasan Admin</h3>
                                        <p className="text-sm text-green-600 mb-3">
                                            Dibalas oleh {(viewingMessage as any).replied_by?.name} pada {new Date((viewingMessage as any).replied_at).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-[#1E1E1E] whitespace-pre-wrap">{(viewingMessage as any).reply_message}</p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-3">
                                    {!(viewingMessage as any).replied_at && (
                                        <button
                                            onClick={() => setShowReplyModal(true)}
                                            className="w-full sm:flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold flex items-center justify-center gap-2"
                                        >
                                            <span className="text-lg">💬</span> Balas Pesan
                                        </button>
                                    )}
                                    {viewingMessage.status !== 'archived' && (
                                        <button
                                            onClick={() => {
                                                handleUpdateStatus(viewingMessage.id, 'archived');
                                                setShowDetailModal(false);
                                            }}
                                            className="w-full sm:flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Archive className="w-5 h-5" />
                                            Arsipkan
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setShowDetailModal(false)}
                                        className="w-full sm:flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reply Modal */}
                {showReplyModal && viewingMessage && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#3B4D3A] mb-2">Balas Pesan</h2>
                                    <p className="text-sm text-[#6E8BA3]">Dari: {(viewingMessage as any).is_anonymous ? 'Anonim' : viewingMessage.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowReplyModal(false)}
                                    className="text-[#6E8BA3] hover:text-[#3B4D3A] text-2xl font-bold"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-[#F5F5F5] rounded-xl border-l-4 border-[#3B4D3A]">
                                    <p className="text-sm font-semibold text-[#6E8BA3] mb-2">Pesan Original:</p>
                                    <p className="text-[#1E1E1E] text-sm whitespace-pre-wrap">{viewingMessage.message}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Balasan Anda *
                                    </label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white bg-[#F5F5F5] outline-none transition-all"
                                        placeholder="Tulis balasan Anda di sini..."
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowReplyModal(false);
                                            setReplyText('');
                                        }}
                                        className="w-full sm:flex-1 px-6 py-3 bg-[#F5F5F5] text-[#6E8BA3] rounded-xl hover:bg-[#E8DCC3] transition-all font-semibold"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReply}
                                        disabled={loading || !replyText.trim()}
                                        className="w-full sm:flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Mengirim...' : 'Kirim Balasan'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </>
    );
};

export default MessagesPage;
