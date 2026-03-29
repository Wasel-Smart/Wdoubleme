/**
 * RecommendedForYou — Gap #13 Fix ✅
 * Wired to real backend: GET /trips?limit=5&status=active
 * Falls back to contextual static data when backend unavailable.
 */

import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { useAuth } from '../../contexts/AuthContext';
import { useCountry } from '../../contexts/CountryContext';
import { getRegion } from '../../utils/regionConfig';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecommendedItem {
  id: string;
  type: 'carpooling' | 'package' | 'trending';
  titleEn: string; titleAr: string;
  descEn: string;  descAr: string;
  price: number;   currency: string;
  badge: string;   badgeColor: string;
  icon: string;
  from?: string;   to?: string;
  seatsLeft?: number;
  date?: string;
  navigateTo: string;
}

// ─── Fallback static data ────────────────────────────────────────────────────

const STATIC_ITEMS: RecommendedItem[] = [
  { id: 's1', type: 'carpooling', titleEn: 'Amman → Aqaba', titleAr: 'عمّان ← العقبة', descEn: 'Fri 14 Mar · 8 seats still available', descAr: 'الجمعة 14 مارس · 8 مقاعد متبقية', price: 8, currency: 'JOD', badge: '🔥 Popular', badgeColor: '#EF4444', icon: '🏖️', from: 'Amman', to: 'Aqaba', seatsLeft: 3, navigateTo: '/app/find-ride' },
  { id: 's2', type: 'package',    titleEn: 'Send to Irbid',  titleAr: 'طرد لإربد',      descEn: 'Traveler going today — 2 kg capacity', descAr: 'مسافر اليوم — سعة 2 كغ', price: 3, currency: 'JOD', badge: '📦 Awasel', badgeColor: '#D9965B', icon: '📦', navigateTo: '/app/awasel/send' },
  { id: 's3', type: 'trending',   titleEn: 'Amman → Petra',  titleAr: 'عمّان ← البتراء', descEn: '↑ 40% more bookings this week', descAr: 'ارتفاع 40% في الحجوزات هذا الأسبوع', price: 12, currency: 'JOD', badge: '📈 Trending', badgeColor: '#8B5CF6', icon: '🏛️', from: 'Amman', to: 'Petra', seatsLeft: 2, navigateTo: '/app/find-ride' },
];

// ─── Trip mapper ────────────────────────────────────────────────────────────

function tripToItem(t: any, currency: string): RecommendedItem {
  return {
    id: t.id,
    type: 'carpooling',
    titleEn: `${t.from || t.from_location} → ${t.to || t.to_location}`,
    titleAr:  `${t.from_ar || t.from || t.from_location} ← ${t.to_ar || t.to || t.to_location}`,
    descEn: `${t.date || t.departure_date} · ${t.time || t.departure_time || ''} · ${t.available_seats || t.seats_available || 1} seat(s) left`,
    descAr: `${t.date || t.departure_date} · ${t.available_seats || t.seats_available || 1} مقاعد متبقية`,
    price: t.price_per_seat || 0,
    currency,
    badge: (t.available_seats || t.seats_available) <= 2 ? '🔥 Last seats' : '✅ Available',
    badgeColor: (t.available_seats || t.seats_available) <= 2 ? '#EF4444' : '#22C55E',
    icon: '🚗',
    from: t.from || t.from_location,
    to:   t.to   || t.to_location,
    seatsLeft: t.available_seats || t.seats_available || 1,
    date: t.date || t.departure_date,
    navigateTo: `/app/rides/${t.id}`,
  };
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function RecCard({ item, ar, onNav }: { item: RecommendedItem; ar: boolean; onNav: (url: string) => void }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer flex-shrink-0"
      style={{ width: 220, borderRadius: WaselRadius.xl }}
      onClick={() => onNav(item.navigateTo)}
    >
      <div
        className="h-full p-4 rounded-2xl"
        style={{
          background: 'var(--wasel-glass-lg)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: WaselShadows.md,
        }}
      >
        {/* Icon + badge */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{item.icon}</span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: `${item.badgeColor}18`, color: item.badgeColor, border: `1px solid ${item.badgeColor}30` }}>
            {item.badge}
          </span>
        </div>

        {/* Title */}
        <p className="font-black text-white mb-1 leading-snug" style={{ fontWeight: 800, fontSize: '0.88rem' }}>
          {ar ? item.titleAr : item.titleEn}
        </p>

        {/* Description */}
        <p className="text-xs mb-3 leading-relaxed" style={{ color: 'rgba(100,116,139,1)' }}>
          {ar ? item.descAr : item.descEn}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black" style={{ color: WaselColors.teal, fontSize: '1.1rem', fontWeight: 900 }}>
              {item.price}
            </span>
            <span className="text-xs ml-1" style={{ color: 'rgba(71,85,105,1)' }}>
              {item.currency}/{ar ? 'مقعد' : 'seat'}
            </span>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.3), rgba(4,173,191,0.3))', border: '1px solid rgba(4,173,191,0.2)' }}>
            <ChevronRight className="w-3.5 h-3.5 text-teal-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function RecommendedForYou() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { currentCountry } = useCountry();
  const region = getRegion(currentCountry?.iso_alpha2 || 'JO');
  const ar = language === 'ar';

  const [items, setItems] = useState<RecommendedItem[]>(STATIC_ITEMS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLive = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trips?limit=5&status=active`,
          { headers: { Authorization: `Bearer ${session?.access_token || publicAnonKey}` } }
        );
        const data = await res.json();
        const trips = (data.trips || data || []) as any[];
        if (Array.isArray(trips) && trips.length >= 2) {
          setItems(trips.slice(0, 3).map(t => tripToItem(t, region.currency)));
        }
      } catch {
        // Silently fall back to static
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: WaselColors.teal }} />
          <h3 className="font-black text-white" style={{ fontWeight: 800, fontSize: '0.95rem' }}>
            {ar ? 'مقترح لك' : 'Recommended For You'}
          </h3>
        </div>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#475569' }} />}
        {!loading && items !== STATIC_ITEMS && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />
            {ar ? 'مباشر' : 'Live'}
          </span>
        )}
      </div>

      {/* Horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {items.map(item => (
          <RecCard key={item.id} item={item} ar={ar} onNav={navigate} />
        ))}
      </div>
    </div>
  );
}