/*
Header: Firebase Cloud Messaging helper (web)
Tujuan: Initialize Firebase messaging, request permission, get FCM token, and register it to backend.
Caller: Called after successful login to prompt notification permission and register token.
Dependensi: NEXT_PUBLIC_FIREBASE_* env vars and `firebase` package (modular SDK). Use dynamic import so build doesn't fail if package missing.
*/

import { registerDevice } from "@/api/devices";
import { getOrInitializeApp } from "@/lib/firebase";

const PUSH_DEBUG = process.env.NEXT_PUBLIC_PUSH_DEBUG === "true";

const pushLog = (...args: unknown[]) => {
  if (PUSH_DEBUG) {
    console.log(...args);
  }
};

type ForegroundListenerOptions = {
  onMessage?: (payload: any) => void;
};

const getPayloadTitle = (payload: any) =>
  payload?.notification?.title ||
  payload?.data?.title ||
  payload?.data?.notification_title ||
  "Notifikasi Baru";

const getPayloadBody = (payload: any) =>
  payload?.notification?.body ||
  payload?.data?.body ||
  payload?.data?.message ||
  payload?.data?.notification_body ||
  "Anda menerima pesan baru.";

const getPayloadUrl = (payload: any) =>
  payload?.fcmOptions?.link || payload?.data?.url || payload?.data?.link || "";

const toUint8ArrayFromBase64Url = (base64Url: string) => {
  const padded = `${base64Url}${"=".repeat((4 - (base64Url.length % 4)) % 4)}`;
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
};

const runPushSubscribePreflight = async (
  registration: ServiceWorkerRegistration,
  vapidKey: string
) => {
  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      await existing.unsubscribe();
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toUint8ArrayFromBase64Url(vapidKey),
    });

    // Keep state clean; Firebase getToken will create/manage its own subscription.
    await subscription.unsubscribe();

    return {
      ok: true,
      endpoint: subscription.endpoint,
    };
  } catch (preflightErr) {
    return {
      ok: false,
      errorName:
        preflightErr instanceof Error ? preflightErr.name : "UnknownError",
      errorMessage:
        preflightErr instanceof Error
          ? preflightErr.message
          : String(preflightErr),
    };
  }
};

const getPermissionState = async () => {
  try {
    if (typeof navigator === "undefined" || !("permissions" in navigator)) {
      return "permissions_api_unavailable";
    }

    const status = await navigator.permissions.query({
      name: "notifications" as PermissionName,
    });
    return status.state;
  } catch {
    return "permissions_query_failed";
  }
};

const collectPushDiagnostics = async () => {
  if (typeof window === "undefined") {
    return { context: "server" };
  }

  const hasServiceWorker =
    typeof navigator !== "undefined" && "serviceWorker" in navigator;
  const hasPushManager =
    typeof window !== "undefined" && "PushManager" in window;
  const hasNotification =
    typeof window !== "undefined" && "Notification" in window;
  const isSecure = window.isSecureContext;
  const notificationPermission = hasNotification
    ? Notification.permission
    : "unsupported";
  const permissionsApiState = await getPermissionState();

  let registrationCount = 0;
  let hasActiveRegistration = false;
  let hasPushSubscription = false;

  if (hasServiceWorker) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      registrationCount = registrations.length;
      hasActiveRegistration = registrations.some((item) =>
        Boolean(item.active)
      );

      const subscriptionChecks = await Promise.all(
        registrations.map(async (item) => {
          try {
            return Boolean(await item.pushManager.getSubscription());
          } catch {
            return false;
          }
        })
      );
      hasPushSubscription = subscriptionChecks.some(Boolean);
    } catch {
      // keep defaults
    }
  }

  return {
    context: "browser",
    isSecureContext: isSecure,
    hasNotification,
    notificationPermission,
    permissionsApiState,
    hasServiceWorker,
    hasPushManager,
    registrationCount,
    hasActiveRegistration,
    hasPushSubscription,
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  };
};

const waitForActiveServiceWorker = async (forceRefresh = false) => {
  if (typeof navigator === "undefined" || !navigator.serviceWorker) {
    return null;
  }

  if (forceRefresh) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((item) => item.unregister()));
  }

  const swUrl = forceRefresh
    ? `/firebase-messaging-sw.js?ts=${Date.now()}`
    : "/firebase-messaging-sw.js";

  const registration = await navigator.serviceWorker.register(swUrl, {
    scope: "/",
    updateViaCache: "none",
  });

  try {
    await registration.update();
  } catch (updateErr) {
    pushLog("[fcm] service worker update failed", updateErr);
  }

  if (registration.active) {
    return registration;
  }

  try {
    const readyRegistration = await navigator.serviceWorker.ready;
    if (readyRegistration.active) {
      return readyRegistration;
    }
  } catch (readyError) {
    pushLog("[fcm] service worker ready wait failed", readyError);
  }

  return registration.active ? registration : null;
};

