import React, { useState, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
    Settings as SettingsIcon,
    Globe,
    Database,
    Bell,
    Save,
    Calendar,
    Image as ImageIcon,
    Upload,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    FileText,
    Users
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '@/lib/axios';
import { usePermissionAlert } from '@/hooks/usePermissionAlert';

interface SettingsPageProps {
    auth: {
        user: any;
    };
    permission_denied?: string | null;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ auth }) => {
    const { props } = usePage<any>();
    usePermissionAlert(props.flash?.permission_message);

    // Application Configuration State
    const [siteName, setSiteName] = useState('OSIS SMAN 1 Indonesia');
    const [academicPeriod, setAcademicPeriod] = useState('2024/2025');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [publicAccess, setPublicAccess] = useState(true);
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    // Ketos State
    const [ketosName, setKetosName] = useState('');
    const [ketosPeriode, setKetosPeriode] = useState('');
    const [ketosSambutan, setKetosSambutan] = useState('');
    const [ketosImagePreview, setKetosImagePreview] = useState<string | null>(null);
    const [ketosImageFile, setKetosImageFile] = useState<File | null>(null);
    const ketosFileInputRef = useRef<HTMLInputElement>(null);

    // Hero Image State
    const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
    const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
    const heroFileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);

    // Fetch settings on mount
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                const settings = response.data;
                if (settings) {
                    if (settings.site_name) setSiteName(settings.site_name);
                    if (settings.academic_period) setAcademicPeriod(settings.academic_period);
                    if (settings.maintenance_mode) setMaintenanceMode(settings.maintenance_mode === '1' || settings.maintenance_mode === true);
                    if (settings.osis_vision) setVision(settings.osis_vision);
                    if (settings.osis_mission) setMission(settings.osis_mission);
                    if (settings.site_logo) setLogoPreview(settings.site_logo);
                    if (settings.ketos_name) setKetosName(settings.ketos_name);
                    if (settings.ketos_periode) setKetosPeriode(settings.ketos_periode);
                    if (settings.ketos_sambutan) setKetosSambutan(settings.ketos_sambutan);
                    if (settings.ketos_image) setKetosImagePreview(settings.ketos_image);
                    if (settings.hero_image) setHeroImagePreview(settings.hero_image);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // Logo State
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock Backup Download
    const handleBackup = () => {
        Swal.fire({
            title: 'Backup Database',
            text: 'Sistem akan mengunduh database terbaru (format .json).',
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3B4D3A',
            cancelButtonColor: '#9CA3AF',
            confirmButtonText: 'Ya, Download',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // Determine filename
                const date = new Date().toISOString().split('T')[0];
                const filename = `backup_osintra_${date}.json`;

                // Create mock data blob
                const backupData = {
                    siteName,
                    academicPeriod,
                    maintenanceMode,
                    exportedAt: new Date().toISOString(),
                    version: "1.0.0"
                };

                const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                Swal.fire({
                    title: 'Backup Selesai!',
                    text: `File ${filename} berhasil diunduh.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        });
    };



    // Handle File Selection
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran file maksimal 2MB', 'error');
                return;
            }
            setLogoFile(file);
            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setLogoPreview(objectUrl);
        }
    };

    // Handle Ketos Image Selection
    const handleKetosFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran file maksimal 5MB', 'error');
                return;
            }
            setKetosImageFile(file);
            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setKetosImagePreview(objectUrl);
        }
    };

    // Handle Hero Image Selection
    const handleHeroFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran file maksimal 5MB', 'error');
                return;
            }
            // Check format
            const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                Swal.fire('Error', 'Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.', 'error');
                return;
            }

            setHeroImageFile(file);
            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setHeroImagePreview(objectUrl);
        }
    };

    // Save Logic
    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Upload Logo if exists
            if (logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);
                await api.post('/settings/logo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // 1b. Upload Ketos Image if exists
            if (ketosImageFile) {
                const formData = new FormData();
                formData.append('image', ketosImageFile);
                await api.post('/settings/ketos-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // 1c. Upload Hero Image if exists
            if (heroImageFile) {
                const formData = new FormData();
                formData.append('image', heroImageFile);
                await api.post('/settings/hero-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // 2. Save other settings
            await api.put('/settings', {
                settings: [
                    { key: 'site_name', value: siteName },
                    { key: 'academic_period', value: academicPeriod },
                    // Maintenance mode is handled separately now, but we still include it to be safe or we can omit it if we want to rely solely on the toggle. 
                    // However, keeping it ensures consistency if the user modifies other things and saves.
                    { key: 'maintenance_mode', value: maintenanceMode ? '1' : '0' },
                    { key: 'osis_vision', value: vision },
                    { key: 'osis_mission', value: mission },
                    { key: 'ketos_name', value: ketosName },
                    { key: 'ketos_periode', value: ketosPeriode },
                    { key: 'ketos_sambutan', value: ketosSambutan },
                ]
            });

            Swal.fire({
                title: 'Berhasil Disimpan!',
                text: 'Konfigurasi sistem telah diperbarui.',
                icon: 'success',
                confirmButtonColor: '#3B4D3A'
            }).then(() => {
                window.location.reload();
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
            Swal.fire('Error', 'Gagal menyimpan pengaturan.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Instant Toggle for Maintenance Mode
    const handleToggleMaintenance = async () => {
        const newValue = !maintenanceMode;
        setMaintenanceMode(newValue); // Optimistic Update

        try {
            await api.put('/settings', {
                settings: [
                    { key: 'maintenance_mode', value: newValue ? '1' : '0' }
                ]
            });

            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });

            Toast.fire({
                icon: 'success',
                title: `Maintenance Mode ${newValue ? 'Aktif' : 'Non-Aktif'}`
            });

        } catch (error) {
            console.error('Failed to update maintenance mode:', error);
            setMaintenanceMode(!newValue); // Revert
            Swal.fire('Error', 'Gagal mengubah status maintenance.', 'error');
        }
    };

    return (
        <DashboardLayout>
            <Head title="Pengaturan - OSINTRA" />

            <div className="max-w-7xl mx-auto space-y-6 lg:pl-8">
                {/* Page Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-[#3B4D3A] flex items-center gap-3">
                            <SettingsIcon className="w-8 h-8" />
                            Pengaturan Sistem
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Kelola konfigurasi dasar dan tampilan website
                        </p>                    </div>

                    {/* Save button removed from header as per request */}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* LEFT COLUMN (Main Content) - Spans 2 cols */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* CARD: General Settings */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#3B4D3A]">Identitas Organisasi</h2>
                                    <p className="text-sm text-gray-400">Informasi utama website</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Nama Organisasi</label>
                                    <input
                                        type="text"
                                        value={siteName}
                                        onChange={(e) => setSiteName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Contoh: OSIS SMAN 1 Kota..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Periode Akademik</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-hover:text-[#3B4D3A] transition-colors" />
                                            <select
                                                value={academicPeriod}
                                                onChange={(e) => setAcademicPeriod(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                            >
                                                <option>2023/2024</option>
                                                <option>2024/2025</option>
                                                <option>2025/2026</option>
                                                <option>2026/2027</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Status Website</label>
                                        <div
                                            className={`flex items-center justify-between p-3 border rounded-xl transition-all cursor-pointer ${publicAccess
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-gray-50 border-gray-200'
                                                }`}
                                            onClick={() => setPublicAccess(!publicAccess)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${publicAccess ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                                <span className={`text-sm font-medium ${publicAccess ? 'text-green-800' : 'text-gray-600'}`}>
                                                    {publicAccess ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${publicAccess ? 'bg-green-600' : 'bg-gray-300'
                                                }`}
                                            >
                                                <span
                                                    className={`${publicAccess ? 'translate-x-6' : 'translate-x-1'
                                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD: Visi & Misi */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#3B4D3A]">Visi & Misi</h2>
                                    <p className="text-sm text-gray-400">Filosofi dan tujuan organisasi</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Visi Organisasi</label>
                                    <textarea
                                        value={vision}
                                        onChange={(e) => setVision(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] transition-all bg-gray-50 focus:bg-white resize-y"
                                        placeholder="Tuliskan visi organisasi..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Misi Utama</label>
                                    <textarea
                                        value={mission}
                                        onChange={(e) => setMission(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] transition-all bg-gray-50 focus:bg-white resize-y"
                                        placeholder="Tuliskan misi organisasi..."
                                    />
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-[#3B4D3A] text-white font-semibold rounded-xl hover:bg-[#2d3a2d] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Simpan Visi & Misi
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CARD: Sambutan Ketua OSIS */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#3B4D3A]">Sambutan Ketua OSIS</h2>
                                    <p className="text-sm text-gray-400">Profil dan kata sambutan Ketua OSIS</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Nama Ketua OSIS</label>
                                        <input
                                            type="text"
                                            value={ketosName}
                                            onChange={(e) => setKetosName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] transition-all bg-gray-50 focus:bg-white"
                                            placeholder="Nama lengkap..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Periode Menjabat</label>
                                        <input
                                            type="text"
                                            value={ketosPeriode}
                                            onChange={(e) => setKetosPeriode(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] transition-all bg-gray-50 focus:bg-white"
                                            placeholder="Contoh: 2025/2026"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">Kata Sambutan</label>
                                    <textarea
                                        value={ketosSambutan}
                                        onChange={(e) => setKetosSambutan(e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3B4D3A]/20 focus:border-[#3B4D3A] transition-all bg-gray-50 focus:bg-white resize-y"
                                        placeholder="Tuliskan kata sambutan..."
                                    />
                                </div>

                                {/* Foto Upload Section */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-semibold text-[#3B4D3A]">Foto Ketua OSIS</label>
                                    <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                                        <div className="relative w-24 h-32 flex-shrink-0 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                            {ketosImagePreview ? (
                                                <img src={ketosImagePreview} alt="Ketos Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-center p-2">
                                                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 w-full">
                                            <div className="flex gap-3">
                                                <input
                                                    ref={ketosFileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleKetosFileSelect}
                                                />
                                                <button
                                                    onClick={() => ketosFileInputRef.current?.click()}
                                                    className="px-4 py-2 bg-white border border-gray-200 text-[#3B4D3A] font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 text-sm"
                                                >
                                                    <Upload className="w-4 h-4" />
                                                    Pilih Foto
                                                </button>

                                                {(ketosImageFile || ketosImagePreview) && (
                                                    <button
                                                        onClick={() => {
                                                            setKetosImagePreview(null);
                                                            setKetosImageFile(null);
                                                        }}
                                                        className="px-4 py-2 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all text-sm"
                                                    >
                                                        Hapus
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Format: JPG, PNG. Max 5MB. Disarankan rasio potret (4:5).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-6 py-2.5 bg-[#3B4D3A] text-white font-semibold rounded-xl hover:bg-[#2d3a2d] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Simpan Sambutan
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* CARD: Hero Section Image */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#3B4D3A]">Gambar Hero Section</h2>
                                    <p className="text-sm text-gray-400">Gambar utama pada halaman depan (Landing Page)</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="w-full aspect-video rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                                        {heroImagePreview ? (
                                            <img src={heroImagePreview} alt="Hero Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                <span className="text-sm text-gray-400">Belum ada gambar hero</span>
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => heroFileInputRef.current?.click()}
                                                className="px-4 py-2 bg-white text-[#3B4D3A] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-sm flex items-center gap-2"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Ganti Gambar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            <p className="font-medium text-gray-700">Ketentuan:</p>
                                            <ul className="list-disc list-inside mt-1 space-y-0.5">
                                                <li>Format: JPG, PNG, WEBP</li>
                                                <li>Orientasi: Landscape (Disarankan 16:9)</li>
                                                <li>Maksimal 1 Gambar saja (Otomatis replace)</li>
                                                <li>Ukuran Max: 5MB</li>
                                            </ul>
                                        </div>

                                        <div className="flex gap-3">
                                            <input
                                                ref={heroFileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleHeroFileSelect}
                                            />
                                            {heroImageFile && (
                                                <button
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className="px-6 py-2.5 bg-[#3B4D3A] text-white font-semibold rounded-xl hover:bg-[#2d3a2d] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Upload & Simpan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD: Appearance */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <ImageIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[#3B4D3A]">Logo Organisasi</h2>
                                    <p className="text-sm text-gray-400">Branding visual aplikasi</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-start gap-6">
                                    <div className="relative w-32 h-32 flex-shrink-0 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                                <span className="text-xs text-gray-400">No Logo</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-800">Upload Logo Baru</h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Mendukung format PNG, JPG, SVG. Ukuran maksimal 2MB. Disarankan menggunakan background transparan.
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="px-5 py-2.5 bg-[#3B4D3A] text-white font-semibold rounded-xl hover:bg-[#2d3a2d] transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <Upload className="w-4 h-4" />
                                                Pilih File
                                            </button>

                                            {logoFile && (
                                                <button
                                                    onClick={handleSave}
                                                    disabled={loading}
                                                    className="px-5 py-2.5 bg-[#3B4D3A] text-white font-semibold rounded-xl hover:bg-[#2d3a2d] transition-all shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                    Upload
                                                </button>
                                            )}

                                            {logoPreview && (
                                                <button
                                                    onClick={() => {
                                                        setLogoPreview(null);
                                                        setLogoFile(null);
                                                    }}
                                                    className="px-5 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-all"
                                                >
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (System) - Spans 1 col */}
                    <div className="space-y-6">
                        {/* CARD: Tools */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <Database className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-[#3B4D3A]">System Tools</h2>
                            </div>

                            <div className="space-y-4">
                                {/* Backup */}
                                <div className="p-4 bg-gray-50 rounded-xl hover:bg-[#E8DCC3]/10 transition-colors border border-transparent hover:border-[#E8DCC3]">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-[#3B4D3A]">Backup Data</h3>
                                            <p className="text-xs text-gray-500">Download .json full backup</p>
                                        </div>
                                        <Database className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <button
                                        onClick={handleBackup}
                                        className="w-full py-2 bg-white border border-gray-200 text-[#3B4D3A] font-semibold rounded-lg hover:bg-[#3B4D3A] hover:text-white transition-all text-sm"
                                    >
                                        Download Now
                                    </button>
                                </div>

                                {/* Maintenance */}
                                <div className={`p-4 rounded-xl border transition-colors ${maintenanceMode ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-transparent'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className={`font-bold ${maintenanceMode ? 'text-orange-800' : 'text-gray-800'}`}>Maintenance Mode</h3>
                                            <p className="text-xs text-gray-500">Tutup akses publik sementara</p>
                                        </div>
                                        <AlertTriangle className={`w-5 h-5 ${maintenanceMode ? 'text-orange-500' : 'text-gray-400'}`} />
                                    </div>
                                    <button
                                        onClick={handleToggleMaintenance}
                                        className={`w-full py-2 rounded-lg transition-all text-sm font-semibold ${maintenanceMode
                                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {maintenanceMode ? 'Turn Off' : 'Turn On'}
                                    </button>
                                </div>
                                {/* Role Access */}
                                <div className="p-4 bg-gray-50 rounded-xl hover:bg-[#E8DCC3]/10 transition-colors border border-transparent hover:border-[#E8DCC3]">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-[#3B4D3A]">Pengaturan Akses Role</h3>
                                            <p className="text-xs text-gray-500">Atur hak akses per role untuk setiap modul.</p>
                                        </div>
                                        <Database className="w-5 h-5 text-gray-400" />
                                    </div>

                                    {auth?.user?.role?.name && auth.user.role.name.toLowerCase() === 'admin' ? (
                                        <Link href={(window as any).route ? (window as any).route('dashboard.settings.role-access') : '/dashboard/settings/role-access'} className="w-full block text-center py-2 bg-white border border-gray-200 text-[#3B4D3A] font-semibold rounded-lg hover:bg-[#3B4D3A] hover:text-white transition-all text-sm">Buka Pengaturan Akses Role</Link>
                                    ) : (
                                        <button
                                            onClick={() => Swal.fire({
                                                icon: 'warning',
                                                title: 'Akses Ditolak',
                                                text: 'Hanya admin yang dapat membuka Pengaturan Akses Role.',
                                                confirmButtonColor: '#3B4D3A'
                                            })}
                                            className="w-full py-2 bg-white border border-gray-200 text-gray-500 font-semibold rounded-lg text-sm"
                                        >
                                            Buka Pengaturan Akses Role
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* CARD: Notifications */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                                <div className="p-2.5 bg-[#E8DCC3]/30 rounded-xl text-[#3B4D3A]">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-bold text-[#3B4D3A]">Notifikasi</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                    <div className="relative flex items-center mt-0.5">
                                        <input
                                            type="checkbox"
                                            checked={emailNotif}
                                            onChange={(e) => setEmailNotif(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-[#3B4D3A] checked:bg-[#3B4D3A]"
                                        />
                                        <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="block text-sm font-bold text-gray-700">Email Alerts</span>
                                        <span className="block text-xs text-gray-500 mt-1">Terima notifikasi untuk proposal & pesan baru.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
};

export default SettingsPage;
