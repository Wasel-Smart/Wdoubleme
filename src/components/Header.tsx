/**
 * Header — Wasel | واصل v6.0
 * Unified constellation logo · Deep Space design
 */

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { BurgerMenu } from './BurgerMenu';
import { ThemeToggle } from './ThemeToggle';
import { useState, useEffect } from 'react';
import { Bell, Languages, Search } from 'lucide-react';
import { WaselBrand } from './WaselBrand';
import { useNotifications } from '../hooks';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
  isSidebarOpen?: boolean;
}

export function Header({ onMenuClick, onNavigate, isSidebarOpen = false }: HeaderProps) {
  const { unreadCount = 0 } = useNotifications() || {};
  const { profile, user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const ar = language === 'ar';
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showLanguageMenu) return;
    const close = () => setShowLanguageMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showLanguageMenu]);

  return (
    <header
      className="sticky top-0 z-40 px-4 sm:px-5 transition-all duration-300"
      style={{
        height: 56,
        background: scrolled
          ? 'var(--wasel-header-bg-scrolled, rgba(4,12,24,0.97))'
          : 'var(--wasel-header-bg, rgba(4,12,24,0.85))',
        backdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid var(--wasel-header-border-scrolled, rgba(0,200,232,0.1))'
          : '1px solid var(--wasel-header-border, rgba(0,200,232,0.05))',
        boxShadow: scrolled
          ? 'var(--wasel-shadow-md, 0 4px 32px rgba(0,0,0,0.5))'
          : 'none',
      }}
    >
      <div className="flex items-center justify-between h-full gap-3" dir={ar ? 'rtl' : 'ltr'}>

        {/* ── Left: Burger + Logo ── */}
        <div className="flex items-center gap-3">
          <BurgerMenu
            isOpen={isSidebarOpen}
            onClick={onMenuClick}
            className="lg:hidden"
          />
          <WaselBrand
            size="sm"
            animated={false}
            onClick={() => onNavigate?.('dashboard')}
            id="header"
          />
        </div>

        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-1">

          {/* Search shortcut */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate?.('find-ride')}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all"
            style={{
              background: 'var(--wasel-header-search-bg, rgba(0,200,232,0.06))',
              border: '1px solid var(--wasel-header-search-border, rgba(0,200,232,0.1))',
              minHeight: 34, minWidth: 'auto',
            }}
            aria-label={ar ? 'بحث' : 'Search'}
          >
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--primary)', opacity: 0.8 }}>
              {ar ? 'دور رحلة' : 'Find ride'}
            </span>
          </motion.button>

          {/* Theme Toggle */}
          <span className="hidden lg:flex">
            <ThemeToggle />
          </span>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className="relative flex items-center justify-center rounded-xl transition-colors"
            style={{ width: 36, height: 36, minHeight: 36, minWidth: 36, background: 'var(--wasel-header-icon-bg, rgba(255,255,255,0.04))' }}
            onClick={() => onNavigate?.('notifications')}
            aria-label={ar ? 'الإشعارات' : 'Notifications'}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--wasel-header-icon-hover, rgba(0,200,232,0.08))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--wasel-header-icon-bg, rgba(255,255,255,0.04))')}
          >
            <Bell className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center font-black text-white rounded-full"
                  style={{
                    minWidth: 16, height: 16, padding: '0 3px', fontSize: '0.58rem',
                    background: 'var(--accent)',
                    boxShadow: '0 0 0 2px var(--background)',
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Avatar */}
          <motion.button
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            className="flex items-center justify-center rounded-xl font-black transition-all"
            style={{
              width: 36, height: 36, minHeight: 36, minWidth: 36, fontSize: '0.8rem',
              background: 'var(--wasel-header-avatar-bg, linear-gradient(135deg, rgba(0,200,232,0.2), rgba(0,200,117,0.15)))',
              border: '1px solid var(--primary, rgba(0,200,232,0.2))',
              color: 'var(--primary)',
              boxShadow: '0 2px 12px rgba(0,200,232,0.12)',
            }}
            onClick={() => onNavigate?.('profile')}
            aria-label={ar ? 'الملف الشخصي' : 'Profile'}
          >
            {initials}
          </motion.button>

          {/* Language Toggle */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="flex items-center justify-center rounded-xl transition-colors"
              style={{ width: 36, height: 36, minHeight: 36, minWidth: 36, background: 'var(--wasel-header-icon-bg, rgba(255,255,255,0.04))' }}
              onClick={e => { e.stopPropagation(); setShowLanguageMenu(s => !s); }}
              aria-label={ar ? 'تغيير اللغة' : 'Change language'}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--wasel-header-icon-hover, rgba(0,200,232,0.08))')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--wasel-header-icon-bg, rgba(255,255,255,0.04))')}
            >
              <Languages className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </motion.button>

            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-11 right-0 rounded-2xl overflow-hidden z-50 min-w-[130px]"
                  style={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: 'var(--wasel-shadow-lg)',
                  }}
                >
                  {(['en', 'ar'] as const).map(lang => (
                    <button
                      key={lang}
                      className="block w-full text-left px-4 py-3 text-sm transition-all"
                      style={{
                        fontWeight: language === lang ? 700 : 400,
                        color: language === lang ? 'var(--primary)' : 'var(--muted-foreground)',
                        background: language === lang ? 'var(--wasel-header-search-bg, rgba(0,200,232,0.08))' : 'transparent',
                        minHeight: 44,
                      }}
                      onClick={e => { e.stopPropagation(); setLanguage(lang); setShowLanguageMenu(false); }}
                      onMouseEnter={e => { if (language !== lang) e.currentTarget.style.background = 'var(--wasel-header-icon-hover, rgba(255,255,255,0.04))'; }}
                      onMouseLeave={e => { if (language !== lang) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {lang === 'en' ? '🇬🇧 English' : '🇯🇴 عربي'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}