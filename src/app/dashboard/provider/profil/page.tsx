/*
Header: Profile Provider Page
Tujuan: Menampilkan dan mengedit profil provider dengan field yang selaras dengan form registrasi provider.
Caller: Route /dashboard/provider/profil.
Dependensi: @/api (locations, service-types, providers), localStorage user/token.
*/

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Booking,
  Provider,
  Province,
  Regency,
  ServiceType,
  UpdateMyProviderPayload,
  addMyProviderCertificate,
  addMySpecializations,
  deleteMyProviderCertificate,
  deleteMySpecializationByServiceType,
  getMyProvider,
  getMyProviderCertificates,
  createMyAvailability,
  updateMyAvailability,
  deleteMyAvailability,
  getProvinces,
  getRegencies,
  getServiceTypes,
  getUserBookings,
  updateMyProvider,
  logout,
} from "@/api";

type ProviderProfileFormState = {
  bio: string;
  years_experience: string;
  price_per_hour: string;
  province_id: string;
  province_name: string;
  regency_id: string;
  regency_name: string;
  base_location_city: string;
  base_location_lat: string;
  base_location_lng: string;
};

const emptyFormState: ProviderProfileFormState = {
  bio: "",
  years_experience: "",
  price_per_hour: "",
  province_id: "",
  province_name: "",
  regency_id: "",
  regency_name: "",
  base_location_city: "",
  base_location_lat: "",
  base_location_lng: "",
};

