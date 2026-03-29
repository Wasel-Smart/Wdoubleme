/**
 * CommunityImpactBanner — Animated community stats from real backend data
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CircleDollarSign, TreePine, Package } from 'lucide-react';
import { useCommunityStats } from '../../../hooks/useCommunityStats';

function AnimatedNumber({ value, duration = 1500, prefix = '', suffix = '' }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

function PulseDot({ color = '#04ADBF', size = 8, delay = 0 }: { color?: string; size?: number; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
      className="relative" style={{ width: size, height: size }}>
      <motion.div animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, delay }}
        className="absolute inset-0 rounded-full" style={{ background: color }} />
      <div className="absolute inset-0 rounded-full" style={{ background: color }} />
    </motion.div>
  );
}

export function CommunityImpactBanner({ ar }: { ar: boolean }) {
  const { stats } = useCommunityStats();
  const [activeIdx, setActiveIdx] = useState(0);

  const impacts = [
    { value: stats.total_passengers, suffix: '', label: ar ? 'مسافر وفّر مع واصل' : 'passengers saved with Wasel', icon: Users, color: '#04ADBF' },
    { value: Math.round(stats.total_saved_jod), suffix: ' JOD', label: ar ? 'تم توفيرهم هالشهر' : 'saved this month', icon: CircleDollarSign, color: '#22C55E' },
    { value: stats.co2_saved_kg, suffix: ' kg', label: ar ? 'CO\u2082 أقل بفضلكم' : 'CO\u2082 reduced by you', icon: TreePine, color: '#10B981' },
    ...(stats.packages_delivered > 0 ? [{ value: stats.packages_delivered, suffix: '', label: ar ? 'طرد تم توصيله' : 'packages delivered', icon: Package, color: '#D9965B' }] : []),
  ];

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx(p => (p + 1) % impacts.length), 4000);
    return () => clearInterval(timer);
  }, [impacts.length]);

  const current = impacts[activeIdx];
  const Icon = current.icon;

  return (
    <motion.div layout className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(4,173,191,0.06), rgba(9,115,46,0.04))',
        border: '1px solid rgba(4,173,191,0.12)',
      }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${current.color}10 0%, transparent 70%)`, filter: 'blur(20px)' }} />
      <div className="flex items-center gap-3 relative z-10">
        <div className="flex gap-1">
          {impacts.map((_, i) => (
            <div key={i} className="w-1 h-6 rounded-full transition-all duration-500"
              style={{ background: i === activeIdx ? current.color : 'rgba(100,116,139,0.2)', width: i === activeIdx ? 3 : 2 }} />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeIdx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
            className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${current.color}15`, border: `1px solid ${current.color}25` }}>
              <Icon className="w-5 h-5" style={{ color: current.color }} />
            </div>
            <div>
              <p className="font-black text-foreground" style={{ fontSize: '1.15rem' }}>
                <AnimatedNumber value={current.value} suffix={current.suffix} />
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem', fontWeight: 500 }}>
                {current.label}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
        <PulseDot color={current.color} size={6} />
      </div>
    </motion.div>
  );
}
