/*
Header: User Dashboard Page
Tujuan: Menampilkan ringkasan dashboard user berbasis data booking real-time dari backend.
Caller: Route /dashboard/user.
Dependensi: @/api (getUserBookings), localStorage token/user.
Status: Active.
*/

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Booking, getUserBookings } from "@/api";

export default function UserDashboardPage() {
  const [userName, setUserName] = useState("User");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

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

    const fetchBookings = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoadingBookings(false);
        return;
      }

      const data = await getUserBookings(token);
      setBookings(data);
      setIsLoadingBookings(false);
    };

    fetchBookings();
  }, []);

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((booking) =>
    ["pending", "accepted"].includes(booking.status)
  ).length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;
  const recentBookings = bookings.slice(0, 5);

  const formatBookingDate = (dateValue?: string) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return { label: "Selesai", className: "bg-green-100 text-green-700" };
      case "pending":
        return { label: "Pending", className: "bg-yellow-100 text-yellow-700" };
      case "accepted":
        return { label: "Diterima", className: "bg-blue-100 text-blue-700" };
      case "rejected":
        return { label: "Ditolak", className: "bg-red-100 text-red-700" };
      case "cancelled":
        return { label: "Dibatalkan", className: "bg-gray-100 text-gray-700" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-700" };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 lg:space-y-8">
      {/* Main Banner */}
      <section className="relative overflow-hidden bg-green-600 rounded-3xl p-6 sm:p-8 lg:p-12 min-h-[280px] lg:min-h-[320px] flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            alt="Group of diverse professionals"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJOHmTcZpd1yU1_nrRvKXSyHxFPlzl4gQSsm6iNbxAwgkJ5-NVeLs9UZOVUvEOxpyv0OK_DFVWoIJBFu-AEkDtlQlheNZaP8d1XsvUMrjepDH0l1J8hsbdw0-yBgD-C5-vlu-zIaCGtoEIoio4PZ5c9YBlB29vDdmTqhC00FUGFLA5Q2rgBT766tVJMaQQlCAkgcCA9iekFKQDYC_RQn7D7OqnrV1RzuqCfmF4I2OzxXOndBBSdgxZz_HjHsPQeIjONV_M15J4qxU"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-white text-3xl lg:text-4xl font-bold mb-4">
            Selamat datang, {userName}
          </h2>
          <p className="text-green-50 text-base lg:text-lg mb-8 opacity-90">
            Kami menghubungkan Anda dengan penyedia layanan profesional yang
            siap membantu memenuhi kebutuhan spesifik Anda dengan empati dan
            keahlian.
          </p>
          <div className="flex gap-4">
            <Link
              href="/dashboard/user/cari-provider"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg shadow-black/5 text-center"
            >
              Mulai Cari Provider
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-3xl">list_alt</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Layanan</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {isLoadingBookings ? "-" : totalBookings}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
            <span className="material-symbols-outlined text-3xl">
              pending_actions
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Layanan Aktif</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {isLoadingBookings ? "-" : activeBookings}
            </h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-3xl">task_alt</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Layanan selesai</p>
            <h3 className="text-3xl font-bold text-gray-900">
              {isLoadingBookings ? "-" : completedBookings}
            </h3>
          </div>
        </div>
      </section>

      {/* Kategori Layanan Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Kategori Layanan</h2>
          <a className="text-green-600 font-semibold hover:underline" href="#">
            Lihat Semua
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category Card 1 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              record_voice_over
            </span>
            <h4 className="text-xl font-bold">Komunikasi</h4>
            <p className="text-sm text-green-100 opacity-80">
              Layanan penerjemah bahasa isyarat dan dukungan komunikasi verbal.
            </p>
          </div>
          {/* Category Card 2 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              diversity_3
            </span>
            <h4 className="text-xl font-bold">Pendampingan</h4>
            <p className="text-sm text-green-100 opacity-80">
              Dukungan aktivitas harian dan pendampingan di area publik.
            </p>
          </div>
          {/* Category Card 3 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              accessible
            </span>
            <h4 className="text-xl font-bold">Mobilitas</h4>
            <p className="text-sm text-green-100 opacity-80">
              Transportasi ramah disabilitas dan bantuan mobilitas fisik.
            </p>
          </div>
          {/* Category Card 4 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              psychology
            </span>
            <h4 className="text-xl font-bold">Edukasi Dan Terapi</h4>
            <p className="text-sm text-green-100 opacity-80">
              Program pelatihan khusus dan sesi terapi berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Layanan</h2>
          <span className="material-symbols-outlined text-gray-400 cursor-pointer">
            more_horiz
          </span>
        </div>
        <div className="overflow-x-auto md:overflow-visible">
          <table className="responsive-data-table w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-semibold">
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingBookings ? (
                <tr>
                  <td className="px-6 py-8 text-gray-500 text-sm" colSpan={4}>
                    Memuat data booking...
                  </td>
                </tr>
              ) : recentBookings.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-gray-500 text-sm" colSpan={4}>
                    Belum ada riwayat layanan.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => {
                  const providerName =
                    booking.provider?.full_name || "Provider";
                  const initials = providerName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const statusBadge = getStatusBadge(booking.status);

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-5" data-label="Provider">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {initials || "PR"}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {providerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-600 text-sm" data-label="Layanan">
                        {booking.service_type?.name || "Layanan Pendampingan"}
                      </td>
                      <td className="px-6 py-5 text-gray-600 text-sm" data-label="Tanggal">
                        {formatBookingDate(booking.booking_date)}
                      </td>
                      <td className="px-6 py-5" data-label="Status">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <Link
            href="/dashboard/user/booking"
            className="text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Lihat semua riwayat booking
          </Link>
        </div>
      </section>
    </div>
  );
}
