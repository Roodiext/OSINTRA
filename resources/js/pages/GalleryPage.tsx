import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { router } from '@inertiajs/react'
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import type { ProkerMedia } from "@/types"

interface GalleryPageProps {
    media: ProkerMedia[]
    initialId?: number
}

export default function GalleryPage({ media, initialId }: GalleryPageProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [fullscreenImage, setFullscreenImage] = useState<ProkerMedia | null>(null)

    // Sort media: if initialId is present, put that item first
    // Otherwise, if any media is marked 'is_thumbnail', put that first (simulating 'is_starred')
    // Otherwise just use the order provided
    const sortedMedia = [...media].sort((a, b) => {
        if (initialId) {
            if (a.id === initialId) return -1;
            if (b.id === initialId) return 1;
        }
        // Secondary sort: thumbnails first if no initialId match (or after the match)
        if (a.is_thumbnail && !b.is_thumbnail) return -1;
        if (!a.is_thumbnail && b.is_thumbnail) return 1;
        return 0;
    });

    const currentImage = sortedMedia[0];
    const otherImages = sortedMedia.slice(1);

    // Prevent body scroll and enable horizontal scroll - DESKTOP ONLY
    useEffect(() => {
        // Only trigger this special horizontal scroll behavior if we are in "Detail Mode"
        // i.e., an initialId was provided and we are showing the slider view.
        if (!initialId) return;

        // Check if we're on desktop (md breakpoint = 768px)
        const isDesktop = () => window.innerWidth >= 768;

        const applyDesktopBehavior = () => {
            if (isDesktop()) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "unset";
            }
        };

        applyDesktopBehavior();

        const handleWheel = (e: WheelEvent) => {
            // Only apply horizontal scroll on desktop
            if (!isDesktop()) return;

            if (containerRef.current) {
                // Only scroll horizontally if we aren't at the edges or if the delta is primarily vertical
                // This simple implementation maps vertical scroll to horizontal
                e.preventDefault()
                containerRef.current.scrollLeft += e.deltaY
            }
        }

        const handleResize = () => {
            applyDesktopBehavior();
        };

        const container = containerRef.current
        if (container) {
            container.addEventListener("wheel", handleWheel, { passive: false })
        }
        window.addEventListener("resize", handleResize);

        return () => {
            document.body.style.overflow = "unset"
            if (container) {
                container.removeEventListener("wheel", handleWheel)
            }
            window.removeEventListener("resize", handleResize);
        }
    }, [initialId])

    // Handle ESC key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isFullscreen) {
                    closeFullscreen()
                } else {
                    router.visit('/')
                }
            }
        }

        document.addEventListener("keydown", handleEscape)

        return () => {
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isFullscreen])

    // Instead of pushing to a new route for every click, we might want to just update the view?
    // But the user asked for typical "gallery detail" behavior.
    // The provided code used `router.push('/galeri/id')`.
    // We can replicate this by visiting the same route with a new ID, which will trigger a re-render/re-sort.
    // Updated: User wants click to ONLY maximize/fullscreen, NOT navigate
    const handleImageClick = (newImageId: number) => {
        const selected = media.find(m => m.id === newImageId);
        if (selected) {
            handleFullscreen(selected);
        }
    }

    const handleFullscreen = (image: ProkerMedia) => {
        setFullscreenImage(image)
        setIsFullscreen(true)
    }

    const closeFullscreen = () => {
        setIsFullscreen(false)
        setTimeout(() => setFullscreenImage(null), 300)
    }

    const handleBack = () => {
        router.visit('/')
    }

    const formatDateRange = (dateStr: string, endDateStr?: string) => {
        if (!dateStr) return '-';

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const locale = 'id-ID';

        const startDate = new Date(dateStr);
        const startFormatted = startDate.toLocaleDateString(locale, options);

        if (!endDateStr) {
            return startFormatted;
        }

        const endDate = new Date(endDateStr);
        const endFormatted = endDate.toLocaleDateString(locale, options);

        if (startFormatted === endFormatted) {
            return startFormatted;
        }

        return `${startFormatted} - ${endFormatted}`;
    };

    // If no initialId is provided, we should probably render a GRID VIEW of all media
    // instead of defaulting to the first item as a 'detail' view.
    // The user wants a gallery index page.
    if (!initialId) {
        return (
            <>
                <Head title="Galeri Kegiatan" />
                <PublicLayout>
                    <div className="bg-gray-50 pt-32 pb-12 min-h-[60vh]">
                        <div className="max-w-7xl mx-auto px-6">
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-bold text-[#3B4D3A] mb-4">Galeri Kegiatan</h1>
                                <p className="text-lg text-slate-600">Dokumentasi momen-momen berharga kegiatan kami</p>
                            </div>
                            <div>
                                {/* Masonry or Grid Layout */}
                                <div className="columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
                                    {sortedMedia.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="break-inside-avoid relative group cursor-pointer overflow-hidden rounded-xl bg-slate-100 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300"
                                            onClick={() => handleFullscreen(item)}
                                        >
                                            <img
                                                src={item.thumbnail_url || item.media_url}
                                                alt={item.caption || ''}
                                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                                                loading="lazy"
                                            />

                                            {/* Overlay on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                <div>
                                                    <span className="inline-block px-2 py-0.5 bg-amber-500/80 text-white text-[10px] font-bold rounded mb-1">
                                                        {item.proker?.title || 'Kegiatan'}
                                                    </span>
                                                    {item.caption && (
                                                        <p className="text-white text-xs line-clamp-2 font-medium">
                                                            {item.caption}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-3 h-3 text-white" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {sortedMedia.length === 0 && (
                                    <div className="text-center py-20 text-slate-500">
                                        <p>Belum ada dokumentasi yang tersedia.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </PublicLayout>

                {/* Re-use the existing Fullscreen Modal logic, but ensure it works here too */}
                <AnimatePresence>
                    {isFullscreen && fullscreenImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-white/95 z-[10000] flex items-center justify-center backdrop-blur-md"
                        >
                            <button
                                onClick={closeFullscreen}
                                className="absolute top-6 right-6 w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-800 transition-colors duration-200 z-10 shadow-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                            >
                                <div className="relative rounded-lg shadow-2xl overflow-hidden bg-white p-2 border border-slate-200">
                                    <img
                                        src={fullscreenImage.media_url || "/placeholder.svg"}
                                        alt={fullscreenImage.caption}
                                        className="max-w-full max-h-[80vh] object-contain rounded"
                                    />
                                </div>

                                <div className="mt-6 text-center max-w-2xl">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{fullscreenImage.proker?.title || 'Kegiatan'}</h3>
                                    <p className="text-slate-600 font-medium">{fullscreenImage.caption}</p>
                                    <p className="text-sm text-slate-500 mt-2">
                                        {fullscreenImage.proker?.location || 'Lokasi'} • {formatDateRange(fullscreenImage.proker?.date || '', fullscreenImage.proker?.end_date)}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )
    }

    if (!currentImage) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gray-900 text-white">
                <Head title="Galeri Kosong" />
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Belum ada galeri</h1>
                    <Button onClick={handleBack} variant="outline">Kembali ke Beranda</Button>
                </div>
            </div>
        )
    }

    return (
        <>
            <Head title={`Galeri - ${currentImage.proker?.title || 'Detail'}`} />
            <div
                ref={containerRef}
                className="fixed inset-0 z-[9999] bg-[#0f0f0f] text-slate-300 overflow-y-auto md:overflow-x-auto md:overflow-y-hidden hide-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* Hide scrollbar */}
                <style>{`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .bg-gradient-radial {
                        background: radial-gradient(circle, var(--tw-gradient-stops));
                    }
                    .line-clamp-1 {
                        display: -webkit-box;
                        -webkit-line-clamp: 1;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .line-clamp-2 {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                `}</style>

                {/* Close Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="fixed top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 md:w-12 md:h-12 bg-black/40 hover:bg-red-900/40 border border-white/10 text-white/70 hover:text-red-400 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md"
                    onClick={handleBack}
                >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                </motion.button>

                {/* Back Button */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        className="bg-black/40 border-white/10 text-white/80 hover:bg-white/10 hover:text-white rounded-full px-4 md:px-6 text-sm md:text-base backdrop-blur-md"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Back</span>
                    </Button>
                </motion.div>

                {/* MOBILE LAYOUT: Vertical Scroll */}
                <div className="block md:hidden pt-20 pb-8 px-4">
                    {/* Featured Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <div className="relative group cursor-pointer" onClick={() => handleFullscreen(currentImage)}>
                            <div className="relative bg-white p-3 rounded-xl shadow-2xl transition-transform duration-300">
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                                    <img
                                        src={currentImage.media_url || "/placeholder.svg"}
                                        alt={currentImage.caption || 'Gallery Image'}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Expand icon */}
                                    <div className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                                        <Expand className="w-4 h-4 text-slate-700" />
                                    </div>
                                </div>

                                {/* Image info */}
                                <div className="mt-3 text-center">
                                    <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-2 border border-amber-200">
                                        {currentImage.proker?.title || 'Kegiatan OSIS'}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 font-serif tracking-wide">{currentImage.caption || 'Dokumentasi Kegiatan'}</h2>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-6 text-slate-300"
                    >
                        <h1 className="text-2xl font-bold mb-2 text-white font-serif">{currentImage.proker?.title || 'Kegiatan OSIS'}</h1>
                        <h2 className="text-lg text-slate-400 font-medium mb-4 italic">{currentImage.caption || 'Dokumentasi'}</h2>

                        <p className="text-slate-400 leading-relaxed mb-4 text-sm font-light tracking-wide">
                            {currentImage.proker?.description || 'Tidak ada deskripsi untuk kegiatan ini.'}
                        </p>

                        <div className="space-y-2 text-slate-400 mb-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-300 w-20">Lokasi:</span>
                                <span className="text-slate-400">{currentImage.proker?.location || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-300 w-20">Tanggal:</span>
                                <span className="text-slate-400">
                                    {formatDateRange(currentImage.proker?.date || '', currentImage.proker?.end_date)}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Other Images Grid - Mobile */}
                    {otherImages.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h3 className="text-lg font-bold text-white mb-4 font-serif">Galeri Lainnya</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {otherImages.map((img, idx) => (
                                    <motion.div
                                        key={img.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + (idx * 0.05) }}
                                        className="bg-white p-2 shadow-md rounded-xl cursor-pointer active:scale-95 transition-transform"
                                        onClick={() => handleImageClick(img.id)}
                                    >
                                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100">
                                            <img src={img.media_url} alt={img.caption || ''} className="w-full h-full object-cover" />
                                        </div>
                                        {img.caption && (
                                            <p className="mt-2 text-xs text-slate-600 line-clamp-1">{img.caption}</p>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* DESKTOP LAYOUT: Horizontal Scroll */}
                <div className="hidden md:flex font-google-sans h-full min-w-[200vw]">
                    {/* Section 1: Main Content (Photo + Description) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-screen h-full flex items-center justify-center p-12 flex-shrink-0"
                    >
                        <div className="flex items-center gap-16 max-w-7xl w-full">
                            <div className="flex-shrink-0">
                                <div className="relative group cursor-pointer" onClick={() => handleFullscreen(currentImage)}>
                                    <div className="relative bg-white p-4 rounded-xl shadow-2xl transition-all duration-500 transform hover:rotate-1">
                                        <div className="relative w-[500px] h-[375px] rounded-lg overflow-hidden bg-slate-100">
                                            <img
                                                src={currentImage.media_url || "/placeholder.svg"}
                                                alt={currentImage.caption || 'Gallery Image'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            {/* Expand icon */}
                                            <div className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                                                <Expand className="w-4 h-4 text-slate-700" />
                                            </div>
                                        </div>

                                        {/* Image info */}
                                        <div className="mt-4 text-center">
                                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-2 border border-amber-200">
                                                {currentImage.proker?.title || 'Kegiatan OSIS'}
                                            </span>
                                            <h2 className="text-xl font-bold text-slate-900 mb-1 font-serif tracking-wide">{currentImage.caption || 'Dokumentasi Kegiatan'}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex-1 text-slate-300">
                                <h1 className="text-5xl font-bold mb-4 text-white font-serif">{currentImage.proker?.title || 'Kegiatan OSIS'}</h1>
                                <h2 className="text-2xl text-slate-400 font-medium mb-6 italic">{currentImage.caption || 'Dokumentasi'}</h2>

                                <p className="text-slate-400 leading-relaxed mb-8 text-lg font-light tracking-wide">
                                    {currentImage.proker?.description || 'Tidak ada deskripsi untuk kegiatan ini.'}
                                </p>

                                <div className="space-y-3 text-slate-400 mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-300 w-24">Lokasi:</span>
                                        <span className="text-slate-400">{currentImage.proker?.location || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-300 w-24">Tanggal:</span>
                                        <span className="text-slate-400">
                                            {formatDateRange(currentImage.proker?.date || '', currentImage.proker?.end_date)}
                                        </span>
                                    </div>
                                </div>

                                {/* Scroll hint */}
                                <div className="flex items-center gap-3 text-slate-500">
                                    <span className="text-sm font-semibold">Scroll ke kanan untuk melihat galeri lainnya</span>
                                    <motion.div
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                        className="w-6 h-0.5 bg-amber-500/50 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Section 2: Gallery Grid - Optimized Space Usage */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="w-screen h-full flex-shrink-0 p-8 overflow-hidden"
                    >
                        {/* Gallery Header */}

                        {/* Optimized Grid Layout */}
                        <div className="relative w-full h-[calc(100vh-180px)] max-w-7xl">
                            {/* Manually creating the grid items based on index */}

                            {/* Photo 1 - Top Left (Vertical Rectangle) */}
                            {otherImages[0] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                    className="absolute top-0 left-0 w-80 h-95 group cursor-pointer"
                                    onClick={() => handleImageClick(otherImages[0].id)}
                                >
                                    <div className="relative h-full">
                                        <div className="relative h-full bg-white p-3 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 rounded-xl">
                                            <div className="h-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={otherImages[0].media_url || "/placeholder.svg"}
                                                    alt={otherImages[0].caption || 'Gallery'}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-1 border border-amber-200">
                                                    {otherImages[0].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-slate-800 font-semibold text-sm line-clamp-2 font-serif">{otherImages[0].caption}</h3>
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                                                <Expand className="w-4 h-4 text-slate-700" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Photo 2 - Top Center (Horizontal Rectangle) */}
                            {otherImages[1] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.9 }}
                                    className="absolute top-0 left-90 w-116 h-56 group cursor-pointer"
                                    onClick={() => handleImageClick(otherImages[1].id)}
                                >
                                    <div className="relative h-full">
                                        <div className="relative h-full bg-white p-3 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 rounded-xl">
                                            <div className="h-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={otherImages[1].media_url || "/placeholder.svg"}
                                                    alt={otherImages[1].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-1 border border-amber-200">
                                                    {otherImages[1].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-slate-800 font-semibold text-sm line-clamp-1 font-serif">{otherImages[1].caption}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Photo 3 - Top Right (Square) */}
                            {otherImages[2] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 1.0 }}
                                    className="absolute top-0 left-220 w-140 h-160 group cursor-pointer"
                                    onClick={() => handleImageClick(otherImages[2].id)}
                                >
                                    <div className="relative h-full">
                                        <div className="relative h-full bg-white p-3 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 rounded-xl">
                                            <div className="h-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={otherImages[2].media_url || "/placeholder.svg"}
                                                    alt={otherImages[2].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-1 border border-amber-200">
                                                    {otherImages[2].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-slate-800 font-semibold text-sm line-clamp-2 font-serif">{otherImages[2].caption}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Photo 4 - Middle Left (Horizontal Rectangle) */}
                            {otherImages[3] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 1.1 }}
                                    className="absolute top-105 left-0 w-96 h-55 group cursor-pointer"
                                    onClick={() => handleImageClick(otherImages[3].id)}
                                >
                                    <div className="relative h-full">
                                        <div className="relative h-full bg-white p-3 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 rounded-xl">
                                            <div className="h-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={otherImages[3].media_url || "/placeholder.svg"}
                                                    alt={otherImages[3].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-1 border border-amber-200">
                                                    {otherImages[3].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-slate-800 font-semibold text-sm line-clamp-1 font-serif">{otherImages[3].caption}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Photo 5 - Middle Right (Vertical Rectangle) */}
                            {otherImages[4] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 1.2 }}
                                    className="absolute top-65 right-115 w-98 h-95 group cursor-pointer"
                                    onClick={() => handleImageClick(otherImages[4].id)}
                                >
                                    <div className="relative h-full">
                                        <div className="relative h-full bg-white p-3 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 rounded-xl">
                                            <div className="h-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={otherImages[4].media_url || "/placeholder.svg"}
                                                    alt={otherImages[4].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-1 border border-amber-200">
                                                    {otherImages[4].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-slate-800 font-semibold text-sm line-clamp-2 font-serif">{otherImages[4].caption}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Photo 6 - Bottom Large (Hero Size) */}
                            {otherImages[5] && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 1.3 }}
                                    className="absolute top-115 left-26 w-96 h-48 group cursor-pointer"
                                    onClick={() => handleImageClick(otherImages[5].id)}
                                >
                                    <div className="relative h-full">
                                        <div className="relative h-full bg-white p-3 shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 rounded-xl">
                                            <div className="h-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={otherImages[5].media_url || "/placeholder.svg"}
                                                    alt={otherImages[5].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm">
                                                <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium mb-1 border border-amber-200">
                                                    {otherImages[5].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-slate-800 font-semibold text-sm line-clamp-1 font-serif">{otherImages[5].caption}</h3>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {otherImages.length > 6 && (
                                <div className="absolute top-0 left-[800px] h-full flex flex-wrap content-start gap-4 w-[1000px]">
                                    {otherImages.slice(6).map((img, idx) => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.5 + (idx * 0.1) }}
                                            className="bg-white p-2 w-64 h-64 shadow-xl rounded-xl cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => handleImageClick(img.id)}
                                        >
                                            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-100">
                                                <img src={img.media_url} className="w-full h-full object-cover" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                        </div>
                    </motion.div>
                </div>

                {/* Fullscreen Modal */}
                <AnimatePresence>
                    {isFullscreen && fullscreenImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center backdrop-blur-md p-4"
                        >
                            <button
                                onClick={closeFullscreen}
                                className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors duration-200 z-10 shadow-lg border border-white/10"
                            >
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative max-w-[95vw] md:max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                            >
                                <div className="relative rounded-lg shadow-2xl overflow-hidden bg-[#1a1a1a] p-1 md:p-2 border border-white/10">
                                    <img
                                        src={fullscreenImage.media_url || "/placeholder.svg"}
                                        alt={fullscreenImage.caption}
                                        className="max-w-full max-h-[70vh] md:max-h-[80vh] object-contain rounded"
                                    />
                                </div>

                                <div className="mt-4 md:mt-6 text-center max-w-2xl px-4">
                                    <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 font-serif tracking-wide center">{fullscreenImage.proker?.title || 'Kegiatan'}</h3>
                                    <p className="text-slate-300 font-medium text-sm md:text-base italic">{fullscreenImage.caption}</p>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1 md:mt-2">
                                        {fullscreenImage.proker?.location || 'Lokasi'} • {formatDateRange(fullscreenImage.proker?.date || '', fullscreenImage.proker?.end_date)}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    )
}
