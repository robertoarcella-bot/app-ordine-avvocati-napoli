import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import AppMenu from './components/AppMenu';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import UfficiNews from './pages/UfficiNews';
import Sito from './pages/Sito';
import SitoView from './pages/SitoView';
import Documenti from './pages/Documenti';
import MiniApps from './pages/MiniApps';
import MiniAppView from './pages/MiniAppView';
import ProcessoTelematico from './pages/ProcessoTelematico';
import SourceNews from './pages/SourceNews';
import AuleUdienze from './pages/AuleUdienze';
import UfficioGiudiziario from './pages/UfficioGiudiziario';
import AreaRiservata from './pages/AreaRiservata';
import Info from './pages/Info';
import Commissione from './pages/Commissione';
import Consiglio from './pages/Consiglio';

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

const AppShell: React.FC = () => {
  useNewsPolling();
  return (
    <IonReactRouter>
      <IonSplitPane contentId="main" when="lg">
        <AppMenu />
        <IonRouterOutlet id="main">
          <Route exact path="/home" component={Home} />
          <Route exact path="/news" component={News} />
          <Route exact path="/news/:id" component={NewsDetail} />
          <Route exact path="/news-uffici" component={UfficiNews} />
          <Route exact path="/sito" component={Sito} />
          <Route exact path="/sito/view" component={SitoView} />
          <Route exact path="/documenti" component={Documenti} />
          <Route exact path="/miniapps" component={MiniApps} />
          <Route exact path="/miniapps/:id" component={MiniAppView} />
          <Route exact path="/processo-telematico" component={ProcessoTelematico} />
          <Route exact path="/processo-telematico/:sourceId" component={SourceNews} />
          <Route exact path="/aule-udienze" component={AuleUdienze} />
          <Route exact path="/aule-udienze/:officeId" component={UfficioGiudiziario} />
          <Route exact path="/area-riservata" component={AreaRiservata} />
          <Route exact path="/info" component={Info} />
          <Route exact path="/commissione" component={Commissione} />
          <Route exact path="/consiglio" component={Consiglio} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AppShell />
  </IonApp>
);

export default App;
