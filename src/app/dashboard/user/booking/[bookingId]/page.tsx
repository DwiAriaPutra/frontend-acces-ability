"use client";

/*
Tujuan: Halaman detail booking untuk menampilkan informasi lengkap booking, lokasi, dan status history.
Caller: Tombol Detail dari halaman riwayat booking.
Dependensi: API booking detail/history, Next router.
Main Functions: BookingDetailPage.
*/

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  BookingDetail,
  BookingStatusHistoryItem,
  getBookingDetail,
  getBookingHistory,
  cancelBooking,
} from "@/api";
import ReviewForm from "@/components/ReviewForm";
import { showAppNotification } from "@/utils/notifications";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (value?: string | null) => (value ? value.slice(0, 5) : "--:--");

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (value?: number | string | null) => {
  const numericValue = Number(value || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const formatCoordinate = (value?: number | string | null) => {
  if (value === undefined || value === null) return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return numeric.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
};

const formatDuration = (value?: number | string | null) => {
  if (value === undefined || value === null) return "-";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return String(value);
  return `${numeric.toFixed(2)} jam`;
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

export default function BookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const bookingId = params?.bookingId || "";

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [histories, setHistories] = useState<BookingStatusHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  useEffect(() => {
    const fetchBooking = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      if (!bookingId) {
        setIsLoading(false);
        return;
      }

      const [detail, history] = await Promise.all([
        getBookingDetail(token, bookingId),
        getBookingHistory(token, bookingId),
      ]);

      setBooking(detail);
      setHistories(history);
      setIsLoading(false);
    };

    fetchBooking();
  }, [bookingId]);

  const bookingCode = useMemo(
    () => booking?.booking_code || booking?.id?.slice(0, 8) || "Booking",
    [booking]
  );

  const providerName = useMemo(
    () =>
      booking?.provider?.full_name ||
      booking?.providerProfile?.user?.full_name ||
      booking?.providerProfile?.user?.email ||
      "Provider",
    [booking]
  );

  const providerImage = useMemo(
    () => {
      return (
        booking?.provider?.profile_image_url ||
        booking?.provider?.image_url ||
        booking?.providerProfile?.user?.image_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=008000&color=fff`
      );
    },
    [booking, providerName]
  );

  const providerPhone = useMemo(
    () =>
      booking?.providerProfile?.user?.phone_number ||
      booking?.providerProfile?.phone_number ||
      booking?.provider?.phone_number ||
      "",
    [booking]
  );

  const existingReview = booking?.review || null;

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="text-gray-500 font-medium">Memuat detail booking...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-5xl">lock</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Login dulu untuk melihat detail booking</h1>
        <Link href="/login" className="text-green-600 font-semibold">
          Ke halaman login
        </Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Booking tidak ditemukan</h1>
        <Link href="/dashboard/user/booking" className="text-green-600 font-semibold">
          Kembali ke riwayat booking
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const mapsUrl =
    booking.location_lat !== undefined &&
    booking.location_lat !== null &&
    booking.location_lng !== undefined &&
    booking.location_lng !== null
      ? `https://www.google.com/maps?q=${booking.location_lat},${booking.location_lng}`
      : null;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/dashboard/user/booking"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke riwayat booking
        </Link>
        <span className={`px-4 py-2 rounded-full font-bold text-xs ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className={`rounded-3xl border ${statusConfig.borderColor} bg-white p-6 shadow-sm`}>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl">
            <Image
              src={providerImage}
              alt={providerName}
              fill
              sizes="(min-width: 1024px) 320px, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="mt-6 space-y-3">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2">
                {bookingCode}
              </p>
              <h1 className="text-2xl font-bold text-gray-900">{providerName}</h1>
              <p className="text-gray-500 mt-1">
                {booking.providerProfile?.base_location_city || booking.providerProfile?.province_name || "Lokasi provider"}
              </p>
            </div>
            <p className="text-sm font-semibold text-green-700">
              {booking.serviceType?.name || booking.service_type?.name || `Layanan #${booking.service_type_id}`}
            </p>
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                No. Telepon Provider
              </p>
              {providerPhone ? (
                <a
                  href={`tel:${providerPhone}`}
                  className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800"
                >
                  <span className="material-symbols-outlined text-base">call</span>
                  {providerPhone}
                </a>
              ) : (
                <p className="mt-2 text-sm font-semibold text-gray-500">
                  Nomor telepon belum tersedia
                </p>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {booking.providerProfile?.years_experience
                ? `Pengalaman ${booking.providerProfile.years_experience} Tahun`
                : "Pengalaman provider belum diisi"}
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <div className={`rounded-3xl border ${statusConfig.borderColor} bg-white p-6 shadow-sm space-y-6`}>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detail Booking</h2>
              <p className="mt-2 text-sm text-gray-500">
                Ringkasan informasi pesanan, koordinat lokasi, dan total biaya.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tanggal</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{formatDate(booking.booking_date)}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Waktu</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Durasi</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {formatDuration(booking.duration_hours)}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Harga estimasi</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {formatCurrency(booking.price_estimate || booking.total_price)}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Harga per jam</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {formatCurrency(booking.price_per_hour_snapshot)}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Booking ID</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">{booking.id}</p>
              </div>
            </div>

            {booking.request_notes ? (
              <div className="rounded-2xl bg-green-50 p-4 border border-green-100">
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">Catatan Booking</p>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{booking.request_notes}</p>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Koordinat Lokasi</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {formatCoordinate(booking.location_lat)}, {formatCoordinate(booking.location_lng)}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Maps</p>
                  <p className="mt-2 text-sm font-semibold text-gray-900">Buka titik lokasi booking</p>
                </div>
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
                  >
                    <span className="material-symbols-outlined text-base">map</span>
                    Buka Maps
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">Belum ada koordinat</span>
                )}
              </div>
            </div>
          </div>

          {booking.status === "pending" ? (
            <div className={`rounded-3xl border ${statusConfig.borderColor} ${statusConfig.bgAccent} p-6 shadow-sm`}>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-yellow-900">Batalkan Booking?</h2>
                  <p className="text-sm text-yellow-700 mt-1">Anda masih bisa membatalkan booking sampai provider menerima.</p>
                </div>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 transition-all active:scale-95"
                >
                  Batalkan Booking
                </button>
              </div>
            </div>
          ) : null}

          {booking.status === "completed" ? (
            <ReviewForm
              bookingId={booking.id}
              existingReview={existingReview}
              onCreated={async () => {
                const token = localStorage.getItem("accessToken");
                if (!token) return;
                const [detail, history] = await Promise.all([
                  getBookingDetail(token, booking.id),
                  getBookingHistory(token, booking.id),
                ]);
                setBooking(detail as BookingDetail);
                setHistories(history as BookingStatusHistoryItem[]);
              }}
            />
          ) : booking.status === "cancelled" ? (
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200 text-sm text-gray-600">
              Rating tidak tersedia untuk booking yang dibatalkan.
            </div>
          ) : (
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200 text-sm text-gray-600">
              Rating akan tersedia setelah booking selesai.
            </div>
          )}

          <div className={`rounded-3xl border ${statusConfig.borderColor} bg-white p-6 shadow-sm`}>
            <h2 className="text-xl font-bold text-gray-900">Status History</h2>
            <div className="mt-4 space-y-4">
              {histories.length > 0 ? (
                histories.map((history, index) => (
                  <div key={history.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-600 mt-2" />
                      {index < histories.length - 1 ? <div className="w-px flex-1 bg-gray-200 mt-2" /> : null}
                    </div>
                    <div className="flex-1 rounded-2xl bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="font-bold text-gray-900 capitalize">{history.to_status}</p>
                        <span className="text-xs text-gray-500">{formatDateTime(history.changed_at)}</span>
                      </div>
                      {history.notes ? (
                        <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{history.notes}</p>
                      ) : null}
                      {history.changedByUser ? (
                        <p className="mt-2 text-xs text-gray-500">
                          Diubah oleh {history.changedByUser.full_name || history.changedByUser.email}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada histori status untuk booking ini.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {showCancelModal ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Batalkan Booking</h3>
              <p className="text-sm text-gray-600 mt-1">Apakah Anda yakin ingin membatalkan booking ini?</p>
            </div>

            <div className="space-y-3">
              <label className="block">
                <p className="text-sm font-semibold text-gray-700 mb-2">Alasan Pembatalan (opsional)</p>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Tulis alasan pembatalan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                />
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setIsCancelling(true);
                  const token = localStorage.getItem("accessToken");
                  if (token && bookingId) {
                    const result = await cancelBooking(token, bookingId, cancelReason);
                    if (result) {
                      showAppNotification("Booking Dibatalkan", {
                        body: "Booking berhasil dibatalkan.",
                        tag: `booking-cancelled-${bookingId}`,
                        url: "/dashboard/user/booking",
                      });
                      // Refetch booking detail
                      const [detail, history] = await Promise.all([
                        getBookingDetail(token, bookingId),
                        getBookingHistory(token, bookingId),
                      ]);
                      setBooking(detail);
                      setHistories(history);
                      setShowCancelModal(false);
                      setCancelReason("");
                    }
                  }
                  setIsCancelling(false);
                }}
                disabled={isCancelling}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-all disabled:opacity-50"
              >
                {isCancelling ? "Membatalkan..." : "Batalkan Booking"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
