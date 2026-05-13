/*
Tujuan: API functions untuk auth endpoints (register provider).
Caller: Components yang handle registration.
Dependensi: types.ts
Main Functions: registerProvider.
Side Effects: HTTP POST requests ke backend dengan multipart/form-data.
*/

import {
  RegisterProviderPayload,
  RegisterUserPayload,
  LoginPayload,
  RegisterSuccessResponse,
  ApiResponse,
} from "./types";
import { GoogleAuthResponse, GoogleCallbackResponse } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

const getApiErrorMessage = (fallback: string, errorText: string) => {
  try {
    const errorData = JSON.parse(errorText);
    const message = errorData.message || errorData.error || fallback;
    const details = errorData.errors || errorData.details;
    const normalizedMessage = String(message).toLowerCase();

    if (normalizedMessage.includes("too many files")) {
      return "Upload gagal: file yang dikirim terlalu banyak untuk endpoint register. Coba unggah satu foto profil dan satu sertifikat.";
    }

    if (Array.isArray(details) && details.length > 0) {
      return `${message}: ${details
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.message || item?.field || JSON.stringify(item)
        )
        .join(", ")}`;
    }

    if (details && typeof details === "object") {
      return `${message}: ${Object.entries(details)
        .map(([field, value]) =>
          Array.isArray(value) ? `${field} ${value.join(", ")}` : `${field} ${value}`
        )
        .join(", ")}`;
    }

    return message;
  } catch {
    console.error(
      "[API Error] Failed to parse error response:",
      errorText.substring(0, 200)
    );
    return fallback;
  }
};

/**
 * Register new provider dengan multipart/form-data
 * @param payload - Provider registration data
 * @returns Success response dengan token dan user info, atau error message
 */
