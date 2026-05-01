/*
Tujuan: API functions untuk review/rating provider.
Caller: booking detail page dan provider detail page.
Dependensi: types.ts.
*/

import { ApiResponse, CreateReviewPayload, ReviewItem } from "./types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const createReview = async (
  token: string,
  payload: CreateReviewPayload
): Promise<ReviewItem | null> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = `${baseUrl}/api/v1/reviews`;

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
        `[API Error] createReview (${response.status}):`,
        errorText.substring(0, 200)
      );
      return null;
    }

    const result: ApiResponse<{ review?: ReviewItem }> = await response.json();

    if (result.success) {
      return result.data?.review || null;
    }

    console.error("[API Error] createReview: Invalid response format", result);
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] createReview:", errorMessage);
    return null;
  }
};

export const getProviderReviews = async (
  providerId: string,
  params?: { page?: number; limit?: number }
): Promise<{
  items: ReviewItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}> => {
  try {
    const baseUrl = BACKEND_URL.endsWith("/")
      ? BACKEND_URL.slice(0, -1)
      : BACKEND_URL;
    const url = new URL(
      `${baseUrl}/api/v1/reviews/providers/${providerId}/reviews`
    );

    if (params?.page) url.searchParams.set("page", String(params.page));
    if (params?.limit) url.searchParams.set("limit", String(params.limit));

    const response = await fetch(String(url), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[API Error] getProviderReviews (${response.status}):`,
        errorText.substring(0, 200)
      );
      return { items: [], pagination: undefined };
    }

    const result: ApiResponse<any> = await response.json();

    if (result.success) {
      return {
        items: result.data?.items || [],
        pagination: result.data?.pagination,
      };
    }

    console.error(
      "[API Error] getProviderReviews: Invalid response format",
      result
    );
    return { items: [], pagination: undefined };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("[API Error] getProviderReviews:", errorMessage);
    return { items: [], pagination: undefined };
  }
};
