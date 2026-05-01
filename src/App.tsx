import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import AppMenu from './components/AppMenu';
import Home from './pages/Home';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Sito from './pages/Sito';
import SitoView from './pages/SitoView';
import Documenti from './pages/Documenti';
import MiniApps from './pages/MiniApps';
import MiniAppView from './pages/MiniAppView';
import ProcessoTelematico from './pages/ProcessoTelematico';
import SourceNews from './pages/SourceNews';
import AreaRiservata from './pages/AreaRiservata';
import Info from './pages/Info';
import Commissione from './pages/Commissione';

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

setupIonicReact({ mode: 'md' });

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonSplitPane contentId="main" when="lg">
        <AppMenu />
        <IonRouterOutlet id="main">
          <Route exact path="/home" component={Home} />
          <Route exact path="/news" component={News} />
          <Route exact path="/news/:id" component={NewsDetail} />
          <Route exact path="/sito" component={Sito} />
          <Route exact path="/sito/view" component={SitoView} />
          <Route exact path="/documenti" component={Documenti} />
          <Route exact path="/miniapps" component={MiniApps} />
          <Route exact path="/miniapps/:id" component={MiniAppView} />
          <Route exact path="/processo-telematico" component={ProcessoTelematico} />
          <Route exact path="/processo-telematico/:sourceId" component={SourceNews} />
          <Route exact path="/area-riservata" component={AreaRiservata} />
          <Route exact path="/info" component={Info} />
          <Route exact path="/commissione" component={Commissione} />
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </IonRouterOutlet>
      </IonSplitPane>
    </IonReactRouter>
  </IonApp>
);

export default App;
