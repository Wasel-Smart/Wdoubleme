/**
 * DualBrandHub — Wasel | واصل  &  Awasel | أوصل
 *
 * Dual-Brand Architecture:
 *   ┌──────────────────────────────────────────────────┐
 *   │  Wasel | واصل          Awasel | أوصل             │
 *   │  Long-Distance         Package Delivery           │
 *   │  Carpooling            via Travelers              │
 *   │  "شارك الرحلة"         "ابعث مع واحد رايح"       │
 *   └──────────────────────────────────────────────────┘
 *
 * Two distinct brands sharing one platform, one community,
 * one trust layer, one payment system.
 *
 * TASK 4 (embedded): Cultural features surfaced in core flow.
 */

import { useNavigate } from 'react-router';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveService = 'wasel' | 'awasel';

interface NamingConvention {
  old: string;
  new: string;
  reason: string;
  reasonAr: string;
}

interface CulturalFilter {
  id: string;
  icon: string;
  label: string;
  labelAr: string;
  color: string;
  route: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAMING_CONVENTIONS: NamingConvention[] = [
  {
    old: 'Raje3 | راجع',
    new: 'Awasel | أوصل',
    reason: 'Memorable rhyming pair: Wasel ↔ Awasel (Arabic poetry & rhythm)',
    reasonAr: 'زوج متناسق: واصل ↔ أوصل (إيقاع عربي سهل الحفظ)',
  },
  {
    old: 'Wasel Ride / Wasel Send',
    new: 'Wasel + Awasel',
    reason: 'Two distinct brands, stronger recall than sub-service labels',
    reasonAr: 'علامتان مستقلتان أقوى من تصنيفات خدمة فرعية',
  },
  {
    old: 'FindRide',
    new: 'Search Rides',
    reason: 'Carpooling search, not on-demand hailing',
    reasonAr: 'بحث عن ترحال مشترك، لا طلب فوري',
  },
  {
    old: 'DriverDashboard',
    new: 'Traveler Dashboard',
    reason: 'Users are travelers sharing cost, not gig workers',
    reasonAr: 'المستخدمون مسافرون يتشاركون التكلفة',
  },
  {
    old: 'DynamicPricing',
    new: 'Cost Calculator',
    reason: 'Fixed cost-sharing, no surge pricing',
    reasonAr: 'تكلفة مشتركة ثابتة، لا أسعار متغيرة',
  },
  {
    old: 'Driver / Rider',
    new: 'Traveler / Passenger',
    reason: 'Community-first language, not taxi/gig language',
    reasonAr: 'لغة المجتمع أولاً، ليست لغة التاكسي',
  },
];

const CULTURAL_FILTERS: CulturalFilter[] = [
  { id: 'women_only', icon: '🛡️', label: 'Women-Only Rides', labelAr: 'رحلات نساء فقط', color: '#EC4899', route: '/app/cultural/gender' },
  { id: 'prayer',     icon: '🕌', label: 'Prayer Stops',      labelAr: 'توقفات الصلاة',  color: '#04ADBF', route: '/app/cultural/prayer-stops' },
  { id: 'ramadan',    icon: '🌙', label: 'Ramadan Mode',      labelAr: 'وضع رمضان',      color: '#8B5CF6', route: '/app/cultural/ramadan' },
  { id: 'family',     icon: '👨‍👩‍👧', label: 'Family Rides',    labelAr: 'رحلات عائلية',   color: '#F59E0B', route: '/app/cultural/gender' },
];

const WASEL_ROUTES = [
  { from: 'Amman', fromAr: 'عمّان', to: 'Aqaba',    toAr: 'العقبة',      icon: '🏖️', price: 10, seats: 3, color: '#04ADBF' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Irbid',    toAr: 'إربد',        icon: '🎓', price: 5,  seats: 2, color: '#09732E' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Dead Sea', toAr: 'البحر الميت', icon: '🌊', price: 6,  seats: 4, color: '#0EA5E9' },
  { from: 'Amman', fromAr: 'عمّان', to: 'Petra',    toAr: 'البتراء',     icon: '🏛️', price: 12, seats: 1, color: '#D9965B' },
];

const AWASEL_PACKAGES = [
  { icon: '📦', label: 'Small Box',      labelAr: 'صندوق صغير',  weight: '< 2 kg',   price: 3, color: '#04ADBF' },
  { icon: '🛍️', label: 'Medium Parcel',  labelAr: 'طرد متوسط',   weight: '2–5 kg',   price: 5, color: '#ABD907' },
  { icon: '🧳', label: 'Large Bag',      labelAr: 'حقيبة كبيرة', weight: '5–15 kg',  price: 8, color: '#D9965B' },
  { icon: '📋', label: 'Documents',      labelAr: 'وثائق',        weight: '< 0.5 kg', price: 2, color: '#3B82F6' },
];

// ─── Brand Card ───────────────────────────────────────────────────────────────

function BrandCard({
  brandEn, brandAr, taglineEn, taglineAr,
  icon: Icon, color, accentBg, stats, active, onClick,
}: {
  brandEn: string;   brandAr: string;
  taglineEn: string; taglineAr: string;
  icon: React.ComponentType<any>;
  color: string;     accentBg: string;
  stats: { label: string; labelAr: string; value: string }[];
  active: boolean;
  onClick: () => void;
}) {
  const { language } = useLanguage();
  const ar = language === 'ar';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className="relative w-full text-start p-5 rounded-2xl overflow-hidden transition-all"
      style={{
        background: active ? accentBg : 'var(--wasel-glass-lg)',
        border: `2px solid ${active ? color : 'rgba(255,255,255,0.07)'}`,
        boxShadow: active ? `0 0 40px ${color}25` : 'none',
      }}
    >
      {active && (
        <motion.div className="absolute top-3 end-3" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: color }}>
            <Check size={13} className="text-white" />
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1.5px solid ${color}35` }}
        >
          <Icon size={26} style={{ color }} />
        </div>
        <div>
          {/* Dual-language brand name */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-white" style={{ letterSpacing: '-0.02em' }}>
              {ar ? brandAr : brandEn}
            </span>
            <span className="text-sm font-bold opacity-50 text-white">
              {ar ? brandEn : brandAr}
            </span>
          </div>
          <p className="text-xs mt-0.5 font-medium" style={{ color }}>
            {ar ? taglineAr : taglineEn}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="text-center py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-sm font-black text-white">{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{ar ? s.labelAr : s.label}</div>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function UnifiedPlatformHub() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [activeService, setActiveService] = useState<ActiveService>('wasel');
  const [showNaming, setShowNaming] = useState(false);

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0B1120', direction: ar ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe"
        style={{
          background: 'rgba(11,17,32,0.94)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-2xl mx-auto py-4">
          <div className="flex items-start justify-between">
            <div>
              {/* Dual brand name display */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xl font-black text-white">واصل</span>
                <span className="text-xl font-black" style={{ color: '#04ADBF' }}>Wasel</span>
                <span className="text-slate-600 mx-1 font-light">×</span>
                <span className="text-xl font-black text-white">أوصل</span>
                <span className="text-xl font-black" style={{ color: '#D9965B' }}>Awasel</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {ar
                  ? 'علامتان · منصة واحدة · مجتمع واحد'
                  : 'Two Brands · One Platform · One Community'}
              </p>
            </div>
            <button
              onClick={() => setShowNaming(!showNaming)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
              style={{
                background: showNaming ? 'rgba(217,150,91,0.15)' : 'rgba(255,255,255,0.06)',
                color: showNaming ? '#D9965B' : '#64748B',
                border: `1px solid ${showNaming ? 'rgba(217,150,91,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <Hash size={11} />
              {ar ? 'التسمية' : 'Naming'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* ── Architecture Visual ───────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(4,173,191,0.08), rgba(217,150,91,0.06))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <p className="text-xs text-slate-500 mb-4 font-medium uppercase tracking-wider">
            {ar ? 'هيكل العلامتين التجاريتين' : 'Dual-Brand Platform Architecture'}
          </p>

          {/* Visual tree */}
          <div className="flex flex-col items-center gap-0">
            {/* Platform root */}
            <div
              className="px-6 py-2.5 rounded-xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #04ADBF 0%, #09732E 50%, #D9965B 100%)' }}
            >
              {ar ? 'المنصة الموحدة' : 'One Platform'}
            </div>
            {/* Connector */}
            <div className="flex gap-20 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-slate-600" />
              <div className="absolute top-4 left-[25%] right-[25%] h-px bg-slate-600" />
              <div className="absolute top-4 left-[25%] w-px h-3 bg-slate-600" />
              <div className="absolute top-4 right-[25%] w-px h-3 bg-slate-600" />
              <div className="h-7" />
            </div>

            <div className="flex gap-4 w-full">
              {/* Wasel */}
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full py-3 px-3 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(4,173,191,0.18), rgba(4,173,191,0.06))',
                    border: '2px solid rgba(4,173,191,0.4)',
                  }}
                >
                  <div className="text-2xl mb-1">🚗</div>
                  <div className="font-black text-white text-base" style={{ letterSpacing: '-0.02em' }}>
                    واصل
                  </div>
                  <div className="font-black text-xs" style={{ color: '#04ADBF' }}>Wasel</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {ar ? 'ترحال مشترك' : 'Carpooling'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">50–500 km</div>
                </div>
                <p className="text-xs text-center text-slate-500 px-2">
                  {ar ? '"شارك الرحلة، وفّر المصاري"' : '"Share the Journey, Share the Cost"'}
                </p>
              </div>

              {/* Awasel */}
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full py-3 px-3 rounded-2xl text-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(217,150,91,0.18), rgba(217,150,91,0.06))',
                    border: '2px solid rgba(217,150,91,0.4)',
                  }}
                >
                  <div className="text-2xl mb-1">📦</div>
                  <div className="font-black text-white text-base" style={{ letterSpacing: '-0.02em' }}>
                    أوصل
                  </div>
                  <div className="font-black text-xs" style={{ color: '#D9965B' }}>Awasel</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {ar ? 'توصيل الطرود' : 'Package Delivery'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ar ? 'عبر المسافرين' : 'via Travelers'}
                  </div>
                </div>
                <p className="text-xs text-center text-slate-500 px-2">
                  {ar ? '"ابعث مع واحد رايح"' : '"Send with Someone Already Going"'}
                </p>
              </div>
            </div>
          </div>

          {/* Why dual brand */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[
              { icon: '🎯', text: ar ? 'إيقاع عربي: واصل ↔ أوصل' : 'Arabic rhyme: Wasel ↔ Awasel' },
              { icon: '🧠', text: ar ? 'سهل الحفظ في المنطقة' : 'Memorable across MENA' },
              { icon: '📢', text: ar ? 'تسويق مستقل لكل خدمة' : 'Independent brand marketing' },
              { icon: '🤝', text: ar ? 'ثقة ودفع موحدان' : 'Shared trust & payments' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2 text-xs text-slate-300 p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Naming Convention Panel ───────────────────────────────────── */}
        <AnimatePresence>
          {showNaming && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div
                className="rounded-2xl p-5"
                style={{ background: 'var(--wasel-glass-lg)', border: '1px solid rgba(217,150,91,0.2)' }}
              >
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Hash size={14} style={{ color: '#D9965B' }} />
                  {ar ? 'قواعد التسمية المحدّثة' : 'Updated Naming Conventions'}
                </h3>
                <div className="space-y-2">
                  {NAMING_CONVENTIONS.map((nc) => (
                    <div key={nc.old} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs line-through text-slate-500 font-mono">{nc.old}</span>
                          <ArrowRight size={10} className="text-slate-600 flex-shrink-0" />
                          <span className="text-xs font-bold text-teal-400 font-mono">{nc.new}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{ar ? nc.reasonAr : nc.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cultural Filters (Task 4 — embedded in core flow) ────────── */}
        <div>
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
            {ar ? '🕌 تصفية ثقافية — مدمجة في التجربة' : '🕌 Cultural Filters — Embedded in Core Flow'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {CULTURAL_FILTERS.map((f) => (
              <motion.button
                key={f.id}
                onClick={() => navigate(f.route)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 p-3.5 rounded-xl text-start"
                style={{ background: `${f.color}10`, border: `1px solid ${f.color}25` }}
              >
                <span className="text-2xl">{f.icon}</span>
                <span className="text-xs font-semibold" style={{ color: f.color }}>
                  {ar ? f.labelAr : f.label}
                </span>
              </motion.button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            {ar
              ? '🔑 ميزة لا يملكها BlaBlaCar ولا Uber في المنطقة'
              : "🔑 BlaBlaCar & Uber don't offer this in the region"}
          </p>
        </div>

        {/* ── Brand Selector ────────────────────────────────────────────── */}
        <div>
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">
            {ar ? 'اختر خدمتك' : 'Choose Your Service'}
          </p>
          <div className="space-y-3">
            <BrandCard
              brandEn="Wasel" brandAr="واصل"
              taglineEn="Share the Journey, Share the Cost"
              taglineAr="شارك الرحلة، وفّر المصاري"
              icon={Car} color="#04ADBF"
              accentBg="linear-gradient(135deg, rgba(4,173,191,0.14), rgba(4,173,191,0.04))"
              stats={[
                { label: 'Avg Price', labelAr: 'متوسط السعر', value: 'JOD 8' },
                { label: 'Distance',  labelAr: 'المسافة',     value: '50-500 km' },
                { label: 'Booking',   labelAr: 'الحجز',       value: '24h+' },
              ]}
              active={activeService === 'wasel'}
              onClick={() => setActiveService('wasel')}
            />
            <BrandCard
              brandEn="Awasel" brandAr="أوصل"
              taglineEn="Send with Someone Already Going"
              taglineAr="ابعث مع واحد رايح"
              icon={Package} color="#D9965B"
              accentBg="linear-gradient(135deg, rgba(217,150,91,0.14), rgba(217,150,91,0.04))"
              stats={[
                { label: 'Avg Price', labelAr: 'متوسط السعر', value: 'JOD 5' },
                { label: 'Insurance', labelAr: 'تأمين',       value: 'JOD 100' },
                { label: 'Tracking',  labelAr: 'تتبع',        value: 'QR Live' },
              ]}
              active={activeService === 'awasel'}
              onClick={() => setActiveService('awasel')}
            />
          </div>
        </div>

        {/* ── Service Content ───────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* WASEL — Carpooling */}
          {activeService === 'wasel' && (
            <motion.div key="wasel"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} className="space-y-3"
            >
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {ar ? 'رحلات متاحة الآن — واصل' : 'Available Rides Now — Wasel'}
              </p>
              {WASEL_ROUTES.map((route) => (
                <motion.button
                  key={route.to}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate('/app/find-ride')}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-start"
                  style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${route.color}15` }}>
                    {route.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{ar ? route.fromAr : route.from}</span>
                      <ArrowRight size={12} className="text-slate-500 flex-shrink-0"
                        style={{ transform: ar ? 'scaleX(-1)' : 'none' }} />
                      <span className="text-sm font-semibold text-white">{ar ? route.toAr : route.to}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                      <Users size={10} />
                      <span>{route.seats} {ar ? 'مقاعد' : 'seats'}</span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <span className="text-base font-black" style={{ color: route.color }}>JOD {route.price}</span>
                    <p className="text-xs text-slate-500">{ar ? 'للمقعد' : '/seat'}</p>
                  </div>
                </motion.button>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/find-ride')}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #04ADBF, #09732E)' }}
              >
                <Car size={16} />
                {ar ? 'دوّر على رحلة — واصل' : 'Find a Ride — Wasel'}
              </motion.button>
            </motion.div>
          )}

          {/* AWASEL — Package Delivery */}
          {activeService === 'awasel' && (
            <motion.div key="awasel"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }} className="space-y-3"
            >
              {/* Awasel brand accent */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(217,150,91,0.12), rgba(217,150,91,0.04))',
                  border: '1px solid rgba(217,150,91,0.25)',
                }}>
                <span className="text-2xl">📦</span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-white">أوصل</span>
                    <span className="text-sm font-black" style={{ color: '#D9965B' }}>Awasel</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {ar ? 'وصّل طردك مع مسافر رايح هناك أصلاً' : 'Deliver with someone already making the trip'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                {ar ? 'أنواع الطرود — أوصل' : 'Package Types — Awasel'}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {AWASEL_PACKAGES.map((opt) => (
                  <motion.button
                    key={opt.label}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => navigate('/app/awasel/send')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl"
                    style={{ background: `${opt.color}10`, border: `1px solid ${opt.color}25` }}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-xs font-semibold text-white">{ar ? opt.labelAr : opt.label}</span>
                    <span className="text-xs text-slate-400">{opt.weight}</span>
                    <span className="text-sm font-black" style={{ color: opt.color }}>JOD {opt.price}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  { icon: Shield,    text: ar ? 'تأمين JOD 100'  : 'JOD 100 insurance', color: '#04ADBF' },
                  { icon: BadgeCheck,text: ar ? 'QR تسليم'       : 'QR delivery',        color: '#ABD907' },
                  { icon: MapPin,    text: ar ? 'تتبع مباشر'     : 'Live tracking',      color: '#D9965B' },
                ].map((f) => (
                  <div key={f.text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: `${f.color}12`, color: f.color, border: `1px solid ${f.color}25` }}>
                    <f.icon size={10} />
                    {f.text}
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/awasel/send')}
                className="w-full py-3.5 rounded-2xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #D9965B, #B8741F)' }}
              >
                <Package size={16} />
                {ar ? 'ابعث طردك — أوصل' : 'Send a Package — Awasel'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Why Wasel + Awasel ────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--wasel-glass-lg)', border: '1px solid var(--border)' }}
        >
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap size={14} className="text-teal-400" />
            {ar ? 'لماذا واصل وأوصل معاً؟' : 'Why Wasel + Awasel Together?'}
          </h3>
          <div className="space-y-2.5">
            {[
              { icon: '🚗', label: ar ? 'واصل' : 'Wasel', color: '#04ADBF', point: ar ? 'ترحال مشترك (50-500 كم) — تشارك التكلفة بسعر ثابت' : 'Long-distance carpooling (50–500 km) — fixed cost-sharing' },
              { icon: '📦', label: ar ? 'أوصل' : 'Awasel', color: '#D9965B', point: ar ? 'توصيل الطرود عبر المسافرين — هامش 65%+، صفر أصول' : 'Package delivery via travelers — 65%+ margin, zero assets' },
              { icon: '🕌', label: ar ? 'ثقافة' : 'Culture', color: '#8B5CF6', point: ar ? 'توقفات صلاة + رحلات نساء + وضع رمضان — ميزة تنافسية' : 'Prayer stops + women-only + Ramadan mode — cultural moat' },
              { icon: '🤝', label: ar ? 'مجتمع' : 'Community', color: '#22C55E', point: ar ? 'ثقة مشتركة — نظام التحقق سند يخدم العلامتين' : 'Shared trust — Sanad verification serves both brands' },
            ].map((item) => (
              <div key={item.point} className="flex items-start gap-3">
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>{item.label}</span>
                </div>
                <span className="text-xs text-slate-300 leading-relaxed">{item.point}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default UnifiedPlatformHub;