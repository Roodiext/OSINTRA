import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import DivisionsSection from '@/components/public/DivisionsSection';
import GallerySection from '@/components/public/GallerySection';
import ContactSection from '@/components/public/ContactSection';


interface PublicPageProps {
    heroImage?: string;
}

const PublicPage: React.FC<PublicPageProps> = ({ heroImage }) => {
    return (
        <>
            <Head>
                <title>OSINTRA - OSIS SMKN 6 Surakarta</title>
                <link rel="preload" as="image" href={heroImage || '/osvis-team.jpg'} fetchPriority="high" />
            </Head>
            <PublicLayout>
                <HeroSection initialImage={heroImage} />
                <AboutSection />
                <DivisionsSection />
                <GallerySection />
                <ContactSection />
            </PublicLayout>
        </>
    );
};

export default PublicPage;
