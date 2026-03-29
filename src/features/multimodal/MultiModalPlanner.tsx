/**
 * MultiModalPlanner — Wasel | واصل
 * Seamless Multi-Modal Journey Integration
 *
 * Covers first-mile → Wasel carpooling (primary) → last-mile
 *
 * Modes integrated:
 *  • 🚗 Wasel Carpooling (intercity — primary mode)
 *  • 🚌 Bus (JoBus/JETT for Jordan, Metro for Egypt, etc.)
 *  • 🚕 Taxi / Ride-hailing (last-mile or alternative)
 *  • 🛴 Micro-mobility (e-scooter, bike) for city segments
 *  • 🚶 Walking (short gaps)
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Car, Bus, Navigation2, Bike, Footprints, MapPin,
  Clock, DollarSign, ChevronRight, ChevronDown, ArrowRight,
  Zap, Leaf, AlertCircle, CheckCircle2, RefreshCw, Search,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../utils/currency';

// ─── Types ────────────────────────────────────────────────────────────────────

type TransportMode = 'wasel' | 'bus' | 'taxi' | 'scooter' | 'bike' | 'walk';

interface JourneyLeg {
  id: string;
  mode: TransportMode;
  from: string;
  fromAr: string;
  to: string;
  toAr: string;
  distanceKm: number;
  durationMin: number;
  costJOD: number;
  notes?: string;
  notesAr?: string;
  operator?: string;
  operatorAr?: string;
  available: boolean;
  co2Saved?: number; // grams vs solo car
}

interface JourneyPlan {
  id: string;
  label: string;
  labelAr: string;
  legs: JourneyLeg[];
  totalDurationMin: number;
  totalCostJOD: number;
  totalCo2SavedGrams: number;
  recommended: boolean;
  type: 'fastest' | 'cheapest' | 'greenest' | 'wasel_first';
}

interface CityOption {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  flag: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CITIES: CityOption[] = [
  { id: 'amman',      name: 'Amman',         nameAr: 'عمّان',         country: 'Jordan',  countryAr: 'الأردن',       flag: '🇯🇴' },
  { id: 'aqaba',      name: 'Aqaba',          nameAr: 'العقبة',        country: 'Jordan',  countryAr: 'الأردن',       flag: '🇯🇴' },
  { id: 'irbid',      name: 'Irbid',          nameAr: 'إربد',          country: 'Jordan',  countryAr: 'الأردن',       flag: '🇯🇴' },
  { id: 'cairo',      name: 'Cairo',          nameAr: 'القاهرة',       country: 'Egypt',   countryAr: 'مصر',          flag: '🇪🇬' },
  { id: 'alexandria', name: 'Alexandria',     nameAr: 'الإسكندرية',    country: 'Egypt',   countryAr: 'مصر',          flag: '🇪🇬' },
  { id: 'dubai',      name: 'Dubai',          nameAr: 'دبي',           country: 'UAE',     countryAr: 'الإمارات',     flag: '🇦🇪' },
  { id: 'abudhabi',   name: 'Abu Dhabi',      nameAr: 'أبوظبي',        country: 'UAE',     countryAr: 'الإمارات',     flag: '🇦🇪' },
];

// ─── Journey plan generator ────────────────────────────────────────────────────

function generateJourneyPlans(from: string, to: string): JourneyPlan[] {
  const isJordanRoute = ['amman', 'aqaba', 'irbid'].includes(from) && ['amman', 'aqaba', 'irbid'].includes(to);
  const isEgyptRoute  = ['cairo', 'alexandria'].includes(from) && ['cairo', 'alexandria'].includes(to);
  const isUAERoute    = ['dubai', 'abudhabi'].includes(from) && ['dubai', 'abudhabi'].includes(to);

  const intercityKm =
    isJordanRoute && ((from === 'amman' && to === 'aqaba') || (from === 'aqaba' && to === 'amman')) ? 330
    : isJordanRoute && ((from === 'amman' && to === 'irbid') || (from === 'irbid' && to === 'amman')) ? 85
    : isEgyptRoute ? 220
    : isUAERoute ? 150
    : 200; // default

  const waselDuration  = Math.round(intercityKm * 0.75);
  const waselCost      = isEgyptRoute ? 4.5 : isUAERoute ? 22 : intercityKm < 100 ? 5 : 10;
  const busDuration    = waselDuration + 30;
  const busCost        = waselCost * 0.6;

  // ─ Plan 1: Wasel-First (recommended) ───────────────────────────────────────
  const waselFirst: JourneyPlan = {
    id: 'wasel_first',
    label: 'Wasel Carpooling',        labelAr: 'واصل الترحال المشترك',
    recommended: true,
    type: 'wasel_first',
    legs: [
      {
        id: 'first_mile',
        mode: 'walk',
        from: `Your location`, fromAr: 'موقعك',
        to: 'Pickup Point',   toAr: 'نقطة الانطلاق',
        distanceKm: 0.3, durationMin: 5, costJOD: 0,
        notes: 'Walk to the agreed pickup spot', notesAr: 'امشِ إلى نقطة الالتقاء',
        available: true, co2Saved: 0,
      },
      {
        id: 'wasel_main',
        mode: 'wasel',
        from: from.charAt(0).toUpperCase() + from.slice(1), fromAr: CITIES.find(c => c.id === from)?.nameAr ?? from,
        to:   to.charAt(0).toUpperCase() + to.slice(1),     toAr: CITIES.find(c => c.id === to)?.nameAr ?? to,
        distanceKm: intercityKm, durationMin: waselDuration, costJOD: waselCost,
        notes: 'Cost-sharing ride with verified traveler', notesAr: 'رحلة مشتركة مع مسافر موثق',
        operator: 'Wasel', operatorAr: 'واصل',
        available: true, co2Saved: Math.round(intercityKm * 120),
      },
      {
        id: 'last_mile_taxi',
        mode: 'taxi',
        from: 'Drop-off Point',      fromAr: 'نقطة الإنزال',
        to:   'Destination',         toAr: 'وجهتك',
        distanceKm: 3, durationMin: 12, costJOD: isUAERoute ? 4 : 1.5,
        notes: 'Short taxi to final destination', notesAr: 'تاكسي قصير للوجهة النهائية',
        operator: isUAERoute ? 'Dubai Taxi' : 'Local Taxi', operatorAr: isUAERoute ? 'تاكسي دبي' : 'تاكسي محلي',
        available: true, co2Saved: 0,
      },
    ],
    totalDurationMin: waselDuration + 17,
    totalCostJOD: waselCost + (isUAERoute ? 4 : 1.5),
    totalCo2SavedGrams: Math.round(intercityKm * 120),
  };

  // ─ Plan 2: Bus + Wasel (cheapest) ──────────────────────────────────────────
  const busWasel: JourneyPlan = {
    id: 'bus_wasel',
    label: 'Bus + Walk',       labelAr: 'حافلة عامة + مشي',
    recommended: false,
    type: 'cheapest',
    legs: [
      {
        id: 'bus_first',
        mode: 'bus',
        from: `Your location`, fromAr: 'موقعك',
        to: from.charAt(0).toUpperCase() + from.slice(1), toAr: CITIES.find(c => c.id === from)?.nameAr ?? from,
        distanceKm: intercityKm, durationMin: busDuration, costJOD: busCost,
        notes: isJordanRoute ? 'JETT / JoBus intercity service' : isEgyptRoute ? 'Go Bus / Swvl service' : 'Public bus',
        notesAr: isJordanRoute ? 'خدمة JETT أو JoBus' : isEgyptRoute ? 'Go Bus أو سويفل' : 'حافلة عامة',
        operator: isJordanRoute ? 'JETT Bus' : isEgyptRoute ? 'Go Bus' : 'City Bus',
        operatorAr: isJordanRoute ? 'جيت باص' : isEgyptRoute ? 'Go Bus' : 'حافلة عامة',
        available: true, co2Saved: Math.round(intercityKm * 80),
      },
      {
        id: 'last_walk',
        mode: 'walk',
        from: 'Bus Stop',    fromAr: 'موقف الحافلة',
        to: 'Destination',   toAr: 'وجهتك',
        distanceKm: 0.8, durationMin: 12, costJOD: 0,
        available: true, co2Saved: 0,
      },
    ],
    totalDurationMin: busDuration + 12,
    totalCostJOD: busCost,
    totalCo2SavedGrams: Math.round(intercityKm * 80),
  };

  // ─ Plan 3: Scooter + Wasel + Scooter (greenest) ────────────────────────────
  const scooterWaselScooter: JourneyPlan = {
    id: 'micro_wasel',
    label: 'Micro-Mobility + Wasel', labelAr: 'تنقل صغير + واصل',
    recommended: false,
    type: 'greenest',
    legs: [
      {
        id: 'scooter_to',
        mode: 'scooter',
        from: 'Your location', fromAr: 'موقعك',
        to: 'Pickup',          toAr: 'نقطة الانطلاق',
        distanceKm: 1.5, durationMin: 8, costJOD: 0.5,
        operator: 'Lime / e-Scooter', operatorAr: 'لايم / سكوتر كهربائي',
        available: isJordanRoute || isUAERoute, co2Saved: 350,
        notes: 'E-scooter to pickup point', notesAr: 'سكوتر كهربائي لنقطة الانطلاق',
      },
      {
        id: 'wasel_green',
        mode: 'wasel',
        from: from.charAt(0).toUpperCase() + from.slice(1), fromAr: CITIES.find(c => c.id === from)?.nameAr ?? from,
        to:   to.charAt(0).toUpperCase() + to.slice(1),     toAr: CITIES.find(c => c.id === to)?.nameAr ?? to,
        distanceKm: intercityKm, durationMin: waselDuration, costJOD: waselCost,
        operator: 'Wasel', operatorAr: 'واصل',
        available: true, co2Saved: Math.round(intercityKm * 120),
        notes: 'Shared carpooling (greenest intercity option)', notesAr: 'مشاركة رحلة — الأنظف بيئياً',
      },
      {
        id: 'bike_final',
        mode: 'bike',
        from: 'Drop-off',    fromAr: 'الإنزال',
        to: 'Destination',   toAr: 'وجهتك',
        distanceKm: 2, durationMin: 10, costJOD: 0.3,
        operator: 'Bike Share', operatorAr: 'تشارك الدراجات',
        available: isUAERoute, co2Saved: 500,
        notes: 'Shared bike for last mile', notesAr: 'دراجة مشتركة للكيلومتر الأخير',
      },
    ],
    totalDurationMin: waselDuration + 18,
    totalCostJOD: waselCost + 0.8,
    totalCo2SavedGrams: Math.round(intercityKm * 120) + 850,
  };

  return [waselFirst, busWasel, scooterWaselScooter];
}

// ─── Mode Config ──────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<TransportMode, {
  icon: React.ComponentType<any>; label: string; labelAr: string;
  color: string; bg: string;
}> = {
  wasel:   { icon: Car,         label: 'Wasel Carpool', labelAr: 'واصل', color: '#04ADBF', bg: 'rgba(4,173,191,0.15)' },
  bus:     { icon: Bus,         label: 'Bus',           labelAr: 'حافلة', color: '#ABD907', bg: 'rgba(171,217,7,0.12)' },
  taxi:    { icon: Navigation2, label: 'Taxi',          labelAr: 'تاكسي', color: '#D9965B', bg: 'rgba(217,150,91,0.12)' },
  scooter: { icon: Zap,         label: 'E-Scooter',     labelAr: 'سكوتر', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  bike:    { icon: Bike,        label: 'Bike',          labelAr: 'دراجة', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  walk:    { icon: Footprints,  label: 'Walk',          labelAr: 'مشي',   color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function LegCard({ leg, ar }: { leg: JourneyLeg; ar: boolean }) {
  const cfg = MODE_CONFIG[leg.mode];
  return (
    <div
      className="flex items-start gap-3 p-3.5 rounded-xl"
      style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${cfg.color}20` }}>
        <cfg.icon size={16} style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>
            {ar ? cfg.labelAr : cfg.label}
          </span>
          {leg.operator && (
            <span className="text-xs text-slate-400">
              · {ar ? leg.operatorAr : leg.operator}
            </span>
          )}
          {!leg.available && (
            <span className="text-xs text-red-400">({ar ? 'غير متاح' : 'Unavailable'})</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-300 mt-0.5">
          <span>{ar ? leg.fromAr : leg.from}</span>
          <ArrowRight size={10} className="text-slate-500 flex-shrink-0" style={{ transform: ar ? 'scaleX(-1)' : 'none' }} />
          <span>{ar ? leg.toAr : leg.to}</span>
        </div>
        {leg.notes && (
          <p className="text-xs text-slate-400 mt-1">{ar ? leg.notesAr : leg.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs font-bold text-white">{leg.durationMin}m</span>
        <span className="text-xs text-slate-400">
          {leg.costJOD === 0 ? (ar ? 'مجاني' : 'Free') : `JOD ${leg.costJOD.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function MultiModalPlanner() {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [fromCity, setFromCity] = useState('amman');
  const [toCity,   setToCity]   = useState('aqaba');
  const [searched, setSearched] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>('wasel_first');
  const [selectedPlan, setSelectedPlan] = useState<string>('wasel_first');

  const plans = useMemo(
    () => searched ? generateJourneyPlans(fromCity, toCity) : [],
    [searched, fromCity, toCity],
  );

  const handleSearch = useCallback(() => {
    if (fromCity !== toCity) setSearched(true);
  }, [fromCity, toCity]);

  const handleSwap = useCallback(() => {
    setFromCity(toCity);
    setToCity(fromCity);
    setSearched(false);
  }, [fromCity, toCity]);

  const typeConfig: Record<JourneyPlan['type'], { label: string; labelAr: string; color: string }> = {
    wasel_first: { label: 'Recommended',  labelAr: 'الأنسب',      color: '#04ADBF' },
    fastest:     { label: 'Fastest',      labelAr: 'الأسرع',      color: '#F59E0B' },
    cheapest:    { label: 'Cheapest',     labelAr: 'الأقل تكلفة', color: '#ABD907' },
    greenest:    { label: 'Greenest 🌿',  labelAr: 'النظف 🌿',   color: '#22C55E' },
  };

  return (
    <div
      className="min-h-screen pb-24"
      style={{ background: '#0B1120', direction: ar ? 'rtl' : 'ltr' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 pt-safe"
        style={{
          background: 'rgba(11,17,32,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-2xl mx-auto py-4">
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation2 size={20} className="text-teal-400" />
            {ar ? 'مخطط رحلة متعدد الوسائل' : 'Multi-Modal Journey Planner'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 mb-4">
            {ar ? 'واصل + حافلة + تاكسي + سكوتر — رحلتك كاملة' : 'Wasel + Bus + Taxi + Scooter — your full journey'}
          </p>

          {/* Origin / Destination Picker */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'var(--wasel-glass-lg)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {/* From */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{ar ? 'من' : 'From'}</label>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MapPin size={14} className="text-teal-400 flex-shrink-0" />
                <select
                  value={fromCity}
                  onChange={e => { setFromCity(e.target.value); setSearched(false); }}
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                  style={{ direction: ar ? 'rtl' : 'ltr' }}
                >
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#111B2E' }}>
                      {c.flag} {ar ? `${c.nameAr} · ${c.countryAr}` : `${c.name} · ${c.country}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <button
                onClick={handleSwap}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-slate-700"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <RefreshCw size={13} className="text-slate-400" />
              </button>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* To */}
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{ar ? 'إلى' : 'To'}</label>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MapPin size={14} className="text-amber-400 flex-shrink-0" />
                <select
                  value={toCity}
                  onChange={e => { setToCity(e.target.value); setSearched(false); }}
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                  style={{ direction: ar ? 'rtl' : 'ltr' }}
                >
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id} style={{ background: '#111B2E' }}>
                      {c.flag} {ar ? `${c.nameAr} · ${c.countryAr}` : `${c.name} · ${c.country}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {fromCity === toCity && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle size={11} />
                {ar ? 'نقطتا الانطلاق والوصول متطابقتان' : 'Origin and destination are the same'}
              </p>
            )}

            <motion.button
              onClick={handleSearch}
              disabled={fromCity === toCity}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-opacity"
              style={{
                background: fromCity !== toCity
                  ? 'linear-gradient(135deg, #04ADBF, #09732E)'
                  : 'rgba(255,255,255,0.08)',
                opacity: fromCity === toCity ? 0.5 : 1,
              }}
              whileHover={fromCity !== toCity ? { scale: 1.02 } : {}}
              whileTap={fromCity !== toCity ? { scale: 0.98 } : {}}
            >
              <Search size={16} />
              {ar ? 'خطط رحلتي' : 'Plan My Journey'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Mode legend */}
        <div className="flex gap-2 flex-wrap">
          {Object.entries(MODE_CONFIG).map(([mode, cfg]) => (
            <div key={mode} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}25` }}>
              <cfg.icon size={11} />
              <span>{ar ? cfg.labelAr : cfg.label}</span>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {searched && plans.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Journey summary bar */}
              {(() => {
                const active = plans.find(p => p.id === selectedPlan) ?? plans[0];
                return (
                  <div
                    className="rounded-2xl p-4 flex items-center gap-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(4,173,191,0.12), rgba(9,115,46,0.06))',
                      border: '1px solid rgba(4,173,191,0.25)',
                    }}
                  >
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">{ar ? 'الرحلة المختارة' : 'Selected journey'}</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {ar ? active.labelAr : active.label}
                      </p>
                    </div>
                    <div className="flex gap-4 text-center">
                      <div>
                        <p className="text-lg font-black text-white">{active.totalDurationMin}m</p>
                        <p className="text-xs text-slate-400">{ar ? 'وقت' : 'Time'}</p>
                      </div>
                      <div>
                        <p className="text-lg font-black" style={{ color: '#D9965B' }}>
                          JOD {active.totalCostJOD.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400">{ar ? 'تكلفة' : 'Cost'}</p>
                      </div>
                      <div>
                        <p className="text-lg font-black" style={{ color: '#22C55E' }}>
                          {Math.round(active.totalCo2SavedGrams / 1000 * 10) / 10}kg
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-0.5 justify-center">
                          <Leaf size={9} />CO₂
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Plans */}
              {plans.map((plan, idx) => {
                const isExpanded = expandedPlan === plan.id;
                const isSelected = selectedPlan === plan.id;
                const typeCfg = typeConfig[plan.type];
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      border: `1px solid ${isSelected ? 'rgba(4,173,191,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      background: 'var(--wasel-glass-lg)',
                    }}
                  >
                    {/* Plan header */}
                    <button
                      onClick={() => {
                        setExpandedPlan(isExpanded ? null : plan.id);
                        setSelectedPlan(plan.id);
                      }}
                      className="w-full p-4 flex items-center gap-3"
                    >
                      {/* Mode icons row */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {plan.legs.map((leg, li) => {
                          const cfg = MODE_CONFIG[leg.mode];
                          return (
                            <div key={leg.id} className="flex items-center gap-1">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: cfg.bg }}>
                                <cfg.icon size={13} style={{ color: cfg.color }} />
                              </div>
                              {li < plan.legs.length - 1 && (
                                <ChevronRight size={10} className="text-slate-600"
                                  style={{ transform: ar ? 'scaleX(-1)' : 'none' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex-1 text-start min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">
                            {ar ? plan.labelAr : plan.label}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: `${typeCfg.color}18`,
                              color: typeCfg.color,
                              border: `1px solid ${typeCfg.color}30`,
                            }}
                          >
                            {ar ? typeCfg.labelAr : typeCfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                          <span className="flex items-center gap-0.5">
                            <Clock size={10} />{plan.totalDurationMin}m
                          </span>
                          <span>·</span>
                          <span className="font-medium" style={{ color: '#D9965B' }}>
                            JOD {plan.totalCostJOD.toFixed(1)}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-green-400">
                            <Leaf size={9} />{Math.round(plan.totalCo2SavedGrams / 1000 * 10) / 10}kg saved
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isSelected && (
                          <CheckCircle2 size={16} className="text-teal-400" />
                        )}
                        <ChevronDown
                          size={16} className="text-slate-500 transition-transform"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </div>
                    </button>

                    {/* Expanded legs */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2 border-t"
                            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <p className="text-xs text-slate-500 pt-3 pb-1">
                              {ar ? 'تفاصيل كل مرحلة' : 'Journey leg details'}
                            </p>
                            {plan.legs.map((leg) => (
                              <LegCard key={leg.id} leg={leg} ar={ar} />
                            ))}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full mt-3 py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2"
                              style={{ background: 'linear-gradient(135deg, #04ADBF, #09732E)' }}
                            >
                              {ar ? 'ابدأ هذه الرحلة' : 'Start This Journey'}
                              <ArrowRight size={15} style={{ transform: ar ? 'scaleX(-1)' : 'none' }} />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {/* Disclaimer */}
              <div className="rounded-xl p-3 flex items-start gap-2"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <AlertCircle size={13} className="text-slate-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500">
                  {ar
                    ? 'تكاليف الحافلة والتاكسي والسكوتر تقريبية. واصل هو الوضع الأساسي للرحلات بين المدن (50-500 كم). خدمات الكيلومتر الأول والأخير تعتمد على التوافر المحلي.'
                    : 'Bus, taxi, and scooter costs are approximate. Wasel is the primary mode for intercity trips (50–500 km). First/last-mile services depend on local availability.'}
                </p>
              </div>
            </motion.div>
          )}

          {!searched && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(4,173,191,0.08)', border: '2px dashed rgba(4,173,191,0.2)' }}>
                <Navigation2 size={32} className="text-teal-700" />
              </div>
              <div>
                <p className="text-white font-semibold">{ar ? 'خطط رحلتك متعددة الوسائل' : 'Plan your multi-modal journey'}</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  {ar
                    ? 'اختر مدينة الانطلاق والوجهة للحصول على خطة رحلة شاملة تدمج واصل مع وسائل النقل الأخرى'
                    : 'Select origin and destination to get a full journey plan combining Wasel with other transport modes'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default MultiModalPlanner;