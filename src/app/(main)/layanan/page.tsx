/*
Header: Layanan Public Page
Tujuan: Menampilkan daftar layanan dari backend service-types untuk pengunjung.
Caller: Route /layanan.
Dependensi: @/api (getServiceTypes).
*/

import Link from "next/link";
import { getServiceTypes } from "@/api";
import type { ServiceType } from "@/api";

const fallbackServices: ServiceType[] = [
  { id: 1, code: "JBI", name: "JBI" },
  { id: 2, code: "PENDAMPING_EVENT", name: "Pendamping Event" },
  { id: 3, code: "GURU_PENDAMPING", name: "Guru Pendamping" },
  { id: 4, code: "PENDAMPING_TUNANETRA", name: "Pendamping Tunanetra" },
];

const serviceCopy: Record<string, { title: string; description: string; icon: string }> = {
  jbi: {
    title: "Juru Bahasa Isyarat",
    description: "Pendamping komunikasi untuk acara, kelas, konsultasi, atau kebutuhan harian pengguna Tuli.",
    icon: "JBI",
  },
  "pendamping event": {
    title: "Pendamping Event",
    description: "Dukungan aksesibilitas saat seminar, workshop, kegiatan kampus, komunitas, atau agenda publik.",
    icon: "EV",
  },
  "guru pendamping": {
    title: "Guru Pendamping",
    description: "Pendamping belajar yang membantu proses edukasi, adaptasi kelas, dan kebutuhan pembelajaran inklusif.",
    icon: "GP",
  },
  "pendamping tunanetra": {
    title: "Pendamping Tunanetra",
    description: "Bantuan mobilitas, orientasi lokasi, dan pendampingan aktivitas untuk pengguna tunanetra.",
    icon: "PT",
  },
};

const getServiceMeta = (service: ServiceType) => {
  const key = service.name.toLowerCase();
  return (
    serviceCopy[key] || {
      title: service.name,
      description: "Layanan pendamping profesional yang dapat dipilih sesuai kebutuhan pengguna.",
      icon: service.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    }
  );
};

export default async function LayananPage() {
  const backendServices = await getServiceTypes();
  const services = backendServices.length > 0 ? backendServices : fallbackServices;

  return (
    <div className="pt-24 sm:pt-28 pb-14 sm:pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em] text-brand-green">Layanan</p>
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            Pilih layanan pendamping sesuai kebutuhan aksesibilitas Anda
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-gray-600 leading-relaxed">
            Daftar layanan ini mengikuti data kategori yang tersedia di backend, sehingga pengguna dan provider memakai pilihan yang sama saat booking maupun pendaftaran.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {services.map((service) => {
            const meta = getServiceMeta(service);

            return (
              <article
                key={service.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-green-50 text-xs sm:text-sm font-black text-brand-green">
                  {meta.icon}
                </div>
                <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-bold text-gray-900">{meta.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{meta.description}</p>
                <div className="mt-5 inline-flex max-w-full rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500 break-all">
                  Kode: {service.code || service.name}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-12 rounded-3xl bg-green-600 px-5 py-7 sm:px-10 sm:py-8 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Sudah tahu layanan yang dibutuhkan?</h2>
            <p className="mt-2 text-sm sm:text-base text-green-50">Masuk sebagai pengguna untuk mencari provider terverifikasi dan membuat booking.</p>
          </div>
          <div className="flex w-full flex-col sm:w-auto sm:flex-row gap-3">
            <Link href="/login" className="w-full sm:w-auto rounded-xl bg-white px-6 py-3 text-center text-sm font-bold text-green-700 hover:bg-green-50">
              Cari Provider
            </Link>
            <Link href="/register-provider" className="w-full sm:w-auto rounded-xl border border-white/50 px-6 py-3 text-center text-sm font-bold text-white hover:bg-white/10">
              Jadi Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
