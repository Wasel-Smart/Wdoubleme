/**
 * CostCalculator — /features/carpooling/CostCalculator.tsx
 * Fuel cost-sharing calculator — Jordan-ONLY (Phase 1 launch)
 * ✅ Jordan routes only | ✅ JOD 0.90/L fuel | ✅ Bilingual | ✅ No KSA toggle
 */

import { useNavigate } from 'react-router';
import { Fuel, Users, Calculator, ChevronRight, Info, MapPin } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';

// ── Jordan Tier-1 launch routes (per Guidelines) ──────────────────────────────
const JORDAN_ROUTES = [
  { nameEn: 'Amman → Aqaba',    nameAr: 'عمّان ← العقبة',    km: 330 },
  { nameEn: 'Amman → Irbid',    nameAr: 'عمّان ← إربد',     km: 85 },
  { nameEn: 'Amman → Dead Sea', nameAr: 'عمّان ← البحر الميت', km: 60 },
  { nameEn: 'Amman → Zarqa',    nameAr: 'عمّان ← الزرقا',   km: 30 },
  { nameEn: 'Amman → Petra',    nameAr: 'عمّان ← البتراء',  km: 250 },
  { nameEn: 'Amman → Wadi Rum', nameAr: 'عمّان ← وادي رم',  km: 320 },
];

const JOD_PER_LITER = 0.90; // Jordan average (Guidelines)

function calculateCostSharing(
  distanceKm: number,
  seatsAvailable: number,
  fuelEfficiency: number,
  includeTolls: boolean,
): { totalFuelCost: number; pricePerSeat: number; driverNet: number; platformFee: number } {
  const liters   = (distanceKm / 100) * fuelEfficiency;
  const fuelCost = liters * JOD_PER_LITER;
  const tolls    = includeTolls ? 2 : 0;
  const total    = fuelCost + tolls;
  const raw      = total / seatsAvailable;
  const pricePerSeat = Math.ceil(raw * 1.2); // 20% buffer for driver (Guidelines)
  const platformFee  = pricePerSeat * seatsAvailable * 0.12; // 12% commission
  const driverNet    = pricePerSeat * seatsAvailable - platformFee;
  return { totalFuelCost: total, pricePerSeat, driverNet, platformFee };
}

