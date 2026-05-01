"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          setUserName(user.full_name);

          // Generate initials
          const names = user.full_name.split(" ");
          const initials = names
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
          setUserInitials(initials);
        }
        if (user && user.role) {
          setUserRole(user.role);
        }
        if (user && user.image_url) {
          setUserImage(user.image_url);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  const userMenuItems = [
    { name: "Dashboard", icon: "dashboard", href: "/dashboard/user" },
    {
      name: "Cari Provider",
      icon: "search",
      href: "/dashboard/user/cari-provider",
    },
    {
      name: " Riwayat Booking",
      icon: "event_available",
      href: "/dashboard/user/booking",
    },
    { name: "Profile", icon: "person", href: "/dashboard/user/profil" },
  ];

  const providerMenuItems = [
    { name: "Dashboard", icon: "dashboard", href: "/dashboard/provider" },
    {
      name: "Permintaan Booking",
      icon: "calendar_today",
      href: "/dashboard/provider/permintaan-booking",
    },
    { name: "Profile", icon: "person", href: "/dashboard/provider/profil" },
  ];

  const adminMenuItems = [
    { name: "Dashboard", icon: "dashboard", href: "/dashboard/admin" },
    {
      name: "Verifikasi Provider",
      icon: "verified_user",
      href: "/dashboard/admin/verification",
    },
  ];

  let menuItems = userMenuItems;
  if (userRole === "provider") {
    menuItems = providerMenuItems;
  } else if (userRole === "admin") {
    menuItems = adminMenuItems;
  }

  useEffect(() => {
    // If user role is known, ensure they're on the correct dashboard path
    if (!userRole || !pathname) return;

    // If provider but on user/admin routes, redirect to provider dashboard
    if (userRole === "provider" && (pathname.startsWith("/dashboard/user") || pathname.startsWith("/dashboard/admin"))) {
      router.replace("/dashboard/provider");
      return;
    }

    // If admin but on user/provider routes, redirect to admin dashboard
    if (userRole === "admin" && (pathname.startsWith("/dashboard/user") || pathname.startsWith("/dashboard/provider"))) {
      router.replace("/dashboard/admin");
      return;
    }

    // If non-admin non-provider but on provider/admin routes, redirect to user dashboard
    if (userRole !== "provider" && userRole !== "admin" && (pathname.startsWith("/dashboard/provider") || pathname.startsWith("/dashboard/admin"))) {
      router.replace("/dashboard/user");
      return;
    }
  }, [userRole, pathname, router]);

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1b1c1c] font-sans">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
        }
      `,
        }}
      />
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 hidden md:flex flex-col z-40 h-screen w-64 border-r border-gray-200 bg-white antialiased">
          <div className="px-6 py-8">
            <Link href="/">
              <h1 className="text-xl font-bold tracking-tight text-green-600 uppercase">
                ACCESS-ABILITY
              </h1>
            </Link>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
              Empathetic Modernism
            </p>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-green-600 font-semibold border-r-4 border-green-600 bg-green-50/50"
                      : "text-gray-500 hover:text-green-600 hover:bg-gray-50"
                  }`}
                  href={item.href}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs text-green-800 leading-relaxed">
                Akses untuk Semua - Membantu menciptakan akses yang setara untuk
                semua melalui layanan yang inklusif.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64">
          <header className="sticky top-0 z-30 flex items-center justify-end px-6 w-full h-16 bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-gray-400 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 cursor-pointer">
                  notifications
                </span>
                <span className="material-symbols-outlined text-gray-400 hover:bg-gray-100 rounded-full p-2 transition-all duration-200 cursor-pointer">
                  help_outline
                </span>
              </div>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="font-bold text-gray-900">{userName}</p>
                  <div className="flex items-center justify-end gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-500">Aktif</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
              </div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </div>
      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-700 transition-all z-50">
        <span className="material-symbols-outlined text-3xl">
          support_agent
        </span>
      </button>
    </div>
  );
}
