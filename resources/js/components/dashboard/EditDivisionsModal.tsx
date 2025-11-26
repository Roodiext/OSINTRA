import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';
import type { Division } from '@/types';

interface EditDivisionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prokerId: number;
    currentDivisions: Division[];
    availableDivisions: Division[];
}

const EditDivisionsModal: React.FC<EditDivisionsModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    prokerId,
    currentDivisions,
    availableDivisions,
}) => {
    const [selectedDivisionIds, setSelectedDivisionIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && currentDivisions && currentDivisions.length > 0) {
            // Set selected divisions dari currentDivisions
            const divisionIds = currentDivisions
                .filter(d => d && d.id)
                .map(d => d.id);
            setSelectedDivisionIds(divisionIds);
            console.log('Current divisions loaded:', divisionIds);
        } else if (isOpen) {
            setSelectedDivisionIds([]);
        }
    }, [isOpen, currentDivisions]);

    const handleDivisionToggle = (divisionId: number) => {
        setSelectedDivisionIds(prev =>
            prev.includes(divisionId)
                ? prev.filter(id => id !== divisionId)
                : [...prev, divisionId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate that at least one division is selected
            if (selectedDivisionIds.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Peringatan!',
                    text: 'Pilih minimal 1 divisi',
                    confirmButtonColor: '#3B4D3A',
                });
                setLoading(false);
                return;
            }

            const response = await api.put(`/prokers/${prokerId}`, {
                division_ids: selectedDivisionIds,
            });

            console.log('Update response:', response.data);

            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Divisi berhasil diperbarui',
                confirmButtonColor: '#3B4D3A',
            }).then(() => {
                onSuccess();
                onClose();
            });
        } catch (error: any) {
            console.error('Error updating divisions:', error);
            const errorMessage = 
                error.response?.data?.message || 
                error.message || 
                'Terjadi kesalahan saat memperbarui divisi';
            
            Swal.fire({
                icon: 'error',
                title: 'Gagal!',
                text: errorMessage,
                confirmButtonColor: '#3B4D3A',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-[#3B4D3A]">Edit Divisi</h2>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {availableDivisions && availableDivisions.length > 0 ? (
                            availableDivisions.map(division => (
                                <label
                                    key={division.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedDivisionIds.includes(division.id)}
                                        onChange={() => handleDivisionToggle(division.id)}
                                        disabled={loading}
                                        className="w-4 h-4 text-[#3B4D3A] border-gray-300 rounded focus:ring-[#3B4D3A]"
                                    />
                                    <span className="text-gray-700 font-medium">{division.name}</span>
                                </label>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">Tidak ada divisi tersedia</p>
                        )}
                    </div>

                    {/* Selected Divisions Display */}
                    {selectedDivisionIds.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Divisi Terpilih:</p>
                            <div className="flex flex-wrap gap-2">
                                {selectedDivisionIds.map(divId => {
                                    const division = availableDivisions?.find(d => d.id === divId);
                                    return division ? (
                                        <span
                                            key={divId}
                                            className="px-3 py-1 bg-[#E8DCC3] text-[#3B4D3A] rounded-full text-sm font-semibold"
                                        >
                                            {division.name}
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || selectedDivisionIds.length === 0}
                            className="flex-1 px-4 py-2 bg-[#3B4D3A] text-white font-semibold rounded-lg hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDivisionsModal;
