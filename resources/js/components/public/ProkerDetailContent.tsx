import React from 'react';
import { Calendar, MapPin, Users, Image as ImageIcon, CheckCircle2, Clock, PlayCircle, Info } from 'lucide-react';
import type { Proker, ProkerMedia } from '@/types';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface ProkerDetailContentProps {
    proker: Proker;
    onMediaClick?: (media: ProkerMedia) => void;
}

const ProkerDetailContent: React.FC<ProkerDetailContentProps> = ({ proker, onMediaClick }) => {
    const statusColors = {
        planned: 'bg-amber-100 text-amber-700 border-amber-200',
        ongoing: 'bg-blue-100 text-blue-700 border-blue-200',
        done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };

    const statusIcons = {
        planned: Clock,
        ongoing: PlayCircle,
        done: CheckCircle2,
    };

    const StatusIcon = statusIcons[proker.status] || Info;

    // Helper to format date range
    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const displayDate = () => {
        if (!proker.date) return '-';
        
        if (proker.end_date && proker.end_date !== proker.date) {
            const start = new Date(proker.date);
            const end = new Date(proker.end_date);
            
            // If same month and year
            if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
                return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
            }
            
            return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${formatFullDate(proker.end_date)}`;
        }
        
        return formatFullDate(proker.date);
    };

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header / Title Section */}
            <div className="space-y-3 md:space-y-4">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border ${statusColors[proker.status]}`}>
                        <StatusIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        {proker.status === 'planned' ? 'Direncanakan' : proker.status === 'ongoing' ? 'Berlangsung' : 'Selesai'}
                    </span>
                    {proker.divisions?.map(div => (
                        <span key={div.id} className="px-3 md:px-4 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider border border-gray-200">
                            {div.name}
                        </span>
                    ))}
                </div>
                <h1 className="text-2xl md:text-5xl font-black text-[#3B4D3A] leading-tight">
                    {proker.title}
                </h1>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#3B4D3A]/5 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#3B4D3A]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">Waktu</p>
                        <p className="text-[11px] md:text-sm font-bold text-[#3B4D3A] leading-tight">
                            {displayDate()}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#3B4D3A]/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#3B4D3A]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">Lokasi</p>
                        <p className="text-[11px] md:text-sm font-bold text-[#3B4D3A] leading-tight break-words">
                            {proker.location || 'SMKN 6 Surakarta'}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#3B4D3A]/5 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-[#3B4D3A]" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 tracking-widest mb-0.5">Panitia</p>
                        <p className="text-[11px] md:text-sm font-bold text-[#3B4D3A] leading-tight">
                            {proker.anggota?.length || 0} Anggota
                        </p>
                    </div>
                </div>
            </div>

            {/* Description Content */}
            <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-[#3B4D3A] flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Detail Kegiatan
                </h3>
                <div className="text-gray-600 leading-relaxed text-sm md:text-lg whitespace-pre-wrap bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                    {proker.description || 'Tidak ada deskripsi tersedia untuk program kerja ini.'}
                </div>
            </div>

            {/* Gallery Section */}
            {proker.media && proker.media.length > 0 && (
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg md:text-xl font-bold text-[#3B4D3A] flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Dokumentasi
                        </h3>
                        <span className="text-[10px] md:text-sm font-medium text-gray-400 uppercase tracking-widest">{proker.media.length} Media</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {proker.media.map((item) => (
                            <div 
                                key={item.id} 
                                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 bg-gray-100"
                                onClick={() => onMediaClick?.(item)}
                            >
                                <OptimizedImage 
                                    src={item.media_url} 
                                    alt={item.caption || proker.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    wrapperClassName="w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProkerDetailContent;
