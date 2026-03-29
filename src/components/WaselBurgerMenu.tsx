/**
 * WaselBurgerMenu — Best-practice slide-in drawer
 * Matches the Figma reference: logo · user card · nav items · theme · sign out
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Home, Cpu, MessageSquare, Search, Car, Package,
  Shield, Settings, LogOut, Sun, Moon, Sparkles,
  BarChart3, Star, Navigation, Zap,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Language } from '../locales/translations';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { WaselLogoMark } from './WaselLogoMark';

// ── Brand tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#040C18',
  surface: '#070F1F',
  card:    '#0A1628',
  card2:   '#0D1E35',
  cyan:    '#00C8E8',
  green:   '#00C875',
  gold:    '#F0A830',
  purple:  '#A78BFA',
  red:     '#EF4444',
  muted:   '#4D6A8A',
  text:    '#CBD5E1',
  border:  'rgba(0,200,232,0.10)',
};

// ── Nav structure ────────────────────────────────────────────────────────────
interface NavItem {
  id: string;
  path: string;
  labelEn: string;
  labelAr: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: { text: string; color: string };
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home', path: '/',
    labelEn: 'Home', labelAr: 'الرئيسية',
    icon: Home,
  },
  // ✨ TOP PRIORITY: Mobility OS Intelligence Platform
  {
    id: 'mobility-os', path: '/mobility-os',
    labelEn: 'Mobility OS', labelAr: 'نظام التنقل',
    icon: Cpu,
    badge: { text: 'LIVE', color: C.green },
  },
  {
    id: 'find-ride', path: '/find-ride',
    labelEn: 'Find a Ride', labelAr: 'دور على رحلة',
    icon: Search,
    badge: { text: '🚗', color: C.cyan },
  },
  {
    id: 'post-ride', path: '/offer-ride',
    labelEn: 'Post a Ride', labelAr: 'انشر رحلة',
    icon: Car,
  },
  {
    id: 'packages', path: '/packages',
    labelEn: 'Send Package', labelAr: 'ابعث طرد',
    icon: Package,
    badge: { text: '📦', color: C.gold },
  },
  {
    id: 'track', path: '/packages',
    labelEn: 'Track Package', labelAr: 'تتبع طردك',
    icon: Navigation,
  },
  {
    id: 'my-trips', path: '/my-trips',
    labelEn: 'My Trips', labelAr: 'رحلاتي',
    icon: Zap,
  },
  {
    id: 'routes', path: '/routes',
    labelEn: 'Popular Routes', labelAr: 'المسارات الشائعة',
    icon: BarChart3,
  },
  {
    id: 'safety', path: '/safety',
    labelEn: 'Safety & Trust', labelAr: 'الأمان والثقة',
    icon: Shield,
  },
  {
    id: 'settings', path: '/profile',
    labelEn: 'Settings', labelAr: 'الإعدادات',
    icon: Settings,
  },
];

interface WaselBurgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export function WaselBurgerMenu({ isOpen, onClose, activeTab, onTabChange }: WaselBurgerMenuProps) {
  const { language, setLanguage } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  const ar = language === 'ar';

  // ── Derived user info ──────────────────────────────────────────────────────
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  // ── Close on Escape ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  // ── Focus trap ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) drawerRef.current?.focus();
  }, [isOpen]);

  // ── Nav click ─────────────────────────────────────────────────────────────
  const handleNav = useCallback((item: NavItem) => {
    navigate(item.path);
    onClose();
  }, [navigate, onClose]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    onClose();
    navigate('/');
  }, [signOut, onClose, navigate]);

  const toggleTheme = useCallback(() => {
    const html = document.documentElement;
    if (html.classList.contains('light')) {
      html.classList.remove('light');
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
      html.classList.add('light');
    }
  }, []);

  const isDark = !document.documentElement.classList.contains('light');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Drawer panel ── */}
          <motion.div
            key="drawer"
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={ar ? 'القائمة الرئيسية' : 'Main menu'}
            initial={{ x: ar ? '100%' : '-100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: ar ? '100%' : '-100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 bottom-0 z-50 flex flex-col outline-none"
            style={{
              [ar ? 'right' : 'left']: 0,
              width: 'min(320px, 88vw)',
              background: C.surface,
              borderRight: ar ? 'none' : `1px solid ${C.border}`,
              borderLeft: ar ? `1px solid ${C.border}` : 'none',
              boxShadow: ar
                ? '-24px 0 80px rgba(0,0,0,0.6)'
                : '24px 0 80px rgba(0,0,0,0.6)',
            }}
            dir={ar ? 'rtl' : 'ltr'}
          >
            {/* ── Inner glow ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-none">
              <div style={{
                position: 'absolute', top: -60, [ar ? 'right' : 'left']: -60,
                width: 220, height: 220, borderRadius: '50%',
                background: `radial-gradient(circle, ${C.cyan}12 0%, transparent 70%)`,
                filter: 'blur(30px)',
              }} />
              <div style={{
                position: 'absolute', bottom: -40, [ar ? 'left' : 'right']: -40,
                width: 180, height: 180, borderRadius: '50%',
                background: `radial-gradient(circle, ${C.purple}10 0%, transparent 70%)`,
                filter: 'blur(30px)',
              }} />
            </div>

            {/* ── Header: Logo + Close ── */}
            <div className="relative flex items-center justify-between px-5 pt-5 pb-4">
              {/* Logo mark */}
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <WaselLogoMark size={38} />
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: `0 0 18px ${C.cyan}40` }} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-black leading-tight"
                      style={{
                        fontSize: '1.6rem',
                        letterSpacing: '-0.04em',
                        background: `linear-gradient(135deg, ${C.cyan} 0%, #5EE7FF 50%, ${C.gold} 100%)`,
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                        textShadow: 'none',
                      }}
                    >
                      Wasel
                    </span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: C.cyan, opacity: 0.7 }}>
                    Move smarter across Jordan
                  </div>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                aria-label={ar ? 'إغلاق القائمة' : 'Close menu'}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.08)` }}
              >
                <X className="w-4 h-4" style={{ color: C.muted }} />
              </motion.button>
            </div>

            {/* ── User profile card ── */}
            {user ? (
              <div className="mx-4 mb-5 rounded-2xl px-4 py-3.5 relative overflow-hidden"
                style={{ background: C.card, border: `1px solid ${C.cyan}15` }}>
                <div className="absolute inset-0" style={{
                  background: `radial-gradient(ellipse at 0% 50%, ${C.cyan}08 0%, transparent 60%)`,
                }} />
                <div className="relative flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 relative"
                    style={{ background: `linear-gradient(135deg, #0A8A70, #00C875)` }}>
                    <span className="text-white">{initials}</span>
                    {/* Online dot */}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{ background: C.green, borderColor: C.card }} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{displayName}</div>
                    <div className="text-xs truncate" style={{ color: C.muted }}>{email}</div>
                  </div>
                  {/* Sanad star */}
                  <motion.div whileHover={{ scale: 1.15, rotate: 15 }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${C.gold}15`, border: `1px solid ${C.gold}25` }}>
                    <Star className="w-3.5 h-3.5" style={{ color: C.gold }} />
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="mx-4 mb-5">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { navigate('/auth'); onClose(); }}
                  className="w-full py-3 rounded-2xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${C.cyan}, ${C.purple})`, color: '#000' }}>
                  {ar ? 'تسجيل الدخول' : 'Sign In'}
                </motion.button>
              </div>
            )}

            {/* ── Nav items ── */}
            <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-thin"
              role="navigation" aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>
              {NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id ||
                  (item.id === 'home' && !activeTab);

                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: ar ? -2 : 2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleNav(item)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all relative group"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${C.cyan}14, ${C.cyan}08)`
                        : 'transparent',
                      border: `1px solid ${isActive ? C.cyan + '22' : 'transparent'}`,
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute top-2 bottom-2 w-0.5 rounded-full"
                        style={{
                          [ar ? 'right' : 'left']: 0,
                          background: C.cyan,
                        }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    <item.icon
                      className="w-4 h-4 shrink-0 transition-colors"
                      style={{ color: isActive ? C.cyan : C.muted }}
                    />

                    <span className="flex-1 text-sm font-medium truncate"
                      style={{ color: isActive ? '#F1F5F9' : '#94A3B8' }}>
                      {ar ? item.labelAr : item.labelEn}
                    </span>

                    {item.badge && (
                      item.badge.text === '📦' ? (
                        <span className="shrink-0 text-sm">{item.badge.text}</span>
                      ) : (
                        <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide"
                          style={{
                            background: `${item.badge.color}15`,
                            color: item.badge.color,
                            border: `1px solid ${item.badge.color}25`,
                          }}>
                          {item.badge.text}
                        </span>
                      )
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* ── Divider ── */}
            <div className="mx-4 my-3 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* ── Theme toggle ── */}
            <div className="px-5 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: C.muted }}>
                {ar ? 'المظهر' : 'THEME'}
              </span>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleTheme}
                aria-label={ar ? 'تبديل المظهر' : 'Toggle theme'}
                className="relative w-14 h-7 rounded-full flex items-center transition-colors"
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, ${C.cyan}30, ${C.purple}30)`
                    : 'rgba(255,200,50,0.2)',
                  border: `1px solid ${isDark ? C.cyan + '30' : 'rgba(255,200,50,0.4)'}`,
                  padding: '2px',
                }}
              >
                {/* Track icons */}
                <Sun className="absolute left-1.5 w-3.5 h-3.5 transition-opacity"
                  style={{ color: '#F0A830', opacity: isDark ? 0.35 : 1 }} />
                <Moon className="absolute right-1.5 w-3.5 h-3.5 transition-opacity"
                  style={{ color: C.cyan, opacity: isDark ? 1 : 0.35 }} />
                {/* Thumb */}
                <motion.div
                  animate={{ x: isDark ? 28 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute w-5 h-5 rounded-full left-0.5"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${C.cyan}, ${C.purple})`
                      : 'linear-gradient(135deg, #F0A830, #F59E0B)',
                    boxShadow: isDark
                      ? `0 0 10px ${C.cyan}60`
                      : '0 0 10px rgba(240,168,48,0.6)',
                  }}
                />
              </motion.button>
            </div>

            {/* ── Language toggle ── */}
            <div className="px-5 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{ color: C.muted }}>
                {ar ? 'اللغة' : 'LANGUAGE'}
              </span>
              <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
                {(['en', 'ar'] as Language[]).map((lang) => (
                  <button key={lang} onClick={() => setLanguage?.(lang)}
                    className="px-3 py-1 text-xs font-bold transition-all"
                    style={{
                      background: language === lang ? C.cyan : 'transparent',
                      color: language === lang ? '#000' : C.muted,
                    }}>
                    {lang === 'en' ? 'EN' : 'AR'}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="mx-4 my-2 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

            {/* ── Sign Out ── */}
            {user && (
              <div className="px-3 pb-6 pt-1">
                <motion.button
                  whileHover={{ x: ar ? -2 : 2, backgroundColor: 'rgba(239,68,68,0.08)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                  style={{ border: '1px solid transparent' }}
                >
                  <LogOut className="w-4 h-4 shrink-0" style={{ color: C.red }} />
                  <span className="text-sm font-semibold" style={{ color: C.red }}>
                    {ar ? 'تسجيل الخروج' : 'Sign Out'}
                  </span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
