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

export const getUserBookings = async (token: string): Promise<Booking[]> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings/me`;

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
      const bookings = Array.isArray(result.data)
        ? result.data
        : result.data?.items || result.data?.bookings || [];

      if (Array.isArray(bookings)) {
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

export type PaginatedBookings = {
  items: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

export const getUserBookingsPaginated = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string | string[];
    dateRange?: string;
  }
): Promise<PaginatedBookings> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = new URL(`${baseUrl}/api/v1/bookings/me`);

    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));
    if (params?.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach((s) => url.searchParams.append("status", s));
      } else {
        url.searchParams.set("status", String(params.status));
      }
    }
    if (params?.dateRange)
      url.searchParams.set("dateRange", String(params.dateRange));

    const response = await fetch(String(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getUserBookingsPaginated (${response.status}):`,
        errorText.substring(0, 200)
      );
      return {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
      };
    }

    const result: ApiResponse<any> = await response.json();

    if (result.success) {
      const items = Array.isArray(result.data)
        ? result.data
        : result.data?.items || result.data?.bookings || [];

      const pagination = result.data?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 10,
        total: Array.isArray(items) ? items.length : 0,
        total_pages: 1,
      };

      return {
        items: Array.isArray(items) ? items : [],
        pagination: {
          page: Number(pagination.page || params?.page || 1),
          limit: Number(pagination.limit || params?.limit || 10),
          total: Number(pagination.total || 0),
          total_pages: Number(pagination.total_pages || 0),
        },
      };
    }

    console.error(
      "[API Error] getUserBookingsPaginated: Invalid response format",
      result
    );
    return {
      items: [],
      pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getUserBookingsPaginated:", errorMessage);
    return {
      items: [],
      pagination: { page: 1, limit: 10, total: 0, total_pages: 0 },
    };
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

export const acceptBooking = async (
  token: string,
  bookingId: string
): Promise<Booking | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings/${bookingId}/accept`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] acceptBooking (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ booking?: Booking }> = await response.json();
    if (result.success) {
      return result.data?.booking || null;
    }

    console.error("[API Error] acceptBooking: Invalid response format", result);
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] acceptBooking:", errorMessage);
    return null;
  }
};

export const completeBooking = async (
  token: string,
  bookingId: string
): Promise<Booking | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/bookings/${bookingId}/complete`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] completeBooking (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ booking?: Booking }> = await response.json();
    if (result.success) {
      return result.data?.booking || null;
    }

    console.error(
      "[API Error] completeBooking: Invalid response format",
      result
    );
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] completeBooking:", errorMessage);
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

export const rejectBooking = async (
  token: string,
  bookingId: string,
  reason = "Booking ditolak oleh provider"
): Promise<Booking | null> => {
  return cancelBooking(token, bookingId, reason);
};
