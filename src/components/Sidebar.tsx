/**
 * Sidebar — Wasel | واصل v6.0
 * Futuristic redesign — constellation brand, neural network aesthetic
 * Dark-first, glassmorphism, #0B1120 base
 */

import { memo, useState, useEffect } from 'react';
import {
  LayoutDashboard, Search, Car, CalendarDays, MessagesSquare,
  Package, QrCode, PackageSearch,
  UserCog, Wallet, Bell, Heart, Settings,
  MapPin, Moon, Users,
  Shield, HelpCircle, Calculator, Route,
  ChevronDown, ChevronLeft, ChevronRight, X, LogOut, Sparkles, Globe, Bus, Brain, BarChart3,
  Navigation,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ThemeToggle } from './ThemeToggle';
import { WaselBrand, BRAND } from './WaselBrand';
import logoImage from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  icon: any;
  en: string;
  ar: string;
  badge?: string;
}

/* ── Nav Data ── */

// ─── TIER 1: CORE USER ACTIONS (always visible, no collapse) ───────────────
const coreActions: NavItem[] = [
  { id: 'dashboard',           icon: LayoutDashboard, en: 'Home',         ar: 'الرئيسية'      },
  { id: 'find-ride',           icon: Search,          en: 'Find a Ride',  ar: 'دور على رحلة'  },
  { id: 'offer-ride',          icon: Car,             en: 'Post a Ride',  ar: 'انشر رحلة'     },
  { id: 'my-trips',            icon: CalendarDays,    en: 'My Trips',     ar: 'رحلاتي'        },
  { id: 'messages',            icon: MessagesSquare,  en: 'Messages',     ar: 'الرسائل'       },
];

// ─── TIER 2: PLATFORM SERVICES (collapsible sections) ──────────────────────

// Platform Intelligence
const platformIntelligence: NavItem[] = [
  { id: 'ask-wasel',           icon: Brain,           en: 'Ask Wasel AI',  ar: 'واصل AI 🤖',    badge: 'AI' },
  { id: 'corridor-ai',         icon: BarChart3,       en: 'Corridor AI',   ar: 'ذكاء الممرات',  badge: 'PRO' },
  { id: 'core',                icon: Navigation,      en: 'Core Hub',      ar: 'المحور الأساسي', badge: 'NEW' },
];

// Mobility Services
const mobilityServices: NavItem[] = [
  { id: 'services/mobility-os',icon: Globe,           en: 'Mobility OS',    ar: 'نظام التنقل 🌍',   badge: 'NEW' },
  { id: 'wasel-bus',           icon: Bus,             en: 'WaselBus',       ar: 'واصل باص 🚌'   },
];

const packageItems: NavItem[] = [
  { id: 'awasel/send',        icon: Package,       en: 'Send Package', ar: 'ابعث طرد'   },
  { id: 'awasel/my-packages', icon: PackageSearch, en: 'My Packages',  ar: 'طرودي'      },
  { id: 'awasel/track',       icon: QrCode,        en: 'Track & QR',   ar: 'تتبع وـQR'  },
];

const accountItems: NavItem[] = [
  { id: 'profile',       icon: UserCog,  en: 'Profile',       ar: 'الملف الشخصي'  },
  { id: 'badges',        icon: Sparkles, en: 'My Badges',     ar: 'شاراتي',  badge: '🏆' },
  { id: 'referrals',     icon: Users,    en: 'Referrals',     ar: 'الإحالات' },
  { id: 'wallet',        icon: Wallet,   en: 'Core Wallet',   ar: 'المحفظة الأساسية' },
  { id: 'notifications', icon: Bell,     en: 'Notifications', ar: 'الإشعارات'     },
  { id: 'favorites',     icon: Heart,    en: 'Favorites',     ar: 'المفضلة'       },
  { id: 'settings',      icon: Settings, en: 'Settings',      ar: 'الإعدادات'     },
];

const culturalItems: NavItem[] = [
  { id: 'cultural/prayer-stops',       icon: MapPin, en: 'Prayer Stops',       ar: 'وقفات الصلاة',  badge: '🕌' },
  { id: 'cultural/gender-preferences', icon: Users,  en: 'Gender Preferences', ar: 'تفضيلات الجنس', badge: '🚺' },
  { id: 'cultural/ramadan-mode',       icon: Moon,   en: 'Ramadan Mode',       ar: 'وضع رمضان',     badge: '🌙' },
];

