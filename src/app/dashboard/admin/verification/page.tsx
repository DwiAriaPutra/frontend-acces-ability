"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import CertPreviewModal from "@/components/CertPreviewModal";
import { getProviderDetail, getProviders, verifyProvider } from "@/api";
import type { Provider } from "@/api";

type ProviderStatus = "pending" | "approved" | "rejected";
type VerificationAction = "approved" | "rejected";

type ProviderCertificate = {
  id: string;
  file_url?: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
};

type ProviderWithCertificates = Provider & {
  certifications?: ProviderCertificate[];
  provider_certifications?: ProviderCertificate[];
  certification_items?: ProviderCertificate[];
};

const statusMeta: Record<
  "all" | ProviderStatus,
  { label: string; chip: string; countChip: string }
> = {
  all: {
    label: "Semua",
    chip: "border-gray-200 bg-white text-gray-700",
    countChip: "bg-gray-100 text-gray-700",
  },
  pending: {
    label: "Pending",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
    countChip: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Approved",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    countChip: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    chip: "border-rose-200 bg-rose-50 text-rose-700",
    countChip: "bg-rose-100 text-rose-700",
  },
};

const normalizeStatus = (value?: string | null): ProviderStatus => {
  const normalized = (value || "pending").toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
};

const getProviderName = (provider: Provider) =>
  provider.user?.full_name || provider.full_name || "Provider";

