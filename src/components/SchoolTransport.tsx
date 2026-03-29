import { useEffect, useState } from 'react';
import {
  Bell,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Route,
  School,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ServicePageShell } from './ServicePageShell';
import {
  buildSchoolTransportSnapshot,
  type SchoolGuardian,
  type SchoolStudentDraft,
  type SchoolTransportSnapshot,
} from '../services/corridorOperations';
import { orchestrator, type ServiceActivation } from '../services/serviceOrchestrator';
import { getTier1Routes } from '../utils/regionConfig';
import { generateId } from '../utils/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const ROUTES = getTier1Routes('JO');

function formatJod(value: number) {
  return new Intl.NumberFormat('en-JO', {
    style: 'currency',
    currency: 'JOD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getAverageGuardians(students: SchoolStudentDraft[]) {
  if (students.length === 0) return 0;
  return students.reduce((total, student) => total + student.guardians.length, 0) / students.length;
}

export function SchoolTransport() {
  const [routeId, setRouteId] = useState(ROUTES[0]?.id ?? 'JO_AMM_ZRQ');
  const [snapshot, setSnapshot] = useState<SchoolTransportSnapshot | null>(null);
  const [students, setStudents] = useState<SchoolStudentDraft[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
  const [pickupLocation, setPickupLocation] = useState('Abdoun pickup cluster');
  const [schoolLocation, setSchoolLocation] = useState('School campus');
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('round-trip');
  const [pickupTime, setPickupTime] = useState('06:35');
  const [returnTime, setReturnTime] = useState('14:20');
  const [activations, setActivations] = useState<ServiceActivation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<{
    name: string;
    age: string;
    grade: string;
    guardians: SchoolGuardian[];
  }>({
    name: '',
    age: '',
    grade: '',
    guardians: [],
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSnapshot() {
      setIsLoading(true);
      const nextSnapshot = await buildSchoolTransportSnapshot(routeId);
      if (cancelled) return;
      setSnapshot(nextSnapshot);
      setStudents(nextSnapshot.students);
      setPickupLocation(`${nextSnapshot.route.from} family pickup lane`);
      setSchoolLocation(`${nextSnapshot.route.to} school campus`);
      setSelectedDays(nextSnapshot.operatingDays);
      setActivations([]);
      setIsLoading(false);
    }

    void loadSnapshot();

    return () => {
      cancelled = true;
    };
  }, [routeId]);

  const toggleDay = (day: string) => {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  };

  const addGuardian = () => {
    setCurrentStudent((current) => ({
      ...current,
      guardians: [...current.guardians, { name: '', relationship: '', phone: '' }],
    }));
  };

  const updateGuardian = (index: number, field: keyof SchoolGuardian, value: string) => {
    setCurrentStudent((current) => {
      const guardians = [...current.guardians];
      guardians[index] = { ...guardians[index], [field]: value };
      return { ...current, guardians };
    });
  };

  const addStudent = () => {
    if (!currentStudent.name || !currentStudent.age || !currentStudent.grade) {
      toast.error('Add the student name, age, and grade to reserve a seat.');
      return;
    }

    if (currentStudent.guardians.length === 0 || currentStudent.guardians.some((guardian) => !guardian.name || !guardian.relationship || !guardian.phone)) {
      toast.error('Each student needs at least one fully verified guardian.');
      return;
    }

    const student: SchoolStudentDraft = {
      id: generateId('student'),
      name: currentStudent.name,
      age: Number(currentStudent.age),
      grade: currentStudent.grade,
      guardians: currentStudent.guardians,
    };

    setStudents((current) => [...current, student]);
    setCurrentStudent({
      name: '',
      age: '',
      grade: '',
      guardians: [],
    });
    toast.success('Student added to the recurring school corridor.');
  };

  const handleBooking = async () => {
    if (!snapshot) return;
    if (!pickupLocation || !schoolLocation || selectedDays.length === 0 || students.length === 0) {
      toast.error('Complete the route, schedule, and student list before activating school transport.');
      return;
    }

    setIsSubmitting(true);
    const context = await orchestrator.orchestrateSchoolTransport('school-hub', {
      corridorId: routeId,
      pickup: pickupLocation,
      schoolLocation,
      studentsCount: students.length,
      days: selectedDays,
      roundTrip: tripType === 'round-trip',
      guardiansPerStudent: Math.max(1, Math.round(getAverageGuardians(students))),
    });
    setActivations(context.activatedServices);
    setIsSubmitting(false);
    toast.success('School route, guardian alerts, and live tracking are now coordinated.');
  };

  if (isLoading || !snapshot) {
    return (
      <div className="wasel-container page-pad space-y-6">
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">
            Building the school transport operating model...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ServicePageShell
      accent="gold"
      badge="Guardian-verified recurring school transport"
      title="School Transport Network"
      description="Route intelligence, school subscriptions, guardian verification, and live route tracking now operate as one connected service."
      highlights={[
        { label: 'Corridor', value: `${snapshot.route.from} to ${snapshot.route.to}` },
        { label: 'Guardian coverage', value: `${snapshot.guardianCoveragePercent}%` },
        { label: 'Route health', value: `${snapshot.liquidity.healthScore}/100` },
        { label: 'Vehicle', value: snapshot.recommendedVehicle },
      ]}
      aside={
        <>
          <Card className="border-amber-500/20 bg-card/80 backdrop-blur">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm text-muted-foreground">Standard subscription</p>
              <p className="text-3xl font-semibold">{formatJod(snapshot.subscriptionPricing.standard)}</p>
              <p className="text-sm text-muted-foreground">
                Verified route, guardian alerts, and recurring seat allocation.
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-card/80 backdrop-blur">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm text-muted-foreground">Morning window</p>
              <p className="text-3xl font-semibold">{snapshot.morningWindow}</p>
              <p className="text-sm text-muted-foreground">
                Pickup windows stay synchronized with route health and family verification.
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
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-semibold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Standard Subscription</p>
                <p className="text-2xl font-semibold">{formatJod(snapshot.subscriptionPricing.standard)}</p>
              </div>
              <Bus className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Premium Subscription</p>
                <p className="text-2xl font-semibold">{formatJod(snapshot.subscriptionPricing.premium)}</p>
              </div>
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Morning Window</p>
                <p className="text-2xl font-semibold">{snapshot.morningWindow}</p>
              </div>
              <Clock className="h-8 w-8 text-sky-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="planner" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 gap-2 md:w-fit md:grid-cols-4">
          <TabsTrigger value="planner">Planner</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="planner" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Route and Schedule</CardTitle>
                <CardDescription>Choose the corridor first, then let the platform price and verify the recurring plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Corridor</Label>
                  <Select value={routeId} onValueChange={setRouteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select corridor" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROUTES.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.from} to {route.to}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-location">Pickup Cluster</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="pickup-location"
                        className="pl-9"
                        value={pickupLocation}
                        onChange={(event) => setPickupLocation(event.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-location">School Campus</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="school-location"
                        className="pl-9"
                        value={schoolLocation}
                        onChange={(event) => setSchoolLocation(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Trip Type</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={tripType === 'one-way' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTripType('one-way')}
                    >
                      One-way
                    </Button>
                    <Button
                      variant={tripType === 'round-trip' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setTripType('round-trip')}
                    >
                      Round-trip
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-time">Pickup Time</Label>
                    <Input
                      id="pickup-time"
                      type="time"
                      value={pickupTime}
                      onChange={(event) => setPickupTime(event.target.value)}
                    />
                  </div>
                  {tripType === 'round-trip' && (
                    <div className="space-y-2">
                      <Label htmlFor="return-time">Return Time</Label>
                      <Input
                        id="return-time"
                        type="time"
                        value={returnTime}
                        onChange={(event) => setReturnTime(event.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Operating Days</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                        <Checkbox
                          checked={selectedDays.includes(day)}
                          onCheckedChange={() => toggleDay(day)}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Safety Operations</CardTitle>
                <CardDescription>School transport is only strong when the guardian and route layers stay synchronized.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {snapshot.safetyChecklist.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
                <div className="rounded-xl bg-muted p-4 text-sm">
                  <p className="font-medium">Prayer-aware route handling</p>
                  <p className="mt-1 text-muted-foreground">
                    {snapshot.prayerStops.length === 0
                      ? 'This route is short enough to avoid mandatory prayer stop scheduling.'
                      : `${snapshot.prayerStops.length} prayer stop windows can be injected automatically when needed.`}
                  </p>
                </div>
                <Button className="w-full" onClick={handleBooking} disabled={isSubmitting}>
                  {isSubmitting ? 'Synchronizing...' : 'Activate School Route'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Add Student</CardTitle>
                <CardDescription>Every student needs guardians before the seat can go live.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="student-name">Student Name</Label>
                    <Input
                      id="student-name"
                      value={currentStudent.name}
                      onChange={(event) =>
                        setCurrentStudent((current) => ({ ...current, name: event.target.value }))
                      }
                      placeholder="Student name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-age">Age</Label>
                    <Input
                      id="student-age"
                      type="number"
                      value={currentStudent.age}
                      onChange={(event) =>
                        setCurrentStudent((current) => ({ ...current, age: event.target.value }))
                      }
                      placeholder="Age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Select
                      value={currentStudent.grade}
                      onValueChange={(grade) =>
                        setCurrentStudent((current) => ({ ...current, grade }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, index) => index + 1).map((grade) => (
                          <SelectItem key={grade} value={`Grade ${grade}`}>
                            Grade {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Guardians</Label>
                    <Button variant="outline" size="sm" onClick={addGuardian}>
                      Add Guardian
                    </Button>
                  </div>
                  {currentStudent.guardians.map((guardian, index) => (
                    <div key={`${guardian.phone}-${index}`} className="grid grid-cols-1 gap-3 rounded-xl bg-muted p-3 md:grid-cols-3">
                      <Input
                        value={guardian.name}
                        onChange={(event) => updateGuardian(index, 'name', event.target.value)}
                        placeholder="Guardian name"
                      />
                      <Input
                        value={guardian.relationship}
                        onChange={(event) => updateGuardian(index, 'relationship', event.target.value)}
                        placeholder="Relationship"
                      />
                      <Input
                        value={guardian.phone}
                        onChange={(event) => updateGuardian(index, 'phone', event.target.value)}
                        placeholder="Phone"
                      />
                    </div>
                  ))}
                </div>

                <Button className="w-full" variant="outline" onClick={addStudent}>
                  Add Student to Route
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guardian Coverage</CardTitle>
                <CardDescription>Students are only active when their guardians are mapped to pickup and drop-off.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.grade} • {student.age} years
                        </p>
                      </div>
                      <Badge>{student.guardians.length} guardians</Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {student.guardians.map((guardian) => (
                        <div key={`${student.id}-${guardian.phone}`} className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>
                            {guardian.name} • {guardian.relationship} • {guardian.phone}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Logic</CardTitle>
                <CardDescription>Pricing is built from route distance and recurring days, not manual guesswork.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Standard</p>
                    <p className="text-2xl font-semibold">{formatJod(snapshot.subscriptionPricing.standard)}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Premium</p>
                    <p className="text-2xl font-semibold">{formatJod(snapshot.subscriptionPricing.premium)}</p>
                  </div>
                </div>
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  Standard covers the verified route, guardian alerts, and recurring seat allocation. Premium adds tighter support and higher-touch service operations.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seat Yield Preview</CardTitle>
                <CardDescription>Even school transport stays on the same capacity logic as the rest of the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.seatYield.map((seat) => (
                  <div key={seat.seatIndex} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{seat.label}</p>
                        <p className="text-sm text-muted-foreground">{seat.savings}% savings versus solo service</p>
                      </div>
                      <Badge>{formatJod(seat.price)}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Matching Preview</CardTitle>
                <CardDescription>Route intelligence chooses trusted recurring options before the route goes live.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {snapshot.matchingPreview.map(({ trip, score }) => (
                  <div key={trip.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {trip.originCity} to {trip.destinationCity}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Match {score.overall}/100 • Driver {trip.driverRating.toFixed(1)}
                        </p>
                      </div>
                      <Badge>{trip.availableSeats} seats</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Activations</CardTitle>
                <CardDescription>Guardian verification, tracking, subscription planning, and route intelligence activate together.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activations.length === 0 ? (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                      <Bell className="h-5 w-5 text-sky-600" />
                      Guardian notifications are ready to be activated once the route is confirmed.
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                      <Route className="h-5 w-5 text-emerald-600" />
                      Live route intelligence will appear here after activation.
                    </div>
                  </div>
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
          </div>
        </TabsContent>
      </Tabs>
    </ServicePageShell>
  );
}
