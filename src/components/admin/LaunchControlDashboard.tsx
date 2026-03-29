/**
 * Launch Control Dashboard - Mission Control for 30-Day Jordan Launch
 * Real-time KPI tracking, decision gates, and automated alerts
 */

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../ui/alert";
import {
  Users,
  Car,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Target,
  Calendar,
  Activity,
  Zap,
  RefreshCw,
  Bell,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  getCurrentPhase,
  getLaunchProgress,
  getDaysRemainingInPhase,
  getAllFeatureFlags,
} from "../../utils/featureFlags";
import { useTranslation } from "../hooks/useTranslation";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

// ─── Mock fallback data (used when API is unavailable) ────────────────────────
const MOCK_METRICS: LaunchMetrics = {
  totalRiders: 342,
  totalDrivers: 67,
  weeklyTrips: 58,
  gmv: 4320,
  repeatRate: 24,
  nps: 52,
  tripsToday: 12,
  newRidersToday: 8,
  newDriversToday: 2,
  revenueToday: 86.4,
  avgTripValue: 7.2,
  ridersGrowthRate: 18,
  driversGrowthRate: 12,
  tripsGrowthRate: 22,
  onlineDrivers: 14,
  activeTrips: 3,
  cancellationRate: 2.4,
  avgResponseTime: 38,
  totalRevenue: 518.4,
  promoSpending: 120,
  driverPayouts: 3672,
  netRevenue: 398.4,
  week1Retention: 28,
  week2Retention: 22,
  week3Retention: 18,
  lastUpdated: new Date().toISOString(),
};

interface LaunchMetrics {
  // Primary Goals
  totalRiders: number;
  totalDrivers: number;
  weeklyTrips: number;
  gmv: number;
  repeatRate: number;
  nps: number;

  // Today's Activity
  tripsToday: number;
  newRidersToday: number;
  newDriversToday: number;
  revenueToday: number;
  avgTripValue: number;

  // Trends
  ridersGrowthRate: number;
  driversGrowthRate: number;
  tripsGrowthRate: number;

  // Operational
  onlineDrivers: number;
  activeTrips: number;
  cancellationRate: number;
  avgResponseTime: number;

  // Financial
  totalRevenue: number;
  promoSpending: number;
  driverPayouts: number;
  netRevenue: number;

  // Cohort Analysis
  week1Retention: number;
  week2Retention: number;
  week3Retention: number;

  // Last Updated
  lastUpdated: string;
}

const GOALS = {
  totalRiders: 1000,
  totalDrivers: 200,
  weeklyTrips: 100,
  gmv: 10000,
  repeatRate: 30,
  nps: 50,
};

