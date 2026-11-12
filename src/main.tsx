import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Guard against invalid CSS selectors (e.g. Supabase OAuth callback tokens like #access_token=...)
if (typeof window !== 'undefined' && typeof Document !== 'undefined') {
  const origQuerySelector = Document.prototype.querySelector;
  Document.prototype.querySelector = function <E extends Element = Element>(selectors: string): E | null {
    try {
      return origQuerySelector.call(this, selectors) as E | null;
    } catch (err) {
      if (typeof selectors === 'string' && (selectors.includes('=') || selectors.includes('&') || selectors.includes('access_token'))) {
        return null;
      }
      throw err;
    }
  };

  const origElementQuerySelector = Element.prototype.querySelector;
  Element.prototype.querySelector = function <E extends Element = Element>(selectors: string): E | null {
    try {
      return origElementQuerySelector.call(this, selectors) as E | null;
    } catch (err) {
      if (typeof selectors === 'string' && (selectors.includes('=') || selectors.includes('&') || selectors.includes('access_token'))) {
        return null;
      }
      throw err;
    }
  };

  // Automatically clean OAuth hash tokens from the URL once read so they don't linger in window.location.hash
  if (window.location.hash && window.location.hash.includes('access_token')) {
    setTimeout(() => {
      try {
        if (window.location.hash && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } catch {
        // Safe fallback
      }
    }, 1500);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
