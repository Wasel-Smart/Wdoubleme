import { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Download,
  Package,
  Plus,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ServicePageShell } from './ServicePageShell';
import {
  buildBusinessAccountSnapshot,
  type BusinessAccountSnapshot,
  type BusinessEmployee,
} from '../services/corridorOperations';
import { orchestrator, type ServiceActivation } from '../services/serviceOrchestrator';
import { getTier1Routes } from '../utils/regionConfig';
import { generateId } from '../utils/api';

const CORRIDORS = getTier1Routes('JO').filter((route) => route.packageEnabled);

function formatJod(value: number) {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency: 'JOD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function BusinessAccounts() {
  const [corridorId, setCorridorId] = useState(CORRIDORS[0]?.id ?? 'JO_AMM_IRB');
  const [snapshot, setSnapshot] = useState<BusinessAccountSnapshot | null>(null);
  const [employees, setEmployees] = useState<BusinessEmployee[]>([]);
  const [activations, setActivations] = useState<ServiceActivation[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    department: 'Operations',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      setIsLoading(true);
      const nextSnapshot = await buildBusinessAccountSnapshot(corridorId);
      if (cancelled) return;
      setSnapshot(nextSnapshot);
      setEmployees(nextSnapshot.employees);
      setActivations([]);
      setIsLoading(false);
    }

    void loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [corridorId]);

  const totalTrips = employees.reduce((total, employee) => total + employee.monthlyTrips, 0);
  const monthlySpend = employees.reduce((total, employee) => total + employee.monthlySpendJOD, 0);

  const handleAddEmployee = () => {
    if (!snapshot) return;
    if (!newEmployee.name || !newEmployee.email) {
      toast.error('Add the employee name and email to activate the corridor seat.');
      return;
    }

    const seatPrice = snapshot.seatYield[1]?.price ?? snapshot.seatYield[0]?.price ?? 0;
    const employee: BusinessEmployee = {
      id: generateId('emp'),
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department,
      monthlyTrips: snapshot.recurringDays,
      monthlySpendJOD: Number((seatPrice * snapshot.recurringDays).toFixed(2)),
      status: 'onboarding',
    };

    setEmployees((current) => [employee, ...current]);
    setNewEmployee({ name: '', email: '', department: 'Operations' });
    setShowAddEmployee(false);
    toast.success('Employee added to the recurring corridor plan.');
  };

  const handleActivateCorridor = async () => {
    if (!snapshot) return;

    setIsActivating(true);
    const context = await orchestrator.orchestrateBusinessCommute('business-hub', {
      companyName: snapshot.companyName,
      corridorId,
      employees: employees.length,
      monthlyCommuteDays: snapshot.recurringDays,
      returnVolumePerWeek: snapshot.packageOps.monthlyReturnVolume,
    });
    setActivations(context.activatedServices);
    setIsActivating(false);
    toast.success('Business corridor, pricing, and return logistics are now synchronized.');
  };

  const handleDownloadReport = () => {
    if (!snapshot) return;
    toast.success(
      `${snapshot.companyName} report ready: ${snapshot.corridor.from} to ${snapshot.corridor.to}, ${formatJod(monthlySpend)} projected monthly spend.`,
    );
  };

  if (isLoading || !snapshot) {
    return (
      <div className="wasel-container page-pad space-y-6">
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Building the business mobility operating model...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ServicePageShell
      accent="green"
      badge="First MENA corridor-commerce business account"
      title="Business Mobility Command Center"
      description="Recurring employee seats, return logistics, route intelligence, and yield pricing now run on one corridor layer."
      highlights={[
        { label: 'Corridor', value: `${snapshot.corridor.from} to ${snapshot.corridor.to}` },
        { label: 'Distance', value: `${snapshot.corridor.distanceKm} km` },
        { label: 'Health', value: `${snapshot.liquidity.healthScore}/100` },
        { label: 'Return attach', value: `${snapshot.packageOps.attachRatePercent}%` },
      ]}
      actions={
        <>
          <Select value={corridorId} onValueChange={setCorridorId}>
            <SelectTrigger className="w-full min-w-[220px] border-white/20 bg-white/10 text-white md:w-[220px]">
              <SelectValue placeholder="Select corridor" />
            </SelectTrigger>
            <SelectContent>
              {CORRIDORS.map((route) => (
                <SelectItem key={route.id} value={route.id}>
                  {route.from} to {route.to}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Report
          </Button>
          <Button
            className="bg-emerald-500 text-white hover:bg-emerald-600"
            onClick={handleActivateCorridor}
            disabled={isActivating}
          >
            <BriefcaseBusiness className="mr-2 h-4 w-4" />
            {isActivating ? 'Synchronizing...' : 'Activate Corridor'}
          </Button>
        </>
      }
      aside={
        <>
          <Card className="border-emerald-500/20 bg-card/80 backdrop-blur">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm text-muted-foreground">Projected invoice</p>
              <p className="text-3xl font-semibold">{formatJod(monthlySpend)}</p>
              <p className="text-sm text-muted-foreground">
                Built from recurring seats, route fill, and return-lane escrow.
              </p>
            </CardContent>
          </Card>
          <Card className="border-cyan-500/20 bg-card/80 backdrop-blur">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm text-muted-foreground">Employees on plan</p>
              <p className="text-3xl font-semibold">{employees.length}</p>
              <p className="text-sm text-muted-foreground">
                Every employee inherits route, pricing, and trust policy automatically.
              </p>
            </CardContent>
          </Card>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-semibold">{employees.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Trips</p>
                <p className="text-2xl font-semibold">{totalTrips}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Invoice</p>
                <p className="text-2xl font-semibold">{formatJod(monthlySpend)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Return Volume / Week</p>
                <p className="text-2xl font-semibold">{snapshot.packageOps.monthlyReturnVolume}</p>
              </div>
              <Package className="h-8 w-8 text-sky-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:w-fit md:grid-cols-4">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Employee Seat Plan</CardTitle>
                    <CardDescription>
                      Every employee is mapped onto the corridor engine, not reimbursed manually.
                    </CardDescription>
                  </div>
                  <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add employee to recurring corridor</DialogTitle>
                        <DialogDescription>
                          New employees inherit the route, pricing, and return lane policy immediately.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="employee-name">Full Name</Label>
                          <Input
                            id="employee-name"
                            value={newEmployee.name}
                            onChange={(event) =>
                              setNewEmployee((current) => ({ ...current, name: event.target.value }))
                            }
                            placeholder="Employee name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee-email">Email</Label>
                          <Input
                            id="employee-email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(event) =>
                              setNewEmployee((current) => ({ ...current, email: event.target.value }))
                            }
                            placeholder="employee@company.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select
                            value={newEmployee.department}
                            onValueChange={(department) =>
                              setNewEmployee((current) => ({ ...current, department }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Operations">Operations</SelectItem>
                              <SelectItem value="Finance">Finance</SelectItem>
                              <SelectItem value="Commercial">Commercial</SelectItem>
                              <SelectItem value="Customer Success">Customer Success</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full" onClick={handleAddEmployee}>
                          Add to Corridor Plan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Trips / Month</TableHead>
                      <TableHead>Spend</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{employee.name}</p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{employee.monthlyTrips}</TableCell>
                        <TableCell>{formatJod(employee.monthlySpendJOD)}</TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Corridor Health</CardTitle>
                  <CardDescription>Route intelligence keeps business supply focused where it is profitable.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Utilization</p>
                    <p className="text-2xl font-semibold">{Math.round(snapshot.liquidity.utilizationRate * 100)}%</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Recommended seat price</p>
                    <p className="text-2xl font-semibold">
                      {formatJod(snapshot.seatYield[1]?.price ?? snapshot.seatYield[0]?.price ?? 0)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {snapshot.policyHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fleet Performance</CardTitle>
                  <CardDescription>Trusted drivers feed the same seat and return inventory.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {snapshot.fleetDrivers.map((driver) => (
                    <div key={driver.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">{driver.vehicle}</p>
                        </div>
                        <Badge>{driver.rating.toFixed(1)} rating</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Trips</p>
                          <p className="font-medium">{driver.trips}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Earnings</p>
                          <p className="font-medium">{formatJod(driver.earningsJOD)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trust</p>
                          <p className="font-medium">{driver.trustScore}/100</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Return Matching Lane</CardTitle>
                <CardDescription>
                  Corporate returns ride on active employee or fleet corridors instead of standalone courier trips.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Tracking Code</p>
                    <p className="font-semibold">{snapshot.packageOps.tracking.trackingCode}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Escrow</p>
                    <p className="font-semibold">{formatJod(snapshot.packageOps.escrow.amount)}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Attach Rate</p>
                    <p className="font-semibold">{snapshot.packageOps.attachRatePercent}%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {snapshot.packageMatches.length > 0 ? (
                    snapshot.packageMatches.map(({ trip, result }) => (
                      <div key={trip.id} className="rounded-xl border p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">
                              {trip.originCity} to {trip.destinationCity}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Package score {result.score}/100
                            </p>
                          </div>
                          <Badge className="bg-sky-600">{trip.allowsPackages ? 'Package-ready' : 'Closed'}</Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No package matches found for this corridor yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>The corridor earns from both people and trunk space.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <ArrowRightLeft className="h-5 w-5 text-sky-600" />
                  <div>
                    <p className="font-medium">Reverse logistics</p>
                    <p className="text-muted-foreground">Finance documents, uniforms, laptops, and merchant returns.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">Fleet-backed trust</p>
                    <p className="text-muted-foreground">Escrow and verified drivers increase business confidence on every lane.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border p-4">
                  <Building2 className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium">Recurring contracts</p>
                    <p className="text-muted-foreground">Monthly business invoices replace one-off ride spend and courier waste.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seat Yield and Billing</CardTitle>
              <CardDescription>
                Seat pricing is now tied to corridor fill, not random manual pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Monthly invoice</p>
                    <p className="text-2xl font-semibold">{formatJod(monthlySpend)}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Estimated savings</p>
                    <p className="text-2xl font-semibold">{snapshot.estimatedSavingsPercent}%</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Recurring days</p>
                    <p className="text-2xl font-semibold">{snapshot.recurringDays}</p>
                  </div>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="mb-3 font-medium">Billing logic</p>
                  <p className="text-sm text-muted-foreground">
                    Invoice = recurring seat allocation + verified return-lane escrow. This turns commuter demand into predictable contract revenue.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {snapshot.seatYield.map((seat) => (
                  <div key={seat.seatIndex} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{seat.label}</p>
                        <p className="text-sm text-muted-foreground">{seat.savings}% savings versus solo</p>
                      </div>
                      <Badge>{formatJod(seat.price)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Operational Activations</CardTitle>
              <CardDescription>
                Once you activate the corridor, the platform coordinates pricing, seats, returns, billing, and trust automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Activate the corridor to see the orchestration engine switch on business mobility services.
                </p>
              ) : (
                activations.map((activation) => (
                  <div key={`${activation.service}-${activation.triggered.toISOString()}`} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium capitalize">{activation.service.replace(/-/g, ' ')}</p>
                      <Badge variant={activation.status === 'completed' ? 'default' : 'secondary'}>
                        {activation.status}
                      </Badge>
                    </div>
                    <pre className="mt-3 overflow-auto rounded-lg bg-muted p-3 text-xs">
                      {JSON.stringify(activation.metadata, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ServicePageShell>
  );
}