export const registerProvider = async (
  payload: RegisterProviderPayload
): Promise<{
  success: boolean;
  message: string;
  data?: RegisterSuccessResponse;
}> => {
  try {
    // Build FormData untuk multipart/form-data
    const formData = new FormData();

    // Basic user fields
    formData.append("full_name", payload.full_name);
    formData.append("email", payload.email);
    formData.append("password", payload.password);
    if (payload.phone_number) {
      formData.append("phone_number", payload.phone_number);
    }
    formData.append("role", "provider");

    // Location fields
    formData.append("province_id", payload.province_id);
    formData.append("province_name", payload.province_name);
    formData.append("regency_id", payload.regency_id);
    formData.append("regency_name", payload.regency_name);
    formData.append("base_location_city", payload.base_location_city);

    // Provider fields
    formData.append("price_per_hour", payload.price_per_hour);
    if (payload.years_experience) {
      formData.append("years_experience", payload.years_experience);
    }
    if (payload.bio) {
      formData.append("bio", payload.bio);
    }

    // Send as repeated fields so backend validators receive each item separately.
    payload.provider_specialization.forEach((id) => {
      formData.append("provider_specialization[]", String(id));
      formData.append("service_type_ids[]", String(id));
    });

    // Files
    if (payload.profile_image) {
      formData.append("profile_image", payload.profile_image);
    }
    if (payload.provider_certificate) {
      formData.append("provider_certificate", payload.provider_certificate);
    }

    console.log(
      "[API Debug] registerProvider: Sending request to",
      `${BACKEND_URL}/api/v1/auth/register`
    );

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      body: formData,
      // Note: Do NOT set Content-Type header, browser will set it automatically with boundary
      // headers: Not needed for FormData
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = getApiErrorMessage(
        `Registration failed with status ${response.status}`,
        errorText
      );

      console.error("[API Error] registerProvider:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Parse JSON response
    const result: ApiResponse<RegisterSuccessResponse> = await response.json();

    // Validate response
    if (result.success) {
      console.log("[API Success] registerProvider: Registration successful");
      return {
        success: true,
        message: result.message || "Registration successful",
        data: result.data,
      };
    }

    console.error(
      "[API Error] registerProvider: Invalid response format",
      result
    );
    return {
      success: false,
      message: result.message || "Registration failed",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] registerProvider:", error);
    return {
      success: false,
      message: `Tidak bisa terhubung ke backend (${BACKEND_URL}). Periksa NEXT_PUBLIC_BACKEND_URL, status server backend, dan konfigurasi CORS. Detail: ${errorMessage}`,
    };
  }
};

/**
 * Register new user (non-provider) dengan JSON payload
 * @param payload - User registration data
 * @returns Success response dengan token dan user info, atau error message
 */
export const registerUser = async (
  payload: RegisterUserPayload
): Promise<{
  success: boolean;
  message: string;
  data?: RegisterSuccessResponse;
}> => {
  try {
    console.log(
      "[API Debug] registerUser: Sending request to",
      `${BACKEND_URL}/api/v1/auth/register`
    );

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: payload.full_name,
        email: payload.email,
        password: payload.password,
        phone_number: payload.phone_number || null,
        role: "user",
      }),
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Registration failed with status ${response.status}`;

      // Try to parse error response
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error(
          "[API Error] Failed to parse error response:",
          errorText.substring(0, 200)
        );
      }

      console.error("[API Error] registerUser:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Parse JSON response
    const result: ApiResponse<RegisterSuccessResponse> = await response.json();

    // Validate response
    if (result.success && result.data) {
      console.log("[API Success] registerUser: Registration successful");
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    console.error("[API Error] registerUser: Invalid response format", result);
    return {
      success: false,
      message: result.message || "Registration failed",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] registerUser:", error);
    return {
      success: false,
      message: `Network error: ${errorMessage}`,
    };
  }
};

/**
 * Login user dengan email/password
 * @param payload - Login credentials
 * @returns Success response dengan token dan user info, atau error message
 */
export const loginUser = async (
  payload: LoginPayload
): Promise<{
  success: boolean;
  message: string;
  data?: RegisterSuccessResponse;
}> => {
  try {
    console.log(
      "[API Debug] loginUser: Sending request to",
      `${BACKEND_URL}/api/v1/auth/login`
    );

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Login failed with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error(
          "[API Error] Failed to parse error response:",
          errorText.substring(0, 200)
        );
      }

      console.error("[API Error] loginUser:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    const result: ApiResponse<RegisterSuccessResponse> = await response.json();

    if (result.success && result.data) {
      console.log("[API Success] loginUser: Login successful");
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    console.error("[API Error] loginUser: Invalid response format", result);
    return {
      success: false,
      message: result.message || "Login failed",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] loginUser:", error);
    return {
      success: false,
      message: `Network error: ${errorMessage}`,
    };
  }
};

/**
 * Get Google OAuth authorization URL dari backend
 * @returns Authorization URL untuk redirect ke Google login, atau error message
 */
export const getGoogleAuthUrl = async (): Promise<{
  success: boolean;
  message: string;
  authUrl?: string;
}> => {
  try {
    console.log(
      "[API Debug] getGoogleAuthUrl: Fetching from",
      `${BACKEND_URL}/api/v1/auth/google/url`
    );

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/google/url`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to get auth URL with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error("[API Error] Failed to parse error response:", errorText);
      }

      console.error("[API Error] getGoogleAuthUrl:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    const result: GoogleAuthResponse = await response.json();

    const authUrl = result.data?.authUrl || result.data?.authorization_url;

    if (result.success && authUrl) {
      console.log(
        "[API Success] getGoogleAuthUrl: Authorization URL retrieved"
      );
      return {
        success: true,
        message: result.message || "Authorization URL retrieved",
        authUrl,
      };
    }

    console.error(
      "[API Error] getGoogleAuthUrl: Invalid response format",
      result
    );
    return {
      success: false,
      message: result.message || "Failed to retrieve authorization URL",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getGoogleAuthUrl:", error);
    return {
      success: false,
      message: `Network error: ${errorMessage}`,
    };
  }
};

/**
 * Handle Google OAuth callback dengan authorization code
 * @param code - Authorization code dari Google OAuth callback
 * @returns Success response dengan token dan user info, atau error message
 */
