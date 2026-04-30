"use client";

/*
Tujuan: Halaman riwayat booking user untuk menampilkan daftar booking terbaru dan navigasi ke detail booking.
Caller: Menu dashboard user.
Dependensi: API booking list, Next Link.
Main Functions: BookingPage.
*/

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getUserBookings, Booking } from "@/api";

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value: string) => value?.slice(0, 5) || "--:--";

const formatCurrency = (value?: number | string | null) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return {
        label: "Selesai",
        color: "bg-green-100 text-green-700",
        borderColor: "border-green-200",
        shadowColor: "shadow-green-600/20",
        bgAccent: "bg-green-50",
      };
    case "pending":
      return {
        label: "Menunggu",
        color: "bg-yellow-100 text-yellow-700",
        borderColor: "border-yellow-200",
        shadowColor: "shadow-yellow-600/20",
        bgAccent: "bg-yellow-50",
      };
    case "accepted":
      return {
        label: "Diterima",
        color: "bg-blue-100 text-blue-700",
        borderColor: "border-blue-200",
        shadowColor: "shadow-blue-600/20",
        bgAccent: "bg-blue-50",
      };
    case "cancelled":
      return {
        label: "Dibatalkan",
        color: "bg-gray-100 text-gray-700",
        borderColor: "border-gray-200",
        shadowColor: "shadow-gray-600/20",
        bgAccent: "bg-gray-50",
      };
    case "rejected":
      return {
        label: "Ditolak",
        color: "bg-red-100 text-red-700",
        borderColor: "border-red-200",
        shadowColor: "shadow-red-600/20",
        bgAccent: "bg-red-50",
      };
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        color: "bg-gray-100 text-gray-700",
        borderColor: "border-gray-200",
        shadowColor: "shadow-gray-600/20",
        bgAccent: "bg-gray-50",
      };
  }
};

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      const data = await getUserBookings(token);
      setBookings(data);
      setIsLoading(false);
    };

    fetchBookings();
  }, []);

  const emptyState = useMemo(
    () =>
      isLoggedIn ? (
        <>
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
        </>
      ) : (
        <>
          <div className="w-64 h-64 bg-green-50 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-8xl">
              lock
            </span>
          </div>
          <div className="text-center space-y-3 max-w-lg">
            <h2 className="text-3xl font-bold text-gray-900">
              Login dulu untuk melihat riwayat booking
            </h2>
            <p className="text-gray-500 text-lg">
              Data booking milik akun yang sedang login akan tampil di halaman ini.
            </p>
          </div>
          <Link
            href="/login"
            className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold text-lg hover:bg-green-700 transition-all active:scale-95 shadow-xl shadow-green-600/30 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">login</span>
            Ke Halaman Login
          </Link>
        </>
      ),
    [isLoggedIn]
  );

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="text-gray-500 font-medium">Memuat riwayat booking...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 max-w-[1400px] mx-auto flex flex-col items-center justify-center min-h-[70vh] space-y-8">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <section>
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
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
            const mapsUrl =
              booking.location_lat !== undefined &&
              booking.location_lat !== null &&
              booking.location_lng !== undefined &&
              booking.location_lng !== null
                ? `https://www.google.com/maps?q=${booking.location_lat},${booking.location_lng}`
                : null;
            const bookingLabel = booking.booking_code || booking.id.slice(0, 8);
            const serviceLabel =
              booking.service_type?.name ||
              (booking.service_type_id ? `Layanan #${booking.service_type_id}` : "Layanan");
            const summaryDate = booking.booking_date
              ? formatDate(booking.booking_date)
              : "Tanggal belum tersedia";
            const summaryTime = `${formatTime(booking.start_time)} - ${formatTime(
              booking.end_time
            )}`;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-3xl overflow-hidden border ${statusConfig.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row p-6 gap-6 group`}
              >
                <div className={`w-full md:w-64 h-40 rounded-2xl overflow-hidden flex-shrink-0 ${statusConfig.bgAccent} flex items-center justify-center border ${statusConfig.borderColor}`}>
                  {(() => {
                    const avatar =
                      booking.provider?.profile_image_url ||
                      booking.provider?.image_url ||
                      null;

                    if (avatar) {
                      return (
                        <img
                          src={avatar}
                          alt={booking.provider?.full_name || "provider"}
                          className="h-40 w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                booking.provider?.full_name || "Provider"
                              )}&background=008000&color=fff`;
                          }}
                        />
                      );
                    }

                    return (
                      <div className="flex items-center justify-center w-full h-full">
                        <span className="material-symbols-outlined text-green-600 text-7xl">
                          event_available
                        </span>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div>
                        <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                          {bookingLabel}
                        </p>
                        <h3 className="font-bold text-gray-800 text-xl group-hover:text-green-600 transition-colors">
                          {serviceLabel}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {booking.provider?.full_name || "Provider"}
                        </p>
                      </div>
                      <span className="text-xs rounded-full bg-gray-100 px-3 py-1 font-bold text-gray-500">
                        {booking.service_type?.name || `#${booking.service_type_id}`}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-gray-400">
                          schedule
                        </span>
                        <span>{summaryDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-gray-400">
                          access_time
                        </span>
                        <span>{summaryTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-gray-400">
                          payments
                        </span>
                        <span>{formatCurrency(booking.price_estimate || booking.total_price)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-gray-400">
                          confirmation_number
                        </span>
                        <span className="font-medium text-gray-500">ID {booking.id.slice(0, 8)}</span>
                      </div>
                    </div>

                    {mapsUrl ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-green-600 text-sm font-semibold hover:text-green-700 mt-4"
                      >
                        <span className="material-symbols-outlined text-base">map</span>
                        Lihat lokasi di maps
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-3 min-w-[180px]">
                  <span
                    className={`px-6 py-2 ${statusConfig.color} rounded-xl font-bold text-xs text-center`}
                  >
                    {statusConfig.label}
                  </span>
                  <Link
                    href={`/dashboard/user/booking/${booking.id}`}
                    className="px-6 py-2 border-2 border-green-600/20 text-green-600 rounded-xl text-xs font-bold hover:bg-green-50 transition-all active:scale-95 text-center"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
