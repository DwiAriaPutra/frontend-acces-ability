"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getProviders } from "@/api";
import type { Provider } from "@/api";

type ProviderStatus = "pending" | "approved" | "rejected";

const statusMeta: Record<
  "all" | ProviderStatus,
  { label: string; chip: string }
> = {
  all: {
    label: "Semua",
    chip: "border-gray-200 bg-white text-gray-700",
  },
  pending: {
    label: "Pending",
    chip: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    chip: "border-rose-200 bg-rose-50 text-rose-700",
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

const formatExperience = (years?: number | null) => {
  if (years === undefined || years === null) {
    return "Pengalaman belum ditampilkan";
  }

  return `${years} tahun pengalaman`;
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
  const [listLoading, setListLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProviderStatus>("pending");
  const [listMessage, setListMessage] = useState<string | null>(null);

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

  if (isBootstrapping || listLoading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="font-medium text-gray-500">Memuat antrian verifikasi provider...</p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] flex-col items-center justify-center space-y-4 p-4 sm:p-6 lg:p-8 text-center">
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
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="space-y-4">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <Link
                href="/dashboard/admin"
                className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Kembali ke admin dashboard
              </Link>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Verifikasi Provider</h1>
              <p className="max-w-3xl text-gray-600">
                Pilih provider dari daftar untuk membuka halaman tinjauan terpisah.
                Selamat datang, {userName}.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 md:w-auto md:grid-cols-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Total</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{summaryCounts.total}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Pending</p>
                <p className="mt-1 text-2xl font-bold text-amber-700">{summaryCounts.pending}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Approved</p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">{summaryCounts.approved}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Rejected</p>
                <p className="mt-1 text-2xl font-bold text-rose-700">{summaryCounts.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
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

          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
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
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Daftar Provider</h2>
            <p className="text-sm text-gray-500">
              {filteredProviders.length} provider ditampilkan
            </p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Klik kartu untuk meninjau
          </p>
        </div>

        <div className="p-4">
          {filteredProviders.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {filteredProviders.map((provider) => {
                const providerName = getProviderName(provider);
                const avatar = getProviderAvatar(provider);
                const status = normalizeStatus(provider.verification_status);
                const providerServices = getSpecializationNames(provider);

                return (
                  <Link
                    key={provider.id}
                    href={`/dashboard/admin/verification/${provider.id}`}
                    className="group rounded-2xl border border-gray-100 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-green-100 hover:bg-gray-50 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <img
                        src={avatar}
                        alt={providerName}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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
                        <div className="flex flex-wrap gap-2 pt-1">
                          {providerServices.length > 0 ? (
                            providerServices.slice(0, 3).map((service) => (
                              <span
                                key={service}
                                className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                              >
                                {service}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              Belum ada spesialisasi
                            </span>
                          )}
                        </div>
                        <div className="inline-flex items-center gap-1 pt-2 text-sm font-bold text-green-600">
                          Tinjau provider
                          <span className="material-symbols-outlined text-base transition-transform group-hover:translate-x-1">
                            arrow_forward
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
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
      </section>
    </div>
  );
}
