import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { vi } from 'vitest';

// ============ TEST WRAPPERS ============

/**
 * Custom render with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// ============ MOCK DATA ============

export const mockUser = {
  id: 'test-user-123',
  email: 'test@wassel.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockSession = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

export const mockProfile = {
  id: 'test-user-123',
  email: 'test@wassel.com',
  full_name: 'Test User',
  phone: '+962791234567',
  email_verified: true,
  phone_verified: false,
  total_trips: 5,
  trips_as_driver: 2,
  trips_as_passenger: 3,
  rating_as_driver: 4.8,
  rating_as_passenger: 4.9,
  total_ratings_received: 10,
  smoking_allowed: false,
  pets_allowed: true,
  music_allowed: true,
  language: 'en',
  currency: 'JOD',
  notification_enabled: true,
  location_sharing_enabled: true,
  wallet_balance: 50.0,
  total_earned: 200.0,
  total_spent: 150.0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

export const mockTrip = {
  id: 'trip-123',
  driver_id: 'driver-456',
  passenger_id: 'passenger-789',
  pickup_location: {
    lat: 31.9539,
    lng: 35.9106,
    address: 'Amman, Jordan',
  },
  dropoff_location: {
    lat: 32.0,
    lng: 36.0,
    address: 'Zarqa, Jordan',
  },
  status: 'completed',
  fare_amount: 15.50,
  distance_km: 25,
  duration_minutes: 30,
  service_type: 'standard',
  created_at: '2024-01-15T10:00:00Z',
  started_at: '2024-01-15T10:05:00Z',
  completed_at: '2024-01-15T10:35:00Z',
};

// ============ MOCK FUNCTIONS ============

/**
 * Mock Supabase client
 */
export const createMockSupabaseClient = () => ({
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    refreshSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    setSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
  })),
});

/**
 * Mock fetch response
 */
export const createMockFetchResponse = (data: any, ok = true) => ({
  ok,
  status: ok ? 200 : 400,
  json: async () => data,
  text: async () => JSON.stringify(data),
  headers: new Headers(),
  redirected: false,
  statusText: ok ? 'OK' : 'Bad Request',
  type: 'basic' as ResponseType,
  url: '',
  clone: vi.fn(),
  body: null,
  bodyUsed: false,
  arrayBuffer: async () => new ArrayBuffer(0),
  blob: async () => new Blob(),
  formData: async () => new FormData(),
});

/**
 * Mock toast notifications
 */
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

/**
 * Mock Google Maps
 */
export const mockGoogleMaps = {
  Map: vi.fn(),
  Marker: vi.fn(),
  Polyline: vi.fn(),
  places: {
    PlacesService: vi.fn(),
    AutocompleteService: vi.fn(),
  },
  geometry: {
    spherical: {
      computeDistanceBetween: vi.fn(),
    },
  },
};

// ============ TEST UTILITIES ============

/**
 * Wait for async operations
 */
export const waitForAsync = () => 
  new Promise(resolve => setTimeout(resolve, 0));

/**
 * Create mock event
 */
export const createMockEvent = (type: string, props: any = {}) => ({
  type,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: { value: '' },
  currentTarget: { value: '' },
  ...props,
});

/**
 * Create mock file
 */
export const createMockFile = (name: string, size: number, type: string) => {
  const file = new File([''], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

/**
 * Simulate user typing
 */
export const simulateTyping = async (
  input: HTMLElement,
  text: string,
  delay = 10
) => {
  const { fireEvent } = await import('@testing-library/react');
  
  for (const char of text) {
    fireEvent.change(input, { target: { value: text.slice(0, text.indexOf(char) + 1) } });
    await new Promise(resolve => setTimeout(resolve, delay));
  }
};

/**
 * Mock geolocation
 */
export const mockGeolocation = {
  getCurrentPosition: vi.fn((success) =>
    success({
      coords: {
        latitude: 31.9539,
        longitude: 35.9106,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    })
  ),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};

// Set up global geolocation mock
Object.defineProperty(global.navigator, 'geolocation', {
  writable: true,
  value: mockGeolocation,
});

// ============ ASSERTION HELPERS ============

/**
 * Check if element has specific class
 */
export const expectToHaveClass = (element: HTMLElement, className: string) => {
  expect(element.classList.contains(className)).toBe(true);
};

/**
 * Check if element is visible
 */
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeVisible();
};

/**
 * Check if element is disabled
 */
export const expectToBeDisabled = (element: HTMLElement) => {
  expect(element).toBeDisabled();
};

// ============ CLEANUP HELPERS ============

/**
 * Reset all mocks
 */
export const resetAllMocks = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();
  localStorage.clear();
  sessionStorage.clear();
};
