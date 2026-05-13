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
  const [formState, setFormState] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingStats, setBookingStats] = useState({
    totalBookings: 0,
    completedServices: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        const nextUser = {
          full_name: storedUser.full_name || "",
          email: storedUser.email || "",
          phone: storedUser.phone_number || storedUser.phone || "-",
          role: storedUser.role || "user",
          image_url: storedUser.image_url || "",
        };

        setUser(nextUser);
        setFormState({
          full_name: nextUser.full_name,
          email: nextUser.email,
          phone_number: nextUser.phone === "-" ? "" : nextUser.phone,
        });
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loadBookingStats = async () => {
      const token = sessionStorage.getItem("accessToken");
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

  const handleLogout = async () => {
    const result = await logout();
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

  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      setError("Token login tidak ditemukan. Silakan login ulang.");
      return;
    }

    const nextFullName = formState.full_name.trim();
    const nextEmail = formState.email.trim();
    const nextPhoneNumber = formState.phone_number.trim();
    const fields: {
      full_name?: string;
      email?: string;
      phone_number?: string | null;
    } = {};

    if (nextFullName) {
      fields.full_name = nextFullName;
    } else if (user.full_name) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    if (nextEmail) {
      fields.email = nextEmail;
    } else if (user.email) {
      setError("Email wajib diisi.");
      return;
    }

    if (nextPhoneNumber) {
      fields.phone_number = nextPhoneNumber;
    } else if (user.phone && user.phone !== "-") {
      fields.phone_number = null;
    }

    const hasFieldChanges = Object.keys(fields).length > 0;
    if (!hasFieldChanges && !profileImageFile) {
      setError("Isi minimal satu data profil atau pilih foto baru.");
      return;
    }

    setIsSaving(true);

    try {
      const result = profileImageFile
        ? await updateMeMultipart(token, {
            fields,
            profile_image: profileImageFile,
          })
        : await updateMe(token, fields);

      if (!result.success) {
        setError(result.message || "Gagal menyimpan perubahan profil.");
        return;
      }

      const responseData = result.data as any;
      const updatedUser = responseData?.user || responseData || {};
      const updatedImageUrl = updatedUser.image_url || updatedUser.profile_image_url || user.image_url;
      const mergedUser = {
        ...user,
        ...updatedUser,
        full_name: updatedUser.full_name || fields.full_name || user.full_name,
        email: updatedUser.email || fields.email || user.email,
        phone: updatedUser.phone_number || fields.phone_number || "-",
        image_url: updatedImageUrl,
      };

      setUser(mergedUser);
      setFormState({
        full_name: mergedUser.full_name,
        email: mergedUser.email,
        phone_number: mergedUser.phone === "-" ? "" : mergedUser.phone,
      });

      const storedUserRaw = sessionStorage.getItem("user");
      const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : {};
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          ...updatedUser,
          full_name: mergedUser.full_name,
          email: mergedUser.email,
          phone_number: mergedUser.phone === "-" ? null : mergedUser.phone,
          image_url: updatedImageUrl,
        })
      );
      window.dispatchEvent(new Event("user-updated"));

      setProfileImageFile(null);
      setProfileImagePreview("");
      setShowImageUpload(false);
      setSuccess("Profil berhasil diperbarui.");
    } catch (saveError) {
      console.error("Error saving user profile:", saveError);
      setError("Terjadi kesalahan saat menyimpan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Memuat profil...</div>;
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Profil Saya</h2>
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
            {success}
          </div>
        )}
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
                      onClick={() => {
                        setShowImageUpload(false);
                      }}
                      disabled={!profileImageFile}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Gunakan Foto
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <form className="space-y-6" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap</label>
                    <input
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                      type="text"
                      value={formState.full_name}
                      onChange={(event) => handleFormChange("full_name", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                    <input
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                      type="email"
                      value={formState.email}
                      onChange={(event) => handleFormChange("email", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Nomor Telepon</label>
                    <input
                      className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 bg-gray-50/50"
                      type="text"
                      value={formState.phone_number}
                      onChange={(event) => handleFormChange("phone_number", event.target.value)}
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    className="w-full md:w-auto px-10 py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isSaving}
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
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
