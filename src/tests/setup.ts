import '@testing-library/jest-dom';
import type { ReactNode } from 'react';
import { cleanup } from '@testing-library/react';
import { vi } from 'vitest';

// Cleanup after each test — use global afterEach (injected by vitest globals)
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => ({
  supabaseUrl: 'https://test.supabase.co',
  supabaseAnonKey: 'test-anon-key',
  isSupabaseConfigured: true,
  initSupabaseListeners: vi.fn(() => () => {}),
  checkSupabaseConnection: vi.fn(() => Promise.resolve(true)),
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      signInWithPassword: vi.fn(() => Promise.resolve({ data: { session: null, user: null }, error: null })),
      signUp: vi.fn(() => Promise.resolve({ data: { session: null, user: null }, error: null })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => Promise.resolve({ data: null, error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

function languageContextMock() {
  return {
    useLanguage: () => ({
      language: 'en',
      setLanguage: vi.fn(),
      isRTL: false,
      t: (value: string) => value,
    }),
    LanguageProvider: ({ children }: { children: ReactNode }) => children,
  };
}

vi.mock('@/contexts/LanguageContext', languageContextMock);
vi.mock('../contexts/LanguageContext', languageContextMock);

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: (() => {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, String(value)); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() { return store.size; },
    };
  })(),
});

Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: (() => {
    const store = new Map<string, string>();
    return {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, String(value)); },
      removeItem: (key: string) => { store.delete(key); },
      clear: () => { store.clear(); },
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() { return store.size; },
    };
  })(),
});

class MockNotification {
  static permission: NotificationPermission = 'default';
  static requestPermission = vi.fn(async () => MockNotification.permission);
  onclick: (() => void) | null = null;
  close = vi.fn();
  constructor(public title: string, public options?: NotificationOptions) {}
}

Object.defineProperty(window, 'Notification', {
  writable: true,
  configurable: true,
  value: MockNotification,
});
Object.defineProperty(globalThis, 'Notification', {
  writable: true,
  configurable: true,
  value: MockNotification,
});

// requestIdleCallback is not implemented in jsdom by default
Object.defineProperty(window, 'requestIdleCallback', {
  writable: true,
  configurable: true,
  value: (cb: any) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1),
});
Object.defineProperty(window, 'cancelIdleCallback', {
  writable: true,
  configurable: true,
  value: (id: any) => clearTimeout(id),
});
Object.defineProperty(globalThis, 'requestIdleCallback', {
  writable: true,
  configurable: true,
  value: (cb: any) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1),
});
Object.defineProperty(globalThis, 'cancelIdleCallback', {
  writable: true,
  configurable: true,
  value: (id: any) => clearTimeout(id),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Suppress console errors in tests — use global beforeAll/afterAll
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) return;
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
