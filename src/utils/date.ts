/**
Header: Date/Time Formatting Utilities
Tujuan: Format timestamp ISO string ke format user-friendly (relative time, local date).
Caller: Berbagai komponen yang menampilkan created_at, updated_at, atau timestamp lainnya.
Main Functions: formatRelativeTime, formatLocalDate, formatDateTime.
*/

/**
 * Format ISO timestamp menjadi relative time (e.g., "5 menit lalu", "2 hari lalu")
 * @param dateString - ISO or valid date string
 * @returns User-friendly relative time string atau empty string jika invalid
 */
export const formatRelativeTime = (dateString?: string | null): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 0) return "Akan datang";
    if (seconds < 60) return "Baru saja";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;

    // Fallback ke format tanggal lokal
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * Format ISO timestamp menjadi format tanggal lokal Indonesia
 * @param dateString - ISO or valid date string
 * @returns Format: "15 Mei 2026" atau empty string jika invalid
 */
export const formatLocalDate = (dateString?: string | null): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

/**
 * Format ISO timestamp menjadi format tanggal + waktu lokal
 * @param dateString - ISO or valid date string
 * @returns Format: "15 Mei 2026, 14:30" atau empty string jika invalid
 */
export const formatDateTime = (dateString?: string | null): string => {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

/**
 * Determine file type dari URL
 * @param url - File URL
 * @returns File type: "pdf" | "image" | "unknown"
 */
export const getFileType = (url?: string): "pdf" | "image" | "unknown" => {
  if (!url) return "unknown";
  const lower = url.toLowerCase();
  if (lower.includes(".pdf") || lower.includes("application/pdf")) return "pdf";
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return "image";
  return "unknown";
};
