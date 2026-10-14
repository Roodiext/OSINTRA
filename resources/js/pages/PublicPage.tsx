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
            <Head title="Web Resmi OSIS SMK Negeri 6 Surakarta - OSINTRA">
                <meta name="description" content="Website resmi OSIS SMK Negeri 6 Surakarta (OSINTRA). Portal dokumentasi, program kerja, struktur organisasi, dan inovasi kegiatan siswa SMK Negeri 6 Solo." />
                <meta name="keywords" content="web osis, osis smk, smk, web osis smk, website osis smk, osintra, osis smkn 6 surakarta, osis viska, osis smk solo, program kerja osis smk" />
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
