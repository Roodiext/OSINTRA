import React from 'react';
import { Menu } from 'lucide-react';

import { usePage, Link } from '@inertiajs/react';
import { SharedData } from '@/types';

interface TopbarProps {
    onMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    return (
        <header className="bg-white border-b-2 border-[#E8DCC3] px-6 py-4 sticky top-0 z-30 shadow-sm backdrop-blur-sm bg-white/95">
            <div className="flex items-center justify-between">
                {/* Left Section - only menu button (no page title to keep topbar clean) */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-[#3B4D3A] hover:bg-[#E8DCC3] p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        aria-label="Toggle Menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">

                    {/* User Profile */}
                    <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 bg-[#E8DCC3] rounded-xl px-3 py-2 hover:bg-[#d5c9b0] transition-colors cursor-pointer group"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-[#3B4D3A]">{user.name}</p>
                            <p className="text-xs text-[#6E8BA3] font-medium">{user.role?.name || 'No Role'}</p>
                        </div>
                        <div className="w-10 h-10 bg-[#3B4D3A] rounded-full flex items-center justify-center text-[#E8DCC3] font-bold text-lg shadow-md ring-2 ring-[#6E8BA3]/30 group-hover:ring-[#3B4D3A] transition-all">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Topbar;