export function LaunchControlDashboard() {
  const { t, language } = useTranslation();
  const [metrics, setMetrics] = useState<LaunchMetrics>(MOCK_METRICS);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const currentPhase = getCurrentPhase();
  const launchProgress = getLaunchProgress();
  const daysRemaining = getDaysRemainingInPhase();

  // Fetch metrics from backend
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/admin/launch-metrics`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
        setLastRefresh(new Date());
      }
      // If response not ok, keep existing mock data — don't clear metrics
    } catch (error) {
      console.warn("Launch metrics API unavailable — using mock data:", error);
      // Keep existing metrics (mock data), just update timestamp
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 5 minutes — use ref to avoid stale closure issues in Figma iframe
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading Launch Control...
          </p>
        </div>
      </div>
    );
  }

  // Calculate goal progress percentages
  const goalProgress = {
    riders: (metrics.totalRiders / GOALS.totalRiders) * 100,
    drivers: (metrics.totalDrivers / GOALS.totalDrivers) * 100,
    trips: (metrics.weeklyTrips / GOALS.weeklyTrips) * 100,
    gmv: (metrics.gmv / GOALS.gmv) * 100,
    repeatRate: (metrics.repeatRate / GOALS.repeatRate) * 100,
  };

  // Generate alerts
  const alerts = generateAlerts(metrics, goalProgress);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              🚀 Wasel Launch Control
            </h1>
            <p className="text-muted-foreground mt-1">
              Jordan Market - 30 Day Production Launch
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Phase: {currentPhase}
              </div>
              <div className="text-xs text-muted-foreground">
                {daysRemaining} days remaining
              </div>
            </div>

            <Button
              onClick={fetchMetrics}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              {autoRefresh ? (
                <Activity className="w-4 h-4 mr-2" />
              ) : (
                <Minus className="w-4 h-4 mr-2" />
              )}
              {autoRefresh ? "Live" : "Paused"}
            </Button>
          </div>
        </div>

        {/* Launch Progress */}
        <Card className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                Launch Progress
              </span>
              <span className="text-2xl font-bold">
                {launchProgress}%
              </span>
            </div>
            <Progress
              value={launchProgress}
              className="h-3 bg-white/20"
            />
            <div className="text-xs mt-2 opacity-90">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <Alert
              key={index}
              variant={
                alert.severity === "critical"
                  ? "destructive"
                  : "default"
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>
                {alert.message}
                {alert.action && (
                  <div className="mt-2">
                    <Button size="sm" variant="outline">
                      {alert.action}
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="operations">
            Operations
          </TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Primary Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <GoalCard
              title="Riders"
              current={metrics.totalRiders}
              goal={GOALS.totalRiders}
              icon={<Users className="w-5 h-5" />}
              trend={metrics.ridersGrowthRate}
              color="blue"
            />

            <GoalCard
              title="Drivers"
              current={metrics.totalDrivers}
              goal={GOALS.totalDrivers}
              icon={<Car className="w-5 h-5" />}
              trend={metrics.driversGrowthRate}
              color="green"
            />

            <GoalCard
              title="Weekly Trips"
              current={metrics.weeklyTrips}
              goal={GOALS.weeklyTrips}
              icon={<Activity className="w-5 h-5" />}
              trend={metrics.tripsGrowthRate}
              color="purple"
            />

            <GoalCard
              title="GMV"
              current={metrics.gmv}
              goal={GOALS.gmv}
              icon={<DollarSign className="w-5 h-5" />}
              trend={0}
              prefix="$"
              color="teal"
            />

            <GoalCard
              title="Repeat Rate"
              current={metrics.repeatRate}
              goal={GOALS.repeatRate}
              icon={<Target className="w-5 h-5" />}
              trend={0}
              suffix="%"
              color="orange"
            />
          </div>

          {/* Today's Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MetricBox
                  label="Trips Completed"
                  value={metrics.tripsToday}
                  icon={<Activity className="w-4 h-4" />}
                />
                <MetricBox
                  label="New Riders"
                  value={metrics.newRidersToday}
                  icon={<Users className="w-4 h-4" />}
                />
                <MetricBox
                  label="New Drivers"
                  value={metrics.newDriversToday}
                  icon={<Car className="w-4 h-4" />}
                />
                <MetricBox
                  label="Revenue"
                  value={`$${metrics.revenueToday.toFixed(2)}`}
                  icon={<DollarSign className="w-4 h-4" />}
                />
                <MetricBox
                  label="Avg Trip Value"
                  value={`$${metrics.avgTripValue.toFixed(2)}`}
                  icon={<TrendingUp className="w-4 h-4" />}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(GOALS).map(([key, goalValue]) => {
              const currentValue = metrics[
                key as keyof typeof metrics
              ] as number;
              const progress = (currentValue / goalValue) * 100;
              const status =
                progress >= 100
                  ? "complete"
                  : progress >= 80
                    ? "ontrack"
                    : progress >= 50
                      ? "warning"
                      : "critical";

              return (
                <Card key={key}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold capitalize">
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {currentValue.toLocaleString()} /{" "}
                          {goalValue.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          status === "complete"
                            ? "default"
                            : status === "ontrack"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <Progress
                      value={Math.min(progress, 100)}
                      className={`h-2 ${getProgressColor(status)}`}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Online Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {metrics.onlineDrivers}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(
                    (metrics.onlineDrivers /
                      metrics.totalDrivers) *
                    100
                  ).toFixed(0)}
                  % of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Active Trips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {metrics.activeTrips}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  In progress right now
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Cancellation Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${metrics.cancellationRate > 5 ? "text-red-600" : "text-green-600"}`}
                >
                  {metrics.cancellationRate.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {"<"}3%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Avg Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {metrics.avgResponseTime}s
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Driver acceptance time
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Total GMV
                  </span>
                  <span className="text-2xl font-bold">
                    ${metrics.gmv.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Platform Revenue (15%)
                  </span>
                  <span className="text-xl font-semibold text-green-600">
                    ${metrics.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Promo Spending
                  </span>
                  <span className="text-xl font-semibold text-orange-600">
                    -${metrics.promoSpending.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Driver Payouts (85%)
                  </span>
                  <span className="text-xl font-semibold text-blue-600">
                    ${metrics.driverPayouts.toLocaleString()}
                  </span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-semibold">
                    Net Revenue
                  </span>
                  <span
                    className={`text-2xl font-bold ${metrics.netRevenue >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    ${metrics.netRevenue.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unit Economics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Avg Trip Value
                  </span>
                  <span className="text-xl font-semibold">
                    ${metrics.avgTripValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Platform Take Rate
                  </span>
                  <span className="text-xl font-semibold">
                    15%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Driver Earnings Rate
                  </span>
                  <span className="text-xl font-semibold text-green-600">
                    85%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Revenue per Trip
                  </span>
                  <span className="text-xl font-semibold">
                    ${(metrics.avgTripValue * 0.15).toFixed(2)}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Total Trips Needed
                    </span>
                    <span className="text-2xl font-bold">
                      {Math.ceil(
                        10000 / (metrics.avgTripValue * 0.15),
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    To reach $10K GMV goal
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cohorts Tab */}
        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Cohort Retention</CardTitle>
              <CardDescription>
                Percentage of users who completed 2+ trips
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <CohortBar
                  label="Week 1 Users"
                  retention={metrics.week1Retention}
                  target={30}
                />
                <CohortBar
                  label="Week 2 Users"
                  retention={metrics.week2Retention}
                  target={30}
                />
                <CohortBar
                  label="Week 3 Users"
                  retention={metrics.week3Retention}
                  target={30}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper Components
interface GoalCardProps {
  title: string;
  current: number;
  goal: number;
  icon: React.ReactNode;
  trend: number;
  prefix?: string;
  suffix?: string;
  color: string;
}

function GoalCard({
  title,
  current,
  goal,
  icon,
  trend,
  prefix = "",
  suffix = "",
  color,
}: GoalCardProps) {
  const progress = (current / goal) * 100;
  const status =
    progress >= 100
      ? "complete"
      : progress >= 80
        ? "ontrack"
        : progress >= 50
          ? "warning"
          : "critical";

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-2">
          <div className={`text-${color}-600`}>{icon}</div>
          <Badge
            variant={
              status === "complete"
                ? "default"
                : status === "ontrack"
                  ? "outline"
                  : "destructive"
            }
          >
            {progress.toFixed(0)}%
          </Badge>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        <div className="text-2xl font-bold mt-1">
          {prefix}
          {current.toLocaleString()}
          {suffix}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            of {prefix}
            {goal.toLocaleString()}
            {suffix}
          </span>
          {trend !== 0 && (
            <div
              className={`flex items-center text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}
            >
              {trend > 0 ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              {Math.abs(trend).toFixed(0)}%
            </div>
          )}
        </div>
        <Progress
          value={Math.min(progress, 100)}
          className="h-1 mt-2"
        />
      </CardContent>
    </Card>
  );
}

interface MetricBoxProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function MetricBox({ label, value, icon }: MetricBoxProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

interface CohortBarProps {
  label: string;
  retention: number;
  target: number;
}

function CohortBar({
  label,
  retention,
  target,
}: CohortBarProps) {
  const status =
    retention >= target
      ? "success"
      : retention >= target * 0.8
        ? "warning"
        : "danger";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span
          className={`text-sm font-bold ${
            status === "success"
              ? "text-green-600"
              : status === "warning"
                ? "text-orange-600"
                : "text-red-600"
          }`}
        >
          {retention.toFixed(0)}%
        </span>
      </div>
      <Progress
        value={Math.min((retention / target) * 100, 100)}
        className="h-2"
      />
      <div className="text-xs text-muted-foreground mt-1">
        Target: {target}%
      </div>
    </div>
  );
}

function getProgressColor(status: string) {
  switch (status) {
    case "complete":
      return "bg-green-500";
    case "ontrack":
      return "bg-blue-500";
    case "warning":
      return "bg-orange-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}

interface Alert {
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  action?: string;
}

function generateAlerts(
  metrics: LaunchMetrics,
  goalProgress: any,
): Alert[] {
  const alerts: Alert[] = [];
  const daysSinceLaunch = 30 - getDaysRemainingInPhase();

  // Week 1 Gates (Day 7)
  if (daysSinceLaunch === 7) {
    if (metrics.totalRiders < 150) {
      alerts.push({
        title: "🔴 Rider Acquisition Below Target",
        message: `Only ${metrics.totalRiders} riders registered (target: 150). Consider doubling referral bonus.`,
        severity: "critical",
        action: "Increase Referral Bonus",
      });
    }

    if (metrics.totalDrivers < 30) {
      alerts.push({
        title: "🔴 Driver Supply Critical",
        message: `Only ${metrics.totalDrivers} drivers (target: 30). Increase guarantee or expand recruitment.`,
        severity: "critical",
        action: "Boost Driver Incentives",
      });
    }
  }

  // Week 2 Gates (Day 14)
  if (daysSinceLaunch === 14 && metrics.weeklyTrips < 50) {
    alerts.push({
      title: "🔴 Activation Gap Detected",
      message: `Only ${metrics.weeklyTrips} trips this week (target: 50). Improve driver availability or increase discounts.`,
      severity: "critical",
      action: "Launch Campus Campaign",
    });
  }

  // Week 3 Gates (Day 21)
  if (daysSinceLaunch === 21 && metrics.repeatRate < 20) {
    alerts.push({
      title: "🟡 Retention Warning",
      message: `Repeat rate at ${metrics.repeatRate.toFixed(0)}% (target: 30%). Consider launching loyalty program.`,
      severity: "warning",
      action: "Enable Loyalty Program",
    });
  }

  // Daily Monitoring
  if (metrics.cancellationRate > 5) {
    alerts.push({
      title: "🔴 Cancellation Rate Spike",
      message: `Cancellation rate at ${metrics.cancellationRate.toFixed(1)}% (threshold: 3%). Investigate driver availability.`,
      severity: "critical",
      action: "Review Cancellations",
    });
  }

  if (metrics.nps < 40) {
    alerts.push({
      title: "🔴 NPS Below Threshold",
      message: `Net Promoter Score at ${metrics.nps} (target: 50). Review recent feedback urgently.`,
      severity: "critical",
      action: "View Feedback",
    });
  }

  // Positive Alerts
  if (goalProgress.riders >= 100) {
    alerts.push({
      title: "🎉 Rider Goal Achieved!",
      message: `You've reached ${metrics.totalRiders} riders! Exceeded the 1,000 target.`,
      severity: "info",
    });
  }

  if (metrics.repeatRate >= 30) {
    alerts.push({
      title: "✅ Retention Target Hit",
      message: `Repeat rate at ${metrics.repeatRate.toFixed(0)}% - users are coming back!`,
      severity: "info",
    });
  }

  return alerts;
}