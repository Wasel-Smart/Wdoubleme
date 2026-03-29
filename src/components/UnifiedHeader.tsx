/**
 * UnifiedHeader — Wasel | واصل v6.0
 * Deep Space Network aesthetic · Glassmorphism · Bilingual
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Bell, Languages, Search, Menu, User, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useNotifications } from '../hooks';
import logoImage from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

// Brand tokens
const C = {
  bg:     '#040C18',
  card:   '#0A1628',
  cyan:   '#00C8E8',
  gold:   '#F0A830',
  green:  '#00C875',
  red:    '#FF4455',
  border: 'rgba(0,200,232,0.08)',
  borderHover: 'rgba(0,200,232,0.2)',
  text:   '#EFF6FF',
  textDim:'rgba(148,163,184,0.75)',
};

interface UnifiedHeaderProps {
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
  isSidebarOpen?: boolean;
}

export function UnifiedHeader({ onMenuClick, onNavigate, isSidebarOpen = false }: UnifiedHeaderProps) {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { unreadCount = 0 } = useNotifications() || {};

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showUserMenu, setShowUserMenu]         = useState(false);
  const [scrolled, setScrolled]                 = useState(false);

  const ar = language === 'ar';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => { setShowLanguageMenu(false); setShowUserMenu(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const goTo = (path: string) => {
    navigate(path);
    setShowUserMenu(false);
  };

  const displayName = user?.user_metadata?.name?.split(' ')[0]
    || user?.email?.split('@')[0]
    || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="sticky top-0 z-50 px-4 sm:px-6"
      style={{
        height: 68,
        background: scrolled ? 'rgba(4,12,24,0.95)' : 'rgba(4,12,24,0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled
          ? '1px solid rgba(0,200,232,0.1)'
          : '1px solid rgba(0,200,232,0.04)',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-3">

        {/* ── Left: Menu + Logo ── */}
        <div className="flex items-center gap-3">
          {/* Hamburger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={onMenuClick}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative"
            style={{
              background: isSidebarOpen ? 'rgba(0,200,232,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isSidebarOpen ? 'rgba(0,200,232,0.25)' : C.border}`,
            }}
            aria-label={ar ? 'فتح القائمة' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isSidebarOpen
                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-4 h-4" style={{ color: C.cyan }} />
                  </motion.span>
                : <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-4 h-4 text-white" />
                  </motion.span>
              }
            </AnimatePresence>
          </motion.button>

          {/* Logo */}
          <button
            onClick={() => goTo('/app')}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            aria-label="Wasel Home"
          >
            <img
              src={logoImage}
              alt="Wasel"
              className="w-8 h-8 object-contain"
              style={{ filter: `drop-shadow(0 0 8px ${C.cyan}80)` }}
            />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-base font-black"
                style={{
                  background: `linear-gradient(135deg, #fff 0%, ${C.cyan} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                {ar ? 'واصل' : 'Wasel'}
              </span>
              <span className="text-[10px]" style={{ color: C.textDim }}>
                {ar ? 'شريكك الذكي بالتنقل' : 'Your Mobility Companion'}
              </span>
            </div>
          </button>
        </div>

        {/* ── Right: Action Icons ── */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <HeaderIconBtn
            aria-label={ar ? 'البحث' : 'Search'}
            onClick={() => goTo('/find-ride')}
          >
            <Search className="w-4 h-4" style={{ color: C.cyan }} />
          </HeaderIconBtn>

          {/* Notifications */}
          <div className="relative">
            <HeaderIconBtn
              aria-label={ar ? 'الإشعارات' : 'Notifications'}
              onClick={() => goTo('/notifications')}
              active={unreadCount > 0}
            >
              <Bell className="w-4 h-4 text-white" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: C.red, border: `1.5px solid ${C.bg}` }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </HeaderIconBtn>
          </div>

          {/* Language toggle */}
          <div className="relative">
            <HeaderIconBtn
              aria-label="Switch language"
              onClick={e => { e.stopPropagation(); setShowLanguageMenu(v => !v); setShowUserMenu(false); }}
              active={showLanguageMenu}
            >
              <Languages className="w-4 h-4" style={{ color: showLanguageMenu ? C.cyan : 'white' }} />
            </HeaderIconBtn>

            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-11 right-0 w-36 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(4,12,24,0.96)',
                    border: `1px solid ${C.borderHover}`,
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 100,
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {[{ code: 'en', label: '🇬🇧 English' }, { code: 'ar', label: '🇯🇴 العربية' }].map(l => (
                    <button
                      key={l.code}
                      onClick={() => { setLanguage(l.code as 'en' | 'ar'); setShowLanguageMenu(false); }}
                      className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors"
                      style={{
                        color: language === l.code ? C.cyan : C.text,
                        background: language === l.code ? 'rgba(0,200,232,0.06)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (language !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = language === l.code ? 'rgba(0,200,232,0.06)' : 'transparent'; }}
                    >
                      {l.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User avatar */}
          {user && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={e => { e.stopPropagation(); setShowUserMenu(v => !v); setShowLanguageMenu(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{
                  background: showUserMenu
                    ? `linear-gradient(135deg, ${C.cyan}30, ${C.green}20)`
                    : `linear-gradient(135deg, ${C.cyan}20, ${C.green}15)`,
                  border: `2px solid ${showUserMenu ? C.cyan : 'rgba(0,200,232,0.2)'}`,
                  color: C.cyan,
                  transition: 'all 0.2s ease',
                }}
                aria-label={ar ? 'قائمة المستخدم' : 'User menu'}
              >
                {initials}
              </motion.button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-11 right-0 w-52 rounded-xl overflow-hidden"
                    style={{
                      background: 'rgba(4,12,24,0.97)',
                      border: `1px solid ${C.borderHover}`,
                      backdropFilter: 'blur(24px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                      zIndex: 100,
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    {/* User info */}
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <p className="text-sm font-bold truncate" style={{ color: C.text }}>
                      {user?.user_metadata?.name || displayName || (ar ? 'مستخدم' : 'User')}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: C.textDim }}>{user?.email}</p>
                    </div>

                    {/* Menu items */}
                    {[
                      { icon: User, label: ar ? 'الملف الشخصي' : 'Profile', path: '/profile' },
                      { icon: Bell, label: ar ? 'الإشعارات' : 'Notifications', path: '/notifications' },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => goTo(item.path)}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors"
                        style={{ color: C.text }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <item.icon className="w-4 h-4" style={{ color: C.cyan }} />
                        {item.label}
                      </button>
                    ))}

                    <div style={{ borderTop: `1px solid ${C.border}` }}>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors"
                        style={{ color: C.red }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,68,85,0.06)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <LogOut className="w-4 h-4" />
                        {ar ? 'تسجيل الخروج' : 'Sign Out'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Sign in button (guest) */}
          {!user && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => goTo('/auth')}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: `linear-gradient(135deg, ${C.cyan}, ${C.green})`,
                color: '#040C18',
              }}
            >
              {ar ? 'تسجيل الدخول' : 'Sign In'}
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
}

/* ── Helper: icon button ───────────────────────────────────────────────── */
function HeaderIconBtn({
  children,
  onClick,
  active = false,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  active?: boolean;
  'aria-label'?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
      style={{
        background: active ? 'rgba(0,200,232,0.1)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${active ? 'rgba(0,200,232,0.25)' : 'rgba(0,200,232,0.08)'}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,200,232,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(0,200,232,0.1)' : 'rgba(255,255,255,0.04)'; }}
    >
      {children}
    </motion.button>
  );
}
