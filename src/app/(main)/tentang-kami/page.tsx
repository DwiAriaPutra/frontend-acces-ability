/*
Header: Tentang Kami Public Page
Tujuan: Menjelaskan alur penggunaan ACCESS-ABILITY dari registrasi hingga layanan selesai.
Caller: Route /tentang-kami.
Dependensi: next/link.
*/

import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Register Akun",
    description:
      "Pengguna membuat akun ACCESS-ABILITY agar bisa mengakses dashboard, mencari provider, dan mengelola riwayat booking.",
  },
  {
    number: "02",
    title: "Cari Provider",
    description:
      "Pengguna membuka menu cari provider, memilih kategori layanan, lokasi, dan melihat profil provider yang sesuai kebutuhan.",
  },
  {
    number: "03",
    title: "Pilih Jadwal dan Lokasi",
    description:
      "Pengguna memilih layanan, tanggal, jam, titik lokasi, serta menambahkan catatan khusus agar provider memahami kebutuhan pendampingan.",
  },
  {
    number: "04",
    title: "Kirim Booking",
    description:
      "Permintaan booking dikirim ke provider. Status awal akan masuk sebagai menunggu sampai provider menerima atau menolak.",
  },
  {
    number: "05",
    title: "Provider Konfirmasi",
    description:
      "Provider meninjau detail permintaan. Jika diterima, pengguna dapat memantau status booking dari dashboard.",
  },
  {
    number: "06",
    title: "Layanan Selesai",
    description:
      "Provider menyelesaikan pendampingan sesuai jadwal. Setelah itu riwayat layanan tersimpan dan pengguna dapat memberi ulasan.",
  },
];

export default function TentangKamiPage() {
  return (
    <div className="pt-24 sm:pt-28 pb-14 sm:pb-20">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.24em] text-brand-green">Tentang Kami</p>
            <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
              ACCESS-ABILITY membantu pengguna menemukan pendamping disabilitas dengan alur yang jelas
            </h1>
          </div>
          <p className="lg:col-span-5 text-sm sm:text-lg leading-relaxed text-gray-600">
            Website ini dirancang untuk menghubungkan pengguna dengan provider terverifikasi, mulai dari pendaftaran, pemilihan layanan, booking, sampai layanan benar-benar terselesaikan.
          </p>
        </div>

        <div className="mt-8 sm:mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((step) => (
            <article key={step.number} className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm">
              <div className="text-sm font-black text-brand-green">{step.number}</div>
              <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-gray-900">{step.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{step.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 sm:mt-14 rounded-3xl bg-gray-900 px-5 py-7 sm:px-10 sm:py-8 text-white">
          <div className="max-w-3xl">
            <h2 className="text-xl sm:text-3xl font-bold">Ingin mulai menggunakan ACCESS-ABILITY?</h2>
            <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed">
              Daftar sebagai pengguna untuk mencari pendamping, atau daftar sebagai provider jika Anda ingin menawarkan layanan profesional.
            </p>
          </div>
          <div className="mt-6 flex w-full flex-col sm:w-auto sm:flex-row gap-3">
            <Link href="/register" className="w-full sm:w-auto rounded-xl bg-brand-green px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-600">
              Register Pengguna
            </Link>
            <Link href="/register-provider" className="w-full sm:w-auto rounded-xl border border-white/30 px-6 py-3 text-center text-sm font-bold text-white hover:bg-white/10">
              Register Provider
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
