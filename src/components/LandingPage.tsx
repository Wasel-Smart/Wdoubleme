import { useMemo, useState, type CSSProperties, type ComponentType, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Menu,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onExploreRides: () => void;
  onOfferRide: () => void;
  onExplorePackages: () => void;
}

const corridorServices = [
  {
    title: 'Find Ride',
    subtitle: 'Live intercity seats',
    description: 'Search real corridor rides with clear times, seats, and pickup points.',
    icon: MapPin,
    accent: '#00C8E8',
  },
  {
    title: 'Offer Ride',
    subtitle: 'Turn empty seats into value',
    description: 'Publish your route once and let passengers and packages attach to it.',
    icon: TrendingUp,
    accent: '#F0A830',
  },
  {
    title: 'Packages',
    subtitle: 'Move parcels with trips already happening',
    description: 'Send small packages across Jordan using trusted seat inventory.',
    icon: Package,
    accent: '#00C875',
  },
  {
    title: 'Bus',
    subtitle: 'Scheduled certainty',
    description: 'Book fixed-price coach routes when you want structure over matching.',
    icon: Bus,
    accent: '#FFFFFF',
  },
];

const productSignals = [
  { label: 'Trusted riders and drivers', icon: ShieldCheck },
  { label: 'Intercity focus, not urban clutter', icon: Sparkles },
  { label: 'Packages linked to real routes', icon: Package },
];

const proofStats = [
  { value: '12+', label: 'Jordan corridors designed for launch' },
  { value: '3', label: 'Core actions visible above the fold' },
  { value: '1', label: 'Connected mobility network' },
];

const steps = [
  {
    title: 'Choose your journey',
    text: 'Open rides, offer a seat, or send a package without guessing where to start.',
  },
  {
    title: 'See the route clearly',
    text: 'Departure, corridor, trust, and price all stay visible instead of being hidden behind clutter.',
  },
  {
    title: 'Move with confidence',
    text: 'Track the trip, manage requests, and keep your mobility and logistics in one place.',
  },
];

const featuredRoutes = [
  { from: 'Amman', to: 'Irbid', note: 'High-frequency corridor' },
  { from: 'Amman', to: 'Aqaba', note: 'Long-distance flagship route' },
  { from: 'Amman', to: 'Zarqa', note: 'Fast daily commuter lane' },
  { from: 'Amman', to: 'Jerash', note: 'Regional culture route' },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-cyan-400/25 bg-[linear-gradient(145deg,rgba(0,200,232,0.22),rgba(240,168,48,0.14))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_40%)]" />
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full">
          <path
            d="M8 31L16 15L24 28L32 15L40 31"
            fill="none"
            stroke="#7EEBFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="31" r="2.5" fill="#7EEBFF" />
          <circle cx="16" cy="15" r="2.5" fill="#F0A830" />
          <circle cx="24" cy="28" r="2.5" fill="#7EEBFF" />
          <circle cx="32" cy="15" r="2.5" fill="#F0A830" />
          <circle cx="40" cy="31" r="2.5" fill="#7EEBFF" />
        </svg>
      </div>
      <div>
        <div className="text-xl font-black tracking-tight text-white" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
          Wasel
        </div>
        <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/55">Jordan Intercity Network</div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100/90">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
      {children}
    </div>
  );
}

function ServiceCard({
  title,
  subtitle,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  subtitle: string;
  description: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  accent: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10"
        style={{ background: `linear-gradient(145deg, ${accent}22, rgba(255,255,255,0.04))` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: `${accent}` }}>
        {subtitle}
      </div>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-medium text-white/70 transition group-hover:text-white">
        <span>Built into the same network</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </motion.div>
  );
}

