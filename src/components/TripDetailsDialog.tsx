import { useState } from 'react';
import { CircleX, Locate, CalendarClock, Timer, UsersRound, CircleDollarSign, Sparkles, Smartphone, MessagesSquare, Navigation, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { MapComponent } from './MapComponent';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

interface TripStop {
  label: string;
  lat: number;
  lng: number;
}

interface TripDetails {
  id: number;
  driver: {
    name: string;
    initials: string;
    rating: number;
    trips: number;
    phone?: string;
  };
  from: string;
  to: string;
  stops?: TripStop[];
  date: string;
  time: string;
  seats: number;
  price: number;
  tripType: 'wasel' | 'awasel'; // Removed 'raje3' - now using 'awasel' consistently
  vehicleModel?: string;
  notes?: string;
}

interface TripDetailsDialogProps {
  trip: TripDetails | null;
  open: boolean;
  onClose: () => void;
  onBook?: (tripId: number) => void;
}

export function TripDetailsDialog({ trip, open, onClose, onBook }: TripDetailsDialogProps) {
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const { t } = useLanguage();

  if (!trip) return null;

  // Handle call driver
  const handleCall = async () => {
    setIsCalling(true);
    try {
      // Simulate Twilio integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (trip.driver.phone) {
        // In production, this would use Twilio API
        toast.success('Calling driver...', {
          description: `Connecting to ${trip.driver.name}`,
          duration: 3000,
        });
        
        // Open phone dialer (works on mobile)
        window.open(`tel:${trip.driver.phone}`);
      } else {
        toast.error('Phone number not available', {
          description: 'Please try messaging the driver instead.',
        });
      }
    } catch (error) {
      toast.error('Failed to initiate call', {
        description: 'Please try again later.',
      });
    } finally {
      setIsCalling(false);
    }
  };

  // Handle message driver
  const handleMessage = async () => {
    setIsMessaging(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Opening chat...', {
        description: `Starting conversation with ${trip.driver.name}`,
        duration: 2000,
      });
      
      // In production, this would navigate to Messages page
      // For now, show success feedback
      setTimeout(() => {
        setIsMessaging(false);
      }, 1000);
    } catch (error) {
      toast.error('Failed to open chat');
      setIsMessaging(false);
    }
  };

  // Handle get directions
  const handleGetDirections = () => {
    const origin = encodeURIComponent(trip.from);
    const destination = encodeURIComponent(trip.to);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    
    window.open(googleMapsUrl, '_blank');
    
    toast.success('Opening directions', {
      description: 'Opening Google Maps in new tab',
      duration: 2000,
    });
  };

  // Handle booking
  const handleBooking = async () => {
    setIsBooking(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Booking confirmed!', {
        description: `${selectedSeats} seat${selectedSeats > 1 ? 's' : ''} booked successfully. Total: $${trip.price * selectedSeats}`,
        duration: 4000,
        icon: <Check className="w-4 h-4" />,
      });
      
      if (onBook) onBook(trip.id);
      
      // Close dialog after short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      toast.error('Booking failed', {
        description: 'Please try again or contact support.',
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Prepare map locations
  const mapLocations = [
    {
      lat: trip.stops?.[0]?.lat || 31.9539, // Amman default
      lng: trip.stops?.[0]?.lng || 35.9106,
      label: trip.from,
      type: 'start' as const
    },
    ...(trip.stops?.slice(1, -1).map((stop, index) => ({
      lat: stop.lat,
      lng: stop.lng,
      label: stop.label,
      type: 'stop' as const
    })) || []),
    {
      lat: trip.stops?.[trip.stops.length - 1]?.lat || 31.9539, // Amman default
      lng: trip.stops?.[trip.stops.length - 1]?.lng || 35.9106,
      label: trip.to,
      type: 'destination' as const
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Trip Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Info */}
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {trip.driver.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{trip.driver.name}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{trip.driver.rating}</span>
                </div>
                <span>•</span>
                <span>{trip.driver.trips} trips completed</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={handleCall}
                  disabled={isCalling}
                >
                  {isCalling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  {isCalling ? 'Calling...' : 'Call'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={handleMessage}
                  disabled={isMessaging}
                >
                  {isMessaging ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessagesSquare className="w-4 h-4" />
                  )}
                  {isMessaging ? 'Opening...' : 'Message'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={handleGetDirections}
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </Button>
              </div>
            </div>
            <Badge 
              variant={trip.tripType === 'wasel' ? 'default' : 'secondary'}
              className="text-sm px-3 py-1"
            >
              {trip.tripType === 'wasel' ? 'Wasel (واصل)' : 'Awasel (أوصل)'}
            </Badge>
          </div>

          <Separator />

          {/* Route Map */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Route & Stops</h3>
            <div className="rounded-lg overflow-hidden border border-border shadow-sm">
              <MapComponent 
                locations={mapLocations}
                showRoute={true}
                height="350px"
              />
            </div>
          </div>

          {/* Trip Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3>Trip Information</h3>
              
              <div className="flex items-start gap-3">
                <Locate className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p>{trip.from} → {trip.to}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarClock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{trip.date}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Timer className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Departure Time</p>
                  <p>{trip.time}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3>Booking Details</h3>
              
              <div className="flex items-start gap-3">
                <UsersRound className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Seats</p>
                  <p>{trip.seats} seats left</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CircleDollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Price per Seat</p>
                  <p className="text-2xl text-primary">${trip.price}</p>
                </div>
              </div>

              {trip.vehicleModel && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                    🚗
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vehicle</p>
                    <p>{trip.vehicleModel}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stops List */}
          {trip.stops && trip.stops.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3>Stops Along the Way</h3>
                <div className="space-y-2">
                  {trip.stops.map((stop, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs
                        ${index === 0 ? 'bg-primary text-primary-foreground' : 
                          index === trip.stops!.length - 1 ? 'bg-accent text-accent-foreground' : 
                          'bg-secondary text-secondary-foreground'}
                      `}>
                        {index === 0 ? 'A' : index === trip.stops!.length - 1 ? 'B' : index}
                      </div>
                      <p>{stop.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional Notes */}
          {trip.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3>Additional Notes</h3>
                <p className="text-sm text-muted-foreground">{trip.notes}</p>
              </div>
            </>
          )}

          {/* Booking Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Number of Seats</p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                    disabled={selectedSeats <= 1 || isBooking}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-semibold">{selectedSeats}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedSeats(Math.min(trip.seats, selectedSeats + 1))}
                    disabled={selectedSeats >= trip.seats || isBooking}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                <p className="text-2xl font-bold text-primary">${trip.price * selectedSeats}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 min-w-[160px]"
              onClick={handleBooking}
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Book {selectedSeats} Seat{selectedSeats > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}