import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure window.fetch has both getter & setter in case of strict mode accessor issues
(function ensureFetchSetter() {
  try {
    if (typeof window !== 'undefined') {
      const desc = Object.getOwnPropertyDescriptor(window, 'fetch');
      if (desc && !desc.writable && !desc.set) {
        let currentFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
          get: () => currentFetch,
          set: (fn) => { currentFetch = fn; },
          configurable: true,
          enumerable: true,
        });
      }
    }
  } catch {}
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
