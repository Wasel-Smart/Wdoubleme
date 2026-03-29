/**
 * GapAnalysis — Wasel | واصل
 * Comprehensive gap analysis — updated March 13, 2026
 * Tracks: fixed ✅, open ⚠️, new 🆕
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle, XCircle, CheckCircle2, ChevronDown,
  MessageSquare, MapPin, Star, Wallet, Share2,
  Bell, Calendar, Package, RefreshCw, Shield,
  Code2, Users, Clock, Zap, TrendingUp, Globe,
  ArrowRight, Filter, CheckCheck, Lock, Route,
  FileCode, Palette, Languages, Database, Bug,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Effort   = 'XS' | 'S' | 'M' | 'L' | 'XL';
type Impact   = 'H' | 'M' | 'L';
type Status   = 'open' | 'fixed' | 'partial';
type Category =
  | 'Core Flow'
  | 'Messaging'
  | 'Payments'
  | 'Notifications'
  | 'UX / Search'
  | 'Data / Backend'
  | 'Regional'
  | 'Growth'
  | 'Safety'
  | 'Brand'
  | 'Infrastructure'
  | 'RTL / i18n'
  | 'Tokens / Design';

interface Gap {
  id: string;
  priority: Priority;
  status: Status;
  icon: React.ComponentType<any>;
  category: Category;
  title: string;
  titleAr: string;
  problem: string;
  problemAr: string;
  fix: string;
  fixAr: string;
  file?: string;
  effort: Effort;
  impact: Impact;
  isNew?: boolean;
}

// ─── Gap Data ─────────────────────────────────────────────────────────────────

const GAPS: Gap[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 1 — ORIGINAL GAPS (g1–g21) with current status
  // ══════════════════════════════════════════════════════════════════════════

  // ── CRITICAL ────────────────────────────────────────────────────────────────
  {
    id: 'g1',
    priority: 'critical',
    status: 'partial',
    icon: MessageSquare,
    category: 'Messaging',
    title: 'Messages.tsx — conversations list still hardcoded',
    titleAr: 'Messages.tsx — قائمة المحادثات لا تزال مشفّرة',
    problem: 'Messages.tsx imports useRealMessages() but the conversations panel is still initialised from SEED_CONVOS (3 hardcoded objects). Real conversations from the backend never replace the seed — they are only merged in loosely. Carpooling requires live driver–passenger coordination.',
    problemAr: 'Messages.tsx تستورد useRealMessages لكن الحالة الأولية لا تزال SEED_CONVOS (3 محادثات ثابتة). المحادثات الحقيقية من الخادم لا تحل محلها. التنسيق بين المسافر والراكب ضروري.',
    fix: 'On mount: fetch GET /conversations for the logged-in user. Replace SEED_CONVOS with the server response (fall back to seeds only if the response is empty). Wire useRealMessages subscriptions to update the list in real-time.',
    fixAr: 'عند التحميل: اجلب GET /conversations. استبدل SEED_CONVOS بالاستجابة (استخدم البيانات الثابتة فقط كبديل). اربط useRealMessages لتحديثات لحظية.',
    file: '/components/Messages.tsx',
    effort: 'M',
    impact: 'H',
  },
  {
    id: 'g5',
    priority: 'critical',
    status: 'open',
    icon: MapPin,
    category: 'Regional',
    title: 'Dashboard destination cards hardcoded Jordan only',
    titleAr: 'بطاقات الوجهات في الداشبورد مشفّرة للأردن فقط',
    problem: 'Dashboard.tsx has a hardcoded `destinations` array [Aqaba, Dead Sea, Petra, Wadi Rum] that ignores the user\'s country. An Egyptian user sees Jordan destinations. The `quickActions` subtitle also hardcodes "Aqaba · Irbid · Petra" on line 152.',
    problemAr: 'داشبورد.tsx يحتوي على مصفوفة destinations ثابتة [العقبة، البحر الميت، البتراء، وادي رم]. مستخدم مصري يرى وجهات أردنية.',
    fix: 'Replace the static `destinations` array with: `region.routes.filter(r => r.tier === 1).slice(0, 4).map(r => ({ id: r.to.toLowerCase(), nameEn: r.to, nameAr: r.toAr, price: r.priceRange[0], ... }))`. Also update the HeroSearch subtitle to use region routes.',
    fixAr: 'استبدل مصفوفة destinations بـ region.routes.filter(tier=1).slice(0,4). حدّث الـ subtitle في HeroSearch باستخدام مسارات المنطقة.',
    file: '/features/premium/Dashboard.tsx',
    effort: 'XS',
    impact: 'H',
  },

  // ── HIGH ─────────────────────────────────────────────────────────────────────
  {
    id: 'g12',
    priority: 'high',
    status: 'partial',
    icon: Shield,
    category: 'Safety',
    title: 'ID verification gate bypassed in PostRide',
    titleAr: 'بوابة التحقق من الهوية مُعطَّلة في PostRide',
    problem: 'PostRide.tsx has a verification gate (`isVerified`) but the comment says "allow unverified in dev/demo mode so testing isn\'t blocked" — meaning unverified users can post rides in production. Trust is the #1 safety concern for a carpooling platform.',
    problemAr: 'PostRide.tsx لديها بوابة التحقق لكن التعليق يقول "اسمح لغير المتحقق في dev/demo mode" — أي المنصة الحية تقبل مسافرين غير موثّقين.',
    fix: 'Remove the `|| !profile` bypass. Check `profile?.phone_verified && profile?.id_verified`. In production: show a gate screen that redirects to /safety/identity-verification. Keep the bypass in an env flag `VITE_SKIP_VERIFICATION=true` for dev only.',
    fixAr: 'أزل الاستثناء || !profile. تحقق فعلياً من phone_verified و id_verified. اعرض شاشة توجيه للتحقق في الإنتاج. اربط الاستثناء بـ VITE_SKIP_VERIFICATION=true للتطوير فقط.',
    file: '/features/carpooling/PostRide.tsx line 122',
    effort: 'XS',
    impact: 'H',
  },
  {
    id: 'g14',
    priority: 'high',
    status: 'open',
    icon: Code2,
    category: 'Data / Backend',
    title: 'QUERY_KEYS from cacheStrategy.ts not wired into hooks',
    titleAr: 'QUERY_KEYS من cacheStrategy.ts غير مربوطة في الـ hooks',
    problem: 'cacheStrategy.ts defines centralised query keys and stale times, but useBookings.ts, useTrips.ts, useDashboardStats.ts, and useMyTrips.ts each define their own ad-hoc cache keys. Cache invalidation after mutations (booking, cancel, rate) is inconsistent — booking a seat doesn\'t refresh the dashboard stats.',
    problemAr: 'cacheStrategy.ts يعرّف مفاتيح الاستعلام المركزية لكن كل hook يعرّف مفاتيحه الخاصة. إلغاء الكاش بعد الطفرات (حجز، إلغاء، تقييم) غير متسق.',
    fix: 'Import QUERY_KEYS from cacheStrategy.ts into each hook. Replace ad-hoc string keys with QUERY_KEYS.trips, QUERY_KEYS.bookings, etc. Add `queryClient.invalidateQueries(QUERY_KEYS.dashboard)` after every mutation so all screens update immediately.',
    fixAr: 'استورد QUERY_KEYS في كل hook. استبدل مفاتيح السلاسل بـ QUERY_KEYS.trips و QUERY_KEYS.bookings. أضف invalidateQueries بعد كل طفرة.',
    file: '/utils/performance/cacheStrategy.ts → all hooks',
    effort: 'M',
    impact: 'M',
  },
  {
    id: 'g18',
    priority: 'high',
    status: 'open',
    icon: Calendar,
    category: 'Core Flow',
    title: 'No cancellation policy displayed to users',
    titleAr: 'سياسة إلغاء الرحلة غير معروضة للمستخدمين',
    problem: 'BookRide.tsx lets users confirm a booking with no mention of cancellation rules. Users don\'t know they may lose money if they cancel the day before. This is a primary source of disputes and chargebacks on similar platforms.',
    problemAr: 'BookRide.tsx يسمح بتأكيد الحجز دون ذكر سياسة الإلغاء. المستخدمون قد يخسرون المال دون علمهم. هذا مصدر رئيسي للنزاعات.',
    fix: 'Add an expandable CancellationPolicy accordion in BookRide step 1. Display: "Free until 24h before departure · 50% after · 0% on day-of". Link to /legal/terms. Require checkbox acceptance before proceeding to payment.',
    fixAr: 'أضف accordion لسياسة الإلغاء في الخطوة 1 من BookRide: "مجاني حتى 24 ساعة قبل · 50% بعده · لا استرداد في اليوم نفسه". اشترط تأشير خانة الموافقة.',
    file: '/features/carpooling/BookRide.tsx',
    effort: 'S',
    impact: 'M',
  },

  // ── MEDIUM ───────────────────────────────────────────────────────────────────
  {
    id: 'g17',
    priority: 'medium',
    status: 'partial',
    icon: Package,
    category: 'Brand',
    title: '"Raje3" brand survives in code comments',
    titleAr: 'علامة "راجع" لا تزال في تعليقات الكود',
    problem: 'Three places still reference the old Raje3 brand: (1) SendPackage.tsx header comment "Raje3 | راجع v5.0", (2) regionConfig.ts line 9 comment "Package delivery (Raje3) is ALWAYS secondary…", (3) /features/awasel/ folder (was /features/raje3/) — folder was renamed but some internal comments still say raje3.',
    problemAr: '3 أماكن لا تزال تذكر راجع: (1) تعليق SendPackage.tsx، (2) regionConfig.ts السطر 9، (3) تعليقات داخلية في المجلد.',
    fix: 'Update header comments in SendPackage.tsx and regionConfig.ts to say "Awasel | أوصل". Search for "raje3" (case-insensitive) across all .tsx and .ts files and replace with "awasel".',
    fixAr: 'حدّث تعليقات الرأس في SendPackage.tsx وregionConfig.ts. ابحث عن "raje3" (case-insensitive) وأبدله بـ "awasel".',
    file: '/features/awasel/SendPackage.tsx, /utils/regionConfig.ts',
    effort: 'XS',
    impact: 'L',
  },
  {
    id: 'g21',
    priority: 'medium',
    status: 'open',
    icon: Palette,
    category: 'Tokens / Design',
    title: 'Light mode broken — hardcoded dark backgrounds in 6 files',
    titleAr: 'الوضع الفاتح معطوب — خلفيات داكنة مشفّرة في 6 ملفات',
    problem: 'CSS tokens for light mode are fully applied. All 6 previously hardcoded files have been updated: Logo.tsx, ConnectionStatus.tsx, LandingPage.tsx, LiveTripMap.tsx, Messages.tsx, Sidebar.tsx. Light mode switching is now safe across all screens.',
    problemAr: 'CSS tokens للوضع الفاتح مطبّقة بالكامل. جميع الملفات الـ6 التي كانت تُثبّت خلفيات داكنة مباشرة تم تحديثها.',
    fix: 'All rgba(17,27,46,...) replaced with var(--wasel-glass-*) or var(--wasel-surface-*) tokens. All bg-[#111B2E] replaced with bg-card. Visual audit in light mode complete.',
    fixAr: 'تم استبدال جميع rgba(17,27,46,...) بـ var(--wasel-glass-*) أو var(--wasel-surface-*). تم استبدال جميع bg-[#111B2E] بـ bg-card.',
    file: 'Logo.tsx, ConnectionStatus.tsx, LandingPage.tsx, LiveTripMap.tsx, Messages.tsx, Sidebar.tsx',
    effort: 'M',
    impact: 'L',
  },

  // ── LOW ──────────────────────────────────────────────────────────────────────
  {
    id: 'g20',
    priority: 'low',
    status: 'fixed',
    icon: Calendar,
    category: 'Core Flow',
    title: 'No recurring ride posting ✅ Fixed',
    titleAr: 'نشر رحلات متكررة ✅ تم الإصلاح',
    problem: 'SchoolCarpooling and CorporateCarpools were built, but PostRide only supported single-date trips.',
    problemAr: 'PostRide كانت تدعم تاريخاً واحداً فقط.',
    fix: 'PostRide now has isRecurring toggle with daily/weekdays/weekly options. Backend receives recurring_pattern field.',
    fixAr: 'PostRide الآن لديها تبديل isRecurring مع خيارات daily/weekdays/weekly.',
    file: '/features/carpooling/PostRide.tsx',
    effort: 'L',
    impact: 'M',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 2 — NEW GAPS (not in original analysis)
  // ══════════════════════════════════════════════════════════════════════════

  {
    id: 'n1',
    priority: 'critical',
    status: 'fixed',
    icon: Bug,
    category: 'Infrastructure',
    title: 'MyTrips dynamic import URL proxy bug ✅ Fixed',
    titleAr: 'خطأ URL الاستيراد الديناميكي في MyTrips ✅ تم الإصلاح',
    problem: 'Figma Make\'s proxy was resolving the dynamic import for MyTrips with a /src/ prefix (/src/components/MyTrips.tsx) — a path that doesn\'t exist. safeLazy exhausted all 3 retries, LazyErrorBoundary caught the error and silently redirected home. My Trips page was unreachable.',
    problemAr: 'Figma Make كانت تحل مسار الاستيراد الديناميكي لـ MyTrips بـ /src/components/MyTrips.tsx (غير موجود). safeLazy استنفذت المحاولات، وLazyErrorBoundary تحويل صامت للرئيسية. صفحة رحلاتي كانت غير قابلة للوصول.',
    fix: 'Converted MyTrips to an eager (static) import in optimizedRoutes.tsx — bypasses the dynamic chunk URL resolution that Figma\'s proxy mangles.',
    fixAr: 'تم تحويل MyTrips إلى استيراد ثابت (eager) في optimizedRoutes.tsx — يتجاوز آلية الاستيراد الديناميكي التي يشوّهها وكيل Figma.',
    file: '/utils/optimizedRoutes.tsx',
    effort: 'XS',
    impact: 'H',
    isNew: true,
  },
  {
    id: 'n2',
    priority: 'high',
    status: 'open',
    icon: Route,
    category: 'Infrastructure',
    title: 'toRoutePath() missing 6 new service route mappings',
    titleAr: 'toRoutePath() لا يحتوي على 6 مسارات خدمات جديدة',
    problem: 'RootLayout.toRoutePath() has a `servicePages` Set that maps bare IDs like "school" → /app/services/school. But 6 new services added in Phase 4 are NOT in this set: school-carpooling, hospital-transport, corporate-carpools, smart-school-mobility, mobility-hubs, raje3-returns. Sidebar or code navigation using these IDs would route to /app/school-carpooling (wrong path) instead of /app/services/school-carpooling.',
    problemAr: 'RootLayout.toRoutePath() يحتوي على مجموعة servicePages لكنها لا تشمل 6 خدمات جديدة: school-carpooling، hospital-transport، corporate-carpools، smart-school-mobility، mobility-hubs، raje3-returns. التنقل بمعرّفاتها يؤدي إلى مسار خاطئ.',
    fix: 'Add these 6 IDs to the servicePages Set in RootLayout.tsx: "school-carpooling", "hospital-transport", "corporate-carpools", "smart-school-mobility", "mobility-hubs", "raje3-returns". Also add "mobility-os" since services/mobility-os is a valid child route.',
    fixAr: 'أضف هذه المعرّفات الستة إلى servicePages في RootLayout.tsx.',
    file: '/layouts/RootLayout.tsx — servicePages Set',
    effort: 'XS',
    impact: 'M',
    isNew: true,
  },
  {
    id: 'n3',
    priority: 'high',
    status: 'open',
    icon: Languages,
    category: 'RTL / i18n',
    title: 'rtl.* helpers not used — only 2 of 100+ components comply',
    titleAr: 'مساعدات rtl.* غير مستخدمة — فقط 2 من 100+ مكوّن ملتزم',
    problem: 'Guidelines mandate using `rtl.*` helpers from /utils/rtl.ts instead of inline `language === \'ar\'` conditionals. Only CulturalSettings.tsx and RealTimeAnalyticsDashboard.tsx actually import and use rtl.*. Every other component uses raw `language === \'ar\'` checks, `flex-row-reverse`, and manual `dir` attributes. This makes RTL state fragmented and hard to maintain.',
    problemAr: 'الإرشادات تلزم باستخدام مساعدات rtl.* من utils/rtl.ts. فقط CulturalSettings وRealTimeAnalyticsDashboard يستوردانها. بقية المكوّنات (100+) تستخدم language===\'ar\' المباشر وflex-row-reverse يدوياً.',
    fix: 'Priority targets: Dashboard.tsx, SearchRides.tsx, PostRide.tsx, BookRide.tsx, Messages.tsx, MyTrips.tsx, Sidebar.tsx. Replace `language === \'ar\' ? \'flex-row-reverse\' : \'flex-row\'` with `rtl.flex()`. Replace manual dir="" with `dir={dir}` from useLanguage(). Use `const { t, language, dir } = useLanguage()` pattern.',
    fixAr: 'الأهداف ذات الأولوية: Dashboard، SearchRides، PostRide، BookRide، Messages، MyTrips، Sidebar. استبدل الشروط المباشرة بـ rtl.flex() وrtl.text() وrtl.ml() وما إلى ذلك.',
    file: 'All feature components — priority: Dashboard, SearchRides, PostRide',
    effort: 'L',
    impact: 'M',
    isNew: true,
  },
  {
    id: 'n4',
    priority: 'medium',
    status: 'open',
    icon: Palette,
    category: 'Tokens / Design',
    title: 'WaselColors/WaselSpacing tokens used in only 1 component',
    titleAr: 'رموز WaselColors/WaselSpacing مستخدمة في مكوّن واحد فقط',
    problem: 'Guidelines mandate ALL visual values come from /tokens/wasel-tokens.ts (WaselColors, WaselSpacing, WaselRadius). Only CulturalSettings.tsx imports WaselColors. Every other component uses either raw hex strings in style={} props or Tailwind utility classes with hardcoded values. This makes global design updates (e.g. changing the primary cyan) require manual edits in 100+ files.',
    problemAr: 'الإرشادات تلزم بأن تأتي جميع القيم البصرية من tokens/wasel-tokens.ts. فقط CulturalSettings تستورد WaselColors. بقية المكوّنات تستخدم hex strings مباشرة في style props.',
    fix: 'Incremental migration: start with the 5 most-used files (Dashboard, SearchRides, PostRide, Sidebar, Messages). Import WaselColors and replace the C={} local constant pattern with WaselColors.*. The tokens are already well-defined in wasel-tokens.ts.',
    fixAr: 'هجرة تدريجية: ابدأ بـ 5 ملفات (Dashboard، SearchRides، PostRide، Sidebar، Messages). استورد WaselColors واستبدل ثوابت C={} المحلية بـ WaselColors.*.',
    file: '/tokens/wasel-tokens.ts → all feature components',
    effort: 'L',
    impact: 'M',
    isNew: true,
  },
  {
    id: 'n5',
    priority: 'medium',
    status: 'open',
    icon: Database,
    category: 'Data / Backend',
    title: 'No /conversations endpoint — Messages backend incomplete',
    titleAr: 'لا يوجد endpoint /conversations — الخادم غير مكتمل',
    problem: 'Messages.tsx needs to fetch the current user\'s conversations from a GET /conversations endpoint, but this endpoint does not exist in server/index.tsx. The messaging_service.tsx has sendMessage and getMessages but no listConversations function. Without this, g1 (real messaging) cannot be fixed.',
    problemAr: 'Messages.tsx تحتاج GET /conversations لكن هذا المسار غير موجود في server/index.tsx. messaging_service.tsx لديها sendMessage وgetMessages لكن لا listConversations.',
    fix: 'Add GET /make-server-0b1f4071/conversations to server/index.tsx. Use KV prefix scan: getByPrefix(`conversation:${userId}:`). Return a sorted list of {conversationId, otherUserId, otherUserName, lastMessage, lastMessageTime, unreadCount}. This unblocks g1.',
    fixAr: 'أضف GET /make-server-0b1f4071/conversations إلى server/index.tsx. استخدم KV prefix: getByPrefix(`conversation:{userId}:`). هذا يفتح إمكانية إصلاح g1.',
    file: '/supabase/functions/server/index.tsx + messaging_service.tsx',
    effort: 'M',
    impact: 'H',
    isNew: true,
  },
  {
    id: 'n6',
    priority: 'medium',
    status: 'open',
    icon: FileCode,
    category: 'Infrastructure',
    title: 'Sprint 1 deprecated files still on disk',
    titleAr: 'ملفات Sprint 1 المهجورة لا تزال على القرص',
    problem: 'Guidelines (Sprint 1) explicitly list files to DELETE: /features/trips/FindRide.tsx, /features/driver/RideRequests.tsx, /features/driver/HeatMap.tsx, /features/revenue/DynamicPricing.tsx, /features/premium/AIVoiceCommands.tsx, /features/premium/ARNavigation.tsx, /features/driver/DriverIncentives.tsx, /features/driver/QuestRewards.tsx. The driver/index.ts barrel confirms "deprecated features removed" but the feature index files still reference them as "previously deleted" — actual deletion was not verified.',
    problemAr: 'الإرشادات تطلب صراحةً حذف ملفات محددة (FindRide، RideRequests، HeatMap، DynamicPricing...) لكن لم يتم التحقق من الحذف الفعلي.',
    fix: 'Run a check for each file in the delete list. Use delete_tool to remove any that still exist. Update the feature index barrels to stop referencing deleted files. Confirm /features/trips/ only contains index.ts.',
    fixAr: 'تحقق من كل ملف في قائمة الحذف. استخدم delete_tool لإزالة أي ملفات لا تزال موجودة. حدّث ملفات index البرميلية.',
    file: 'See Guidelines.md → "What to Remove" list',
    effort: 'XS',
    impact: 'L',
    isNew: true,
  },
  {
    id: 'n7',
    priority: 'low',
    status: 'open',
    icon: Globe,
    category: 'Regional',
    title: 'HeroSearch subtitle still hardcodes Jordan cities',
    titleAr: 'الـ subtitle في HeroSearch لا يزال يُثبّت مدن أردنية',
    problem: 'Dashboard.tsx HeroSearch component (line 152) hardcodes "Aqaba · Irbid · Petra · Dead Sea" in English and "عقبة · إربد · البتراء · البحر الميت" in Arabic. This is rendered below the search bar for all users regardless of country.',
    problemAr: 'Dashboard.tsx HeroSearch السطر 152 يُثبّت "عقبة · إربد · البتراء · البحر الميت" لجميع المستخدمين بغض النظر عن دولتهم.',
    fix: 'Replace the hardcoded string with: `region.routes.filter(r => r.tier === 1).slice(0, 4).map(r => ar ? r.toAr : r.to).join(" · ")`',
    fixAr: 'استبدل السلسلة الثابتة بـ: region.routes.filter(tier=1).slice(0,4).map(r => ar ? r.toAr : r.to).join(" · ")',
    file: '/features/premium/Dashboard.tsx — HeroSearch component',
    effort: 'XS',
    impact: 'L',
    isNew: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SECTION 3 — ORIGINAL GAPS CONFIRMED FIXED (for audit completeness)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'g2-fixed',
    priority: 'critical',
    status: 'fixed',
    icon: MapPin,
    category: 'Regional',
    title: 'PostRide routes — regionConfig ✅',
    titleAr: 'مسارات PostRide — regionConfig ✅',
    problem: 'PostRide.tsx had a static ROUTES array with 6 Jordan-only routes.',
    problemAr: 'PostRide.tsx كانت تحتوي على مصفوفة ROUTES ثابتة بـ 6 مسارات أردنية.',
    fix: 'Now uses useCountry() + getRegion() to generate dynamic routes per country. Confirmed in PostRide.tsx line 107–118.',
    fixAr: 'الآن تستخدم useCountry() + getRegion() لتوليد مسارات ديناميكية.',
    file: '/features/carpooling/PostRide.tsx',
    effort: 'S',
    impact: 'H',
  },
  {
    id: 'g3-fixed',
    priority: 'critical',
    status: 'fixed',
    icon: Wallet,
    category: 'Core Flow',
    title: 'TravelerEarnings screen ✅',
    titleAr: 'شاشة مكاسب المسافر ✅',
    problem: 'No screen to show driver earnings after trip completion.',
    problemAr: 'لم يكن هناك شاشة لعرض مكاسب المسافر.',
    fix: '/features/carpooling/TravelerEarnings.tsx created. Route at /app/my-earnings.',
    fixAr: 'تم إنشاء /features/carpooling/TravelerEarnings.tsx.',
    file: '/features/carpooling/TravelerEarnings.tsx',
    effort: 'M',
    impact: 'H',
  },
  {
    id: 'g4-fixed',
    priority: 'critical',
    status: 'fixed',
    icon: Star,
    category: 'Core Flow',
    title: 'Post-trip rating trigger ✅',
    titleAr: 'تشغيل تقييم ما بعد الرحلة ✅',
    problem: 'RatingDialog.tsx existed but was never triggered from MyTrips.',
    problemAr: 'RatingDialog.tsx كانت موجودة لكنها لم تُطلق من MyTrips.',
    fix: 'MyTrips.tsx now has RatingModal + auto-prompt for unrated completed trips. Submit wired to PATCH /rides/rate.',
    fixAr: 'MyTrips.tsx تحتوي الآن على RatingModal وطلب تلقائي للرحلات غير المقيَّمة.',
    file: '/components/MyTrips.tsx',
    effort: 'S',
    impact: 'H',
  },
  {
    id: 'g6-fixed',
    priority: 'critical',
    status: 'fixed',
    icon: Package,
    category: 'Data / Backend',
    title: 'accept_packages toggle in PostRide ✅',
    titleAr: 'تبديل accept_packages في PostRide ✅',
    problem: 'PostRide never set accept_packages flag, so AvailablePackages always showed empty.',
    problemAr: 'PostRide لم تُعيّن accept_packages، فكانت AvailablePackages فارغة دائماً.',
    fix: 'PostRide now has acceptPackages field in form state, defaulting to route.packageEnabled. Sent as accept_packages in POST /trips payload.',
    fixAr: 'PostRide الآن تحتوي على acceptPackages في حالة النموذج، ترسل accept_packages في الحمولة.',
    file: '/features/carpooling/PostRide.tsx',
    effort: 'XS',
    impact: 'H',
  },
  {
    id: 'g7-fixed',
    priority: 'high',
    status: 'fixed',
    icon: TrendingUp,
    category: 'UX / Search',
    title: 'Search state persisted across navigation ✅',
    titleAr: 'حالة البحث محفوظة عبر التنقل ✅',
    problem: 'User searched Amman → Aqaba, clicked a ride, pressed back — all fields reset.',
    problemAr: 'المستخدم يبحث ثم يرجع — كل شيء يُعاد تعيينه.',
    fix: 'SearchRides.tsx now saves state to sessionStorage on every change. Restores on mount.',
    fixAr: 'SearchRides.tsx تحفظ الحالة في sessionStorage عند كل تغيير.',
    file: '/features/carpooling/SearchRides.tsx',
    effort: 'S',
    impact: 'H',
  },
  {
    id: 'g8-fixed',
    priority: 'high',
    status: 'fixed',
    icon: Bell,
    category: 'Notifications',
    title: 'Booking notification to traveler ✅',
    titleAr: 'إشعار الحجز للمسافر ✅',
    problem: 'No notification sent to trip poster when a seat was booked.',
    problemAr: 'لم يُرسَل إشعار لناشر الرحلة عند حجز مقعد.',
    fix: 'BookRide.tsx now calls POST /notifications after successful booking with type: "new_booking".',
    fixAr: 'BookRide.tsx تستدعي POST /notifications بعد نجاح الحجز.',
    file: '/features/carpooling/BookRide.tsx',
    effort: 'XS',
    impact: 'H',
  },
  {
    id: 'g9-fixed',
    priority: 'high',
    status: 'fixed',
    icon: Share2,
    category: 'Growth',
    title: 'WhatsApp share on ride ✅',
    titleAr: 'مشاركة الرحلة عبر واتساب ✅',
    problem: 'No WhatsApp sharing on RideDetails.',
    problemAr: 'لم تكن هناك مشاركة عبر واتساب في RideDetails.',
    fix: 'RideDetails.tsx has buildShareLink() + wa.me deep link button. Also available on BookRide confirmation.',
    fixAr: 'RideDetails.tsx لديها buildShareLink() وزر رابط wa.me.',
    file: '/features/carpooling/RideDetails.tsx',
    effort: 'S',
    impact: 'H',
  },
  {
    id: 'g10-fixed',
    priority: 'high',
    status: 'fixed',
    icon: ArrowRight,
    category: 'Core Flow',
    title: 'Round-trip ride posting ✅',
    titleAr: 'نشر رحلة ذهاب وعودة ✅',
    problem: 'PostRide only supported one-way trips.',
    problemAr: 'PostRide كانت تدعم الاتجاه الواحد فقط.',
    fix: 'PostRide now has isRoundTrip toggle. Creates 2 linked trips (outbound + return) in one form submission.',
    fixAr: 'PostRide الآن لديها تبديل isRoundTrip. تُنشئ رحلتين مرتبطتين.',
    file: '/features/carpooling/PostRide.tsx',
    effort: 'M',
    impact: 'H',
  },
  {
    id: 'g11-fixed',
    priority: 'high',
    status: 'fixed',
    icon: Wallet,
    category: 'Payments',
    title: 'CostSharing fuel price uses regionConfig ✅',
    titleAr: 'سعر الوقود في CostSharing يستخدم regionConfig ✅',
    problem: 'CostSharing hardcoded JOD 0.90/L fuel price.',
    problemAr: 'CostSharing كانت تُثبّت 0.90 د.أ/ل.',
    fix: 'CostSharing now uses useCountry() + getRegion() for region.fuel.priceInJOD.',
    fixAr: 'CostSharing الآن تستخدم region.fuel.priceInJOD.',
    file: '/features/payments/CostSharing.tsx',
    effort: 'XS',
    impact: 'M',
  },
  {
    id: 'g13-fixed',
    priority: 'high',
    status: 'fixed',
    icon: RefreshCw,
    category: 'Data / Backend',
    title: 'RecommendedForYou connected to backend ✅',
    titleAr: 'RecommendedForYou متصلة بالخادم ✅',
    problem: 'RecommendedForYou rendered 3 hardcoded recommendation cards.',
    problemAr: 'RecommendedForYou كانت تعرض 3 توصيات مشفّرة.',
    fix: 'Now fetches from GET /trips?limit=5&status=active with regional fallback static data.',
    fixAr: 'الآن تجلب من GET /trips?limit=5&status=active مع بيانات احتياطية إقليمية.',
    file: '/features/carpooling/RecommendedForYou.tsx',
    effort: 'S',
    impact: 'M',
  },
  {
    id: 'g15-fixed',
    priority: 'medium',
    status: 'fixed',
    icon: Calendar,
    category: 'UX / Search',
    title: 'Add to Calendar on booking confirmation ✅',
    titleAr: 'أضف إلى التقويم عند تأكيد الحجز ✅',
    problem: 'No "Add to Calendar" button on BookRide confirmation.',
    problemAr: 'لم يكن هناك زر "أضف للتقويم" في تأكيد الحجز.',
    fix: 'BookRide confirmation now shows Google Calendar deep-link + WhatsApp share buttons.',
    fixAr: 'تأكيد الحجز يحتوي الآن على رابط Google Calendar + مشاركة واتساب.',
    file: '/features/carpooling/BookRide.tsx',
    effort: 'XS',
    impact: 'M',
  },
  {
    id: 'g16-fixed',
    priority: 'medium',
    status: 'fixed',
    icon: TrendingUp,
    category: 'Payments',
    title: 'Wasel Plus 10% discount applied ✅',
    titleAr: 'خصم واصل بلس 10% مطبّق ✅',
    problem: 'BookRide never checked subscription tier.',
    problemAr: 'BookRide لم تتحقق من مستوى الاشتراك.',
    fix: 'BookRide checks profile.subscription_tier. If "plus", applies 0.9 multiplier. Line item shown in cost breakdown.',
    fixAr: 'BookRide تتحقق من profile.subscription_tier. تطبّق معامل 0.9 إذا "plus".',
    file: '/features/carpooling/BookRide.tsx',
    effort: 'S',
    impact: 'M',
  },
  {
    id: 'g19-fixed',
    priority: 'medium',
    status: 'fixed',
    icon: Zap,
    category: 'UX / Search',
    title: 'Observability Dashboard built ✅',
    titleAr: 'لوحة المراقبة مبنية ✅',
    problem: 'observability.ts collected metrics but no UI existed.',
    problemAr: 'observability.ts تجمع المقاييس لكن لا واجهة موجودة.',
    fix: '/features/admin/ObservabilityDashboard.tsx created with latency charts, error rates, trip funnel, live error log.',
    fixAr: 'ObservabilityDashboard.tsx مبني مع مخططات الكمون، معدلات الأخطاء، قمع الرحلات.',
    file: '/features/admin/ObservabilityDashboard.tsx',
    effort: 'M',
    impact: 'M',
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

type PriorityFilter = Priority | 'all';
type StatusFilter   = Status   | 'all';

const PRIORITY_CONFIG: Record<Priority, { label: string; labelAr: string; color: string; bg: string; icon: React.ComponentType<any> }> = {
  critical: { label: 'Critical', labelAr: 'حرج',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   icon: XCircle },
  high:     { label: 'High',     labelAr: 'عالي',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  icon: AlertTriangle },
  medium:   { label: 'Medium',   labelAr: 'متوسط',  color: '#04ADBF', bg: 'rgba(4,173,191,0.08)',   icon: ArrowRight },
  low:      { label: 'Low',      labelAr: 'منخفض',  color: '#64748B', bg: 'rgba(100,116,139,0.08)', icon: CheckCircle2 },
};

const STATUS_CONFIG: Record<Status, { label: string; labelAr: string; color: string; icon: React.ComponentType<any> }> = {
  open:    { label: 'Open',    labelAr: 'مفتوحة',  color: '#EF4444', icon: XCircle     },
  partial: { label: 'Partial', labelAr: 'جزئي',    color: '#F59E0B', icon: AlertTriangle },
  fixed:   { label: 'Fixed',   labelAr: 'مُصلَح',   color: '#22C55E', icon: CheckCheck  },
};

const EFFORT_COLOR: Record<Effort, string> = {
  XS: '#22C55E', S: '#ABD907', M: '#F59E0B', L: '#EF4444', XL: '#8B5CF6',
};
const IMPACT_COLOR: Record<Impact, string> = {
  H: '#22C55E', M: '#F59E0B', L: '#64748B',
};

// ─── Gap Card ─────────────────────────────────────────────────────────────────

function GapCard({ gap, ar }: { gap: Gap; ar: boolean }) {
  const [open, setOpen] = useState(false);
  const pc = PRIORITY_CONFIG[gap.priority];
  const sc = STATUS_CONFIG[gap.status];
  const PIcon = pc.icon;
  const SIcon = sc.icon;

  const isFixed = gap.status === 'fixed';

  return (
    <motion.div
      whileHover={isFixed ? {} : { scale: 1.002 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: isFixed ? 'var(--wasel-glass-sm)' : 'var(--wasel-glass-lg)',
        border: `1px solid ${isFixed ? '#22C55E18' : pc.color + '18'}`,
        opacity: isFixed ? 0.7 : 1,
      }}>
      <button className="w-full p-4 text-start" onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${isFixed ? '#22C55E' : pc.color}12`, border: `1px solid ${isFixed ? '#22C55E' : pc.color}22` }}>
            <gap.icon size={16} style={{ color: isFixed ? '#22C55E' : pc.color }} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: pc.bg, color: pc.color }}>
                <PIcon size={9} />
                {ar ? pc.labelAr : pc.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${sc.color}12`, color: sc.color, border: `1px solid ${sc.color}25` }}>
                <SIcon size={9} />
                {ar ? sc.labelAr : sc.label}
              </span>
              {gap.isNew && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider"
                  style={{ background: 'rgba(0,200,232,0.12)', color: '#00C8E8', border: '1px solid rgba(0,200,232,0.25)' }}>
                  NEW
                </span>
              )}
            </div>
            {/* Title */}
            <p className="text-sm font-bold leading-snug" style={{ color: isFixed ? '#64748B' : 'rgba(255,255,255,0.95)' }}>
              {ar ? gap.titleAr : gap.title}
            </p>
          </div>

          {/* Effort / Impact + chevron */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-mono font-bold" style={{ color: EFFORT_COLOR[gap.effort] }}>
                {ar ? 'جهد' : 'Eff'} {gap.effort}
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: IMPACT_COLOR[gap.impact] }}>
                {ar ? 'أثر' : 'Imp'} {gap.impact}
              </span>
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} className="text-slate-500 mt-0.5" />
            </motion.div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="pt-3 space-y-3">
                {/* Problem */}
                <div>
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: '#EF4444' }}>
                    <XCircle size={10} /> {ar ? 'المشكلة' : 'Problem'}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
                    {ar ? gap.problemAr : gap.problem}
                  </p>
                </div>
                {/* Fix */}
                <div>
                  <p className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: '#22C55E' }}>
                    <CheckCircle2 size={10} /> {ar ? 'الحل' : 'Fix'}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
                    {ar ? gap.fixAr : gap.fix}
                  </p>
                </div>
                {/* File */}
                {gap.file && (
                  <div className="px-3 py-2 rounded-lg text-xs font-mono"
                    style={{ background: 'rgba(4,173,191,0.07)', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.15)' }}>
                    📁 {gap.file}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function GapAnalysis() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter,   setStatusFilter]   = useState<StatusFilter>('open');
  const [showFixed, setShowFixed] = useState(false);

  const openGaps    = GAPS.filter(g => g.status !== 'fixed');
  const fixedGaps   = GAPS.filter(g => g.status === 'fixed');
  const newGaps     = GAPS.filter(g => g.isNew && g.status !== 'fixed');
  const partialGaps = GAPS.filter(g => g.status === 'partial');

  const filtered = GAPS.filter(g => {
    const matchPriority = priorityFilter === 'all' || g.priority === priorityFilter;
    const matchStatus   = statusFilter   === 'all' || g.status   === statusFilter;
    return matchPriority && matchStatus;
  });

  const criticalOpen  = GAPS.filter(g => g.priority === 'critical' && g.status !== 'fixed').length;
  const highOpen      = GAPS.filter(g => g.priority === 'high'     && g.status !== 'fixed').length;
  const mediumOpen    = GAPS.filter(g => g.priority === 'medium'   && g.status !== 'fixed').length;
  const lowOpen       = GAPS.filter(g => g.priority === 'low'      && g.status !== 'fixed').length;

  const effortToSprint: Record<Effort, number> = { XS: 0.5, S: 1, M: 2, L: 5, XL: 10 };
  const totalDays = openGaps
    .filter(g => g.priority === 'critical' || g.priority === 'high')
    .reduce((acc, g) => acc + effortToSprint[g.effort], 0);

  return (
    <div className="min-h-screen pb-24" style={{ background: '#0B1120', direction: ar ? 'rtl' : 'ltr' }}>

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 px-4"
        style={{ background: 'rgba(11,17,32,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-2xl mx-auto py-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-lg font-black text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                {ar ? 'تحليل الثغرات الشامل' : 'Full Gap Analysis'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {ar ? 'محدّث 13 مارس 2026 · يتتبع الثغرات المُصلَحة والمفتوحة والجديدة' : 'Updated Mar 13, 2026 · tracks fixed, open & newly discovered gaps'}
              </p>
            </div>
            <div className="text-end">
              <div className="text-xl font-black text-red-400">{openGaps.length}</div>
              <div className="text-xs text-slate-500">{ar ? 'مفتوحة' : 'open'}</div>
            </div>
          </div>

          {/* Status filter */}
          <div className="flex gap-1.5 flex-wrap">
            {([
              { id: 'open',    label: ar ? 'مفتوحة' : 'Open',    count: openGaps.length,    color: '#EF4444' },
              { id: 'partial', label: ar ? 'جزئي'   : 'Partial', count: partialGaps.length, color: '#F59E0B' },
              { id: 'fixed',   label: ar ? 'مُصلَح'  : 'Fixed',   count: fixedGaps.length,   color: '#22C55E' },
              { id: 'all',     label: ar ? 'الكل'   : 'All',     count: GAPS.length,        color: '#64748B' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setStatusFilter(t.id as StatusFilter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: statusFilter === t.id ? `${t.color}18` : 'transparent',
                  color: statusFilter === t.id ? t.color : '#64748B',
                  border: statusFilter === t.id ? `1px solid ${t.color}35` : '1px solid transparent',
                }}>
                {t.label}
                <span className="text-xs px-1.5 py-0.5 rounded-full font-black"
                  style={{ background: statusFilter === t.id ? t.color : 'rgba(255,255,255,0.07)', color: statusFilter === t.id ? '#fff' : '#94A3B8' }}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex gap-1.5 flex-wrap mt-2">
            {([
              { id: 'all',      label: ar ? 'الكل'   : 'All',      color: '#64748B' },
              { id: 'critical', label: ar ? 'حرج'    : 'Critical', color: '#EF4444' },
              { id: 'high',     label: ar ? 'عالي'   : 'High',     color: '#F59E0B' },
              { id: 'medium',   label: ar ? 'متوسط'  : 'Medium',   color: '#04ADBF' },
              { id: 'low',      label: ar ? 'منخفض'  : 'Low',      color: '#64748B' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setPriorityFilter(t.id as PriorityFilter)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: priorityFilter === t.id ? `${t.color}15` : 'rgba(255,255,255,0.04)',
                  color: priorityFilter === t.id ? t.color : '#64748B',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: ar ? 'حرج مفتوح'  : 'Critical open', count: criticalOpen, color: '#EF4444' },
            { label: ar ? 'عالي مفتوح'  : 'High open',     count: highOpen,    color: '#F59E0B' },
            { label: ar ? 'ثغرات جديدة' : 'New gaps',      count: newGaps.length, color: '#00C8E8' },
            { label: ar ? 'تم إصلاحه'   : 'Fixed',         count: fixedGaps.length, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="p-3 rounded-xl text-center"
              style={{ background: 'var(--wasel-glass-lg)', border: `1px solid ${s.color}20` }}>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.count}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Estimated remaining effort */}
        {openGaps.length > 0 && (
          <div className="p-4 rounded-2xl flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.06))', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div>
              <p className="text-sm font-bold text-white">⏱️ {ar ? 'جهد الإصلاح المتبقي (حرج + عالي)' : 'Remaining fix effort (Critical + High)'}</p>
              <p className="text-xs text-slate-400 mt-0.5">{ar ? 'تقدير متحفظ لمطوّر واحد' : 'Conservative estimate, 1 developer'}</p>
            </div>
            <div className="text-end flex-shrink-0">
              <div className="text-2xl font-black text-amber-400">~{totalDays}{ar ? 'ي' : 'd'}</div>
              <div className="text-xs text-slate-500">{ar ? 'تقريباً' : '~{Math.ceil(totalDays / 10)} sprint(s)'}</div>
            </div>
          </div>
        )}

        {/* Gap list */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-white font-bold">{ar ? 'لا توجد ثغرات في هذه التصفية' : 'No gaps match this filter'}</p>
            </div>
          ) : (
            filtered
              .sort((a, b) => {
                const pOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
                const sOrder: Record<Status, number>   = { open: 0, partial: 1, fixed: 2 };
                if (sOrder[a.status] !== sOrder[b.status]) return sOrder[a.status] - sOrder[b.status];
                return pOrder[a.priority] - pOrder[b.priority];
              })
              .map(gap => <GapCard key={gap.id} gap={gap} ar={ar} />)
          )}
        </div>

        {/* Sprint roadmap for remaining open gaps */}
        {statusFilter !== 'fixed' && (
          <div className="rounded-2xl p-5"
            style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-black text-white mb-4">
              {ar ? '🗓️ خارطة طريق الإصلاح المقترحة' : '🗓️ Suggested Fix Roadmap'}
            </h3>
            <div className="space-y-3">
              {[
                {
                  sprint: ar ? 'الآن — 30 دقيقة' : 'Now — 30 min',
                  color: '#EF4444',
                  items: ar
                    ? ['Dashboard destinations من regionConfig (XS)', 'HeroSearch subtitle ديناميكي (XS)', 'toRoutePath() servicePages جديدة (XS)', 'ID verification gate إزالة bypass (XS)']
                    : ['Dashboard destinations from regionConfig (XS)', 'HeroSearch dynamic subtitle (XS)', 'toRoutePath() add new servicePages (XS)', 'Remove ID verification bypass (XS)'],
                },
                {
                  sprint: ar ? 'هذا الأسبوع — يوم 1-3' : 'This week — days 1–3',
                  color: '#F59E0B',
                  items: ar
                    ? ['إضافة /conversations endpoint للخادم (M)', 'ربط قائمة المحادثات بالخادم (M)', 'سياسة إلغاء الرحلة في BookRide (S)', 'هجرة QUERY_KEYS (M)']
                    : ['Add /conversations endpoint (M)', 'Wire Messages.tsx to backend (M)', 'Cancellation policy in BookRide (S)', 'Migrate QUERY_KEYS (M)'],
                },
                {
                  sprint: ar ? 'هذا الشهر — Sprint RTL/Design' : 'This month — RTL / Design sprint',
                  color: '#04ADBF',
                  items: ar
                    ? ['هجرة rtl.* في 5 مكوّنات رئيسية (L)', 'هجرة WaselColors في 5 مكوّنات (L)', 'إصلاح الوضع الفاتح — خلفيات مشفّرة (M)', 'إتمام إعادة تسمية Awasel (XS)']
                    : ['rtl.* migration in 5 core components (L)', 'WaselColors migration in 5 components (L)', 'Light mode fix — hardcoded dark BGs (M)', 'Complete Awasel rename (XS)'],
                },
              ].map(s => (
                <div key={s.sprint} className="p-3 rounded-xl" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                  <p className="text-xs font-black mb-2" style={{ color: s.color }}>{s.sprint}</p>
                  <div className="space-y-1">
                    {s.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-xs text-slate-300">
                        <span style={{ color: s.color }} className="flex-shrink-0 mt-0.5">›</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GapAnalysis;