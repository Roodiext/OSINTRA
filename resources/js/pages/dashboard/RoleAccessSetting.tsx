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
  can_approve: boolean;
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
  const [loading, setLoading] = React.useState(false);

  // Build permission map for the selected role
  const buildMap = React.useCallback(
    (roleId: number | null) => {
      const role = roles.find((r) => r.id === roleId);
      if (!role) return {};

      const map: Record<string, any> = {};

      modules.forEach((m) => {
        // Find permission by exact module_name match
        const found = role?.permissions?.find((p) => {
          // Case-insensitive comparison with trimming
          return p.module_name?.toLowerCase().trim() === m.name.toLowerCase().trim();
        });

        map[m.name] = {
          can_view: !!found?.can_view,
          can_create: !!found?.can_create,
          can_edit: !!found?.can_edit,
          can_delete: !!found?.can_delete,
          can_approve: !!found?.can_approve,
          id: found?.id,
        };
      });

      return map;
    },
    [roles, modules]
  );

  // Initialize when modules/roles/selectedRole change
  React.useEffect(() => {
    setLoading(true);
    const map = buildMap(selectedRoleId);
    const mapCopy = JSON.parse(JSON.stringify(map));
    setLocalPermissions(map);
    setOriginalPermissions(mapCopy);
    setLoading(false);
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
      // Transform data to match backend expectation: use actual module_name from database
      const permissionsData: Record<string, any> = {};
      
      modules.forEach((m) => {
        // Use module_name exactly as it should be stored (from the module definition)
        permissionsData[m.name] = {
          can_view: !!localPermissions[m.name]?.can_view,
          can_create: !!localPermissions[m.name]?.can_create,
          can_edit: !!localPermissions[m.name]?.can_edit,
          can_delete: !!localPermissions[m.name]?.can_delete,
          can_approve: !!localPermissions[m.name]?.can_approve,
        };
      });

      // API contract: PUT /settings/roles/{roleId} with { permissions: { moduleName: { can_view, ... } } }
      const response = await api.put(`/settings/roles/${selectedRoleId}`, { 
        permissions: permissionsData 
      });

      // Update original snapshot and UI
      setOriginalPermissions(JSON.parse(JSON.stringify(localPermissions)));
      setSaving(false);
      
      Swal.fire({ 
        title: 'Berhasil', 
        text: 'Perubahan disimpan. Perubahan akan diterapkan saat user melakukan login ulang.', 
        icon: 'success', 
        confirmButtonColor: '#3B4D3A' 
      });
    } catch (err: any) {
      console.error('Error saving permissions:', err);
      setSaving(false);
      const msg = err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan.';
      Swal.fire({ 
        title: 'Gagal', 
        text: msg, 
        icon: 'error', 
        confirmButtonColor: '#3B4D3A' 
      });
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

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <DashboardLayout>
      <Head title="Pengaturan Akses Role - OSINTRA" />
      <div className="max-w-7xl mx-auto space-y-6 lg:pl-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#3B4D3A]">Pengaturan Akses per Role</h1>
            <p className="text-sm text-gray-500">Pilih role di kolom kiri, lalu atur akses tiap modul. Perubahan akan diterapkan saat user melakukan login ulang.</p>
          </div>
          <Link href="/settings" className="text-sm text-gray-500 hover:underline">Kembali ke Pengaturan</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Roles list */}
          <aside className="col-span-1 bg-white p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Roles ({roles.length})</h3>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition ${selectedRoleId === r.id ? 'bg-[#E8F0E9] border border-green-200' : 'hover:bg-gray-50'}`}
                  aria-pressed={selectedRoleId === r.id}
                >
                  <div className="font-semibold text-sm">{r.name}</div>
                  {r.description && <div className="text-xs text-gray-500 truncate">{r.description}</div>}
                </button>
              ))}
            </div>
          </aside>

          {/* Permission panel */}
          <main className="lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Permissions untuk: <span className="text-[#3B4D3A]">{selectedRole?.name}</span></h3>
                <p className="text-sm text-gray-500">Centang akses Lihat/Buat/Ubah/Hapus untuk tiap modul.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={!hasChanges || saving || loading}
                  className="px-3 py-2 rounded-xl border text-sm bg-white hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving || loading}
                  className="px-4 py-2 rounded-xl bg-[#3B4D3A] text-white text-sm disabled:opacity-60 transition"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-8">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((m) => (
                  <div key={m.name} className="p-4 border rounded-lg hover:border-gray-300 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold text-sm">{m.label}</div>
                      <span className="text-xs text-gray-400">({m.name})</span>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!localPermissions[m.name]?.can_view}
                          disabled={saving || loading}
                          onChange={() => toggle(m.name, 'can_view')}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Lihat</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!localPermissions[m.name]?.can_create}
                          disabled={saving || loading}
                          onChange={() => toggle(m.name, 'can_create')}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Buat</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!localPermissions[m.name]?.can_edit}
                          disabled={saving || loading}
                          onChange={() => toggle(m.name, 'can_edit')}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Ubah</span>
                      </label>

                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!localPermissions[m.name]?.can_delete}
                          disabled={saving || loading}
                          onChange={() => toggle(m.name, 'can_delete')}
                          className="cursor-pointer"
                        />
                        <span className="text-sm">Hapus</span>
                      </label>

                      {m.name === 'Transactions' && (
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!localPermissions[m.name]?.can_approve}
                            disabled={saving || loading}
                            onChange={() => toggle(m.name, 'can_approve')}
                            className="cursor-pointer"
                          />
                          <span className="text-sm">Approve</span>
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RoleAccessSetting;