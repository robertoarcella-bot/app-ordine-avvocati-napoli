import { IonIcon, IonItem, IonLabel } from '@ionic/react';
import {
  chevronForwardOutline, cloudOfflineOutline, openOutline, wifiOutline,
} from 'ionicons/icons';
import type { MiniApp } from '../config/miniapps';

interface Props {
  app: MiniApp;
  onOpen: (app: MiniApp) => void;
}

/**
 * Voce di elenco per una miniapp, con il badge accanto al titolo:
 * apre in app esterna / funziona offline / richiede internet.
 */
const MiniAppItem: React.FC<Props> = ({ app, onOpen }) => (
  <IonItem button detail={false} onClick={() => onOpen(app)}>
    <IonIcon slot="start" icon={app.icon} color="primary" />
    <IonLabel>
      <h3>
        {app.title}
        <IonIcon
          icon={app.externalUrl ? openOutline
                : app.offlineReady ? cloudOfflineOutline
                : wifiOutline}
          color={app.externalUrl ? 'medium'
                 : app.offlineReady ? 'success'
                 : 'warning'}
          style={{ verticalAlign: 'middle', marginLeft: 6, fontSize: 14 }}
          title={app.externalUrl ? 'Apre in app esterna'
                 : app.offlineReady ? 'Funziona offline'
                 : 'Richiede internet'}
        />
      </h3>
      <p style={{ whiteSpace: 'normal' }}>{app.subtitle}</p>
    </IonLabel>
    <IonIcon slot="end" icon={app.externalUrl ? openOutline : chevronForwardOutline} color="medium" />
  </IonItem>
);

export default MiniAppItem;
