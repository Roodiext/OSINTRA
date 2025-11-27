import React from 'react';
import { Head } from '@inertiajs/react';
import PublicLayout from '@/components/public/PublicLayout';
import ContactSection from '@/components/public/ContactSection';

const ContactPage: React.FC = () => {
    return (
        <>
            <Head title="Kontak - OSINTRA" />
            <PublicLayout>
                <ContactSection />
            </PublicLayout>
        </>
    );
};

export default ContactPage;
