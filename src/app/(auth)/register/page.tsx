import React from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-brand-green transition-colors font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
          <p className="text-gray-500">Daftar sekarang untuk mulai menggunakan layanan ACCESS-ABILITY.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="name">Nama Lengkap</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="name" 
              placeholder="Masukkan nama lengkap Anda" 
              type="text" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="email">Email</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="email" 
              placeholder="contoh@email.com" 
              type="email" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="password">Kata Sandi</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="password" 
              placeholder="••••••••" 
              type="password" 
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block" htmlFor="confirm-password">Konfirmasi Kata Sandi</label>
            <input 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" 
              id="confirm-password" 
              placeholder="••••••••" 
              type="password" 
              required
            />
          </div>
          <button className="w-full bg-brand-green hover:bg-brand-green-hover active:opacity-80 text-white font-bold py-4 rounded-lg transition-all shadow-md mt-4" type="submit">
            Buat Akun
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Sudah punya akun? 
            <Link className="text-brand-green font-bold hover:underline transition-all ml-1" href="/login">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
