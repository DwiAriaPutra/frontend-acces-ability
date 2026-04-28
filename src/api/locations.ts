/*
Tujuan: API functions untuk locations endpoints (provinces, regencies).
Caller: Components yang butuh location data.
Dependensi: types.ts
Main Functions: getProvinces, getRegencies.
Side Effects: HTTP GET requests ke backend.
*/

import { Province, Regency, ApiResponse } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * Fetch all provinces from backend
 * @returns Array of provinces or empty array on error
 */
export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/locations/provinces`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getProvinces failed with status ${response.status}:`,
        errorText.substring(0, 200)
      );
      return [];
    }

    // Parse JSON
    const result = await response.json();

    // Validate response structure
    if (result.success) {
      // Handle both formats: direct array or items wrapper
      const items = Array.isArray(result.data)
        ? result.data
        : result.data?.items || [];
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }

    console.error("[API Error] getProvinces: Invalid response format", result);
    return [];
  } catch (error) {
    console.error("[API Error] getProvinces:", error);
    return [];
  }
};

/**
 * Fetch regencies for a specific province
 * @param provinceId - Province ID to fetch regencies for
 * @returns Array of regencies or empty array on error
 */
export const getRegencies = async (provinceId: string): Promise<Regency[]> => {
  if (!provinceId) {
    console.warn("[API Warn] getRegencies called with empty provinceId");
    return [];
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/locations/provinces/${provinceId}/regencies`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getRegencies failed with status ${response.status}:`,
        errorText.substring(0, 200)
      );
      return [];
    }

    // Parse JSON
    const result = await response.json();

    // Validate response structure
    if (result.success) {
      // Handle both formats: direct array or items wrapper
      const items = Array.isArray(result.data)
        ? result.data
        : result.data?.items || [];
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }

    console.error("[API Error] getRegencies: Invalid response format", result);
    return [];
  } catch (error) {
    console.error("[API Error] getRegencies:", error);
    return [];
  }
};
