"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CertPreviewModal from "@/components/CertPreviewModal";
import { getProviderDetail, verifyCertification, verifyProvider } from "@/api";
import type { Provider } from "@/api";
import { showAppNotification } from "@/utils/notifications";

type ProviderStatus = "pending" | "approved" | "rejected";
type VerificationAction = "approved" | "rejected";

type ProviderCertificate = {
  id: string;
  file_url?: string;
  is_verified?: boolean;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
};

type ProviderWithCertificates = Provider & {
  certifications?: ProviderCertificate[];
  provider_certifications?: ProviderCertificate[];
  certification_items?: ProviderCertificate[];
};

const statusMeta: Record<ProviderStatus, { chip: string }> = {
  pending: {
    chip: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
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

const normalizeCertificationStatus = (certification?: ProviderCertificate | null) => {
  const normalized = (certification?.verification_status || "pending").toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  if (certification?.is_verified) {
    return "approved";
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

export default function ProviderVerificationDetailPage() {
  const router = useRouter();
  const params = useParams<{ providerId: string }>();
  const providerId = params?.providerId;
  const [provider, setProvider] = useState<ProviderWithCertificates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<VerificationAction | null>(null);
  const [certActionBusy, setCertActionBusy] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    certId: string;
    isVerifying: boolean;
  } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);

      if (user.role !== "admin") {
        setUnauthorized(true);
        setIsLoading(false);
        setTimeout(() => router.push("/dashboard/user"), 1500);
        return;
      }
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      setUnauthorized(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadProvider = async () => {
      setIsLoading(true);
      setDetailMessage(null);

      const detail = await getProviderDetail(providerId);

      if (cancelled) {
        return;
      }

      if (!detail) {
        setProvider(null);
        setDetailMessage("Detail provider tidak ditemukan.");
      } else {
        setProvider(detail);
      }

      setIsLoading(false);
    };

    if (providerId) {
      void loadProvider();
    }

    return () => {
      cancelled = true;
    };
  }, [providerId, router]);

  const activeStatus = normalizeStatus(provider?.verification_status);
  const certifications = getProviderCertifications(provider);
  const specializations = getSpecializationNames(provider);

  const pendingCertificateCount = useMemo(
    () =>
      certifications.filter(
        (certification) => normalizeCertificationStatus(certification) === "pending"
      ).length,
    [certifications]
  );

  const updateCertificationStatus = (certificationId: string, isVerified: boolean) => {
    setProvider((currentProvider) => {
      if (!currentProvider) return currentProvider;

      const updatedCert = {
        is_verified: isVerified,
        verification_status: isVerified ? "approved" : "rejected",
      };
      const result: ProviderWithCertificates = { ...currentProvider };

      if (currentProvider.certifications) {
        result.certifications = currentProvider.certifications.map((cert) =>
          cert.id === certificationId ? { ...cert, ...updatedCert } : cert
        );
      }
      if (currentProvider.provider_certifications) {
        result.provider_certifications = currentProvider.provider_certifications.map((cert) =>
          cert.id === certificationId ? { ...cert, ...updatedCert } : cert
        );
      }
      if (currentProvider.certification_items) {
        result.certification_items = currentProvider.certification_items.map((cert) =>
          cert.id === certificationId ? { ...cert, ...updatedCert } : cert
        );
      }

      return result;
    });
  };

  const handleVerification = async (verificationStatus: VerificationAction) => {
    const token = localStorage.getItem("accessToken");

    if (!token || !providerId || !provider) {
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
        providerId,
        verificationStatus
      );

      if (!updatedProvider) {
        setActionMessage("Gagal memperbarui status verifikasi provider.");
        return;
      }

      setProvider((currentProvider) =>
        currentProvider
          ? {
              ...currentProvider,
              ...updatedProvider,
              verification_status: verificationStatus,
              is_verified: verificationStatus === "approved",
            }
          : currentProvider
      );
      setActionMessage(
        `Provider berhasil ${verificationStatus === "approved" ? "disetujui" : "ditolak"}.`
      );
      showAppNotification(
        verificationStatus === "approved"
          ? "Provider Disetujui"
          : "Provider Ditolak",
        {
          body: `${getProviderName(updatedProvider)} berhasil ${
            verificationStatus === "approved" ? "disetujui" : "ditolak"
          }.`,
          tag: `provider-verification-${providerId}`,
          url: `/dashboard/admin/verification/${providerId}`,
        }
      );
    } catch (error) {
      console.error("[Admin Verification] Verification failed", error);
      setActionMessage("Terjadi kesalahan saat memproses verifikasi provider.");
    } finally {
      setActionBusy(null);
    }
  };

  const handleCertificationVerification = (certificationId: string, isVerified: boolean) => {
    setConfirmDialog({
      certId: certificationId,
      isVerifying: isVerified,
    });
  };

  const handleConfirmCertification = async () => {
    if (!confirmDialog) return;

    const { certId, isVerifying } = confirmDialog;
    const token = localStorage.getItem("accessToken");

    if (!token || !providerId) {
      setActionMessage("Sesi admin tidak ditemukan. Silakan login ulang.");
      setConfirmDialog(null);
      return;
    }

    setCertActionBusy(certId);
    setActionMessage(null);
    setConfirmDialog(null);

    try {
      const updatedCertification = await verifyCertification(
        token,
        certId,
        isVerifying
      );

      if (!updatedCertification) {
        setActionMessage("Gagal memperbarui status verifikasi sertifikasi.");
        return;
      }

      updateCertificationStatus(certId, isVerifying);
      setActionMessage(
        `Sertifikasi berhasil ${isVerifying ? "disetujui" : "ditolak"}.`
      );
      showAppNotification(
        isVerifying ? "Sertifikat Disetujui" : "Sertifikat Ditolak",
        {
          body: `Status sertifikat provider berhasil ${
            isVerifying ? "disetujui" : "ditolak"
          }.`,
          tag: `certification-verification-${certId}`,
          url: `/dashboard/admin/verification/${providerId}`,
        }
      );
    } catch (error) {
      console.error("[Admin Verification] Certification verification failed", error);
      setActionMessage("Terjadi kesalahan saat memproses verifikasi sertifikasi.");
    } finally {
      setCertActionBusy(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1200px] items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600" />
          <p className="font-medium text-gray-500">Memuat detail provider...</p>
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

  if (!provider) {
    return (
      <div className="mx-auto max-w-[1200px] p-4 sm:p-6 lg:p-8">
        <div className="rounded-3xl border border-amber-100 bg-amber-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-amber-900">Provider tidak ditemukan</h1>
          <p className="mt-2 text-amber-700">{detailMessage || "Detail provider tidak tersedia."}</p>
          <Link
            href="/dashboard/admin/verification"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700"
          >
            Kembali ke daftar provider
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link
              href="/dashboard/admin/verification"
              className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Kembali ke daftar provider
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <img
                src={getProviderAvatar(provider)}
                alt={getProviderName(provider)}
                className="h-24 w-24 rounded-3xl object-cover"
              />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {getProviderName(provider)}
                  </h1>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusMeta[activeStatus].chip}`}
                  >
                    {activeStatus}
                  </span>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600">
                  {provider.bio || "Belum ada deskripsi profil provider."}
                </p>
              </div>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:flex lg:flex-wrap">
            <button
              type="button"
              onClick={() => void handleVerification("approved")}
              disabled={actionBusy !== null || activeStatus !== "pending"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-base">check</span>
              {actionBusy === "approved" ? "Menyetujui..." : "Setujui"}
            </button>
            <button
              type="button"
              onClick={() => void handleVerification("rejected")}
              disabled={actionBusy !== null || activeStatus !== "pending"}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
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

        {actionMessage ? (
          <div
            className={`mt-5 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
              actionMessage.toLowerCase().includes("gagal") ||
              actionMessage.toLowerCase().includes("terjadi") ||
              actionMessage.toLowerCase().includes("sesi")
                ? "border-rose-100 bg-rose-50 text-rose-700"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            <span className="material-symbols-outlined mt-0.5 text-base">
              {actionMessage.toLowerCase().includes("gagal") ||
              actionMessage.toLowerCase().includes("terjadi") ||
              actionMessage.toLowerCase().includes("sesi")
                ? "error"
                : "check_circle"}
            </span>
            <p>{actionMessage}</p>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Tarif</p>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatCurrency(provider.price_per_hour)}/jam
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Pengalaman</p>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {formatExperience(provider.years_experience)}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Wilayah</p>
          <p className="mt-2 text-lg font-bold text-gray-900">
            {provider.regency_name && provider.province_name
              ? `${provider.regency_name}, ${provider.province_name}`
              : provider.base_location_city || "Belum diisi"}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Verifikasi Sertifikat</h2>
            <p className="mt-1 text-sm text-gray-500">
              {pendingCertificateCount} sertifikat masih menunggu keputusan.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {certifications.length} sertifikat
          </span>
        </div>

        {certifications.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            Belum ada sertifikasi yang diunggah provider.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {certifications.map((certification) => {
              const certStatus = normalizeCertificationStatus(certification);
              const certBusy = certActionBusy === certification.id;

              return (
                <div
                  key={certification.id}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        Sertifikat {certification.id.slice(0, 8)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {certification.created_at || "Tanggal upload tidak tersedia"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        certStatus === "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : certStatus === "rejected"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {certStatus}
                    </span>
                  </div>

                  {certification.file_url ? (
                    <a
                      href={certification.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 block overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                      <img
                        src={certification.file_url}
                        alt="Sertifikasi provider"
                        className="h-48 w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
                      File sertifikat tidak tersedia.
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCertificationVerification(certification.id, true)}
                      disabled={certBusy || certStatus !== "pending"}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {certBusy ? "Memproses..." : "Verify"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCertificationVerification(certification.id, false)}
                      disabled={certBusy || certStatus !== "pending"}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Spesialisasi</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {specializations.length > 0 ? (
              specializations.map((specialization) => (
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
          <h2 className="text-xl font-bold text-gray-900">Jadwal Tersedia</h2>
          <div className="mt-4 space-y-3">
            {provider.availabilities && provider.availabilities.length > 0 ? (
              provider.availabilities.map((availability) => {
                const schedule = availability as {
                  id?: string;
                  day_of_week?: number;
                  start_time?: string;
                  end_time?: string;
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
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Preview Sertifikasi</h2>
            <p className="mt-1 text-sm text-gray-500">
              Buka lampiran sertifikat dalam tampilan preview.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <CertPreviewModal certifications={certifications} />
        </div>
      </section>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">
                {confirmDialog.isVerifying ? "Setujui Sertifikasi" : "Tolak Sertifikasi"}
              </h2>
            </div>

            <div className="px-6 py-6">
              <div className="mb-4 flex items-center justify-center">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-full ${
                    confirmDialog.isVerifying
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {confirmDialog.isVerifying ? "check_circle" : "warning"}
                  </span>
                </div>
              </div>
              <p className="text-center text-gray-600">
                {confirmDialog.isVerifying
                  ? "Apakah Anda yakin ingin menyetujui sertifikasi ini?"
                  : "Apakah Anda yakin ingin menolak sertifikasi ini?"}
              </p>
            </div>

            <div className="flex gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCertification()}
                disabled={certActionBusy === confirmDialog.certId}
                className={`flex-1 rounded-xl px-4 py-2.5 font-semibold text-white transition-all ${
                  confirmDialog.isVerifying
                    ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
                    : "bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400"
                } disabled:cursor-not-allowed`}
              >
                {certActionBusy === confirmDialog.certId ? "Memproses..." : "Konfirmasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
