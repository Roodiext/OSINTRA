import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import DivisionsSection from '@/components/public/DivisionsSection';

const StrukturPage: React.FC = () => {
    return (
        <>
            <Head title="Struktur Organisasi OSIS SMK Negeri 6 Surakarta - OSINTRA">
                <meta name="description" content="Bagan struktur kepengurusan OSIS SMK Negeri 6 Surakarta. Mengenal Badan Pengurus Harian (BPH) dan seluruh Seksi Bidang (Siebid)." />
                <meta name="keywords" content="struktur osis smk, pengurus osis smk, bph osis smk, siebid osis, susunan organisasi osis, web osis, web osis smk, osis smk, smk" />
            </Head>
            <PublicLayout>
                <DivisionsSection />
            </PublicLayout>
        </>
    );
};

export default StrukturPage;
