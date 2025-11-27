import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import GallerySection from '@/components/public/GallerySection';

const GalleryPage: React.FC = () => {
    return (
        <>
            <Head title="Galeri - OSINTRA" />
            <PublicLayout>
                <GallerySection />
            </PublicLayout>
        </>
    );
};

export default GalleryPage;
