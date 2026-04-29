/*
Tujuan: API functions untuk provider-related endpoints.
Caller: Components yang handle provider search dan profiles.
Dependensi: types.ts
Main Functions: getProviders, getProviderById.
*/

import { Provider, ApiResponse } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * Get list of providers with optional filtering
 * @param query - Optional search query or filter parameters
 * @returns List of providers or empty array on error
 */
export const getProviders = async (
  params?: {
    search?: string;
    category?: string;
    limit?: number;
    page?: number;
  }
): Promise<Provider[]> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    
    // Construct query string
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.category) queryParams.append("category", params.category);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.page) queryParams.append("page", params.page.toString());

    const queryString = queryParams.toString();
    const url = `${baseUrl}/api/v1/providers${queryString ? `?${queryString}` : ""}`;

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
      // Handle result.data as array or result.data.items as array
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

    console.error(
      "[API Error] getProviders: Invalid response format",
      result
    );
    return [];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getProviders:", errorMessage);
    return [];
  }
};

/**
 * Get a single provider by ID
 * @param id - The provider's ID
 * @returns Provider object or null on error
 */
export const getProviderById = async (id: string): Promise<Provider | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    
    const url = `${baseUrl}/api/v1/providers/${id}`;

    console.log("[API Debug] getProviderById: Fetching from", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getProviderById (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<Provider> = await response.json();

    if (result.success && result.data) {
      console.log(`[API Success] getProviderById: Provider ${id} found`);
      return result.data;
    }

    console.error(
      "[API Error] getProviderById: Invalid response format",
      result
    );
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getProviderById:", errorMessage);
    return null;
  }
};
