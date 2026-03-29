import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Building2, Briefcase, Users, TrendingDown, Clock, MapPin, ArrowRight, Wallet, CheckCircle } from 'lucide-react';
import { NeuroCore } from '../../utils/ai/NeuroCore';
import { toast } from 'sonner';

interface SharedRide {
  id: string;
  route: { from: string; to: string };
  time: string;
  capacity: number;
  currentPassengers: number;
  baseTotalCost: number;
  driverName: string;
  vehicle: string;
}

import { PayrollDeductionDashboard } from '../enterprise/PayrollDeductionDashboard';
import { EnterpriseAdminDashboard } from './EnterpriseAdminDashboard';
import { RideQRTicket } from '../verification/RideVerification';
import { DriverQRScanner } from '../verification/RideVerification';
import { HRIntegration } from '../../utils/enterprise/HRIntegrationService';
import { DriverPayoutService } from '../../utils/driver/DriverPayoutService';

export function EnterpriseCommute() {
  const [activeTab, setActiveTab] = useState('find');
  const [officeLocation, setOfficeLocation] = useState('Business Park, Building 4');
  
  // Mock Data for Shared Rides
  const [availableRides, setAvailableRides] = useState<SharedRide[]>([
    {
      id: 'ride-1',
      route: { from: '7th Circle', to: 'Business Park' },
      time: '08:30 AM',
      capacity: 4,
      currentPassengers: 1,
      baseTotalCost: 12.00, // JOD
      driverName: 'Sameer K.',
      vehicle: 'Toyota Camry Hybrid'
    },
    {
      id: 'ride-2',
      route: { from: 'Khalda', to: 'Business Park' },
      time: '08:45 AM',
      capacity: 6,
      currentPassengers: 3,
      baseTotalCost: 15.00, // JOD
      driverName: 'Rami A.',
      vehicle: 'Honda Odyssey'
    }
  ]);

  const handleJoinRide = async (rideId: string) => {
    // 1. Check HR Eligibility
    const { eligible, reason } = await HRIntegration.validateEligibility('emp_001');
    if (!eligible) {
      toast.error('Authorization Failed', { description: reason });
      return;
    }

    toast.success('Joined shared ride!', {
      description: 'Payroll deduction authorized via SAP SuccessFactors.'
    });
    // In a real app, update state/backend
    setAvailableRides(prev => prev.map(ride => {
        if (ride.id === rideId && ride.currentPassengers < ride.capacity) {
            // Calculate correct cost based on NEW passenger count
            const newPassengerCount = ride.currentPassengers + 1;
            const rideCost = ride.baseTotalCost / newPassengerCount;
            
            // 2. Process Employee Deduction
            HRIntegration.processDeduction(
              'emp_001', 
              ride.id, 
              rideCost,
              'driver_001'
            ).then((tx) => {
               // 3. Credit Driver Payout
               // Driver gets the FULL amount (Employee Share + Company Subsidy)
               // The HRIntegration calculates the split, so we use those values
               DriverPayoutService.creditEnterpriseTrip(
                 'driver_001',
                 tx.totalAmount,
                 ride.id,
                 {
                   employeeShare: tx.employeeShare,
                   subsidy: tx.companySubsidy
                 }
               ).then(() => {
                 toast.success('Commute Booked & Driver Credited', { 
                   description: `Paid: ${tx.employeeShare.toFixed(2)} JOD. Subsidy: ${tx.companySubsidy.toFixed(2)} JOD` 
                 });
               });
            });

            return { ...ride, currentPassengers: newPassengerCount };
        }
        return ride;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            Enterprise Commute
          </h1>
          <p className="text-muted-foreground">
            Share rides with colleagues, split the cost, and save the planet.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Building2 className="w-4 h-4" />
          {officeLocation}
        </div>
      </div>

      <Tabs defaultValue="find" className="w-full">
        <TabsList>
          <TabsTrigger value="find">Find Shared Ride</TabsTrigger>
          <TabsTrigger value="create">Offer Ride</TabsTrigger>
          <TabsTrigger value="dashboard">My Commutes</TabsTrigger>
          <TabsTrigger value="admin">HR Admin (Demo)</TabsTrigger>
          <TabsTrigger value="driver-demo">Driver Scanner (Demo)</TabsTrigger>
        </TabsList>

        <TabsContent value="find" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRides.map((ride) => {
              // Calculate Dynamic Pricing
              const pricing = NeuroCore.calculateSharedRidePricing(
                ride.baseTotalCost, 
                ride.currentPassengers, 
                ride.capacity
              );
              
              const potentialPricing = NeuroCore.calculateSharedRidePricing(
                ride.baseTotalCost, 
                ride.currentPassengers + 1, 
                ride.capacity
              );

              return (
                <Card key={ride.id} className="relative overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                    {ride.capacity - ride.currentPassengers} seats left
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{ride.time}</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {ride.vehicle}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> {ride.route.from} <ArrowRight className="w-3 h-3" /> {ride.route.to}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Passenger Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>{ride.currentPassengers} joined</span>
                        <span>Goal: {ride.capacity}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500" 
                          style={{ width: `${(ride.currentPassengers / ride.capacity) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Pricing Box */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Price</span>
                        <span className="font-bold text-lg text-blue-600">{pricing.pricePerSeat} JOD</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                        <TrendingDown className="w-3 h-3" />
                        <span>Join now & price drops to {potentialPricing.pricePerSeat} JOD</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{ride.driverName} is driving</span>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700" 
                      onClick={() => handleJoinRide(ride.id)}
                      disabled={ride.currentPassengers >= ride.capacity}
                    >
                      {ride.currentPassengers >= ride.capacity ? 'Full' : 'Join Ride'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
             <CardHeader>
               <CardTitle>Create a Carpool</CardTitle>
               <CardDescription>Offer a ride to colleagues and reduce your costs.</CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label>Pickup Location</Label>
                 <Input placeholder="Enter your starting point" />
               </div>
               <div className="space-y-2">
                 <Label>Departure Time</Label>
                 <Input type="time" />
               </div>
               <div className="space-y-2">
                 <Label>Available Seats</Label>
                 <Input type="number" min="1" max="6" defaultValue="3" />
               </div>
               <Button className="w-full">Post Ride</Button>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <PayrollDeductionDashboard employeeId="emp_001" />
        </TabsContent>

        <TabsContent value="admin" className="mt-6">
          <EnterpriseAdminDashboard />
        </TabsContent>

        <TabsContent value="driver-demo" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <h3 className="text-lg font-bold mb-4">Passenger View (Boarding Pass)</h3>
              <RideQRTicket 
                tripId="TRIP-1234-DEMO" 
                passengerId="emp_001" 
                passengerName="Layla Al-Fayez" 
              />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Driver View (Scanner)</h3>
              <DriverQRScanner />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
