import React, { useEffect, useState } from 'react';
import Navbar from '@/components/public/Navbar';
import FooterSection from '@/components/public/FooterSection';
import api from '@/lib/axios';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState<string>('/build/assets/osis-logo-mBAtwUV-.png'); // Default fallback

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/public-settings');
        if (response.data.site_logo) {
          setLogoUrl(response.data.site_logo);
        }
      } catch (error) {
        console.error('Failed to fetch public settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-bg text-text w-full overflow-x-hidden">
      <Navbar logoUrl={logoUrl} />
      <main>{children}</main>
      <FooterSection logoUrl={logoUrl} />
    </div>
  );
};

export default PublicLayout;
