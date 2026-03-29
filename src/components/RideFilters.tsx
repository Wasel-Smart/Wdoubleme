/**
 * RideFilters — BlaBlaCar-style ride filter panel
 *
 * Consolidated from: AdvancedFilters (Phase 2 naming cleanup)
 * 
 * Sections:
 *   - Departure time (time-range checkboxes)
 *   - Trust & safety
 *   - Amenities
 *   - Price range (slider)
 */

import { useState } from 'react';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import {
  ShieldCheck,
  Users,
  Zap,
  Cigarette,
  Music,
  Dog,
  Luggage,
  Baby,
  Snowflake,
  Wifi,
  Sun,
  Moon,
  X,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface TimeSlot {
  id: string;
  label: string;
  sub?: string;
  count: number;
  icon?: React.ReactNode;
}

interface FilterOption {
  id: string;
  label: string;
  labelAr?: string;
  count: number;
  icon?: React.ReactNode;
}

export interface RideFilters {
  timeSlots: string[];
  verified: boolean;
  instantBook: boolean;
  ladies: boolean;
  pets: boolean;
  smoking: boolean;
  music: boolean;
  luggage: boolean;
  kids: boolean;
  ac: boolean;
  wifi: boolean;
  priceRange: [number, number];
}

interface RideFiltersProps {
  filters: RideFilters;
  onFiltersChange: (newFilters: RideFilters) => void;
  onApply: () => void;
  onReset: () => void;
  totalResults: number;
  isRTL?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────────────────────

const TIME_SLOTS: TimeSlot[] = [
  {
    id: 'morning',
    label: 'Morning',
    sub: '6:00 - 12:00',
    count: 24,
    icon: <Sun className="w-4 h-4" />,
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    sub: '12:00 - 18:00',
    count: 18,
    icon: <Sun className="w-4 h-4" />,
  },
  {
    id: 'evening',
    label: 'Evening',
    sub: '18:00 - 24:00',
    count: 12,
    icon: <Moon className="w-4 h-4" />,
  },
];

const SAFETY_OPTIONS: FilterOption[] = [
  {
    id: 'verified',
    label: 'Verified drivers',
    labelAr: 'سائقين معتمدين',
    count: 38,
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: 'instantBook',
    label: 'Instant booking',
    labelAr: 'حجز فوري',
    count: 22,
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'ladies',
    label: 'Ladies only',
    labelAr: 'سيدات فقط',
    count: 8,
    icon: <Users className="w-4 h-4" />,
  },
];

const AMENITY_OPTIONS: FilterOption[] = [
  {
    id: 'pets',
    label: 'Pets allowed',
    labelAr: 'حيوانات مسموح',
    count: 5,
    icon: <Dog className="w-4 h-4" />,
  },
  {
    id: 'smoking',
    label: 'Non-smoking',
    labelAr: 'غير مدخن',
    count: 42,
    icon: <Cigarette className="w-4 h-4" />,
  },
  {
    id: 'music',
    label: 'Music OK',
    labelAr: 'موسيقى مسموح',
    count: 28,
    icon: <Music className="w-4 h-4" />,
  },
  {
    id: 'luggage',
    label: 'Extra luggage',
    labelAr: 'حقائب إضافية',
    count: 15,
    icon: <Luggage className="w-4 h-4" />,
  },
  {
    id: 'kids',
    label: 'Kids friendly',
    labelAr: 'مناسب للأطفال',
    count: 19,
    icon: <Baby className="w-4 h-4" />,
  },
  {
    id: 'ac',
    label: 'Air conditioning',
    labelAr: 'تكييف',
    count: 50,
    icon: <Snowflake className="w-4 h-4" />,
  },
  {
    id: 'wifi',
    label: 'WiFi',
    labelAr: 'واي فاي',
    count: 12,
    icon: <Wifi className="w-4 h-4" />,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export function RideFilters({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  totalResults,
  isRTL = false,
}: RideFiltersProps) {
  const activeCount =
    filters.timeSlots.length +
    [filters.verified, filters.instantBook, filters.ladies].filter(Boolean).length +
    [
      filters.pets,
      filters.smoking,
      filters.music,
      filters.luggage,
      filters.kids,
      filters.ac,
      filters.wifi,
    ].filter(Boolean).length +
    (filters.priceRange[0] !== 1 || filters.priceRange[1] !== 50 ? 1 : 0);

  const toggleTimeSlot = (id: string) => {
    const newSlots = filters.timeSlots.includes(id)
      ? filters.timeSlots.filter(s => s !== id)
      : [...filters.timeSlots, id];
    onFiltersChange({ ...filters, timeSlots: newSlots });
  };

  const toggleSafety = (id: 'verified' | 'instantBook' | 'ladies') => {
    onFiltersChange({ ...filters, [id]: !filters[id] });
  };

  const toggleAmenity = (id: keyof RideFilters) => {
    onFiltersChange({ ...filters, [id]: !filters[id] });
  };

  return (
    <div className="flex flex-col h-full bg-card text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-base font-semibold">
            {isRTL ? 'تصفية الرحلات' : 'Filter rides'}
          </h3>
          {activeCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeCount} {isRTL ? 'فلتر نشط' : 'active filters'}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {isRTL ? 'إعادة تعيين' : 'Reset all'}
        </Button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Time slots */}
        <section>
          <h4 className="text-sm font-semibold mb-3">
            {isRTL ? 'وقت المغادرة' : 'Departure time'}
          </h4>
          <div className="space-y-2">
            {TIME_SLOTS.map(slot => {
              const active = filters.timeSlots.includes(slot.id);
              return (
                <button
                  key={slot.id}
                  onClick={() => toggleTimeSlot(slot.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    active
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`${
                        active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {slot.icon}
                    </span>
                    <div className="text-left">
                      <p className="text-sm font-medium">{slot.label}</p>
                      <p className="text-xs text-muted-foreground">{slot.sub}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {slot.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Safety & trust */}
        <section>
          <h4 className="text-sm font-semibold mb-3">
            {isRTL ? 'الأمان والثقة' : 'Trust & safety'}
          </h4>
          <div className="space-y-2">
            {SAFETY_OPTIONS.map(opt => {
              const active = filters[opt.id as 'verified' | 'instantBook' | 'ladies'];
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleSafety(opt.id as any)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    active
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`${
                        active ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {opt.icon}
                    </span>
                    <p className="text-sm font-medium">
                      {isRTL ? opt.labelAr : opt.label}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Amenities */}
        <section>
          <h4 className="text-sm font-semibold mb-3">
            {isRTL ? 'المزايا' : 'Amenities'}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {AMENITY_OPTIONS.map(opt => {
              const active = filters[opt.id as keyof RideFilters];
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleAmenity(opt.id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    active
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <span
                    className={`mb-1 ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <p className="text-xs font-medium text-center">
                    {isRTL ? opt.labelAr : opt.label}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <Separator />

        {/* Price range */}
        <section>
          <h4 className="text-sm font-semibold mb-3">
            {isRTL ? 'نطاق السعر' : 'Price range'}
          </h4>
          <div className="space-y-4">
            <Slider
              min={1}
              max={50}
              step={1}
              value={filters.priceRange}
              onValueChange={(val: number[]) =>
                onFiltersChange({ ...filters, priceRange: val as [number, number] })
              }
              className="w-full"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>JOD {filters.priceRange[0]}</span>
              <span>JOD {filters.priceRange[1]}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button onClick={onApply} className="w-full" size="lg">
          {isRTL ? 'عرض' : 'Show'} {totalResults}{' '}
          {isRTL ? 'رحلات' : 'rides'}
        </Button>
      </div>
    </div>
  );
}
