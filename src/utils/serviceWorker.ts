/**
 * Service Worker Registration
 * Registers the service worker for offline support and caching
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Only in production and if service worker is supported
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    try {
      console.log('🚀 Registering service worker...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('✅ Service Worker registered:', registration.scope);

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New version available! Reload to update.');
              
              // Optionally, show a toast to the user
              if (window.confirm('New version available! Reload to update?')) {
                newWorker.postMessage('SKIP_WAITING');
                // Use history API instead of window.location.reload() to prevent
                // IframeMessageAbortError (Figma iframe onload → setupMessageChannel crash)
                history.replaceState(null, '', window.location.pathname);
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }

  return null;
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const success = await registration.unregister();
        console.log('🗑️ Service Worker unregistered');
        return success;
      }
    } catch (error) {
      console.error('❌ Failed to unregister service worker:', error);
    }
  }
  return false;
}

export async function clearServiceWorkerCache(): Promise<void> {
  if ('serviceWorker' in navigator && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🗑️ Service Worker cache cleared');
      
      // Notify service worker
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        registration.active.postMessage('CLEAR_CACHE');
      }
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }
}