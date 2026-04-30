/*
Header: Provider Dashboard Page
Tujuan: Menampilkan ringkasan dashboard provider (statistik dan permintaan terbaru) dengan desain yang disempurnakan.
Caller: Route /dashboard/provider.
Dependensi: @/api (getUserBookings, getProviderDetail), localStorage token/user.
*/

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Booking, getUserBookings, getProviderDetail, Provider } from "@/api";

export default function ProviderDashboardPage() {
  const [userName, setUserName] = useState("Provider");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providerProfile, setProviderProfile] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          setUserName(user.full_name);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }

    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const bookingsData = await getUserBookings(token);
        setBookings(bookingsData);

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.providerProfile?.id) {
          const profile = await getProviderDetail(user.providerProfile.id);
          setProviderProfile(profile);
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const acceptedBookings = bookings.filter((b) => b.status === "accepted").length;
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const completedCount = completedBookings.length;

  const totalEarnings = completedBookings.reduce((sum, b) => {
    const price = typeof b.total_price === "string" ? parseFloat(b.total_price) : b.total_price;
    return sum + (price || 0);
  }, 0);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeAgo = (dateValue?: string) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  return (
    <section className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner Section */}
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/70 to-transparent z-10"></div>
        <img
          alt="Healthcare Background"
          className="absolute inset-0 w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7rfahyaaauh3t3QtQhB7d_S8ufWwtB-O7pPdKP2wNDc8_TVBafADfR9crUfHeU6FY2OUdC69gdBQJaypbklpCJdNiyujPIOXtOIss8equO535zC_3ILf21KVAf5NmRjH01esGaTmHwHAbGF3lgnQ1tNtkh16KgSKgXlYuFnSUzt1psMeqMgvNYEtx_01boAoh11VndLcPGTHqgWeTUhlqp9VgNB1d-CNeF2FZC_iLqya-rsGkX08ByS0WoD7uKpLFPNuraVbERzw"
        />
        <div className="relative z-20 h-full flex flex-col justify-center px-12 text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full w-fit mb-4 border border-white/30">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              Terverifikasi
            </span>
          </div>
          <h2 className="text-4xl font-bold mb-2">
            Selamat Datang Kembali, {userName.split(" ")[0]}
          </h2>
          <p className="text-white/80 max-w-md text-lg">
            Pantau jadwal harian Anda dan berikan perawatan terbaik untuk pasien
            hari ini.
          </p>
        </div>
      </div>

      {/* Statistics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {/* Total Booking */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-gray-500 text-sm font-medium">Total Booking</span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-black text-gray-900">
              {isLoading ? "..." : totalBookings}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <span className="material-symbols-outlined">book_online</span>
            </div>
          </div>
        </div>
        {/* Menunggu */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-gray-500 text-sm font-medium">Menunggu</span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-black text-amber-600">
              {isLoading ? "..." : pendingBookings}
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
        </div>
        {/* Diterima */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-gray-500 text-sm font-medium">Diterima</span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-black text-green-600">
              {isLoading ? "..." : acceptedBookings}
            </span>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </div>
        {/* Selesai */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <span className="text-gray-500 text-sm font-medium">Selesai</span>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-3xl font-black text-gray-400">
              {isLoading ? "..." : completedCount}
            </span>
            <div className="p-2 bg-gray-50 text-gray-400 rounded-lg">
              <span className="material-symbols-outlined">task_alt</span>
            </div>
          </div>
        </div>
        {/* Total Pendapatan */}
        <div className="bg-green-600 p-6 rounded-2xl shadow-md flex flex-col justify-between text-white col-span-1 md:col-span-2">
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium opacity-90">Total Pendapatan</span>
            <span className="material-symbols-outlined opacity-80">payments</span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium opacity-80">Total Akumulasi</span>
            <h3 className="text-3xl font-black tracking-tight mt-1">
              {isLoading ? "..." : formatCurrency(totalEarnings)}
            </h3>
          </div>
        </div>
      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Rating Provider</h3>
            <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center py-4">
            <div className="text-6xl font-black text-gray-900 mb-2">
              {providerProfile?.avg_rating || "5.0"}
              <span className="text-2xl text-gray-400 font-medium"> / 5.0</span>
            </div>
            <div className="flex gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-amber-400 text-3xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {star <= Math.floor(providerProfile?.avg_rating || 5)
                    ? "star"
                    : "star_outline"}
                </span>
              ))}
            </div>
            <p className="text-gray-500 text-sm text-center">
              Berdasarkan ulasan dari pasien terverifikasi.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-4">5</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[92%]"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-4">4</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[6%]"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 w-4">3</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[2%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Permintaan Booking Terbaru Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Permintaan Booking Terbaru
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Kelola antrean pasien terbaru Anda di sini.
              </p>
            </div>
            <Link
              className="text-green-700 font-bold text-sm hover:underline flex items-center gap-1"
              href="/dashboard/provider/permintaan-booking"
            >
              Lihat Semua
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
          <div className="flex-1 p-8">
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <p className="text-gray-500">Memuat data...</p>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                  <span className="material-symbols-outlined text-5xl mb-3">
                    inbox
                  </span>
                  <p className="text-sm font-medium">
                    Belum ada antrean tambahan lainnya.
                  </p>
                  <p className="text-xs">
                    Segera periksa tab Permintaan Booking untuk detail lengkap.
                  </p>
                </div>
              ) : (
                recentBookings.map((booking) => {
                  const initials = booking.id.substring(0, 2).toUpperCase();
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white flex items-center justify-center text-green-700 font-bold shadow-sm">
                          {initials}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">
                            Booking #{booking.id.substring(0, 8).toUpperCase()}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px]">
                              history
                            </span>
                            {getTimeAgo(booking.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                            booking.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : booking.status === "accepted"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                        <p className="text-sm font-semibold text-gray-700">
                          {booking.service_type?.name || "Layanan"}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Support/Action Banner */}
      <div className="bg-blue-50 border border-blue-100 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-blue-600 text-3xl">
              support_agent
            </span>
          </div>
          <div>
            <h4 className="text-xl font-bold text-blue-900">
              Butuh Bantuan Teknis?
            </h4>
            <p className="text-blue-800/70">
              Tim dukungan kami tersedia 24/7 untuk membantu operasional Anda.
            </p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
          Hubungi Support
        </button>
      </div>
    </section>
  );
}
