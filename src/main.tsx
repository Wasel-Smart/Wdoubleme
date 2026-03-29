/**
 * main.tsx — Wasel App Entry Point
 * Initializes Sentry before React mounts, then renders the app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeSentry } from './utils/sentry';

// ── 1. Boot Sentry (non-blocking — fires and forgets) ─────────────────────────
initializeSentry().catch(() => {
  // Sentry init failure must never prevent the app from loading
});

// ── 2. Web Vitals reporting (production only) ────────────────────────────────
if (import.meta.env.PROD) {
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    const report = (metric: { name: string; value: number; rating: string }) => {
      // Forward to analytics — replace with your analytics sink
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          event_category: 'Web Vitals',
          event_label: metric.rating,
          non_interaction: true,
        });
      }
    };
    onCLS(report);
    onINP(report);
    onFCP(report);
    onLCP(report);
    onTTFB(report);
  }).catch(() => {});
}

// ── 3. Mount React ───────────────────────────────────────────────────────────
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('[Wasel] Root element #root not found. Check index.html.');
}

// Clear any SSR placeholder content
rootElement.innerHTML = '';

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// ── 4. Register service worker (production only) ─────────────────────────────
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
