import React, { useState, ReactNode } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import api from '@/lib/axios';

interface DashboardLayoutProps {
    children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/public-settings');
                if (response.data.site_logo) {
                    setLogoUrl(response.data.site_logo);
                }
            } catch (error) {
                console.error('Failed to fetch logo:', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                logoUrl={logoUrl || undefined}
            />

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
