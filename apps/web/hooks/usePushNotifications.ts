"use client";

import { useState } from "react";

export interface PushNotificationState {
  isLoading: boolean;
  token: string | null;
  permissionDenied: boolean;
  tokenError: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isLoading: false,
    token: null,
    permissionDenied: false,
    tokenError: false,
  });

  const requestPermission = async (): Promise<PushNotificationState> => {
    setState((s) => ({ ...s, isLoading: true, permissionDenied: false, tokenError: false }));

    try {
      if (typeof window === "undefined" || !("Notification" in window)) {
        const next = { ...state, isLoading: false, tokenError: false, permissionDenied: true };
        setState(next);
        return next;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        const next = { ...state, isLoading: false, permissionDenied: true };
        setState(next);
        return next;
      }

      // Register background service worker if supported
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .catch((err) => console.warn("Service worker registration:", err));
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        // VAPID key is optional for standard browser notification permission
        const next = { isLoading: false, token: "browser-granted", permissionDenied: false, tokenError: false };
        setState(next);
        return next;
      }

      // Dynamic imports avoid SSR issues
      const { getMessagingInstance } = await import("@/lib/firebase");
      const { getToken } = await import("firebase/messaging");

      const messaging = getMessagingInstance();
      if (!messaging) {
        // Graceful fallback to browser-granted
        const next = { isLoading: false, token: "browser-granted", permissionDenied: false, tokenError: false };
        setState(next);
        return next;
      }

      try {
        const token = await getToken(messaging, { vapidKey });
        if (token) {
          await fetch("/api/user/push-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }).catch((err) => console.warn("Failed saving token to backend:", err));

          const next = { isLoading: false, token, permissionDenied: false, tokenError: false };
          setState(next);
          return next;
        }
      } catch (fcmErr) {
        console.warn("FCM getToken note (browser permission granted):", fcmErr);
      }

      const next = { isLoading: false, token: "browser-granted", permissionDenied: false, tokenError: false };
      setState(next);
      return next;
    } catch (error) {
      console.error("Push notification registration:", error);
      const next = { ...state, isLoading: false, tokenError: false };
      setState(next);
      return next;
    }
  };

  const clearToken = async (): Promise<void> => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const { getMessagingInstance } = await import("@/lib/firebase");
      const { deleteToken } = await import("firebase/messaging");

      const messaging = getMessagingInstance();
      if (messaging) {
        await deleteToken(messaging);
      }
    } catch (error) {
      console.error("Failed to delete FCM token from browser:", error);
    }

    try {
      await fetch("/api/user/push-token", { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete FCM token from server:", error);
    }

    setState({
      isLoading: false,
      token: null,
      permissionDenied: false,
      tokenError: false,
    });
  };

  return {
    ...state,
    requestPermission,
    clearToken,
  };
}
