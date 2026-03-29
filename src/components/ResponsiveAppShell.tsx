/**
 * Responsive App Shell — Adaptive layout for Mobile/Tablet/Desktop
 * 
 * Mobile (< 768px):   Bottom navigation + Full-screen content
 * Tablet (768-1023px): Top navigation + Side drawer
 * Desktop (≥ 1024px):  Sidebar + Top bar + Content
 */

import { useState, useEffect, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Menu, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { 
  BREAKPOINTS, 
  LAYOUT, 
  SAFE_AREA, 
  Z_INDEX, 
  ANIMATION, 
  detectPlatform,
  safeAreaPadding,
  TOUCH_TARGET,
} from '../utils/responsive';

interface ResponsiveAppShellProps {
  children: ReactNode;
  currentPage: string;
}

export function ResponsiveAppShell({ children, currentPage }: ResponsiveAppShellProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  
  // Platform detection
  const [platform, setPlatform] = useState(detectPlatform);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Responsive breakpoints
  useEffect(() => {
    const handleResize = () => {
      setPlatform(detectPlatform());
      // Auto-close mobile sidebar on desktop
      if (window.innerWidth >= BREAKPOINTS.lg) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Layout configuration based on screen size
  const layout = {
    isMobile: platform.isMobile,
    isTablet: platform.isTablet,
    isDesktop: platform.isDesktop,
    showBottomNav: platform.isMobile,
    showSidebar: platform.isDesktop,
    showTopBar: !platform.isMobile,
  };

  // Navigation handler
  const handleNavigate = (page: string) => {
    navigate(page);
    setSidebarOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#F8FAFC',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          TOP BAR (Tablet & Desktop only)
      ══════════════════════════════════════════════════════════════ */}
      {layout.showTopBar && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: Z_INDEX.sticky,
            height: LAYOUT.navHeight.desktop,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
            ...safeAreaPadding('top'),
          }}
        >
          {/* Left: Menu toggle (Tablet only) */}
          {layout.isTablet && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                ...TOUCH_TARGET.button,
                minWidth: TOUCH_TARGET.button,
                minHeight: TOUCH_TARGET.button,
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                transition: ANIMATION.transition(['background']),
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-label="Open menu"
            >
              <Menu size={24} color="#0F172A" />
            </button>
          )}

          {/* Center: Search bar (Desktop) */}
          {layout.isDesktop && (
            <div
              style={{
                flex: 1,
                maxWidth: 480,
                marginLeft: layout.isDesktop && !sidebarCollapsed ? LAYOUT.sidebarWidth.expanded : 64,
                marginRight: 'auto',
                transition: ANIMATION.transition(['margin-left'], ANIMATION.duration.normal),
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: '#F1F5F9',
                  borderRadius: 12,
                  border: '1px solid transparent',
                  transition: ANIMATION.transition(['border-color', 'background']),
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#00C8E8';
                  e.currentTarget.style.background = '#fff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.background = '#F1F5F9';
                }}
              >
                <Search size={18} color="#64748B" style={{ marginRight: 8 }} />
                <input
                  type="text"
                  placeholder={isArabic ? 'ابحث عن رحلة...' : 'Search for a ride...'}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    color: '#0F172A',
                    fontFamily: isArabic ? "'Tajawal', sans-serif" : "-apple-system, sans-serif",
                  }}
                />
              </div>
            </div>
          )}

          {/* Right: Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              style={{
                position: 'relative',
                ...TOUCH_TARGET.icon,
                minWidth: TOUCH_TARGET.icon,
                minHeight: TOUCH_TARGET.icon,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                transition: ANIMATION.transition(['background']),
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-label="Notifications"
            >
              <Bell size={22} color="#0F172A" />
              {/* Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#EF4444',
                  border: '2px solid #fff',
                }}
              />
            </button>
          </div>
        </header>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR (Desktop always visible, Tablet/Mobile drawer)
      ══════════════════════════════════════════════════════════════ */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={layout.isDesktop ? sidebarCollapsed : false}
        onToggleCollapse={layout.isDesktop ? () => setSidebarCollapsed(!sidebarCollapsed) : undefined}
      />

      {/* ════════════════════════════════════════��═════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════════════ */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          // Dynamic margin based on layout
          marginLeft: layout.isDesktop && !sidebarCollapsed ? LAYOUT.sidebarWidth.expanded : layout.isDesktop ? LAYOUT.sidebarWidth.collapsed : 0,
          marginTop: layout.showTopBar ? 0 : 0,
          marginBottom: layout.showBottomNav ? 72 : 0, // 56px nav + 16px safe area
          transition: ANIMATION.transition(['margin-left'], ANIMATION.duration.normal),
          // Safe areas
          ...safeAreaPadding('top'),
          paddingBottom: layout.showBottomNav ? `calc(72px + ${SAFE_AREA.bottom})` : SAFE_AREA.bottom,
        }}
      >
        {/* Content container with max-width */}
        <div
          style={{
            width: '100%',
            maxWidth: layout.isMobile ? '100%' : LAYOUT.maxWidth.full,
            margin: '0 auto',
            padding: layout.isMobile ? '16px' : '24px',
          }}
        >
          {children}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM NAVIGATION (Mobile only)
      ══════════════════════════════════════════════════════════════ */}
      {layout.showBottomNav && <MobileBottomNav language={language} />}

      {/* ══════════════════════════════════════════════════════════════
          MOBILE MENU BUTTON (Fixed FAB for quick access)
      ══════════════════════════════════════════════════════════════ */}
      {layout.isMobile && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(true)}
          style={{
            position: 'fixed',
            top: 16,
            [isArabic ? 'left' : 'right']: 16,
            zIndex: Z_INDEX.fixed,
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #00C8E8, #00A0C0)',
            borderRadius: '50%',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 200, 232, 0.3)',
            cursor: 'pointer',
            ...safeAreaPadding('top'),
          }}
          aria-label="Open menu"
        >
          <Menu size={24} color="#fff" />
        </motion.button>
      )}
    </div>
  );
}