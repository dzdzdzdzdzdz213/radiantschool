import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.unregister();
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* SW unavailable */
    }
  });
}

const hash = window.location.hash;
const isAuthCallback = window.location.pathname.includes('/auth/callback');

if (hash && hash.includes('access_token=') && !isAuthCallback) {
  window.location.replace('/auth/callback' + hash);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
