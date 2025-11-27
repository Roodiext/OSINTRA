import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import api from '@/lib/axios';
import type { Position } from '@/types';

const DivisionsSection: React.FC = () => {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPositions = async () => {
            try {
                const response = await api.get('/positions');
                setPositions(response.data);
            } catch (error) {
                console.error('Failed to fetch divisions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPositions();
    }, []);

    if (loading) {
        return (
            <section className="py-20 px-4 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <p style={{ color: '#6E8BA3' }}>Memuat posisi...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="divisions" className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#3B4D3A' }}>
                        Struktur OSIS
                    </h2>
                    <div className="w-24 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: '#E8DCC3' }} />
                    <p style={{ color: '#6E8BA3' }} className="text-lg">
                        Berbagai posisi yang berperan dalam organisasi OSIS
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {positions.map((position, index) => (
                        <div
                            key={position.id}
                            className="p-6 rounded-2xl shadow-lg transition-all duration-300" 
                            style={{ animationDelay: `${index * 80}ms`, backgroundColor: '#F5F5F5' }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-xl" style={{ backgroundColor: '#3B4D3A' }}>
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2" style={{ color: '#3B4D3A' }}>
                                        {position.name}
                                    </h3>
                                    <p style={{ color: '#6E8BA3' }} className="text-sm leading-relaxed">
                                        {position.description || 'Posisi penting dalam struktur OSIS'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {positions.length === 0 && (
                    <div className="text-center py-12">
                        <p style={{ color: '#6E8BA3' }}>Belum ada posisi yang terdaftar</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DivisionsSection;
