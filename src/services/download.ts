/**
 * Download di documenti (PDF, ecc.) e apertura con app esterna su Android.
 * Su browser fallback: apertura in nuova scheda.
 */

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';

const filenameFromUrl = (url: string): string => {
  const u = new URL(url, 'https://x');
  const last = u.pathname.split('/').filter(Boolean).pop() || `file-${Date.now()}`;
  return decodeURIComponent(last);
};

export interface DownloadResult {
  uri: string;
  filename: string;
}

export async function downloadAndOpen(url: string, suggestedName?: string): Promise<DownloadResult | null> {
  if (!Capacitor.isNativePlatform()) {
    await Browser.open({ url });
    return null;
  }

  const filename = suggestedName || filenameFromUrl(url);

  const result = await Filesystem.downloadFile({
    url,
    path: filename,
    directory: Directory.Documents,
    recursive: true,
  });

  if (result.path) {
    await Browser.open({ url: Capacitor.convertFileSrc(result.path) });
  }
  return { uri: result.path || '', filename };
}

/**
 * Apre un URL fuori dall'app (Chrome Custom Tabs / app di sistema per
 * tel:, mailto:, deep link). Non lancia mai: se il plugin rigetta
 * (es. nessuna app gestore per lo schema), ripiega su window.open.
 */
export async function openExternal(url: string): Promise<void> {
  try {
    await Browser.open({ url });
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}