const resetPushSubscription = async (
  registration: ServiceWorkerRegistration | null
) => {
  if (!registration) {
    return;
  }

  try {
    const existingSubscription =
      await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
      pushLog("[fcm] existing push subscription removed");
    }
  } catch (unsubscribeErr) {
    pushLog("[fcm] failed to reset push subscription", unsubscribeErr);
  }
};

export const registerForPush = async () => {
  try {
    if (typeof window === "undefined")
      return { success: false, message: "not-client" };

    if (!("Notification" in window)) {
      return { success: false, message: "notifications_not_supported" };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, message: "permission_denied", permission };
    }

    // dynamic import firebase to avoid build-time dependency errors
    const { getMessaging, getToken } = await import("firebase/messaging");

    const app = getOrInitializeApp();
    const messaging = getMessaging(app);

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined;

    if (!vapidKey) {
      return { success: false, message: "vapid_key_missing" };
    }

    let registration = await waitForActiveServiceWorker();
    if (!registration) {
      return { success: false, message: "service_worker_not_active" };
    }

    pushLog(
      "[fcm] attempting getToken with vapidKey:",
      vapidKey?.substring(0, 20) + "..."
    );
    let fcmToken = "";

    try {
      fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });
    } catch (tokenErr) {
      const errorName = tokenErr instanceof Error ? tokenErr.name : "";
      pushLog("[fcm] initial getToken failed", tokenErr);

      if (errorName !== "AbortError") {
        throw tokenErr;
      }

      // Recover from stale/invalid SW+push state by resetting subscription and registering fresh SW.
      await resetPushSubscription(registration);
      registration = await waitForActiveServiceWorker(true);
      if (!registration) {
        return { success: false, message: "service_worker_recovery_failed" };
      }

      const preflight = await runPushSubscribePreflight(registration, vapidKey);
      if (!preflight.ok) {
        return {
          success: false,
          message: "push_subscribe_preflight_failed",
          errorName: preflight.errorName,
          preflight,
          hint: "Preflight subscribe gagal. Biasanya karena browser/profile memblokir push service, atau VAPID key tidak cocok dengan Firebase project.",
        };
      }

      fcmToken = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: registration,
      });
    }

    pushLog("[fcm] getToken succeeded, token length:", fcmToken?.length || 0);

    if (!fcmToken) {
      return { success: false, message: "no_token" };
    }

    // register token to backend
    const result = await registerDevice({ platform: "web", token: fcmToken });
    return { success: true, fcmToken, registerResult: result };
  } catch (err) {
    console.error("[fcm.registerForPush] error", err);

    const diagnostics = await collectPushDiagnostics();
    const errorName = err instanceof Error ? err.name : "UnknownError";
    const errorMessage = err instanceof Error ? err.message : String(err);

    return {
      success: false,
      message: errorMessage,
      errorName,
      diagnostics,
      hint:
        errorName === "AbortError"
          ? "Kemungkinan browser/profile memblokir push service atau service worker/subscription state korup. Cek diagnostics."
          : "Cek konfigurasi Firebase web app, VAPID key, dan service worker.",
    };
  }
};

export const diagnosePushEnvironment = async () => {
  return collectPushDiagnostics();
};

export const startForegroundMessageListener = async (
  options: ForegroundListenerOptions = {}
) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  try {
    const app = getOrInitializeApp();
    const { getMessaging, onMessage } = await import("firebase/messaging");
    const messaging = getMessaging(app);

    const unsubscribe = onMessage(messaging, (payload) => {
      pushLog("[fcm] foreground message received", payload);

      const title = getPayloadTitle(payload);
      const body = getPayloadBody(payload);
      const url = getPayloadUrl(payload);

      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "granted"
      ) {
        try {
          const notification = new Notification(title, {
            body,
            icon: payload?.notification?.icon || "/favicon.ico",
            tag: payload?.notification?.tag || payload?.data?.tag,
            data: url ? { url } : payload?.data,
          });
          if (url) {
            notification.onclick = () => {
              window.focus();
              window.location.href = url;
            };
          }
        } catch (notificationErr) {
          pushLog(
            "[fcm] failed to show foreground notification",
            notificationErr
          );
        }
      }

      if (options.onMessage) {
        options.onMessage(payload);
      }
    });

    return unsubscribe;
  } catch (listenerErr) {
    pushLog("[fcm] failed to attach foreground listener", listenerErr);
    return () => {};
  }
};
