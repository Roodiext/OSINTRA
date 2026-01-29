import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { router } from '@inertiajs/react'
import { Head, Link } from '@inertiajs/react';
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

    // Prevent body scroll and enable horizontal scroll
    useEffect(() => {
        document.body.style.overflow = "hidden"

        const handleWheel = (e: WheelEvent) => {
            if (containerRef.current) {
                // Only scroll horizontally if we aren't at the edges or if the delta is primarily vertical
                // This simple implementation maps vertical scroll to horizontal
                e.preventDefault()
                containerRef.current.scrollLeft += e.deltaY
            }
        }

        const container = containerRef.current
        if (container) {
            container.addEventListener("wheel", handleWheel, { passive: false })
        }

        return () => {
            document.body.style.overflow = "unset"
            if (container) {
                container.removeEventListener("wheel", handleWheel)
            }
        }
    }, [])

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
                className="fixed inset-0 z-[9999] bg-gradient-to-br from-gray-800 via-slate-800 to-gray-900 overflow-x-auto overflow-y-hidden hide-scrollbar"
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
                    className="fixed top-6 right-6 z-50 w-12 h-12 bg-red-900/30 hover:bg-red-800/40 backdrop-blur-sm border border-red-700/30 text-red-200 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                    onClick={handleBack}
                >
                    <X className="w-5 h-5" />
                </motion.button>

                {/* Back Button */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-6 left-6 z-50">
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        className="bg-slate-800/40 backdrop-blur-sm border-slate-600/30 text-slate-200 hover:bg-slate-700/50 hover:text-white rounded-full px-6 shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </motion.div>

                {/* Horizontal Container */}
                <div className="font-google-sans flex h-full min-w-[200vw]">
                    {/* Section 1: Main Content (Photo + Description) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-screen h-full flex items-center justify-center p-12 flex-shrink-0"
                    >
                        <div className="flex items-center gap-16 max-w-7xl w-full">
                            {/* Featured Image */}
                            <div className="flex-shrink-0">
                                <div className="relative group cursor-pointer" onClick={() => handleFullscreen(currentImage)}>
                                    {/* Museum spotlight effect */}
                                    <div className="absolute -inset-8 bg-gradient-radial from-amber-200/20 via-amber-100/10 to-transparent rounded-full blur-xl" />
                                    <div className="absolute -inset-4 bg-gradient-radial from-white/10 via-white/5 to-transparent rounded-xl" />

                                    <div className="relative bg-slate-800/20 p-4 rounded-lg backdrop-blur-sm border border-slate-700/30 shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-500">
                                        <div className="relative w-[500px] h-[375px] rounded-lg overflow-hidden">
                                            <img
                                                src={currentImage.media_url || "/placeholder.svg"}
                                                alt={currentImage.caption || 'Gallery Image'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                                            {/* Expand icon */}
                                            <div className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        {/* Image info */}
                                        <div className="mt-4 text-center">
                                            <span className="inline-block px-3 py-1 bg-amber-500/40 text-white rounded-full text-xs font-bold mb-2 border border-amber-400/50">
                                                {currentImage.proker?.title || 'Kegiatan OSIS'}
                                            </span>
                                            <h2 className="text-xl font-bold text-white mb-1 drop-shadow-md">{currentImage.caption || 'Dokumentasi Kegiatan'}</h2>
                                            {/* <p className="text-white text-sm font-semibold drop-shadow-sm">Subtitle if needed</p> */}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex-1 text-white">
                                <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">{currentImage.proker?.title || 'Kegiatan OSIS'}</h1>
                                <h2 className="text-2xl text-white font-medium mb-6 drop-shadow-md">{currentImage.caption || 'Dokumentasi'}</h2>

                                <p className="text-white leading-relaxed mb-8 text-lg font-medium drop-shadow-sm">
                                    {currentImage.proker?.description || 'Tidak ada deskripsi untuk kegiatan ini.'}
                                </p>

                                <div className="space-y-3 text-white mb-8">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-white w-24">Lokasi:</span>
                                        <span className="text-white">{currentImage.proker?.location || '-'}</span>
                                    </div>
                                    {/* Photographer field if available in DB, else omit or mock */}
                                    {/* <div className="flex items-center gap-3">
                  <span className="font-bold text-white w-24">Fotografer:</span>
                  <span className="text-white">Team Gema Aksi</span>
                </div> */}
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-white w-24">Tanggal:</span>
                                        <span className="text-white">{currentImage.proker?.date || '-'}</span>
                                    </div>
                                </div>

                                {/* Scroll hint */}
                                <div className="flex items-center gap-3 text-white">
                                    <span className="text-sm font-semibold">Scroll ke kanan untuk melihat galeri lainnya</span>
                                    <motion.div
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                                        className="w-6 h-0.5 bg-amber-400 rounded-full"
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
                            {/* Note: This layout is very specific to 6 items. If dynamic, we might need a more flexible grid.
                The requesting user asked for THIS specific layout. So I will try to map the first 6 "other" items to these positions.
             */}

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
                                        <div className="absolute -inset-4 bg-gradient-radial from-amber-200/10 via-amber-100/5 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-full bg-white p-3 shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500 group-hover:scale-105">
                                            <div className="absolute inset-3 shadow-inner shadow-black/20"></div>
                                            <div className="h-full overflow-hidden">
                                                <img
                                                    src={otherImages[0].media_url || "/placeholder.svg"}
                                                    alt={otherImages[0].caption || 'Gallery'}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs font-medium mb-2">
                                                    {otherImages[0].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{otherImages[0].caption}</h3>
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-4 h-4 text-white" />
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
                                        <div className="absolute -inset-4 bg-gradient-radial from-amber-200/10 via-amber-100/5 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-full bg-white p-3 shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500 group-hover:scale-105">
                                            <div className="absolute inset-3 shadow-inner shadow-black/20"></div>
                                            <div className="h-full overflow-hidden">
                                                <img
                                                    src={otherImages[1].media_url || "/placeholder.svg"}
                                                    alt={otherImages[1].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs font-medium mb-2">
                                                    {otherImages[1].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{otherImages[1].caption}</h3>
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-4 h-4 text-white" />
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
                                        <div className="absolute -inset-1 bg-gradient-radial from-amber-200/10 via-amber-100/5 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-full bg-white p-3 shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500 group-hover:scale-105">
                                            <div className="absolute inset-3 shadow-inner shadow-black/20"></div>
                                            <div className="h-full overflow-hidden">
                                                <img
                                                    src={otherImages[2].media_url || "/placeholder.svg"}
                                                    alt={otherImages[2].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-3 left-2 right-3 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs font-medium mb-2">
                                                    {otherImages[2].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{otherImages[2].caption}</h3>
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-4 h-4 text-white" />
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
                                        <div className="absolute -inset-4 bg-gradient-radial from-amber-200/10 via-amber-100/5 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-full bg-white p-3 shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500 group-hover:scale-105">
                                            <div className="absolute inset-3 shadow-inner shadow-black/20"></div>
                                            <div className="h-full overflow-hidden">
                                                <img
                                                    src={otherImages[3].media_url || "/placeholder.svg"}
                                                    alt={otherImages[3].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs font-medium mb-2">
                                                    {otherImages[3].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{otherImages[3].caption}</h3>
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-4 h-4 text-white" />
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
                                        <div className="absolute -inset-4 bg-gradient-radial from-amber-200/10 via-amber-100/5 to-transparent blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-full bg-white p-3 shadow-2xl group-hover:shadow-amber-500/30 transition-all duration-500 group-hover:scale-105">
                                            <div className="absolute inset-3 shadow-inner shadow-black/20"></div>
                                            <div className="h-full overflow-hidden">
                                                <img
                                                    src={otherImages[4].media_url || "/placeholder.svg"}
                                                    alt={otherImages[4].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-3 left-3 right-3 p-3 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-200 rounded-full text-xs font-medium mb-2">
                                                    {otherImages[4].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{otherImages[4].caption}</h3>
                                            </div>
                                            <div className="absolute top-6 right-6 w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-4 h-4 text-white" />
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
                                        <div className="absolute -inset-4 bg-gradient-radial from-amber-200/15 via-amber-100/8 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="relative h-full bg-white p-4 shadow-2xl group-hover:shadow-amber-500/40 transition-all duration-500 group-hover:scale-105">
                                            <div className="absolute inset-4 shadow-inner shadow-black/20"></div>
                                            <div className="h-full overflow-hidden">
                                                <img
                                                    src={otherImages[5].media_url || "/placeholder.svg"}
                                                    alt={otherImages[5].caption}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                            </div>
                                            <div className="absolute bottom-4 left-4 right-4 p-4 bg-gradient-to-t from-black/90 to-transparent">
                                                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-200 rounded-full text-sm font-medium mb-3">
                                                    {otherImages[5].proker?.title || 'Kegiatan'}
                                                </span>
                                                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{otherImages[5].caption}</h3>
                                            </div>
                                            <div className="absolute top-7 right-7 w-10 h-10 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <Expand className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* If there are more images, we should probably output them in a more standard grid further to the right, or just stop here?
                The user's code just had these fixed positions.
                Let's add a "More" section if needed or just let them overflow?
                Ideally we'd map the rest in a loop.
             */}
                            {otherImages.length > 6 && (
                                <div className="absolute top-0 left-[800px] h-full flex flex-wrap content-start gap-4 w-[1000px]">
                                    {otherImages.slice(6).map((img, idx) => (
                                        <motion.div
                                            key={img.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 1.5 + (idx * 0.1) }}
                                            className="bg-white p-2 w-64 h-64 shadow-xl cursor-pointer hover:scale-105 transition-transform"
                                            onClick={() => handleImageClick(img.id)}
                                        >
                                            <img src={img.media_url} className="w-full h-full object-cover" />
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
                            className="fixed inset-0 bg-black/95 z-[10000] flex items-center justify-center"
                        >
                            <button
                                onClick={closeFullscreen}
                                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors duration-200 z-10"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="relative max-w-[90vw] max-h-[90vh]"
                            >
                                <img
                                    src={fullscreenImage.media_url || "/placeholder.svg"}
                                    alt={fullscreenImage.caption}
                                    className="w-full h-full object-contain rounded-lg shadow-2xl"
                                />

                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 rounded-b-lg">
                                    <h3 className="text-2xl font-bold text-white mb-2">{fullscreenImage.proker?.title || 'Kegiatan'}</h3>
                                    <p className="text-slate-300">{fullscreenImage.caption}</p>
                                    <p className="text-sm text-slate-400 mt-2">
                                        {fullscreenImage.proker?.location || 'Lokasi'} • {fullscreenImage.proker?.date || 'Tanggal'}
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
