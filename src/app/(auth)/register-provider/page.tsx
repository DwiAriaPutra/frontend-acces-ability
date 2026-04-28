/*
Tujuan: UI component untuk registrasi provider dengan multi-step, location selection, dan file upload.
Caller: Calon provider dari landing page.
Dependensi: /api/* (locations, auth), types dari api
Main Functions: Form rendering, validation, step navigation, file upload UI.
Side Effects: State management untuk form dan UI, call API functions saat submit.
*/

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Province,
  Regency,
  ServiceType,
  RegisterProviderPayload,
  getProvinces,
  getRegencies,
  getServiceTypes,
  registerProvider,
} from '@/api';

interface FormData {
  // Basic user fields
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  role: 'provider';
  
  // Location fields
  province_id: string;
  province_name: string;
  regency_id: string;
  regency_name: string;
  base_location_city: string;
  
  // Provider fields
  price_per_hour: string;
  years_experience: string;
  bio: string;
  provider_specialization: number[];
  
  // Files
  profile_image: File | null;
  provider_certificate: File | null;
}

export default function RegisterProviderPage() {
  const [step, setStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    role: 'provider',
    province_id: '',
    province_name: '',
    regency_id: '',
    regency_name: '',
    base_location_city: '',
    price_per_hour: '',
    years_experience: '',
    bio: '',
    provider_specialization: [],
    profile_image: null,
    provider_certificate: null,
  });

  // Location data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);

  // Service types
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Profile preview
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // Loading & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data);
      setLoadingProvinces(false);
    };

    const loadServiceTypes = async () => {
      setLoadingServices(true);
      const data = await getServiceTypes();
      setServiceTypes(data);
      setLoadingServices(false);
    };

    loadProvinces();
    loadServiceTypes();
  }, []);

  // Load regencies when province changes
  useEffect(() => {
    const loadRegencies = async () => {
      if (!formData.province_id) {
        setRegencies([]);
        return;
      }

      setLoadingRegencies(true);
      const data = await getRegencies(formData.province_id);
      setRegencies(data);
      setLoadingRegencies(false);
    };

    loadRegencies();
  }, [formData.province_id]);

  const handleInputChange = (
    field: keyof Omit<FormData, 'profile_image' | 'provider_certificate' | 'provider_specialization'>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProvinceChange = (provinceId: string) => {
    const selectedProvince = provinces.find((p) => p.id === provinceId);
    setFormData((prev) => ({
      ...prev,
      province_id: provinceId,
      province_name: selectedProvince?.name || '',
      regency_id: '',
      regency_name: '',
    }));
  };

  const handleRegencyChange = (regencyId: string) => {
    const selectedRegency = regencies.find((r) => r.id === regencyId);
    setFormData((prev) => ({
      ...prev,
      regency_id: regencyId,
      regency_name: selectedRegency?.name || '',
    }));
  };

  const handleSpecializationChange = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      provider_specialization: prev.provider_specialization.includes(serviceId)
        ? prev.provider_specialization.filter((id) => id !== serviceId)
        : [...prev.provider_specialization, serviceId],
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertificateFile(file);
      setFormData((prev) => ({
        ...prev,
        provider_certificate: file,
      }));
    }
  };

  const validateStep = (): boolean => {
    setError('');

    if (step === 1) {
      if (!formData.full_name.trim()) {
        setError('Nama lengkap harus diisi');
        return false;
      }
      if (formData.full_name.length < 3 || formData.full_name.length > 120) {
        setError('Nama harus 3-120 karakter');
        return false;
      }
      if (!formData.email.trim()) {
        setError('Email harus diisi');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email tidak valid');
        return false;
      }
      if (!formData.password.trim()) {
        setError('Password harus diisi');
        return false;
      }
      if (formData.password.length < 8 || formData.password.length > 72) {
        setError('Password harus 8-72 karakter');
        return false;
      }
      if (formData.phone_number && (formData.phone_number.length < 8 || formData.phone_number.length > 30)) {
        setError('Nomor telepon harus 8-30 karakter');
        return false;
      }
      if (!formData.province_id) {
        setError('Provinsi harus dipilih');
        return false;
      }
      if (!formData.regency_id) {
        setError('Kabupaten/Kota harus dipilih');
        return false;
      }
      if (!formData.base_location_city.trim()) {
        setError('Kota harus diisi');
        return false;
      }
      if (formData.base_location_city.length < 2 || formData.base_location_city.length > 100) {
        setError('Kota harus 2-100 karakter');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.price_per_hour) {
        setError('Harga per jam harus diisi');
        return false;
      }
      if (Number(formData.price_per_hour) <= 0) {
        setError('Harga per jam harus lebih dari 0');
        return false;
      }
      if (formData.provider_specialization.length === 0) {
        setError('Minimal pilih 1 layanan');
        return false;
      }
      if (formData.bio && formData.bio.length > 5000) {
        setError('Deskripsi maksimal 5000 karakter');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.provider_certificate) {
        setError('Sertifikat harus diunggah');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Build payload untuk API
      const payload: RegisterProviderPayload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number,
        role: 'provider',
        province_id: formData.province_id,
        province_name: formData.province_name,
        regency_id: formData.regency_id,
        regency_name: formData.regency_name,
        base_location_city: formData.base_location_city,
        price_per_hour: formData.price_per_hour,
        years_experience: formData.years_experience || undefined,
        bio: formData.bio || undefined,
        provider_specialization: formData.provider_specialization,
        profile_image: formData.profile_image || undefined,
        provider_certificate: formData.provider_certificate || undefined,
      };

      // Call API
      const result = await registerProvider(payload);

      if (!result.success) {
        setError(result.message || 'Registrasi gagal');
        return;
      }

      // Success - move to completion step
      setStep(4);
      // Store token if needed
      if (result.data?.token) {
        localStorage.setItem('accessToken', result.data.token);
      }
    } catch (err) {
      console.error('[Component Error] handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
    setError('');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 relative">
      {/* Material Symbols */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      {/* Back to Home Button */}
      {step < 4 && (
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-brand-green transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali ke Beranda
        </Link>
      )}

      <main
        className={`max-w-4xl mx-auto w-full flex flex-col items-center ${
          step === 4 ? 'justify-center min-h-[80vh]' : ''
        }`}
      >
        {step < 4 && (
          <>
            {/* Registration Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-brand-green">
                  person_add
                </span>
              </div>
              <h2 className="text-3xl font-bold text-brand-green mb-2 uppercase">
                DAFTAR SEBAGAI PROVIDER
              </h2>
              <p className="text-gray-600">
                Bergabunglah dengan kami untuk membantu menciptakan akses yang setara bagi semua
              </p>
            </div>

            {/* Stepper */}
            <div className="w-full flex items-center justify-center mb-12 relative px-4">
              <div className="absolute h-0.5 bg-gray-200 w-full top-1/2 -translate-y-1/2 -z-10 max-w-lg"></div>
              <div className="flex justify-between w-full max-w-lg z-10">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step >= s
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {s}
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        step >= s ? 'text-brand-green' : 'text-gray-400'
                      }`}
                    >
                      {s === 1 ? 'Data Dasar' : s === 2 ? 'Layanan' : 'Verifikasi'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-4xl mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-red-700 font-medium flex-1">{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Form Card */}
        <div
          className={`w-full bg-white rounded-2xl p-8 border border-gray-100 shadow-sm ${
            step === 4 ? 'text-center flex flex-col items-center' : ''
          }`}
        >
          {/* STEP 1: BASIC INFO */}
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
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-gray-300 text-5xl">
                        person
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="profile-input"
                    className="absolute bottom-1 right-1 w-10 h-10 bg-brand-green text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </label>
                  <input
                    id="profile-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>
                <span className="mt-4 text-sm font-medium text-gray-500">Unggah Foto Profil</span>
              </div>

              {/* Input Fields */}
              <div className="space-y-6 w-full">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Min. 8 karakter"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    placeholder="0812..."
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Provinsi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.province_id}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    disabled={loadingProvinces}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900 bg-white"
                  >
                    <option value="">
                      {loadingProvinces ? 'Memuat...' : 'Pilih Provinsi'}
                    </option>
                    {provinces.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Kabupaten/Kota <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.regency_id}
                    onChange={(e) => handleRegencyChange(e.target.value)}
                    disabled={!formData.province_id || loadingRegencies}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900 bg-white"
                  >
                    <option value="">
                      {loadingRegencies
                        ? 'Memuat...'
                        : formData.province_id
                          ? 'Pilih Kabupaten/Kota'
                          : 'Pilih provinsi dulu'}
                    </option>
                    {regencies.map((reg) => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Kota/Wilayah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: Tasikmalaya"
                    value={formData.base_location_city}
                    onChange={(e) => handleInputChange('base_location_city', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-12 w-full">
                <button
                  onClick={nextStep}
                  className="w-full h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Lanjut
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 2: SERVICES & EXPERIENCE */}
          {step === 2 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Layanan & Pengalaman</h3>
                <p className="text-gray-500">Tentukan spesialisasi dan tunjukkan keahlian Anda</p>
              </div>

              <div className="w-full space-y-10">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-semibold mb-4 text-gray-700">
                    Pilih Layanan <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loadingServices ? (
                      <p className="text-gray-500">Memuat layanan...</p>
                    ) : (
                      serviceTypes.map((service) => (
                        <label
                          key={service.id}
                          className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                            formData.provider_specialization.includes(service.id)
                              ? 'border-2 border-brand-green bg-green-50'
                              : 'border-gray-200 hover:border-brand-green'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.provider_specialization.includes(service.id)}
                            onChange={() => handleSpecializationChange(service.id)}
                            className="w-5 h-5 text-brand-green border-gray-300 rounded focus:ring-brand-green"
                          />
                          <span
                            className={`ml-3 font-medium ${
                              formData.provider_specialization.includes(service.id)
                                ? 'text-brand-green font-bold'
                                : 'text-gray-700'
                            }`}
                          >
                            {service.name}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Per Hour */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Harga Per Jam <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      placeholder="50000"
                      value={formData.price_per_hour}
                      onChange={(e) => handleInputChange('price_per_hour', e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                    />
                  </div>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Pengalaman (Tahun)
                  </label>
                  <input
                    type="number"
                    placeholder="contoh: 5"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', e.target.value)}
                    className="w-full h-12 px-4 rounded-lg border border-gray-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all outline-none text-gray-900"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    placeholder="Ceritakan pengalaman anda dalam melayani..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    maxLength={5000}
                    className="w-full min-h-[160px] p-4 border border-gray-200 rounded-lg bg-white focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all resize-none text-gray-900 outline-none"
                  />
                  <div className="text-xs text-gray-400 font-medium mt-2 text-right">
                    {formData.bio.length}/5000 karakter
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col md:flex-row gap-4 w-full">
                <button
                  onClick={prevStep}
                  className="flex-1 h-14 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali
                </button>
                <button
                  onClick={nextStep}
                  className="flex-[2] h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Lanjut
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 3: VERIFICATION & FILES */}
          {step === 3 && (
            <>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Verifikasi & Persetujuan</h3>
                <p className="text-gray-500">Unggah dokumen pendukung dan setujui persyaratan</p>
              </div>

              <div className="w-full space-y-10">
                {/* Certificate Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-4 text-gray-700">
                    Upload Sertifikat / Kualifikasi <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 p-10 flex flex-col items-center text-center hover:border-brand-green transition-colors">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                      <span className="material-symbols-outlined text-brand-green text-3xl">
                        {certificateFile ? 'check_circle' : 'how_to_reg'}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 mb-1">
                      {certificateFile ? certificateFile.name : 'Upload Sertifikat / Kualifikasi'}
                    </p>
                    <p className="text-xs text-gray-400 mb-6">Format: PDF, JPG, PNG. Max 5MB</p>
                    <label htmlFor="cert-input" className="cursor-pointer">
                      <span className="bg-brand-green hover:bg-green-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all font-semibold shadow-md inline-flex">
                        <span className="material-symbols-outlined text-sm">upload</span>
                        Upload File
                      </span>
                    </label>
                    <input
                      id="cert-input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleCertificateChange}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="material-symbols-outlined text-brand-green">
                      assignment
                    </span>
                    <h4 className="font-bold text-gray-900">Ringkasan Pengajuan</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-left">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Nama Lengkap</p>
                      <p className="font-bold text-gray-900">{formData.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="font-bold text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Lokasi</p>
                      <p className="font-bold text-gray-900">
                        {formData.regency_name}, {formData.province_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Harga Per Jam</p>
                      <p className="font-bold text-gray-900">Rp {Number(formData.price_per_hour).toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Layanan</p>
                      <p className="font-bold text-gray-900">
                        {serviceTypes
                          .filter((s) => formData.provider_specialization.includes(s.id))
                          .map((s) => s.name)
                          .join(', ')}
                      </p>
                    </div>
                    {formData.years_experience && (
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Pengalaman</p>
                        <p className="font-bold text-gray-900">{formData.years_experience} Tahun</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agreement */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center h-6">
                    <input
                      type="checkbox"
                      id="agreement"
                      className="w-5 h-5 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                    />
                  </div>
                  <label htmlFor="agreement" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                    Saya menyatakan bahwa semua data yang diisi adalah benar dan saya bersedia mematuhi{' '}
                    <a className="text-brand-green font-bold hover:underline" href="#">
                      Syarat & Ketentuan
                    </a>{' '}
                    serta{' '}
                    <a className="text-brand-green font-bold hover:underline" href="#">
                      Kebijakan Privasi
                    </a>{' '}
                    ACCESS-ABILITY.
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col md:flex-row gap-4 w-full">
                <button
                  onClick={prevStep}
                  className="flex-1 h-14 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Kembali
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-[2] h-14 bg-brand-green disabled:bg-gray-400 text-white font-bold text-lg rounded-xl shadow-md hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Mengirim...' : 'Ajukan Sebagai Provider'}
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <>
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 relative">
                <div className="w-16 h-16 bg-brand-green rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                  <span className="material-symbols-outlined text-white text-4xl">check</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              <div className="mb-10 text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 uppercase tracking-tight">
                  PENGAJUAN BERHASIL!
                </h3>
                <p className="text-lg text-gray-500 max-w-lg mx-auto">
                  Terima kasih telah mendaftar sebagai provider. Tim kami akan meninjau pengajuan Anda dalam
                  1-3 hari kerja.
                </p>
              </div>

              <div className="w-full bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Status Pengajuan
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="text-[10px] font-bold uppercase">Pending</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Nama Provider
                    </p>
                    <p className="font-bold text-gray-900">{formData.full_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Layanan Utama
                    </p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <span className="material-symbols-outlined text-brand-green text-sm">
                        interpreter_mode
                      </span>
                      <p className="font-bold">
                        {serviceTypes
                          .filter((s) => formData.provider_specialization.includes(s.id))
                          .map((s) => s.name)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 bg-green-50 py-3 px-6 rounded-full border border-green-100 mb-10 w-full">
                <span className="material-symbols-outlined text-brand-green text-xl">info</span>
                <p className="text-sm font-medium text-gray-600">
                  Anda akan menerima notifikasi email setelah verifikasi selesai.
                </p>
              </div>

              <Link
                href="/"
                className="w-full md:w-auto md:min-w-[320px] h-14 bg-brand-green text-white font-bold text-lg rounded-xl shadow-md hover:bg-green-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                Kembali ke Beranda
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </>
          )}
        </div>

        {/* Footer */}
        {step < 4 && (
          <p className="mt-8 text-sm text-gray-400 text-center">
            Sudah memiliki akun provider?{' '}
            <Link className="text-brand-green font-semibold hover:underline" href="/login">
              Masuk di sini
            </Link>
          </p>
        )}
        {step === 4 && (
          <p className="mt-8 text-sm text-gray-400 text-center">
            Butuh bantuan?{' '}
            <a className="text-brand-green font-semibold hover:underline" href="#">
              Hubungi Dukungan
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
