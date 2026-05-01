"use client";

import React, { useState } from "react";

type CertItem = {
  id: string;
  file_url?: string;
  verification_status?: string;
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
                    // small thumb
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.file_url} alt={`Sertifikat ${c.id}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-gray-500">No file</span>
                  )}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-800">Sertifikat</div>
                  {c.created_at ? <div className="text-xs text-gray-500">Diunggah: {new Date(c.created_at).toLocaleDateString()}</div> : null}
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <div className={`text-sm font-semibold ${c.verification_status === 'verified' || c.verification_status === 'approved' ? 'text-green-600' : 'text-gray-600'}`}>
                  {c.verification_status || 'Belum Diverifikasi'}
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
          <div className="max-w-3xl w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="p-4 flex items-center justify-between border-b">
              <h3 className="font-semibold">Pratinjau Sertifikat</h3>
              <button onClick={() => setOpen(false)} className="text-gray-600">Tutup</button>
            </div>
            <div className="p-4">
              {active.file_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.file_url} alt={`Sertifikat ${active.id}`} className="w-full h-auto object-contain" />
              ) : (
                <div className="text-center text-gray-500">Tidak ada file untuk ditampilkan.</div>
              )}
            </div>
            <div className="p-4 border-t text-right">
              <a href={active.file_url} target="_blank" rel="noopener noreferrer" className="mr-3 text-sm text-green-600 underline">Buka di tab baru</a>
              <button onClick={() => setOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Tutup</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
