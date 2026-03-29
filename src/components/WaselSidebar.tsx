/**
 * WaselSidebar v8.0 — EXACT SCREENSHOT MATCH
 * Comprehensive burger menu with sections
 * WhatsApp integration · Google Maps ready
 */

import { memo, useState, useRef } from 'react';
import {
  Home, Search, Car, Calendar, MessageCircle, Package, Wallet,
  User, Settings, Bell, Heart, Shield, HelpCircle,
  Bus, Navigation, MapPin, Moon, Users, QrCode,
  ChevronDown, ChevronRight, LogOut, Activity, SunMoon,
  Calculator, BookOpen, Map, PhoneCall, X,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { WaselColors as C } from '../styles/wasel-design-system';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  icon: any;
  en: string;
  ar: string;
  badge?: string;
  emoji?: string;
  route?: string;
}

interface NavSection {
  id: string;
  title: string;
  titleAr: string;
  icon?: any;
  color?: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// NAVIGATION STRUCTURE (EXACT SCREENSHOT MATCH)
// ══════════════════════════════════════════════════════════════════════════════

const MAIN_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: Home, en: 'Home', ar: 'الرئيسية' },
  { id: 'find-ride', icon: Search, en: 'Find a Ride', ar: 'دور رحلة' },
  { id: 'offer-ride', icon: Car, en: 'Post a Ride', ar: 'انشر رحلة' },
  { id: 'my-trips', icon: Calendar, en: 'My Trips', ar: 'رحلاتي' },
  { id: 'wasel-bus', icon: Bus, en: 'WaselBus', ar: 'واصل باص', emoji: '🚌' },
  { id: 'live', icon: Activity, en: 'Mobility OS', ar: 'نظام الحركة', badge: 'NEW' },
  { id: 'messages', icon: MessageCircle, en: 'Messages', ar: 'الرسائل' },
];

const SECTIONS: NavSection[] = [
  {
    id: 'packages',
    title: 'PACKAGES',
    titleAr: 'الطرود',
    icon: Package,
    color: '#D9965B',
    defaultOpen: true,
    items: [
      { id: 'awasel/send', icon: Package, en: 'Send Package', ar: 'ابعث طرد' },
      { id: 'awasel/my-packages', icon: Package, en: 'My Packages', ar: 'طرودي' },
      { id: 'awasel/track', icon: QrCode, en: 'Track & QR', ar: 'تتبع و QR' },
    ],
  },
  {
    id: 'account',
    title: 'ACCOUNT',
    titleAr: 'الحساب',
    icon: User,
    color: C.cyan,
    defaultOpen: false,
    items: [
      { id: 'profile', icon: User, en: 'Profile', ar: 'الملف' },
      { id: 'wallet', icon: Wallet, en: 'Core Wallet', ar: 'المحفظة الأساسية' },
      { id: 'notifications', icon: Bell, en: 'Notifications', ar: 'إشعارات' },
      { id: 'favorites', icon: Heart, en: 'Favorites', ar: 'مفضلة' },
      { id: 'settings', icon: Settings, en: 'Settings', ar: 'إعدادات' },
    ],
  },
  {
    id: 'cultural',
    title: 'CULTURAL',
    titleAr: 'الثقافة',
    icon: Moon,
    color: '#F0A830',
    defaultOpen: false,
    items: [
      { id: 'cultural/prayer-stops', icon: MapPin, en: 'Prayer Stops', ar: 'توقفات صلاة', emoji: '🕌' },
      { id: 'cultural/gender-preferences', icon: Users, en: 'Gender Preferences', ar: 'تفضيلات الجنس', emoji: '🚺' },
      { id: 'cultural/ramadan-mode', icon: Moon, en: 'Ramadan Mode', ar: 'وضع رمضان', emoji: '🌙' },
    ],
  },
  {
    id: 'help',
    title: 'HELP & TOOLS',
    titleAr: 'المساعدة والأدوات',
    icon: HelpCircle,
    color: '#00C875',
    defaultOpen: false,
    items: [
      { id: 'safety', icon: Shield, en: 'Safety Center', ar: 'مركز الأمان' },
      { id: 'routes', icon: Map, en: 'Popular Routes', ar: 'مسارات شائعة' },
      { id: 'cost-calculator', icon: Calculator, en: 'Cost Calculator', ar: 'حاسبة التكلفة' },
      { id: 'how-it-works', icon: BookOpen, en: 'How It Works', ar: 'كيف يعمل' },
      { id: 'help', icon: PhoneCall, en: 'Help & Support', ar: 'مساعدة ودعم' },
    ],
  },
];

