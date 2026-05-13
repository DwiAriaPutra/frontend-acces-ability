"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== "admin") {
          console.warn("Access denied: User is not an admin");
          setUnauthorized(true);
          setIsLoading(false);
          setTimeout(() => router.push("/dashboard/user"), 1500);
          return;
        }
        if (user && user.full_name) {
          setUserName(user.full_name);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        setUnauthorized(true);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="text-gray-500 font-medium">Memuat admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-600 text-5xl">
            lock
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
        <p className="text-gray-600">Halaman admin hanya untuk pengguna dengan role admin.</p>
        <Link href="/dashboard/user" className="text-green-600 font-semibold">
          Kembali ke dashboard user
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <section className="space-y-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Selamat datang, {userName}. Kelola verifikasi provider dan sistem dari sini.
        </p>
      </section>

      {/* Admin Actions Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/verification">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <span className="material-symbols-outlined text-3xl">
                verified_user
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Verifikasi Provider
            </h2>
            <p className="text-gray-600 text-sm">
              Review dan verifikasi pending provider applications
            </p>
          </div>
        </Link>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm opacity-50 cursor-not-allowed">
          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mb-4">
            <span className="material-symbols-outlined text-3xl">
              people_management
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Manajemen Pengguna
          </h2>
          <p className="text-gray-600 text-sm">Coming soon...</p>
        </div>
      </section>
    </div>
  );
}