export function CostCalculator() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const ar = language === 'ar';

  const [selectedRouteKm, setSelectedRouteKm] = useState(330);
  const [customDistance, setCustomDistance]   = useState('');
  const [useCustom, setUseCustom]             = useState(false);
  const [seats, setSeats]                     = useState(3);
  const [efficiency, setEfficiency]           = useState(8);
  const [includeTolls, setIncludeTolls]       = useState(false);

  const distanceKm = useCustom ? (parseInt(customDistance) || 0) : selectedRouteKm;

  const calc = useMemo(
    () => calculateCostSharing(distanceKm, seats, efficiency, includeTolls),
    [distanceKm, seats, efficiency, includeTolls],
  );

  const soloFuelCost      = (distanceKm / 100) * efficiency * JOD_PER_LITER;
  const perPassengerSaving = soloFuelCost - calc.pricePerSeat;

  const t = {
    title:       ar ? 'حاسبة تقاسم التكاليف' : 'Cost-Sharing Calculator',
    subtitle:    ar ? 'احسب السعر العادل لكل مقعد بناءً على تكلفة الوقود' : 'Fair price per seat based on fuel cost',
    route:       ar ? 'اختر المسار' : 'Choose Route',
    seats:       ar ? 'عدد المقاعد المتاحة' : 'Available Seats',
    efficiency:  ar ? 'استهلاك الوقود (لتر/100كم)' : 'Fuel Efficiency (L/100km)',
    tolls:       ar ? 'تضمين رسوم الطريق (2 د.أ)' : 'Include Toll Fees (JOD 2)',
    customDist:  ar ? 'مسافة مخصصة' : 'Custom Distance',
    perSeat:     ar ? 'السعر المقترح / مقعد' : 'Suggested Price / Seat',
    fuelCost:    ar ? 'تكلفة الوقود الكلية' : 'Total Fuel Cost',
    driverEarns: ar ? 'يحصل السائق (بعد رسوم المنصة)' : 'Driver Receives (after platform 12%)',
    platformFee: ar ? 'رسوم المنصة (12%)' : 'Platform Fee (12%)',
    postRide:    ar ? 'انشر رحلتك بهذا السعر' : 'Post Ride at This Price',
    note:        ar ? 'ملاحظة: هذه أسعار استرشادية. أنت تحدد السعر النهائي.' : 'Suggested prices only — you set the final price.',
    savings:     ar ? 'توفّر مقارنةً بالسفر منفرداً' : 'Savings vs. traveling alone',
    fuelNote:    ar ? 'سعر الوقود: 0.90 د.أ/لتر (الأردن)' : 'Fuel price: JOD 0.90/L (Jordan)',
  };

  return (
    <div className="min-h-screen bg-[#0B1120] pb-24" dir={ar ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0B1120]/95 backdrop-blur border-b border-[#1E293B] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">{t.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
          </div>
          {/* Jordan badge */}
          <div className="ml-auto flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">🇯🇴 Jordan</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Input Card */}
        <Card className="bg-card border-border p-4 space-y-4">
          {/* Route Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-500 font-bold">{t.route}</label>
              <button
                onClick={() => setUseCustom(v => !v)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${useCustom ? 'bg-primary/15 border-primary/30 text-primary' : 'border-[#1E293B] text-slate-600 hover:text-slate-400'}`}
              >
                {t.customDist}
              </button>
            </div>
            {useCustom ? (
              <div className="relative">
                <input
                  type="number"
                  value={customDistance}
                  onChange={e => setCustomDistance(e.target.value)}
                  placeholder={ar ? 'أدخل المسافة بالكيلومترات' : 'Enter distance in km'}
                  className="w-full bg-[#0B1120] border border-[#1E293B] rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50 focus:outline-none placeholder:text-slate-600"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">km</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {JORDAN_ROUTES.map(r => (
                  <button
                    key={r.nameEn}
                    onClick={() => setSelectedRouteKm(r.km)}
                    className={`text-xs px-2.5 py-2 rounded-lg border font-medium transition-all text-left ${selectedRouteKm === r.km ? 'bg-primary/15 border-primary/30 text-white' : 'border-[#1E293B] text-slate-400 hover:border-slate-600'}`}
                  >
                    {ar ? r.nameAr : r.nameEn}
                    <span className="block text-[10px] text-slate-600">{r.km} km</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Seats */}
          <div>
            <label className="text-xs text-slate-500 font-bold block mb-2">
              {t.seats}: <span className="text-primary">{seats}</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setSeats(n)}
                  className={`flex-1 py-2 rounded-xl border text-sm font-black transition-all ${seats === n ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-[#0B1120] border-[#1E293B] text-slate-400 hover:border-slate-600'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Efficiency */}
          <div>
            <label className="text-xs text-slate-500 font-bold block mb-2">
              {t.efficiency}: <span className="text-amber-400">{efficiency} L/100km</span>
            </label>
            <input
              type="range" min={5} max={15} value={efficiency}
              onChange={e => setEfficiency(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-slate-600 mt-1">
              <span>{ar ? 'اقتصادي' : 'Eco'} (5)</span>
              <span>{ar ? 'متوسط' : 'Avg'} (8)</span>
              <span>SUV (15)</span>
            </div>
          </div>

          {/* Tolls Toggle */}
          <button
            onClick={() => setIncludeTolls(v => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${includeTolls ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' : 'border-[#1E293B] text-slate-500 hover:border-slate-600'}`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center border ${includeTolls ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
              {includeTolls && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
            {t.tolls}
          </button>

          {/* Fuel note */}
          <p className="text-[10px] text-slate-600 flex items-center gap-1.5">
            <Fuel className="w-3 h-3" />{t.fuelNote}
          </p>
        </Card>

        {/* Results */}
        {distanceKm > 0 && (
          <motion.div
            key={`${distanceKm}-${seats}-${efficiency}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Main result */}
            <Card className="bg-gradient-to-br from-primary/15 to-teal-500/5 border-primary/25 p-5 text-center">
              <p className="text-xs text-slate-400 mb-1">{t.perSeat}</p>
              <p className="text-4xl font-black text-primary mb-1">{formatCurrency(calc.pricePerSeat)}</p>
              <p className="text-[10px] text-slate-500">{distanceKm} km · {seats} {ar ? 'مقاعد' : 'seats'}</p>
            </Card>

            {/* Breakdown */}
            <Card className="bg-card border-border p-4 space-y-2.5">
              {[
                { label: t.fuelCost,    value: formatCurrency(calc.totalFuelCost), color: 'text-amber-400' },
                { label: t.platformFee, value: formatCurrency(calc.platformFee),   color: 'text-slate-400' },
                { label: t.driverEarns, value: formatCurrency(calc.driverNet),     color: 'text-emerald-400' },
                ...(perPassengerSaving > 0 ? [{ label: t.savings, value: `${formatCurrency(perPassengerSaving)} ${ar ? 'للمسافر' : '/passenger'}`, color: 'text-teal-400' }] : []),
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </Card>

            {/* Note */}
            <div className="flex items-start gap-2 bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500">{t.note}</p>
            </div>

            {/* CTA */}
            <Button
              onClick={() => navigate(`/app/post-ride?price=${calc.pricePerSeat}&distance=${distanceKm}`)}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              {t.postRide}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}