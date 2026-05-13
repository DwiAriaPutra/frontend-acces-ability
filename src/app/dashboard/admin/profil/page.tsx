/*
Header: Admin Profile Page
Tujuan: Menyediakan halaman profil sederhana untuk admin dan akses logout.
Caller: Sidebar admin dashboard dan top-right account menu.
Dependensi: localStorage, auth API logout.
Status: Active.
*/

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/api';

type AdminUser = {
  full_name: string;
  email: string;
  role: string;
  image_url?: string | null;
};

export default function AdminProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = JSON.parse(userStr) as AdminUser;
      if (parsed.role !== 'admin') {
        router.replace('/dashboard/user');
        return;
      }
      setUser(parsed);
    } catch (error) {
      console.error('Failed to parse admin profile data', error);
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/');
    }
  };

  if (!user) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="text-gray-500 font-medium">Memuat profil admin...</p>
        </div>
      </div>
    );
  }

  const initials = user.full_name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-600">Admin Profile</p>
        <h1 className="text-4xl font-bold text-gray-900">Profil Admin</h1>
        <p className="text-gray-600">Kelola identitas akun admin dan keluar dari sesi login bila perlu.</p>
      </section>

      <section className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center overflow-hidden text-green-700 font-bold text-4xl">
          {user.image_url ? (
            <img src={user.image_url} alt={user.full_name} className="w-full h-full object-cover" />
          ) : (
            initials || 'A'
          )}
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div>
            <p className="text-sm text-gray-500 mb-1">Nama lengkap</p>
            <p className="text-xl font-semibold text-gray-900">{user.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-base text-gray-700">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Role</p>
            <p className="inline-flex px-3 py-1 rounded-full bg-green-50 text-green-700 font-semibold text-sm capitalize">{user.role}</p>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}