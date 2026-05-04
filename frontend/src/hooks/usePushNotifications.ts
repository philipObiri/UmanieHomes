import { useEffect, useRef } from 'react';
import { api } from '../api/client';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function registerSW(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    return reg;
  } catch (e) {
    console.warn('[PWA] Service worker registration failed:', e);
    return null;
  }
}

async function subscribeToPush(reg: ServiceWorkerRegistration): Promise<void> {
  if (!VAPID_PUBLIC_KEY) return;
  try {
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    // Send subscription to backend with flat fields
    const json = sub.toJSON();
    await api.post('/notifications/push-subscriptions/', {
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
    });
  } catch (e) {
    console.warn('[PWA] Push subscription failed:', e);
  }
}

export function usePWA() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    registerSW().then((reg) => {
      if (!reg || !VAPID_PUBLIC_KEY) return;

      // Only request push permission after a user gesture or short delay
      const trySubscribe = () => {
        if (Notification.permission === 'granted') {
          subscribeToPush(reg);
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') subscribeToPush(reg);
          });
        }
      };

      // Delay to not interrupt first load
      setTimeout(trySubscribe, 5000);
    });
  }, []);
}
