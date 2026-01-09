import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { usePermissionAlert } from '@/hooks/usePermissionAlert';

interface ExtendedTransaction extends Transaction {
    status?: 'pending' | 'approved' | 'rejected';
    category?: string;
    approved_by?: number;
    approver?: {
        id: number;
        name: string;
        email: string;
    };
}

interface TransactionsPageProps {
    transactions: ExtendedTransaction[];
    monthlyData: { month: string; income: number; expense: number }[];
    balance: number;
    totalIncome: number;
    totalExpense: number;
}

const CATEGORIES = ['Iuran', 'Donasi', 'Supplies', 'Event', 'Utility', 'Transport', 'Other'];

const TransactionsPage: React.FC<TransactionsPageProps> = ({
    transactions: initialTransactions,
    monthlyData,
    balance,
    totalIncome,
    totalExpense
}) => {
    const { props } = usePage<any>();
    usePermissionAlert(props.flash?.permission_message);

    const [transactions, setTransactions] = useState<ExtendedTransaction[]>(initialTransactions || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'income' as 'income' | 'expense',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !filterType || transaction.type === filterType;
        const matchesStatus = !filterStatus || (transaction.status || 'approved') === filterStatus;
        const matchesCategory = !filterCategory || transaction.category === filterCategory;
        const matchesStartDate = !startDate || transaction.date >= startDate;
        const matchesEndDate = !endDate || transaction.date <= endDate;
        const matchesMinAmount = !minAmount || transaction.amount >= parseFloat(minAmount);
        const matchesMaxAmount = !maxAmount || transaction.amount <= parseFloat(maxAmount);

        return matchesSearch && matchesType && matchesStatus && matchesCategory &&
            matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });

    const handleOpenModal = (transaction?: ExtendedTransaction) => {
        console.log('Opening modal for transaction:', transaction);
        try {
            if (transaction) {
                setEditingId(transaction.id);
                setFormData({
                    title: transaction.title,
                    amount: transaction.amount.toString(),
                    type: transaction.type,
                    description: transaction.description || '',
                    category: transaction.category || '',
                    date: transaction.date,
                });
            } else {
                setEditingId(null);
                setFormData({
                    title: '',
                    amount: '',
                    type: 'income',
                    description: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                });
            }
            console.log('About to set showModal to true');
            setShowModal(true);
            console.log('showModal set to true');
        } catch (error) {
            console.error('Error opening modal:', error);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse amount properly - convert string numeric to actual number
            const amountValue = parseAmountInput(formData.amount);
            
            const submitData = {
                title: formData.title,
                amount: amountValue,
                type: formData.type,
                description: formData.description,
                category: formData.category || null,
                date: formData.date,
            };

            if (editingId) {
                await api.put(`/transactions/${editingId}`, submitData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Transaksi berhasil diperbarui',
                    confirmButtonColor: '#3B4D3A',
                });
            } else {
                await api.post('/transactions', submitData);
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Transaksi berhasil ditambahkan',
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

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Hapus Transaksi?',
            text: 'Aksi ini tidak dapat dibatalkan',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Hapus',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/transactions/${id}`);
                Swal.fire({
                    icon: 'success',
                    title: 'Terhapus!',
                    text: 'Transaksi berhasil dihapus',
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

    const handleApprove = async (id: number, status: 'approved' | 'rejected') => {
        const message = status === 'approved' ? 'setujui' : 'tolak';
        const result = await Swal.fire({
            title: `${status === 'approved' ? 'Setujui' : 'Tolak'} Transaksi?`,
            text: `Anda akan ${message} transaksi ini`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: status === 'approved' ? '#22c55e' : '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, ' + message,
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed) {
            try {
                await api.patch(`/transactions/${id}/approve`, { status });
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: `Transaksi berhasil di${message}`,
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

    const getStatusBadge = (status?: string) => {
        const current = status || 'approved';
        const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
            pending: {
                color: 'text-yellow-700',
                bg: 'bg-yellow-100',
                icon: <Clock className="w-4 h-4" />
            },
            approved: {
                color: 'text-green-700',
                bg: 'bg-green-100',
                icon: <CheckCircle className="w-4 h-4" />
            },
            rejected: {
                color: 'text-red-700',
                bg: 'bg-red-100',
                icon: <XCircle className="w-4 h-4" />
            }
        };

        const config = statusConfig[current] || statusConfig.approved;
        return (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${config.color}`}>
                {config.icon}
                <span className="text-sm font-semibold capitalize">{current}</span>
            </div>
        );
    };

    const parseAmountInput = (value: string): number => {
        if (!value) return 0;
        // Remove all non-numeric characters
        const numericOnly = value.replace(/\D/g, '');
        return parseInt(numericOnly) || 0;
    };

    const formatInputValue = (value: string | number): string => {
        if (!value) return '';
        const numValue = typeof value === 'string' ? parseAmountInput(value) : parseInt(value.toString());
        if (!numValue) return '';
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    const formatCurrency = (value: number | string): string => {
        if (value === null || value === undefined) return 'Rp 0';
        // Always treat as a number - no additional parsing if already numeric
        const numValue = typeof value === 'string' ? parseAmountInput(value) : Math.floor(value);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    const handleAmountChange = (value: string, setter: Function) => {
        try {
            // Store as numeric string for consistency
            const numericValue = parseAmountInput(value);
            setter(numericValue.toString());
        } catch (error) {
            console.error('Error in handleAmountChange:', error);
        }
    };

    return (
        <>
            <Head title="Transaksi - OSINTRA" />
            <DashboardLayout>
                <div className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#3B4D3A]">Transaksi Keuangan</h1>
                            <p className="text-[#6E8BA3] mt-1">Kelola pemasukan dan pengeluaran OSIS</p>
                        </div>
                        <button
                            type="button"
                            onClick={(e) => {
                                console.log('Button clicked!', e);
                                e.preventDefault();
                                handleOpenModal();
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Transaksi
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#3B4D3A]">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-[#E8DCC3] rounded-xl">
                                    <AlertCircle className="w-6 h-6 text-[#3B4D3A]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Saldo</p>
                                    <p className="text-2xl font-bold text-[#3B4D3A]">{formatCurrency(balance)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-green-50 rounded-xl">
                                    <Plus className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Total Pemasukan</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#6E8BA3]">Total Pengeluaran</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                        <h3 className="text-xl font-bold text-[#3B4D3A] mb-6">Grafik Keuangan Bulanan</h3>
                        <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 pb-2">
                            <div className="min-w-[600px] h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ left: 30, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC3" />
                                        <XAxis dataKey="month" stroke="#6E8BA3" />
                                        <YAxis
                                            stroke="#6E8BA3"
                                            width={80}
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`;
                                                if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                                                return value;
                                            }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #E8DCC3',
                                                borderRadius: '12px',
                                            }}
                                            formatter={(value: number) => formatCurrency(value)}
                                        />
                                        <Legend />
                                        <Bar dataKey="income" fill="#22c55e" name="Pemasukan" radius={[8, 8, 0, 0]} />
                                        <Bar dataKey="expense" fill="#ef4444" name="Pengeluaran" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#3B4D3A]">Filter Lanjutan</h3>
                            {[searchQuery, filterType, filterStatus, filterCategory, startDate, endDate, minAmount, maxAmount].filter(Boolean).length > 0 && (
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilterType('');
                                        setFilterStatus('');
                                        setFilterCategory('');
                                        setStartDate('');
                                        setEndDate('');
                                        setMinAmount('');
                                        setMaxAmount('');
                                    }}
                                    className="text-sm text-[#6E8BA3] hover:text-[#3B4D3A] transition-colors"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="text"
                                    placeholder="Cari transaksi..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Jenis</option>
                                <option value="income">Pemasukan</option>
                                <option value="expense">Pengeluaran</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            >
                                <option value="">Semua Kategori</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all text-[#3B4D3A]"
                            />

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all text-[#3B4D3A]"
                            />

                            <div>
                                <input
                                    type="text"
                                    placeholder="Min. Jumlah"
                                    value={minAmount ? formatInputValue(minAmount) : ''}
                                    onChange={(e) => handleAmountChange(e.target.value, setMinAmount)}
                                    className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all w-full"
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Max. Jumlah"
                                    value={maxAmount ? formatInputValue(maxAmount) : ''}
                                    onChange={(e) => handleAmountChange(e.target.value, setMaxAmount)}
                                    className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-[#E8DCC3]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Tanggal</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Judul</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Kategori</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Jenis</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-[#3B4D3A]">Jumlah</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Status</th>
                                        <th className="px-6 py-4 text-center text-sm font-bold text-[#3B4D3A]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-[#F5F5F5] transition-colors">
                                            <td className="px-6 py-4 text-sm text-[#6E8BA3]">
                                                {new Date(transaction.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-[#3B4D3A]">
                                                {transaction.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-[#6E8BA3]">
                                                {transaction.category || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                    transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-bold text-[#3B4D3A]">
                                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {getStatusBadge(transaction.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 justify-center">
                                                    {(transaction.status === 'pending' || !transaction.status) && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprove(transaction.id, 'approved')}
                                                                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                                title="Setujui"
                                                            >
                                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleApprove(transaction.id, 'rejected')}
                                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Tolak"
                                                            >
                                                                <XCircle className="w-5 h-5 text-red-600" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleOpenModal(transaction)}
                                                        className="p-2 hover:bg-[#E8DCC3] rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-5 h-5 text-[#3B4D3A]" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-5 h-5 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredTransactions.length === 0 && (
                            <div className="p-12 text-center">
                                <AlertCircle className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                                <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada transaksi ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold text-[#3B4D3A] mb-6">
                                {editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Judul *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                        placeholder="Contoh: Iuran Bulanan"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Jumlah *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.amount ? formatInputValue(formData.amount) : ''}
                                        onChange={(e) => handleAmountChange(e.target.value, (val: string) => setFormData({ ...formData, amount: val }))}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                        placeholder="Contoh: 150000"
                                    />
                                    <p className="text-xs text-[#6E8BA3] mt-1">Format: angka tanpa titik atau koma</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Jenis *
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="income"
                                                checked={formData.type === 'income'}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium text-[#1E1E1E]">Pemasukan</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm font-medium text-[#1E1E1E]">Pengeluaran</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Kategori
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Tanggal *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all text-[#3B4D3A]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                        Deskripsi
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all resize-none"
                                        placeholder="Deskripsi transaksi..."
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
                                        {loading ? 'Menyimpan...' : editingId ? 'Update' : 'Tambah'}
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

export default TransactionsPage;
