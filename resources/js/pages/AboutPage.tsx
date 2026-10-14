import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import AboutSection from '@/components/public/AboutSection';

const AboutPage: React.FC = () => {
    return (
        <>
            <Head title="Tentang OSIS SMK Negeri 6 Surakarta - OSINTRA">
                <meta name="description" content="Profil, visi misi, dan sejarah perjalanan OSIS SMK Negeri 6 Surakarta (Viska). Wadah aspirasi, kreativitas, dan kepemimpinan siswa SMK." />
                <meta name="keywords" content="tentang osis smk, visi misi osis smk, profil osis smk, web osis, web osis smk, osis smk, smk, osis smkn 6 surakarta, osintra" />
            </Head>
            <PublicLayout>
                <AboutSection />
            </PublicLayout>
        </>
    );
};

export default AboutPage;
