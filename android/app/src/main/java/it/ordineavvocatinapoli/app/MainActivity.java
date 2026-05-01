package it.ordineavvocatinapoli.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Permette ai banner di consenso privacy/cookie di siti integrati
        // (Riconosco, GdP, Sito COA, ecc.) di salvare il consenso anche
        // quando caricati come iframe cross-origin nel WebView.
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            cookieManager.setAcceptThirdPartyCookies(webView, true);

            WebSettings settings = webView.getSettings();
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptEnabled(true);
            // Impedisce di "rimpicciolire" i siti vecchi (gdp.giustizia.it):
            // li mostra alla loro larghezza originale, scrollabili e zoomabili.
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
            settings.setBuiltInZoomControls(true);
            settings.setDisplayZoomControls(false);
        }
    }

    /**
     * Forza il flush dei cookie su disco quando l'app va in background.
     * Senza questo, i cookie del banner privacy del sito Ordine (e di ogni
     * altro iframe) potrebbero andare persi alla chiusura dell'app, e il
     * banner riapparirebbe ad ogni nuova sessione.
     */
    @Override
    public void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }
}
