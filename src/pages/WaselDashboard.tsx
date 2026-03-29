import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  GraduationCap,
  Package,
  Route,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';
import { useLocalAuth } from '../contexts/LocalAuth';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { buildBusinessAccountSnapshot, buildSchoolTransportSnapshot, type BusinessAccountSnapshot, type SchoolTransportSnapshot } from '../services/corridorOperations';
import { buildInnovationSnapshot, type InnovationSnapshot } from '../services/innovationNetwork';
import { CurrencyService } from '../utils/currency';

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export default function WaselDashboard() {
  const nav = useIframeSafeNavigate();
  const { user } = useLocalAuth();
  const [innovation, setInnovation] = useState<InnovationSnapshot | null>(null);
  const [business, setBusiness] = useState<BusinessAccountSnapshot | null>(null);
  const [school, setSchool] = useState<SchoolTransportSnapshot | null>(null);

  useEffect(() => {
    if (!user) {
      nav('/app/auth');
      return;
    }

    let cancelled = false;

    async function load() {
      const [innovationSnapshot, businessSnapshot, schoolSnapshot] = await Promise.all([
        buildInnovationSnapshot(),
        buildBusinessAccountSnapshot(),
        buildSchoolTransportSnapshot(),
      ]);

      if (cancelled) return;
      setInnovation(innovationSnapshot);
      setBusiness(businessSnapshot);
      setSchool(schoolSnapshot);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [nav, user]);

  if (!user) {
    return null;
  }

  const currency = CurrencyService.getInstance();
  const quickActions = [
    { label: 'Innovation Hub', path: '/app/innovation-hub', icon: Route, color: 'text-cyan-300' },
    { label: 'Raje3 Returns', path: '/app/raje3', icon: Package, color: 'text-amber-300' },
    { label: 'Business Ops', path: '/app/services/corporate', icon: BriefcaseBusiness, color: 'text-emerald-300' },
    { label: 'School Ops', path: '/app/services/school', icon: GraduationCap, color: 'text-orange-300' },
    { label: 'Trust Center', path: '/app/trust', icon: ShieldCheck, color: 'text-slate-200' },
    { label: 'Core Wallet', path: '/app/wallet', icon: TrendingUp, color: 'text-cyan-200' },
  ];

  return (
    <div className="min-h-screen bg-[#040C18] text-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-cyan-500/20 bg-[radial-gradient(circle_at_top_right,_rgba(0,200,232,0.16),_transparent_28%),linear-gradient(135deg,_#091526,_#040C18_55%,_#0b1d45)] p-8 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge className="w-fit border-cyan-400/30 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/10">
                Corridor Operating Dashboard
              </Badge>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  {user.name}, your product is strongest when every screen behaves like one system.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-300">
                  This dashboard now centers route intelligence, return matching, package tracking, business contracts, and school subscriptions instead of scattered generic app utilities.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => nav('/app/innovation-hub')}>
                Open Innovation Hub
              </Button>
              <Button variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10" onClick={() => nav('/app/trust')}>
                Trust Center
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400">Corridor health</div>
              <div className="mt-2 text-3xl font-semibold">{innovation?.liquidity.healthScore ?? '...'}/100</div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400">Return escrow</div>
              <div className="mt-2 text-3xl font-semibold">
                {innovation ? currency.formatFromJOD(innovation.packageOps.escrow.amount) : '...'}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400">Business invoice</div>
              <div className="mt-2 text-3xl font-semibold">
                {business ? currency.formatFromJOD(business.monthlyInvoiceJOD) : '...'}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardContent className="pt-6">
              <div className="text-sm text-slate-400">School standard plan</div>
              <div className="mt-2 text-3xl font-semibold">
                {school ? currency.formatFromJOD(school.subscriptionPricing.standard) : '...'}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardHeader>
              <CardTitle>What matters now</CardTitle>
              <CardDescription className="text-slate-400">
                High-quality execution means the same strategic logic appears everywhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => nav(action.path)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                >
                  <action.icon className={`mb-3 h-5 w-5 ${action.color}`} />
                  <div className="font-medium text-white">{action.label}</div>
                  <div className="mt-1 text-sm text-slate-400">Open the connected operational view.</div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardHeader>
              <CardTitle>Live operating thesis</CardTitle>
              <CardDescription className="text-slate-400">
                This is the story every major surface should reinforce.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                Route intelligence decides where liquidity is healthy and where supply should be deployed.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                Returns ride on scheduled trips, so logistics margin improves instead of spawning a second network.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                Business and school corridors create recurring revenue that stabilizes the platform.
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="border-cyan-500/20 bg-cyan-500/5 text-white">
            <CardHeader>
              <CardTitle>Innovation Snapshot</CardTitle>
              <CardDescription className="text-slate-400">
                The product’s differentiator should always be visible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div>Passenger matches: {innovation?.passengerMatches.length ?? 0}</div>
              <div>Package matches: {innovation?.packageMatches.length ?? 0}</div>
              <div>Prayer stop suggestions: {innovation?.prayerStops.length ?? 0}</div>
              <div>Route claim: {innovation?.firstMoverClaim ?? 'Loading...'}</div>
            </CardContent>
          </Card>

          <Card className="border-emerald-500/20 bg-emerald-500/5 text-white">
            <CardHeader>
              <CardTitle>Business Corridor</CardTitle>
              <CardDescription className="text-slate-400">
                Recurring mobility plus returns is now a real operating surface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div>
                Corridor: {business ? `${business.corridor.from} to ${business.corridor.to}` : 'Loading...'}
              </div>
              <div>Seat utilization: {business ? formatPercent(business.liquidity.utilizationRate * 100) : '...'}</div>
              <div>Attach-rate: {business ? formatPercent(business.packageOps.attachRatePercent) : '...'}</div>
              <div>Recurring days: {business?.recurringDays ?? '...'}</div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5 text-white">
            <CardHeader>
              <CardTitle>School Corridor</CardTitle>
              <CardDescription className="text-slate-400">
                Guardian verification and subscriptions make the route feel premium and trusted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div>
                Corridor: {school ? `${school.route.from} to ${school.route.to}` : 'Loading...'}
              </div>
              <div>Guardian coverage: {school ? formatPercent(school.guardianCoveragePercent) : '...'}</div>
              <div>Vehicle: {school?.recommendedVehicle ?? '...'}</div>
              <div>Operating days: {school?.operatingDays.join(', ') ?? '...'}</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardHeader>
              <CardTitle>Launch corridor board</CardTitle>
              <CardDescription className="text-slate-400">
                These are the routes the product should optimize first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {innovation?.corridors.map((corridor) => (
                <div key={corridor.routeId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{corridor.title}</div>
                      <div className="mt-1 text-sm text-slate-400">
                        {corridor.businessUseCase} • {corridor.schoolUseCase}
                      </div>
                    </div>
                    <Badge variant="outline" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                      {corridor.healthScore}/100
                    </Badge>
                  </div>
                </div>
              )) ?? (
                <div className="text-sm text-slate-400">Loading corridor board...</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardHeader>
              <CardTitle>Execution standard</CardTitle>
              <CardDescription className="text-slate-400">
                The app reaches 10/10 when every important page does these three things.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              {[
                'Show corridor health, seat yield, and trust instead of generic “live” placeholders.',
                'Explain how packages, returns, business, and school layers connect to the same route engine.',
                'Treat recurring revenue and operational reliability as the core story on every major surface.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
              <Button className="w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={() => nav('/app/find-ride')}>
                Open Corridor Marketplace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
