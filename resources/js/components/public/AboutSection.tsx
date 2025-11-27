import React, { useEffect, useState } from 'react';
import { Target, Eye } from 'lucide-react';
import api from '@/lib/axios';

const AboutSection: React.FC = () => {
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setVision(response.data.osis_vision || 'Menjadi organisasi siswa yang profesional, inovatif, dan berprestasi');
                setMission(response.data.osis_mission || 'Mengembangkan potensi siswa melalui kegiatan yang positif dan bermanfaat');
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            }
        };

        fetchSettings();
    }, []);

    return (
        <section id="about" className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                        Tentang OSIS
                    </h2>
                    <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: '#E8DCC3' }} />
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Visi */}
                    <div className="p-8 rounded-2xl shadow-xl transform hover:scale-100 transition-all duration-300" style={{ backgroundColor: '#F5F5F5', color: '#1E1E1E' }}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                <Eye className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold">Visi</h3>
                        </div>
                        <p className="text-lg leading-relaxed" style={{ color: '#6E8BA3' }}>
                            {vision}
                        </p>
                    </div>

                    {/* Misi */}
                    <div className="p-8 rounded-2xl shadow-xl transform hover:scale-100 transition-all duration-300" style={{ backgroundColor: '#F5F5F5', color: '#1E1E1E' }}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 rounded-xl" style={{ backgroundColor: '#E8DCC3' }}>
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold">Misi</h3>
                        </div>
                        <p className="text-lg leading-relaxed" style={{ color: '#6E8BA3' }}>
                            {mission}
                        </p>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
                    <div className="p-6 rounded-2xl" style={{ backgroundColor: '#F5F5F5' }}>
                        <div className="text-4xl font-bold mb-2" style={{ color: '#3B4D3A' }}>10+</div>
                        <div style={{ color: '#6E8BA3' }}>Divisi Aktif</div>
                    </div>
                    <div className="p-6 rounded-2xl" style={{ backgroundColor: '#F5F5F5' }}>
                        <div className="text-4xl font-bold mb-2" style={{ color: '#3B4D3A' }}>50+</div>
                        <div style={{ color: '#6E8BA3' }}>Anggota OSIS</div>
                    </div>
                    <div className="p-6 rounded-2xl" style={{ backgroundColor: '#F5F5F5' }}>
                        <div className="text-4xl font-bold mb-2" style={{ color: '#3B4D3A' }}>20+</div>
                        <div style={{ color: '#6E8BA3' }}>Program Kerja</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
