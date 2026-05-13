/*
Header: Device API helper
Tujuan: Memanggil endpoint backend untuk registrasi device token FCM dari web client.
Caller: UI setelah user login dan memperoleh FCM token.
Dependensi: NEXT_PUBLIC_BACKEND_URL, token auth di localStorage.
*/

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

export const registerDevice = async (payload: {
  platform: string;
  token: string;
  metadata?: any;
}) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BACKEND_URL}/api/v1/devices/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[devices.register] failed", response.status, text);
      return { success: false, message: `HTTP ${response.status}` };
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("[devices.register] error", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
};

/**
 * Unregister device token on logout
 * @param token FCM token to unregister
 */
export const unregisterDevice = async (token: string) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BACKEND_URL}/api/v1/devices/unregister`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("[devices.unregister] failed", response.status, text);
      return { success: false, message: `HTTP ${response.status}` };
    }

    const result = await response.json();
    return result;
  } catch (err) {
    console.error("[devices.unregister] error", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : String(err),
    };
  }
};
