import { Shield, Wallet, CreditCard, Package, Car, CheckCircle2, Clock3, ArrowRight, Sparkles, Landmark, BadgeCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { useLocalAuth } from '../contexts/LocalAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';

const C = {
  bg: '#040C18',
  card: '#0A1628',
  card2: '#0F1E35',
  border: 'rgba(0,200,232,0.12)',
  cyan: '#00C8E8',
  green: '#00C875',
  gold: '#F0A830',
  red: '#EF4444',
  text: '#EFF6FF',
  sub: 'rgba(239,246,255,0.68)',
  muted: 'rgba(148,163,184,0.75)',
  grad: 'linear-gradient(135deg,#00C8E8,#2060E8)',
  goldGrad: 'linear-gradient(135deg,#F0A830,#E89200)',
  greenGrad: 'linear-gradient(135deg,#00C875,#0EA5E9)',
  font: "-apple-system,'Inter','Cairo',sans-serif",
} as const;

type VerificationLevel = {
  id: 'level_0' | 'level_1' | 'level_2' | 'level_3';
  title: string;
  titleAr: string;
  description: string;
  complete: boolean;
};

function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: typeof Wallet;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div style={{
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: 18,
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minHeight: 140,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: 'grid',
          placeItems: 'center',
          background: `${color}20`,
          color,
          border: `1px solid ${color}33`,
        }}>
          <Icon size={18} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Live
        </span>
      </div>
      <div style={{ color: C.sub, fontSize: 13 }}>{title}</div>
      <div style={{ color: C.text, fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em' }}>{value}</div>
      <div style={{ color: C.muted, fontSize: 12 }}>{subtitle}</div>
    </div>
  );
}

function ActionTile({
  title,
  description,
  onClick,
  gradient,
}: {
  title: string;
  description: string;
  onClick: () => void;
  gradient: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: gradient,
        border: 'none',
        borderRadius: 18,
        padding: 18,
        color: '#041018',
        textAlign: 'left',
        cursor: 'pointer',
        minHeight: 126,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 10px 30px rgba(0,0,0,0.24)',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 900 }}>{title}</div>
      <div style={{ fontSize: 13, lineHeight: 1.45, opacity: 0.92 }}>{description}</div>
    </button>
  );
}

export default function WaselTrustCenter() {
  const { user } = useLocalAuth();
  const { language } = useLanguage();
  const nav = useIframeSafeNavigate();
  const isAr = language === 'ar';
  const balance = user?.balance ?? 23.5;
  const isVerified = Boolean(user?.sanadVerified ?? user?.verified);
  const isDriver = user?.role === 'driver' || user?.role === 'both';
  const verificationLevel = user?.verificationLevel ?? 'level_0';
  const backendMode = user?.backendMode ?? 'demo';
  const walletStatus = user?.walletStatus ?? 'active';

  const verificationLevels: VerificationLevel[] = [
    {
      id: 'level_0',
      title: 'Unverified',
      titleAr: 'غير موثّق',
      description: 'Account exists but cannot use financial or ride-critical privileges.',
      complete: true,
    },
    {
      id: 'level_1',
      title: 'Phone Verified',
      titleAr: 'توثيق الهاتف',
      description: 'Required for booking rides and sensitive session recovery.',
      complete: (user?.phoneVerified ?? false) || verificationLevel !== 'level_0',
    },
    {
      id: 'level_2',
      title: 'SANAD Verified',
      titleAr: 'موثّق عبر سند',
      description: 'Unlocks trust badge, higher wallet confidence, and secure package release.',
      complete: verificationLevel === 'level_2' || verificationLevel === 'level_3',
    },
    {
      id: 'level_3',
      title: 'Driver Verified',
      titleAr: 'سائق موثّق بالكامل',
      description: 'Required for trip publishing, package acceptance, and payout privileges.',
      complete: verificationLevel === 'level_3' && isDriver,
    },
  ];

  const currentLevel = verificationLevels.reduce((best, level, index) => level.complete ? index : best, 0);
  const trustScore = user?.trustScore ?? (isVerified ? (isDriver ? 96 : 88) : 62);
  const activeTrips = isDriver ? 2 : 1;
  const movingPackages = isDriver ? 1 : 0;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: C.font }}>
      <style>{`
        @media (max-width: 899px) {
          .trust-grid, .trust-actions, .trust-flow-grid, .trust-metrics {
            grid-template-columns: 1fr !important;
          }
          .trust-hero {
            padding: 22px 16px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 16px 48px' }}>
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="trust-hero"
          style={{
            background: 'linear-gradient(135deg,rgba(0,200,232,0.12),rgba(11,29,69,0.38),rgba(240,168,48,0.08))',
            border: `1px solid ${C.border}`,
            borderRadius: 26,
            padding: '28px 28px 26px',
            marginBottom: 22,
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 740 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'rgba(0,200,232,0.1)', border: `1px solid ${C.border}`, color: C.cyan, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
                <Shield size={14} />
                Trust Center
              </div>
              <h1 style={{ margin: 0, fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.05em' }}>
                {isAr ? 'مركز الثقة والهوية المالية' : 'Identity, wallet, and operational trust in one place'}
              </h1>
              <p style={{ margin: '14px 0 0', color: C.sub, fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
                {isAr
                  ? 'هذا المركز يجمع التوثيق عبر سند، صلاحيات المحفظة، تدفقات الرحلات، ومدى جاهزية الحساب لاستخدام النظام الإنتاجي.'
                  : 'This hub makes the platform feel production-grade by showing what the account can do, what is still gated, and how wallet, trips, and logistics interact in one operational view.'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.sub, fontSize: 12, fontWeight: 700 }}>
                  <Sparkles size={13} color={backendMode === 'supabase' ? C.green : C.gold} />
                  {backendMode === 'supabase' ? 'Live backend session' : 'Demo mode fallback'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, color: C.sub, fontSize: 12, fontWeight: 700 }}>
                  <Wallet size={13} color={walletStatus === 'active' ? C.green : walletStatus === 'limited' ? C.gold : C.red} />
                  Wallet {walletStatus}
                </span>
              </div>
            </div>
            <div style={{
              minWidth: 220,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${C.border}`,
              borderRadius: 20,
              padding: 16,
            }}>
              <div style={{ color: C.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Current trust level
              </div>
              <div style={{ marginTop: 8, fontSize: 26, fontWeight: 900 }}>
                L{currentLevel}
              </div>
              <div style={{ marginTop: 4, color: isVerified ? C.green : C.gold, fontSize: 14, fontWeight: 700 }}>
                {isVerified ? 'SANAD-linked account' : 'Verification still required'}
              </div>
              <div style={{ marginTop: 14, height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${((currentLevel + 1) / verificationLevels.length) * 100}%`, height: '100%', background: C.grad }} />
              </div>
            </div>
          </div>
        </motion.section>

        <section className="trust-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
          <StatCard icon={Wallet} title="Wallet balance" value={`JOD ${balance.toFixed(2)}`} subtitle="Central financial identity for rides, packages, and payouts." color={C.cyan} />
          <StatCard icon={BadgeCheck} title="Trust score" value={`${trustScore}/100`} subtitle="Based on verification, activity, and protected payments." color={C.green} />
          <StatCard icon={Car} title="Active trip load" value={`${activeTrips}`} subtitle="Trips currently available or assigned to this account." color={C.gold} />
          <StatCard icon={Package} title="Moving packages" value={`${movingPackages}`} subtitle="Package assignments currently tied to your trust profile." color={C.cyan} />
        </section>

        <section className="trust-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 16, marginBottom: 22 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Shield size={18} color={C.cyan} />
              <h2 style={{ margin: 0, fontSize: 20 }}>Verification Ladder</h2>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {verificationLevels.map((level, index) => (
                <div key={level.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  background: level.complete ? 'rgba(0,200,117,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${level.complete ? 'rgba(0,200,117,0.18)' : C.border}`,
                  borderRadius: 16,
                  padding: 14,
                }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: level.complete ? 'rgba(0,200,117,0.16)' : 'rgba(255,255,255,0.05)',
                    color: level.complete ? C.green : C.gold,
                  }}>
                    {level.complete ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800 }}>{index}. {isAr ? level.titleAr : level.title}</div>
                    <div style={{ marginTop: 4, color: C.sub, fontSize: 13, lineHeight: 1.5 }}>{level.description}</div>
                  </div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: level.complete ? C.green : C.gold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}>
                    {level.complete ? 'Ready' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Sparkles size={18} color={C.gold} />
              <h2 style={{ margin: 0, fontSize: 20 }}>Privilege Gates</h2>
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { icon: CreditCard, title: 'Wallet transfers', state: currentLevel >= 1, note: 'OTP and sufficient balance required.' },
                { icon: Car, title: 'Trip booking', state: currentLevel >= 1, note: 'Phone verification required before checkout.' },
                { icon: Package, title: 'Package release', state: currentLevel >= 2, note: 'SANAD-linked trust reduces fraud risk.' },
                { icon: Landmark, title: 'Driver payouts', state: currentLevel >= 3, note: 'Only fully verified drivers receive wallet earnings.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr auto',
                    gap: 12,
                    alignItems: 'center',
                    borderRadius: 14,
                    border: `1px solid ${C.border}`,
                    background: 'rgba(255,255,255,0.03)',
                    padding: 12,
                  }}>
                    <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 12, background: `${item.state ? C.green : C.red}18`, color: item.state ? C.green : C.red }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{item.title}</div>
                      <div style={{ marginTop: 3, fontSize: 12, color: C.muted }}>{item.note}</div>
                    </div>
                    <div style={{ color: item.state ? C.green : C.red, fontSize: 12, fontWeight: 800 }}>
                      {item.state ? 'Enabled' : 'Locked'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="trust-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginBottom: 22 }}>
          <ActionTile title="Open Wallet" description="Review balance, transfer money, and monitor protected transaction history." gradient={C.grad} onClick={() => nav('/wallet')} />
          <ActionTile title="Payment Ecosystem" description="Inspect payment rails, settlement flow, and operational payment readiness." gradient={C.goldGrad} onClick={() => nav('/payments')} />
          <ActionTile title="Book Protected Ride" description="Use trust-gated booking with wallet-first payment on the trip marketplace." gradient={C.greenGrad} onClick={() => nav('/find-ride')} />
          <ActionTile title="Logistics Flow" description="Create and assign packages inside the same verified operational network." gradient="linear-gradient(135deg,#94A3B8,#CBD5E1)" onClick={() => nav('/packages')} />
        </section>

        <section className="trust-flow-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Passenger Flow',
              icon: Car,
              color: C.cyan,
              steps: ['Find trip', 'Verify account level', 'Pay from wallet', 'Track trip in progress'],
            },
            {
              title: 'Driver Flow',
              icon: BadgeCheck,
              color: C.green,
              steps: ['Complete SANAD + documents', 'Publish trip', 'Accept bookings/packages', 'Receive wallet earnings'],
            },
            {
              title: 'Risk Controls',
              icon: AlertTriangle,
              color: C.gold,
              steps: ['OTP step-up', 'Transaction logs', 'Verification records', 'Admin review and freeze tools'],
            },
          ].map((flow) => {
            const Icon = flow.icon;
            return (
              <div key={flow.title} style={{ background: C.card2, border: `1px solid ${C.border}`, borderRadius: 22, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', background: `${flow.color}18`, color: flow.color }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{flow.title}</h3>
                </div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {flow.steps.map((step, index) => (
                    <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', color: C.sub, fontSize: 14, lineHeight: 1.5 }}>
                      <span style={{ marginTop: 1, color: flow.color, fontWeight: 900 }}>{index + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => nav(flow.title === 'Passenger Flow' ? '/find-ride' : flow.title === 'Driver Flow' ? '/dashboard' : '/trust')}
                  style={{
                    marginTop: 18,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'transparent',
                    border: 'none',
                    color: flow.color,
                    fontWeight: 800,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Open module
                  <ArrowRight size={15} />
                </button>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
