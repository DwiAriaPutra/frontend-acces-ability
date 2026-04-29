"use client";

import React, { useEffect, useState } from "react";

export default function UserDashboardPage() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.full_name) {
          setUserName(user.full_name);
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }
  }, []);

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Main Banner */}
      <section className="relative overflow-hidden bg-green-600 rounded-3xl p-12 min-h-[320px] flex flex-col justify-center">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
            alt="Group of diverse professionals"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJOHmTcZpd1yU1_nrRvKXSyHxFPlzl4gQSsm6iNbxAwgkJ5-NVeLs9UZOVUvEOxpyv0OK_DFVWoIJBFu-AEkDtlQlheNZaP8d1XsvUMrjepDH0l1J8hsbdw0-yBgD-C5-vlu-zIaCGtoEIoio4PZ5c9YBlB29vDdmTqhC00FUGFLA5Q2rgBT766tVJMaQQlCAkgcCA9iekFKQDYC_RQn7D7OqnrV1RzuqCfmF4I2OzxXOndBBSdgxZz_HjHsPQeIjONV_M15J4qxU"
          />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-white text-4xl font-bold mb-4">
            Selamat datang, {userName}
          </h2>
          <p className="text-green-50 text-lg mb-8 opacity-90">
            Kami menghubungkan Anda dengan penyedia layanan profesional yang
            siap membantu memenuhi kebutuhan spesifik Anda dengan empati dan
            keahlian.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-white text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg shadow-black/5">
              Mulai Cari Provider
            </button>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined text-3xl">list_alt</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Layanan</p>
            <h3 className="text-3xl font-bold text-gray-900">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
            <span className="material-symbols-outlined text-3xl">
              pending_actions
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Layanan Aktif</p>
            <h3 className="text-3xl font-bold text-gray-900">12</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl flex items-center gap-5 border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
            <span className="material-symbols-outlined text-3xl">task_alt</span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Layanan selesai</p>
            <h3 className="text-3xl font-bold text-gray-900">5</h3>
          </div>
        </div>
      </section>

      {/* Kategori Layanan Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Kategori Layanan</h2>
          <a className="text-green-600 font-semibold hover:underline" href="#">
            Lihat Semua
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Category Card 1 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              record_voice_over
            </span>
            <h4 className="text-xl font-bold">Komunikasi</h4>
            <p className="text-sm text-green-100 opacity-80">
              Layanan penerjemah bahasa isyarat dan dukungan komunikasi verbal.
            </p>
          </div>
          {/* Category Card 2 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              diversity_3
            </span>
            <h4 className="text-xl font-bold">Pendampingan</h4>
            <p className="text-sm text-green-100 opacity-80">
              Dukungan aktivitas harian dan pendampingan di area publik.
            </p>
          </div>
          {/* Category Card 3 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              accessible
            </span>
            <h4 className="text-xl font-bold">Mobilitas</h4>
            <p className="text-sm text-green-100 opacity-80">
              Transportasi ramah disabilitas dan bantuan mobilitas fisik.
            </p>
          </div>
          {/* Category Card 4 */}
          <div className="bg-green-600 p-8 rounded-[2rem] text-white space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-4xl">
              psychology
            </span>
            <h4 className="text-xl font-bold">Edukasi Dan Terapi</h4>
            <p className="text-sm text-green-100 opacity-80">
              Program pelatihan khusus dan sesi terapi berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Riwayat Layanan</h2>
          <span className="material-symbols-outlined text-gray-400 cursor-pointer">
            more_horiz
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-semibold">
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Layanan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      AS
                    </div>
                    <span className="font-semibold text-gray-900">
                      Annisa Salsabila
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">
                  Penerjemah Bahasa Isyarat
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">12 Okt 2023</td>
                <td className="px-6 py-5">
                  <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      KS
                    </div>
                    <span className="font-semibold text-gray-900">
                      Kevin Setiawan
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">
                  Pendamping Mobilitas
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">10 Okt 2023</td>
                <td className="px-6 py-5">
                  <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                    Selesai
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                      SM
                    </div>
                    <span className="font-semibold text-gray-900">
                      Siska Monica
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">
                  Terapi Okupasi
                </td>
                <td className="px-6 py-5 text-gray-600 text-sm">15 Okt 2023</td>
                <td className="px-6 py-5">
                  <span className="px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
