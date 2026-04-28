/*
Tujuan: API functions untuk mengambil daftar service type dari backend.
Caller: Register provider step 2 dan UI lain yang butuh daftar layanan.
Dependensi: types.ts
Main Functions: getServiceTypes.
Side Effects: HTTP GET request ke backend.
*/

import { ApiResponse, ServiceType } from './types';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

/**
 * Fetch all service types from backend
 * @returns Array of service types or empty array on error
 */
export const getServiceTypes = async (): Promise<ServiceType[]> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/service-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getServiceTypes failed with status ${response.status}:`,
        errorText.substring(0, 200)
      );
      return [];
    }

    const result: ApiResponse<{ items?: ServiceType[] } | ServiceType[]> =
      await response.json();

    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : result.data?.items || [];

      if (Array.isArray(items)) {
        return items;
      }
    }

    console.error('[API Error] getServiceTypes: Invalid response format', result);
    return [];
  } catch (error) {
    console.error('[API Error] getServiceTypes:', error);
    return [];
  }
};
