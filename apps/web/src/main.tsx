import '@fontsource-variable/inter/opsz.css';
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '@fontsource/belleza/latin.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { reloadOnce } from './lib/reload';

// Versión nueva publicada con el campus abierto: Vite avisa si no puede precargar un fragmento
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnce()) event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
