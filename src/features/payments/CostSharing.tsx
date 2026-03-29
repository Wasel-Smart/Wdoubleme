/**
 * CostSharing — /features/payments/CostSharing.tsx
 * Cost breakdown display — integrated before payment confirmation.
 * Shows total trip cost, cost per passenger, seats booked.
 * Token-based styling only. No hardcoded hex values.
 */

import { motion } from 'motion/react';
import { Fuel, Users, DivideCircle, CircleDollarSign, Info } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatCurrency } from '../../utils/currency';
import { useCountry } from '../../contexts/CountryContext';
import { getRegion } from '../../utils/regionConfig';

interface CostSharingProps {
  from: string;
  to: string;
  distanceKm: number;
  pricePerSeat: number;
  seatsBooked: number;
  totalSeats?: number;
  paymentMethod?: string;
}

export function CostSharing({
  from,
  to,
  distanceKm,
  pricePerSeat,
  seatsBooked,
  totalSeats = 3,
  paymentMethod = 'cash_on_arrival',
}: CostSharingProps) {
  const { language } = useLanguage();
  const ar = language === 'ar';

  // Gap #11 Fix ✅ — use regionConfig fuel price, not hardcoded JOD 0.90/L
  const { currentCountry } = useCountry();
  const region = getRegion(currentCountry?.iso_alpha2 || 'JO');
  const fuelPerLiter = region.fuel.priceInJOD;
  const efficiencyPer100km = region.fuel.efficiencyLper100km;
  const totalFuelLiters = (distanceKm / 100) * efficiencyPer100km;
  const totalFuelCost = totalFuelLiters * fuelPerLiter;
  const estimatedCostPerSeat = totalFuelCost / totalSeats;

  const subtotal = pricePerSeat * seatsBooked;
  const onlineDiscount = paymentMethod === 'card' ? subtotal * 0.05 : 0;
  const total = subtotal - onlineDiscount;

  const rows = [
    {
      label: ar ? 'سعر المقعد الواحد' : 'Price per seat',
      value: formatCurrency(pricePerSeat),
      sub: ar ? 'مشاركة تكلفة الوقود' : 'Fuel cost-sharing',
      icon: Fuel,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: ar ? 'عدد المقاعد المحجوزة' : 'Seats booked',
      value: `× ${seatsBooked}`,
      sub: ar ? `من أصل ${totalSeats} مقاعد` : `of ${totalSeats} available`,
      icon: Users,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
    {
      label: ar ? 'المجموع الفرعي' : 'Subtotal',
      value: formatCurrency(subtotal),
      sub: ar ? 'قبل الخصومات' : 'before discounts',
      icon: DivideCircle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
      dir={ar ? 'rtl' : 'ltr'}
    >
      {/* Route header */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-bold text-foreground">{from}</span>
          <span>→</span>
          <span className="font-bold text-foreground">{to}</span>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] ml-auto">
          {ar ? 'مشاركة رحلة' : 'Carpooling'}
        </Badge>
      </div>

      <Card className="bg-card border border-border overflow-hidden">
        {/* Cost breakdown rows */}
        <div className="divide-y divide-border">
          {rows.map(({ label, value, sub, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
              <span className={`text-sm font-black ${color} tabular-nums`}>{value}</span>
            </div>
          ))}

          {/* Online discount row */}
          {onlineDiscount > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <CircleDollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-emerald-400">
                  {ar ? 'خصم الدفع الإلكتروني' : 'Online payment discount'}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {ar ? 'توفّر ٥٪ عند الدفع بالبطاقة' : 'Save 5% when paying by card'}
                </p>
              </div>
              <span className="text-sm font-black text-emerald-400 tabular-nums">
                -{formatCurrency(onlineDiscount)}
              </span>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="px-4 py-4 bg-primary/5 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">
                {ar ? 'المبلغ الإجمالي' : 'Total Amount'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {ar
                  ? `${seatsBooked} مقعد × ${formatCurrency(pricePerSeat)}`
                  : `${seatsBooked} seat(s) × ${formatCurrency(pricePerSeat)}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary tabular-nums">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Cost-sharing note */}
      <div className="flex items-start gap-2 px-1">
        <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {ar
            ? `السعر محسوب على أساس مشاركة تكلفة الوقود: ${distanceKm} كم × ${fuelPerLiter} JOD/لتر ÷ ${totalSeats} مسافرين. لا يوجد تسعير ديناميكي.`
            : `Price based on fuel cost-sharing: ${distanceKm} km × ${fuelPerLiter} JOD/L ÷ ${totalSeats} passengers. No surge pricing.`}
        </p>
      </div>
    </motion.div>
  );
}