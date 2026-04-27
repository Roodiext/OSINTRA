import React, { useEffect, useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import api from '@/lib/axios';
import type { Proker } from '@/types';

const PublicProkersPage: React.FC = () => {
    const [prokers, setProkers] = useState<Proker[]>([]);

    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem('prokersSearch') || '');
    const [filterYear, setFilterYear] = useState(() => sessionStorage.getItem('prokersFilterYear') || '');

    useEffect(() => {
        sessionStorage.setItem('prokersSearch', searchQuery);
        sessionStorage.setItem('prokersFilterYear', filterYear);
    }, [searchQuery, filterYear]);

    const availableYears = useMemo(() => {
        const years = new Set(prokers.map(p => new Date(p.date).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [prokers]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [prokersRes] = await Promise.all([
                    api.get('/prokers', { params: { per_page: 100 } })
                ]);
                setProkers(prokersRes.data.data || prokersRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
                setTimeout(() => {
                    const scrollY = sessionStorage.getItem('prokersScrollY');
                    if (scrollY) {
                        window.scrollTo({ top: parseInt(scrollY, 10), behavior: 'instant' });
                        sessionStorage.removeItem('prokersScrollY');
                    }
                }, 100);
            }
        };

        fetchData();
    }, []);

    const filteredProkers = prokers.filter(proker => {
        const matchesSearch = proker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proker.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesYear = !filterYear || new Date(proker.date).getFullYear().toString() === filterYear;
        return matchesSearch && matchesYear;
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
                        <div className="max-w-4xl mx-auto mb-10 px-2 lg:px-0">
                            <div className="bg-white rounded-2xl md:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-2 md:pl-6 flex flex-col md:flex-row items-center gap-2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
                                <div className="relative flex-1 w-full text-gray-600 flex flex-row items-center border-b md:border-b-0 border-gray-100 pb-2 md:pb-0 px-3 md:px-0 mt-2 md:mt-0">
                                    <Search className="w-5 h-5 text-[#3B4D3A] opacity-60 mr-3 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Cari program kerja (contoh: Classmeet, HUT)..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent border-none focus:ring-0 px-0 py-2 text-sm md:text-base placeholder-gray-400 outline-none focus:outline-none"
                                    />
                                </div>
                                <div className="hidden md:block w-px h-8 bg-gray-200 shrink-0 mx-2"></div>
                                <div className="w-full md:w-auto relative group">
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#3B4D3A] opacity-70">
                                        <Filter className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={filterYear}
                                        onChange={(e) => setFilterYear(e.target.value)}
                                        className="w-full min-w-[160px] appearance-none pl-9 pr-10 py-2.5 md:py-3 bg-gray-50 md:bg-transparent border-none focus:ring-0 rounded-xl md:rounded-full text-sm font-semibold text-[#3B4D3A] cursor-pointer outline-none focus:outline-none"
                                    >
                                        <option value="">Semua Tahun</option>
                                        {availableYears.map(year => (
                                            <option key={year} value={year.toString()}>{year}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#3B4D3A]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
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
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {filteredProkers.map((proker) => {
                                    const thumbnail = proker.media?.find(m => m.is_thumbnail) || proker.media?.[0];

                                    return (
                                        <div
                                            key={proker.id}
                                            onClick={() => {
                                                sessionStorage.setItem('prokersScrollY', window.scrollY.toString());
                                                router.visit(`/prokers/${proker.id}`);
                                            }}
                                            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 flex flex-col"
                                        >
                                            {thumbnail && (
                                                <div className="relative h-32 md:h-48 overflow-hidden shrink-0">
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
                                                    <div className="absolute top-2 right-2 md:top-4 md:right-4">
                                                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold ${statusColors[proker.status]}`}>
                                                            {statusLabels[proker.status]}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="p-3 md:p-6 flex flex-col flex-1">
                                                <h3 className="text-sm md:text-xl font-bold text-[#3B4D3A] mb-2 md:mb-3 line-clamp-2">{proker.title}</h3>

                                                <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                                                    <div className="flex items-start md:items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                                                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0" />
                                                        <span className="line-clamp-2">
                                                            {proker.end_date && proker.end_date !== proker.date ? (
                                                                <>
                                                                    {new Date(proker.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                    {' - '}
                                                                    {new Date(proker.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </>
                                                            ) : (
                                                                new Date(proker.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            )}
                                                        </span>
                                                    </div>
                                                    {proker.location && (
                                                        <div className="flex items-start md:items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                                                            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0" />
                                                            <span className="line-clamp-1">{proker.location}</span>
                                                        </div>
                                                    )}
                                                    {proker.divisions && proker.divisions.length > 0 && (
                                                        <div className="flex items-start md:items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-600">
                                                            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 mt-0.5 md:mt-0" />
                                                            <span className="line-clamp-1">{proker.divisions.map(d => d.name).join(', ')}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-auto">
                                                    {proker.description && (
                                                        <p className="text-[10.5px] md:text-sm text-gray-600 line-clamp-2 mb-3 md:mb-4">{proker.description}</p>
                                                    )}

                                                    {proker.media && proker.media.length > 0 && (
                                                        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-[#3B4D3A] font-semibold">
                                                            <span>{proker.media.length} Media</span>
                                                        </div>
                                                    )}
                                                </div>
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


