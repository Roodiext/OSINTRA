import React, { useState, useEffect } from 'react';
import { X, Search, Plus } from 'lucide-react';
import api from '@/lib/axios';
import Swal from 'sweetalert2';

interface User {
    id: number;
    name: string;
    username: string;
}

interface Position {
    id: number;
    name: string;
}

interface Division {
    id: number;
    name: string;
}

interface AddPanitiaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    prokerId: number;
    eventDivisions: Division[];
    positions: Position[];
}

const AddPanitiaModal: React.FC<AddPanitiaModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    prokerId,
    eventDivisions,
    positions,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedDivision, setSelectedDivision] = useState<string>('');
    const [selectedPosition, setSelectedPosition] = useState<string>('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Search users
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setUserSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const searchUsers = async () => {
            try {
                setSearchLoading(true);
                const response = await api.get('/users/search', {
                    params: { q: searchQuery },
                });
                setUserSuggestions(response.data.data || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error(error);
                setUserSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSelectUser = (user: User) => {
        setSelectedUser(user);
        setSearchQuery(user.name);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            Swal.fire('Error', 'Pilih user terlebih dahulu', 'error');
            return;
        }

        if (!selectedDivision) {
            Swal.fire('Error', 'Pilih divisi terlebih dahulu', 'error');
            return;
        }

        setLoading(true);

        try {
            await api.post(`/prokers/${prokerId}/anggota`, {
                user_id: selectedUser.id,
                division_id: parseInt(selectedDivision),
                position_id: selectedPosition ? parseInt(selectedPosition) : null,
                role: role || null,
            });

            Swal.fire('Berhasil!', 'Panitia berhasil ditambahkan', 'success');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Gagal menambahkan panitia';
            Swal.fire('Gagal!', errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSearchQuery('');
        setSelectedUser(null);
        setSelectedDivision('');
        setSelectedPosition('');
        setRole('');
        setUserSuggestions([]);
        setShowSuggestions(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 my-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-[#3B4D3A]">Tambah Panitia</h2>
                    <button
                        onClick={onClose}
                        className="text-[#6E8BA3] hover:text-[#3B4D3A] text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Search */}
                    <div className="relative">
                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                            Nama Panitia *
                        </label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6E8BA3]" />
                            <input
                                type="text"
                                placeholder="Ketik nama atau username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                                className="w-full pl-10 pr-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* User Suggestions */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#E8DCC3] rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                {searchLoading ? (
                                    <div className="p-4 text-center text-[#6E8BA3]">
                                        Mencari...
                                    </div>
                                ) : userSuggestions.length === 0 ? (
                                    <div className="p-4 text-center text-[#6E8BA3]">
                                        Tidak ada user ditemukan
                                    </div>
                                ) : (
                                    userSuggestions.map(user => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleSelectUser(user)}
                                            className="w-full text-left px-4 py-3 hover:bg-[#F5F5F5] transition-colors border-b border-[#F5F5F5] last:border-0"
                                        >
                                            <p className="font-semibold text-[#0f172a]">{user.name}</p>
                                            <p className="text-xs text-[#6E8BA3]">@{user.username}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected User Info */}
                    {selectedUser && (
                        <div className="bg-[#F5F5F5] p-3 rounded-lg border-l-4 border-[#3B4D3A]">
                            <p className="text-sm text-[#6E8BA3]">Terpilih:</p>
                            <p className="font-semibold text-[#3B4D3A]">{selectedUser.name}</p>
                            <p className="text-xs text-[#6E8BA3]">@{selectedUser.username}</p>
                        </div>
                    )}

                    {/* Division Select */}
                    <div>
                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                            Divisi *
                        </label>
                        <select
                            required
                            value={selectedDivision}
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                        >
                            <option value="">Pilih Divisi</option>
                            {eventDivisions.map(div => (
                                <option key={div.id} value={div.id}>
                                    {div.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Position Select */}
                    <div>
                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                            Posisi (Opsional)
                        </label>
                        <select
                            value={selectedPosition}
                            onChange={(e) => setSelectedPosition(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                        >
                            <option value="">Tidak Ada Posisi Khusus</option>
                            {positions.map(pos => (
                                <option key={pos.id} value={pos.id}>
                                    {pos.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Role Input */}
                    <div>
                        <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                            Role/Peran (Opsional)
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Koordinator, Anggota, dll"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-[#F5F5F5] text-[#6E8BA3] rounded-xl hover:bg-[#E8DCC3] transition-all font-semibold"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !selectedUser || !selectedDivision}
                            className="flex-1 px-6 py-3 bg-[#3B4D3A] text-white rounded-xl hover:bg-[#2d3a2d] transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {loading ? 'Menambah...' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPanitiaModal;
