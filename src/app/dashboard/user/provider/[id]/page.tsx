"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProviderById, Provider } from "@/api";

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProvider = async () => {
      setIsLoading(true);
      try {
        const data = await getProviderById(id);
        setProvider(data);
      } catch (error) {
        console.error("Failed to fetch provider details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProvider();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="text-gray-500 font-medium">Memuat profil provider...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-4 text-center">
        <span className="material-symbols-outlined text-gray-300 text-8xl">person_off</span>
        <h3 className="text-2xl font-bold text-gray-900">Provider tidak ditemukan</h3>
        <button 
          onClick={() => router.back()}
          className="text-green-600 font-bold hover:underline"
        >
          Kembali ke pencarian
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-3 text-xl font-bold mb-8 hover:opacity-70 transition-opacity text-gray-900"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Kembali</span>
      </button>

      {/* Profile Container */}
      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 min-h-[800px] relative">
        {/* Header Stripe */}
        <div className="h-32 bg-green-600 w-full"></div>
        <div className="px-10 pb-16 pt-12 grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Left: Profile Card */}
          <div className="md:col-span-4">
            <div className="bg-white rounded-[24px] pt-12 pb-10 px-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col items-center text-center h-fit min-h-[480px]">
              <div className="w-[140px] h-[140px] rounded-full border-2 border-green-600 p-1 mb-6">
                <img
                  alt={provider.full_name}
                  className="w-full h-full rounded-full object-cover"
                  src={
                    provider.profile_image_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      provider.full_name
                    )}&background=008000&color=fff`
                  }
                />
              </div>
              <h2 className="text-[32px] font-bold text-gray-900 mb-1">
                {provider.full_name}
              </h2>
              <p className="text-green-600 font-medium text-[16px] mb-4">
                {provider.specializations?.[0]?.name || "Pendamping Professional"}
              </p>
              <div className="flex items-center gap-1 text-[13px] mb-2">
                <span
                  className="material-symbols-outlined text-yellow-400 text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
                <span className="font-bold text-gray-900">{provider.rating || "5.0"}</span>
                <span className="text-gray-500">( 90 Review )</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-[11px] mb-10">
                <span className="material-symbols-outlined text-[14px]">
                  location_on
                </span>
                <span>{provider.base_location_city || "Kota Tasikmalaya"}, Jawa Barat Indonesia</span>
              </div>
              <button className="w-full bg-green-600 text-white py-[14px] rounded-[10px] font-bold text-[16px] hover:bg-green-700 transition-colors shadow-[0_4px_12px_rgba(0,110,28,0.3)]">
                Booking Sekarang
              </button>
            </div>
          </div>
          {/* Right: Info Details */}
          <div className="md:col-span-8 flex flex-col gap-8 pl-4">
            {/* Tentang Saya */}
            <section>
              <h3 className="text-[20px] font-bold text-gray-900 mb-3">
                Tentang Saya
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px] max-w-2xl">
                {provider.bio || "Pendamping event berpengalaman dalam membantu penyandang disabilitas di berbagai acara. Siap memberikan dukungan mobilitas, koordinasi, dan kenyamanan selama kegiatan berlangsung."}
              </p>
            </section>
            {/* Keahlian */}
            <section>
              <h3 className="text-[20px] font-bold text-gray-900 mb-3">
                Keahlian
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.specializations && provider.specializations.length > 0 ? (
                  provider.specializations.map((spec) => (
                    <span
                      key={spec.id}
                      className="px-4 py-2 bg-gray-100 rounded-md text-gray-900 text-[13px] font-medium"
                    >
                      {spec.name}
                    </span>
                  ))
                ) : (
                  <>
                    <span className="px-4 py-2 bg-gray-100 rounded-md text-gray-900 text-[13px] font-medium">Komunikasi Inklusif Dasar</span>
                    <span className="px-4 py-2 bg-gray-100 rounded-md text-gray-900 text-[13px] font-medium">Koordinasi dan Manajemen Acara</span>
                  </>
                )}
              </div>
            </section>
            {/* Pengalaman */}
            <section>
              <h3 className="text-[20px] font-bold text-gray-900 mb-3">
                Pengalaman
              </h3>
              <p className="text-gray-600 leading-relaxed text-[15px] max-w-2xl">
                {provider.years_experience 
                  ? `Berpengalaman lebih dari ${provider.years_experience} tahun sebagai pendamping, terbiasa mendampingi penyandang disabilitas dalam berbagai acara formal dan informal.`
                  : "Berpengalaman lebih dari 5 tahun sebagai pendamping event, terbiasa mendampingi penyandang disabilitas dalam berbagai acara formal dan informal."}
              </p>
            </section>
            {/* Jadwal Ketersediaan */}
            <section>
              <h3 className="text-[20px] font-bold text-gray-900 mb-4">
                Jadwal Ketersediaan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                <div className="bg-gray-50 rounded-[12px] py-6 px-4 text-center">
                  <p className="text-green-600 font-bold text-[16px] mb-1">
                    Senin - Jum'at
                  </p>
                  <p className="text-gray-500 text-[14px]">08:00 - 17:00</p>
                </div>
                <div className="bg-gray-50 rounded-[12px] py-6 px-4 text-center">
                  <p className="text-green-600 font-bold text-[16px] mb-1">
                    Sabtu
                  </p>
                  <p className="text-gray-500 text-[14px]">09:00 - 15:00</p>
                </div>
              </div>
            </section>
            {/* Sertifikasi */}
            <section>
              <h3 className="text-[20px] font-bold text-gray-900 mb-4">
                Sertifikasi
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-green-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 text-[18px] font-bold">
                    check
                  </span>
                </div>
                <p className="text-gray-900 font-semibold text-[15px]">
                  Sertifikasi Pendamping Profesional Tingkat Lanjut
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
