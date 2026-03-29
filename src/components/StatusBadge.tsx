/**
 * StatusBadge — /components/StatusBadge.tsx
 * Shared standardized status badge component (Phase 4 — UI System)
 * Accepts any booking/trip/package status and maps to semantic tokens.
 */

type StatusKey =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'published'
  | 'in_progress'
  | 'picked_up'
  | 'delivered'
  | 'active';

interface StatusConfig {
  labelEn: string;
  labelAr: string;
  className: string;
}

const STATUS_MAP: Record<StatusKey, StatusConfig> = {
  pending:     { labelEn: 'Pending',     labelAr: 'قيد الانتظار', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  accepted:    { labelEn: 'Accepted',    labelAr: 'مقبول',        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected:    { labelEn: 'Rejected',    labelAr: 'مرفوض',        className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  cancelled:   { labelEn: 'Cancelled',   labelAr: 'ملغى',         className: 'bg-red-500/10 text-red-400 border-red-500/20' },
  completed:   { labelEn: 'Completed',   labelAr: 'مكتمل',        className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  published:   { labelEn: 'Available',   labelAr: 'متاح',         className: 'bg-primary/10 text-primary border-primary/20' },
  in_progress: { labelEn: 'In Progress', labelAr: 'جارٍ',         className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  picked_up:   { labelEn: 'Picked Up',   labelAr: 'تم الاستلام',  className: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  delivered:   { labelEn: 'Delivered',   labelAr: 'تم التسليم',   className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  active:      { labelEn: 'Active',      labelAr: 'نشط',          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

interface StatusBadgeProps {
  status: string;
  language?: string;
  className?: string;
}

export function StatusBadge({ status, language = 'en', className = '' }: StatusBadgeProps) {
  const key = status as StatusKey;
  const cfg: StatusConfig = STATUS_MAP[key] ?? {
    labelEn: status,
    labelAr: status,
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${cfg.className} ${className}`}
    >
      {language === 'ar' ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}
