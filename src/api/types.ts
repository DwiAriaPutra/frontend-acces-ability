/*
Tujuan: Type definitions untuk API responses dan data structures.
Caller: Semua layer frontend yang consume backend REST API.
Dependensi: Tidak ada.
Main Functions: Interface untuk booking, provider, auth, dan API response.
*/

export interface Province {
  id: string;
  name: string;
}

export interface Regency {
  id: string;
  name: string;
}

export interface ServiceType {
  id: number;
  name: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedProviders {
  items: Provider[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface RegisterProviderPayload {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  role: "provider";
  province_id: string;
  province_name: string;
  regency_id: string;
  regency_name: string;
  base_location_city: string;
  price_per_hour: string;
  years_experience?: string;
  bio?: string;
  provider_specialization: number[];
  profile_image?: File;
  provider_certificate?: File;
}

export interface RegisterUserPayload {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterSuccessResponse {
  token: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    image_url?: string;
  };
  providerProfile?: {
    id: string;
    user_id: string;
    price_per_hour: number;
    verification_status: string;
  };
}

export interface UpdateMyUserPayload {
  full_name?: string | null;
  email?: string | null;
  phone_number?: string | null;
}

export interface GoogleAuthResponse {
  success: boolean;
  data?: {
    authUrl?: string;
    authorization_url?: string;
  };
  message?: string;
}

export interface GoogleCallbackResponse {
  code: string;
}

export interface ProviderUser {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role?: string;
  image_url?: string | null;
}

export interface ProviderSpecializationItem {
  id: string;
  provider_profile_id?: string;
  service_type_id?: number;
  serviceType?: ServiceType;
}

export interface Provider {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  bio?: string;
  price_per_hour: number;
  years_experience?: number | null;
  profile_image_url?: string;
  image_url?: string | null;
  base_location_city: string;
  base_location_lat?: number | string | null;
  base_location_lng?: number | string | null;
  avg_rating?: string | number;
  rating?: string | number;
  total_reviews?: number;
  is_verified?: boolean;
  verification_status?: string;
  regency_name?: string;
  province_name?: string;
  province_id?: string;
  regency_id?: string;
  user?: ProviderUser;
  specializations?: ProviderSpecializationItem[];
  availabilities?: Array<Record<string, unknown>>;
}

export interface UpdateMyProviderPayload {
  bio?: string | null;
  years_experience?: number | null;
  price_per_hour?: number | null;
  province_id?: string | null;
  province_name?: string | null;
  regency_id?: string | null;
  regency_name?: string | null;
  base_location_city?: string | null;
  base_location_lat?: number | null;
  base_location_lng?: number | null;
}

export interface ProviderCertificationItem {
  id: string;
  provider_profile_id: string;
  file_url?: string;
  verification_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewItem {
  id: string;
  booking_id: string;
  reviewer_user_id: string;
  provider_profile_id: string;
  rating: number;
  comment?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateReviewPayload {
  booking_id: string;
  rating: number;
  comment?: string;
}

export interface Booking {
  id: string;
  booking_code?: string;
  provider_id?: string;
  provider_profile_id?: string;
  user_id: string;
  service_type_id: number;
  duration_hours?: number | string;
  price_per_hour_snapshot?: number | string;
  price_estimate?: number | string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  booking_date: string;
  start_time: string;
  end_time: string;
  location_lat?: number | string | null;
  location_lng?: number | string | null;
  request_notes?: string | null;
  cancel_reason?: string | null;
  total_price: number | string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    full_name: string;
    image_url?: string | null;
    email?: string;
  };
  provider?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
    base_location_city?: string;
    years_experience?: string;
    rating?: string | number;
    image_url?: string | null;
  };
  service_type?: {
    id: number;
    name: string;
  };
}

export interface BookingStatusHistoryItem {
  id: string;
  booking_id: string;
  from_status?: Booking["status"] | null;
  to_status: Booking["status"];
  changed_by: string;
  changed_at: string;
  notes?: string | null;
  changedByUser?: ProviderUser;
}

export interface BookingDetail extends Booking {
  user?: ProviderUser;
  providerProfile?: Provider & {
    user?: ProviderUser;
  };
  serviceType?: ServiceType;
  statusHistories?: BookingStatusHistoryItem[];
  review?: ReviewItem | null;
}

export interface BookingCreatePayload {
  provider_profile_id: string;
  service_type_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  location_lat: number;
  location_lng: number;
  request_notes?: string;
}
