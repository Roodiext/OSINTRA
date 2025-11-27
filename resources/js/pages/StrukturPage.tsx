import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import DivisionsSection from '@/components/public/DivisionsSection';

const StrukturPage: React.FC = () => {
    return (
        <>
            <Head title="Struktur - OSINTRA" />
            <PublicLayout>
                <DivisionsSection />
            </PublicLayout>
        </>
    );
};

export default StrukturPage;
