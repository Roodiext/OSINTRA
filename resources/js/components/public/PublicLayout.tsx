import React from 'react';
import Navbar from '@/components/public/Navbar';
import FooterSection from '@/components/public/FooterSection';

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Navbar />
      <main className="pt-16">{children}</main>
      <FooterSection />
    </div>
  );
};

export default PublicLayout;
