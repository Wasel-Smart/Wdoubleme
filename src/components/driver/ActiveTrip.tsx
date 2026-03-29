/**
 * Active Trip Component for Drivers
 * Real-time trip management with navigation and passenger communication
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { 
  Navigation, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  User,
  CheckCircle,
  AlertCircle,
  Navigation2,
  Layers,
  ShieldAlert
} from 'lucide-react';

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { WaselMap } from '../WaselMap';
import { useTranslation } from '../hooks/useTranslation';
import { safetyAPI as hazardsAPI } from '../../services/safety';
import type { ActiveTrip } from '../../types/driver';
import type { Hazard } from '../GoogleMapComponent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface ActiveTripProps {
  tripId: string;
  onNavigate: (page: string) => void;
}

export function DriverActiveTrip({ tripId, onNavigate }: ActiveTripProps) {
  const { t } = useTranslation();
  const [trip, setTrip] = useState<ActiveTrip | null>(null);
  const [currentStep, setCurrentStep] = useState<'arriving' | 'arrived' | 'picked_up' | 'in_progress'>('arriving');
  const [showTraffic, setShowTraffic] = useState(false);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Fetch trip details
  useEffect(() => {
    if (!tripId) return;

    const controller = new AbortController();
    const fetchTrip = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/ride-requests/${tripId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          signal: controller.signal
        });

        if (response.ok) {
          const data = await response.json();
          const req = data.request;
          
          if (req) {
            // Adapt API response to ActiveTrip structure
            const activeTrip: ActiveTrip = {
              id: req.id,
              booking_id: req.id,
              passenger_id: req.passenger_id,
              passenger_name: req.passenger_name || 'Passenger',
              passenger_phone: req.passenger_phone || '+962791234567', // Fallback
              passenger_avatar: req.passenger_avatar,
              pickup_location: req.pickup_location,
              dropoff_location: req.dropoff_location,
              status: req.status === 'accepted' ? 'arriving' : (req.status as any),
              distance_remaining: (req.estimated_distance || 0) * 1000,
              time_remaining: (req.estimated_duration || 0) * 60,
              fare: req.estimated_fare || 0,
              payment_method: req.payment_method || 'cash',
              payment_status: req.payment_status || 'pending',
              accepted_at: req.accepted_at || new Date().toISOString(),
            };
            
            setTrip(activeTrip);
            setCurrentStep(activeTrip.status as any);
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching trip:', error);
        }
      }
    };

    fetchTrip();
    
    // Poll for status updates (optional, for real-time updates)
    const intervalId = setInterval(fetchTrip, 10000);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [tripId]);

  const loadHazards = useCallback(async () => {
    if (!trip) return;
    try {
      const center = currentStep === 'arriving' ? trip.pickup_location : trip.dropoff_location;
      const { hazards: fetchedHazards } = await hazardsAPI.getHazards(
        center.lat, 
        center.lng, 
        10 // 10km radius
      );
      setHazards(fetchedHazards || []);
    } catch (error) {
      console.error('Failed to load hazards', error);
      // Fallback to simulated hazards if API fails (or for demo)
      if (hazards.length === 0) {
        setHazards([
          {
            type: 'police',
            location: { lat: 31.9545, lng: 35.8630 },
            description: 'Police Checkpoint'
          },
          {
            type: 'radar',
            location: { lat: 31.9530, lng: 35.8650 },
            description: 'Speed Radar'
          },
          {
            type: 'barrier',
            location: { lat: 31.9535, lng: 35.9000 },
            description: 'Road Works'
          }
        ]);
      }
    }
  }, [trip, currentStep, hazards.length]);

  useEffect(() => {
    if (trip) {
      loadHazards();
      const interval = setInterval(loadHazards, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [trip, loadHazards]);

  const handleReportHazard = async (type: Hazard['type']) => {
    if (!trip) return;
    try {
      // In a real app, this would use the driver's current GPS location
      // For now, we'll use the center of the map (pickup or dropoff) + small random offset
      const center = currentStep === 'arriving' ? trip.pickup_location : trip.dropoff_location;
      const location = {
        lat: center.lat + (Math.random() - 0.5) * 0.002,
        lng: center.lng + (Math.random() - 0.5) * 0.002
      };
      
      await hazardsAPI.reportHazard(type, location, `Reported by driver`);
      setIsReportOpen(false);
      loadHazards(); // Refresh immediately
    } catch (error) {
      console.error('Failed to report hazard', error);
    }
  };

  const handleUpdateStatus = useCallback(async (status: ActiveTrip['status']) => {
    if (!trip) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Optimistic update
      setCurrentStep(status as any);
      setTrip({ ...trip, status });

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/ride-requests/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update trip status');
      }
      
      console.log('Trip status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      // Ideally revert optimistic update here
    }
  }, [trip]);

  const handleOpenNavigation = useCallback(() => {
    if (!trip) return;

    const destination = currentStep === 'arriving' || currentStep === 'arrived' 
      ? trip.pickup_location 
      : trip.dropoff_location;

    // Open in Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
    window.open(url, '_blank');
  }, [trip, currentStep]);

  const handleCallPassenger = useCallback(() => {
    if (!trip) return;
    window.open(`tel:${trip.passenger_phone}`);
  }, [trip]);

  const handleMessagePassenger = useCallback(() => {
    onNavigate(`messages?trip_id=${tripId}`);
  }, [tripId, onNavigate]);

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Map View */}
      <div className="relative h-[50vh]">
        <WaselMap
          center={trip.pickup_location}
          zoom={14}
          route={[
            { lat: trip.pickup_location.lat, lng: trip.pickup_location.lng, label: 'Pickup' },
            { lat: trip.dropoff_location.lat, lng: trip.dropoff_location.lng, label: 'Dropoff' },
          ]}
          showTraffic={showTraffic}
          showMosques
          showRadars
          className="w-full h-full"
        />

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <Button
            size="icon"
            variant={showTraffic ? "default" : "secondary"}
            className="shadow-lg rounded-full"
            onClick={() => setShowTraffic(!showTraffic)}
            title="Toggle Traffic"
          >
            <Layers className="h-5 w-5" />
          </Button>
          
          <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="shadow-lg rounded-full"
                title="Report Hazard"
              >
                <ShieldAlert className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Report Hazard on Wasel Map</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <Button variant="outline" className="flex flex-col h-24 gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20" onClick={() => handleReportHazard('police')}>
                  <ShieldAlert className="h-8 w-8 text-blue-600" />
                  <span className="font-semibold">Police</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-24 gap-2 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20" onClick={() => handleReportHazard('radar')}>
                  <div className="bg-red-100 p-2 rounded-full"><div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div></div>
                  <span className="font-semibold">Radar</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-24 gap-2 hover:bg-yellow-50 hover:border-yellow-200 dark:hover:bg-yellow-900/20" onClick={() => handleReportHazard('traffic')}>
                  <Navigation className="h-8 w-8 text-yellow-600" />
                  <span className="font-semibold">Traffic</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-24 gap-2 hover:bg-orange-50 hover:border-orange-200 dark:hover:bg-orange-900/20" onClick={() => handleReportHazard('accident')}>
                   <AlertCircle className="h-8 w-8 text-orange-600" />
                   <span className="font-semibold">Accident</span>
                </Button>
                 <Button variant="outline" className="flex flex-col h-24 gap-2 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-800" onClick={() => handleReportHazard('barrier')}>
                   <Layers className="h-8 w-8 text-gray-600" />
                   <span className="font-semibold">Road Works</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Floating Navigation Button */}
        <Button
          size="lg"
          className="absolute bottom-4 right-4 shadow-lg"
          onClick={handleOpenNavigation}
        >
          <Navigation2 className="h-5 w-5 mr-2" />
          {t('driver.navigate')}
        </Button>
      </div>

      {/* Trip Details */}
      <div className="p-4 space-y-4">
        {/* Status Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('driver.trip.status')}
              </h2>
              <Badge variant={currentStep === 'in_progress' ? 'default' : 'secondary'}>
                {t(`driver.trip.${currentStep}`)}
              </Badge>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-between">
              {(['arriving', 'arrived', 'picked_up', 'in_progress'] as const).map((step, index, arr) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex flex-col items-center flex-1 ${index < arr.length - 1 ? 'relative' : ''}`}>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        arr.indexOf(currentStep) >= index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {arr.indexOf(currentStep) > index ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <p className="text-xs mt-2 text-center">{t(`driver.trip.${step}`)}</p>

                    {index < arr.length - 1 && (
                      <div
                        className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          arr.indexOf(currentStep) > index
                            ? 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        style={{ transform: 'translateX(50%)' }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-6">
              {currentStep === 'arriving' && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleUpdateStatus('arrived')}
                >
                  {t('driver.trip.mark_arrived')}
                </Button>
              )}
              {currentStep === 'arrived' && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => handleUpdateStatus('picked_up')}
                >
                  {t('driver.trip.mark_picked_up')}
                </Button>
              )}
              {currentStep === 'picked_up' && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  size="lg"
                  onClick={() => handleUpdateStatus('in_progress')}
                >
                  {t('driver.trip.start_trip')}
                </Button>
              )}
              {currentStep === 'in_progress' && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  onClick={() => onNavigate('driver-complete-trip')}
                >
                  {t('driver.trip.complete_trip')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Passenger Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={trip.passenger_avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {trip.passenger_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {trip.passenger_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trip.passenger_phone}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="icon" variant="outline" onClick={handleCallPassenger}>
                  <Phone className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="outline" onClick={handleMessagePassenger}>
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trip Info */}
        <Card>
          <CardContent className="p-4 space-y-3">
            {/* Current Destination */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                currentStep === 'arriving' || currentStep === 'arrived'
                  ? 'bg-green-100 dark:bg-green-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <MapPin className={`h-4 w-4 ${
                  currentStep === 'arriving' || currentStep === 'arrived'
                    ? 'text-green-600'
                    : 'text-red-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {currentStep === 'arriving' || currentStep === 'arrived'
                    ? t('driver.trip.pickup')
                    : t('driver.trip.dropoff')}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {currentStep === 'arriving' || currentStep === 'arrived'
                    ? trip.pickup_location.address
                    : trip.dropoff_location.address}
                </p>
              </div>
            </div>

            {/* ETA & Distance */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('driver.trip.eta')}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {Math.floor(trip.time_remaining / 60)} {t('common.min')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Navigation className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('driver.trip.distance')}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {(trip.distance_remaining / 1000).toFixed(1)} {t('common.km')}
                  </p>
                </div>
              </div>
            </div>

            {/* Fare */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('driver.trip.fare')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600">
                  {trip.fare.toFixed(2)} {t('currency.jod')}
                </span>
                <Badge variant={trip.payment_status === 'paid' ? 'default' : 'secondary'}>
                  {trip.payment_method}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Button */}
        <Button 
          variant="destructive" 
          className="w-full" 
          size="lg"
          onClick={() => onNavigate('driver-emergency')}
        >
          <AlertCircle className="h-5 w-5 mr-2" />
          {t('driver.trip.report_emergency')}
        </Button>
      </div>
    </div>
  );
}