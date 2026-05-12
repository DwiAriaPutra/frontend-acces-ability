/*
Header: Firebase initialization (modular SDK)
Tujuan: Centralized Firebase app initialization following official Firebase documentation.
Caller: src/utils/fcm.ts, public/firebase-messaging-sw.js, dan client components.
Dependensi: firebase package dengan modular imports.
*/

import { initializeApp, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: any = null;

export function getOrInitializeApp() {
  if (app) {
    return app;
  }

  try {
    app = getApp();
  } catch {
    app = initializeApp(firebaseConfig);
  }

  return app;
}

export const firebaseAppConfig = firebaseConfig;