function RoutePreview() {
  const pulses = useMemo(
    () => [
      { left: '14%', top: '26%', delay: 0 },
      { left: '46%', top: '18%', delay: 0.8 },
      { left: '66%', top: '40%', delay: 1.4 },
      { left: '24%', top: '72%', delay: 2 },
    ],
    [],
  );

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(3,10,20,0.96),rgba(10,22,40,0.92))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,200,232,0.16),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(240,168,48,0.16),transparent_32%)]" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/60">Live corridor board</div>
            <div className="mt-2 text-2xl font-semibold text-white">Jordan, but finally organized</div>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Clear network
          </div>
        </div>

        <div className="relative mt-5 h-[340px] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]">
          <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(255,255,255,0.04)_95%),linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.04)_95%)] bg-[size:56px_56px]" />
          <svg viewBox="0 0 420 340" className="absolute inset-0 h-full w-full">
            <defs>
              <linearGradient id="cyanRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7EEBFF" />
                <stop offset="100%" stopColor="#00C8E8" />
              </linearGradient>
              <linearGradient id="goldRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD070" />
                <stop offset="100%" stopColor="#F0A830" />
              </linearGradient>
            </defs>

            <path d="M90 72 C140 54 180 58 214 96 C252 138 290 164 338 186" fill="none" stroke="url(#cyanRoute)" strokeWidth="3" strokeLinecap="round" />
            <path d="M214 96 C192 160 178 210 150 268" fill="none" stroke="url(#goldRoute)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="7 7" />
            <path d="M214 96 C252 84 302 76 340 90" fill="none" stroke="#00C875" strokeWidth="2.4" strokeLinecap="round" />

            {[
              { x: 90, y: 72, color: '#7EEBFF', label: 'Amman' },
              { x: 214, y: 96, color: '#F0A830', label: 'Irbid' },
              { x: 338, y: 186, color: '#00C875', label: 'Zarqa' },
              { x: 150, y: 268, color: '#F0A830', label: 'Aqaba' },
              { x: 340, y: 90, color: '#7EEBFF', label: 'Jerash' },
            ].map((node) => (
              <g key={node.label}>
                <circle cx={node.x} cy={node.y} r="18" fill={node.color} opacity="0.12" />
                <circle cx={node.x} cy={node.y} r="8" fill="#07111f" stroke={node.color} strokeWidth="2" />
                <circle cx={node.x} cy={node.y} r="3" fill={node.color} />
                <text x={node.x + 12} y={node.y - 10} fill="rgba(239,246,255,0.88)" fontSize="12" fontWeight="600">
                  {node.label}
                </text>
              </g>
            ))}
          </svg>

          {pulses.map((pulse, index) => (
            <motion.div
              key={`${pulse.left}-${pulse.top}`}
              className="absolute h-3 w-3 rounded-full bg-cyan-300"
              style={{ left: pulse.left, top: pulse.top }}
              animate={{ scale: [1, 1.85, 1], opacity: [0.45, 0.08, 0.45] }}
              transition={{ duration: 2.6, delay: pulse.delay, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-cyan-400/15 bg-[#081525]/90 p-4 backdrop-blur-xl">
              <div className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/55">What users see</div>
              <div className="mt-2 text-lg font-semibold text-white">One route, many outcomes</div>
              <div className="mt-1 text-sm text-slate-300">Passengers, drivers, buses, and packages all stay attached to the same corridor logic.</div>
            </div>
            <div className="rounded-2xl border border-amber-400/15 bg-[#111523]/90 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between text-sm text-white">
                <span>Amman to Aqaba</span>
                <span className="rounded-full bg-amber-400/10 px-2 py-1 text-xs font-semibold text-amber-200">Flagship route</span>
              </div>
              <div className="mt-3 flex items-center gap-6 text-sm text-slate-300">
                <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-cyan-300" /> 4 hrs</span>
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-cyan-300" /> Seats + parcels</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage({
  onGetStarted,
  onLogin,
  onExploreRides,
  onOfferRide,
  onExplorePackages,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#040C18] text-slate-50">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(0,200,232,0.12),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(240,168,48,0.1),transparent_24%),linear-gradient(180deg,#040C18_0%,#071120_48%,#040C18_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:54px_54px] opacity-30" />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#040C18]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark />

          <nav className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
            <button className="transition hover:text-white" onClick={onExploreRides}>Find Ride</button>
            <button className="transition hover:text-white" onClick={onOfferRide}>Offer Ride</button>
            <button className="transition hover:text-white" onClick={onExplorePackages}>Packages</button>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={onLogin}
              className="rounded-full border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/[0.08] hover:text-white"
            >
              Log in
            </button>
            <button
              onClick={onGetStarted}
              className="rounded-full bg-[linear-gradient(135deg,#00C8E8_0%,#0095B8_100%)] px-5 py-2.5 text-sm font-semibold text-[#041018] shadow-[0_16px_34px_rgba(0,200,232,0.24)] transition hover:translate-y-[-1px]"
            >
              Get started
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/8 bg-[#050d19]/95 px-4 py-4 sm:px-6 lg:hidden">
            <div className="flex flex-col gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-white" onClick={onExploreRides}>Find Ride</button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-white" onClick={onOfferRide}>Offer Ride</button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-white" onClick={onExplorePackages}>Packages</button>
              <button className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-white" onClick={onLogin}>Log in</button>
              <button className="rounded-2xl bg-[linear-gradient(135deg,#00C8E8_0%,#0095B8_100%)] px-4 py-3 text-left font-semibold text-[#041018]" onClick={onGetStarted}>Get started</button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative">
          <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:px-8 lg:pb-28">
            <div>
              <SectionLabel>Jordan&apos;s intercity mobility network</SectionLabel>
              <h1
                className="mt-7 max-w-4xl text-[clamp(3.2rem,8vw,6.25rem)] font-black leading-[0.94] tracking-[-0.04em] text-white"
                style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}
              >
                Make intercity travel
                <span className="bg-[linear-gradient(135deg,#7EEBFF_0%,#00C8E8_52%,#F0A830_100%)] bg-clip-text text-transparent"> clearer </span>
                from the first tap.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Wasel brings rides, seat supply, packages, returns, and bus travel into one corridor network for Jordan.
                The experience stays focused, easy to scan, and ready for real customer traffic.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {productSignals.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/85 backdrop-blur-xl">
                    <Icon className="h-4 w-4 text-cyan-300" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={onExploreRides}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#00C8E8_0%,#0095B8_100%)] px-7 py-4 text-base font-semibold text-[#041018] shadow-[0_20px_50px_rgba(0,200,232,0.28)] transition hover:translate-y-[-1px]"
                >
                  Open live rides
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <button
                  onClick={onOfferRide}
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/[0.05] px-7 py-4 text-base font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Offer a ride
                  <TrendingUp className="h-4 w-4 text-amber-300" />
                </button>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                    <div className="text-3xl font-semibold text-white">{stat.value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <RoutePreview />
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionLabel>Core services</SectionLabel>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Everything important is visible in one scan.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  The front page now explains the platform quickly and keeps the main paths obvious for first-time visitors.
                </p>
              </div>
              <button
                onClick={onExplorePackages}
                className="inline-flex items-center gap-2 self-start rounded-full border border-cyan-400/18 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/14"
              >
                Open package network
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              {corridorServices.map((service) => (
                <ServiceCard key={service.title} {...service} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(160deg,rgba(10,22,40,0.92),rgba(5,13,24,0.96))] p-8">
              <SectionLabel>Why this feels better</SectionLabel>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white">A landing page that explains the product before it decorates it.</h2>
              <div className="mt-8 space-y-5">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{step.title}</div>
                      <div className="mt-2 text-sm leading-7 text-slate-300">{step.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8">
              <div className="grid gap-4 md:grid-cols-2">
                {featuredRoutes.map((route, index) => (
                  <motion.div
                    key={`${route.from}-${route.to}`}
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="rounded-[26px] border border-white/10 bg-[#07111f] p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-cyan-200/80">
                        <Ticket className="h-4 w-4" />
                        Featured lane {index + 1}
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white/65">
                        Jordan
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3 text-2xl font-semibold text-white">
                      <span>{route.from}</span>
                      <ArrowRight className="h-5 w-5 text-amber-300" />
                      <span>{route.to}</span>
                    </div>
                    <div className="mt-4 text-sm leading-6 text-slate-300">{route.note}</div>
                    <div className="mt-6 flex items-center gap-4 text-xs text-white/60">
                      <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-cyan-300" /> Seats</span>
                      <span className="flex items-center gap-2"><Package className="h-3.5 w-3.5 text-emerald-300" /> Packages</span>
                      <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> Trust</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[32px] border border-emerald-400/15 bg-[linear-gradient(160deg,rgba(0,200,117,0.08),rgba(255,255,255,0.03))] p-8">
                <SectionLabel>Trust layer</SectionLabel>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white">Clarity should feel safe, not just pretty.</h2>
                <div className="mt-6 space-y-4">
                  {[
                    'Trust, route, and value are visible together instead of being split across disconnected screens.',
                    'Package movement sits on top of real trip supply, which makes the platform easier to understand.',
                    'The first screen now leads users directly into the three actions that matter most.',
                  ].map((item) => (
                    <div key={item} className="flex gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-200">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-[#07111f] p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div>
                    <SectionLabel>People remember clear products</SectionLabel>
                    <h2 className="mt-5 text-4xl font-semibold tracking-tight text-white">Premium enough to feel modern. Clear enough to convert.</h2>
                  </div>
                  <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                    Production-ready visual system
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {[
                    { icon: Star, value: 'Premium', note: 'Confident first impression' },
                    { icon: Users, value: 'Useful', note: 'Main actions stay obvious' },
                    { icon: ShieldCheck, value: 'Trustworthy', note: 'Network logic feels real' },
                  ].map(({ icon: Icon, value, note }) => (
                    <div key={value} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                      <Icon className="h-5 w-5 text-cyan-300" />
                      <div className="mt-5 text-2xl font-semibold text-white">{value}</div>
                      <div className="mt-2 text-sm leading-6 text-slate-300">{note}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 pt-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[40px] border border-cyan-400/16 bg-[linear-gradient(145deg,rgba(0,200,232,0.12),rgba(5,13,24,0.96)_38%,rgba(240,168,48,0.1)_100%)] px-6 py-10 sm:px-10 sm:py-14">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(240,168,48,0.18),transparent_24%)]" />
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <SectionLabel>Start moving</SectionLabel>
                <h2 className="mt-6 text-[clamp(2.4rem,5vw,4.6rem)] font-black leading-[0.98] tracking-[-0.04em] text-white" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
                  Open the network.
                </h2>
                <p className="mt-5 text-lg leading-8 text-slate-200/85">
                  Search a ride, publish your seat, or move a package through a corridor already in motion.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <button
                    onClick={onGetStarted}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 text-base font-semibold text-[#06111e] transition hover:translate-y-[-1px]"
                  >
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={onLogin}
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/14"
                  >
                    Log in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
