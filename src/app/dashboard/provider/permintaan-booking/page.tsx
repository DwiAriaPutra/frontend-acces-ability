/*
Header: Permintaan Booking Page
Tujuan: Menampilkan daftar semua permintaan booking untuk provider dengan fitur filter dan desain yang disempurnakan.
Caller: Route /dashboard/provider/permintaan-booking.
Dependensi: @/api (getUserBookings), localStorage token.
*/

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Booking,
  BookingDetail,
  BookingStatusHistoryItem,
  acceptBooking,
  completeBooking,
  getUserBookingsPaginated,
  rejectBooking,
  getBookingDetail,
  getBookingHistory,
} from "@/api";

export default function PermintaanBookingPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; total_pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [actionBookingId, setActionBookingId] = useState<string | null>(null);
  const [rejectModalBooking, setRejectModalBooking] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [detailModalBooking, setDetailModalBooking] = useState<Booking | null>(null);
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingStatusHistoryItem[] | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const presetRejectReasons = [
    "Jadwal bentrok dengan booking lain",
    "Lokasi terlalu jauh",
    "Permintaan layanan tidak sesuai",
    "Tidak tersedia pada tanggal tersebut",
  ];
  const minRejectLength = 15;

  const fetchBookings = async (page = currentPage, status = statusFilter, dateRange = dateRangeFilter) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const statusParam = status && status !== "all" ? status : undefined;
      const dateRangeParam = dateRange && dateRange !== "all" ? dateRange : undefined;
      const res = await getUserBookingsPaginated(token, { page, limit: pageLimit, status: statusParam, dateRange: dateRangeParam });
      setBookings(res.items || []);
      setPagination(res.pagination || null);
    } catch (fetchError) {
      const msg =
        fetchError instanceof Error
          ? fetchError.message
          : "Gagal memuat data booking";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user?.role !== "provider") {
        setUnauthorized(true);
        setIsLoading(false);
        setTimeout(() => router.push("/dashboard/user"), 1200);
        return;
      }
    } catch (_e) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    fetchBookings(1, "all", "all");
    setHasInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    // Only refetch when filters CHANGE after initialization
    if (!hasInitialized) return;
    
    fetchBookings(currentPage, statusFilter, dateRangeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, dateRangeFilter, pageLimit]);

  const totalRequests = pagination?.total ?? bookings.length;
  const pendingRequests = bookings.filter((b) => b.status === "pending").length;
  const acceptedRequests = bookings.filter((b) => b.status === "accepted").length;
  const completedRequests = bookings.filter((b) => b.status === "completed").length;

  const formatBookingDate = (dateValue?: string) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "-";

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return "Hari ini";
    if (date.toDateString() === tomorrow.toDateString()) {
      return (
        "Besok, " +
        new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).format(date)
      );
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDateTime = (dateValue?: string | null) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCoordinate = (value?: number | string | null) => {
    if (value === undefined || value === null || value === "") return "-";
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return String(value);
    return numeric.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");
  };

  const formatCurrency = (value?: number | string | null) => {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric)) return "-";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const getHistoryTimestamp = (history: BookingStatusHistoryItem) =>
    history.changed_at || (history as { created_at?: string | null }).created_at || null;

  const getHistoryLabel = (history: BookingStatusHistoryItem) =>
    history.to_status || history.from_status || "Perubahan status";

  const resolveServiceTypeName = (value: unknown) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "name" in value) {
      const name = (value as { name?: unknown }).name;
      if (typeof name === "string") return name;
    }
    return "";
  };

  const hasLocation =
    bookingDetail?.location_lat !== undefined &&
    bookingDetail?.location_lat !== null &&
    bookingDetail?.location_lng !== undefined &&
    bookingDetail?.location_lng !== null;

  const mapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${bookingDetail?.location_lat},${bookingDetail?.location_lng}&z=16&output=embed`
    : null;

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "completed":
        return {
          label: "Selesai",
          className: "bg-green-50 text-green-700 border-green-100",
        };
      case "pending":
        return {
          label: "Menunggu",
          className: "bg-orange-50 text-orange-600 border-orange-100",
        };
      case "accepted":
        return {
          label: "Diterima",
          className: "bg-emerald-50 text-emerald-700 border-emerald-100",
        };
      case "rejected":
        return {
          label: "Ditolak",
          className: "bg-red-50 text-red-600 border-red-100",
        };
      case "cancelled":
        return {
          label: "Dibatalkan",
          className: "bg-gray-50 text-gray-700 border-gray-100",
        };
      default:
        return {
          label: status,
          className: "bg-gray-50 text-gray-700 border-gray-100",
        };
    }
  };

  const updateBookingStatusLocally = (bookingId: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
    );
  };

  const handleAccept = async (bookingId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    setActionBookingId(bookingId);
    try {
      const updated = await acceptBooking(token, bookingId);
      if (!updated) {
        setError("Gagal menerima booking. Silakan coba lagi.");
        return;
      }

      updateBookingStatusLocally(bookingId, "accepted");
    } catch (_e) {
      setError("Gagal menerima booking. Silakan coba lagi.");
    } finally {
      setActionBookingId(null);
    }
  };

  const handleComplete = async (bookingId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    setActionBookingId(bookingId);
    try {
      const updated = await completeBooking(token, bookingId);
      if (!updated) {
        setError("Gagal menyelesaikan booking. Silakan coba lagi.");
        return;
      }

      updateBookingStatusLocally(bookingId, "completed");
    } catch (_e) {
      setError("Gagal menyelesaikan booking. Silakan coba lagi.");
    } finally {
      setActionBookingId(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectModalBooking) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    setActionBookingId(rejectModalBooking.id);
    try {
      const updated = await rejectBooking(token, rejectModalBooking.id, rejectReason.trim());
      if (!updated) {
        setError("Gagal menolak booking. Silakan coba lagi.");
        return;
      }

      updateBookingStatusLocally(rejectModalBooking.id, "cancelled");
      setRejectModalBooking(null);
      setRejectReason("");
    } catch (_e) {
      setError("Gagal menolak booking. Silakan coba lagi.");
    } finally {
      setActionBookingId(null);
    }
  };

  const openDetailModal = async (bookingId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUnauthorized(true);
      return;
    }

    setIsLoadingDetail(true);
    setDetailModalBooking(null);
    setBookingDetail(null);
    setBookingHistory(null);
    try {
      const [detail, history] = await Promise.all([
        getBookingDetail(token, bookingId),
        getBookingHistory(token, bookingId),
      ]);
      setDetailModalBooking(detail as Booking);
      setBookingDetail(detail);
      setBookingHistory(Array.isArray(history) ? history : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat detail booking");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (unauthorized) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Akses Ditolak</h2>
          <p className="text-red-700">
            Halaman ini hanya dapat diakses oleh user dengan role provider.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm flex items-start justify-between gap-4">
          <div>{error}</div>
          <button className="font-bold hover:underline" onClick={() => setError(null)}>
            Tutup
          </button>
        </div>
      )}

      <div className="mb-8 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-5">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Permintaan Booking
          </h2>
          <p className="text-gray-500">
            Kelola jadwal dan konfirmasi permintaan layanan terbaru dari klien Anda.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:w-auto lg:items-center lg:flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setStatusFilter(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="accepted">Diterima</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>

          <select
            value={dateRangeFilter}
            onChange={(e) => {
              setCurrentPage(1);
              setDateRangeFilter(e.target.value);
            }}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>

          <select
            value={pageLimit}
            onChange={(e) => {
              setCurrentPage(1);
              setPageLimit(Number(e.target.value));
            }}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
          >
            <option value={5}>5 per halaman</option>
            <option value={10}>10 per halaman</option>
            <option value={25}>25 per halaman</option>
            <option value={50}>50 per halaman</option>
          </select>

          <button className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors sm:col-span-2 lg:w-auto">
            <span className="material-symbols-outlined text-lg">download</span>
            Ekspor PDF
          </button>
        </div>
      </div>

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

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-xl font-bold text-gray-900">Daftar Antrean</h3>
        </div>
        <div className="overflow-x-auto md:overflow-visible">
          <table className="responsive-data-table w-full border-collapse">
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
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Belum ada permintaan booking.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const clientName = booking.user?.full_name || booking.user?.email || booking.user_id;
                  const initials = (clientName || "K").substring(0, 1).toUpperCase();
                  const isActing = actionBookingId === booking.id;

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5" data-label="Klien">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                            {booking.user?.image_url ? (
                              <img
                                src={booking.user.image_url}
                                alt={clientName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900">
                              {clientName}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: #{booking.id.substring(0, 8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5" data-label="Layanan">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {booking.service_type?.name || "Layanan"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5" data-label="Tanggal & Waktu">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-700">
                            {formatBookingDate(booking.booking_date)}
                          </span>
                          <span className="text-xs text-green-600 font-bold">
                            {booking.start_time} - {booking.end_time} WIB
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5" data-label="Status">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right" data-label="Aksi">
                        <div className="flex flex-wrap justify-start md:justify-end gap-2">
                          {booking.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleAccept(booking.id)}
                                disabled={isActing}
                                className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-green-700 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-sm">check</span>
                                {isActing ? "Memproses..." : "Terima"}
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModalBooking(booking);
                                  setRejectReason("");
                                }}
                                disabled={isActing}
                                className="px-4 py-2 bg-white border-2 border-red-500 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-sm">close</span>
                                Tolak
                              </button>
                              <button
                                onClick={() => openDetailModal(booking.id)}
                                disabled={isActing}
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-sm">info</span>
                                Detail
                              </button>
                            </>
                          ) : booking.status === "accepted" ? (
                            <>
                              <button
                                onClick={() => handleComplete(booking.id)}
                                disabled={isActing}
                                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-sm">task_alt</span>
                                {isActing ? "Memproses..." : "Selesaikan"}
                              </button>
                              <button
                                onClick={() => openDetailModal(booking.id)}
                                disabled={isActing}
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 flex items-center gap-1 disabled:opacity-60"
                              >
                                <span className="material-symbols-outlined text-sm">info</span>
                                Detail
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openDetailModal(booking.id)}
                              className="px-3 py-2 bg-white border border-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">info</span>
                              Detail
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
        {!isLoading && bookings.length > 0 && (
          <div className="p-6 border-t border-gray-50 flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-gray-500 font-medium">
              Menampilkan {bookings.length} dari {pagination?.total ?? bookings.length} permintaan
            </p>
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination ? pagination.page <= 1 : currentPage <= 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>

              {pagination && pagination.total_pages <= 7 ? (
                Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      pagination.page === page
                        ? "bg-green-600 text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))
              ) : (
                <>
                  {pagination && pagination.page > 2 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold"
                      >
                        1
                      </button>
                      {pagination.page > 3 && <span className="text-gray-400">...</span>}
                    </>
                  )}

                  {pagination &&
                    Array.from({ length: Math.min(3, pagination.total_pages) }, (_, i) => {
                      const page = Math.max(1, Math.min(pagination.page - 1 + i, pagination.total_pages - 2));
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            pagination.page === page
                              ? "bg-green-600 text-white"
                              : "border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                  {pagination && pagination.page < pagination.total_pages - 1 && (
                    <>
                      {pagination.page < pagination.total_pages - 2 && <span className="text-gray-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(pagination.total_pages)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold"
                      >
                        {pagination.total_pages}
                      </button>
                    </>
                  )}
                </>
              )}

              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={pagination ? pagination.page >= (pagination.total_pages || 1) : false}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

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

      {rejectModalBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tolak Booking</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Berikan alasan penolakan agar tercatat di riwayat booking.
                </p>
              </div>
              <button
                onClick={() => {
                  setRejectModalBooking(null);
                  setRejectReason("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                {rejectModalBooking.user?.full_name || rejectModalBooking.user?.email || rejectModalBooking.user_id}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {rejectModalBooking.service_type?.name || "Layanan"} · {formatBookingDate(rejectModalBooking.booking_date)}
              </p>
            </div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alasan penolakan
            </label>
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {presetRejectReasons.map((p) => (
                  <button
                    key={p}
                    onClick={() => setRejectReason(p)}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-700 hover:bg-gray-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              placeholder="Contoh: Jadwal bentrok dengan booking lain"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div>
                {rejectReason.trim().length < minRejectLength ? (
                  <span className="text-red-600">Mohon berikan minimal {minRejectLength} karakter.</span>
                ) : (
                  <span className="text-green-600">Alasan sudah mencukupi.</span>
                )}
              </div>
              <div>{rejectReason.trim().length} karakter</div>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => {
                  setRejectModalBooking(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={rejectReason.trim().length < minRejectLength || actionBookingId === rejectModalBooking.id}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60"
              >
                {actionBookingId === rejectModalBooking.id ? "Memproses..." : "Konfirmasi Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
      {(detailModalBooking || isLoadingDetail) && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4"
          onClick={() => {
            setDetailModalBooking(null);
            setBookingDetail(null);
            setBookingHistory(null);
          }}
        >
          <div
            className="w-full max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Detail & Riwayat Booking</h3>
                  <p className="text-sm text-gray-500 mt-1">Informasi lengkap dan riwayat perubahan booking.</p>
                </div>
                <button
                  onClick={() => {
                    setDetailModalBooking(null);
                    setBookingDetail(null);
                    setBookingHistory(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-5 sm:p-6">

              {isLoadingDetail ? (
                <div className="py-10 text-center text-gray-500">Memuat detail...</div>
              ) : bookingDetail ? (
                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">Booking</p>
                          <p className="text-lg font-bold text-gray-900">{bookingDetail.booking_code || bookingDetail.id}</p>
                          <p className="text-sm text-gray-600 mt-1">{resolveServiceTypeName(bookingDetail.service_type) || bookingDetail.serviceType?.name || "Layanan"}</p>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(bookingDetail.status).className}`}>
                          {getStatusBadge(bookingDetail.status).label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Klien</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.user?.full_name || bookingDetail.user?.email || bookingDetail.user_id}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Provider</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.providerProfile?.user?.full_name || bookingDetail.provider?.full_name || "Provider"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Tanggal</p>
                          <p className="font-semibold text-gray-900">{formatBookingDate(bookingDetail.booking_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Waktu</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.start_time} - {bookingDetail.end_time} WIB</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Durasi</p>
                          <p className="font-semibold text-gray-900">{bookingDetail.duration_hours || "-"} jam</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Total</p>
                          <p className="font-semibold text-gray-900">{formatCurrency(bookingDetail.total_price)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">Lokasi booking</p>
                        <p className="text-sm text-gray-600 mt-1">Google Maps akan menembak langsung ke koordinat backend.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Latitude</p>
                          <p className="font-semibold text-gray-900">{formatCoordinate(bookingDetail.location_lat)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider">Longitude</p>
                          <p className="font-semibold text-gray-900">{formatCoordinate(bookingDetail.location_lng)}</p>
                        </div>
                      </div>

                      {mapsUrl ? (
                        <div className="overflow-hidden rounded-2xl border border-gray-200">
                          <iframe
                            title="Lokasi booking"
                            src={mapsUrl}
                            className="h-[260px] w-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                          Lokasi belum tersedia.
                        </div>
                      )}

                      {bookingDetail.request_notes && (
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Catatan permintaan</p>
                          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{bookingDetail.request_notes}</p>
                        </div>
                      )}

                      {bookingDetail.cancel_reason && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                          <p className="font-semibold">Alasan pembatalan</p>
                          <p className="mt-1 leading-relaxed">{bookingDetail.cancel_reason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Ringkasan detail</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Booking ID</p>
                        <p className="font-semibold text-gray-900 break-all">{bookingDetail.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Kode booking</p>
                        <p className="font-semibold text-gray-900">{bookingDetail.booking_code || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Dibuat</p>
                        <p className="font-semibold text-gray-900">{formatDateTime(bookingDetail.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider">Diupdate</p>
                        <p className="font-semibold text-gray-900">{formatDateTime(bookingDetail.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">Tidak ada detail tersedia.</div>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-gray-100 p-4 space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">Riwayat</h4>
              <div className="max-h-40 overflow-auto rounded-lg border border-gray-100 p-3 bg-gray-50">
                {bookingHistory && bookingHistory.length > 0 ? (
                  <ul className="space-y-3">
                    {bookingHistory.map((h, idx) => (
                      <li key={idx} className="text-xs text-gray-700">
                        <div className="text-gray-600">{formatDateTime(getHistoryTimestamp(h))}</div>
                        <div className="font-semibold capitalize">{getHistoryLabel(h)}</div>
                        {h.notes && <div className="text-gray-600">{h.notes}</div>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-500">Belum ada riwayat.</div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setDetailModalBooking(null);
                    setBookingDetail(null);
                    setBookingHistory(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
