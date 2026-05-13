/*
Tujuan: API functions untuk provider-related endpoints.
Caller: Components yang handle provider search dan profiles.
Dependensi: types.ts
Main Functions: getProviders.
*/

import {
  Provider,
  ApiResponse,
  PaginatedProviders,
  UpdateMyProviderPayload,
  ProviderCertificationItem,
} from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * Get list of providers with optional filtering
 * @param query - Optional search query or filter parameters
 * @returns List of providers (array) or paginated response with pagination metadata
 */
export const getProviders = async (params?: {
  city?: string;
  serviceTypeId?: number;
  provinceId?: string;
  regencyId?: string;
  minYearsExperience?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  page?: number;
  verifiedOnly?: boolean;
}): Promise<Provider[] | PaginatedProviders> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    // Construct query string
    const queryParams = new URLSearchParams();
    if (params?.city) queryParams.append("city", params.city);
    if (params?.serviceTypeId) {
      queryParams.append("service_type_id", params.serviceTypeId.toString());
    }
    if (params?.provinceId)
      queryParams.append("province_id", params.provinceId);
    if (params?.regencyId) queryParams.append("regency_id", params.regencyId);
    if (params?.minYearsExperience !== undefined) {
      queryParams.append(
        "min_years_experience",
        params.minYearsExperience.toString()
      );
    }
    if (params?.minPrice !== undefined) {
      queryParams.append("min_price", params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined) {
      queryParams.append("max_price", params.maxPrice.toString());
    }
    if (params?.verifiedOnly !== undefined) {
      queryParams.append("verified_only", String(params.verifiedOnly));
    }
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const queryString = queryParams.toString();
    const url = `${baseUrl}/api/v1/providers${
      queryString ? `?${queryString}` : ""
    }`;

    console.log("[API Debug] getProviders: Fetching from", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getProviders (${response.status}):`,
        errorText.substring(0, 200)
      );
      return [];
    }

    const result: ApiResponse<any> = await response.json();

    if (result.success) {
      // If data has items and pagination, return paginated response
      if (result.data?.items && result.data?.pagination) {
        console.log(
          `[API Success] getProviders: ${result.data.items.length} providers found (page ${result.data.pagination.page}/${result.data.pagination.total_pages})`
        );
        return {
          items: result.data.items,
          pagination: result.data.pagination,
        };
      }

      // Otherwise return array directly (backward compatibility)
      const providers = Array.isArray(result.data)
        ? result.data
        : result.data?.items || [];

      if (Array.isArray(providers)) {
        console.log(
          `[API Success] getProviders: ${providers.length} providers found`
        );
        return providers;
      }
    }

    console.error("[API Error] getProviders: Invalid response format", result);
    return [];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getProviders:", errorMessage);
    return [];
  }
};

export const getProviderDetail = async (
  providerId: string
): Promise<Provider | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/${providerId}/profile`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getProviderDetail (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ provider?: Provider } | Provider> =
      await response.json();

    if (result.success) {
      const data = result.data;
      if (data && "provider" in data) {
        return data.provider || null;
      }

      return (data as Provider) || null;
    }

    console.error(
      "[API Error] getProviderDetail: Invalid response format",
      result
    );
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getProviderDetail:", errorMessage);
    return null;
  }
};

export const getMyProvider = async (
  token: string
): Promise<Provider | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/profile`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getMyProvider (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ provider?: Provider } | Provider> =
      await response.json();

    if (result.success) {
      const data = result.data;
      if (data && typeof data === "object" && "provider" in data) {
        return data.provider || null;
      }

      return (data as Provider) || null;
    }

    console.error("[API Error] getMyProvider: Invalid response format", result);
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getMyProvider:", errorMessage);
    return null;
  }
};

export const updateMyProvider = async (
  token: string,
  payload: UpdateMyProviderPayload
): Promise<Provider | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/profile`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] updateMyProvider (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ provider?: Provider }> = await response.json();

    if (result.success) {
      return result.data?.provider || null;
    }

    console.error(
      "[API Error] updateMyProvider: Invalid response format",
      result
    );
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] updateMyProvider:", errorMessage);
    return null;
  }
};

export const getMyProviderCertificates = async (
  token: string
): Promise<ProviderCertificationItem[]> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/certifications`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const result: ApiResponse<{
      certifications?: ProviderCertificationItem[];
    }> = await response.json();

    if (result.success) {
      return result.data?.certifications || [];
    }

    return [];
  } catch (error) {
    console.error("[API Error] getMyProviderCertificates:", error);
    return [];
  }
};

export const addMyProviderCertificate = async (
  token: string,
  file: File
): Promise<boolean> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/certifications`;
    const formData = new FormData();
    formData.append("certificate_file", file);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return response.ok;
  } catch (error) {
    console.error("[API Error] addMyProviderCertificate:", error);
    return false;
  }
};

export const deleteMyProviderCertificate = async (
  token: string,
  certificationId: string
): Promise<boolean> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/certifications/${certificationId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[API Error] deleteMyProviderCertificate:", error);
    return false;
  }
};

export const addMySpecializations = async (
  token: string,
  serviceTypeIds: number[]
): Promise<boolean> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/specializations`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ service_type_ids: serviceTypeIds }),
    });

    return response.ok;
  } catch (error) {
    console.error("[API Error] addMySpecializations:", error);
    return false;
  }
};

export const deleteMySpecializationByServiceType = async (
  token: string,
  serviceTypeId: number
): Promise<boolean> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;

    const url = `${baseUrl}/api/v1/providers/me/specializations/${serviceTypeId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[API Error] deleteMySpecializationByServiceType:", error);
    return false;
  }
};

export const createMyAvailability = async (
  token: string,
  payload: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active?: boolean;
  }
): Promise<any | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/providers/me/availabilities`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const result: ApiResponse<{ availability?: any }> = await response.json();
    if (result.success) return result.data?.availability || null;
    return null;
  } catch (error) {
    console.error("[API Error] createMyAvailability:", error);
    return null;
  }
};

export const updateMyAvailability = async (
  token: string,
  availabilityId: string,
  payload: {
    day_of_week?: number;
    start_time?: string;
    end_time?: string;
    is_active?: boolean;
  }
): Promise<any | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/providers/me/availabilities/${availabilityId}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;

    const result: ApiResponse<{ availability?: any }> = await response.json();
    if (result.success) return result.data?.availability || null;
    return null;
  } catch (error) {
    console.error("[API Error] updateMyAvailability:", error);
    return null;
  }
};

export const deleteMyAvailability = async (
  token: string,
  availabilityId: string
): Promise<boolean> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/providers/me/availabilities/${availabilityId}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[API Error] deleteMyAvailability:", error);
    return false;
  }
};

export const verifyProvider = async (
  token: string,
  providerId: string,
  verificationStatus: "approved" | "rejected"
): Promise<Provider | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/providers/${providerId}/verification`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ verification_status: verificationStatus }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] verifyProvider (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ provider?: Provider }> = await response.json();

    if (result.success) {
      return result.data?.provider || null;
    }

    return null;
  } catch (error) {
    console.error("[API Error] verifyProvider:", error);
    return null;
  }
};

export const verifyCertification = async (
  token: string,
  certificationId: string,
  isVerified: boolean
): Promise<ProviderCertificationItem | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/providers/certifications/${certificationId}/verification`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ is_verified: isVerified }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] verifyCertification (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ certification?: ProviderCertificationItem }> =
      await response.json();

    if (result.success) {
      return result.data?.certification || null;
    }

    return null;
  } catch (error) {
    console.error("[API Error] verifyCertification:", error);
    return null;
  }
};
