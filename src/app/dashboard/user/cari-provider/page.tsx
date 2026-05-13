/*
Header: Cari Provider Dashboard Page
Tujuan: Menampilkan daftar provider dan filter kategori yang terhubung ke endpoint backend.
Caller: Route /dashboard/user/cari-provider.
Dependensi: @/api (getProviders, getServiceTypes).
Status: Active.
*/

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  getProviders,
  getServiceTypes,
  getProvinces,
  getRegencies,
  Provider,
  ServiceType,
  Province,
  Regency,
} from "@/api";
import { PaginatedProviders } from "@/api/types";

export default function CariProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState("all");
  const [selectedProvinceId, setSelectedProvinceId] = useState("all");
  const [selectedRegencyId, setSelectedRegencyId] = useState("all");
  const [selectedMinYearsExperience, setSelectedMinYearsExperience] = useState("");
  const [selectedMinPrice, setSelectedMinPrice] = useState("");
  const [selectedMaxPrice, setSelectedMaxPrice] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempServiceTypeId, setTempServiceTypeId] = useState("all");
  const [tempProvinceId, setTempProvinceId] = useState("all");
  const [tempRegencyId, setTempRegencyId] = useState("all");
  const [tempMinYearsExperience, setTempMinYearsExperience] = useState("");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      const data = await getServiceTypes();
      setServiceTypes(data);
    };

    const fetchProvinces = async () => {
      const data = await getProvinces();
      setProvinces(data);
    };

    fetchServiceTypes();
    fetchProvinces();
  }, []);

    useEffect(() => {
    const fetchRegencies = async () => {
      if (!showFilterModal || tempProvinceId === "all") {
        setRegencies([]);
        if (tempProvinceId === "all") {
          setTempRegencyId("all");
        }
        return;
      }

      setTempRegencyId("all");
      const data = await getRegencies(tempProvinceId);
      setRegencies(data);
    };

    fetchRegencies();
  }, [tempProvinceId, showFilterModal]);

    // Initial load when filters change
    useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
        setProviders([]);
        setCurrentPage(1);
      const selectedId =
        selectedServiceTypeId === "all"
          ? undefined
          : Number(selectedServiceTypeId);

      const selectedProvince =
        selectedProvinceId === "all" ? undefined : selectedProvinceId;

      const selectedRegency =
        selectedRegencyId === "all" ? undefined : selectedRegencyId;

      const minYearsExperience =
        selectedMinYearsExperience === ""
          ? undefined
          : Number(selectedMinYearsExperience);

      const minPrice = selectedMinPrice === "" ? undefined : Number(selectedMinPrice);
      const maxPrice = selectedMaxPrice === "" ? undefined : Number(selectedMaxPrice);

      const data = await getProviders({
        limit: 30,
        page: 1,
        serviceTypeId: selectedId,
        provinceId: selectedProvince,
        regencyId: selectedRegency,
        minYearsExperience,
        minPrice,
        maxPrice,
      });

      // Handle both array response and paginated response
      if (Array.isArray(data)) {
        setProviders(data);
        setTotalPages(0);
      } else if (data && typeof data === "object" && "items" in data && "pagination" in data) {
        const paginatedData = data as PaginatedProviders;
        setProviders(paginatedData.items);
        setTotalPages(paginatedData.pagination?.total_pages || 0);
        setCurrentPage(paginatedData.pagination?.page || 1);
      }

      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      fetchProviders();
      }, 300);

    return () => clearTimeout(timer);
  }, [
    selectedServiceTypeId,
    selectedProvinceId,
    selectedRegencyId,
    selectedMinYearsExperience,
    selectedMinPrice,
    selectedMaxPrice,
  ]);

    // Load more on scroll
    const loadMoreProviders = React.useCallback(async () => {
      if (isLoadingMore || isLoading || currentPage >= totalPages) return;

      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      const selectedId =
        selectedServiceTypeId === "all"
          ? undefined
          : Number(selectedServiceTypeId);

      const selectedProvince =
        selectedProvinceId === "all" ? undefined : selectedProvinceId;

      const selectedRegency =
        selectedRegencyId === "all" ? undefined : selectedRegencyId;

      const minYearsExperience =
        selectedMinYearsExperience === ""
          ? undefined
          : Number(selectedMinYearsExperience);

      const minPrice = selectedMinPrice === "" ? undefined : Number(selectedMinPrice);
      const maxPrice = selectedMaxPrice === "" ? undefined : Number(selectedMaxPrice);

      try {
        const data = await getProviders({
          limit: 30,
          page: nextPage,
          serviceTypeId: selectedId,
          provinceId: selectedProvince,
          regencyId: selectedRegency,
          minYearsExperience,
          minPrice,
          maxPrice,
        });

        if (data && typeof data === "object" && "items" in data && "pagination" in data) {
          const paginatedData = data as PaginatedProviders;
          setProviders((prev) => [...prev, ...paginatedData.items]);
          setCurrentPage(nextPage);
          setTotalPages(paginatedData.pagination?.total_pages || 0);
        }
      } catch (error) {
        console.error("Error loading more providers:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }, [
      isLoadingMore,
      isLoading,
      currentPage,
      totalPages,
      selectedServiceTypeId,
      selectedProvinceId,
      selectedRegencyId,
      selectedMinYearsExperience,
      selectedMinPrice,
      selectedMaxPrice,
    ]);

    // Intersection observer for infinite scroll
    useEffect(() => {
      const sentinel = document.getElementById("scroll-sentinel");
      if (!sentinel) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && currentPage < totalPages) {
            loadMoreProviders();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(sentinel);
      return () => observer.disconnect();
    }, [currentPage, totalPages, loadMoreProviders]);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredProviders = providers.filter((provider) => {
    if (!normalizedSearch) return true;

    const fullName =
      provider.user?.full_name?.toLowerCase() ||
      provider.full_name?.toLowerCase() ||
      "";
    const location = [
      provider.base_location_city,
      provider.regency_name,
      provider.province_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const specialization =
      provider.specializations
        ?.map((item) => item.serviceType?.name?.toLowerCase() || "")
        .join(" ") || "";

    return (
      fullName.includes(normalizedSearch) ||
      location.includes(normalizedSearch) ||
      specialization.includes(normalizedSearch)
    );
  });

  const getProviderName = (provider: Provider) =>
    provider.user?.full_name || provider.full_name || "Provider";

  const getProviderImage = (provider: Provider) =>
    provider.user?.image_url ||
    provider.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      getProviderName(provider)
    )}&background=008000&color=fff`;

  const getProviderSpecializations = (provider: Provider) =>
    provider.specializations
      ?.map((item) => item.serviceType?.name)
      .filter((name): name is string => Boolean(name)) || [];

  const getProviderRating = (provider: Provider) =>
    provider.avg_rating ?? provider.rating ?? "0.0";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 lg:space-y-8">
      {/* Search Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Cari Provider</h2>
            <p className="text-gray-500 text-base">
              Temukan Pendamping Sesuai Kebutuhan Anda
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari nama, lokasi, kategori..."
                className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-11 text-sm text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Hapus pencarian"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              ) : null}
            </div>
            <button
              onClick={() => {
                setTempSearchQuery(searchQuery);
                setTempServiceTypeId(selectedServiceTypeId);
                setTempProvinceId(selectedProvinceId);
                setTempRegencyId(selectedRegencyId);
                setTempMinYearsExperience(selectedMinYearsExperience);
                setTempMinPrice(selectedMinPrice);
                setTempMaxPrice(selectedMaxPrice);
                setShowFilterModal(true);
              }}
              className="flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-600/30 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-xl">tune</span>
              Filter Lanjutan
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-500 font-medium">Mencari provider terbaik...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
            <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-8xl">
                person_search
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">Belum ada provider yang terdaftar</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Maaf, saat ini belum ada provider yang sesuai dengan kriteria pencarian Anda. Silakan coba kata kunci atau kategori lain.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    alt={getProviderName(provider)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={getProviderImage(provider)}
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                      Tersedia
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                      {getProviderName(provider)}
                    </h3>
                    <div className="flex items-center gap-0.5">
                      <span
                        className="material-symbols-outlined text-yellow-400 text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-sm font-bold">{getProviderRating(provider)}</span>
                    </div>
                  </div>
                  <p className="text-green-600 text-sm font-semibold mb-4">
                    {getProviderSpecializations(provider)[0] || "Pendamping Professional"}
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>
                        {provider.regency_name && provider.province_name
                          ? `${provider.regency_name}, ${provider.province_name}`
                          : provider.base_location_city || "Kota Tasikmalaya"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-base">work_history</span>
                      <span>
                        {provider.years_experience
                          ? `Pengalaman ${provider.years_experience} Tahun`
                          : "Pengalaman 3 - 5 Tahun"}
                      </span>
                    </div>
                  </div>
                  <div className="mb-6 min-h-[2rem]">
                    {getProviderSpecializations(provider).length > 1 ? (
                      <div className="flex flex-wrap gap-2">
                        {getProviderSpecializations(provider).slice(0, 3).map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <Link
                    href={`/dashboard/user/cari-provider/${provider.id}`}
                    className="mt-auto block w-full rounded-xl bg-green-600 py-3 text-center text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-700 active:scale-95"
                  >
                    Lihat Profil
                  </Link>
                </div>
              </div>
            ))}
          </div>
          )}

          {!isLoading && filteredProviders.length > 0 && (
            <div
              id="scroll-sentinel"
              className="flex justify-center py-12"
            >
              {isLoadingMore && currentPage < totalPages && (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <p className="text-gray-500 text-sm">Memuat provider lebih banyak...</p>
                </div>
              )}
              {currentPage >= totalPages && providers.length > 0 && (
                <p className="text-gray-400 text-sm">Tidak ada provider lagi</p>
              )}
            </div>
          )}
      </section>

      {/* Filter Modal */}
      {showFilterModal ? (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Filter Lanjutan</h2>
              <p className="text-sm text-gray-500 mt-1">Sesuaikan parameter pencarian provider</p>
            </div>

            <div className="space-y-4">
              {/* Search Query Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Nama atau Lokasi</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Nama pendamping, kota, atau keahlian..."
                    value={tempSearchQuery}
                    onChange={(e) => setTempSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Province Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Provinsi</label>
                <select
                  value={tempProvinceId}
                  onChange={(e) => setTempProvinceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white"
                >
                  <option value="all">Semua Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regency Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kabupaten / Kota</label>
                <select
                  value={tempRegencyId}
                  onChange={(e) => setTempRegencyId(e.target.value)}
                  disabled={tempProvinceId === "all"}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <option value="all">Semua Kabupaten / Kota</option>
                  {regencies.map((regency) => (
                    <option key={regency.id} value={regency.id}>
                      {regency.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimal Pengalaman (Tahun)</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Contoh: 3"
                  value={tempMinYearsExperience}
                  onChange={(e) => setTempMinYearsExperience(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                />
              </div>

              {/* Price Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Minimum</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    value={tempMinPrice}
                    onChange={(e) => setTempMinPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Maksimum</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    value={tempMaxPrice}
                    onChange={(e) => setTempMaxPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                </div>
              </div>

              {/* Service Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori Layanan</label>
                <select
                  value={tempServiceTypeId}
                  onChange={(e) => setTempServiceTypeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-all bg-white"
                >
                  <option value="all">Semua Kategori</option>
                  {serviceTypes.map((serviceType) => (
                    <option key={serviceType.id} value={serviceType.id}>
                      {serviceType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setSearchQuery(tempSearchQuery);
                  setSelectedServiceTypeId(tempServiceTypeId);
                  setSelectedProvinceId(tempProvinceId);
                  setSelectedRegencyId(tempRegencyId);
                  setSelectedMinYearsExperience(tempMinYearsExperience);
                  setSelectedMinPrice(tempMinPrice);
                  setSelectedMaxPrice(tempMaxPrice);
                  setShowFilterModal(false);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all active:scale-95"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
