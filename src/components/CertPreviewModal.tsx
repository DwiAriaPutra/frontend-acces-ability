/*
Header: Certification Preview Modal
Tujuan: Menampilkan daftar sertifikat provider beserta status verifikasi yang konsisten.
Update: Mendukung preview PDF dan format timestamp user-friendly.
*/

"use client";

import React, { useState } from "react";
import {
  getCertificationStatusLabel,
  normalizeCertificationStatus,
} from "@/utils/certification";
import { formatRelativeTime, getFileType } from "@/utils/date";

type CertItem = {
  id: string;
  file_url?: string;
  verification_status?: string;
  is_verified?: boolean;
  created_at?: string;
};

export default function CertPreviewModal({
  certifications,
}: {
  certifications: CertItem[];
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<CertItem | null>(null);

  const handleOpen = (c: CertItem) => {
    setActive(c);
    setOpen(true);
  };

  return (
    <div>
      <div className="mt-4 space-y-3">
        {certifications.length > 0 ? (
          certifications.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {c.file_url ? (
                    getFileType(c.file_url) === "pdf" ? (
                      <svg
                        className="w-6 h-6 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,15.5H16V17H8V15.5M8,12H16V13.5H8V12M8,18.5H13V20H8V18.5Z" />
                      </svg>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.file_url} alt={`Sertifikat ${c.id}`} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <span className="text-sm text-gray-500">No file</span>
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">Sertifikat</div>
                  {c.created_at ? <div className="text-xs text-gray-500">Diunggah: {formatRelativeTime(c.created_at)}</div> : null}
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div
                  className={`text-sm font-semibold ${
                    normalizeCertificationStatus(c) === "approved"
                      ? "text-green-600"
                      : normalizeCertificationStatus(c) === "rejected"
                        ? "text-rose-600"
                        : "text-amber-600"
                  }`}
                >
                  {getCertificationStatusLabel(normalizeCertificationStatus(c))}
                </div>
                {c.file_url ? (
                  <button onClick={() => handleOpen(c)} className="text-xs text-green-600 underline">Pratinjau</button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Provider belum mengunggah sertifikasi.</p>
        )}
      </div>

      {open && active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full bg-white rounded-lg overflow-hidden shadow-2xl max-h-[95vh] flex flex-col" style={{ maxWidth: "90vw", width: "calc(100% - 32px)" }}>
            <div className="p-4 md:p-6 flex items-center justify-between border-b">
              <h3 className="font-semibold text-lg">Pratinjau Sertifikat</h3>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-900 text-2xl">×</button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 p-4 md:p-8 flex items-center justify-center">
              {active.file_url ? (
                getFileType(active.file_url) === "pdf" ? (
                  <iframe
                    key={active.file_url}
                    src={active.file_url}
                    className="w-full h-full border-none"
                    title={`Sertifikat ${active.id}`}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.file_url} alt={`Sertifikat ${active.id}`} className="max-w-full max-h-full object-contain" />
                )
              ) : (
                <div className="text-center text-gray-500">Tidak ada file untuk ditampilkan.</div>
              )}
            </div>
            <div className="p-4 md:p-6 border-t bg-white flex items-center justify-end gap-3">
              {getFileType(active.file_url) === "pdf" ? (
                <>
                  <a href={active.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                    Buka di Tab Baru
                  </a>
                  <a href={active.file_url} download className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    Download
                  </a>
                </>
              ) : (
                <a href={active.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                  Buka di Tab Baru
                </a>
              )}
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition text-sm font-medium">
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
