/// <reference types="vite/client" />

// ── Compile-time injected constants (via vite.config define) ─────────────────
declare const __GOOGLE_MAPS_API_KEY__: string;
declare const __GOOGLE_CLIENT_ID__: string;
declare const __STRIPE_PUBLISHABLE_KEY__: string;
declare const __TWILIO_ACCOUNT_SID__: string;

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_PHONE_NUMBER: string
  readonly VITE_SENDGRID_API_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_JUMIO_API_KEY: string
  readonly VITE_JUMIO_API_SECRET: string
  readonly VITE_MIXPANEL_TOKEN: string
  readonly VITE_SENTRY_DSN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Google Maps API types
declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options?: any);
      addListener(event: string, handler: Function): void;
    }
    class Marker {
      constructor(options?: any);
      setMap(map: Map | null): void;
    }
    class DirectionsService {
      route(request: any, callback: (result: any, status: any) => void): void;
    }
    class DirectionsRenderer {
      constructor(options?: any);
      setMap(map: Map | null): void;
      setDirections(directions: any): void;
    }
    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }
    enum TravelMode {
      DRIVING = 'DRIVING',
    }
    enum DirectionsStatus {
      OK = 'OK',
    }
    interface MapMouseEvent {
      latLng: LatLng | null;
    }
  }
}