export const handleGoogleCallback = async (
  code: string
): Promise<{
  success: boolean;
  message: string;
  data?: RegisterSuccessResponse;
}> => {
  try {
    console.log(
      "[API Debug] handleGoogleCallback: Sending code to",
      `${BACKEND_URL}/api/v1/auth/google/callback`
    );

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/google/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: code,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OAuth callback failed with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error("[API Error] Failed to parse error response:", errorText);
      }

      console.error("[API Error] handleGoogleCallback:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    const result: ApiResponse<RegisterSuccessResponse> = await response.json();

    if (result.success && result.data) {
      console.log("[API Success] handleGoogleCallback: OAuth successful");
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }

    console.error(
      "[API Error] handleGoogleCallback: Invalid response format",
      result
    );
    return {
      success: false,
      message: result.message || "OAuth failed",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] handleGoogleCallback:", error);
    return {
      success: false,
      message: `Network error: ${errorMessage}`,
    };
  }
};

/**
 * Update current authenticated user basic fields (name, email, phone)
 */
export const updateMe = async (
  token: string,
  payload: {
    full_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
  }
): Promise<{ success: boolean; message: string; data?: { user?: any } }> => {
  try {
    console.log(
      "[API Debug] updateMe: Sending request to",
      `${BACKEND_URL}/api/v1/users/me`
    );

    const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Update failed with status ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}
      console.error("[API Error] updateMe:", errorMessage);
      return { success: false, message: errorMessage };
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        message: result.message || "Updated",
        data: result.data,
      };
    }

    return { success: false, message: result.message || "Update failed" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[API Error] updateMe:", error);
    return { success: false, message: `Network error: ${errorMessage}` };
  }
};

/**
 * Update current authenticated user including profile image using multipart/form-data
 * @param token - Bearer token
 * @param options - Object containing optional File `profile_image` and other json fields
 */
export const updateMeMultipart = async (
  token: string,
  options: { profile_image?: File; fields?: { [key: string]: any } } = {}
): Promise<{ success: boolean; message: string; data?: { user?: any } }> => {
  try {
    const formData = new FormData();

    if (options.fields) {
      Object.keys(options.fields).forEach((k) => {
        const v = options.fields![k];
        if (typeof v === "undefined") return;
        formData.append(k, v === null ? "" : String(v));
      });
    }

    if (options.profile_image) {
      formData.append("profile_image", options.profile_image);
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Update failed with status ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {}
      console.error("[API Error] updateMeMultipart:", errorMessage);
      return { success: false, message: errorMessage };
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        message: result.message || "Updated",
        data: result.data,
      };
    }

    return { success: false, message: result.message || "Update failed" };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[API Error] updateMeMultipart:", error);
    return { success: false, message: `Network error: ${errorMessage}` };
  }
};

/**
 * Logout current user: unregister all device tokens, then clear local storage
 * Device tokens are deactivated on backend, preventing push notifications after logout
 * @returns Success message
 */
export const logout = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    console.log("[API Debug] logout: Unregistering all device tokens");

    // Try to unregister all device tokens from backend (non-blocking if fails)
    const accessToken = sessionStorage.getItem("accessToken");
    if (accessToken) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/v1/devices/unregister-all`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.ok) {
          const result = await response.json();
          console.log("[API Debug] logout: Device tokens unregistered", result);
        } else {
          console.warn(
            "[API Debug] logout: Unregister failed with status",
            response.status
          );
        }
      } catch (err) {
        console.error(
          "[API Debug] logout: Device unregister error (non-blocking)",
          err
        );
      }
    }

    console.log("[API Debug] logout: Clearing session storage");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    window.dispatchEvent(new Event("user-updated"));
    console.log("[API Success] logout: User logged out successfully");
    return {
      success: true,
      message: "Logout berhasil",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[API Error] logout:", error);
    return {
      success: false,
      message: `Logout gagal: ${errorMessage}`,
    };
  }
};
