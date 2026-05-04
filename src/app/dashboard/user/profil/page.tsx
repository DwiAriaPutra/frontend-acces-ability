/*
Header: Profil User Dashboard Page
Tujuan: Menampilkan profil user beserta ringkasan booking yang diambil dari backend.
Caller: Route /dashboard/user/profil.
Dependensi: @/api (getUserBookings), localStorage accessToken + user.
Status: Active.
*/

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DragDropImageZone from "@/components/DragDropImageZone";
import { getUserBookings, logout, updateMe, updateMeMultipart } from "@/api";
import type { Booking } from "@/api";

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    phone: "-",
    role: "user",
    image_url: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    completedServices: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [accountEdits, setAccountEdits] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        setUser({
          full_name: storedUser.full_name || "",
          email: storedUser.email || "",
          phone: storedUser.phone_number || storedUser.phone || "-",
          role: storedUser.role || "user",
          image_url: storedUser.image_url || "",
        });
        setAccountEdits({
          full_name: storedUser.full_name || "",
          email: storedUser.email || "",
          phone_number: storedUser.phone_number || storedUser.phone || "",
        });
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadBookingStats = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsStatsLoading(false);
        return;
      }

      const bookings = await getUserBookings(token);
      const typedBookings = bookings as Booking[];

      setBookingStats({
        totalBookings: typedBookings.length,
        completedServices: typedBookings.filter((booking) => booking.status === "completed").length,
      });
      setIsStatsLoading(false);
    };

    loadBookingStats();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    const result = logout();
    if (result.success) {
      router.push("/");
    }
  };

  const handleProfileImageSelected = (file: File) => {
    if (file) {
      setProfileImageFile(file);
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setProfileImageFile(null);
      setProfileImagePreview("");
    }
  };

  const handleAccountChange = (field: keyof typeof accountEdits, value: string) => {
    setAccountEdits((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveAccount = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Token not found");
      return;
    }

    setIsSavingAccount(true);
    try {
      const payload: { full_name?: string | null; email?: string | null; phone_number?: string | null } = {};

      if (accountEdits.full_name !== user.full_name) payload.full_name = accountEdits.full_name || null;
      if (accountEdits.email !== user.email) payload.email = accountEdits.email || null;
      if (accountEdits.phone_number !== user.phone) payload.phone_number = accountEdits.phone_number || null;

      if (Object.keys(payload).length === 0) return;

      const result = await updateMe(token, payload);
      if (!result.success || !result.data?.user) {
        console.error("Failed to update account:", result.message);
        return;
      }

      const updatedUser = result.data.user;
      const mergedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        ...updatedUser,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      setUser((current) => ({
        ...current,
        full_name: updatedUser.full_name || current.full_name,
        email: updatedUser.email || current.email,
        phone: updatedUser.phone_number || current.phone,
      }));
      window.dispatchEvent(new Event("user-updated"));
    } catch (error) {
      console.error("Error saving account data", error);
    } finally {
      setIsSavingAccount(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Memuat profil...</div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
              {!showImageUpload ? (
                <>
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-green-600 p-1 overflow-hidden shadow-lg bg-green-50 flex items-center justify-center">
                      {profileImagePreview ? (
                        <img
                          alt={user.full_name}
                          className="w-full h-full rounded-full object-cover"
                          src={profileImagePreview}
                        />
                      ) : user.image_url ? (
                        <img
                          alt={user.full_name}
                          className="w-full h-full rounded-full object-cover"
                          src={user.image_url}
                        />
                      ) : (
                        <span className="text-4xl font-bold text-green-600">{getInitials(user.full_name)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImageUpload(true)}
                      className="absolute bottom-0 right-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-all border-4 border-white cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">photo_camera</span>
                    </button>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{user.full_name || "User"}</h3>
                    <p className="text-gray-500 text-sm mb-4">{user.email}</p>
                    <span className="px-4 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      {user.role === "provider" ? "Penyedia Layanan" : "Pengguna"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full flex flex-col items-center gap-4">
                  <DragDropImageZone
                    onImageSelected={handleProfileImageSelected}
                    preview={profileImagePreview}
                    label="Ubah Foto Profil"
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowImageUpload(false);
                        if (!profileImageFile) {
                          setProfileImagePreview("");
                        }
                      }}
                      className="px-6 py-2 border-2 border-gray-200 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!profileImageFile) return;
                        const token = localStorage.getItem("accessToken");
                        if (!token) {
                          console.error("Token not found");
                          setShowImageUpload(false);
                          return;
                        }

                        try {
                          const res = await updateMeMultipart(token, { profile_image: profileImageFile });
                          if (res.success && res.data?.user) {
                            // update localStorage and UI
                            try {
                              const userStr = localStorage.getItem("user");
                              if (userStr) {
                                const stored = JSON.parse(userStr);
                                const newUser = { ...stored, ...res.data.user };
                                localStorage.setItem("user", JSON.stringify(newUser));
                                setUser((u) => ({ ...u, image_url: newUser.image_url || "" }));
                                window.dispatchEvent(new Event("user-updated"));
                              }
                            } catch (e) {
                              console.error("Error updating localStorage after upload", e);
                            }
                          } else {
                            console.error("Failed to upload profile image:", res.message);
                          }
                        } catch (e) {
                          console.error("Error uploading profile image:", e);
                        } finally {
                          setShowImageUpload(false);
                          setProfileImageFile(null);
                          setProfileImagePreview("");
                        }
                      }}
                      disabled={!profileImageFile}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Simpan Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap</label>
                    <input
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                      type="text"
                      value={accountEdits.full_name}
                      onChange={(event) => handleAccountChange("full_name", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                    <input
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                      type="email"
                      value={accountEdits.email}
                      onChange={(event) => handleAccountChange("email", event.target.value)}
                      readOnly
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nomor Telepon</label>
                    <input
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                      type="text"
                      value={accountEdits.phone_number}
                      onChange={(event) => handleAccountChange("phone_number", event.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleSaveAccount}
                    disabled={isSavingAccount}
                    className="w-full md:w-auto px-10 py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95"
                    type="button"
                  >
                    {isSavingAccount ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center group hover:bg-green-600 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-green-600 text-3xl group-hover:text-white">event_available</span>
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1 group-hover:text-white transition-colors">
                {isStatsLoading ? "-" : bookingStats.totalBookings}
              </p>
              <p className="text-gray-500 font-bold text-sm group-hover:text-white/80 transition-colors uppercase tracking-wider">
                Total Booking
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center group hover:bg-green-600 transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                <span className="material-symbols-outlined text-green-600 text-3xl group-hover:text-white">verified</span>
              </div>
              <p className="text-4xl font-black text-gray-900 mb-1 group-hover:text-white transition-colors">
                {isStatsLoading ? "-" : bookingStats.completedServices}
              </p>
              <p className="text-gray-500 font-bold text-sm group-hover:text-white/80 transition-colors uppercase tracking-wider">
                Layanan Selesai
              </p>
            </div>

            <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
              <h4 className="text-green-800 font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">info</span>
                Informasi Akun
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700/60 font-medium">Status Akun</span>
                  <span className="text-green-700 font-bold">Aktif</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700/60 font-medium">Role</span>
                  <span className="text-green-700 font-bold capitalize">{user.role}</span>
                </div>
                <div className="pt-4 border-t border-green-200">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 transition-all active:scale-95"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
