import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import AboutSection from '@/components/public/AboutSection';

const AboutPage: React.FC = () => {
    return (
        <>
            <Head title="Tentang - OSINTRA" />
            <PublicLayout>
                <AboutSection />
            </PublicLayout>
        </>
    );
};

export default AboutPage;
