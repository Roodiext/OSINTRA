import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import logo from '../../asset/icon/osis-logo.png';
import api from '@/lib/axios';
import { router } from '@inertiajs/react'; // Import router dari Inertia
import Swal from 'sweetalert2';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        setLoading(true);

        if (!username || !password) {
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Username dan password harus diisi!',
                confirmButtonColor: '#3B4D3A',
                iconColor: '#ef4444',
            });
            return;
        }

        try {
            const response = await api.post('/login', {
                username: username,
                password,
            });

            const { token, user } = response.data;

            console.log('Login response received:', {
                hasToken: !!token,
                userName: user?.name,
                userId: user?.id,
            });

            if (token) {
                // Simpan token ke localStorage (konsisten dengan axios interceptor)
                localStorage.setItem('auth_token', token);
                console.log('Token saved to localStorage');

                // Set default header untuk request selanjutnya
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                console.log('Authorization header set');

                // Simpan data user jika diperlukan
                localStorage.setItem('user', JSON.stringify(user));
                console.log('User data saved to localStorage');

                // Tampilkan alert sukses dengan animasi
                await Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: `Selamat datang, ${user.name || username}!`,
                    showConfirmButton: false,
                    timer: 1500,
                    timerProgressBar: true,
                    iconColor: '#22c55e',
                });

                console.log('Navigating to /dashboard...');
                // Gunakan router Inertia untuk navigasi
                router.visit('/dashboard', {
                    method: 'get',
                    preserveState: false,
                    preserveScroll: false,
                    replace: true,
                });
            } else {
                throw new Error('Token tidak ditemukan');
            }
        } catch (err: any) {
            setLoading(false);

            // Prefer field-specific validation messages if present
            const errors = err?.response?.data?.errors;
            let msg = err?.response?.data?.message || 'Gagal login. Periksa kredensial.';

            if (errors) {
                if (errors.password && errors.password.length) {
                    msg = errors.password[0];
                } else if (errors.username && errors.username.length) {
                    msg = errors.username[0];
                }
            }

            // Tampilkan alert error dengan animasi
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal!',
                text: msg,
                confirmButtonColor: '#3B4D3A',
                iconColor: '#ef4444',
            });

            // Hapus token dan header jika login gagal
            localStorage.removeItem('auth_token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <div className="min-h-screen bg-[#E8DCC3] flex items-center justify-center px-4">
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #E8DCC3 1px, transparent 0)',
                    backgroundSize: '48px 48px'
                }} />
            </div>

            <div className="relative z-10 w-full max-w-md py-5">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-block mb-4">
                        <div className="w-20 h-25 flex items-center justify-center">
                            <img src={logo} alt="OSINTRA" className="w-full h-full object-contain" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-[#3B4D3A] mb-2 tracking-tight">OSVIS</h1>
                </div>

                {/* Login Form Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-[#E8DCC3] p-8">
                    <h2 className="text-2xl font-bold text-[#3B4D3A] mb-8 text-center">
                        Login ke Dashboard
                    </h2>

                    <div className="space-y-5">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                Username atau Email
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all duration-200 text-[#1E1E1E]"
                                    placeholder="Masukkan username atau email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-[#3B4D3A] mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6E8BA3]" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-[#F5F5F5] border-2 border-transparent rounded-xl focus:border-[#3B4D3A] focus:bg-white outline-none transition-all duration-200 text-[#1E1E1E]"
                                    placeholder="Masukkan password"
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full px-6 py-4 bg-[#3B4D3A] text-white rounded-xl font-semibold hover:bg-[#2d3a2d] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#3B4D3A]/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </span>
                            ) : 'Login'}
                        </button>
                    </div>

                    {/* Back Link */}
                    <div className="mt-8 text-center">
                        <a
                            href="/"
                            className="text-[#6E8BA3] hover:text-[#3B4D3A] text-sm font-semibold inline-flex items-center transition-colors duration-200"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Kembali ke Halaman Utama
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-[#6E8BA3] text-sm mt-8 font-medium">
                    © 2026 OSIS SMKN 6 Surakarta
                </p>
            </div>
        </div>
    );
};

export default LoginPage;