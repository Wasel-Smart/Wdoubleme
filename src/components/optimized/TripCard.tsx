import { memo, useMemo, useCallback } from 'react';
import { Car, MapPin, Calendar, Clock, Users, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { Trip } from '../../types';
import { UserAvatar } from './UserAvatar';

interface TripCardProps {
  trip: Trip;
  onBook?: (tripId: string) => void;
  onCancel?: (tripId: string) => void;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

export const TripCard = memo<TripCardProps>(({ 
  trip, 
  onBook, 
  onCancel,
  showActions = true,
  variant = 'default'
}) => {
  // Memoize computed values
  const formattedDate = useMemo(() => {
    return new Date(trip.departure_date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }, [trip.departure_date]);

  const formattedTime = useMemo(() => {
    return trip.departure_time.slice(0, 5); // HH:MM format
  }, [trip.departure_time]);

  const priceText = useMemo(() => {
    return `${trip.price_per_seat} ${trip.currency}`;
  }, [trip.price_per_seat, trip.currency]);

  const driverRating = useMemo(() => {
    return trip.driver?.rating?.toFixed(1) || '0.0';
  }, [trip.driver?.rating]);

  const hasSeatsAvailable = useMemo(() => {
    return trip.available_seats > 0;
  }, [trip.available_seats]);

  // Memoize event handlers
  const handleBook = useCallback(() => {
    onBook?.(trip.id);
  }, [onBook, trip.id]);

  const handleCancel = useCallback(() => {
    onCancel?.(trip.id);
  }, [onCancel, trip.id]);

  const amenityIcons = useMemo(() => ({
    wifi: '📶',
    'phone-charger': '🔌',
    snacks: '🍪',
    ac: '❄️'
  }), []);

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-semibold truncate">{trip.from_location}</span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold truncate">{trip.to_location}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{formattedDate}</span>
                <span>{formattedTime}</span>
                <span className="font-semibold text-primary">{priceText}</span>
              </div>
            </div>
            {showActions && hasSeatsAvailable && (
              <Button onClick={handleBook} size="sm">
                Book
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {trip.driver && (
              <UserAvatar 
                profile={{
                  ...trip.driver,
                  id: trip.driver_id,
                  email: '',
                  full_name: trip.driver.name,
                  avatar_url: trip.driver.avatar_url,
                  rating_as_driver: trip.driver.rating,
                  email_verified: false,
                  phone_verified: false,
                  id_verified: false,
                  driver_license_verified: false,
                  total_trips: trip.driver.trips,
                  trips_as_driver: trip.driver.trips,
                  trips_as_passenger: 0,
                  rating_as_passenger: 0,
                  total_ratings_received: 0,
                  smoking_allowed: false,
                  pets_allowed: false,
                  music_allowed: true,
                  max_2_back_seat: false,
                  language: 'en',
                  currency: 'JOD',
                  notification_enabled: true,
                  location_sharing_enabled: true,
                  auto_accept_bookings: false,
                  wallet_balance: 0,
                  total_earned: 0,
                  total_spent: 0,
                  created_at: '',
                  updated_at: '',
                  last_active_at: ''
                }}
                size="md"
                showRating={false}
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{trip.driver?.name || 'Driver'}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{driverRating}</span>
                <span className="text-gray-400">•</span>
                <span>{trip.driver?.trips || 0} trips</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{priceText}</div>
            <div className="text-xs text-gray-500">per seat</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{trip.from_location}</div>
              <div className="text-sm text-gray-500">{trip.to_location}</div>
            </div>
            {trip.distance_km && (
              <Badge variant="secondary" className="flex-shrink-0">
                {trip.distance_km} km
              </Badge>
            )}
          </div>
        </div>

        {/* Schedule */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{trip.available_seats} / {trip.total_seats} seats</span>
          </div>
        </div>

        {/* Preferences */}
        <div className="flex flex-wrap gap-2">
          {!trip.smoking_allowed && (
            <Badge variant="outline" className="text-xs">🚭 No smoking</Badge>
          )}
          {trip.pets_allowed && (
            <Badge variant="outline" className="text-xs">🐕 Pets OK</Badge>
          )}
          {trip.luggage_allowed && (
            <Badge variant="outline" className="text-xs">🧳 Luggage OK</Badge>
          )}
          {trip.amenities?.map((amenity) => (
            <Badge key={amenity} variant="outline" className="text-xs">
              {amenityIcons[amenity as keyof typeof amenityIcons] || '✓'} {amenity}
            </Badge>
          ))}
        </div>

        {/* Notes */}
        {trip.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">{trip.notes}</p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            {trip.status === 'published' && hasSeatsAvailable && (
              <Button onClick={handleBook} className="flex-1">
                Book Now
              </Button>
            )}
            {trip.status === 'published' && !hasSeatsAvailable && (
              <Button disabled className="flex-1">
                Fully Booked
              </Button>
            )}
            {trip.status === 'in-progress' && (
              <Button variant="outline" className="flex-1">
                View Details
              </Button>
            )}
            {(trip.status === 'published' || trip.status === 'in-progress') && onCancel && (
              <Button variant="destructive" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return (
    prevProps.trip.id === nextProps.trip.id &&
    prevProps.trip.available_seats === nextProps.trip.available_seats &&
    prevProps.trip.status === nextProps.trip.status &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.variant === nextProps.variant
  );
});

TripCard.displayName = 'TripCard';