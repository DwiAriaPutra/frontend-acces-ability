/*
Header: Certification Status Helpers
Tujuan: Menyamakan pembacaan status sertifikasi dari berbagai bentuk response API.
*/

export type CertificationStatus = "pending" | "approved" | "rejected";

export type CertificationLike = {
  verification_status?: string | null;
  is_verified?: boolean | null;
};

export const normalizeCertificationStatus = (
  certification?: CertificationLike | null
): CertificationStatus => {
  const normalized = (certification?.verification_status || "pending").toLowerCase();

  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  if (certification?.is_verified) {
    return "approved";
  }

  return "pending";
};

export const getCertificationStatusLabel = (status: CertificationStatus) => {
  switch (status) {
    case "approved":
      return "Terverifikasi";
    case "rejected":
      return "Ditolak";
    default:
      return "Menunggu Review";
  }
};
