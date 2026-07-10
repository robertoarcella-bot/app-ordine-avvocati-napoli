import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

/**
 * Banner globale mostrato quando il dispositivo è offline.
 * Overlay fisso in basso, sopra qualsiasi pagina.
 */
const OfflineBanner: React.FC = () => {
  const connected = useNetworkStatus();
  if (connected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: 'var(--ion-color-warning)',
        color: '#000',
        fontSize: 12,
        padding: '5px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingBottom: 'calc(5px + env(safe-area-inset-bottom))',
      }}
    >
      <IonIcon icon={cloudOfflineOutline} />
      Sei offline — disponibili solo i contenuti inclusi nell'app
    </div>
  );
};

export default OfflineBanner;
