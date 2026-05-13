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
    const userStr = localStorage.getItem("user");
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
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-600">
              Admin Profile
            </p>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                Profil Admin
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Kelola identitas akun admin dan keluar dari sesi login bila perlu.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali
          </button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-green-100 bg-green-50 text-4xl font-bold text-green-700">
            {user.image_url ? (
              <img src={user.image_url} alt={user.full_name} className="h-full w-full object-cover" />
            ) : (
              initials || 'A'
            )}
          </div>
          <h2 className="mt-5 text-2xl font-bold text-gray-900">{user.full_name}</h2>
          <p className="mt-1 break-all text-sm text-gray-500">{user.email}</p>
          <span className="mt-4 inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-bold capitalize text-green-700">
            {user.role}
          </span>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Nama lengkap</p>
              <p className="mt-2 text-base font-bold text-gray-900">{user.full_name}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Role</p>
              <p className="mt-2 text-base font-bold capitalize text-gray-900">{user.role}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 p-5 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
              <p className="mt-2 break-all text-base font-semibold text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
