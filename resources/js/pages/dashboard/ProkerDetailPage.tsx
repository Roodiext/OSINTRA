import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { ArrowLeft, Calendar, MapPin, Users, BookOpen, Edit, Trash2, Plus } from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import AddPanitiaModal from '@/components/dashboard/AddPanitiaModal';
import EditDivisionsModal from '@/components/dashboard/EditDivisionsModal';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface Position {
    id: number;
    name: string;
    description?: string;
}

interface Division {
    id: number;
    name: string;
}

interface ProkerAnggota {
    id: number;
    user_id: number;
    division_id: number;
    position_id: number;
    role?: string;
    user: User;
    position?: Position;
    division: Division;
}

interface Proker {
    id: number;
    title: string;
    description?: string;
    date: string;
    location?: string;
    status: 'planned' | 'ongoing' | 'done';
    divisions: Division[];
    anggota: ProkerAnggota[];
    media: any[];
}

const ProkerDetailPage: React.FC = () => {
    const [proker, setProker] = useState<Proker | null>(null);
    const [loading, setLoading] = useState(true);
    const [positions, setPositions] = useState<Position[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [showAddPanitiaModal, setShowAddPanitiaModal] = useState(false);
    const [showEditDivisionsModal, setShowEditDivisionsModal] = useState(false);
    const prokerId = window.location.pathname.split('/').pop();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prokerRes, positionsRes, divisionsRes] = await Promise.all([
                    api.get(`/prokers/${prokerId}`),
                    api.get('/positions'),
                    api.get('/divisions'),
                ]);
                setProker(prokerRes.data);
                setPositions(positionsRes.data.data || []);
                // Divisions API mengembalikan array langsung, bukan wrapped dalam 'data'
                const divisionsData = Array.isArray(divisionsRes.data) ? divisionsRes.data : (divisionsRes.data.data || []);
                setDivisions(divisionsData);
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Gagal memuat detail proker', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (prokerId) fetchData();
    }, [prokerId]);

    const handleDeletePanitia = async (anggotaId: number) => {
        const result = await Swal.fire({
            title: 'Hapus Panitia?',
            text: 'Apakah Anda yakin ingin menghapus panitia ini?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6E8BA3',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
        });

        if (result.isConfirmed && proker) {
            try {
                await api.delete(`/prokers/${proker.id}/anggota/${anggotaId}`);
                Swal.fire('Terhapus!', 'Panitia berhasil dihapus', 'success');
                const response = await api.get(`/prokers/${proker.id}`);
                setProker(response.data);
            } catch (error) {
                Swal.fire('Gagal!', 'Gagal menghapus panitia', 'error');
            }
        }
    };

    const handleAddPanitiaSuccess = async () => {
        if (proker) {
            const response = await api.get(`/prokers/${proker.id}`);
            setProker(response.data);
        }
    };

    const handleEditDivisionsSuccess = async () => {
        if (proker) {
            const response = await api.get(`/prokers/${proker.id}`);
            setProker(response.data);
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

    if (!proker) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <p className="text-lg text-gray-500">Proker tidak ditemukan</p>
                </div>
            </DashboardLayout>
        );
    }

    const statusColors = {
        planned: 'bg-yellow-100 text-yellow-800',
        ongoing: 'bg-blue-100 text-blue-800',
        done: 'bg-green-100 text-green-800',
    };

    const statusLabels = {
        planned: 'Direncanakan',
        ongoing: 'Berlangsung',
        done: 'Selesai',
    };

    // Group anggota by division
    const anggotaByDivision = proker.anggota.reduce((acc, member) => {
        const divisionId = member.division_id;
        if (!acc[divisionId]) {
            acc[divisionId] = {
                division: member.division,
                members: [],
            };
        }
        acc[divisionId].members.push(member);
        return acc;
    }, {} as Record<number, { division: Division; members: ProkerAnggota[] }>);

    return (
        <>
            <Head title={`${proker.title} - OSINTRA`} />
            <DashboardLayout>
                <div className="space-y-6 p-6 osintra-content">
                    {/* Back Button */}
                    <button
                        onClick={() => router.visit('/dashboard/prokers')}
                        className="flex items-center gap-2 text-[#3B4D3A] hover:opacity-70 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Kembali ke Program Kerja
                    </button>

                    {/* Header Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-4xl font-bold text-[#3B4D3A] mb-2">{proker.title}</h1>
                                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${statusColors[proker.status]}`}>
                                    {statusLabels[proker.status]}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.visit(`/dashboard/prokers/${proker.id}/edit`)}
                                    className="p-3 bg-[#3B4D3A] text-white rounded-lg hover:opacity-90 transition"
                                    title="Edit"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        // TODO: implement delete
                                    }}
                                    className="p-3 bg-red-500 text-white rounded-lg hover:opacity-90 transition"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Event Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-6 h-6 text-[#3B4D3A]" />
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal Pelaksanaan</p>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(proker.date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <MapPin className="w-6 h-6 text-[#3B4D3A]" />
                                <div>
                                    <p className="text-sm text-gray-500">Lokasi</p>
                                    <p className="font-semibold text-gray-800">{proker.location || '-'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Users className="w-6 h-6 text-[#3B4D3A]" />
                                <div>
                                    <p className="text-sm text-gray-500">Jumlah Panitia</p>
                                    <p className="font-semibold text-gray-800">{proker.anggota.length} orang</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {proker.description && (
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="w-6 h-6 text-[#3B4D3A]" />
                                <h2 className="text-2xl font-bold text-[#3B4D3A]">Penjelasan Event</h2>
                            </div>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{proker.description}</p>
                        </div>
                    )}

                    {/* Divisions Info */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-[#3B4D3A]">Divisi yang Terlibat</h2>
                            <button
                                onClick={() => setShowEditDivisionsModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#3B4D3A] text-white rounded-lg hover:opacity-90 transition text-sm font-semibold"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Divisi
                            </button>
                        </div>
                        {proker.divisions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {proker.divisions.map(div => (
                                    <span
                                        key={div.id}
                                        className="px-4 py-2 bg-[#E8DCC3] text-[#3B4D3A] rounded-full font-semibold"
                                    >
                                        {div.name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">Belum ada divisi yang dipilih. Klik tombol Edit Divisi untuk menambahkan.</p>
                        )}
                    </div>

                    {/* Panitia List */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-[#3B4D3A]">Daftar Panitia</h2>
                            <button
                                onClick={() => setShowAddPanitiaModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#3B4D3A] text-white rounded-lg hover:bg-[#2d3a2d] transition-all font-semibold"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Panitia
                            </button>
                        </div>

                        {proker.anggota.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">Belum ada panitia yang ditambahkan</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="bg-[#E8DCC3]">
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">#</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Nama</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Divisi</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Posisi</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Role</th>
                                            <th className="px-6 py-3 font-bold text-[#3B4D3A]">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proker.anggota.map((member, idx) => (
                                            <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="px-6 py-4">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-gray-800">{member.user.name}</p>
                                                    <p className="text-xs text-gray-500">{member.user.username}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{member.division?.name || '-'}</td>
                                                <td className="px-6 py-4 text-gray-700">{member.position?.name || '-'}</td>
                                                <td className="px-6 py-4 text-gray-700">{member.role || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleDeletePanitia(member.id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Members by Division */}
                    {Object.keys(anggotaByDivision).length > 0 && (
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h2 className="text-2xl font-bold text-[#3B4D3A] mb-6">Struktur Panitia Per Divisi</h2>

                            <div className="space-y-8">
                                {Object.values(anggotaByDivision).map(({ division, members }) => (
                                    <div key={division.id} className="border-l-4 border-[#3B4D3A] pl-6">
                                        <h3 className="text-xl font-bold text-[#3B4D3A] mb-4">{division.name}</h3>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="px-4 py-2 font-semibold text-gray-700">#</th>
                                                        <th className="px-4 py-2 font-semibold text-gray-700">Nama</th>
                                                        <th className="px-4 py-2 font-semibold text-gray-700">Posisi</th>
                                                        <th className="px-4 py-2 font-semibold text-gray-700">Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {members.map((member, idx) => (
                                                        <tr key={member.id} className="border-b border-gray-200">
                                                            <td className="px-4 py-3">{idx + 1}</td>
                                                            <td className="px-4 py-3">
                                                                <p className="font-semibold text-gray-800">{member.user.name}</p>
                                                                <p className="text-xs text-gray-500">{member.user.username}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700">
                                                                {member.position?.name || '-'}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-700">{member.role || '-'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Panitia Modal */}
                    <AddPanitiaModal
                        isOpen={showAddPanitiaModal}
                        onClose={() => setShowAddPanitiaModal(false)}
                        onSuccess={handleAddPanitiaSuccess}
                        prokerId={proker.id}
                        eventDivisions={proker.divisions}
                        positions={positions}
                    />

                    {/* Edit Divisions Modal */}
                    <EditDivisionsModal
                        isOpen={showEditDivisionsModal}
                        onClose={() => setShowEditDivisionsModal(false)}
                        onSuccess={handleEditDivisionsSuccess}
                        prokerId={proker.id}
                        currentDivisions={proker.divisions}
                        availableDivisions={divisions}
                    />
                </div>
            </DashboardLayout>
        </>
    );
};

export default ProkerDetailPage;

