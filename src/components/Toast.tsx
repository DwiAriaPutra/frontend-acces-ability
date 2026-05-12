"use client";

import React, { useEffect } from "react";

type ToastProps = {
  id?: string;
  message: string;
  type?: "info" | "success" | "error";
  onClose?: () => void;
  durationMs?: number;
};

export default function Toast({
  message,
  type = "info",
  onClose,
  durationMs = 4000,
}: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), durationMs);
    return () => clearTimeout(t);
  }, [onClose, durationMs]);

  const bg =
    type === "success" ? "bg-green-600" : type === "error" ? "bg-red-600" : "bg-gray-800";

  return (
    <div className={`fixed right-4 bottom-6 z-50 max-w-sm ${bg} text-white px-4 py-3 rounded-lg shadow-lg`}>
      <div className="text-sm">{message}</div>
    </div>
  );
}
