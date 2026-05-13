/*
Header: Login Page
Tujuan: Login user biasa via email/password dan OAuth Google.
Caller: Navigasi dari header/CTA.
Dependensi: @/api, next/link, next/navigation.
Status: Active.
*/

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGoogleAuthUrl, loginUser } from '@/api';
import { registerForPush } from '@/utils/fcm';

type LoginFormState = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await getGoogleAuthUrl();

      if (result.success && result.authUrl) {
        window.location.href = result.authUrl;
        return;
      }

      setError(result.message || 'Gagal mengambil URL login Google');
    } catch (loginError) {
      console.error('Error getting Google auth URL:', loginError);
      setError('Terjadi kesalahan saat mencoba login dengan Google');
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!result.success || !result.data) {
        setError(result.message || 'Login gagal');
        return;
      }

      localStorage.setItem("accessToken", result.data.token);
      localStorage.setItem("user", JSON.stringify({
        ...result.data.user,
        providerProfile: result.data.providerProfile
      }));

      try {
        void registerForPush().then((r) => console.log('[Login] registerForPush', r));
      } catch (e) {
        console.error('[Login] registerForPush error', e);
      }

      // Redirect based on role. Provider verification is handled inside provider pages.
      if (result.data.user.role === 'provider') {
        window.location.href = '/dashboard/provider';
      } else if (result.data.user.role === 'admin') {
        window.location.href = '/dashboard/admin';
      } else {
        window.location.href = '/dashboard/user';
      }
    } catch (submitError) {
      console.error('Login submit error:', submitError);
      setError('Terjadi kesalahan saat login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4 py-6 sm:py-12 relative">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="mb-6 self-start sm:absolute sm:top-8 sm:left-8 sm:mb-0 flex items-center gap-2 text-gray-600 hover:text-brand-green transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
          <p className="text-gray-500">Silakan masuk ke akun ACCESS-ABILITY Anda</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-3 mb-6">
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="flex items-center justify-center gap-3 w-full h-[48px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:opacity-80"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-gray-700">Login with Google</span>
          </button>
        </div>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-400">Atau Lanjutkan Dengan Email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
            <input 
              className="w-full h-[48px] px-4 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all" 
              id="email" 
              name="email" 
              placeholder="Masukkan email Anda" 
              required 
              type="email" 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
              <Link className="text-sm font-medium text-brand-green hover:underline" href="#">Forgot password?</Link>
            </div>
            <input 
              className="w-full h-[48px] px-4 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all" 
              id="password" 
              name="password" 
              placeholder="Masukkan password Anda" 
              required 
              type="password" 
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button 
            className="w-full h-[56px] bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-hover active:scale-[0.98] transition-all shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Belum punya akun? <Link className="text-brand-green font-bold hover:underline" href="/register">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
