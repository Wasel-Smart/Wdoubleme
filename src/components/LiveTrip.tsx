/**
 * Live Trip Tracking Component
 * 
 * Real-time trip tracking interface with driver location,
 * ETA updates, and emergency features.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Phone, 
  MessageCircle, 
  AlertTriangle, 
  Navigation, 
  Clock, 
  MapPin, 
  Share2, 
  AlertCircle,
  CheckCircle,
  Shield,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { initiateCall, openMessages } from '../services/communication';
import { realTimeTrackingService } from '../services/realtime-tracking';
import type { DriverLocation, TripStatus } from '../services/realtime-tracking';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface LiveTripProps {
  tripId: string;
  driverId: string;
  driverInfo: {
    name: string;
    photo?: string;
    phone?: string; // Added phone field
    rating: number;
    vehicleModel: string;
    vehiclePlate: string;
    vehicleColor: string;
  };
  pickupLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  dropoffLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  onCancel?: () => void;
  onComplete?: () => void;
}

export function LiveTrip({
  tripId,
  driverId,
  driverInfo,
  pickupLocation,
  dropoffLocation,
  onCancel,
  onComplete,
}: LiveTripProps) {
  const navigate = useNavigate();
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus | null>(null);
  const [verificationCode] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  const [showEmergency, setShowEmergency] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to driver location updates
    const unsubscribeLocation = realTimeTrackingService.subscribeToDriverLocation(
      tripId,
      (location) => {
        setDriverLocation(location);
        updateMapMarker(location);
        
        // Calculate ETA
        if (tripStatus?.status === 'arriving' || tripStatus?.status === 'waiting') {
          realTimeTrackingService.calculateETA(
            {
              lat: location.location.coordinates[1],
              lng: location.location.coordinates[0]
            },
            pickupLocation.coordinates
          ).then((eta) => {
            setTripStatus((prev) => prev ? { ...prev, eta: eta.duration, distance: eta.distance } : null);
          }).catch(console.error);
        }
      }
    );

    // Subscribe to trip status updates
    const unsubscribeStatus = realTimeTrackingService.subscribeToTripStatus(
      tripId,
      (status) => {
        setTripStatus(status);
        
        if (status.status === 'completed') {
          toast.success('Trip completed');
          onComplete?.();
        }
      }
    );

    // Monitor pickup zone
    const stopMonitoring = realTimeTrackingService.monitorPickupZone(
      tripId,
      pickupLocation.coordinates,
      100,
      () => {
        toast.info('Driver is nearby');
      }
    );

    return () => {
      unsubscribeLocation();
      unsubscribeStatus();
      stopMonitoring();
    };
  }, [tripId, driverId, pickupLocation, onComplete]);

  const updateMapMarker = (location: DriverLocation) => {
    // In production, this would update Google Maps marker position
  };

  const handleCall = () => {
    // Use the communication service
    initiateCall({
      userId: driverId,
      name: driverInfo.name,
      phone: driverInfo.phone || '+962791234567', // Use driver's phone if available, otherwise default
      role: 'driver',
    });
  };

  const handleMessage = () => {
    // Use the communication service
    openMessages(
      {
        userId: driverId,
        name: driverInfo.name,
        role: 'driver',
      },
      navigate
    );
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/track/${tripId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Track my trip',
        text: `Follow my trip on Wasel. Verification code: ${verificationCode}`,
        url: shareUrl,
      });
    } else {
      copyToClipboard(shareUrl);
      toast.success('Link copied to clipboard');
    }
  };

  const handleEmergencySOS = async () => {
    if (!driverLocation) return;

    const confirmed = window.confirm(
      'Are you sure you want to send an emergency alert? This will notify authorities and your emergency contacts.'
    );

    if (confirmed) {
      const success = await realTimeTrackingService.sendEmergencySOS(
        tripId,
        {
          lat: driverLocation.location.coordinates[1],
          lng: driverLocation.location.coordinates[0]
        },
        'User initiated SOS'
      );

      if (success) {
        toast.error('Emergency alert sent! Help is on the way.');
      } else {
        toast.error('Failed to send emergency alert. Please call emergency services directly.');
      }
    }
  };

  const getStatusText = () => {
    switch (tripStatus?.status) {
      case 'waiting':
        return 'Driver is on the way';
      case 'arriving':
        return 'Driver is arriving';
      case 'in_progress':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      default:
        return 'Connecting...';
    }
  };

  const getStatusColor = () => {
    switch (tripStatus?.status) {
      case 'waiting':
      case 'arriving':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatETA = () => {
    if (!tripStatus?.eta) return 'Calculating...';
    
    const now = new Date();
    const eta = new Date(tripStatus.eta);
    const diffMinutes = Math.round((eta.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Arriving now';
    if (diffMinutes === 1) return '1 min away';
    return `${diffMinutes} mins away`;
  };

  const formatDistance = () => {
    if (!tripStatus?.distance) return '-';
    
    const km = (tripStatus.distance / 1000).toFixed(1);
    return `${km} km`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
              <div>
                <p className="font-semibold">{getStatusText()}</p>
                <p className="text-sm text-muted-foreground">
                  Trip ID: {tripId.slice(0, 8)}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {verificationCode}
            </Badge>
          </div>

          {/* ETA Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatETA()}
              </span>
              <span className="flex items-center gap-1">
                <Navigation className="w-4 h-4" />
                {formatDistance()}
              </span>
            </div>
            <Progress value={tripStatus?.distance ? 100 - (tripStatus.distance / 10000) * 100 : 0} />
          </div>
        </CardContent>
      </Card>

      {/* Map View */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef} 
            className="w-full h-96 bg-gray-200 rounded-lg relative overflow-hidden"
          >
            {/* Placeholder for map - integrate Google Maps here */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-2" />
                <p>Map view</p>
                <p className="text-sm">Integrate Google Maps API</p>
              </div>
            </div>

            {/* Emergency Button Overlay */}
            <Button
              variant="destructive"
              size="lg"
              className="absolute bottom-4 right-4 shadow-lg"
              onClick={handleEmergencySOS}
            >
              <Shield className="w-5 h-5 mr-2" />
              SOS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Driver Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Your Driver</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={driverInfo.photo} />
                <AvatarFallback>{driverInfo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{driverInfo.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>⭐ {driverInfo.rating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{driverInfo.vehicleModel}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {driverInfo.vehicleColor} • {driverInfo.vehiclePlate}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleCall}>
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleMessage}>
                <MessageCircle className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Pickup */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="w-0.5 h-12 bg-gray-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pickup</p>
              <p className="font-medium">{pickupLocation.address}</p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Dropoff</p>
              <p className="font-medium">{dropoffLocation.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share Trip
        </Button>
        
        {tripStatus?.status === 'waiting' && onCancel && (
          <Button variant="destructive" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel Trip
          </Button>
        )}
      </div>

      {/* Safety Info */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Your safety is our priority
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-200">
                <li>• Share your trip with trusted contacts</li>
                <li>• Verify driver details before entering vehicle</li>
                <li>• Use SOS button in case of emergency</li>
                <li>• All trips are tracked and recorded</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
