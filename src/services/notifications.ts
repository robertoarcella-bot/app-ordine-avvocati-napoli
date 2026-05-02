/**
 * Notifiche locali per nuove news del PST (Min. Giustizia).
 *
 * Approccio "polling all'avvio":
 *  - All'apertura dell'app (e ogni volta che torna in foreground), chiama
 *    fetchPstNews(). Se trova news con id non ancora viste (rispetto al
 *    "last seen id" salvato in Preferences), mostra una notifica locale.
 *  - L'utente, dopo aver acconsentito al permesso, vede la notifica anche
 *    se l'app non e' aperta (la notifica scattera' all'apertura successiva).
 *  - Per vere notifiche push background (anche con app chiusa) servirebbe
 *    Firebase Cloud Messaging + un server che monitori il PST: rimandato
 *    a una fase futura.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { BackgroundRunner } from '@capacitor/background-runner';
import { fetchPstNews } from './sources/pst';
import type { SourceNewsItem } from '../config/sources';

const RUNNER_LABEL = 'pst-news-watcher';

/** Comunica al runner background lo stato "notifiche attive" via dispatchEvent */
async function syncRunnerEnabled(enabled: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await BackgroundRunner.dispatchEvent({
      label: RUNNER_LABEL,
      event: 'setNotifyEnabled',
      details: { enabled },
    });
  } catch {
    // background runner potrebbe non essere ancora avviato: ignora
  }
}

const PREFS_LAST_SEEN = 'pst:last-seen-id';
const PREFS_PERMISSION_ASKED = 'pst:perm-asked';
const PREFS_NOTIFY_ENABLED = 'pst:notify-enabled';

/**
 * Stato delle notifiche secondo l'utente:
 *  - 'unset':   l'utente non ha ancora deciso (mostra prompt)
 *  - 'enabled': l'utente ha attivato le notifiche
 *  - 'denied':  l'utente le ha rifiutate (non chiediamo piu')
 */
export type NotifyPref = 'unset' | 'enabled' | 'denied';

export async function getNotifyPref(): Promise<NotifyPref> {
  const v = await Preferences.get({ key: PREFS_NOTIFY_ENABLED });
  if (v.value === '1') return 'enabled';
  if (v.value === '0') return 'denied';
  return 'unset';
}

export async function setNotifyPref(pref: NotifyPref): Promise<void> {
  if (pref === 'unset') {
    await Preferences.remove({ key: PREFS_NOTIFY_ENABLED });
  } else {
    await Preferences.set({ key: PREFS_NOTIFY_ENABLED, value: pref === 'enabled' ? '1' : '0' });
  }
  // Sync stato col background runner (NB: il KV del runner è separato)
  await syncRunnerEnabled(pref === 'enabled');
}

export async function hasAlreadyAskedPermission(): Promise<boolean> {
  const v = await Preferences.get({ key: PREFS_PERMISSION_ASKED });
  return v.value === '1';
}

/**
 * Richiede il permesso al sistema operativo. Su Android 13+ apre il
 * dialog nativo. Restituisce true se concesso.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  await Preferences.set({ key: PREFS_PERMISSION_ASKED, value: '1' });
  if (!Capacitor.isNativePlatform()) {
    // Su browser: usa Notification API web
    if (typeof Notification !== 'undefined') {
      const r = await Notification.requestPermission();
      const ok = r === 'granted';
      await setNotifyPref(ok ? 'enabled' : 'denied');
      return ok;
    }
    return false;
  }
  try {
    const result = await LocalNotifications.requestPermissions();
    const granted = result.display === 'granted';
    await setNotifyPref(granted ? 'enabled' : 'denied');
    await syncRunnerEnabled(granted);
    return granted;
  } catch {
    await setNotifyPref('denied');
    await syncRunnerEnabled(false);
    return false;
  }
}

/**
 * Stato del permesso lato sistema (potrebbe essere stato revocato dalle
 * impostazioni del telefono dopo che l'utente l'aveva concesso in app).
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  }
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

async function showNotification(title: string, body: string, extra?: Record<string, unknown>): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
    return;
  }
  const id = (Date.now() & 0x7fffffff);
  await LocalNotifications.schedule({
    notifications: [{
      id,
      title,
      body,
      smallIcon: 'ic_stat_icon_config_sample',
      schedule: { at: new Date(Date.now() + 200) },
      extra,
    }],
  });
}

/**
 * Controlla se ci sono news PST piu' recenti dell'ultima vista.
 * In caso affermativo, mostra una notifica locale (se le notifiche
 * sono autorizzate dall'utente).
 *
 * Da chiamare all'avvio dell'app e quando torna in foreground.
 */
export async function checkAndNotifyNewPstNews(): Promise<{ checked: boolean; newCount: number }> {
  const pref = await getNotifyPref();
  if (pref !== 'enabled') return { checked: false, newCount: 0 };
  const granted = await checkNotificationPermission();
  if (!granted) return { checked: false, newCount: 0 };

  let news: SourceNewsItem[];
  try {
    news = await fetchPstNews(1);
  } catch {
    return { checked: false, newCount: 0 };
  }
  if (news.length === 0) return { checked: true, newCount: 0 };

  const lastSeen = (await Preferences.get({ key: PREFS_LAST_SEEN })).value || '';
  // News vengono restituite in ordine cronologico discendente
  const newsItems: SourceNewsItem[] = [];
  for (const n of news) {
    if (n.id === lastSeen) break;
    newsItems.push(n);
  }

  const isFirstRun = !lastSeen;
  const newest = news[0];
  // Salva come "visto" il primo della lista per evitare di rinotificare
  await Preferences.set({ key: PREFS_LAST_SEEN, value: newest.id });

  if (isFirstRun) {
    // Prima volta: NON notificare, solo segna lo stato attuale
    return { checked: true, newCount: 0 };
  }

  if (newsItems.length === 0) return { checked: true, newCount: 0 };

  const title = newsItems.length === 1
    ? 'Nuovo avviso PST — Min. Giustizia'
    : `${newsItems.length} nuovi avvisi PST — Min. Giustizia`;
  const body = newsItems.length === 1
    ? newsItems[0].title.slice(0, 200)
    : newsItems[0].title.slice(0, 120) + (newsItems.length > 1 ? ` (+${newsItems.length - 1})` : '');

  await showNotification(title, body, { source: 'pst', newCount: newsItems.length });

  return { checked: true, newCount: newsItems.length };
}

/** Reset dello stato (utile per debug o se si reinstalla l'app) */
export async function resetNotificationState(): Promise<void> {
  await Preferences.remove({ key: PREFS_LAST_SEEN });
  await Preferences.remove({ key: PREFS_PERMISSION_ASKED });
  await Preferences.remove({ key: PREFS_NOTIFY_ENABLED });
}
