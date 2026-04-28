import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
          <p className="text-gray-500">Silakan masuk ke akun ACCESS-ABILITY Anda</p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 mb-6">
          <button className="flex items-center justify-center gap-3 w-full h-[48px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:opacity-80">
            <img alt="Apple logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpwNJe4VUhW8QDyJhsffJdJQPYGkR92qMWDOSNCItZUeYazHNXmJ8QT4cCrJPbGZNEShbdIqMykbV1Eeupp3jOVs40Dabu0-zyxf8LuTKz9rHCDQlZlTh-Sqe6tBQWWwTWAKX2IJFln0K5yBfSk4bvNZH7TLr1dBLyoC9pI_BlVw6I0V1poFKOHPOGOcfIpB2AzeqNVMpxRqLZJHReaS6IXMvt3VQIVLWSzj6XRM6nzB9avnMbPGpy7ibWnFolrScYcTJJa6BwO-c" />
            <span className="font-semibold text-gray-700">Login with Apple</span>
          </button>
          <button className="flex items-center justify-center gap-3 w-full h-[48px] border border-gray-300 rounded-lg hover:bg-gray-50 transition-all active:opacity-80">
            <img alt="Google logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5xgRdt7yZu9AHxv-KbSw_yzb6tBDT-46pq92_yU5GzN8eYdEIwyeKbHK-mHNCHVG8m4vo108mt1Ug8fkC7wKSYgntK-R0x2KFsqCG9uuNwCpFLREH3U2poz1pXa63zsrZF7vo9-RIMYxgacj94lv1UgvdLITrpXj4KEErPsG1gpAVOpvkQA9TGq_ZInwF-UBRgr-6HtAJ8tRfJOS2podv-adLPbx6VVKu7TmK903WZ_BQQ8PI_lafzSkmPQpYkfOAx28f2xRA3aQ" />
            <span className="font-semibold text-gray-700">Login with Google</span>
          </button>
        </div>

        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-sm text-gray-400">Atau Lanjutkan Dengan</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
            <input 
              className="w-full h-[48px] px-4 rounded-lg border border-gray-300 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none transition-all" 
              id="email" 
              name="email" 
              placeholder="Masukkan email Anda" 
              required 
              type="email" 
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
            />
          </div>
          <button className="w-full h-[56px] bg-brand-green text-white font-bold rounded-lg hover:bg-brand-green-hover active:scale-[0.98] transition-all shadow-sm mt-2" type="submit">
            Masuk
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Belum punya akun? <Link className="text-brand-green font-bold hover:underline" href="/register">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
