/*
Tujuan: Form registrasi user biasa (non-provider).
Caller: User baru dari landing page.
Dependensi: Backend /api/v1/auth/register, API layer registerUser
Main Functions: Form submission, validation, error handling.
Side Effects: Submit registration data ke backend dengan JSON, store JWT token.
*/

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { registerUser, RegisterUserPayload } from '@/api';

interface FormData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    // Check full name
    if (!formData.full_name.trim()) {
      setError('Nama lengkap harus diisi');
      return false;
    }
    if (formData.full_name.length < 3 || formData.full_name.length > 120) {
      setError('Nama harus 3-120 karakter');
      return false;
    }

    // Check email
    if (!formData.email.trim()) {
      setError('Email harus diisi');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email tidak valid');
      return false;
    }

    // Check password
    if (!formData.password.trim()) {
      setError('Password harus diisi');
      return false;
    }
    if (formData.password.length < 8 || formData.password.length > 72) {
      setError('Password harus 8-72 karakter');
      return false;
    }

    // Check confirm password
    if (!formData.confirm_password.trim()) {
      setError('Konfirmasi password harus diisi');
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Password dan konfirmasi password tidak cocok');
      return false;
    }

    // Check phone number (optional but must be valid if provided)
    if (formData.phone_number && (formData.phone_number.length < 8 || formData.phone_number.length > 30)) {
      setError('Nomor telepon harus 8-30 karakter');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Build payload untuk API
      const payload: RegisterUserPayload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number || undefined,
      };

      // Call API
      const result = await registerUser(payload);

      if (!result.success) {
        setError(result.message || 'Registrasi gagal');
        return;
      }

      // Success
      setSuccess(true);
      setFormData({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        phone_number: '',
      });

      // Store token
      if (result.data?.token) {
        sessionStorage.setItem("accessToken", result.data.token);
      }
      if (result.data?.user) {
        sessionStorage.setItem("user", JSON.stringify(result.data.user));
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('[Component Error] handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-gray-500">Daftar sekarang untuk mulai menggunakan layanan ACCESS-ABILITY.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 font-medium text-sm flex-1">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 font-medium text-sm flex-1">Registrasi berhasil! Mengalihkan...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="full_name">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="full_name"
              name="full_name"
              placeholder="Masukkan nama lengkap Anda" 
              type="text" 
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="email"
              name="email"
              placeholder="contoh@email.com" 
              type="email" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="password">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="password"
              name="password"
              placeholder="Min. 8 karakter" 
              type="password" 
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-gray-500">Minimal 8 karakter untuk keamanan</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="confirm_password">
              Konfirmasi Kata Sandi <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="confirm_password"
              name="confirm_password"
              placeholder="••••••••" 
              type="password" 
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="phone_number">
              Nomor Telepon (Opsional)
            </label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="phone_number"
              name="phone_number"
              placeholder="08xx..." 
              type="tel" 
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>

          <button 
            className="w-full bg-brand-green hover:bg-green-600 disabled:bg-gray-400 active:opacity-80 text-white font-bold py-4 rounded-lg transition-all shadow-md mt-4" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Mendaftar...' : 'Buat Akun'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Sudah punya akun? 
            <Link className="text-brand-green font-bold hover:underline transition-all ml-1" href="/login">
              Masuk
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Atau daftar sebagai{' '}
            <Link href="/register-provider" className="text-brand-green font-bold hover:underline">
              provider
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
