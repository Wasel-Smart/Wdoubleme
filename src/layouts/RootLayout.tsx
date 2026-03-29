import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { UnifiedHeader } from '../components/UnifiedHeader';
import { ActiveTripBanner } from '../components/ActiveTripBanner';
import { ConnectionStatus } from '../components/ConnectionStatus';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SidebarContext } from '../contexts/SidebarContext';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';
import { GxPElectronicSignature } from '../gxp/GxPElectronicSignature';
import { GxPComplianceWidget } from '../gxp/GxPComplianceWidget';
import { WaselColors } from '../styles/wasel-design-system';

/**
 * Converts legacy page slug (e.g. "package-delivery") into a router-compatible
 * path (e.g. "/app/services/package-delivery"). Replaces the old 80-entry
 * `routeMap` object with a deterministic, zero-maintenance algorithm.
 */
function toRoutePath(page: string): string {
  // Already a full path — use as-is
  if (page.startsWith('/')) return page;
  
  // Special case: dashboard goes to /app root (home)
  if (page === 'dashboard') return '/app';

  // Service sub-pages
  const servicePages = new Set([
    'package-delivery', 'car-rentals', 'motorcycle-rentals', 'scooter-rentals',
    'shuttle', 'public-bus', 'medical', 'school',
    'school-dashboard', 'enterprise', 'hr-dashboard', 'pets', 'gifts',
    'gift-transport', 'freight',
  ]);

  // Admin sub-pages
  const adminPages = new Set([
    'admin-dashboard', 'trip-injection', 'city-launch-tracker',
    'real-time-operations', 'financial-overview', 'driver-performance',
    'rider-behavior', 'supply-demand', 'customer-support',
    'marketing-performance', 'fraud-detection', 'safety-incidents',
    'competitive-intelligence', 'product-analytics', 'regulatory-compliance',
    'legal-compliance', 'qa-testing', 'uat-testing', 'uat-control',
    'api-keys-setup', 'integrations', 'users', 'launch', 'launch-control',
    'driver-recruitment', 'notification-campaigns', 'strategic-risk',
    'system-health', 'disputes', 'integration-tests',
    'architecture-audit', 'tech-hub',
    'mena-liquidity-hub', // ← MENA Liquidity Strategy Hub
  ]);

  // Premium sub-pages
  const premiumPages = new Set([
    'social', 'social-hub', 'gamification', 'ai-prediction',
    'carbon-tracking', 'entertainment', 'driver-credit',
  ]);

  // Revenue sub-pages
  const revenuePages = new Set([
    'subscriptions', 'marketplace-ads',
    'loyalty-rewards', 'carbon-offset',
  ]);

  // Legacy aliases
  const aliases: Record<string, string> = {
    'carpool': 'find-ride',
    'admin-dashboard': 'admin',
    'ride-social': 'premium/social',
    'gamification-hub': 'premium/gamification',
    'ride-prediction-ai': 'premium/ai-prediction',
    'enhanced-carbon-tracking': 'premium/carbon-tracking',
    'in-ride-entertainment': 'premium/entertainment',
    // ar-navigation-pro and advanced-voice-commands removed — files deleted
    'driver-credit-dashboard': 'premium/driver-credit',
    'terms-of-service': 'legal/terms',
    'driver-dashboard': 'driver',
    'driver-app': 'driver/app',
    'ride-requests': 'driver/requests',
    'driver-wallet': 'driver/wallet',
    'heatmap': 'driver/heatmap',
    'smart-driver-assistant': 'driver/assistant',
    'driver-onboarding': 'onboarding/driver',
    'rider-onboarding': 'onboarding/rider',
    // Phase 2 canonical name aliases
    'payment-flow': 'payment-flow',
    'payment-methods-enhanced': 'payment-methods',
    'verification-center-enhanced': 'verification',
    'carbon-tracking': 'premium/carbon-tracking',
    // Carpooling aliases
    'offer-ride': 'offer-ride',
    'post-ride': 'offer-ride',
    'search-rides': 'find-ride',
    // Awasel | أوصل — package delivery (updated from raje3)
    'raje3/send': 'awasel/send',
    'raje3/tracking': 'awasel/track',
    'raje3/track': 'awasel/track',
    'raje3/available-packages': 'awasel/available-packages',
    'raje3/my-packages': 'awasel/my-packages',
    'package-delivery': 'awasel/send',
    'send-package': 'awasel/send',
    // New carpooling features
    'booking-requests': 'booking-requests',
    'mosque-directory': 'mosque-directory',
    'my-packages': 'awasel/my-packages',
    // Ride tools
    'carpooling/calendar':  'carpooling/calendar',
    'cost-calculator':      'cost-calculator',
    'popular-routes':       'routes',
    'help':                 'safety',
    // Cultural
    'cultural/hijab-privacy': 'cultural/hijab-privacy',
    // 🆕 BlaBlaCar model pages
    'how-it-works':         'how-it-works',
    'wasel-bus':            'wasel-bus',
    'bus':                  'wasel-bus',
  };

  if (aliases[page]) return `/app/${aliases[page]}`;
  if (servicePages.has(page)) return `/app/services/${page}`;
  if (adminPages.has(page)) return `/app/admin/${page}`;
  if (premiumPages.has(page)) return `/app/premium/${page}`;
  if (revenuePages.has(page)) return `/app/revenue/${page}`;

  return `/app/${page}`;
}

