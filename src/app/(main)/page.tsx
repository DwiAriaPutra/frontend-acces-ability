'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (user && token) {
      try {
        const parsedUser = JSON.parse(user);
        // Redirect based on user role
        if (parsedUser.role === 'provider') {
          router.push('/dashboard/provider');
        } else if (parsedUser.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  return (
    <>
      {/* BEGIN: HeroSection */}
      <section className="relative pt-20">
        <div 
          className="relative min-h-[600px] flex flex-col items-center justify-center text-center px-4 py-20"
          style={{
            backgroundImage: 'url(/images/hero-bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          {/* Background overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30 z-0"></div>
          <div className="relative z-10 w-full flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-black max-w-4xl leading-tight">
              Hubungkan Pengguna dengan Pendamping Disabilitas Profesional
            </h1>
            <p className="mt-6 text-black max-w-2xl text-lg italic">
              Temukan bantuan komunikasi bahasa isyarat, pendampingan mobilitas, dan layanan terapi profesional yang dirancang untuk mendukung kemandirian Anda.
            </p>
            {/* Search Bar */}
            <div className="mt-10 w-full px-4 flex justify-center">
              <div className="w-full max-w-2xl bg-white p-2 rounded-lg shadow-lg flex items-center">
              <div className="flex-grow flex items-center px-4">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <input className="w-full border-none focus:ring-0 text-sm outline-none" placeholder="Cari layanan..." type="text" />
              </div>
              <button className="bg-brand-green text-white px-8 py-2 rounded-md font-medium hover:bg-brand-green-hover transition">Cari</button>
            </div>
            </div>
            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/login" className="bg-brand-green text-white px-8 py-3 rounded-md font-medium shadow-md hover:bg-brand-green-hover transition">Cari Pendamping</Link>
              <Link href="/register-provider" className="bg-brand-green text-white px-8 py-3 rounded-md font-medium shadow-md hover:bg-brand-green-hover transition">Daftar Sebagai Provider</Link>
            </div>
          </div>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: KategoriLayanan */}
      <section id="layanan" className="py-20 max-w-7xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Kategori Layanan</h2>
          <p className="text-gray-500 mt-2">Pilih kategori layanan yang anda butuhkan</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service Card 1 */}
          <div className="bg-brand-green text-white p-8 rounded-xl flex flex-col items-center text-center transition hover:scale-105 duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Komunikasi</h3>
            <p className="text-sm opacity-90 leading-relaxed">Penerjemah Bahasa Isyarat dan Transcriber</p>
          </div>
          {/* Service Card 2 */}
          <div className="bg-brand-green text-white p-8 rounded-xl flex flex-col items-center text-center transition hover:scale-105 duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Pendampingan</h3>
            <p className="text-sm opacity-90 leading-relaxed">Pendamping Event dan Asisten Pribadi</p>
          </div>
          {/* Service Card 3 */}
          <div className="bg-brand-green text-white p-8 rounded-xl flex flex-col items-center text-center transition hover:scale-105 duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Mobilitas</h3>
            <p className="text-sm opacity-90 leading-relaxed">Pendamping Tunanetra dan Asisten Perjalanan</p>
          </div>
          {/* Service Card 4 */}
          <div className="bg-brand-green text-white p-8 rounded-xl flex flex-col items-center text-center transition hover:scale-105 duration-300">
            <div className="w-16 h-16 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-sm"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Edukasi dan Terapi</h3>
            <p className="text-sm opacity-90 leading-relaxed">Terapis Wicara dan Guru Pendamping</p>
          </div>
        </div>
      </section>
      {/* END: KategoriLayanan */}

      {/* BEGIN: CaraKerja */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Cara Kerja ACCESS-ABILITY</h2>
          <p className="text-gray-500 mt-2">Proses sederhana untuk menghubungkan pengguna dengan pendamping profesional</p>
          <div className="mt-20 relative">
            {/* Connector Line */}
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-1 bg-gray-200"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-green-200 border-4 border-white flex items-center justify-center text-3xl font-bold text-brand-green z-10 mb-6">1</div>
                <h4 className="font-bold text-lg mb-2">Daftar</h4>
                <p className="text-gray-500 text-sm max-w-[200px]">Pengguna membuat akun untuk menggunakan layanan.</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-green-200 border-4 border-white flex items-center justify-center text-3xl font-bold text-brand-green z-10 mb-6">2</div>
                <h4 className="font-bold text-lg mb-2">Cari Pendamping</h4>
                <p className="text-gray-500 text-sm max-w-[200px]">Gunakan fitur pencarian untuk menemukan pendamping sesuai kebutuhan.</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-green-200 border-4 border-white flex items-center justify-center text-3xl font-bold text-brand-green z-10 mb-6">3</div>
                <h4 className="font-bold text-lg mb-2">Booking Layanan</h4>
                <p className="text-gray-500 text-sm max-w-[200px]">Pilih penyedia layanan dan lakukan pemesanan.</p>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-brand-green border-4 border-white flex items-center justify-center text-3xl font-bold text-white z-10 mb-6">4</div>
                <h4 className="font-bold text-lg mb-2">Layanan Dilakukan</h4>
                <p className="text-gray-500 text-sm max-w-[200px]">Pendamping memberikan layanan sesuai jadwal yang telah disepakati.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* END: CaraKerja */}

      {/* BEGIN: BigCTA */}
      <section className="cta-bg py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="max-w-xl text-white">
            <h2 className="text-4xl font-bold leading-tight mb-4">Butuh Pendamping Disabilitas?<br />Temukan di ACCESS-ABILITY</h2>
            <p className="text-lg opacity-90 mb-10">Platform yang menghubungkan pengguna dengan penyedia layanan pendamping disabilitas secara cepat dan mudah.</p>
            <button className="bg-white text-brand-green px-8 py-3 rounded-md font-bold hover:bg-gray-100 transition inline-block">Cari Pendamping</button>
          </div>
        </div>
      </section>
      {/* END: BigCTA */}

      {/* BEGIN: Testimonials */}
      <section id="tentang-kami" className="py-20 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Kata Mereka Tentang kami</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <div className="flex items-center mb-4">
              <img alt="BEM UNIV" className="w-14 h-14 rounded-full border-4 border-brand-green" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVxUdyCHI5znjjMr4_ool9HDYs-37_fUtllOtgvTd-G1uKAUynOq8DttJO6ldz_NgbP19AeklT6Oh_3ju3_18huT0yS3CLsy1ZGFLyPHPrePviUwTB8JIFt_Y_7I7jWN1jR9xHWaXWc5To1Xb5KQpjXf7CKfOVotvQb_jZn_zMj7YF-X6gQnIl6gYF7FFcLJNnVSbAOyDswSp5Fzyik5NMaRvqN7hqb_PIvs3xkYVuRV7pRTy614C92kLCNY6tbEI_YXV2Yuqo1jc" />
              <div className="ml-4">
                <h4 className="font-bold">BEM UNIV</h4>
                <p className="text-xs text-gray-500">Pengguna Layanan</p>
                <div className="flex text-yellow-400 text-xs mt-1">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed">&quot;ACCESS-ABILITY sangat membantu saya menemukan juru bahasa isyarat untuk acara seminar kampus.&quot;</p>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <div className="flex items-center mb-4">
              <img alt="Ryan" className="w-14 h-14 rounded-full border-4 border-brand-green" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDen379mTuF0AUNjug53FfUvA3v68bPlGNnyYUOddvJmYe5PhalzerPHYXx-LNv5ImZI_iqcXLJbGDq7_f3CLVF3T-GUfRG3IJxaBwVcC9zrX0oDM9rclNI1XYbAw7K6DSbbhdTXGvyv1tPa79iqS4vSRA9icAkhPVWEv9pMNa7lPIiKbe72f4pbDvlUTnqAE1iLvPOY-YnmishqMytER9XAmhCnoPuCnMbsZnGuKAdpoAikc2B7NpyFdntKqUOJ495rmQRHzZcjgI" />
              <div className="ml-4">
                <h4 className="font-bold">Ryan</h4>
                <p className="text-xs text-gray-500">Provider</p>
                <div className="flex text-yellow-400 text-xs mt-1">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed">&quot;Sebagai penyedia layanan JBI, platform ini membantu saya menjangkau lebih banyak pengguna.&quot;</p>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-white border rounded-xl p-8 shadow-sm">
            <div className="flex items-center mb-4">
              <img alt="Jake" className="w-14 h-14 rounded-full border-4 border-brand-green" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCBoymgXz_0GJDQa3BYrkUD0CaoXs6nq7vP9n750kRY4GvV11LJahuqTvs0mLNqDm81bu_Mg9inXGEZnGF2AhTzwDhHmjHa4lPFAZM4OM-q0CbcIOhEeDLUubOUfORbpLy8iTi05_o8ymFvhOz62St3j_mZaUWGc-0p8gScoOpvWQEX-g4miCl6SDWNJ_l34qyDeB1Ph3h7fG1xGp3Qp-3wCyDlqCFqtCg_290-Io_ogqsEBNhniyoU8WXONWzXOlrbn6fO3SWaIiA" />
              <div className="ml-4">
                <h4 className="font-bold">Jake</h4>
                <p className="text-xs text-gray-500">Pengguna Layanan</p>
                <div className="flex text-yellow-400 text-xs mt-1">★★★★★</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed">&quot;Platform ini memudahkan kami mencari pendamping bagi peserta disabilitas dalam kegiatan komunitas.&quot;</p>
          </div>
        </div>
      </section>
      {/* END: Testimonials */}
    </>
  );
}
