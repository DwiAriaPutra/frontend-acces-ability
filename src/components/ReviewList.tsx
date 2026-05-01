import React from "react";

type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  created_at?: string | null;
};

export default function ReviewList({ items }: { items: Review[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-gray-500">Belum ada ulasan untuk provider ini.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
              <span className="text-yellow-500">{"★".repeat(item.rating)}</span>
              <span className="text-gray-300">{"★".repeat(Math.max(5 - item.rating, 0))}</span>
            </div>
            {item.created_at ? (
              <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString("id-ID")}</span>
            ) : null}
          </div>
          {item.comment ? (
            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{item.comment}</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">Tidak ada komentar.</p>
          )}
        </div>
      ))}
    </div>
  );
}