export default function ProfileProviderPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profileUser, setProfileUser] = useState<{
    full_name: string;
    email: string;
    phone_number: string;
    role: string;
    image_url?: string | null;
  } | null>(null);
  const [accountEdits, setAccountEdits] = useState<{ full_name?: string; email?: string; phone_number?: string }>({});
  const [formState, setFormState] = useState<ProviderProfileFormState>(emptyFormState);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<number[]>([]);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certifications, setCertifications] = useState<{ id: string; file_url?: string; verification_status?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [editingAvailabilityId, setEditingAvailabilityId] = useState<string | null>(null);
  const [newAvailability, setNewAvailability] = useState<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>({ day_of_week: 1, start_time: "09:00", end_time: "17:00", is_active: true });

  useEffect(() => {
    const loadReferenceData = async () => {
      const [provinceItems, serviceTypeItems] = await Promise.all([
        getProvinces(),
        getServiceTypes(),
      ]);

      setProvinces(provinceItems);
      setServiceTypes(serviceTypeItems);
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (!userStr || !token) {
        setIsLoading(false);
        setError("Sesi login tidak ditemukan. Silakan login ulang.");
        return;
      }

      try {
        const storedUser = JSON.parse(userStr);
        setProfileUser({
          full_name: storedUser.full_name || "",
          email: storedUser.email || "",
          phone_number: storedUser.phone_number || "",
          role: storedUser.role || "provider",
          image_url: storedUser.image_url || null,
        });
        setAccountEdits({
          full_name: storedUser.full_name || "",
          email: storedUser.email || "",
          phone_number: storedUser.phone_number || "",
        });

        const [profileData, bookingsData, certificatesData] = await Promise.all([
          getMyProvider(token),
          getUserBookings(token),
          getMyProviderCertificates(token),
        ]);

        if (profileData) {
          setProvider(profileData);
          setFormState({
            bio: profileData.bio || "",
            years_experience:
              profileData.years_experience === undefined || profileData.years_experience === null
                ? ""
                : String(profileData.years_experience),
            price_per_hour:
              profileData.price_per_hour === undefined || profileData.price_per_hour === null
                ? ""
                : String(profileData.price_per_hour),
            province_id: profileData.province_id || "",
            province_name: profileData.province_name || "",
            regency_id: profileData.regency_id || "",
            regency_name: profileData.regency_name || "",
            base_location_city: profileData.base_location_city || "",
            base_location_lat:
              profileData.base_location_lat === undefined || profileData.base_location_lat === null
                ? ""
                : String(profileData.base_location_lat),
            base_location_lng:
              profileData.base_location_lng === undefined || profileData.base_location_lng === null
                ? ""
                : String(profileData.base_location_lng),
          });

          const initialSpecializations =
            profileData.specializations
              ?.map((spec) => spec.service_type_id || spec.serviceType?.id)
              .filter((id): id is number => typeof id === "number") || [];
          setSelectedServiceTypeIds(initialSpecializations);

          if (profileData.province_id) {
            const regenciesItems = await getRegencies(profileData.province_id);
            setRegencies(regenciesItems);
          }
        }

        setBookings(bookingsData);
        setCertifications(certificatesData);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Gagal memuat profil provider.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const completedCount = bookings.filter((booking) => booking.status === "completed").length;
  const initials =
    provider?.full_name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "PR";

  const selectedServiceTypes = useMemo(() => {
    return serviceTypes.filter((serviceType) => selectedServiceTypeIds.includes(serviceType.id));
  }, [selectedServiceTypeIds, serviceTypes]);

  const formatCurrency = (value: string | number) => {
    const numericValue = typeof value === "string" ? Number(value) : value;

    if (!Number.isFinite(numericValue)) {
      return "-";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(numericValue);
  };

  const handleChange = (field: keyof ProviderProfileFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    if (success) {
      setSuccess(null);
    }
    if (error) {
      setError(null);
    }
  };

  useEffect(() => {
    if (provider) setAvailabilities(provider.availabilities || []);
  }, [provider]);

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const handleLogout = () => {
    const result = logout();
    if (result.success) {
      router.push("/");
    }
  };

  const handleAddAvailability = async () => {
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) return setError("Token tidak ditemukan.");
    const created = await createMyAvailability(token, newAvailability);
    if (created) {
      const refreshed = await getMyProvider(token);
      if (refreshed) {
        setProvider(refreshed);
        setAvailabilities(refreshed.availabilities || []);
        setNewAvailability({ day_of_week: 1, start_time: "09:00", end_time: "17:00", is_active: true });
        setSuccess("Ketersediaan berhasil ditambahkan.");
      }
    } else {
      setError("Gagal menambahkan ketersediaan.");
    }
  };

  const handleUpdateAvailability = async (id: string, payload: Partial<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>) => {
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) return setError("Token tidak ditemukan.");
    const updated = await updateMyAvailability(token, id, payload);
    if (updated) {
      const refreshed = await getMyProvider(token);
      if (refreshed) {
        setProvider(refreshed);
        setAvailabilities(refreshed.availabilities || []);
        setSuccess("Ketersediaan berhasil diperbarui.");
        setEditingAvailabilityId(null);
      }
    } else {
      setError("Gagal memperbarui ketersediaan.");
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    setError(null);
    const token = localStorage.getItem("accessToken");
    if (!token) return setError("Token tidak ditemukan.");
    const ok = await deleteMyAvailability(token, id);
    if (ok) {
      const refreshed = await getMyProvider(token);
      if (refreshed) {
        setProvider(refreshed);
        setAvailabilities(refreshed.availabilities || []);
        setSuccess("Ketersediaan berhasil dihapus.");
      }
    } else {
      setError("Gagal menghapus ketersediaan.");
    }
  };

  const handleAccountChange = (field: keyof typeof accountEdits, value: string) => {
    setAccountEdits((current) => ({ ...current, [field]: value }));
    if (success) setSuccess(null);
    if (error) setError(null);
  };

  const handleProvinceChange = async (provinceId: string) => {
    const selectedProvince = provinces.find((province) => province.id === provinceId);
    setFormState((current) => ({
      ...current,
      province_id: provinceId,
      province_name: selectedProvince?.name || "",
      regency_id: "",
      regency_name: "",
    }));

    if (provinceId) {
      const regencyItems = await getRegencies(provinceId);
      setRegencies(regencyItems);
    } else {
      setRegencies([]);
    }
  };

  const handleRegencyChange = (regencyId: string) => {
    const selectedRegency = regencies.find((regency) => regency.id === regencyId);
    setFormState((current) => ({
      ...current,
      regency_id: regencyId,
      regency_name: selectedRegency?.name || "",
    }));
  };

  const handleSpecializationToggle = (serviceTypeId: number) => {
    setSelectedServiceTypeIds((current) =>
      current.includes(serviceTypeId)
        ? current.filter((id) => id !== serviceTypeId)
        : [...current, serviceTypeId]
    );
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Token login tidak ditemukan. Silakan login ulang.");
      return;
    }

    const payload: UpdateMyProviderPayload = {
      bio: formState.bio.trim() || null,
      years_experience: formState.years_experience.trim()
        ? Number(formState.years_experience)
        : null,
      price_per_hour: formState.price_per_hour.trim()
        ? Number(formState.price_per_hour)
        : null,
      province_id: formState.province_id.trim() || null,
      province_name: formState.province_name.trim() || null,
      regency_id: formState.regency_id.trim() || null,
      regency_name: formState.regency_name.trim() || null,
      base_location_city: formState.base_location_city.trim() || null,
      base_location_lat: formState.base_location_lat.trim()
        ? Number(formState.base_location_lat)
        : null,
      base_location_lng: formState.base_location_lng.trim()
        ? Number(formState.base_location_lng)
        : null,
    };

    if (
      (payload.years_experience !== null && Number.isNaN(payload.years_experience)) ||
      (payload.price_per_hour !== null && Number.isNaN(payload.price_per_hour)) ||
      (payload.base_location_lat !== null && Number.isNaN(payload.base_location_lat)) ||
      (payload.base_location_lng !== null && Number.isNaN(payload.base_location_lng))
    ) {
      setError("Pastikan semua angka diisi dengan format yang valid.");
      return;
    }

    setIsSaving(true);

      try {
      // Update basic user account fields first (name/email/phone)
      try {
        const { updateMe } = await import("@/api");
        const userPayload: { full_name?: string | null; email?: string | null; phone_number?: string | null } = {};
        if (accountEdits.full_name && accountEdits.full_name !== profileUser?.full_name) userPayload.full_name = accountEdits.full_name;
        if (accountEdits.email && accountEdits.email !== profileUser?.email) userPayload.email = accountEdits.email;
        if (typeof accountEdits.phone_number !== "undefined" && accountEdits.phone_number !== profileUser?.phone_number) userPayload.phone_number = accountEdits.phone_number || null;

        if (Object.keys(userPayload).length > 0) {
          const userUpdateResult = await updateMe(token, userPayload);
          if (!userUpdateResult.success) {
            setError(userUpdateResult.message || "Gagal memperbarui data akun.");
            setIsSaving(false);
            return;
          }

          // update localStorage user
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const stored = JSON.parse(userStr);
              const newUser = { ...stored, ...userUpdateResult.data?.user };
              localStorage.setItem("user", JSON.stringify(newUser));
              setProfileUser({
                full_name: newUser.full_name || "",
                email: newUser.email || "",
                phone_number: newUser.phone_number || "",
                role: newUser.role || profileUser?.role || "provider",
                image_url: newUser.image_url || profileUser?.image_url || null,
              });
            }
          } catch (e) {
            console.error("Error updating localStorage after user update", e);
          }
        }
      } catch (e) {
        console.error("Error while updating user account fields:", e);
      }

      const updatedProvider = await updateMyProvider(token, payload);

      if (!updatedProvider) {
        setError("Gagal menyimpan perubahan profil provider.");
        return;
      }

      const existingIds =
        provider?.specializations
          ?.map((spec) => spec.service_type_id || spec.serviceType?.id)
          .filter((id): id is number => typeof id === "number") || [];

      const toAdd = selectedServiceTypeIds.filter((id) => !existingIds.includes(id));
      const toRemove = existingIds.filter((id) => !selectedServiceTypeIds.includes(id));

      if (toAdd.length > 0) {
        await addMySpecializations(token, selectedServiceTypeIds);
      }

      for (const serviceTypeId of toRemove) {
        await deleteMySpecializationByServiceType(token, serviceTypeId);
      }

      if (certificateFile) {
        const uploaded = await addMyProviderCertificate(token, certificateFile);
        if (!uploaded) {
          setError("Profil tersimpan, tetapi upload sertifikat gagal.");
        }
      }

      const refreshedProvider = await getMyProvider(token);
      const refreshedCertificates = await getMyProviderCertificates(token);

      if (refreshedProvider) {
        setProvider(refreshedProvider);
        setAvailabilities(refreshedProvider.availabilities || []);
        setFormState({
          bio: refreshedProvider.bio || "",
          years_experience:
            refreshedProvider.years_experience === undefined || refreshedProvider.years_experience === null
              ? ""
              : String(refreshedProvider.years_experience),
          price_per_hour:
            refreshedProvider.price_per_hour === undefined || refreshedProvider.price_per_hour === null
              ? ""
              : String(refreshedProvider.price_per_hour),
          province_id: refreshedProvider.province_id || "",
          province_name: refreshedProvider.province_name || "",
          regency_id: refreshedProvider.regency_id || "",
          regency_name: refreshedProvider.regency_name || "",
          base_location_city: refreshedProvider.base_location_city || "",
          base_location_lat:
            refreshedProvider.base_location_lat === undefined || refreshedProvider.base_location_lat === null
              ? ""
              : String(refreshedProvider.base_location_lat),
          base_location_lng:
            refreshedProvider.base_location_lng === undefined || refreshedProvider.base_location_lng === null
              ? ""
              : String(refreshedProvider.base_location_lng),
        });
      }

      setCertifications(refreshedCertificates);
      setSelectedServiceTypeIds(selectedServiceTypeIds);
      setCertificateFile(null);

      const userStr = localStorage.getItem("user");
      if (userStr && refreshedProvider) {
        try {
          const storedUser = JSON.parse(userStr);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              providerProfile: refreshedProvider,
            })
          );
        } catch (storageError) {
          console.error("Error updating localStorage user", storageError);
        }
      }

      setSuccess("Profil provider berhasil diperbarui.");
    } catch (saveError) {
      console.error("Error saving provider profile:", saveError);
      setError("Terjadi kesalahan saat menyimpan profil provider.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat profil provider...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Profil tidak ditemukan</h2>
          <p className="text-gray-600">Kami tidak menemukan data profil provider untuk akun ini.</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profil Provider</h2>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-green-600 p-1 overflow-hidden shadow-lg bg-green-50 flex items-center justify-center">
                {profileUser?.image_url || provider.profile_image_url || provider.image_url ? (
                  <img
                    alt={provider.full_name || "Provider"}
                    className="w-full h-full rounded-full object-cover"
                    src={profileUser?.image_url || provider.profile_image_url || provider.image_url || ""}
                  />
                ) : (
                  <span className="text-4xl font-bold text-green-600">{initials}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <span className="material-symbols-outlined text-base">verified</span>
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    <input
                      className="text-2xl font-bold text-gray-900 bg-transparent border-none focus:ring-0"
                      value={accountEdits.full_name ?? profileUser?.full_name ?? provider.full_name ?? ""}
                      onChange={(e) => handleAccountChange("full_name", e.target.value)}
                    />
                  </h3>
                  <p className="text-gray-500 text-sm">
                    <input
                      className="text-sm text-gray-500 bg-transparent border-none focus:ring-0"
                      value={accountEdits.email ?? profileUser?.email ?? provider.email ?? ""}
                      onChange={(e) => handleAccountChange("email", e.target.value)}
                    />
                  </p>
                </div>
                <div className="bg-gray-100 rounded-xl px-6 py-3 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-green-600">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="text-2xl font-bold">{provider.rating || provider.avg_rating || "4.9"}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{bookings.length} Booking</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <span className="material-symbols-outlined text-green-600">call</span>
                  <input
                    type="text"
                    className="text-sm font-medium text-gray-700 bg-transparent border-none focus:outline-none"
                    value={accountEdits.phone_number ?? profileUser?.phone_number ?? provider.phone_number ?? ""}
                    onChange={(e) => handleAccountChange("phone_number", e.target.value)}
                    placeholder="0812..."
                  />
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <span className="material-symbols-outlined text-green-600">location_on</span>
                  <span className="text-sm font-medium text-gray-700">
                    {provider.base_location_city || "-"}, {provider.province_name || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <form className="space-y-6" onSubmit={handleSave}>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Edit Profil Provider</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    className="w-full min-h-40 px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                    value={formState.bio}
                    onChange={(event) => handleChange("bio", event.target.value)}
                    placeholder="Ceritakan pengalaman, keahlian, dan layanan yang Anda sediakan"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="years_experience">
                    Pengalaman (tahun)
                  </label>
                  <input
                    id="years_experience"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                    type="number"
                    min="0"
                    value={formState.years_experience}
                    onChange={(event) => handleChange("years_experience", event.target.value)}
                    placeholder="Contoh: 5"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="price_per_hour">
                    Harga per jam
                  </label>
                  <input
                    id="price_per_hour"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                    type="number"
                    min="0"
                    value={formState.price_per_hour}
                    onChange={(event) => handleChange("price_per_hour", event.target.value)}
                    placeholder="Contoh: 50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="province_id">
                    Provinsi
                  </label>
                  <select
                    id="province_id"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                    value={formState.province_id}
                    onChange={async (event) => handleProvinceChange(event.target.value)}
                  >
                    <option value="">Pilih provinsi</option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="regency_id">
                    Kabupaten / Kota
                  </label>
                  <select
                    id="regency_id"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                    value={formState.regency_id}
                    onChange={(event) => handleRegencyChange(event.target.value)}
                    disabled={!formState.province_id}
                  >
                    <option value="">Pilih kabupaten / kota</option>
                    {regencies.map((regency) => (
                      <option key={regency.id} value={regency.id}>
                        {regency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 ml-1" htmlFor="base_location_city">
                    Detail Alamat
                  </label>
                  <input
                    id="base_location_city"
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                    type="text"
                    value={formState.base_location_city}
                    onChange={(event) => handleChange("base_location_city", event.target.value)}
                    placeholder="Contoh: Jl. Raya Cikunir No. 12, Tasikmalaya"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Layanan / Spesialisasi</h4>
                  <p className="text-sm text-gray-500">Pilih layanan yang ingin ditampilkan di profil provider.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {serviceTypes.map((serviceType) => (
                    <label
                      key={serviceType.id}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition-colors ${
                        selectedServiceTypeIds.includes(serviceType.id)
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceTypeIds.includes(serviceType.id)}
                        onChange={() => handleSpecializationToggle(serviceType.id)}
                        className="h-4 w-4 text-green-600"
                      />
                      <span className="text-sm font-medium text-gray-700">{serviceType.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Sertifikat Provider</h4>
                  <p className="text-sm text-gray-500">Upload sertifikat baru atau hapus sertifikat lama dari daftar berikut.</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setCertificateFile(event.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-xl file:border-0 file:bg-green-600 file:px-4 file:py-2 file:text-white hover:file:bg-green-700"
                  />
                  <p className="text-xs text-gray-500">Format yang didukung: PDF, JPG, JPEG, PNG.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {certifications.length > 0 ? (
                    certifications.map((certification) => (
                      <div key={certification.id} className="rounded-2xl border border-gray-200 p-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Sertifikat</p>
                          <p className="text-xs text-gray-500 break-all">{certification.file_url || "-"}</p>
                          <p className="text-xs text-gray-400 mt-1">Status: {certification.verification_status || "-"}</p>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-bold text-red-600 hover:underline"
                          onClick={async () => {
                            const token = localStorage.getItem("accessToken");
                            if (!token) return;
                            const deleted = await deleteMyProviderCertificate(token, certification.id);
                            if (deleted) {
                              setCertifications((current) => current.filter((item) => item.id !== certification.id));
                            }
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada sertifikat yang terdaftar.</p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                {selectedServiceTypes.map((serviceType) => (
                  <span key={serviceType.id} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    {serviceType.name}
                  </span>
                ))}
              </div>

              <div className="pt-4">
                <button
                  className="w-full md:w-auto px-10 py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center group hover:bg-green-600 transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-green-600 text-3xl group-hover:text-white">event_available</span>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1 group-hover:text-white transition-colors">
              {bookings.length}
            </p>
            <p className="text-gray-500 font-bold text-sm group-hover:text-white/80 transition-colors uppercase tracking-wider">
              Total Booking
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center group hover:bg-green-600 transition-all duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-green-600 text-3xl group-hover:text-white">verified</span>
            </div>
            <p className="text-4xl font-black text-gray-900 mb-1 group-hover:text-white transition-colors">
              {completedCount}
            </p>
            <p className="text-gray-500 font-bold text-sm group-hover:text-white/80 transition-colors uppercase tracking-wider">
              Layanan Selesai
            </p>
          </div>

          <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
            <h4 className="text-green-800 font-bold text-lg mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>
              Informasi Akun
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between text-sm gap-4">
                <span className="text-green-700/60 font-medium">Nama</span>
                <span className="text-green-700 font-bold text-right">{profileUser?.full_name || "-"}</span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-green-700/60 font-medium">Email</span>
                <span className="text-green-700 font-bold break-all text-right">{profileUser?.email || "-"}</span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-green-700/60 font-medium">Role</span>
                <span className="text-green-700 font-bold capitalize text-right">{profileUser?.role || "provider"}</span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-green-700/60 font-medium">Harga per jam</span>
                <span className="text-green-700 font-bold text-right">
                  {provider.price_per_hour ? formatCurrency(provider.price_per_hour) : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm gap-4">
                <span className="text-green-700/60 font-medium">Sertifikat</span>
                <span className="text-green-700 font-bold text-right">{certifications.length}</span>
              </div>
              <div className="pt-4 border-t border-green-200">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-all active:scale-95"
                >
                  Keluar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">schedule</span>
              Ketersediaan
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              {availabilities.length > 0 ? (
                availabilities.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
                    <div>
                      <div className="text-sm font-semibold">{dayNames[a.day_of_week]} {a.start_time} - {a.end_time}</div>
                      <div className="text-xs text-gray-500">{a.is_active ? "Aktif" : "Tidak aktif"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-xs font-medium text-green-600"
                        onClick={() => setEditingAvailabilityId(a.id)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600"
                        onClick={() => handleDeleteAvailability(a.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada ketersediaan terdaftar.</p>
              )}

              {editingAvailabilityId && (
                <div className="p-3 border rounded-lg bg-gray-50">
                  {(() => {
                    const item = availabilities.find((x) => x.id === editingAvailabilityId);
                    if (!item) return null;
                    return (
                      <div className="space-y-2">
                        <select
                          value={item.day_of_week}
                          onChange={(e) => handleUpdateAvailability(item.id, { day_of_week: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded border"
                        >
                          {dayNames.map((d, idx) => (
                            <option key={d} value={idx}>{d}</option>
                          ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="time" defaultValue={item.start_time} onBlur={(e) => handleUpdateAvailability(item.id, { start_time: e.target.value })} className="px-3 py-2 rounded border" />
                          <input type="time" defaultValue={item.end_time} onBlur={(e) => handleUpdateAvailability(item.id, { end_time: e.target.value })} className="px-3 py-2 rounded border" />
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked={!!item.is_active} onChange={(e) => handleUpdateAvailability(item.id, { is_active: e.target.checked })} />
                            Aktif
                          </label>
                          <button type="button" className="ml-auto text-sm text-gray-600" onClick={() => setEditingAvailabilityId(null)}>Tutup</button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="pt-3 border-t"></div>
              <div className="space-y-2">
                <div className="text-sm font-semibold">Tambah Ketersediaan Baru</div>
                <select value={newAvailability.day_of_week} onChange={(e) => setNewAvailability((s) => ({ ...s, day_of_week: Number(e.target.value) }))} className="w-full px-3 py-2 rounded border">
                  {dayNames.map((d, idx) => (
                    <option key={d} value={idx}>{d}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <input type="time" value={newAvailability.start_time} onChange={(e) => setNewAvailability((s) => ({ ...s, start_time: e.target.value }))} className="px-3 py-2 rounded border" />
                  <input type="time" value={newAvailability.end_time} onChange={(e) => setNewAvailability((s) => ({ ...s, end_time: e.target.value }))} className="px-3 py-2 rounded border" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newAvailability.is_active} onChange={(e) => setNewAvailability((s) => ({ ...s, is_active: e.target.checked }))} /> Aktif
                </label>
                <div className="flex justify-end">
                  <button type="button" onClick={handleAddAvailability} className="px-4 py-2 bg-green-600 text-white rounded">Tambah</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
