/**
 * AIRecommendations — "Recommended For You" section from the Wasel design system.
 *
 * Exact match to the screenshot: dark cards with background images,
 * DAILY PATTERN (orange) and BEST PRICE (green) badges,
 * bilingual title/subtitle, bold JOD pricing, Quick Book buttons.
 */

import { motion } from 'motion/react';
import { Brain, Clock, DollarSign, Sparkles, MapPin, TrendingUp, Users, Zap } from 'lucide-react';
import { WaselCard } from './WaselCard';
import { WaselSectionHeader } from './WaselSectionHeader';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AIRecommendationsProps {
  onQuickBook?: (id: string) => void;
}

export function AIRecommendations({ onQuickBook }: AIRecommendationsProps) {
  return (
    <section aria-label="AI Recommendations">
      <WaselSectionHeader
        icon={<Brain className="w-5 h-5" />}
        title="Recommended For You"
        titleAr="مقترح لك بالذكاء الاصطناعي"
        badge="live"
        badgeLabel="LIVE DATA"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Card 1: Morning Commute — DAILY PATTERN */}
        <WaselCard
          image="https://images.unsplash.com/photo-1766330301316-9db45ccf9bb5?w=600&q=80"
          badge={{ label: 'DAILY PATTERN', icon: <Sparkles className="w-3 h-3" /> }}
          accent="orange"
          icon={<Clock className="w-4 h-4" />}
          title="Morning Commute"
          titleAr="تنقل صباحي"
          description="AI detected your daily route — Amman to Zarqa at 7:30 AM"
          price="1.25"
          buttonText="Quick Book"
          onAction={() => onQuickBook?.('morning-commute')}
        />

        {/* Card 2: Cheapest Ride — BEST PRICE */}
        <WaselCard
          image="https://images.unsplash.com/photo-1601785898043-e907ad481bad?w=600&q=80"
          badge={{ label: 'BEST PRICE', icon: <Sparkles className="w-3 h-3" /> }}
          accent="green"
          icon={<DollarSign className="w-4 h-4" />}
          title="Cheapest Ride Now"
          titleAr="أرخص رحلة الآن"
          description="WASEL carpool to Downtown — 3 seats available"
          price="0.75"
          buttonText="Quick Book"
          onAction={() => onQuickBook?.('cheapest-ride')}
        />

        {/* Card 3: AI Optimized — SMART ROUTE */}
        <WaselCard
          image="https://images.unsplash.com/photo-1760688966834-92d874340816?w=600&q=80"
          badge={{ label: 'AI PICK', icon: <Zap className="w-3 h-3" /> }}
          accent="cyan"
          icon={<MapPin className="w-4 h-4" />}
          title="Smart Express Route"
          titleAr="مسار سريع ذكي"
          description="AI-optimized fastest route via University St — 12 min"
          price="2.50"
          buttonText="Quick Book"
          onAction={() => onQuickBook?.('smart-express')}
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {[
          { icon: TrendingUp, label: 'Trips Today', labelAr: 'رحلات اليوم', value: '1,247', color: 'text-cyan-400' },
          { icon: Users, label: 'Active Drivers', labelAr: 'سائقون نشطون', value: '342', color: 'text-emerald-400' },
          { icon: DollarSign, label: 'Avg. Fare', labelAr: 'متوسط الأجرة', value: '1.85 JOD', color: 'text-amber-400' },
          { icon: Zap, label: 'AI Matches', labelAr: 'تطابقات ذكية', value: '89%', color: 'text-primary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            className="rounded-xl bg-card border border-border p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</span>
            </div>
            <p className="text-white font-bold text-lg">{stat.value}</p>
            <p className="text-slate-600 text-[10px]" dir="rtl">{stat.labelAr}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}