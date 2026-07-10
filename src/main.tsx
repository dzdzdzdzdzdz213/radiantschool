import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const hash = window.location.hash;
if (hash && hash.includes('access_token=') && !window.location.pathname.includes('/auth/callback')) {
  window.location.replace('/auth/callback' + hash);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
