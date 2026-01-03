import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/layouts/DashboardLayout';
import api from '@/lib/axios';
import Swal from 'sweetalert2';

type ModuleItem = { name: string; label: string };
type RolePermissionRow = {
  id?: number;
  module_name: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};
type Role = {
  id: number;
  name: string;
  description?: string;
  permissions?: RolePermissionRow[];
};

interface Props {
  roles: Role[];
  modules: ModuleItem[];
}

const RoleAccessSetting: React.FC<Props> = ({ roles = [], modules = [] }) => {
  const [selectedRoleId, setSelectedRoleId] = React.useState<number | null>(roles[0]?.id ?? null);
  const [localPermissions, setLocalPermissions] = React.useState<Record<string, any>>({});
  const [originalPermissions, setOriginalPermissions] = React.useState<Record<string, any>>({});
  const [saving, setSaving] = React.useState(false);

  // Build permission map for the selected role
  const buildMap = React.useCallback(
    (roleId: number | null) => {
      const role = roles.find((r) => r.id === roleId) || roles[0];
      const map: Record<string, any> = {};

      modules.forEach((m) => {
        const found = role?.permissions?.find((p) => p.module_name === m.name);
        map[m.name] = {
          can_view: !!found?.can_view,
          can_create: !!found?.can_create,
          can_edit: !!found?.can_edit,
          can_delete: !!found?.can_delete,
        };
      });

      return map;
    },
    [roles, modules]
  );

  // Initialize when modules/roles/selectedRole change
  React.useEffect(() => {
    const map = buildMap(selectedRoleId);
    setLocalPermissions(map);
    setOriginalPermissions(map);
  }, [selectedRoleId, roles, modules, buildMap]);

  // Check if we have changes
  const hasChanges = React.useMemo(() => {
    const a = JSON.stringify(localPermissions);
    const b = JSON.stringify(originalPermissions);
    return a !== b;
  }, [localPermissions, originalPermissions]);

  const toggle = (moduleName: string, key: keyof RolePermissionRow) => {
    setLocalPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [key]: !prev[moduleName]?.[key],
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;

    // Confirm
    const result = await Swal.fire({
      title: 'Simpan Perubahan?',
      text: 'Perubahan hak akses untuk role ini akan disimpan ke database.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3B4D3A',
      confirmButtonText: 'Ya, simpan',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // API contract: PUT /settings/roles/{roleId} with { permissions: { moduleName: { can_view, ... } } }
      await api.put(`/settings/roles/${selectedRoleId}`, { permissions: localPermissions });

      // Update original snapshot and UI
      setOriginalPermissions(JSON.parse(JSON.stringify(localPermissions)));
      setSaving(false);
      Swal.fire({ title: 'Berhasil', text: 'Perubahan disimpan.', icon: 'success', confirmButtonColor: '#3B4D3A' });
    } catch (err: any) {
      console.error(err);
      setSaving(false);
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan.';
      Swal.fire({ title: 'Gagal', text: msg, icon: 'error', confirmButtonColor: '#3B4D3A' });
    }
  };

  const handleReset = () => {
    setLocalPermissions(JSON.parse(JSON.stringify(originalPermissions)));
    Swal.fire({ title: 'Dikembalikan', text: 'Perubahan dibatalkan.', icon: 'info', timer: 1200, showConfirmButton: false });
  };

  if (!roles.length || !modules.length) {
    return (
      <DashboardLayout>
        <Head title="Pengaturan Akses Role - OSINTRA" />
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-xl font-bold">Pengaturan Akses Role</h1>
            <p className="text-gray-500 mt-2">Tidak ada data role atau modul. Pastikan seed data / backend mengirimkan props yang benar.</p>
            <div className="mt-4">
              <Link href="/settings" className="text-sm text-gray-500 hover:underline">Kembali ke Pengaturan</Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head title="Pengaturan Akses Role - OSINTRA" />
      <div className="max-w-7xl mx-auto space-y-6 lg:pl-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3B4D3A]">Pengaturan Akses per Role</h1>
            <p className="text-sm text-gray-500">Pilih role di kolom kiri, lalu atur akses tiap modul.</p>
          </div>
          <Link href="/settings" className="text-sm text-gray-500 hover:underline">Kembali ke Pengaturan</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles list */}
          <aside className="col-span-1 bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Roles</h3>
            </div>

            <div className="space-y-2">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedRoleId === r.id ? 'bg-[#E8F0E9] border border-green-200' : 'hover:bg-gray-50'}`}
                  aria-pressed={selectedRoleId === r.id}
                >
                  <div className="font-semibold">{r.name}</div>
                  {r.description && <div className="text-xs text-gray-500">{r.description}</div>}
                </button>
              ))}
            </div>
          </aside>

          {/* Permission panel */}
          <main className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Permissions untuk: <span className="text-[#3B4D3A]">{roles.find((r) => r.id === selectedRoleId)?.name}</span></h3>
                <p className="text-sm text-gray-500">Centang akses Lihat/Buat/Ubah/Hapus untuk tiap modul.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges || saving}
                  className="px-3 py-2 rounded-xl border text-sm bg-white hover:bg-gray-50 disabled:opacity-60"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="px-4 py-2 rounded-xl bg-[#3B4D3A] text-white text-sm disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((m) => (
                <div key={m.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{m.label}</div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!localPermissions[m.name]?.can_view}
                        disabled={saving}
                        onChange={() => toggle(m.name, 'can_view')}
                      />
                      <span className="text-sm">Lihat</span>
                    </label>

                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!localPermissions[m.name]?.can_create}
                        disabled={saving}
                        onChange={() => toggle(m.name, 'can_create')}
                      />
                      <span className="text-sm">Buat</span>
                    </label>

                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!localPermissions[m.name]?.can_edit}
                        disabled={saving}
                        onChange={() => toggle(m.name, 'can_edit')}
                      />
                      <span className="text-sm">Ubah</span>
                    </label>

                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!localPermissions[m.name]?.can_delete}
                        disabled={saving}
                        onChange={() => toggle(m.name, 'can_delete')}
                      />
                      <span className="text-sm">Hapus</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoleAccessSetting;