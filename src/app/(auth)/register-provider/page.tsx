'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RegisterProviderPage() {
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState(['Sabar', 'Komunikatif']);
  const [newSkill, setNewSkill] = useState('');

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 relative">
      {/* Material Symbols */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
        rel="stylesheet" 
      />

      {/* Back to Home Button - Only show if not on final step */}
      {step < 4 && (
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-brand-green transition-colors font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Kembali ke Beranda
        </Link>
      )}

      <main className={`max-w-4xl mx-auto w-full flex flex-col items-center ${step === 4 ? 'justify-center min-h-[80vh]' : ''}`}>
        
        {step < 4 && (
          <>
            {/* Registration Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-brand-green">person_add</span>
              </div>
              <h2 className="text-3xl font-bold text-brand-green mb-2 uppercase">DAFTAR SEBAGAI PROVIDER</h2>
              <p className="text-gray-600">Bergabunglah dengan kami untuk membantu menciptakan akses yang setara bagi semua</p>
            </div>

            {/* Stepper */}
            <div className="w-full flex items-center justify-center mb-12 relative px-4">
              <div className="absolute h-0.5 bg-gray-200 w-full top-1/2 -translate-y-1/2 -z-10 max-w-lg"></div>
              <div className="flex justify-between w-full max-w-lg z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                  <span className={`text-sm font-medium ${step >= 1 ? 'text-brand-green' : 'text-gray-400'}`}>Informasi</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                  <span className={`text-sm font-medium ${step >= 2 ? 'text-brand-green' : 'text-gray-400'}`}>Layanan</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-brand-green text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                  <span className={`text-sm font-medium ${step >= 3 ? 'text-brand-green' : 'text-gray-400'}`}>Verifikasi</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Form Card */}
        <div className={`w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ${step === 4 ? 'text-center flex flex-col items-center' : ''}`}>
          
          {step === 1 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Informasi Dasar</h3>
                <p className="text-gray-500">Lengkapi data diri Anda untuk proses verifikasi</p>
              </div>

              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center mb-10">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                    <span className="material-symbols-outlined text-gray-300 text-5xl">person</span>
                  </div>
                  <button className="absolute bottom-1 right-1 w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                </div>
                <span className="mt-4 text-sm font-medium text-gray-500">Unggah Foto Profil</span>
              </div>

              {/* Input Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Nama Lengkap</label>
                  <input 
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900" 
                    type="text" 
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                  <input 
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900" 
                    type="email" 
                    placeholder="nama@email.com"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Lokasi</label>
                    <div className="relative">
                      <input 
                        className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900" 
                        placeholder="Cari kota..." 
                        type="text"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400">location_on</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Kontak</label>
                    <div className="relative">
                      <input 
                        className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900" 
                        placeholder="0812..." 
                        type="tel"
                      />
                      <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400">phone</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12">
                <button 
                  onClick={nextStep}
                  className="w-full h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-brand-green-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Lanjut
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Pilih Layanan & Pengalaman</h3>
                <p className="text-gray-500">Tentukan spesialisasi dan tunjukkan keahlian Anda</p>
              </div>

              {/* Pilih Layanan Section */}
              <div className="mb-10">
                <label className="block text-sm font-semibold mb-4 text-gray-700">Pilih Layanan</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Juru Bahasa', 'Guru Pendamping', 'Pendamping Tunanetra', 
                    'Pendamping Harian', 'Pendamping Event', 'Juru Bahasa Isyarat'
                  ].map((service) => (
                    <label key={service} className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all group ${service === 'Guru Pendamping' ? 'border-2 border-brand-green bg-green-50' : 'border-gray-200 hover:border-brand-green'}`}>
                      <input 
                        className="w-5 h-5 text-brand-green border-gray-300 focus:ring-brand-green" 
                        name="service" 
                        type="radio" 
                        defaultChecked={service === 'Guru Pendamping'}
                      />
                      <span className={`ml-3 font-medium ${service === 'Guru Pendamping' ? 'text-brand-green font-bold' : 'text-gray-700'}`}>{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pengalaman Dropdown */}
              <div className="mb-10">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Pilih Pengalaman</label>
                <div className="relative">
                  <select className="w-full h-14 pl-4 pr-10 border border-gray-200 rounded-xl bg-gray-50 appearance-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all text-gray-900 outline-none">
                    <option value="">Pilih durasi pengalaman anda</option>
                    <option value="1-2">1-2 Tahun</option>
                    <option value="3-5">3-5 Tahun</option>
                    <option value="5+">&gt; 5 Tahun</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div className="mb-10">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Deskripsi Singkat</label>
                <div className="relative">
                  <textarea 
                    className="w-full min-h-[160px] p-4 border border-gray-200 rounded-xl bg-gray-50 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all resize-none text-gray-900 outline-none" 
                    placeholder="Ceritakan pengalaman anda dalam melayani..."
                  ></textarea>
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium">0/5000 karakter</div>
                </div>
              </div>

              {/* Keahlian Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Keahlian</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-brand-green text-sm font-semibold rounded-full border border-green-100">
                      {skill} 
                      <button onClick={() => removeSkill(skill)}>
                        <span className="material-symbols-outlined text-sm cursor-pointer">close</span>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input 
                    className="w-full h-14 pl-4 pr-12 border border-gray-200 rounded-xl bg-gray-50 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all text-gray-900 outline-none" 
                    placeholder="Tambahkan keahlian (contoh: Bahasa Isyarat)" 
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button 
                    onClick={addSkill}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand-green text-white rounded-lg flex items-center justify-center hover:bg-brand-green-hover"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col md:flex-row gap-4">
                <button 
                  onClick={prevStep}
                  className="flex-1 h-14 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali
                </button>
                <button 
                  onClick={nextStep}
                  className="flex-[2] h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-brand-green-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Lanjut
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Verifikasi & Persetujuan</h3>
                <p className="text-gray-500">Unggah dokumen pendukung dan setujui persyaratan</p>
              </div>

              <div className="space-y-10">
                {/* Upload Area */}
                <div>
                  <label className="block text-sm font-semibold mb-4 text-gray-700">Upload Sertifikat / Kualifikasi</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 p-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                      <span className="material-symbols-outlined text-brand-green text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>how_to_reg</span>
                    </div>
                    <p className="font-bold text-gray-900 mb-1">Upload Sertifikat / Kualifikasi</p>
                    <p className="text-xs text-gray-400 mb-6">Format: PDF, JPG, PNG. Max 5MB</p>
                    <button className="bg-brand-green hover:bg-brand-green-hover text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all font-semibold shadow-md">
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Upload File
                    </button>
                  </div>
                </div>

                {/* Application Summary */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-brand-green">assignment</span>
                    <h4 className="font-bold text-gray-900">Ringkasan Pengajuan</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                    {[
                      { label: 'Nama Lengkap', value: 'John Doe' },
                      { label: 'Lokasi', value: 'Tasikmalaya' },
                      { label: 'Layanan', value: 'Guru Pendamping' },
                      { label: 'Keahlian', value: 'Sabar, Komunikatif' }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <span className="text-sm text-gray-500 font-medium">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agreement */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center h-6">
                    <input className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green" type="checkbox" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Saya menyatakan bahwa semua data yang diisi adalah benar dan saya bersedia mematuhi <a className="text-brand-green font-bold hover:underline" href="#">Syarat & Ketentuan</a> serta <a className="text-brand-green font-bold hover:underline" href="#">Kebijakan Privasi</a> ACCESS-ABILITY.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-12 flex flex-col md:flex-row gap-4">
                  <button 
                    onClick={prevStep}
                    className="flex-1 h-14 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali
                  </button>
                  <button 
                    onClick={nextStep}
                    className="flex-[2] h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-brand-green-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Ajukan Sebagai Provider
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              {/* Success Icon */}
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                  <span className="material-symbols-outlined text-white text-4xl" style={{ fontVariationSettings: "'wght' 700" }}>check</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <div className="mb-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-tight">PENGAJUAN BERHASIL!</h3>
                <p className="text-lg text-gray-500 max-w-lg mx-auto">
                  Terima kasih telah mendaftar sebagai provider. Tim kami akan meninjau pengajuan Anda dalam 1-3 hari kerja.
                </p>
              </div>

              {/* Summary Box */}
              <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status Pengajuan</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-[10px] font-bold uppercase">Pending</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Provider</p>
                    <p className="font-bold text-gray-900">John Doe</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Layanan Utama</p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <span className="material-symbols-outlined text-brand-green text-sm">interpreter_mode</span>
                      <p className="font-bold">Guru Pendamping</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="flex items-center justify-center gap-2 bg-green-50 py-3 px-6 rounded-full border border-green-100 mb-10">
                <span className="material-symbols-outlined text-brand-green text-xl">info</span>
                <p className="text-sm font-medium text-gray-600">
                  Anda akan menerima notifikasi email setelah verifikasi selesai.
                </p>
              </div>

              {/* Action Button */}
              <Link 
                href="/"
                className="w-full md:w-auto md:min-w-[320px] h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-brand-green-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Kembali ke Beranda
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </>
          )}

        </div>

        {/* Footer Hint - Only show if not on final step */}
        {step < 4 && (
          <p className="mt-8 text-sm text-gray-400 text-center">
            Sudah memiliki akun provider? <Link className="text-brand-green font-semibold hover:underline" href="/login">Masuk di sini</Link>
          </p>
        )}
        
        {step === 4 && (
          <p className="mt-8 text-sm text-gray-400 text-center">
            Butuh bantuan? <a className="text-brand-green font-semibold hover:underline" href="#">Hubungi Dukungan</a>
          </p>
        )}
      </main>
    </div>
  );
}
