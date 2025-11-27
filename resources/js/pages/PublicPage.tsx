import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import DivisionsSection from '@/components/public/DivisionsSection';
import GallerySection from '@/components/public/GallerySection';
import ContactSection from '@/components/public/ContactSection';
import FooterSection from '@/components/public/FooterSection';

const PublicPage: React.FC = () => {
    return (
        <>
            <Head title="OSINTRA - OSIS SMKN 6 Surakarta" />
            <PublicLayout>
                <HeroSection />
                <AboutSection />
                <DivisionsSection />
                <GallerySection />
                <ContactSection />
            </PublicLayout>
        </>
    );
};

export default PublicPage;
