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
