import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    CheckCircle2
} from 'lucide-react';
import Swal from 'sweetalert2';

interface SettingsPageProps {
    auth: {
        user: any;
    };
}

const SettingsPage: React.FC<SettingsPageProps> = ({ auth }) => {
    // Application Configuration State
    const [siteName, setSiteName] = useState('OSIS SMAN 1 Indonesia');
    const [academicPeriod, setAcademicPeriod] = useState('2024/2025');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [publicAccess, setPublicAccess] = useState(true);
    const [loading, setLoading] = useState(false);

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
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Error', 'Ukuran file maksimal 2MB', 'error');
                return;
            }
            // Create preview
            const objectUrl = URL.createObjectURL(file);
            setLogoPreview(objectUrl);
        }
    };

    // Save Logic
    const handleSave = async () => {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);

        Swal.fire({
            title: 'Berhasil Disimpan!',
            text: 'Konfigurasi sistem telah diperbarui.',
            icon: 'success',
            confirmButtonColor: '#3B4D3A'
        });
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
                            Kelola konfigurasi dasar dan tampilan aplikasi
                        </p>                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-bold shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
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
                                            {logoPreview && (
                                                <button
                                                    onClick={() => setLogoPreview(null)}
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
                                        onClick={() => setMaintenanceMode(!maintenanceMode)}
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
        </DashboardLayout>
    );
};

export default SettingsPage;
