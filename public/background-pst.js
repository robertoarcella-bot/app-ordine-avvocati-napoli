/**
 * Background runner per il monitoraggio delle news PST
 * (Portale Servizi Telematici del Min. Giustizia).
 *
 * Eseguito periodicamente (ogni ~60 min, con la cadenza che Android
 * concede in base alle policy di risparmio batteria) anche con app
 * chiusa, dentro un runtime QuickJS isolato (vedi @capacitor/background-runner).
 *
 * Funzionalità:
 *  - Fetch della pagina news.page del PST
 *  - Estrazione del primo contentId (NWS<num>) tramite regex
 *  - Confronto con last-seen-id salvato in CapacitorKV
 *  - Se diverso e non e' la prima esecuzione, schedula una LocalNotification
 */

/** Sincronizza la preferenza "notifiche attive" dal main thread al KV del runner */
addEventListener('setNotifyEnabled', (resolve, _reject, args) => {
  try {
    CapacitorKV.set('pst.notifyEnabled', args && args.enabled ? '1' : '0');
  } catch (e) { /* noop */ }
  resolve();
});

/** Reset baseline (es. dopo cambio account o per debug) */
addEventListener('resetBaseline', (resolve) => {
  try {
    CapacitorKV.remove('pst.lastSeen');
    CapacitorKV.remove('pst.bootSeen');
  } catch (e) { /* noop */ }
  resolve();
});

addEventListener('checkPstNews', async (resolve, reject) => {
  try {
    const PST_URL = 'https://pst.giustizia.it/PST/it/news.page';
    const KEY_LAST = 'pst.lastSeen';
    const KEY_BOOT = 'pst.bootSeen';

    // Verifica se l'utente ha attivato le notifiche dall'app
    const enabled = CapacitorKV.get('pst.notifyEnabled');
    if (enabled !== '1') {
      resolve();
      return;
    }

    // Fetch HTML della pagina news
    const res = await fetch(PST_URL, {
      method: 'GET',
      headers: {
        Accept: 'text/html',
        'User-Agent': 'AppOrdineAvvocatiNapoli/1.0',
      },
    });
    if (!res.ok) {
      resolve();
      return;
    }
    const html = await res.text();

    // Estrai il PRIMO contentId (la news più recente in cima alla lista)
    const match = html.match(/contentId=(NWS\d+)/i);
    if (!match) {
      resolve();
      return;
    }
    const newestId = match[1];

    // Estrai anche il primo titolo (cerca un h5 vicino al primo contentId)
    let firstTitle = '';
    const idx = html.indexOf(match[0]);
    if (idx > 0) {
      const slice = html.slice(Math.max(0, idx - 5000), idx + 5000);
      const tm = slice.match(/<h5[^>]*>([^<]{5,200})<\/h5>/i)
              || slice.match(/<h4[^>]*>([^<]{5,200})<\/h4>/i)
              || slice.match(/<h3[^>]*>([^<]{5,200})<\/h3>/i);
      if (tm) firstTitle = tm[1].replace(/\s+/g, ' ').trim();
    }

    const lastSeen = CapacitorKV.get(KEY_LAST) || '';
    const isFirstRun = CapacitorKV.get(KEY_BOOT) !== '1';

    if (newestId === lastSeen) {
      resolve();
      return;
    }

    // Salva il nuovo last-seen
    CapacitorKV.set(KEY_LAST, newestId);
    CapacitorKV.set(KEY_BOOT, '1');

    // Prima esecuzione: imposto il baseline ma NON notifico
    if (isFirstRun) {
      resolve();
      return;
    }

    // Schedula notifica locale
    const notifId = (Date.now() & 0x7fffffff);
    CapacitorNotifications.schedule([{
      id: notifId,
      title: 'Nuovo avviso PST — Min. Giustizia',
      body: firstTitle ? firstTitle.slice(0, 200) : 'È stato pubblicato un nuovo avviso sul Portale Servizi Telematici.',
    }]);

    resolve();
  } catch (e) {
    // In caso di errore, completiamo senza far crashare il runner
    if (typeof reject === 'function') reject({ message: 'pst check failed: ' + (e && e.message ? e.message : String(e)) });
    else resolve();
  }
});
