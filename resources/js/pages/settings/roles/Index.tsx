import React, { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import axios from 'axios';
import Swal from 'sweetalert2';

interface Module {
    name: string;
    label: string;
}

interface Role {
    id: number;
    name: string;
    description?: string;
    permissions: Array<{
        id: number;
        module_name: string;
        can_view: boolean;
        can_create: boolean;
        can_edit: boolean;
        can_delete: boolean;
    }>;
}

interface Props {
    roles: Role[];
    modules: Module[];
}

const RolePermissionsPage: React.FC<Props> = ({ roles, modules }) => {
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(roles[0]?.id ?? null);

    const buildPermissionsFromRole = (roleId: number | null) => {
        const role = roles.find(r => r.id === roleId) || roles[0];
        const map: Record<string, any> = {};

        modules.forEach((m) => {
            const found = role?.permissions?.find((p: any) => p.module_name === m.name);
            map[m.name] = {
                can_view: !!found?.can_view,
                can_create: !!found?.can_create,
                can_edit: !!found?.can_edit,
                can_delete: !!found?.can_delete,
            };
        });

        return map;
    };

    const [localPermissions, setLocalPermissions] = useState<Record<string, any>>(buildPermissionsFromRole(selectedRoleId));

    React.useEffect(() => {
        setLocalPermissions(buildPermissionsFromRole(selectedRoleId));
    }, [selectedRoleId, roles, modules]);

    const selectedRole = roles.find(r => r.id === selectedRoleId) || null;

    const toggle = (moduleName: string, key: string) => {
        setLocalPermissions(prev => ({
            ...prev,
            [moduleName]: {
                ...prev[moduleName],
                [key]: !prev[moduleName][key],
            }
        }));
    };

    const handleSave = async () => {
        if (!selectedRoleId) return;

        try {
            await axios.put(`/settings/roles/${selectedRoleId}`, { permissions: localPermissions });
            Swal.fire('Berhasil', 'Permission berhasil disimpan.', 'success');
        } catch (err) {
            console.error(err);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan.', 'error');
        }
    };

    return (
        <DashboardLayout>
            <Head title="Pengaturan Akses Role - OSINTRA" />

            <div className="max-w-7xl mx-auto space-y-6 lg:pl-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#3B4D3A]">Pengaturan Akses per Role</h1>
                        <p className="text-sm text-gray-500">Pilih role lalu atur hak akses untuk tiap modul.</p>
                    </div>
                    <Link href="/settings" className="text-sm text-gray-500 hover:underline">Kembali ke Pengaturan</Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 bg-white p-4 rounded-2xl border border-gray-100">
                        <h3 className="font-bold mb-3">Roles</h3>
                        <div className="space-y-2">
                            {roles.map((r) => (
                                <button
                                    key={r.id}
                                    onClick={() => setSelectedRoleId(r.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg ${selectedRoleId === r.id ? 'bg-[#E8F0E9] border border-green-200' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="font-semibold">{r.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold">Permissions untuk: <span className="text-[#3B4D3A]">{selectedRole?.name}</span></h3>
                                <p className="text-sm text-gray-500">Centang akses yang diinginkan untuk masing-masing modul.</p>
                            </div>
                            <div>
                                <button onClick={handleSave} className="px-4 py-2 bg-[#3B4D3A] text-white rounded-xl">Simpan</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modules.map((m) => (
                                <div key={m.name} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-semibold">{m.label}</div>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={localPermissions[m.name]?.can_view} onChange={() => toggle(m.name, 'can_view')} />
                                            <span className="text-sm">Lihat</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={localPermissions[m.name]?.can_create} onChange={() => toggle(m.name, 'can_create')} />
                                            <span className="text-sm">Buat</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={localPermissions[m.name]?.can_edit} onChange={() => toggle(m.name, 'can_edit')} />
                                            <span className="text-sm">Ubah</span>
                                        </label>
                                        <label className="inline-flex items-center gap-2">
                                            <input type="checkbox" checked={localPermissions[m.name]?.can_delete} onChange={() => toggle(m.name, 'can_delete')} />
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

export default RolePermissionsPage;
