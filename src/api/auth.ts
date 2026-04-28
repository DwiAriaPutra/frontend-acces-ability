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
    formData.append("phone_number", payload.phone_number);
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

    // Specializations as array
    payload.provider_specialization.forEach((id) => {
      formData.append("provider_specialization[]", String(id));
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

      console.error("[API Error] registerProvider:", errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    }

    // Parse JSON response
    const result: ApiResponse<RegisterSuccessResponse> = await response.json();

    // Validate response
    if (result.success && result.data) {
      console.log("[API Success] registerProvider: Registration successful");
      return {
        success: true,
        message: result.message,
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
      message: `Network error: ${errorMessage}`,
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