const getProviderAvatar = (provider: Provider) => {
  const providerName = getProviderName(provider);
  return (
    provider.user?.image_url ||
    provider.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      providerName
    )}&background=008000&color=fff`
  );
};

const getSpecializationNames = (provider?: Provider | null) => {
  type SpecializationItem = { serviceType?: { name?: string } };

  return (
    (provider?.specializations as SpecializationItem[] | undefined)
      ?.map((item) => item?.serviceType?.name)
      .filter((name): name is string => Boolean(name)) || []
  );
};

const getProviderCertifications = (provider?: Provider | null) => {
  const providerWithCerts = provider as ProviderWithCertificates | undefined;

  return (
    providerWithCerts?.certifications ||
    providerWithCerts?.provider_certifications ||
    providerWithCerts?.certification_items ||
    []
  );
};

const formatExperience = (years?: number | null) => {
  if (years === undefined || years === null) {
    return "Pengalaman belum ditampilkan";
  }

  return `${years} tahun pengalaman`;
};

const formatAvailabilityDay = (dayOfWeek?: number) => {
  const dayMap: Record<number, string> = {
    0: "Minggu",
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
  };

  if (typeof dayOfWeek !== "number") {
    return "Hari tidak diketahui";
  }

  return dayMap[dayOfWeek] || `Hari ${dayOfWeek}`;
};

const formatCurrency = (value?: number | string | null) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return `Rp ${numericValue.toLocaleString("id-ID")}`;
};

const sortProviders = (providers: Provider[]) => {
  const statusOrder: Record<ProviderStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  return [...providers].sort((left, right) => {
    const leftStatus = statusOrder[normalizeStatus(left.verification_status)];
    const rightStatus = statusOrder[normalizeStatus(right.verification_status)];

    if (leftStatus !== rightStatus) {
      return leftStatus - rightStatus;
    }

    return getProviderName(left).localeCompare(getProviderName(right));
  });
};

export default function ProviderVerificationPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("Admin");
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<Provider | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProviderStatus>("pending");
  const [listMessage, setListMessage] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<VerificationAction | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      setUnauthorized(true);
      setIsBootstrapping(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);

      if (user.role !== "admin") {
        setUnauthorized(true);
        setIsBootstrapping(false);
        setTimeout(() => router.push("/dashboard/user"), 1500);
        return;
      }

      if (user.full_name) {
        setUserName(user.full_name);
      }
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      setUnauthorized(true);
      setIsBootstrapping(false);
      return;
    }

    setIsBootstrapping(false);
  }, [router]);

  useEffect(() => {
    if (isBootstrapping || unauthorized) {
      return;
    }

    let cancelled = false;

    const loadProviders = async () => {
      setListLoading(true);
      setListMessage(null);

      try {
        const firstPage = await getProviders({ verifiedOnly: false, limit: 50, page: 1 });
        const firstItems = Array.isArray(firstPage) ? firstPage : firstPage.items;

        let allProviders = [...firstItems];

        if (!Array.isArray(firstPage) && firstPage.pagination.total_pages > 1) {
          const additionalPages = Array.from(
            { length: firstPage.pagination.total_pages - 1 },
            (_, index) => index + 2
          );

          const additionalResults = await Promise.all(
            additionalPages.map((page) =>
              getProviders({ verifiedOnly: false, limit: 50, page })
            )
          );

          additionalResults.forEach((result) => {
            const items = Array.isArray(result) ? result : result.items;
            allProviders = allProviders.concat(items);
          });
        }

        if (!cancelled) {
          setProviders(sortProviders(allProviders));
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[Admin Verification] Failed to load providers", error);
          setListMessage("Gagal memuat daftar provider.");
        }
      } finally {
        if (!cancelled) {
          setListLoading(false);
        }
      }
    };

    void loadProviders();

    return () => {
      cancelled = true;
    };
  }, [isBootstrapping, unauthorized]);

  const filteredProviders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return providers.filter((provider) => {
      const status = normalizeStatus(provider.verification_status);

      if (statusFilter !== "all" && status !== statusFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const serviceNames = getSpecializationNames(provider).join(" ").toLowerCase();
      const haystack = [
        getProviderName(provider),
        provider.base_location_city || "",
        provider.province_name || "",
        provider.regency_name || "",
        serviceNames,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [providers, searchTerm, statusFilter]);

  const selectedProviderSummary =
    filteredProviders.find((provider) => provider.id === selectedProviderId) ||
    providers.find((provider) => provider.id === selectedProviderId) ||
    null;

  useEffect(() => {
    if (filteredProviders.length === 0) {
      setSelectedProviderId(null);
      return;
    }

    const stillVisible =
      selectedProviderId !== null &&
      filteredProviders.some((provider) => provider.id === selectedProviderId);

    if (!stillVisible) {
      setSelectedProviderId(filteredProviders[0].id);
    }
  }, [filteredProviders, selectedProviderId]);

  useEffect(() => {
    if (!selectedProviderId) {
      setSelectedProviderDetail(null);
      setDetailLoading(false);
      return;
    }

    let cancelled = false;

    const loadSelectedProvider = async () => {
      setDetailLoading(true);
      setDetailMessage(null);

      const detail = await getProviderDetail(selectedProviderId);

      if (cancelled) {
        return;
      }

      if (!detail) {
        setSelectedProviderDetail(null);
        setDetailMessage("Detail provider tidak ditemukan.");
      } else {
        setSelectedProviderDetail(detail);
      }

      setDetailLoading(false);
    };

    void loadSelectedProvider();

    return () => {
      cancelled = true;
    };
  }, [selectedProviderId]);

  const refreshSelectedStatus = async (
    providerId: string,
    verificationStatus: ProviderStatus
  ) => {
    setProviders((currentProviders) =>
      currentProviders.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              verification_status: verificationStatus,
              is_verified: verificationStatus === "approved",
            }
          : provider
      )
    );

    if (selectedProviderId === providerId) {
      setSelectedProviderDetail((currentDetail) =>
        currentDetail
          ? {
              ...currentDetail,
              verification_status: verificationStatus,
              is_verified: verificationStatus === "approved",
            }
          : currentDetail
      );
    }
  };

  const handleVerification = async (verificationStatus: VerificationAction) => {
    const token = localStorage.getItem("accessToken");

    if (!token || !selectedProviderId) {
      setActionMessage("Sesi admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    const actionLabel = verificationStatus === "approved" ? "menyetujui" : "menolak";
    const confirmed = window.confirm(
      `Yakin ingin ${actionLabel} pengajuan provider ini?`
    );

    if (!confirmed) {
      return;
    }

    setActionBusy(verificationStatus);
    setActionMessage(null);

    try {
      const updatedProvider = await verifyProvider(
        token,
        selectedProviderId,
        verificationStatus
      );

      if (!updatedProvider) {
        setActionMessage("Gagal memperbarui status verifikasi provider.");
        return;
      }

      await refreshSelectedStatus(selectedProviderId, verificationStatus);
      setActionMessage(
        `Provider berhasil ${verificationStatus === "approved" ? "disetujui" : "ditolak"}.`
      );

      const refreshedDetail = await getProviderDetail(selectedProviderId);
      if (refreshedDetail) {
        setSelectedProviderDetail(refreshedDetail);
      } else {
        setSelectedProviderDetail(updatedProvider);
      }
    } catch (error) {
      console.error("[Admin Verification] Verification failed", error);
      setActionMessage("Terjadi kesalahan saat memproses verifikasi provider.");
    } finally {
      setActionBusy(null);
    }
  };

  const summaryCounts = useMemo(() => {
    return providers.reduce(
      (accumulator, provider) => {
        const status = normalizeStatus(provider.verification_status);
        accumulator.total += 1;
        accumulator[status] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [providers]);

  const activeProvider = selectedProviderDetail || selectedProviderSummary;
  const activeStatus = normalizeStatus(activeProvider?.verification_status);
  const activeCertifications = getProviderCertifications(activeProvider);
  const activeSpecializations = getSpecializationNames(activeProvider);

  if (isBootstrapping || listLoading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="font-medium text-gray-500">Memuat antrian verifikasi provider...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] flex-col items-center justify-center space-y-4 p-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50">
          <span className="material-symbols-outlined text-5xl text-red-600">lock</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Akses Ditolak</h1>
        <p className="text-gray-600">Halaman ini hanya tersedia untuk admin.</p>
        <Link href="/dashboard/user" className="font-semibold text-green-600">
          Kembali ke dashboard user
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8 p-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Kembali ke admin dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Verifikasi Provider</h1>
            <p className="max-w-3xl text-gray-600">
              Tinjau profil, sertifikat, dan status pengajuan provider sebelum
              mereka aktif di platform. Selamat datang, {userName}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{summaryCounts.total}</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Pending</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{summaryCounts.pending}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Approved</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{summaryCounts.approved}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Rejected</p>
              <p className="mt-1 text-2xl font-bold text-rose-700">{summaryCounts.rejected}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <span className="material-symbols-outlined text-gray-400">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Cari nama provider, kota, atau layanan"
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  statusFilter === status
                    ? statusMeta[status].chip
                    : "border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:text-green-700"
                }`}
              >
                {statusMeta[status].label}
              </button>
            ))}
          </div>
        </div>

        {listMessage ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {listMessage}
          </div>
        ) : null}

        {actionMessage ? (
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {actionMessage}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Daftar Provider</h2>
              <p className="text-sm text-gray-500">
                {filteredProviders.length} provider ditampilkan
              </p>
            </div>
            {listLoading ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Memuat
              </span>
            ) : null}
          </div>

          <div className="max-h-[calc(100vh-22rem)] overflow-y-auto p-4">
            {filteredProviders.length > 0 ? (
              <div className="space-y-3">
                {filteredProviders.map((provider) => {
                  const providerName = getProviderName(provider);
                  const avatar = getProviderAvatar(provider);
                  const status = normalizeStatus(provider.verification_status);
                  const providerServices = getSpecializationNames(provider);
                  const isSelected = provider.id === selectedProviderId;

                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => setSelectedProviderId(provider.id)}
                      className={`w-full rounded-3xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-green-200 bg-green-50 shadow-sm"
                          : "border-gray-100 bg-white hover:border-green-100 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={avatar}
                          alt={providerName}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold text-gray-900">
                                {providerName}
                              </h3>
                              <p className="truncate text-sm text-gray-500">
                                {provider.base_location_city || "Lokasi belum tersedia"}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${statusMeta[status].chip}`}
                            >
                              {status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
                            <span className="rounded-full bg-gray-100 px-3 py-1">
                              {formatCurrency(provider.price_per_hour)}/jam
                            </span>
                            <span className="rounded-full bg-gray-100 px-3 py-1">
                              {formatExperience(provider.years_experience)}
                            </span>
                          </div>
                          {providerServices.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {providerServices.slice(0, 3).map((service) => (
                                <span
                                  key={service}
                                  className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Tidak ada provider</h3>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Coba ubah filter status atau kata kunci pencarian untuk menemukan pengajuan provider.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            {activeProvider ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={getProviderAvatar(activeProvider)}
                      alt={getProviderName(activeProvider)}
                      className="h-24 w-24 rounded-3xl object-cover"
                    />
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {getProviderName(activeProvider)}
                        </h2>
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusMeta[activeStatus].chip}`}
                        >
                          {activeStatus}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm font-medium text-gray-600">
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {activeProvider.base_location_city || "Lokasi belum tersedia"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          {formatCurrency(activeProvider.price_per_hour)}/jam
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1">
                          Rating {Number(activeProvider.avg_rating ?? activeProvider.rating ?? 0).toFixed(1)}
                        </span>
                      </div>
                      <p className="max-w-3xl text-sm leading-7 text-gray-600">
                        {activeProvider.bio || "Belum ada deskripsi profil provider."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleVerification("approved")}
                      disabled={actionBusy !== null || activeStatus !== "pending"}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-base">check</span>
                      {actionBusy === "approved" ? "Menyetujui..." : "Setujui"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleVerification("rejected")}
                      disabled={actionBusy !== null || activeStatus !== "pending"}
                      className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      {actionBusy === "rejected" ? "Menolak..." : "Tolak"}
                    </button>
                  </div>
                </div>

                {activeStatus !== "pending" ? (
                  <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Pengajuan ini sudah diproses. Tombol verifikasi dinonaktifkan.
                  </div>
                ) : null}

                {detailLoading ? (
                  <div className="mt-5 rounded-3xl border border-gray-100 bg-gray-50 p-6">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-green-600" />
                      <p className="text-sm font-medium">Memuat detail provider...</p>
                    </div>
                  </div>
                ) : null}

                {detailMessage ? (
                  <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                    {detailMessage}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Pengalaman
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {formatExperience(activeProvider.years_experience)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Ulasan
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {Number(activeProvider.total_reviews || 0)} ulasan
                    </p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Wilayah
                    </p>
                    <p className="mt-2 text-sm font-semibold text-gray-900">
                      {activeProvider.regency_name && activeProvider.province_name
                        ? `${activeProvider.regency_name}, ${activeProvider.province_name}`
                        : activeProvider.base_location_city || "Belum diisi"}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                  <span className="material-symbols-outlined text-3xl">assignment_ind</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Pilih provider untuk ditinjau</h2>
                <p className="mt-2 max-w-md text-sm text-gray-500">
                  Detail profil, sertifikat, dan aksi verifikasi akan muncul di panel ini.
                </p>
              </div>
            )}
          </div>

          {activeProvider ? (
            <>
              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">Spesialisasi</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activeSpecializations.length > 0 ? (
                    activeSpecializations.map((specialization) => (
                      <span
                        key={specialization}
                        className="rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
                      >
                        {specialization}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada spesialisasi yang ditautkan.</p>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Sertifikasi</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Tinjau lampiran sertifikat sebelum menyetujui pengajuan provider.
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {activeCertifications.length} sertifikat
                  </span>
                </div>

                <div className="mt-4">
                  <CertPreviewModal certifications={activeCertifications} />
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900">Jadwal Tersedia</h3>
                <div className="mt-4 space-y-3">
                  {activeProvider.availabilities && activeProvider.availabilities.length > 0 ? (
                    activeProvider.availabilities.map((availability) => {
                      const schedule = availability as {
                        id?: string;
                        day_of_week?: number;
                        start_time?: string;
                        end_time?: string;
                        is_active?: boolean;
                      };

                      return (
                        <div
                          key={schedule.id || `${schedule.day_of_week}-${schedule.start_time}`}
                          className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                        >
                          <span className="font-semibold text-gray-800">
                            {formatAvailabilityDay(schedule.day_of_week)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {schedule.start_time || "--:--"} - {schedule.end_time || "--:--"}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada jadwal tersedia.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}