const helpItems: NavItem[] = [
  { id: 'safety',          icon: Shield,     en: 'Safety Center',   ar: 'مركز الأمان'    },
  { id: 'routes',          icon: Route,      en: 'Popular Routes',  ar: 'الطرق الشائعة'  },
  { id: 'cost-calculator', icon: Calculator, en: 'Cost Calculator', ar: 'حاسبة التكلفة'  },
  { id: 'how-it-works',    icon: HelpCircle, en: 'How It Works',    ar: 'كيف يشتغل؟'    },
  { id: 'help',            icon: HelpCircle, en: 'Help & Support',  ar: 'المساعدة'       },
];

/* ── Sidebar Logo — uses unified WaselBrand ── */
function SidebarLogo({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 group transition-all duration-300 hover:scale-105"
      aria-label="Wasel Home"
    >
      {/* Logo Image */}
      <img
        src={logoImage}
        alt="Wasel Logo"
        className="w-10 h-10 object-contain transition-transform group-hover:rotate-3"
        style={{ filter: 'drop-shadow(0 0 8px rgba(4, 173, 191, 0.5))' }}
      />
      {/* Brand Text */}
      <div className="flex flex-col">
        <span className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight">
          Wasel
        </span>
        <span className="text-[9px] font-medium text-cyan-500/60 leading-tight" dir="rtl">
          واصل
        </span>
      </div>
    </button>
  );
}

/* ── Nav Item button ── */
function NavBtn({ item, isActive, onClick, badge, accentColor = '#04ADBF', ar }: {
  item: NavItem; isActive: boolean; onClick: () => void;
  badge?: string | number; accentColor?: string; ar: boolean;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 relative group"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${accentColor}14, ${accentColor}08)`
          : 'transparent',
        border: isActive
          ? `1px solid ${accentColor}25`
          : '1px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <motion.div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
          style={{ background: accentColor }}
          layoutId={`activeBar-${accentColor}`}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <Icon className="w-4 h-4 shrink-0 transition-colors"
        style={{ color: isActive ? accentColor : 'rgba(100,116,139,0.9)' }} />

      <span className="flex-1 truncate text-sm font-medium transition-colors"
        style={{ color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(148,163,184,0.85)' }}>
        {ar ? item.ar : item.en}
      </span>

      {badge !== undefined && badge !== 0 && (
        typeof badge === 'number' ? (
          <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: '#D9965B' }}>
            {badge > 9 ? '9+' : badge}
          </span>
        ) : /^\d/.test(String(badge)) ? (
          <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ background: '#D9965B' }}>
            {badge}
          </span>
        ) : badge === 'NEW' ? (
          <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
            style={{ background: 'rgba(4,173,191,0.15)', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.25)' }}>
            NEW
          </span>
        ) : (
          <span className="shrink-0 text-xs opacity-70">{badge}</span>
        )
      )}
    </motion.button>
  );
}