export function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const navigate = useIframeSafeNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNavigate = useCallback((page: string) => {
    navigate(toRoutePath(page));
    setIsSidebarOpen(false);
  }, [navigate]);

  const handleClose = useCallback(() => setIsSidebarOpen(false), []);
  const handleMenuClick = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const handleToggleCollapse = useCallback(() => setSidebarCollapsed(c => !c), []);

  // Derive current page slug from path for sidebar highlight
  const currentPage = location.pathname.replace('/app/', '').replace('/app', 'dashboard');

  // Don't show banner on live-trip page (it has its own full-screen view)
  const isLiveTripPage = location.pathname.includes('/live-trip');

  // Compute sidebar offset dynamically (JS-driven, not Tailwind breakpoint)
  const sidebarWidth = 260;
  const showSidebarOffset = isDesktop && !sidebarCollapsed;
  const ar = language === 'ar';

  return (
    <div className="flex h-[100dvh] surface-0" style={{ contain: 'layout style', background: '#040C18' }}>
      {/* Ambient aurora — GPU-composited only, no repaints */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0, willChange: 'auto' }}>
        <div className="aurora-1 absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,200,232,0.05) 0%, transparent 65%)', filter: 'blur(80px)', transform: 'translateZ(0)' }} />
        <div className="aurora-2 absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,200,117,0.04) 0%, transparent 65%)', filter: 'blur(80px)', transform: 'translateZ(0)' }} />
        <div className="absolute top-[40%] left-[20%] w-[350px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(240,168,48,0.025) 0%, transparent 65%)', filter: 'blur(80px)', transform: 'translateZ(0)' }} />
      </div>

      <SidebarContext.Provider value={{ isSidebarOpen }}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={handleClose}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main content — offset by sidebar width on desktop via inline style */}
      <div
        className="flex-1 flex flex-col overflow-hidden relative"
        style={{
          zIndex: 1,
          paddingLeft:  showSidebarOffset && !ar ? sidebarWidth : 0,
          paddingRight: showSidebarOffset && ar  ? sidebarWidth : 0,
          transition: 'padding-left 320ms cubic-bezier(0.4,0,0.2,1), padding-right 320ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <UnifiedHeader
          onMenuClick={handleMenuClick}
          onNavigate={handleNavigate}
          isSidebarOpen={isSidebarOpen}
        />

        {user && !isLiveTripPage && <ActiveTripBanner pollInterval={15_000} />}

        <main
          id="main-content"
          role="main"
          aria-label={language === 'ar' ? 'محتوى التطبيق الرئيسي' : 'Main application content'}
          className="flex-1 overflow-y-auto focus:outline-none scrollbar-thin surface-0 relative"
          tabIndex={-1}
          style={{
            position: 'relative',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            /* Promote to own compositor layer for buttery scrolling */
            willChange: 'scroll-position',
            transform: 'translateZ(0)',
          }}
        >
          <ConnectionStatus />
          {/* ── Page transitions — reduced motion for performance ── */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              style={{ minHeight: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      </SidebarContext.Provider>

      {/* IT GxP — inside Router context so useNavigate works */}
      <GxPElectronicSignature />
      <GxPComplianceWidget />
    </div>
  );
}