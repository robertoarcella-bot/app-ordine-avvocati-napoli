import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonPage, IonRouterOutlet, IonSpinner, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { lazy, Suspense } from 'react';

import AppMenu from './components/AppMenu';
import OfflineBanner from './components/OfflineBanner';
import Home from './pages/Home';

/**
 * Code splitting per route: tutte le pagine tranne Home (mostrata al primo
 * avvio) vengono caricate on-demand. Toglie dal chunk iniziale anche i
 * dataset pesanti importati dalle singole pagine (magistrati, recapiti,
 * uffici penali) e le librerie usate solo da alcune di esse.
 */
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const UfficiNews = lazy(() => import('./pages/UfficiNews'));
const Sito = lazy(() => import('./pages/Sito'));
const SitoView = lazy(() => import('./pages/SitoView'));
const Documenti = lazy(() => import('./pages/Documenti'));
const MiniApps = lazy(() => import('./pages/MiniApps'));
const MiniAppView = lazy(() => import('./pages/MiniAppView'));
const ProcessoTelematico = lazy(() => import('./pages/ProcessoTelematico'));
const SourceNews = lazy(() => import('./pages/SourceNews'));
const AuleUdienze = lazy(() => import('./pages/AuleUdienze'));
const UfficioGiudiziario = lazy(() => import('./pages/UfficioGiudiziario'));
const RecapitiUffici = lazy(() => import('./pages/RecapitiUffici'));
const RicercaSezione = lazy(() => import('./pages/RicercaSezione'));
const UfficiPenali = lazy(() => import('./pages/UfficiPenali'));
const AreaRiservata = lazy(() => import('./pages/AreaRiservata'));
const Info = lazy(() => import('./pages/Info'));
const Commissione = lazy(() => import('./pages/Commissione'));
const Consiglio = lazy(() => import('./pages/Consiglio'));

/* Core CSS Ionic */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Tema COA */
import './theme/variables.css';

import { useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { checkAndNotifyNewPstNews } from './services/notifications';

setupIonicReact({ mode: 'md' });

/**
 * Polling delle news PST: all'avvio + ogni volta che l'app torna in
 * foreground. Se ci sono news non viste, schedula una notifica locale
 * (solo se l'utente ha attivato le notifiche dalla pagina Processo
 * Telematico).
 */
const useNewsPolling = () => {
  useEffect(() => {
    void checkAndNotifyNewPstNews();
    const sub = CapApp.addListener('appStateChange', state => {
      if (state.isActive) void checkAndNotifyNewPstNews();
    });
    return () => { void sub.then(s => s.remove()); };
  }, []);
};

/** Fallback mostrato mentre si scarica il chunk della pagina (lazy) */
const PageFallback: React.FC = () => (
  <IonPage>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <IonSpinner name="dots" />
    </div>
  </IonPage>
);

/**
 * Route con Suspense interno: IonRouterOutlet richiede Route come figli
 * diretti, quindi il boundary sta DENTRO ogni route, non attorno all'outlet.
 */
const lazyRender = (C: React.ComponentType) => {
  const render = () => (
    <Suspense fallback={<PageFallback />}>
      <C />
    </Suspense>
  );
  return render;
};

const AppShell: React.FC = () => {
  useNewsPolling();
  return (
    <IonReactRouter>
      <IonSplitPane contentId="main" when="lg">
        <AppMenu />
        <IonRouterOutlet id="main">
          <Route exact path="/home" component={Home} />
          <Route exact path="/news" render={lazyRender(News)} />
          <Route exact path="/news/:id" render={lazyRender(NewsDetail)} />
          <Route exact path="/news-uffici" render={lazyRender(UfficiNews)} />
          <Route exact path="/sito" render={lazyRender(Sito)} />
          <Route exact path="/sito/view" render={lazyRender(SitoView)} />
          <Route exact path="/documenti" render={lazyRender(Documenti)} />
          <Route exact path="/miniapps" render={lazyRender(MiniApps)} />
          <Route exact path="/miniapps/:id" render={lazyRender(MiniAppView)} />
          <Route exact path="/processo-telematico" render={lazyRender(ProcessoTelematico)} />
          <Route exact path="/processo-telematico/:sourceId" render={lazyRender(SourceNews)} />
          <Route exact path="/aule-udienze" render={lazyRender(AuleUdienze)} />
          <Route exact path="/aule-udienze/recapiti" render={lazyRender(RecapitiUffici)} />
          <Route exact path="/aule-udienze/sezioni" render={lazyRender(RicercaSezione)} />
          <Route exact path="/aule-udienze/penali" render={lazyRender(UfficiPenali)} />
          <Route exact path="/aule-udienze/ufficio/:officeId" render={lazyRender(UfficioGiudiziario)} />
          <Route exact path="/area-riservata" render={lazyRender(AreaRiservata)} />
          <Route exact path="/info" render={lazyRender(Info)} />
          <Route exact path="/commissione" render={lazyRender(Commissione)} />
          <Route exact path="/consiglio" render={lazyRender(Consiglio)} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AppShell />
    <OfflineBanner />
  </IonApp>
);

export default App;
