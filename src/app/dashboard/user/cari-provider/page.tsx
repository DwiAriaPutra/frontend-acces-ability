"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProviders, getServiceTypes, Provider, ServiceType } from "@/api";

export default function CariProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getServiceTypes();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      try {
        const data = await getProviders({
          search: searchQuery || undefined,
          category:
            selectedCategory === "Semua Kategori" ? undefined : selectedCategory,
        });
        setProviders(data);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProviders();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Search Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Cari Provider
            </h2>
            <p className="text-gray-500 text-base">
              Temukan Pendamping Sesuai Kebutuhan Anda
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:min-w-[300px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all"
                placeholder="Cari Pendamping Cerdas"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="w-full pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm appearance-none min-w-[180px] focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                unfold_more
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-gray-500 font-medium">
              Mencari provider terbaik...
            </p>
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
            <div className="w-48 h-48 bg-gray-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-gray-300 text-8xl">
                person_search
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900">
                Belum ada provider yang terdaftar
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Maaf, saat ini belum ada provider yang sesuai dengan kriteria
                pencarian Anda. Silakan coba kata kunci atau kategori lain.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    alt={provider.full_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={
                      provider.profile_image_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        provider.full_name
                      )}&background=008000&color=fff`
                    }
                  />
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                      Tersedia
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                      {provider.full_name}
                    </h3>
                    <div className="flex items-center gap-0.5">
                      <span
                        className="material-symbols-outlined text-yellow-400 text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="text-sm font-bold">
                        {provider.rating || "5.0"}
                      </span>
                    </div>
                  </div>
                  <p className="text-green-600 text-sm font-semibold mb-4">
                    {provider.specializations?.[0]?.name ||
                      "Pendamping Professional"}
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-base">
                        location_on
                      </span>
                      <span>
                        {provider.base_location_city || "Kota Tasikmalaya"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <span className="material-symbols-outlined text-base">
                        work_history
                      </span>
                      <span>
                        {provider.years_experience
                          ? `Pengalaman ${provider.years_experience} Tahun`
                          : "Pengalaman 3 - 5 Tahun"}
                      </span>
                    </div>
                  </div>
                  <Link href={`/dashboard/user/provider/${provider.id}`}>
                    <button className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95">
                      Lihat Profil
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