export const WaselSidebar = memo(function WaselSidebar({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const { language, dir, toggleLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const isAr = language === 'ar';
  const mountedRef = useRef(true);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    packages: true,
    account: false,
    cultural: false,
    help: false,
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleNavClick = (itemId: string) => {
    onNavigate(itemId);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('');
      onClose();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Get user display info
  const userName = user?.user_metadata?.name || 'User';
  const userEmail = user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 h-full w-72 z-50 overflow-y-auto"
            dir={dir}
            style={{
              background: '#0A0E1A',
              borderRight: dir === 'ltr' ? '1px solid rgba(0,200,232,0.1)' : 'none',
              borderLeft: dir === 'rtl' ? '1px solid rgba(0,200,232,0.1)' : 'none',
              left: dir === 'ltr' ? 0 : 'auto',
              right: dir === 'rtl' ? 0 : 'auto',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: '#64748B' }}
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Profile Section */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg relative"
                  style={{
                    background: `linear-gradient(135deg, ${C.cyan}, ${C.green})`,
                    color: '#fff',
                  }}
                >
                  {userInitial}
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                    style={{
                      background: '#00C875',
                      borderColor: '#0A0E1A',
                    }}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{userName}</div>
                  <div className="text-xs text-gray-400 truncate">{userEmail}</div>
                </div>
              </div>
            </div>

            {/* Main Navigation */}
            <div className="p-3 space-y-1">
              {MAIN_ITEMS.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={currentPage === item.id}
                  onClick={() => handleNavClick(item.id)}
                  isAr={isAr}
                />
              ))}
            </div>

            {/* Sections */}
            <div className="pb-4">
              {SECTIONS.map((section) => (
                <NavSection
                  key={section.id}
                  section={section}
                  isExpanded={expandedSections[section.id] ?? section.defaultOpen ?? false}
                  onToggle={() => toggleSection(section.id)}
                  currentPage={currentPage}
                  onItemClick={handleNavClick}
                  isAr={isAr}
                />
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isAr ? 'المظهر' : 'THEME'}
                </span>
                <button
                  onClick={toggleLanguage}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${C.cyan}, ${C.green})`,
                    boxShadow: `0 0 20px ${C.cyan}40`,
                  }}
                >
                  <SunMoon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Sign Out */}
            <div className="p-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-red-500/10 text-red-400"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function NavButton({
  item,
  isActive,
  onClick,
  isAr,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  isAr: boolean;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group"
      style={{
        background: isActive ? 'rgba(0,200,232,0.12)' : 'transparent',
        color: isActive ? C.cyan : '#94A3B8',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
    >
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
          style={{ background: C.cyan }}
        />
      )}

      <Icon className="w-5 h-5 shrink-0" />
      <span className="flex-1 text-left font-medium">{isAr ? item.ar : item.en}</span>

      {item.emoji && <span className="text-lg">{item.emoji}</span>}
      {item.badge && (
        <span
          className="px-2 py-0.5 rounded text-xs font-bold"
          style={{
            background: C.cyan,
            color: '#0A0E1A',
          }}
        >
          {item.badge}
        </span>
      )}
    </button>
  );
}

function NavSection({
  section,
  isExpanded,
  onToggle,
  currentPage,
  onItemClick,
  isAr,
}: {
  section: NavSection;
  isExpanded: boolean;
  onToggle: () => void;
  currentPage: string;
  onItemClick: (id: string) => void;
  isAr: boolean;
}) {
  const SectionIcon = section.icon;

  return (
    <div className="mt-4">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-2 transition-all hover:bg-white/5"
      >
        {SectionIcon && <SectionIcon className="w-4 h-4" style={{ color: section.color }} />}
        <span
          className="flex-1 text-left text-xs font-bold uppercase tracking-wider"
          style={{ color: section.color }}
        >
          {isAr ? section.titleAr : section.title}
        </span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: section.color }} />
        </motion.div>
      </button>

      {/* Section Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-1 space-y-1">
              {section.items.map((item) => {
                const isActive = currentPage === item.id;
                const ItemIcon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => onItemClick(item.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all"
                    style={{
                      background: isActive ? 'rgba(0,200,232,0.12)' : 'transparent',
                      color: isActive ? C.cyan : '#94A3B8',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <ItemIcon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-left text-sm font-medium">
                      {isAr ? item.ar : item.en}
                    </span>
                    {item.emoji && <span>{item.emoji}</span>}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