/* ── Collapsible Section ── */
function NavSection({
  labelEn, labelAr, items, currentPage, language, onNavigate,
  defaultOpen = false, accentColor = '#04ADBF', sectionIcon,
}: {
  labelEn: string; labelAr: string; items: NavItem[]; currentPage: string;
  language: string; onNavigate: (id: string) => void;
  defaultOpen?: boolean; accentColor?: string; sectionIcon?: string;
}) {
  const ar = language === 'ar';
  const hasActive = items.some(i => currentPage === i.id || currentPage.startsWith(i.id + '/'));
  const [open, setOpen] = useState(defaultOpen || hasActive);

  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg group transition-colors mb-0.5"
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
        <div className="flex items-center gap-1.5">
          {sectionIcon && <span className="text-xs">{sectionIcon}</span>}
          <span className="text-[10px] font-bold uppercase tracking-widest transition-colors"
            style={{ color: open ? accentColor : 'rgba(71,85,105,0.9)' }}>
            {ar ? labelAr : labelEn}
          </span>
        </div>
        <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3 h-3" style={{ color: open ? accentColor : 'rgba(71,85,105,0.7)' }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}>
            <div className="space-y-0.5 pb-1">
              {items.map(item => (
                <NavBtn key={item.id} item={item} ar={ar}
                  isActive={currentPage === item.id || currentPage.startsWith(item.id + '/')}
                  onClick={() => onNavigate(item.id)}
                  badge={item.badge}
                  accentColor={accentColor}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Section divider ── */
function Divider() {
  return <div className="my-1.5 mx-3 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />;
}

/* ── Main Sidebar ── */
export const Sidebar = memo(function Sidebar({ currentPage, onNavigate, isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { language } = useLanguage();
  const { signOut, profile, user } = useAuth();
  const { unreadCount: notifCount = 0 } = useNotifications() || {};
  const ar = language === 'ar';

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [edgeHovered, setEdgeHovered] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleNavigate = (page: string) => { onNavigate(page); onClose(); };
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(ar ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      onClose();
    } catch { toast.error(ar ? 'فشل تسجيل الخروج' : 'Failed to logout'); }
  };

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || '';
  const email = user?.email || '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : '?');

  // Compute animation: collapsed on desktop slides fully off-screen
  const isHidden = isDesktop ? isCollapsed : !isOpen;
  const xOffset = ar ? '100%' : '-100%';

  return (
    <>
      {/* Backdrop — mobile only */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
            onTouchEnd={onClose}
          />
        )}
      </AnimatePresence>

      {/* Collapsed edge tab — desktop only, shows when sidebar is hidden */}
      <AnimatePresence>
        {isDesktop && isCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: ar ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: ar ? 20 : -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={onToggleCollapse}
            onMouseEnter={() => setEdgeHovered(true)}
            onMouseLeave={() => setEdgeHovered(false)}
            className="fixed top-1/2 z-50 flex items-center justify-center"
            style={{
              [ar ? 'right' : 'left']: 0,
              transform: 'translateY(-50%)',
              width: edgeHovered ? 44 : 28,
              height: 80,
              borderRadius: ar ? '12px 0 0 12px' : '0 12px 12px 0',
              background: edgeHovered
                ? 'linear-gradient(135deg, rgba(0,200,232,0.25), rgba(0,200,232,0.1))'
                : 'rgba(4,10,22,0.92)',
              border: `1px solid rgba(0,200,232,${edgeHovered ? '0.4' : '0.12'})`,
              borderLeft: ar ? '1px solid rgba(0,200,232,0.12)' : 'none',
              borderRight: ar ? 'none' : '1px solid rgba(0,200,232,0.12)',
              boxShadow: edgeHovered ? '0 4px 24px rgba(0,200,232,0.2)' : '0 2px 12px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              cursor: 'pointer',
              transition: 'width 200ms ease, background 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
            }}
            aria-label={ar ? 'فتح القائمة' : 'Open sidebar'}
          >
            {ar
              ? <ChevronLeft className="w-4 h-4 shrink-0" style={{ color: edgeHovered ? '#00C8E8' : 'rgba(100,116,139,0.7)' }} />
              : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: edgeHovered ? '#00C8E8' : 'rgba(100,116,139,0.7)' }} />
            }
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isHidden ? xOffset : 0, opacity: 1 }}
        transition={isDesktop
          ? { type: 'spring', stiffness: 380, damping: 36, mass: 0.9 }
          : { type: 'spring', stiffness: 340, damping: 32, mass: 0.85 }
        }
        role="navigation"
        aria-label={ar ? 'القائمة الرئيسية' : 'Main navigation'}
        className="fixed inset-y-0 z-50 flex flex-col"
        style={{
          width: isDesktop ? 260 : Math.min(window.innerWidth * 0.85, 280),
          [ar ? 'right' : 'left']: 0,
          background: 'rgba(4,10,22,0.98)',
          backdropFilter: 'blur(32px)',
          borderRight: ar ? 'none' : `1px solid rgba(0,200,232,0.07)`,
          borderLeft: ar ? `1px solid rgba(0,200,232,0.07)` : 'none',
          pointerEvents: isHidden ? 'none' : 'auto',
        }}>

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(4,173,191,0.04) 0%, transparent 70%)' }} />
          <div className="absolute bottom-20 -right-10 w-40 h-40 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(217,150,91,0.03) 0%, transparent 70%)' }} />
          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 260 800" preserveAspectRatio="none">
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1={i * 50} y1="0" x2={i * 50} y2="800" stroke="#04ADBF" strokeWidth="0.3" opacity="0.05" />
            ))}
          </svg>
        </div>

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <SidebarLogo onClick={() => handleNavigate('dashboard')} />
          <div className="flex items-center gap-1">
            {/* Desktop collapse button */}
            {isDesktop && onToggleCollapse && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9, backgroundColor: 'rgba(0,200,232,0.15)' }}
                onClick={onToggleCollapse}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(100,116,139,0.8)' }}
                aria-label={ar ? 'طي القائمة' : 'Collapse sidebar'}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,200,232,0.1)';
                  e.currentTarget.style.color = '#00C8E8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'rgba(100,116,139,0.8)';
                }}>
                {ar ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </motion.button>
            )}
            {/* Mobile close button */}
            {!isDesktop && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(100,116,139,0.8)' }}
                aria-label="Close menu"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* ── User profile card ── */}
        {user ? (
          <motion.button whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.99 }}
            onClick={() => handleNavigate('profile')}
            className="relative mx-3 mt-3 flex items-center gap-3 px-3 py-3 rounded-2xl transition-all"
            style={{ background: 'rgba(4,173,191,0.06)', border: '1px solid rgba(4,173,191,0.1)' }}>
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(4,173,191,0.3), rgba(9,115,46,0.3))',
                  border: '1px solid rgba(4,173,191,0.3)',
                  color: '#04ADBF',
                }}>
                {initials}
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                style={{ background: '#ABD907', border: '1.5px solid rgba(10,15,28,0.97)', boxShadow: '0 0 6px rgba(171,217,7,0.5)' }} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="font-bold truncate text-sm" style={{ color: 'rgba(255,255,255,0.95)' }}>
                {displayName || (ar ? 'مرحبا' : 'Welcome')}
              </p>
              <p className="truncate text-xs" style={{ color: 'rgba(100,116,139,0.8)' }}>{email}</p>
            </div>
            <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(4,173,191,0.4)' }} />
          </motion.button>
        ) : (
          <div className="mx-3 mt-3 px-3 py-2.5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-xs text-center" style={{ color: 'rgba(100,116,139,0.7)' }}>
              {ar ? 'مرحبا بك في واصل' : 'Welcome to Wasel'}
            </p>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-3"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(30,41,59,0.5) transparent' }}>

          {/* PRIMARY */}
          <div className="space-y-0.5 mb-2">
            {coreActions.map(item => (
              <NavBtn key={item.id} item={item} ar={ar}
                isActive={currentPage === item.id || currentPage.startsWith(item.id + '/')}
                onClick={() => handleNavigate(item.id)}
                badge={
                  item.id === 'messages' && notifCount > 0
                    ? notifCount
                    : item.badge
                }
                accentColor={
                  item.id === 'wasel-bus' ? '#F0A830'
                  : item.id === 'services/mobility-os' ? '#00C8E8'
                  : BRAND.cyan
                }
              />
            ))}
          </div>

          <Divider />

          {/* PLATFORM INTELLIGENCE */}
          <NavSection labelEn="Platform Intelligence" labelAr="ذكاء النظام"
            sectionIcon="💡"
            items={platformIntelligence} currentPage={currentPage} language={language}
            onNavigate={handleNavigate} accentColor="#8B5CF6"
          />

          <Divider />

          {/* MOBILITY SERVICES */}
          <NavSection labelEn="Mobility Services" labelAr="خدمات التنقل"
            sectionIcon="🚗"
            items={mobilityServices} currentPage={currentPage} language={language}
            onNavigate={handleNavigate} accentColor="#00C8E8"
          />

          <Divider />

          {/* PACKAGES */}
          <NavSection labelEn="Packages" labelAr="الطرود"
            sectionIcon="📦"
            items={packageItems} currentPage={currentPage} language={language}
            onNavigate={handleNavigate} accentColor={BRAND.gold}
          />

          <Divider />

          {/* ACCOUNT */}
          <NavSection labelEn="Account" labelAr="الحساب"
            sectionIcon="👤"
            items={accountItems.map(item => ({
              ...item,
              badge: item.id === 'notifications' && notifCount > 0 ? (notifCount > 9 ? '9+' : String(notifCount)) : item.badge,
            }))}
            currentPage={currentPage} language={language}
            onNavigate={handleNavigate} accentColor={BRAND.cyan}
          />

          <Divider />

          {/* CULTURAL */}
          <NavSection labelEn="Cultural" labelAr="ثقافي"
            sectionIcon="🕌"
            items={culturalItems} currentPage={currentPage} language={language}
            onNavigate={handleNavigate} accentColor="#8B5CF6"
          />

          <Divider />

          {/* HELP & TOOLS */}
          <NavSection labelEn="Help & Tools" labelAr="المساعدة"
            sectionIcon="🛠"
            items={helpItems} currentPage={currentPage} language={language}
            onNavigate={handleNavigate} accentColor="#22C55E"
          />
        </nav>

        {/* ── Footer ── */}
        <div className="px-3 py-3 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Theme toggle row */}
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-1"
            style={{ background: 'rgba(255,255,255,0.025)' }}>
            <span className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: 'rgba(100,116,139,0.8)' }}>
              {ar ? 'المظهر' : 'Theme'}
            </span>
            <ThemeToggle />
          </div>

          {/* Sign out */}
          {user && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{ color: 'rgba(239,68,68,0.7)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                e.currentTarget.style.color = 'rgba(239,68,68,0.95)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'rgba(239,68,68,0.7)';
              }}>
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">
                {ar ? 'تسجيل الخروج' : 'Sign Out'}
              </span>
            </motion.button>
          )}
        </div>
      </motion.aside>
    </>
  );
});
