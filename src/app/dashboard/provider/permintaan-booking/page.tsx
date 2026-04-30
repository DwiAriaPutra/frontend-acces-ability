/*
Header: Permintaan Booking Page
Tujuan: Menampilkan daftar semua permintaan booking untuk provider dengan fitur filter dan desain yang disempurnakan.
Caller: Route /dashboard/provider/permintaan-booking.
Dependensi: @/api (getUserBookings), localStorage token.
*/

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Booking, getUserBookings } from "@/api";

export default function PermintaanBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("Semua");

  const filters = ["Semua", "Baru", "Minggu Ini"];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getUserBookings(token);
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRequests = bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;
  const acceptedRequests = bookings.filter((b) => b.status === "accepted").length;
  const completedRequests = bookings.filter((b) => b.status === "completed").length;

  const filteredBookings = useMemo(() => {
    if (activeFilter === "Semua") return bookings;
    
    // In a real app, "Baru" might filter by date (e.g., last 24h)
    // "Minggu Ini" might filter by current week.
    // For now, let's keep all for these filters or implement simple logic if needed.
    return bookings;
  }, [bookings, activeFilter]);

  const formatBookingDate = (dateValue?: string) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return "Hari ini";
    if (date.toDateString() === tomorrow.toDateString()) return "Besok, " + new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return { label: "Selesai", className: "bg-green-50 text-green-700 border-green-100" };
      case "pending":
        return { label: "Menunggu", className: "bg-orange-50 text-orange-600 border-orange-100" };
      case "accepted":
        return { label: "Diterima", className: "bg-green-50 text-green-700 border-green-100" };
      case "rejected":
        return { label: "Ditolak", className: "bg-red-50 text-red-600 border-red-100" };
      case "cancelled":
        return { label: "Dibatalkan", className: "bg-gray-50 text-gray-700 border-gray-100" };
      default:
        return { label: status, className: "bg-gray-50 text-gray-700 border-gray-100" };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Permintaan Booking
          </h2>
          <p className="text-gray-500">
            Kelola jadwal dan konfirmasi permintaan layanan terbaru dari klien Anda.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Ekspor PDF
          </button>
        </div>
      </div>

      {/* Stats Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Permintaan
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{isLoading ? "..." : totalRequests}</span>
            <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined">inbox</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Menunggu
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{isLoading ? "..." : pendingRequests}</span>
            <div className="w-10 h-10 bg-orange-100 text-orange-600 flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Diterima
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-600">{isLoading ? "..." : acceptedRequests}</span>
            <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Selesai
          </span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{isLoading ? "..." : completedRequests}</span>
            <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-lg">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Requests Table Container */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Daftar Antrean</h3>
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeFilter === filter
                    ? "bg-green-100 text-green-700"
                    : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Klien
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Layanan
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tanggal & Waktu
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Belum ada permintaan booking.</td>
                </tr>
              ) : (
                filteredBookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const clientName = booking.user_id ? `Klien #${booking.user_id.substring(0, 5)}` : "Klien";
                  const initials = clientName.substring(0, 1).toUpperCase();

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {clientName}
                            </p>
                            <p className="text-xs text-gray-500">ID: #{booking.id.substring(0, 8).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {booking.service_type?.name || "Layanan"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">location_on</span>
                            Kunjungan Rumah
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {formatBookingDate(booking.booking_date)}
                          </span>
                          <span className="text-xs text-green-600 font-bold">
                            {booking.start_time} - {booking.end_time} WIB
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === "pending" ? (
                            <>
                              <button className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-green-700 transition-all active:scale-95 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">check</span>
                                Terima
                              </button>
                              <button className="px-4 py-2 bg-white border-2 border-red-500 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">close</span>
                                Tolak
                              </button>
                            </>
                          ) : (
                            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                              <span className="material-symbols-outlined">more_vert</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredBookings.length > 0 && (
          <div className="p-6 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Menampilkan {filteredBookings.length} permintaan
            </p>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips / Guidance Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex-shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-white">lightbulb</span>
          </div>
          <div>
            <h4 className="font-bold text-blue-900 mb-1">
              Tips Konfirmasi Cepat
            </h4>
            <p className="text-sm text-blue-800/80 leading-relaxed">
              Menerima permintaan dalam waktu kurang dari 30 menit dapat
              meningkatkan visibilitas profil Anda sebesar 25% di mata klien
              potensial.
            </p>
          </div>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex gap-4">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex-shrink-0 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield_with_heart
            </span>
          </div>
          <div>
            <h4 className="font-bold text-green-900 mb-1">
              Keamanan Data Klien
            </h4>
            <p className="text-sm text-green-800/80 leading-relaxed">
              Selalu jaga kerahasiaan data rekam medis klien. Hubungi dukungan
              jika Anda menemukan kejanggalan pada detail permintaan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
