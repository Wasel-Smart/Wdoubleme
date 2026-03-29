/**
 * Driver Navigation Component
 * In-app turn-by-turn navigation with voice guidance
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Navigation, 
  Volume2, 
  VolumeX,
  ZoomIn,
  ZoomOut,
  Compass,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { WaselMap } from '../WaselMap';
import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';

interface NavigationStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: string;
  road_name: string;
}

interface NavigationProps {
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  onArrived?: () => void;
  onCancel?: () => void;
}

export function DriverNavigation({ origin, destination, onArrived, onCancel }: NavigationProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [currentLocation, setCurrentLocation] = useState(origin);
  const [steps, setSteps] = useState<NavigationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [mapZoom, setMapZoom] = useState(16);
  const [trafficLevel, setTrafficLevel] = useState<'low' | 'moderate' | 'heavy'>('low');
  const watchIdRef = useRef<number | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize navigation
  useEffect(() => {
    fetchRoute();
    startLocationTracking();

    return () => {
      stopLocationTracking();
      stopSpeech();
    };
  }, []);

  // Fetch route from Google Directions API
  const fetchRoute = async () => {
    try {
      // TODO: Replace with actual Google Directions API call
      const mockSteps: NavigationStep[] = [
        {
          instruction: 'Head north on King Abdullah II Street',
          distance: 500,
          duration: 60,
          maneuver: 'straight',
          road_name: 'King Abdullah II Street',
        },
        {
          instruction: 'Turn right onto Zahran Street',
          distance: 1200,
          duration: 180,
          maneuver: 'turn-right',
          road_name: 'Zahran Street',
        },
        {
          instruction: 'Continue onto Rainbow Street',
          distance: 800,
          duration: 120,
          maneuver: 'straight',
          road_name: 'Rainbow Street',
        },
        {
          instruction: 'Arrive at destination on the right',
          distance: 50,
          duration: 10,
          maneuver: 'arrive',
          road_name: '',
        },
      ];

      setSteps(mockSteps);
      
      const totalDistance = mockSteps.reduce((sum, step) => sum + step.distance, 0);
      const totalTime = mockSteps.reduce((sum, step) => sum + step.duration, 0);
      
      setRemainingDistance(totalDistance);
      setRemainingTime(totalTime);

      // Speak first instruction
      if (isVoiceEnabled && mockSteps.length > 0) {
        speakInstruction(mockSteps[0].instruction);
      }
    } catch (error) {
      console.error('[Navigation] Failed to fetch route:', error);
    }
  };

  // Start tracking user location
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error('[Navigation] Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation({ ...newLocation, address: origin.address });

        // Check if we've completed current step
        checkStepCompletion(newLocation);

        // Update remaining distance and time
        updateProgress(newLocation);
      },
      (error) => {
        console.error('[Navigation] Location error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // Check if current step is completed
  const checkStepCompletion = (location: { lat: number; lng: number }) => {
    if (currentStepIndex >= steps.length - 1) {
      // Check if arrived at destination
      const distanceToDestination = calculateDistance(location, destination);
      if (distanceToDestination < 50) { // Within 50 meters
        handleArrival();
      }
      return;
    }

    // Simple step completion logic (in production, use Google Directions API)
    const currentStep = steps[currentStepIndex];
    if (remainingDistance < currentStep.distance * 0.9) {
      moveToNextStep();
    }
  };

  // Move to next navigation step
  const moveToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Speak next instruction
      if (isVoiceEnabled) {
        speakInstruction(steps[nextIndex].instruction);
      }
    }
  };

  // Update remaining distance and time
  const updateProgress = (location: { lat: number; lng: number }) => {
    const distanceToDestination = calculateDistance(location, destination);
    setRemainingDistance(distanceToDestination * 1000); // Convert to meters

    // Estimate time (assuming 30 km/h average speed)
    const estimatedTime = (distanceToDestination / 30) * 60 * 60; // seconds
    setRemainingTime(Math.round(estimatedTime));
  };

  // Handle arrival
  const handleArrival = () => {
    stopSpeech();
    speakInstruction(t('navigation.arrived'));
    onArrived?.();
  };

  // Speak instruction using Web Speech API
  const speakInstruction = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    // Stop any ongoing speech
    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language; // Use user's language
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle voice guidance
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isVoiceEnabled) {
      stopSpeech();
    }
  };

  // Calculate distance (Haversine)
  const calculateDistance = (
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = toRadians(loc2.lat - loc1.lat);
    const dLng = toRadians(loc2.lng - loc1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(loc1.lat)) *
        Math.cos(toRadians(loc2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const getManeuverIcon = (maneuver: string) => {
    switch (maneuver) {
      case 'turn-right':
        return '→';
      case 'turn-left':
        return '←';
      case 'straight':
        return '↑';
      case 'arrive':
        return '🏁';
      default:
        return '↑';
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="relative h-screen bg-gray-900">
      {/* Map */}
      <WaselMap
        center={currentLocation}
        zoom={mapZoom}
        route={[
          { lat: currentLocation.lat, lng: currentLocation.lng, label: t('navigation.you') },
          { lat: destination.lat,     lng: destination.lng,     label: t('navigation.destination') },
        ]}
        showTraffic
        showMosques
        showRadars
        className="absolute inset-0 w-full h-full"
      />

      {/* Top Stats Bar */}
      <div className="absolute top-4 left-0 right-0 px-4 z-10">
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t('navigation.eta')}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatTime(remainingTime)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Navigation className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t('navigation.distance')}
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatDistance(remainingDistance)}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {t('navigation.traffic')}
                  </span>
                </div>
                <Badge
                  variant={
                    trafficLevel === 'low'
                      ? 'default'
                      : trafficLevel === 'moderate'
                      ? 'secondary'
                      : 'destructive'
                  }
                >
                  {t(`navigation.traffic_${trafficLevel}`)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Instruction */}
      {currentStep && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-32 left-0 right-0 px-4 z-10"
        >
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getManeuverIcon(currentStep.maneuver)}</div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentStep.instruction}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{formatDistance(currentStep.distance)}</span>
                    {currentStep.road_name && <span>• {currentStep.road_name}</span>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div className="absolute bottom-8 right-4 flex flex-col gap-2 z-10">
        <Button
          size="icon"
          variant="secondary"
          onClick={toggleVoice}
          className="shadow-lg"
        >
          {isVoiceEnabled ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => setMapZoom(Math.min(20, mapZoom + 1))}
          className="shadow-lg"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => setMapZoom(Math.max(10, mapZoom - 1))}
          className="shadow-lg"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          variant="secondary"
          onClick={() => setCurrentLocation({ ...currentLocation })}
          className="shadow-lg"
        >
          <Compass className="h-5 w-5" />
        </Button>
      </div>

      {/* Cancel Button */}
      <div className="absolute bottom-8 left-4 z-10">
        <Button
          variant="destructive"
          size="lg"
          onClick={onCancel}
          className="shadow-lg"
        >
          {t('navigation.cancel')}
        </Button>
      </div>

      {/* Upcoming Steps */}
      <div className="absolute bottom-24 left-0 right-0 px-4 z-10">
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm max-h-32 overflow-y-auto">
          <CardContent className="p-3 space-y-2">
            {steps.slice(currentStepIndex + 1, currentStepIndex + 4).map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-lg">{getManeuverIcon(step.maneuver)}</span>
                <span className="flex-1 truncate">{step.instruction}</span>
                <span className="text-xs text-gray-500">
                  {formatDistance(step.distance)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}