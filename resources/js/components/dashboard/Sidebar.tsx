import React from 'react';
import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Mail,
    DollarSign,
    Settings,
    UserCircle,
    LogOut,
    X,
    FileText,
    Building2
} from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import logo from '../../../asset/icon/osis-logo.png';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    logoUrl?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, logoUrl }) => {
    // Try to fetch user from localStorage (set on login) or fallback
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = stored ? JSON.parse(stored) : { name: 'Admin', role: { name: 'Admin' } };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', module: 'Dashboard' },
        { name: 'Divisi', icon: Building2, path: '/dashboard/divisions', module: 'Divisions' },
        { name: 'Posisi', icon: FileText, path: '/dashboard/positions', module: 'Positions' },
        { name: 'Pengguna', icon: Users, path: '/dashboard/users', module: 'Users' },
        { name: 'Program Kerja', icon: FolderKanban, path: '/dashboard/prokers', module: 'Prokers' },
        { name: 'Pesan', icon: Mail, path: '/dashboard/messages', module: 'Messages' },
        { name: 'Keuangan', icon: DollarSign, path: '/dashboard/transactions', module: 'Transactions' },
        { name: 'Log Aktivitas', icon: FileText, path: '/dashboard/audit-logs', module: 'AuditLogs' },
        { name: 'Pengaturan', icon: Settings, path: '/dashboard/settings', module: 'Settings' },
        { name: 'Profil', icon: UserCircle, path: '/dashboard/profile', module: 'Profile' },
    ];

    const roleName = (user?.role?.name || '').toLowerCase();
    const allowedForPositions = ['admin', 'ketua', 'wakil ketua'];

    const filteredMenuItems = menuItems.filter(item => {
        // hide Positions menu unless user has allowed role
        if (item.module === 'Positions') {
            return allowedForPositions.includes(roleName);
        }
        return true;
    });

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('auth_token');
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-[#3B4D3A] text-white w-72 transform transition-transform duration-300 z-50 shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header (logo only to avoid duplicate title) */}
                    <div className="p-4 border-b border-[#4A5F49] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#E8DCC3] rounded-full flex items-center justify-center p-1.5 shadow-lg overflow-hidden">
                                <img src={logoUrl || logo} alt="OSIS Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <p className="text-sm text-[#E8DCC3]/90 font-semibold">OSVIS</p>
                                <p className="text-xs text-[#E8DCC3]/60">Management Internal System</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-[#E8DCC3] hover:text-white hover:bg-[#4A5F49] p-2 rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* compact user info - removed to avoid duplication (Topbar shows user) */}

                    {/* Navigation */}
                    <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-[#4A5F49] scrollbar-track-transparent">
                        <ul className="space-y-2">
                            {filteredMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = window.location.pathname === item.path;

                                return (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            onClick={(e: React.MouseEvent) => {
                                                // If this is the Settings menu and user is not admin, block and show alert
                                                if (item.module === 'Settings' && roleName !== 'admin') {
                                                    e.preventDefault();
                                                    Swal.fire({
                                                        icon: 'warning',
                                                        title: 'Akses Ditolak',
                                                        text: 'Hanya admin yang dapat membuka Pengaturan melalui sidebar.',
                                                        confirmButtonColor: '#3B4D3A'
                                                    });
                                                }
                                            }}
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 ${isActive
                                                ? 'bg-[#E8DCC3] text-[#3B4D3A] shadow-md scale-105'
                                                : 'text-[#E8DCC3]/90 hover:bg-[#4A5F49] hover:text-white hover:pl-6'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5 flex-shrink-0" />
                                            <span className="text-sm">{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-[#4A5F49] bg-[#2F3D2E]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[#E8DCC3]/90 hover:bg-red-600 hover:text-white font-medium transition-all duration-200 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;