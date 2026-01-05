import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction } from '@/types';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { usePermissionAlert } from '@/hooks/usePermissionAlert';

interface TransactionsPageProps {
    transactions: Transaction[];
    monthlyData: { month: string; income: number; expense: number }[];
    balance: number;
    totalIncome: number;
    totalExpense: number;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
    transactions: initialTransactions,
    monthlyData,
    balance,
    totalIncome,
    totalExpense
}) => {
    const { props } = usePage<any>();
    usePermissionAlert(props.flash?.permission_message);

    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions || []);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        type: 'income' as 'income' | 'expense',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [loading, setLoading] = useState(false);

    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !filterType || transaction.type === filterType;
        const matchesMonth = !filterMonth || transaction.date.startsWith(filterMonth);
        return matchesSearch && matchesType && matchesMonth;
    });

    const handleOpenModal = () => {
        setFormData({
            title: '',
            amount: '',
            type: 'income',
            description: '',
            date: new Date().toISOString().split('T')[0],
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/transactions', formData);
            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Transaksi berhasil ditambahkan',
                confirmButtonColor: '#3B4D3A',
            });
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
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
                            onClick={handleOpenModal}
                            className="flex items-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all shadow-md"
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
                                    <DollarSign className="w-6 h-6 text-[#3B4D3A]" />
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
                                    <TrendingUp className="w-6 h-6 text-green-600" />
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
                                    <TrendingDown className="w-6 h-6 text-red-600" />
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            <input
                                type="month"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            />
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
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Deskripsi</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-[#3B4D3A]">Jenis</th>
                                        <th className="px-6 py-4 text-right text-sm font-bold text-[#3B4D3A]">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-[#F5F5F5] transition-colors">
                                            <td className="px-6 py-4 text-[#6E8BA3]">
                                                {new Date(transaction.date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-[#1E1E1E]">
                                                {transaction.title}
                                            </td>
                                            <td className="px-6 py-4 text-[#6E8BA3] max-w-xs truncate">
                                                {transaction.description || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${transaction.type === 'income'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredTransactions.length === 0 && (
                            <div className="p-12 text-center">
                                <DollarSign className="w-16 h-16 text-[#6E8BA3] mx-auto mb-4" />
                                <p className="text-[#6E8BA3] text-lg font-medium">Tidak ada transaksi ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                            <h2 className="text-2xl font-bold text-[#3B4D3A] mb-6">Tambah Transaksi</h2>

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
                                        type="number"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                                        placeholder="0"
                                        min="0"
                                    />
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
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                                className="w-4 h-4 text-[#3B4D3A]"
                                            />
                                            <span className="text-sm font-medium text-[#1E1E1E]">Pemasukan</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                                            <input
                                                type="radio"
                                                name="type"
                                                value="expense"
                                                checked={formData.type === 'expense'}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                                className="w-4 h-4 text-[#3B4D3A]"
                                            />
                                            <span className="text-sm font-medium text-[#1E1E1E]">Pengeluaran</span>
                                        </label>
                                    </div>
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
                                        className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
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

export default TransactionsPage;
