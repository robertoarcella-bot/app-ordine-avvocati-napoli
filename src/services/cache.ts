/**
 * Cache locale via @capacitor/preferences (su browser usa localStorage di fallback).
 * Memorizza valori JSON con TTL.
 */

import { Preferences } from '@capacitor/preferences';

interface Entry<T> {
  v: T;
  expires: number;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key });
    if (!value) return null;
    const entry = JSON.parse(value) as Entry<T>;
    if (entry.expires && Date.now() > entry.expires) {
      await Preferences.remove({ key });
      return null;
    }
    return entry.v;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlMinutes: number): Promise<void> {
  const entry: Entry<T> = {
    v: value,
    expires: Date.now() + ttlMinutes * 60 * 1000,
  };
  await Preferences.set({ key, value: JSON.stringify(entry) });
}

export async function cacheClear(prefix?: string): Promise<void> {
  if (!prefix) {
    await Preferences.clear();
    return;
  }
  const { keys } = await Preferences.keys();
  for (const k of keys) {
    if (k.startsWith(prefix)) await Preferences.remove({ key: k });
  }
}
