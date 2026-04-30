import Link from "next/link";
import { notFound } from "next/navigation";
import { getProviderDetail } from "@/api";

type ProviderDetailPageProps = {
  params: Promise<{
    providerId: string;
  }>;
};

const formatExperience = (years?: number | null) => {
  if (years === undefined || years === null) {
    return "Pengalaman belum ditampilkan";
  }

  return `Pengalaman ${years} Tahun`;
};

const formatAvailabilityDay = (dayOfWeek: number) => {
  const dayMap: Record<number, string> = {
    0: "Minggu",
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
  };

  return dayMap[dayOfWeek] || `Hari ${dayOfWeek}`;
};

export default async function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const { providerId } = await params;
  const provider = await getProviderDetail(providerId);

  if (!provider) {
    notFound();
  }

  const providerName = provider.user?.full_name || provider.full_name || "Provider";
  const providerImage =
    provider.user?.image_url ||
    provider.profile_image_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=008000&color=fff`;

  const specializations =
    provider.specializations
      ?.map((item) => item.serviceType?.name)
      .filter((name): name is string => Boolean(name)) || [];

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard/user/cari-provider"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Kembali ke daftar provider
        </Link>
        <Link
          href={`/dashboard/user/booking/order?providerId=${provider.id}`}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 transition-all"
        >
          Lanjut Booking
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <img
            src={providerImage}
            alt={providerName}
            className="h-72 w-full rounded-2xl object-cover"
          />
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{providerName}</h1>
              {provider.is_verified ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Terverifikasi
                </span>
              ) : null}
            </div>
            <p className="text-gray-500">{provider.base_location_city}</p>
            <p className="text-sm font-semibold text-gray-700">
              {provider.avg_rating ?? provider.rating ?? "0.0"} Rating
            </p>
            <p className="text-sm text-gray-600">{formatExperience(provider.years_experience)}</p>
            <p className="text-sm font-semibold text-green-700">
              {provider.province_name && provider.regency_name
                ? `${provider.regency_name}, ${provider.province_name}`
                : "Lokasi belum tersedia"}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Tentang Provider</h2>
            <p className="mt-3 text-gray-600 leading-7">
              {provider.bio || "Belum ada deskripsi profil provider."}
            </p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Kategori Layanan</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {specializations.length > 0 ? (
                specializations.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Belum ada spesialisasi.</span>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Jadwal Tersedia</h2>
            <div className="mt-4 space-y-3">
              {provider.availabilities && provider.availabilities.length > 0 ? (
                provider.availabilities.map((item) => {
                  const availability = item as {
                    id?: string;
                    day_of_week?: number;
                    start_time?: string;
                    end_time?: string;
                    is_active?: boolean;
                  };

                  return (
                    <div
                      key={availability.id || `${availability.day_of_week}-${availability.start_time}`}
                      className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3"
                    >
                      <span className="font-semibold text-gray-800">
                        {formatAvailabilityDay(availability.day_of_week ?? 0)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {availability.start_time || "--:--"} - {availability.end_time || "--:--"}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">Belum ada jadwal tersedia.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}