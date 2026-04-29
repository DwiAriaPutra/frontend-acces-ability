/*
Tujuan: Type definitions untuk API responses dan data structures.
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

export interface Booking {
  id: string;
  provider_id: string;
  user_id: string;
  service_type_id: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  booking_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  provider?: {
    id: string;
    full_name: string;
    profile_image_url?: string;
    base_location_city?: string;
    years_experience?: string;
    rating?: string | number;
  };
  service_type?: {
    id: number;
    name: string;
  };
}

export interface Provider {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  bio?: string;
  price_per_hour: number;
  years_experience: number;
  profile_image_url?: string;
  base_location_city: string;
  rating?: string | number;
  specializations?: ServiceType[];
}
