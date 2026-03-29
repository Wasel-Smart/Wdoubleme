/**
 * Architecture Audit Dashboard
 * Live tracker for Phase 2 refactor progress.
 * Route: /app/admin/architecture-audit
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, TrendingDown,
  Layers, GitMerge, Trash2, Tag, BarChart3, ArrowRight,
  Package, Shield, Zap, Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';

// ─── Types & Data ─────────────────────────────────────────────────────────────

type Status = 'done' | 'in-progress' | 'pending' | 'blocked';

interface Metric { label: string; before: number; after: number; unit?: string }
interface Task { id: string; name: string; status: Status; risk: 'low' | 'medium' | 'high'; saves: number }
interface NamingFix { original: string; renamed: string; status: Status }

const METRICS: Metric[] = [
  { label: 'Total Components', before: 235, after: 116, unit: '' },
  { label: 'Admin Dashboards', before: 28, after: 15, unit: '' },
  { label: 'Payment Components', before: 6, after: 2, unit: '' },
  { label: 'Map Wrappers', before: 4, after: 1, unit: '' },
  { label: 'Routes', before: 110, after: 72, unit: '' },
  { label: 'Naming Violations', before: 12, after: 0, unit: '' },
];

const TASKS: Task[] = [
  { id: 'p1-tokens', name: '/tokens/wasel-tokens.ts created', status: 'done', risk: 'low', saves: 0 },
  { id: 'p1-rtl', name: '/utils/rtl.ts created', status: 'done', risk: 'low', saves: 0 },
  { id: 'p1-features', name: '13 /features/*/index.ts barrels created', status: 'done', risk: 'low', saves: 0 },
  { id: 'p1-atoms', name: 'UI atoms/molecules barrels created', status: 'done', risk: 'low', saves: 0 },
  { id: 'p2-advanced', name: 'Delete /components/advanced/ (2 duplicates)', status: 'done', risk: 'low', saves: 2 },
  { id: 'p2-social', name: 'Delete RideSocial → SocialHub is canonical', status: 'done', risk: 'low', saves: 1 },
  { id: 'p2-rentals', name: 'Merge CarRentals + MotorcycleRentals + ScooterRentals → VehicleRentals', status: 'done', risk: 'low', saves: 2 },
  { id: 'p2-techhub', name: 'Merge QA + UAT + UATControl → TechHub', status: 'done', risk: 'low', saves: 2 },
  { id: 'p2-launch', name: 'Delete LaunchDashboard (LaunchControlDashboard is canonical)', status: 'done', risk: 'low', saves: 1 },
  { id: 'p2-maps', name: 'Delete GoogleMapsIntegration (duplicate)', status: 'done', risk: 'low', saves: 1 },
  { id: 'p2-naming', name: 'Fix all naming violations (10 renames via barrel aliases)', status: 'done', risk: 'low', saves: 0 },
  { id: 'p3-payments', name: 'PaymentFlow orchestrator — 6 payment components unified', status: 'done', risk: 'medium', saves: 0 },
  { id: 'p3-analytics', name: 'TripAnalytics is canonical (TripsAnalyticsDashboard deprecated)', status: 'done', risk: 'medium', saves: 0 },
  { id: 'p3-maps2', name: 'MapWrapper is canonical (GoogleMapComponent + MapComponent deprecated)', status: 'done', risk: 'medium', saves: 0 },
  { id: 'p3-admin', name: '26→15 admin dashboards (6 deprecated, 5 merges completed)', status: 'done', risk: 'high', saves: 6 },
  { id: 'p4-docs', name: 'Delete 14 stale markdown docs from project root', status: 'done', risk: 'low', saves: 14 },
  { id: 'p4-components', name: 'Delete 10 unused components (NPSSurvey, BrandShowcase, etc.)', status: 'done', risk: 'low', saves: 10 },
  { id: 'p4-utils', name: 'Delete 6 duplicate/unused utilities (performanceMonitor*, singleBrandMigration, etc.)', status: 'done', risk: 'low', saves: 6 },
  { id: 'p4-barrels', name: 'Fix all broken barrel exports (onboarding, safety, driver, premium, carpooling)', status: 'done', risk: 'medium', saves: 0 },
  { id: 'p4-loader', name: 'Rewrite componentLoader.ts (remove dep on deleted performanceOptimizations)', status: 'done', risk: 'medium', saves: 0 },
];

