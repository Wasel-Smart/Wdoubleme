/**
 * LiquidityDashboard — Admin Sprint 4 Tool
 *
 * Seed and monitor the first 50 travelers + 500 passengers for soft beta.
 * - Shows waitlist queue with role breakdown
 * - One-click "Invite" sends SMS invite code
 * - Tracks liquidity KPIs per route
 * - Seed traveler button manually adds test travelers
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Users, Car, Package, CheckCircle, Clock, AlertTriangle,
  Send, RefreshCw, TrendingUp, MapPin, BarChart3, Zap,
  UserCheck, XCircle, CalendarClock,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

interface WaitlistUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  route: string;
  position: number;
  invited: boolean;
  joined_at: string;
  referral_code: string;
}

interface RouteStats {
  route: string;
  travelers: number;
  passengers: number;
  ratio: string;
  health: 'good' | 'low' | 'critical';
}

const ROUTE_TARGETS: Record<string, { travelers: number; passengers: number }> = {
  'Amman → Aqaba':    { travelers: 10, passengers: 100 },
  'Amman → Irbid':    { travelers: 10, passengers: 100 },
  'Amman → Dead Sea': { travelers: 5,  passengers: 50  },
  'Amman → Zarqa':    { travelers: 8,  passengers: 80  },
  'Amman → Petra':    { travelers: 5,  passengers: 50  },
};

function HealthDot({ health }: { health: RouteStats['health'] }) {
  const cls = health === 'good' ? 'bg-emerald-400' : health === 'low' ? 'bg-amber-400' : 'bg-red-400';
  return <span className={`inline-block w-2 h-2 rounded-full ${cls} mr-2`} />;
}

export function LiquidityDashboard() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'traveler' | 'passenger' | 'sender'>('all');
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [refreshingDates, setRefreshingDates] = useState(false);
  const [stats, setStats] = useState({ total: 0, travelers: 0, passengers: 0, senders: 0, invited: 0 });
  const [tripStats, setTripStats] = useState<{ seeded: number; total: number } | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => { fetchData(); fetchTripStats(); }, []);

  const fetchTripStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/health/carpooling`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      setTripStats({ seeded: data?.kv?.liveData?.trips ?? 0, total: data?.kv?.liveData?.trips ?? 0 });
    } catch { /* ignore */ }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/beta/waitlist`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      const list: WaitlistUser[] = data.entries || [];
      setUsers(list);
      setStats({
        total:      list.length,
        travelers:  list.filter(u => u.role === 'traveler').length,
        passengers: list.filter(u => u.role === 'passenger').length,
        senders:    list.filter(u => u.role === 'sender').length,
        invited:    list.filter(u => u.invited).length,
      });
    } catch (err) {
      console.error('[LiquidityDashboard] fetchData error:', err);
      toast.error('Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (user: WaitlistUser) => {
    setInviting(user.id);
    try {
      const res = await fetch(`${API_BASE}/beta/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ userId: user.id, phone: user.phone, name: user.name }),
      });
      if (!res.ok) throw new Error('Invite failed');
      toast.success(`Invite sent to ${user.name}!`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, invited: true } : u));
      setStats(prev => ({ ...prev, invited: prev.invited + 1 }));
    } catch (err) {
      console.error('[LiquidityDashboard] invite error:', err);
      toast.error('Failed to send invite');
    } finally {
      setInviting(null);
    }
  };

  const handleSeedTraveler = async () => {
    setSeeding(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ count: 30 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`✅ Seeded ${data.seeded} carpool rides across all Tier-1 routes!`);
        fetchTripStats();
      } else {
        toast.error(data.error || 'Seeding failed');
      }
    } catch (err) {
      console.error('[LiquidityDashboard] seed error:', err);
      toast.error('Seeding failed — check server logs');
    } finally {
      setSeeding(false);
    }
  };

  const handleRefreshDates = async () => {
    setRefreshingDates(true);
    try {
      const res = await fetch(`${API_BASE}/admin/refresh-seed-dates`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`🔄 Refreshed ${data.refreshed} trip dates — seeds are fresh again!`);
        fetchTripStats();
      } else if (res.status === 401) {
        toast.error('🔒 Sign in first to refresh dates');
      } else {
        toast.error(data.error || 'Refresh failed');
      }
    } catch (err) {
      console.error('[LiquidityDashboard] refreshDates error:', err);
      toast.error('Date refresh failed — check server logs');
    } finally {
      setRefreshingDates(false);
    }
  };

  const handleClearSeeded = async () => {
    setClearing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/seed-trips`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const data = await res.json();
      toast.success(`🗑️ Cleared ${data.cleared} seeded trips`);
      fetchTripStats();
    } catch (err) {
      toast.error('Clear failed');
    } finally {
      setClearing(false);
    }
  };

  // Derive per-route stats from users
  const routeStats: RouteStats[] = Object.keys(ROUTE_TARGETS).map((route) => {
    const travelers  = users.filter(u => u.route === route && u.role === 'traveler').length;
    const passengers = users.filter(u => u.route === route && u.role === 'passenger').length;
    const tTarget = ROUTE_TARGETS[route].travelers;
    const pTarget = ROUTE_TARGETS[route].passengers;
    const pct = Math.min((travelers / tTarget) * 100, 100);
    const health: RouteStats['health'] = pct >= 60 ? 'good' : pct >= 30 ? 'low' : 'critical';
    return { route, travelers, passengers, ratio: `${travelers}/${tTarget} T · ${passengers}/${pTarget} P`, health };
  });

  const filtered = users.filter(u => {
    const matchRole   = filter === 'all' || u.role === filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search);
    return matchRole && matchSearch;
  });

  const ROLE_ICON: Record<string, any> = { traveler: Car, passenger: Users, sender: Package };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Liquidity Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Sprint 4 · Soft Beta · March 2026</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm" className="border-border text-slate-400 gap-2" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleRefreshDates} disabled={refreshingDates} variant="outline" size="sm" className="border-amber-500/30 text-amber-400 gap-2">
            <CalendarClock className={`w-4 h-4 ${refreshingDates ? 'animate-spin' : ''}`} />
            {refreshingDates ? 'Refreshing…' : 'Refresh Dates'}
          </Button>
          {tripStats !== null && tripStats.total > 0 && (
            <Button onClick={handleClearSeeded} disabled={clearing} variant="outline" size="sm" className="border-red-500/30 text-red-400 gap-2">
              <XCircle className="w-4 h-4" />
              {clearing ? 'Clearing…' : `Clear ${tripStats.total} Trips`}
            </Button>
          )}
          <Button onClick={handleSeedTraveler} disabled={seeding} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
            <Zap className="w-4 h-4" />
            {seeding ? 'Seeding…' : '🚗 Seed 30 Rides'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Signups',  value: stats.total,      icon: Users,     color: 'text-primary',     target: 550 },
          { label: 'Travelers',      value: stats.travelers,   icon: Car,       color: 'text-emerald-400', target: 50  },
          { label: 'Passengers',     value: stats.passengers,  icon: Users,     color: 'text-cyan-400',    target: 500 },
          { label: 'Senders',        value: stats.senders,     icon: Package,   color: 'text-amber-400',   target: 100 },
          { label: 'Invites Sent',   value: stats.invited,     icon: Send,      color: 'text-violet-400',  target: stats.total },
        ].map(({ label, value, icon: Icon, color, target }) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <div className={`text-2xl font-black ${color}`}>{value}</div>
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div className={`h-full bg-current ${color} rounded-full transition-all`} style={{ width: `${Math.min((value / target) * 100, 100)}%` }} />
            </div>
            <div className="text-[10px] text-slate-600 mt-1">{value} / {target} target</div>
          </motion.div>
        ))}
      </div>

      {/* Route Liquidity */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-white">Route Liquidity</h2>
        </div>
        <div className="space-y-3">
          {routeStats.map((rs) => (
            <div key={rs.route} className="flex items-center gap-3">
              <HealthDot health={rs.health} />
              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-300 w-44 flex-shrink-0">{rs.route}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${rs.health === 'good' ? 'bg-emerald-400' : rs.health === 'low' ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${Math.min((rs.travelers / ROUTE_TARGETS[rs.route].travelers) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 w-32 text-right flex-shrink-0">{rs.ratio}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-600">
          <span><HealthDot health="good" />60%+ filled</span>
          <span><HealthDot health="low" />30–59% filled</span>
          <span><HealthDot health="critical" />&lt;30% — needs seeding</span>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Waitlist Queue ({filtered.length})
          </h2>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name / phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-44 h-8 bg-background border-border text-white text-xs"
            />
            <div className="flex bg-background border border-border rounded-xl overflow-hidden">
              {(['all', 'traveler', 'passenger', 'sender'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-all ${filter === f ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background/50">
              <tr className="text-[11px] text-slate-500 uppercase tracking-wider">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Phone</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Route</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Ref Code</th>
                <th className="text-left p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading waitlist…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    No entries yet — share the waitlist link to start collecting signups.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const RoleIcon = ROLE_ICON[user.role] || Users;
                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-background/30 transition-colors">
                      <td className="p-3 text-slate-600 font-mono text-xs">#{user.position}</td>
                      <td className="p-3 font-semibold text-white">{user.name}</td>
                      <td className="p-3 text-slate-400 font-mono text-xs">+962 {user.phone}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold ${
                          user.role === 'traveler'  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          user.role === 'passenger' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          <RoleIcon className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-xs">{user.route}</td>
                      <td className="p-3">
                        {user.invited ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Invited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600 font-mono text-[11px]">{user.referral_code}</td>
                      <td className="p-3">
                        {!user.invited && (
                          <Button
                            size="sm"
                            onClick={() => handleInvite(user)}
                            disabled={inviting === user.id}
                            className="h-7 px-3 text-xs bg-primary hover:bg-primary/90 text-white rounded-lg"
                          >
                            {inviting === user.id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-3 h-3 mr-1" /> Invite
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Target progress summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Traveler Target (50)</h3>
          </div>
          <div className="text-3xl font-black text-emerald-400 mb-1">{stats.travelers} / 50</div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min((stats.travelers / 50) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {50 - stats.travelers > 0 ? `${50 - stats.travelers} more travelers needed to hit beta target` : '🎉 Traveler target reached!'}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Passenger Target (500)</h3>
          </div>
          <div className="text-3xl font-black text-cyan-400 mb-1">{stats.passengers} / 500</div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min((stats.passengers / 500) * 100, 100)}%` }} />
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {500 - stats.passengers > 0 ? `${500 - stats.passengers} more passengers needed` : '🎉 Passenger target reached!'}
          </p>
        </div>
      </div>
    </div>
  );
}
