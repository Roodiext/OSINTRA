import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ModuleItem {
    name: string;
    label: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
}

interface Props {
    modules: ModuleItem[];
    roles: Role[];
    matrix: Record<string, Record<number, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>>;
}

const ModuleAccessPage: React.FC<Props> = ({ modules, roles, matrix }) => {
    const [selectedModule, setSelectedModule] = useState<string>(modules[0]?.name || '');
    const [local, setLocal] = useState<Record<number, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>>(matrix[selectedModule] || {});

    React.useEffect(() => {
        setLocal(matrix[selectedModule] || {});
    }, [selectedModule, matrix]);

    const toggle = (roleId: number, key: string) => {
        setLocal(prev => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [key]: !prev[roleId]?.[key]
            }
        }));
    };

    const save = async () => {
        try {
            await axios.put(`/settings/modules-access/${selectedModule}`, { permissions: local });
            Swal.fire('Berhasil', 'Pengaturan akses modul disimpan.', 'success');
        } catch (err) {
            console.error(err);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
        }
    };

    return (
        <DashboardLayout>
            <Head title="Akses Halaman - OSINTRA" />

            <div className="max-w-7xl mx-auto space-y-6 lg:pl-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3B4D3A]">Akses Halaman Internal</h1>
                        <p className="text-sm text-gray-500">Atur hak akses per role untuk setiap halaman / modul internal.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100">
                        <h3 className="font-bold mb-3">Halaman / Modul</h3>
                        <div className="space-y-2">
                            {modules.map((m) => (
                                <button
                                    key={m.name}
                                    onClick={() => setSelectedModule(m.name)}
                                    className={`w-full text-left px-3 py-2 rounded-lg ${selectedModule === m.name ? 'bg-[#E8F0E9] border border-green-200' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-semibold">{m.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold">Atur Akses: <span className="text-[#3B4D3A]">{selectedModule}</span></h3>
                                <p className="text-sm text-gray-500">Centang hak akses untuk tiap role.</p>
                            </div>
                            <div>
                                <button onClick={save} className="px-4 py-2 bg-[#3B4D3A] text-white rounded-xl">Simpan</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {roles.map((r) => (
                                <div key={r.id} className="p-4 border rounded-lg">
                                    <div className="font-semibold mb-2">{r.name}</div>
                                    <div className="flex gap-3 items-center flex-wrap">
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={!!local[r.id]?.can_view} onChange={() => toggle(r.id, 'can_view')} />
                                            <span className="text-sm">Lihat</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={!!local[r.id]?.can_create} onChange={() => toggle(r.id, 'can_create')} />
                                            <span className="text-sm">Buat</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={!!local[r.id]?.can_edit} onChange={() => toggle(r.id, 'can_edit')} />
                                            <span className="text-sm">Ubah</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={!!local[r.id]?.can_delete} onChange={() => toggle(r.id, 'can_delete')} />
                                            <span className="text-sm">Hapus</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default ModuleAccessPage;
