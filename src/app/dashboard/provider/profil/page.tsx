/*
Header: Profile Provider Page
Tujuan: Menampilkan informasi detail profil provider dengan desain yang disempurnakan.
Caller: Route /dashboard/provider/profil.
Dependensi: @/api (getProviderDetail, getUserBookings), localStorage user/token.
*/

"use client";

import React, { useEffect, useState } from "react";
import { Provider, getProviderDetail, getUserBookings, Booking } from "@/api";

export default function ProfileProviderPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("accessToken");

      if (!userStr || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);
        const providerId = user.providerProfile?.id || user.id;

        const [profileData, bookingsData] = await Promise.all([
          getProviderDetail(providerId),
          getUserBookings(token)
        ]);

        setProvider(profileData);
        setBookings(bookingsData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Memuat profil...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Profil tidak ditemukan.</p>
      </div>
    );
  }

  const completedCount = bookings.filter(b => b.status === "completed").length;
  const initials = provider.full_name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "PR";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Header Bento Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Profile Info Card */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-sm">
          <div className="relative">
            <div className="w-32 h-32 rounded-full ring-4 ring-green-100 overflow-hidden bg-green-50 flex items-center justify-center text-3xl font-bold text-green-600">
              {provider.profile_image_url || provider.image_url ? (
                <img
                  alt={provider.full_name}
                  className="w-full h-full object-cover"
                  src={provider.profile_image_url || provider.image_url || ""}
                />
              ) : (
                initials
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-green-600 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{provider.full_name}</h1>
                <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                  <span className="material-symbols-outlined text-green-600">verified</span>
                  Senior Patient Care Assistant
                </p>
              </div>
              <div className="bg-gray-100 rounded-xl px-6 py-3 flex flex-col items-center">
                <div className="flex items-center gap-1 text-green-600">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-2xl font-bold">{provider.rating || provider.avg_rating || "4.9"}</span>
                </div>
                <span className="text-xs font-medium text-gray-400">128 Reviews</span>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <span className="material-symbols-outlined text-green-600">mail</span>
                <span className="text-sm font-medium text-gray-700">{provider.email || "andi.p@careassist.pro"}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                <span className="material-symbols-outlined text-green-600">call</span>
                <span className="text-sm font-medium text-gray-700">{provider.phone_number || "+62 812-3456-7890"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Booking</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{bookings.length}</span>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center rounded-lg">
                <span className="material-symbols-outlined">book_online</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Layanan Selesai</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-green-600">{completedCount}</span>
              <div className="w-10 h-10 bg-green-50 text-green-600 flex items-center justify-center rounded-lg">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* About & Specialties */}
        <div className="lg:col-span-8 space-y-8">
          {/* About Section */}
          <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600">person</span>
              About {provider.full_name?.split(" ")[0] || "Andi"}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {provider.bio || "Andi is a dedicated healthcare professional with over 8 years of experience in geriatric care and post-operative recovery. He specializes in creating comfortable environments for patients while maintaining strict adherence to medical protocols. His empathetic approach and attention to detail have consistently earned him high praise from both patients and medical staff."}
            </p>
          </section>

          {/* Specialties Section */}
          <section className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600">military_tech</span>
              Specialties & Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {provider.specializations && provider.specializations.length > 0 ? (
                provider.specializations.map((spec) => (
                  <span key={spec.id} className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm">
                    {spec.serviceType?.name}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm">Geriatric Care</span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm">Sign Language</span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm">Mobility Support</span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-full text-sm">First Aid Certified</span>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Details */}
        <div className="lg:col-span-4 space-y-8">
          {/* Location */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">location_on</span>
                Location
              </h3>
              <p className="text-gray-600 mb-4">
                {provider.base_location_city || "Kota Tasikmalaya"}, {provider.province_name || "Jawa Barat"}
              </p>
            </div>
            <div className="h-48 w-full bg-gray-100 relative">
              <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-6.2088,106.8456&zoom=13&size=400x200&sensor=false')] bg-cover opacity-50 grayscale"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
            </div>
          </section>

          {/* Certifications */}
          <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-green-600">verified_user</span>
              Certifications
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">National Caregiving Cert.</p>
                  <p className="text-xs text-gray-400">Issued: Jan 2023</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-600 mt-0.5">check_circle</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm">BLS/CPR Certified</p>
                  <p className="text-xs text-gray-400">Valid until: Dec 2025</p>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
