"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUserBookings, Booking } from "@/api";

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const data = await getUserBookings(token);
        setBookings(data);
      }
      setIsLoading(false);
    };

    fetchBookings();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Selesai", color: "bg-green-100 text-green-700" };
      case "rejected":
        return { label: "Ditolak", color: "bg-red-100 text-red-700" };
      case "pending":
        return { label: "Pending", color: "bg-yellow-100 text-yellow-700" };
      case "accepted":
        return { label: "Diterima", color: "bg-blue-100 text-blue-700" };
      case "cancelled":
        return { label: "Dibatalkan", color: "bg-gray-100 text-gray-700" };
      default:
        return {
          label: status.charAt(0).toUpperCase() + status.slice(1),
          color: "bg-gray-100 text-gray-700",
        };
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="text-gray-500 font-medium">Memuat riwayat booking...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[70vh] space-y-8">
        <div className="relative">
          <div className="w-64 h-64 bg-green-50 rounded-full flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-green-600 text-8xl">
              calendar_today
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-4xl">
              search
            </span>
          </div>
        </div>
        <div className="text-center space-y-3 max-w-lg">
          <h2 className="text-3xl font-bold text-gray-900">
            Anda belum melakukan booking
          </h2>
          <p className="text-gray-500 text-lg">
            Mulai petualangan inklusif Anda dengan memesan pendamping profesional
            kami yang siap membantu kapan saja.
          </p>
        </div>
        <Link
          href="/dashboard/user/cari-provider"
          className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-600/30 flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Mulai Booking Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Riwayat Booking</h2>
            <p className="text-gray-500 mt-1">
              Kelola dan pantau status pemesanan layanan Anda
            </p>
          </div>
          <Link
            href="/dashboard/user/cari-provider"
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            Booking Baru
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row p-6 gap-6 group"
              >
                <div className="w-full md:w-64 h-40 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    alt={booking.provider?.full_name || "Provider"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={
                      booking.provider?.profile_image_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        booking.provider?.full_name || "P"
                      )}&background=008000&color=fff`
                    }
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-800 text-xl group-hover:text-green-600 transition-colors">
                        {booking.provider?.full_name || "Provider Name"}
                      </h3>
                    </div>
                    <p className="text-green-600 text-sm font-semibold mb-4 flex items-center gap-1">
                      {booking.service_type?.name || "Layanan Pendampingan"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="material-symbols-outlined text-base">
                          location_on
                        </span>
                        <span>
                          {booking.provider?.base_location_city ||
                            "Kota Tasikmalaya"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span className="material-symbols-outlined text-base">
                          work_history
                        </span>
                        <span>
                          {booking.provider?.years_experience
                            ? `Pengalaman ${booking.provider.years_experience} Tahun`
                            : "Pengalaman 3 - 5 Tahun"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span
                          className="material-symbols-outlined text-yellow-400 text-base"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-bold text-gray-900">
                          {booking.provider?.rating || "5.0"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-3 min-w-[160px]">
                  <span
                    className={`px-6 py-2 ${statusConfig.color} rounded-xl font-bold text-xs text-center`}
                  >
                    {statusConfig.label}
                  </span>
                  <button className="px-6 py-2 border-2 border-green-600/20 text-green-600 rounded-xl text-xs font-bold hover:bg-green-50 transition-all active:scale-95">
                    Detail
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
