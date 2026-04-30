/*
Tujuan: API functions untuk booking endpoints.
Caller: Components yang handle booking history, detail, dan booking process.
Dependensi: types.ts
Main Functions: getUserBookings, getBookingDetail, getBookingHistory, createBooking.
*/

import {
  Booking,
  BookingDetail,
  BookingStatusHistoryItem,
  ApiResponse,
  BookingCreatePayload,
} from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

/**
 * Get bookings for the current logged-in user
 * @param token - Access token for authentication
 * @returns List of bookings or empty array on error
 */
export const getUserBookings = async (token: string): Promise<Booking[]> => {
  try {
    // Ensure URL doesn't have double slashes
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    // Use /me endpoint which requires auth and returns user's bookings
    const url = `${baseUrl}/api/v1/bookings/me`;

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
      // Backend returns { items, pagination } for /bookings/me.
      const bookings = Array.isArray(result.data)
        ? result.data
        : result.data?.items || result.data?.bookings || [];

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

export const getBookingDetail = async (
  token: string,
  bookingId: string
): Promise<BookingDetail | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings/${bookingId}`;

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
        `[API Error] getBookingDetail (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ booking?: BookingDetail }> =
      await response.json();

    if (result.success) {
      return result.data?.booking || null;
    }

    console.error(
      "[API Error] getBookingDetail: Invalid response format",
      result
    );
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getBookingDetail:", errorMessage);
    return null;
  }
};

export const getBookingHistory = async (
  token: string,
  bookingId: string
): Promise<BookingStatusHistoryItem[]> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings/${bookingId}/history`;

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
        `[API Error] getBookingHistory (${response.status}):`,
        errorText.substring(0, 200)
      );
      return [];
    }

    const result: ApiResponse<{ histories?: BookingStatusHistoryItem[] }> =
      await response.json();

    if (result.success) {
      return result.data?.histories || [];
    }

    console.error(
      "[API Error] getBookingHistory: Invalid response format",
      result
    );
    return [];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getBookingHistory:", errorMessage);
    return [];
  }
};

export const createBooking = async (
  token: string,
  payload: BookingCreatePayload
): Promise<Booking | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] createBooking (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ booking?: Booking }> = await response.json();

    if (result.success) {
      return result.data?.booking || null;
    }

    console.error("[API Error] createBooking: Invalid response format", result);
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] createBooking:", errorMessage);
    return null;
  }
};

export const cancelBooking = async (
  token: string,
  bookingId: string,
  cancelReason?: string
): Promise<Booking | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings/${bookingId}/cancel`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cancel_reason: cancelReason }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] cancelBooking (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ booking?: Booking }> = await response.json();

    if (result.success) {
      return result.data?.booking || null;
    }

    console.error("[API Error] cancelBooking: Invalid response format", result);
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] cancelBooking:", errorMessage);
    return null;
  }
};
