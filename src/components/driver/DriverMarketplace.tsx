/**
 * Driver Marketplace & Services
 * 
 * The hub for drivers to manage their service offerings and find new work.
 * 
 * Features:
 * - Service toggles (Rideshare, Delivery, etc.)
 * - Subscription Marketplace (Recurring high-value contracts)
 * - Job Board for ad-hoc opportunities
 * 
 * @module DriverMarketplace
 */

import { useState } from 'react';
import { 
  Store, 
  Car, 
  Briefcase, 
  Truck, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Filter, 
  MapPin, 
  Clock, 
  Users 
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback } from '../ui/avatar';

// --- Types ---

interface ServiceType {
  id: string;
  name: string;
  icon: React.ElementType;
  active: boolean;
  rate: string;
  description: string;
}

interface SubscriptionOpp {
  id: string;
  client: string;
  route: { from: string; to: string };
  time: string;
  days: string[];
  payout: number;
  currency: string;
  passengers: number;
  distance: string;
}

// --- Mock Data ---

const SERVICES: ServiceType[] = [
  { id: 'rideshare', name: 'Standard Ride', icon: Car, active: true, rate: 'Metered', description: 'Regular point-to-point trips' },
  { id: 'school', name: 'School Run', icon: Users, active: true, rate: 'Contract', description: 'Morning/Afternoon student transport' },
  { id: 'hire', name: 'Corporate Rides', icon: Briefcase, active: false, rate: '15 JOD/hr', description: 'Recurring corporate carpools' },
  { id: 'delivery', name: 'Express Delivery', icon: Truck, active: false, rate: 'Dynamic', description: 'Small package courier' }
];

const SUBSCRIPTIONS: SubscriptionOpp[] = [
  { 
    id: 'sub-1', 
    client: 'Sara M.', 
    route: { from: '7th Circle', to: 'University of Jordan' }, 
    time: '07:30 AM', 
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'], 
    payout: 80, 
    currency: 'JOD',
    passengers: 3,
    distance: '12 km'
  },
  { 
    id: 'sub-2', 
    client: 'Tech Corp', 
    route: { from: 'Abdali', to: 'Zarqa Free Zone' }, 
    time: '05:00 PM', 
    days: ['Daily'], 
    payout: 120, 
    currency: 'JOD',
    passengers: 4,
    distance: '25 km'
  },
];

// --- Sub-Components ---

const ServiceCard = ({ service, onToggle }: { service: ServiceType; onToggle: (id: string) => void }) => (
  <div className={`flex items-start justify-between p-4 border rounded-xl transition-all duration-200 ${service.active ? 'bg-primary/5 border-primary/20' : 'bg-background hover:bg-secondary/50'}`}>
    <div className="flex gap-4">
      <div className={`p-3 rounded-full ${service.active ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
        <service.icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-bold text-sm text-foreground">{service.name}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
        <Badge variant="outline" className="mt-2 text-[10px] h-5 bg-background">{service.rate}</Badge>
      </div>
    </div>
    <Switch checked={service.active} onCheckedChange={() => onToggle(service.id)} />
  </div>
);

const SubscriptionCard = ({ sub }: { sub: SubscriptionOpp }) => (
  <Card className="overflow-hidden border-l-4 border-l-indigo-500 hover:shadow-lg transition-all cursor-pointer group">
    <CardContent className="p-0">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">{sub.client[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-bold text-sm text-foreground">{sub.client}</h4>
              <Badge variant="secondary" className="text-[10px] h-5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Monthly Plan</Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{sub.payout}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{sub.currency} / MO</p>
          </div>
        </div>

        <div className="space-y-3 relative pl-4 border-l-2 border-dashed border-indigo-100 ml-2">
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-white border-2 border-indigo-300 rounded-full" />
            <p className="text-xs font-medium text-muted-foreground">PICKUP</p>
            <p className="text-sm font-semibold text-foreground">{sub.route.from}</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[21px] top-1 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full shadow-sm" />
            <p className="text-xs font-medium text-muted-foreground">DROPOFF</p>
            <p className="text-sm font-semibold text-foreground">{sub.route.to}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
           <div className="flex flex-col items-center justify-center p-2 bg-secondary/30 rounded-lg">
             <Clock className="w-4 h-4 text-muted-foreground mb-1" />
             <span className="text-xs font-bold">{sub.time}</span>
           </div>
           <div className="flex flex-col items-center justify-center p-2 bg-secondary/30 rounded-lg">
             <Calendar className="w-4 h-4 text-muted-foreground mb-1" />
             <span className="text-xs font-bold">{sub.days.length > 3 ? 'Weekdays' : 'Part-time'}</span>
           </div>
           <div className="flex flex-col items-center justify-center p-2 bg-secondary/30 rounded-lg">
             <Users className="w-4 h-4 text-muted-foreground mb-1" />
             <span className="text-xs font-bold">{sub.passengers} Pax</span>
           </div>
        </div>
      </div>
      <div className="bg-secondary/50 p-3 border-t border-border flex gap-3">
        <Button variant="outline" className="flex-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800">
          Decline
        </Button>
        <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
          Accept Contract
        </Button>
      </div>
    </CardContent>
  </Card>
);

// --- Main Component ---

export function DriverMarketplace() {
  const [services, setServices] = useState<ServiceType[]>(SERVICES);

  const handleToggle = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-500">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Manage services & find work.</p>
        </div>
        <Button variant="outline" size="sm" className="h-9">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
      </div>

      <Tabs defaultValue="services" className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-secondary/50 rounded-xl">
          <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">My Services</TabsTrigger>
          <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6 mt-6 flex-1 outline-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Active Services</h2>
            </div>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onToggle={handleToggle} />
            ))}
          </div>

          <Card className="border-dashed border-2 shadow-none bg-secondary/10">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                <Store className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-foreground">Add More Services</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Unlock new earning opportunities by verifying your skills.</p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Browse Catalog
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-6 mt-6 flex-1 outline-none">
          {/* Stats Banner */}
          <div className="grid grid-cols-2 gap-3">
             <Card className="bg-indigo-600 text-white border-none shadow-lg">
               <CardContent className="p-4 text-center">
                 <p className="text-2xl font-bold">3</p>
                 <p className="text-[10px] opacity-80 uppercase tracking-wider font-medium">Active Plans</p>
               </CardContent>
             </Card>
             <Card className="bg-white border-indigo-100 shadow-sm text-indigo-900">
               <CardContent className="p-4 text-center">
                 <p className="text-2xl font-bold">450 <span className="text-sm font-normal text-muted-foreground">JOD</span></p>
                 <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Monthly Revenue</p>
               </CardContent>
             </Card>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Open Contracts</h2>
              <Badge variant="secondary" className="text-[10px] h-5">2 New</Badge>
            </div>
            {SUBSCRIPTIONS.map((sub) => (
              <SubscriptionCard key={sub.id} sub={sub} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}