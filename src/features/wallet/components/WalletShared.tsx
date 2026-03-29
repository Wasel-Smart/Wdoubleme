/**
 * WalletShared — Shared sub-components for the WalletDashboard
 * Extracted from the 1000+ line monolith to improve maintainability.
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, ArrowDownLeft, ArrowUpRight, Send, Gift, RefreshCw,
  TrendingUp, Clock, CheckCircle, Lock, Crown, Zap,
  CreditCard,
} from 'lucide-react';
import { WaselColors } from '../../../tokens/wasel-tokens';

// ── TX_ICONS ───────────────────────────────────────────────────────────────
export const TX_ICONS: Record<string, any> = {
  topup: { icon: Plus, color: WaselColors.success, bg: 'bg-green-500/10' },
  payment: { icon: CreditCard, color: WaselColors.error, bg: 'bg-red-500/10' },
  earning: { icon: TrendingUp, color: WaselColors.teal, bg: 'bg-teal-500/10' },
  withdrawal: { icon: ArrowUpRight, color: WaselColors.warning, bg: 'bg-orange-500/10' },
  refund: { icon: RefreshCw, color: WaselColors.info, bg: 'bg-blue-500/10' },
  send: { icon: Send, color: WaselColors.bronze, bg: 'bg-amber-500/10' },
  receive: { icon: ArrowDownLeft, color: WaselColors.success, bg: 'bg-green-500/10' },
  reward: { icon: Gift, color: '#A855F7', bg: 'bg-purple-500/10' },
  subscription: { icon: Crown, color: WaselColors.bronze, bg: 'bg-amber-500/10' },
  escrow_hold: { icon: Lock, color: WaselColors.warning, bg: 'bg-yellow-500/10' },
  escrow_release: { icon: CheckCircle, color: WaselColors.success, bg: 'bg-green-500/10' },
  cashback: { icon: Zap, color: '#A855F7', bg: 'bg-purple-500/10' },
};

export const PIE_COLORS = ['#04ADBF', '#D9965B', '#22C55E', '#A855F7', '#3B82F6', '#F59E0B', '#EF4444'];

// ── TransactionRow ─────────────────────────────────────────────────────────
export function TransactionRow({ tx, isRTL, jodLabel }: { tx: any; isRTL: boolean; jodLabel: string }) {
  const txType = tx.type || 'payment';
  const iconCfg = TX_ICONS[txType] || TX_ICONS.payment;
  const Icon = iconCfg.icon;
  const amount = tx.amount ?? 0;
  const isPositive = amount > 0;
  const date = new Date(tx.createdAt || tx.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconCfg.bg}`}>
        <Icon className="w-5 h-5" style={{ color: iconCfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
        <p className="text-xs text-muted-foreground">
          {date.toLocaleDateString(isRTL ? 'ar-JO' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}{amount.toFixed(2)} {jodLabel}
      </span>
    </motion.div>
  );
}

// ── ActionModal ────────────────────────────────────────────────────────────
export function ActionModal({ show, onClose, title, children }: { show: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-border/50 p-6 space-y-4"
            style={{ background: WaselColors.navyCard }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