const NAMING_FIXES: NamingFix[] = [
  { original: 'EnhancedDashboard', renamed: 'Dashboard', status: 'done' },
  { original: 'EnhancedUserProfile', renamed: 'UserProfile', status: 'done' },
  { original: 'PaymentMethodsEnhanced', renamed: 'PaymentMethodList', status: 'done' },
  { original: 'VerificationCenterEnhanced', renamed: 'VerificationCenter', status: 'done' },
  { original: 'SmartDriverAssistant', renamed: 'DriverAssistant', status: 'done' },
  { original: 'AdvancedVoiceCommands', renamed: 'VoiceCommands', status: 'done' },
  { original: 'OptimizedDriverOnboarding', renamed: 'DriverOnboarding', status: 'done' },
  { original: 'OptimizedRiderOnboarding', renamed: 'RiderOnboarding', status: 'done' },
  { original: 'EnhancedCarbonTracking', renamed: 'CarbonTracking', status: 'done' },
  { original: 'AdvancedFilters', renamed: 'RideFilters', status: 'done' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<Status, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  done:        { label: 'Done', color: 'text-green-500', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'text-blue-500', icon: Clock },
  pending:     { label: 'Pending', color: 'text-yellow-500', icon: AlertTriangle },
  blocked:     { label: 'Blocked', color: 'text-red-500', icon: XCircle },
};

const riskColor = { low: 'bg-green-500/10 text-green-400 border-green-500/20', medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', high: 'bg-red-500/10 text-red-400 border-red-500/20' };

// ─── Component ────────────────────────────────────────────────────────────────

export function ArchitectureAuditDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const done = TASKS.filter(t => t.status === 'done').length;
  const totalSaved = TASKS.filter(t => t.status === 'done').reduce((a, t) => a + t.saves, 0);
  const phaseProgress = Math.round((done / TASKS.length) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Layers className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Architecture Audit</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20">Phase 2</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Live refactor tracker — Atomic Design + Feature Slicing governance
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-primary">{phaseProgress}%</p>
          <p className="text-xs text-muted-foreground">Phase 2 complete</p>
        </div>
      </div>

      <Progress value={phaseProgress} className="h-2" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tasks Done', value: `${done}/${TASKS.length}`, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Files Saved', value: totalSaved, icon: Trash2, color: 'text-primary' },
          { label: 'Naming Fixed', value: NAMING_FIXES.length, icon: Tag, color: 'text-primary' },
          { label: 'Risk Level', value: '8→6', icon: Shield, color: 'text-orange-400' },
        ].map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
              <div>
                <p className="text-xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview"><BarChart3 className="w-4 h-4 mr-1" />Metrics</TabsTrigger>
          <TabsTrigger value="tasks"><CheckCircle2 className="w-4 h-4 mr-1" />Tasks</TabsTrigger>
          <TabsTrigger value="naming"><Tag className="w-4 h-4 mr-1" />Naming</TabsTrigger>
          <TabsTrigger value="rules"><Zap className="w-4 h-4 mr-1" />Rules</TabsTrigger>
        </TabsList>

        {/* Metrics tab */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Before vs After</CardTitle>
              <CardDescription>Impact of Phase 2 refactor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {METRICS.map(m => {
                const reduction = Math.round(((m.before - m.after) / m.before) * 100);
                return (
                  <div key={m.label} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{m.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground line-through">{m.before}{m.unit}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-primary font-bold">{m.after}{m.unit}</span>
                        <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/10">
                          -{reduction}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 h-2">
                      <div className="h-2 bg-muted-foreground/30 rounded-full" style={{ width: `${(m.after / m.before) * 100}%` }} />
                      <div className="h-2 bg-red-500/30 rounded-full flex-1" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks tab */}
        <TabsContent value="tasks" className="mt-6 space-y-3">
          {['Phase 1 — Infrastructure', 'Phase 2 — Deletions & Merges', 'Phase 3 — Upcoming'].map((phase, pi) => {
            const phaseTasks = TASKS.filter((_, i) => {
              if (pi === 0) return i < 4;
              if (pi === 1) return i >= 4 && i < 11;
              return i >= 11;
            });
            return (
              <div key={phase} className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{phase}</h3>
                {phaseTasks.map(task => {
                  const { icon: Icon, color, label } = statusConfig[task.status];
                  return (
                    <Card key={task.id}>
                      <CardContent className="p-3 flex items-center gap-3">
                        <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                        <span className="text-sm flex-1">{task.name}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {task.saves > 0 && (
                            <Badge variant="outline" className="text-xs text-green-400 border-green-500/20">
                              -{task.saves} files
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${riskColor[task.risk]}`}>
                            {task.risk}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </TabsContent>

        {/* Naming tab */}
        <TabsContent value="naming" className="mt-6 space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Naming Violations Fixed</CardTitle>
              <CardDescription>
                Aliases added via feature barrels — backward compatible, zero breaking changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {NAMING_FIXES.map(fix => (
                <div key={fix.original} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <code className="text-xs text-red-300 line-through">{fix.original}</code>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <code className="text-xs text-green-400">{fix.renamed}</code>
                  <Badge variant="outline" className="ml-auto text-xs text-green-400 border-green-500/20">done</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules tab */}
        <TabsContent value="rules" className="mt-6 space-y-4">
          {[
            { icon: Layers, title: 'Two-Layer Rule', desc: '/components/ui/ = atoms/molecules only (zero business logic). /features/ = all domain components.' },
            { icon: Star, title: '3-Strike Rule', desc: 'A component belongs in /ui/ only when used in 3+ separate feature domains. Until then, it lives in /features/{domain}/components/.' },
            { icon: GitMerge, title: 'Strangler Fig Pattern', desc: 'All /features/*/index.ts re-export from original locations. No breaking moves — consumers gradually update their imports.' },
            { icon: Tag, title: 'Naming Convention', desc: '{Domain}{Noun} — e.g. TripCard, DriverEarningsChart. No Enhanced/Optimized/Advanced prefixes.' },
            { icon: Package, title: 'One-PR-Per-Move Rule', desc: 'Move one file per PR. Update lazy import in optimizedRoutes.ts. Test in LTR and RTL before merging.' },
            { icon: Zap, title: 'Token-Only Styling', desc: 'All colors/spacing from /tokens/wasel-tokens.ts. No hardcoded hex/px/rgba in component files.' },
          ].map(rule => (
            <Card key={rule.title}>
              <CardContent className="p-4 flex gap-3">
                <rule.icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">{rule.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rule.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}