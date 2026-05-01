"use client";

import React, { useState } from "react";
import { createReview } from "@/api";

type Props = {
  bookingId: string;
  existingReview?: { rating: number; comment?: string | null } | null;
  onCreated?: () => void | Promise<void>;
};

export default function ReviewForm({ bookingId, existingReview, onCreated }: Props) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return setError("Sesi login tidak ditemukan.");
    if (!bookingId) return setError("Booking tidak ditemukan.");
    if (rating < 1 || rating > 5) return setError("Rating harus antara 1 sampai 5.");

    setIsSubmitting(true);
    try {
      const result = await createReview(token, {
        booking_id: bookingId,
        rating,
        comment: comment.trim() || undefined,
      });

      if (!result) throw new Error("Gagal menyimpan rating");

      setMessage("Terima kasih, rating Anda berhasil disimpan.");
      if (typeof onCreated === "function") await onCreated();
    } catch (err) {
      let message = "Gagal menyimpan rating. Coba lagi.";
      if (err && typeof err === "object") {
        try {
          message = (err as { message?: unknown }).message as string;
        } catch {
          // fallthrough
        }
      }
      setError(message || "Gagal menyimpan rating. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (existingReview) {
    return (
      <div className="rounded-2xl bg-green-50 p-4 border border-green-100">
        <p className="text-sm font-semibold text-green-800">Rating Anda sudah tersimpan</p>
        <p className="mt-2 text-sm text-gray-700">{"★".repeat(existingReview.rating)}{"☆".repeat(Math.max(5 - existingReview.rating, 0))}</p>
        {existingReview.comment ? (
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">{existingReview.comment}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Rating</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`h-11 w-11 rounded-xl border text-lg font-bold transition-all ${
                rating >= value
                  ? "border-yellow-300 bg-yellow-50 text-yellow-500"
                  : "border-gray-200 bg-white text-gray-300 hover:border-yellow-200 hover:text-yellow-400"
              }`}
              aria-label={`Beri rating ${value}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-gray-700">Komentar</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
          placeholder="Ceritakan pengalaman Anda dengan provider ini"
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {isSubmitting ? "Menyimpan..." : "Kirim Rating"}
        </button>
      </div>
    </div>
  );
}
