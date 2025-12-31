import React, { useState, ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64">
                <Topbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="p-6 osintra-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
