import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { defineCustomElements } from 'ionicons/loader';

defineCustomElements(window);

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
