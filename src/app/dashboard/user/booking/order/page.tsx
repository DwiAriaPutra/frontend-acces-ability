"use client";

/*
Tujuan: Form order booking user yang mengambil detail provider, memilih jadwal, dan mengirim payload booking ke API.
Caller: Halaman dashboard booking order.
Dependensi: API provider/bookings, Leaflet map picker, dan state jadwal/lokasi booking.
Main Functions: BookingOrderPage.
*/

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  BookingCreatePayload,
  Provider,
  createBooking,
  getServiceTypes,
  getProviderDetail,
} from "@/api";
import type { Coordinates } from "@/components/LocationPickerMap";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false }
);

type AvailabilityItem = {
  id?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
};

type ServiceTypeOption = {
  id: number;
  name: string;
  code: string;
};

const dayMap: Record<number, string> = {
  0: "Minggu",
  1: "Senin",
  2: "Selasa",
  3: "Rabu",
  4: "Kamis",
  5: "Jumat",
  6: "Sabtu",
};

const timeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const calculateHours = (startTime: string, endTime: string) => {
  const startMinutes = timeToMinutes(startTime);
  let endMinutes = timeToMinutes(endTime);

  if (endMinutes === startMinutes) {
    return 0;
  }

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return Math.max((endMinutes - startMinutes) / 60, 0);
};

