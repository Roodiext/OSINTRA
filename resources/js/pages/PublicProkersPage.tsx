import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import api from '@/lib/axios';
import type { Proker, Division } from '@/types';

const PublicProkersPage: React.FC = () => {
    const [prokers, setProkers] = useState<Proker[]>([]);
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDivision, setFilterDivision] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prokersRes, divisionsRes] = await Promise.all([
                    api.get('/prokers', { params: { per_page: 100 } }),
                    api.get('/divisions'),
                ]);
                setProkers(prokersRes.data.data || prokersRes.data);
                setDivisions(Array.isArray(divisionsRes.data) ? divisionsRes.data : (divisionsRes.data.data || []));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProkers = prokers.filter(proker => {
        const matchesSearch = proker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proker.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDivision = !filterDivision ||
            (proker.divisions && proker.divisions.some(d => d.id.toString() === filterDivision));
        const matchesStatus = !filterStatus || proker.status === filterStatus;
        return matchesSearch && matchesDivision && matchesStatus;
    });

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

    return (
        <>
            <Head title="Program Kerja - OSINTRA" />
            <PublicLayout>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-26 pb-12 md:pt-25">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-[#3B4D3A] mb-4 mt-3">Program Kerja OSIS</h1>
                            <p className="text-lg text-gray-600">Dokumentasi kegiatan dan program kerja OSIS SMK Negeri 6 Surakarta</p>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Cari program kerja..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent"
                                    />
                                </div>
                                <select
                                    value={filterDivision}
                                    onChange={(e) => setFilterDivision(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent"
                                >
                                    <option value="">Semua Divisi</option>
                                    {divisions.map(div => (
                                        <option key={div.id} value={div.id.toString()}>{div.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B4D3A] focus:border-transparent"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="planned">Direncanakan</option>
                                    <option value="ongoing">Berlangsung</option>
                                    <option value="done">Selesai</option>
                                </select>
                            </div>
                        </div>

                        {/* Prokers Grid */}
                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Memuat...</p>
                            </div>
                        ) : filteredProkers.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                                <p className="text-gray-500">Tidak ada program kerja yang ditemukan</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {filteredProkers.map((proker) => {
                                    const thumbnail = proker.media?.find(m => m.is_thumbnail) || proker.media?.[0];

                                    return (
                                        <div
                                            key={proker.id}
                                            onClick={() => router.visit(`/prokers/${proker.id}`)}
                                            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
                                        >
                                            {thumbnail && (
                                                <div className="relative h-48 overflow-hidden">
                                                    {thumbnail.media_type === 'image' ? (
                                                        <img
                                                            src={thumbnail.media_url}
                                                            alt={proker.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={thumbnail.media_url}
                                                            className="w-full h-full object-cover"
                                                            muted
                                                        />
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[proker.status]}`}>
                                                            {statusLabels[proker.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <h3 className="text-xl font-bold text-[#3B4D3A] mb-3 line-clamp-2">{proker.title}</h3>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            {proker.end_date && proker.end_date !== proker.date ? (
                                                                <>
                                                                    {new Date(proker.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                    {' - '}
                                                                    {new Date(proker.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                                </>
                                                            ) : (
                                                                new Date(proker.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                                            )}
                                                        </span>
                                                    </div>
                                                    {proker.location && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <MapPin className="w-4 h-4" />
                                                            <span>{proker.location}</span>
                                                        </div>
                                                    )}
                                                    {proker.divisions && proker.divisions.length > 0 && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Users className="w-4 h-4" />
                                                            <span>{proker.divisions.map(d => d.name).join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {proker.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{proker.description}</p>
                                                )}

                                                {proker.media && proker.media.length > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-[#3B4D3A] font-semibold">
                                                        <span>{proker.media.length} Media</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </PublicLayout>
        </>
    );
};

export default PublicProkersPage;


