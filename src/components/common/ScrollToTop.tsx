import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  // Ensure browser doesn't try to automatically restore previous scroll position
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    // If there is an anchor hash (and NOT an OAuth callback or query parameter string)
    if (hash && !hash.includes('=') && !hash.includes('&') && !hash.includes('access_token')) {
      const rawId = hash.replace(/^#/, '');
      if (rawId) {
        try {
          const element =
            document.getElementById(rawId) ||
            document.getElementById(decodeURIComponent(rawId));

          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        } catch {
          // Ignore element lookup errors safely
        }
      }
    }

    // Immediately scroll the window, documentElement, and body to the absolute top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search, hash]);

  return null;
};
