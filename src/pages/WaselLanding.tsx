import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  MapPinned,
  Package,
  Route,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';
import { useLocalAuth } from '../contexts/LocalAuth';
import { buildBusinessAccountSnapshot, buildSchoolTransportSnapshot } from '../services/corridorOperations';
import { buildInnovationSnapshot, getJordanLaunchRoutes, type InnovationSnapshot } from '../services/innovationNetwork';

function formatJod(value: number) {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency: 'JOD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function WaselLanding() {
  const nav = useIframeSafeNavigate();
  const { user } = useLocalAuth();
  const [snapshot, setSnapshot] = useState<InnovationSnapshot | null>(null);
  const [businessInvoice, setBusinessInvoice] = useState<number>(0);
  const [schoolPricing, setSchoolPricing] = useState<{ standard: number; premium: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [innovation, business, school] = await Promise.all([
        buildInnovationSnapshot(),
        buildBusinessAccountSnapshot(),
        buildSchoolTransportSnapshot(),
      ]);

      if (cancelled) return;
      setSnapshot(innovation);
      setBusinessInvoice(business.monthlyInvoiceJOD);
      setSchoolPricing(school.subscriptionPricing);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const launchRoutes = getJordanLaunchRoutes();

  return (
    <div className="min-h-screen bg-[#040C18] text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,_rgba(0,200,232,0.18),_transparent_32%),linear-gradient(135deg,_#081527,_#040C18_55%,_#0b1d45)] p-8 shadow-2xl shadow-cyan-950/20 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Badge className="border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/10">
                Middle East-first corridor commerce platform
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
                  Route intelligence, reverse logistics, business mobility, and school transport on one operating layer.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                  Wasel is strongest when every seat, trunk, return, business contract, and guardian-verified school route runs through one corridor engine.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                  onClick={() => nav(user ? '/app/dashboard' : '/app/auth?tab=register')}
                >
                  {user ? 'Open Command Center' : 'Start Building With Wasel'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                  onClick={() => nav('/app/innovation-hub')}
                >
                  Explore Innovation Hub
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400">Active launch regions</div>
                    <div className="mt-2 text-3xl font-semibold">{snapshot?.activeRegionCount ?? '...'}</div>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400">Business recurring invoice</div>
                    <div className="mt-2 text-3xl font-semibold">
                      {businessInvoice > 0 ? formatJod(businessInvoice) : '...'}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-white/10 bg-white/5 text-white">
                  <CardContent className="pt-6">
                    <div className="text-sm text-slate-400">School standard plan</div>
                    <div className="mt-2 text-3xl font-semibold">
                      {schoolPricing ? formatJod(schoolPricing.standard) : '...'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-cyan-500/20 bg-slate-950/50 text-slate-50">
              <CardHeader>
                <CardTitle>What makes this vision different</CardTitle>
                <CardDescription className="text-slate-400">
                  The product is no longer a generic ride app. It is a corridor-based transport and logistics operating system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: 'Route intelligence',
                    detail: 'Decide where supply should go based on corridor health, not on random city-wide inventory.',
                    icon: Route,
                  },
                  {
                    title: 'Return matching',
                    detail: 'Returns move on already scheduled rides instead of creating standalone courier cost.',
                    icon: Package,
                  },
                  {
                    title: 'Recurring revenue',
                    detail: 'Business accounts and school routes create contract revenue instead of one-off trip volatility.',
                    icon: BriefcaseBusiness,
                  },
                  {
                    title: 'Trust and escrow',
                    detail: 'Wallet, verification, guardian handoff, and package release all reinforce platform credibility.',
                    icon: ShieldCheck,
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2 text-cyan-200">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <Badge className="border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/10">
              Product Spine
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-white">The strongest six signals now define the platform.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: 'Route Intelligence',
                description: 'Liquidity, prayer-aware timing, seat usage, and corridor prioritization.',
                icon: MapPinned,
              },
              {
                title: 'Return Matching',
                description: 'Raje3 turns reverse logistics into a high-margin extension of live trips.',
                icon: Package,
              },
              {
                title: 'Package Tracking',
                description: 'Escrow, QR verification, tracking, and trust-led release logic.',
                icon: ShieldCheck,
              },
              {
                title: 'Seat Pricing',
                description: 'Yield logic pushes profitability through occupancy instead of flat pricing.',
                icon: TrendingUp,
              },
              {
                title: 'Business Accounts',
                description: 'Recurring commuter corridors and return lanes create contract revenue.',
                icon: Building2,
              },
              {
                title: 'School Transport',
                description: 'Guardian-verified subscriptions turn recurring family mobility into a durable vertical.',
                icon: GraduationCap,
              },
            ].map((item) => (
              <Card key={item.title} className="border-white/10 bg-white/[0.03] text-white">
                <CardHeader>
                  <div className="mb-3 w-fit rounded-xl border border-cyan-400/15 bg-cyan-400/10 p-2 text-cyan-100">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription className="text-slate-400">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <Badge className="border-amber-400/30 bg-amber-400/10 text-amber-100 hover:bg-amber-400/10">
              Jordan Launch Corridors
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-white">Launch corridors should be the product, not just a dataset.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {launchRoutes.map((route) => (
              <Card key={route.id} className="border-white/10 bg-white/[0.03] text-white">
                <CardHeader>
                  <CardTitle>{route.from} to {route.to}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {route.useCase} • {route.distanceKm} km • {route.durationMin} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Package enabled</span>
                    <span>{route.packageEnabled ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tier</span>
                    <span>{route.tier}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Typical use</span>
                    <span>{route.useCase}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-cyan-500/20 bg-cyan-500/5 text-white">
            <CardHeader>
              <CardTitle>Returns on top of rides</CardTitle>
              <CardDescription className="text-slate-400">
                Returns should increase corridor yield without creating a second logistics network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div>Tracking code: {snapshot?.packageOps.tracking.trackingCode ?? 'Loading...'}</div>
              <div>Insured value: {snapshot ? formatJod(snapshot.packageOps.insuredValueJOD) : '...'}</div>
              <div>Escrow-backed release: {snapshot?.packageOps.escrow.heldInEscrow ? 'Enabled' : 'Pending'}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5 text-white">
            <CardHeader>
              <CardTitle>Business recurring engine</CardTitle>
              <CardDescription className="text-slate-400">
                Business contracts should be measured by recurring revenue and corridor utilization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div>Recurring invoice: {businessInvoice > 0 ? formatJod(businessInvoice) : '...'}</div>
              <div>Revenue mode: monthly corridor allocation</div>
              <div>Return lane attach-rate: integrated into business mobility</div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5 text-white">
            <CardHeader>
              <CardTitle>Guardian-verified school routes</CardTitle>
              <CardDescription className="text-slate-400">
                School transport should feel like a premium recurring service, not a generic form.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-300">
              <div>Standard monthly plan: {schoolPricing ? formatJod(schoolPricing.standard) : '...'}</div>
              <div>Premium monthly plan: {schoolPricing ? formatJod(schoolPricing.premium) : '...'}</div>
              <div>Guardian alerts and live route tracking are treated as core trust infrastructure.</div>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8 text-center shadow-xl shadow-black/20">
          <div className="mx-auto max-w-3xl space-y-4">
            <Badge className="border-white/10 bg-white/5 text-white hover:bg-white/5">
              Precision over feature sprawl
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight text-white">
              The fastest path to a world-class product is one story told everywhere.
            </h2>
            <p className="text-base leading-7 text-slate-400">
              Every page should reinforce the same idea: Wasel is the connected corridor engine for rides, returns, packages, business accounts, and school transport in Jordan and across the Middle East.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => nav('/app/dashboard')}>
                Open Dashboard
              </Button>
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => nav('/app/services/corporate')}>
                Review Business Operations
              </Button>
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => nav('/app/services/school')}>
                Review School Operations
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
