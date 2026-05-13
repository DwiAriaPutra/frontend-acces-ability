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
    const userStr = localStorage.getItem("user");

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
        <p className="text-gray-600">
          Halaman admin hanya untuk pengguna dengan role admin.
        </p>
        <Link href="/dashboard/user" className="text-green-600 font-semibold">
          Kembali ke dashboard user
        </Link>
      </div>
    );
  }

  const adminActions = [
    {
      title: "Verifikasi Provider",
      description: "Tinjau profil, sertifikat, dan status pendaftaran provider.",
      href: "/dashboard/admin/verification",
      icon: "verified_user",
      active: true,
    },
    {
      title: "Manajemen Pengguna",
      description: "Kelola pengguna dan akses platform.",
      href: "",
      icon: "groups",
      active: false,
    },
  ];

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-green-600">
              Admin Console
            </p>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                Selamat datang, {userName}. Kelola verifikasi provider dan pantau
                area administrasi dari satu tempat.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/admin/verification"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95 sm:w-auto"
          >
            <span className="material-symbols-outlined text-lg">fact_check</span>
            Buka Verifikasi
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Area Aktif", value: "1", icon: "dashboard", tone: "green" },
          { label: "Akses", value: "Admin", icon: "admin_panel_settings", tone: "blue" },
          { label: "Status", value: "Aktif", icon: "verified", tone: "emerald" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-green-600">
                <span className="material-symbols-outlined text-2xl">{item.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {adminActions.map((action) =>
          action.active ? (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-green-100 hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                  <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{action.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{action.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-green-600">
                    Kelola sekarang
                    <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={action.title}
              className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4 opacity-70">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{action.title}</h2>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
                      Segera hadir
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{action.description}</p>
                </div>
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}
