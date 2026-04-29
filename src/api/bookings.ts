/*
Tujuan: API functions untuk booking endpoints.
Caller: Components yang handle booking history dan booking process.
Dependensi: types.ts
Main Functions: getUserBookings.
*/

import { Booking, ApiResponse } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * Get bookings for the current logged-in user
 * @param token - Access token for authentication
 * @returns List of bookings or empty array on error
 */
export const getUserBookings = async (
  token: string
): Promise<Booking[]> => {
  try {
    // Ensure URL doesn't have double slashes
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings`;

    console.log("[API Debug] getUserBookings: Fetching from", url);

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
        `[API Error] getUserBookings (${response.status}):`,
        errorText.substring(0, 200)
      );
      return [];
    }

    const result: ApiResponse<any> = await response.json();

    if (result.success) {
      // Handle both result.data as array or result.data.bookings as array
      // Based on FLOW.md, it might be { bookings: [...] }
      const bookings = Array.isArray(result.data)
        ? result.data
        : result.data?.bookings || [];

      if (Array.isArray(bookings)) {
        console.log(
          `[API Success] getUserBookings: ${bookings.length} bookings found`
        );
        return bookings;
      }
    }

    console.error(
      "[API Error] getUserBookings: Invalid response format",
      result
    );
    return [];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getUserBookings:", errorMessage);
    return [];
  }
};
