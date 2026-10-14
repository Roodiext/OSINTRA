import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import ContactSection from '@/components/public/ContactSection';

const ContactPage: React.FC = () => {
    return (
        <>
            <Head title="Kontak & Aspirasi Siswa - OSIS SMK Negeri 6 Surakarta">
                <meta name="description" content="Sampaikan aspirasi, saran, dan pertanyaan Anda kepada pengurus OSIS SMK Negeri 6 Surakarta melalui portal komunikasi resmi OSINTRA." />
                <meta name="keywords" content="kontak osis smk, aspirasi siswa smk, hubungi osis, saran osis smkn 6 surakarta, web osis, web osis smk, osis smk, smk" />
            </Head>
            <PublicLayout>
                <ContactSection />
            </PublicLayout>
        </>
    );
};

export default ContactPage;
