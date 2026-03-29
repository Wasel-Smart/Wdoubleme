/**
 * LiveRouteActivity — Real-time route activity from backend data
 */

import { motion } from 'motion/react';
import { useRouteActivity } from '../../../hooks/useCommunityStats';

const ROUTE_COLORS: Record<string, string> = {
  aqaba: '#04ADBF', irbid: '#09732E', 'dead sea': '#0EA5E9',
  zarqa: '#8B5CF6', petra: '#D9965B', 'wadi rum': '#F59E0B',
  madaba: '#EC4899', "ma'an": '#F97316',
};

function getRouteColor(to: string): string {
  return ROUTE_COLORS[to.toLowerCase()] ?? '#64748B';
}

function PulseDot({ color = '#04ADBF', size = 6, delay = 0 }: { color?: string; size?: number; delay?: number }) {
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

// Fallback data when API returns empty
const FALLBACK_ROUTES = [
  { from: 'Amman', fromAr: '\u0639\u0645\u0651\u0627\u0646', to: 'Aqaba', toAr: '\u0627\u0644\u0639\u0642\u0628\u0629', count: 0 },
  { from: 'Amman', fromAr: '\u0639\u0645\u0651\u0627\u0646', to: 'Irbid', toAr: '\u0625\u0631\u0628\u062F', count: 0 },
  { from: 'Amman', fromAr: '\u0639\u0645\u0651\u0627\u0646', to: 'Dead Sea', toAr: '\u0627\u0644\u0628\u062D\u0631 \u0627\u0644\u0645\u064A\u062A', count: 0 },
  { from: 'Amman', fromAr: '\u0639\u0645\u0651\u0627\u0646', to: 'Zarqa', toAr: '\u0627\u0644\u0632\u0631\u0642\u0627\u0621', count: 0 },
];

export function LiveRouteActivity({ ar }: { ar: boolean }) {
  const { routes: apiRoutes, loading } = useRouteActivity();
  const routes = apiRoutes.length > 0 ? apiRoutes : FALLBACK_ROUTES;

  return (
    <div className="grid grid-cols-2 gap-2">
      {routes.slice(0, 4).map((r, i) => {
        const color = getRouteColor(r.to);
        return (
          <motion.div key={`${r.from}-${r.to}`}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-2 p-2.5 rounded-xl"
            style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
            <PulseDot color={color} size={6} delay={i * 0.3} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate" style={{ fontSize: '0.68rem' }}>
                {ar ? r.toAr : r.to}
              </p>
              <p style={{ color: color, fontSize: '0.55rem', fontWeight: 700 }}>
                {r.count} {ar ? '\u0631\u062D\u0644\u0629' : 'rides'}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