const normalizeTimeInput = (value: string) => {
  const [hours = "00", minutes = "00"] = value.split(":");
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCoordinate = (value: number) =>
  value.toFixed(6).replace(/0+$/, "").replace(/\.$/, "");

const getNextDateForDay = (dayOfWeek: number) => {
  const today = new Date();
  const delta = (dayOfWeek - today.getDay() + 7) % 7 || 7;
  const target = new Date(today);
  target.setDate(today.getDate() + delta);
  return target.toISOString().slice(0, 10);
};

const getFriendlyBookingErrorMessage = (error: unknown) => {
  const fallbackMessage =
    "Booking gagal dibuat. Coba periksa jadwal dan data input.";

  const rawMessage = error instanceof Error ? error.message : "";

  if (!rawMessage) return fallbackMessage;

  if (rawMessage.includes("Provider has another booking")) {
    return "Provider sudah punya booking di jam tersebut. Silakan pilih jadwal lain.";
  }

  if (rawMessage.includes("not available")) {
    return "Provider tidak tersedia pada jadwal yang dipilih. Silakan pilih jam lain.";
  }

  if (rawMessage.includes("Invalid time range")) {
    return "Jam booking tidak valid. Pastikan jam mulai dan selesai benar.";
  }

  if (rawMessage.includes("Only user can create booking")) {
    return "Akun Anda tidak punya izin untuk membuat booking.";
  }

  return fallbackMessage;
};

export default function BookingOrderPage() {
  const router = useRouter();
  const [providerId, setProviderId] = useState("");
  const [isProviderIdReady, setIsProviderIdReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setProviderId(params.get("providerId") || "");
    setIsProviderIdReady(true);
  }, []);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [globalServiceTypes, setGlobalServiceTypes] = useState<ServiceTypeOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serviceTypeId, setServiceTypeId] = useState<string>("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [requestNotes, setRequestNotes] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      if (!isProviderIdReady) {
        return;
      }

      if (!providerId) {
        setErrorMessage("providerId tidak ditemukan di URL");
        setIsLoading(false);
        return;
      }

      setErrorMessage(null);
      setIsLoading(true);
      const data = await getProviderDetail(providerId);
      setProvider(data);

      const fallbackServiceTypes = await getServiceTypes();
      setGlobalServiceTypes(fallbackServiceTypes);

      const firstServiceTypeId =
        data?.specializations?.[0]?.service_type_id?.toString() || "";
      setServiceTypeId(firstServiceTypeId);

      const firstAvailability =
        (data?.availabilities as AvailabilityItem[] | undefined)?.find(
          (item) => item.is_active !== false
        ) || null;

      if (firstAvailability?.day_of_week !== undefined) {
        setBookingDate(getNextDateForDay(firstAvailability.day_of_week));
        setStartTime(normalizeTimeInput(firstAvailability.start_time || "09:00"));
        setEndTime(normalizeTimeInput(firstAvailability.end_time || "10:00"));
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setBookingDate(tomorrow.toISOString().slice(0, 10));
        setStartTime("09:00");
        setEndTime("10:00");
      }

      setIsLoading(false);
    };

    fetchProvider();
  }, [providerId, isProviderIdReady]);

  const providerName = useMemo(
    () => provider?.user?.full_name || provider?.full_name || "Provider",
    [provider]
  );

  const providerImage = useMemo(
    () =>
      provider?.user?.image_url ||
      provider?.profile_image_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        providerName
      )}&background=008000&color=fff`,
    [provider, providerName]
  );

  const specializations =
    provider?.specializations
      ?.map((item) => ({
        id: item.service_type_id,
        name: item.serviceType?.name || "Layanan",
      }))
      .filter((item) => Boolean(item.id)) || [];

  const serviceTypeOptions =
    specializations.length > 0
      ? specializations
      : globalServiceTypes.map((item) => ({
          id: item.id,
          name: item.name,
        }));

  const availabilities = (provider?.availabilities as AvailabilityItem[] | undefined) || [];

  const estimatedPrice = useMemo(() => {
    if (!provider || !startTime || !endTime) return 0;
    const hours = calculateHours(startTime, endTime);
    const price = Number(provider.price_per_hour || 0);
    return Math.max(hours * price, 0);
  }, [provider, startTime, endTime]);

  const mapCenter = useMemo<[number, number]>(() => {
    const providerLat =
      provider?.base_location_lat !== null && provider?.base_location_lat !== undefined
        ? Number(provider.base_location_lat)
        : null;
    const providerLng =
      provider?.base_location_lng !== null && provider?.base_location_lng !== undefined
        ? Number(provider.base_location_lng)
        : null;

    if (
      providerLat !== null &&
      providerLng !== null &&
      Number.isFinite(providerLat) &&
      Number.isFinite(providerLng)
    ) {
      return [providerLat, providerLng];
    }

    return [-7.3274, 108.2207];
  }, [provider]);

  const handleUseAvailability = (availability: AvailabilityItem) => {
    if (availability.day_of_week === undefined) return;
    setBookingDate(getNextDateForDay(availability.day_of_week));
    setStartTime(normalizeTimeInput(availability.start_time || "09:00"));
    setEndTime(normalizeTimeInput(availability.end_time || "10:00"));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!provider) {
      setErrorMessage("Data provider belum siap.");
      return;
    }

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setErrorMessage("Token login tidak ditemukan. Silakan login ulang.");
      return;
    }

    if (!serviceTypeId) {
      setErrorMessage("Pilih kategori layanan terlebih dahulu.");
      return;
    }

    if (!selectedLocation) {
      setErrorMessage("Klik peta untuk menentukan lokasi booking.");
      return;
    }

    const normalizedStartTime = normalizeTimeInput(startTime);
    const normalizedEndTime = normalizeTimeInput(endTime);

    if (normalizedEndTime === normalizedStartTime) {
      setErrorMessage("Jam selesai harus berbeda dari jam mulai.");
      return;
    }

    setIsSubmitting(true);

    const locationBlock = [
      locationAddress.trim() ? `Alamat lokasi: ${locationAddress.trim()}` : null,
      `Koordinat lokasi: ${formatCoordinate(selectedLocation.lat)}, ${formatCoordinate(selectedLocation.lng)}`,
      `Google Maps: https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`,
    ]
      .filter((item): item is string => Boolean(item))
      .join("\n");

    const combinedNotes = [locationBlock, requestNotes.trim()]
      .filter((item): item is string => Boolean(item))
      .join("\n\n");

    const payload: BookingCreatePayload = {
      provider_profile_id: provider.id,
      service_type_id: Number(serviceTypeId),
      booking_date: bookingDate,
      start_time: normalizedStartTime,
      end_time: normalizedEndTime,
      location_lat: selectedLocation.lat,
      location_lng: selectedLocation.lng,
      request_notes: combinedNotes || undefined,
    };

    try {
      const booking = await createBooking(token, payload);

      if (!booking) {
        setErrorMessage("Booking gagal dibuat. Coba periksa jadwal dan data input.");
        return;
      }

      setSuccessMessage("Booking berhasil dibuat.");
      router.push("/dashboard/user/booking");
    } catch (error) {
      const backendMessage = error instanceof Error ? error.message : "Unknown booking error";
      console.error("[Booking UI] createBooking failed:", backendMessage);
      setErrorMessage(getFriendlyBookingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="text-gray-500 font-medium">Menyiapkan form booking...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Provider tidak ditemukan</h1>
        <Link href="/dashboard/user/cari-provider" className="text-green-600 font-semibold">
          Kembali ke daftar provider
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/dashboard/user/cari-provider/${provider.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke detail provider
        </Link>
        <Link
          href="/dashboard/user/booking"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Lihat riwayat booking
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <img
            src={providerImage}
            alt={providerName}
            className="h-72 w-full rounded-2xl object-cover"
          />
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{providerName}</h1>
              {provider.is_verified ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Terverifikasi
                </span>
              ) : null}
            </div>
            <p className="text-gray-500">{provider.base_location_city}</p>
            <p className="text-sm font-semibold text-gray-700">
              {provider.avg_rating ?? provider.rating ?? "0.0"} Rating
            </p>
            <p className="text-sm text-gray-600">
              {provider.years_experience
                ? `Pengalaman ${provider.years_experience} Tahun`
                : "Pengalaman belum ditampilkan"}
            </p>
            <p className="text-sm font-semibold text-green-700">
              {formatCurrency(Number(provider.price_per_hour || 0))} / jam
            </p>
          </div>
        </aside>

        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Booking</h2>
              <p className="mt-2 text-sm text-gray-500">
                Isi data booking, pilih jadwal, lalu submit untuk membuat pesanan.
              </p>
              {specializations.length === 0 ? (
                <p className="mt-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 border border-amber-100">
                  Provider ini belum mengisi spesialisasi atau jadwal. Booking tetap bisa diajukan, tapi pastikan kategori layanan dan lokasi sudah benar.
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-100">
                {successMessage}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">Kategori Layanan</span>
                <select
                  value={serviceTypeId}
                  onChange={(e) => setServiceTypeId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-600 focus:outline-none"
                >
                  <option value="">Pilih layanan</option>
                  {serviceTypeOptions.map((item) => (
                    <option key={String(item.id)} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">Tanggal Booking</span>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-600 focus:outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">Jam Mulai</span>
                <input
                  type="time"
                  step={60}
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-600 focus:outline-none"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-gray-700">Jam Selesai</span>
                <input
                  type="time"
                  step={60}
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-600 focus:outline-none"
                />
              </label>
            </div>

            <label className="space-y-2 block md:col-span-2">
              <span className="text-sm font-semibold text-gray-700">Alamat Lokasi</span>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-600 focus:outline-none"
                placeholder="Contoh: Jl. Merdeka No. 10, Tasikmalaya"
              />
            </label>

            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-semibold text-gray-700">Pin Point Lokasi</span>
                  <p className="text-xs text-gray-500 mt-1">
                    Klik peta untuk menandai titik tujuan provider.
                  </p>
                </div>
                {selectedLocation ? (
                  <a
                    href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-green-600 hover:text-green-700"
                  >
                    Buka di Google Maps
                  </a>
                ) : null}
              </div>

              <LocationPickerMap
                center={mapCenter}
                value={selectedLocation}
                onChange={setSelectedLocation}
              />

              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-500">Koordinat terpilih</span>
                <span className="font-semibold text-gray-800">
                  {selectedLocation
                    ? `${formatCoordinate(selectedLocation.lat)}, ${formatCoordinate(selectedLocation.lng)}`
                    : "Belum dipilih"}
                </span>
              </div>
            </div>

              <label className="space-y-2 block md:col-span-2">
              <span className="text-sm font-semibold text-gray-700">Catatan Booking</span>
              <textarea
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-green-600 focus:outline-none"
                  placeholder="Tulis kebutuhan khusus atau instruksi tambahan untuk provider"
              />
            </label>

            <div className="rounded-2xl bg-gray-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Estimasi total</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(estimatedPrice)}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Alamat, koordinat, dan link maps akan dikirim ke provider sebagai petunjuk lokasi.
                  </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Membuat booking..." : "Buat Booking"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Jadwal Tersedia</h2>
            <div className="mt-4 space-y-3">
              {availabilities.length > 0 ? (
                availabilities.map((availability) => (
                  <button
                    key={availability.id || `${availability.day_of_week}-${availability.start_time}`}
                    type="button"
                    onClick={() => handleUseAvailability(availability)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left hover:border-green-300 hover:bg-green-50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-gray-800">
                        {availability.day_of_week !== undefined
                          ? dayMap[availability.day_of_week]
                          : "Hari tidak diketahui"}
                      </span>
                      <span className="text-sm text-gray-600">
                        {availability.start_time || "--:--"} - {availability.end_time || "--:--"}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada jadwal tersedia.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Spesialisasi</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {specializations.length > 0 ? (
                specializations.map((item) => (
                  <span
                    key={String(item.id)}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    {item.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Belum ada spesialisasi.</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}