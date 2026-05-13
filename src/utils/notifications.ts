/*
Header: App Notification Helpers
Tujuan: Menampilkan notifikasi browser lokal untuk aksi penting di aplikasi.
Caller: Booking flow dan admin verification actions.
Dependensi: Web Notification API.
Status: Active.
*/

type AppNotificationOptions = {
  body?: string;
  tag?: string;
  url?: string;
};

export const showAppNotification = (
  title: string,
  options: AppNotificationOptions = {}
) => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  try {
    const notification = new Notification(title, {
      body: options.body,
      icon: "/favicon.ico",
      tag: options.tag,
      data: options.url ? { url: options.url } : undefined,
    });

    if (options.url) {
      notification.onclick = () => {
        window.focus();
        window.location.href = options.url as string;
      };
    }
  } catch (error) {
    console.warn("[notification] failed to show local notification", error);
  }
};
