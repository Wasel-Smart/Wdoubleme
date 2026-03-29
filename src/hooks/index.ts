// Core Hooks
export { useBookings } from './useBookings';
export { useRealBookings } from './useRealBookings';
export { useTrips } from './useTrips';
export { useRealTrips } from './useRealTrips';
export { useNotifications } from './useNotifications';
export { useRealMessages } from './useRealMessages';
export { useIsMobile } from './useIsMobile';
export { shareContent, useShareHandler } from './useShare';

// AI Feature Hooks - export all individual hooks
export { 
  useSmartRoutes,
  useDynamicPricing,
  useRiskAssessment,
  useNLPSearch,
  usePersonalizedRecommendations,
  usePredictiveInsights,
  useSmartMatching,
  useConversationAI,
  useAIDashboardInsights,
  useAITracking
} from './useAIFeatures';

// Data Hooks
export { useMyTrips } from './useMyTrips';
export type { MyTripsData, MyTripRecord, DriverTripRecord, MyTripDriver } from './useMyTrips';
export { useDashboardStats } from './useDashboardStats';
export type { DashboardStats } from './useDashboardStats';
export { usePushNotifications } from './usePushNotifications';
export type { NotifPermission, NotifyOptions } from './usePushNotifications';

// Accessibility Hooks
export { useReducedMotion } from './useReducedMotion';

// Performance Hooks
export { usePerformanceMonitor } from './usePerformanceMonitor';
export { useOptimizedCallbacks, useMemoizedValue, useStableCallback } from './useOptimizedCallbacks';

// Pagination Hook
export { usePaginatedQuery } from './usePaginatedQuery';
export type { PaginatedResult, PaginationMeta, UsePaginatedQueryOptions } from './usePaginatedQuery';

// Keyboard Shortcuts Hook
export { useKeyboardShortcuts } from './useKeyboardShortcuts';

// Iframe-Safe Navigation Hook
export { useIframeSafeNavigate } from './useIframeSafeNavigate';

// Wallet Hook
export { useWallet } from './useWallet';

// Community Stats Hook
export { useCommunityStats } from './useCommunityStats';

// Driver Dashboard Hook
export { useDriverDashboard } from './useDriverDashboard';

// Translation Hook (re-export from components/hooks)
export { useTranslation } from '../components/hooks/useTranslation';