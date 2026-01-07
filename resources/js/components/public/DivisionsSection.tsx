import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Award, Shield, DollarSign, Megaphone, Camera, Eye, X, ChevronRight, Grid } from 'lucide-react';
import api from '@/lib/axios';
import type { Position } from '@/types';

const DivisionsSection: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<Position | null>(null);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await api.get('/positions');
                setPositions(response.data);
            } catch (error) {
                console.error('Failed to fetch divisions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, []);

    const organizePositions = () => {
        const structure = {
            top: [] as Position[],
            middle: [] as Position[],
            divisions: [] as Position[]
        };

        positions.forEach(position => {
            const nameLower = position.name.toLowerCase();

            if (nameLower.includes('ketua') && !nameLower.includes('wakil')) {
                structure.top.unshift(position);
            } else if (nameLower.includes('wakil')) {
                structure.top.push(position);
            }
            else if (
                nameLower.includes('sekretaris') ||
                nameLower.includes('bendahara') ||
                nameLower.includes('humas') ||
                nameLower.includes('hubungan masyarakat') ||
                nameLower.includes('medkom') ||
                nameLower.includes('media komunikasi') ||
                nameLower.includes('pengawas')
            ) {
                structure.middle.push(position);
            }
            else {
                structure.divisions.push(position);
            }
        });

        return structure;
    };

    const getIconForPosition = (name: string) => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes('ketua')) return Users;
        if (nameLower.includes('sekretaris')) return Briefcase;
        if (nameLower.includes('bendahara')) return DollarSign;
        if (nameLower.includes('humas') || nameLower.includes('hubungan')) return Megaphone;
        if (nameLower.includes('medkom') || nameLower.includes('media')) return Camera;
        if (nameLower.includes('pengawas')) return Eye;
        return Award;
    };

    // Modal Component untuk Detail Single Division
    const DivisionDetailModal = ({ isOpen, onClose, division }: { isOpen: boolean; onClose: () => void; division: Position | null }) => {
        if (!isOpen || !division) return null;

        const IconComponent = getIconForPosition(division.name);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(59, 77, 58, 0.1)' }}>
                                <IconComponent className="w-6 h-6" style={{ color: '#3B4D3A' }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: '#3B4D3A' }}>{division.name}</h3>
                                <p className="text-sm text-gray-500">Detail Bidang</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Deskripsi</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {division.description || 'Bertanggung jawab atas pelaksanaan program kerja spesifik di bidangnya.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-transform active:scale-95"
                            style={{ backgroundColor: '#3B4D3A' }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Modal Component untuk Mobile
    const DivisionsModal = ({ isOpen, onClose, divisions }: { isOpen: boolean; onClose: () => void; divisions: Position[] }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <div className="relative w-full max-w-2xl bg-white md:rounded-2xl rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white md:rounded-t-2xl rounded-t-3xl z-10">
                        <div>
                            <h3 className="text-xl font-bold" style={{ color: '#3B4D3A' }}>Daftar Sie Bidang</h3>
                            <p className="text-sm text-gray-500">Divisi pelaksana program kerja</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4">
                            {divisions.map((position) => {
                                const IconComponent = getIconForPosition(position.name);
                                return (
                                    <div
                                        key={position.id}
                                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 shadow-sm bg-gray-50/50"
                                    >
                                        <div className="p-3 rounded-xl bg-white shadow-sm shrink-0">
                                            <IconComponent className="w-6 h-6" style={{ color: '#3B4D3A' }} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">{position.name}</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                {position.description || 'Bertanggung jawab atas pelaksanaan program kerja spesifik di bidangnya.'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50 md:rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="w-full py-3 rounded-xl font-semibold text-white transition-transform active:scale-95"
                            style={{ backgroundColor: '#3B4D3A' }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#3B4D3A' }} />
                        <p style={{ color: '#6E8BA3' }}>Memuat struktur organisasi...</p>
                    </div>
                </div>
            </section>
        );
    }

    const structure = organizePositions();

    return (
        <section id="divisions" className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
            {/* Inject Styles */}
            <style>{`
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes drawLine { from { transform: scaleY(0); } to { transform: scaleY(1); } }
                @keyframes drawHorizontal { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                .position-card { animation: fadeInUp 0.6s ease-out forwards; }
                .position-card:hover { transform: translateY(-4px); }
                .vertical-line { animation: drawLine 0.8s ease-out forwards; transform-origin: top; }
                .horizontal-line { animation: drawHorizontal 0.8s ease-out forwards; transform-origin: center; }
                .connector-dot { animation: fadeInDown 0.5s ease-out forwards; }
            `}</style>

            <div className="absolute inset-0 opacity-5" style={{
                background: 'radial-gradient(circle at 20% 50%, #E8DCC3 0%, transparent 50%)',
                pointerEvents: 'none'
            }} />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <div className="inline-block mb-4">
                        <span className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(232, 220, 195, 0.2)', color: '#3B4D3A' }}>
                            Organisasi Siswa Intra Sekolah
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                        Struktur Organisasi OSIS
                    </h2>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3B4D3A' }} />
                        <div className="w-12 h-1 rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                    </div>
                    <p style={{ color: '#6E8BA3' }} className="text-lg max-w-2xl mx-auto">
                        Hierarki kepemimpinan dan pembagian tugas dalam organisasi OSIS
                    </p>
                </div>

                {positions.length > 0 ? (
                    <div className="space-y-0">
                        {/* === TIER 1: Ketua & Wakil === */}
                        {structure.top.length > 0 && (
                            <div className="flex flex-col items-center relative">
                                <div className="flex gap-6 justify-center flex-wrap mb-8">
                                    {structure.top.map((position, index) => {
                                        const IconComponent = getIconForPosition(position.name);
                                        return (
                                            <div
                                                key={position.id}
                                                className="position-card w-64 p-6 rounded-2xl transition-all duration-300 relative z-20"
                                                style={{
                                                    animationDelay: `${index * 100}ms`,
                                                    backgroundColor: '#3B4D3A',
                                                    boxShadow: '0 8px 25px rgba(59, 77, 58, 0.3)'
                                                }}
                                            >
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(232, 220, 195, 0.2)' }}>
                                                        <IconComponent className="w-6 h-6" style={{ color: '#E8DCC3' }} />
                                                    </div>
                                                </div>
                                                <h3 className="text-xl font-bold mb-2 text-white">{position.name}</h3>
                                                <p className="text-sm leading-relaxed" style={{ color: '#E8DCC3', opacity: 0.9 }}>
                                                    {position.description || 'Pemimpin utama organisasi'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Connector ke Tier 2 */}
                                {structure.middle.length > 0 && (
                                    <div className="absolute" style={{ top: '100%', left: '50%', transform: 'translateX(-50%)' }}>
                                        <div className="vertical-line w-0.5 h-16" style={{ backgroundColor: '#E8DCC3' }} />
                                        <div className="connector-dot w-2 h-2 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2" style={{ backgroundColor: '#3B4D3A' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {structure.middle.length > 0 && <div className="h-16" />}

                        {/* === TIER 2: Sekretaris, Bendahara, dll === */}
                        {structure.middle.length > 0 && (
                            <div className="flex flex-col items-center relative">
                                {/* Horizontal Line Spanning Tier 2 */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl hidden md:block" style={{ zIndex: 0 }}>
                                    <div className="horizontal-line h-0.5 w-full" style={{ backgroundColor: '#E8DCC3' }} />
                                </div>

                                <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full max-w-7xl relative pt-8 px-2">
                                    {structure.middle.map((position, index) => (
                                        <div key={position.id} className="flex flex-col items-center relative group">
                                            {/* Vertical Connectors (Desktop) */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden md:block" style={{ zIndex: 50 }}>
                                                <div className="vertical-line w-0.5 h-8" style={{ backgroundColor: '#E8DCC3', animationDelay: '0.3s' }} />
                                                <div className="connector-dot w-2 h-2 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: '#3B4D3A', animationDelay: '0.3s' }} />
                                            </div>

                                            {/* Card */}
                                            <div
                                                className="position-card p-4 md:p-5 rounded-xl transition-all duration-300 w-48 md:w-56 bg-white relative z-10 h-full flex flex-col justify-between"
                                                style={{
                                                    animationDelay: `${(structure.top.length + index) * 100}ms`,
                                                    border: '2px solid #E8DCC3',
                                                    boxShadow: '0 4px 15px rgba(59, 77, 58, 0.1)'
                                                }}
                                            >
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="p-2 md:p-3 rounded-lg mb-2 md:mb-3" style={{ background: 'linear-gradient(135deg, #3B4D3A 0%, #2a3729 100%)' }}>
                                                        {React.createElement(getIconForPosition(position.name), { className: "w-4 h-4 md:w-5 md:h-5 text-white" })}
                                                    </div>
                                                    <h3 className="text-xs md:text-sm font-bold mb-1 md:mb-2" style={{ color: '#3B4D3A' }}>{position.name}</h3>
                                                    <p className="text-xs leading-relaxed" style={{ color: '#6E8BA3' }}>{position.description || 'Koordinator bidang'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Line Connector to Divisions */}
                                {structure.divisions.length > 0 && (
                                    <div className="relative mt-8">
                                        <div className="vertical-line w-0.5 h-16 mx-auto" style={{ backgroundColor: '#E8DCC3', animationDelay: '0.6s' }} />
                                        <div className="connector-dot w-2 h-2 rounded-full absolute -bottom-1 left-1/2 -translate-x-1/2" style={{ backgroundColor: '#3B4D3A', animationDelay: '0.6s' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === TIER 3: Sie Bidang === */}
                        {structure.divisions.length > 0 && (
                            <div className="flex flex-col items-center pt-8">
                                <div className="text-center mb-8">
                                    <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#3B4D3A' }}>Sie Bidang</h3>
                                    <p className="text-sm" style={{ color: '#6E8BA3' }}>Divisi pelaksana program kerja</p>
                                </div>

                                {/* MOBILE VIEW: Button Trigger Modal */}
                                <div className="block md:hidden w-full max-w-xs">
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full flex items-center justify-between p-4 rounded-xl shadow-lg transition-transform active:scale-95"
                                        style={{ backgroundColor: '#3B4D3A', color: 'white' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Grid className="w-5 h-5 opacity-80" />
                                            <span className="font-semibold">Lihat Semua Bidang</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-white/20">
                                                {structure.divisions.length}
                                            </span>
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </button>
                                </div>

                                {/* DESKTOP VIEW: Neat Tree Grid */}
                                <div className="hidden md:block w-full max-w-6xl px-4">
                                    {/* Garis Horizontal Penghubung Induk */}
                                    <div className="relative mb-8 w-full">
                                        {/* Trik CSS: Garis horizontal span dari child pertama ke child terakhir */}
                                        <div className="absolute top-0 left-[12.5%] right-[12.5%] h-0.5" style={{ backgroundColor: '#E8DCC3' }} />
                                    </div>

                                    <div className="grid grid-cols-4 gap-x-6 gap-y-12">
                                        {structure.divisions.map((position, index) => {
                                            const IconComponent = getIconForPosition(position.name);
                                            return (
                                                <div key={position.id} className="relative flex flex-col items-center">

                                                    {/* Garis Vertikal Kecil ke Kartu */}
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                                                        <div className="h-8 w-0.5" style={{ backgroundColor: '#E8DCC3' }} />
                                                        <div className="w-2 h-2 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: '#3B4D3A' }} />
                                                    </div>

                                                    <button
                                                        onClick={() => setSelectedDivision(position)}
                                                        className="position-card w-full p-4 rounded-lg transition-all duration-300 relative bg-white group hover:shadow-lg hover:-translate-y-1 cursor-pointer text-left"
                                                        style={{
                                                            animationDelay: `${(structure.top.length + structure.middle.length + index) * 50}ms`,
                                                            border: '1px solid rgba(232, 220, 195, 0.5)',
                                                            boxShadow: '0 2px 10px rgba(59, 77, 58, 0.08)'
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: 'rgba(59, 77, 58, 0.1)' }}>
                                                                <IconComponent className="w-4 h-4" style={{ color: '#3B4D3A' }} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="text-sm font-bold mb-1 text-gray-800 line-clamp-1" title={position.name}>
                                                                    {position.name}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 line-clamp-2">
                                                                    {position.description || 'Koordinator dan pelaksana bidang'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Users className="w-16 h-16 mx-auto opacity-20 mb-4" style={{ color: '#3B4D3A' }} />
                        <p style={{ color: '#6E8BA3' }} className="text-lg font-medium">Belum ada struktur organisasi</p>
                    </div>
                )}
            </div>

            {/* Render Modals */}
            <DivisionsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                divisions={structure.divisions}
            />
            <DivisionDetailModal
                isOpen={selectedDivision !== null}
                onClose={() => setSelectedDivision(null)}
                division={selectedDivision}
            />
        </section>
    );
};

export default DivisionsSection;