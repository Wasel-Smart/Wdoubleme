/**
 * JourneyStreak — Gamification streak widget wired to real backend data
 */

import { motion } from 'motion/react';
import { Badge } from '../../../components/ui/badge';
import { useJourneyStreak } from '../../../hooks/useCommunityStats';

export function JourneyStreak({ ar }: { ar: boolean }) {
  const { streak, longestStreak, badges } = useJourneyStreak();

  if (streak <= 0) return null;

  const milestones = [3, 5, 10, 25, 50];
  const nextMilestone = milestones.find(m => m > streak) || 100;
  const pct = Math.round((streak / nextMilestone) * 100);

  const isElite = badges.includes('elite') || streak >= 10;
  const isDedicated = badges.includes('dedicated') || streak >= 5;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05))',
        border: '1px solid rgba(245,158,11,0.2)',
      }}>
      <div className="absolute -top-2 -right-2 text-5xl opacity-[0.06] pointer-events-none">{'\uD83D\uDD25'}</div>
      <div className="flex items-center gap-3 relative z-10">
        <motion.div animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)' }}>
          {'\uD83D\uDD25'}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-black" style={{ color: '#F59E0B', fontSize: '1.1rem' }}>
              {streak} {ar ? '\u0623\u0633\u0628\u0648\u0639 \u0645\u062A\u062A\u0627\u0644\u064A!' : 'week streak!'}
            </p>
            {isElite && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[0.55rem] font-bold">{'\uD83C\uDFC6'} Elite</Badge>}
            {!isElite && isDedicated && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[0.55rem] font-bold">{'\u2B50'} Dedicated</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }} />
            </div>
            <span style={{ color: 'rgba(245,158,11,0.7)', fontSize: '0.6rem', fontWeight: 700 }}>
              {streak}/{nextMilestone}
            </span>
          </div>
          {longestStreak > streak && (
            <p style={{ color: 'rgba(245,158,11,0.5)', fontSize: '0.55rem', marginTop: 4 }}>
              {ar ? `أطول سلسلة: ${longestStreak} أسبوع` : `Longest: ${longestStreak} weeks`}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
