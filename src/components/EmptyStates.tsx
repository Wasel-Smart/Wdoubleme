import { motion } from 'motion/react';
import { Button } from './ui/button';
import {
  Car,
  Package,
  MessageCircle,
  Calendar,
  MapPin,
  Heart,
  Bell,
  Search,
  FileText,
  Users,
  CreditCard,
  Settings,
  AlertCircle,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

function EmptyStateBase({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          {/* Background circle with pulse */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 -m-8 rounded-full bg-primary/20"
          />

          {/* Icon container */}
          <div className="relative w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <div className="text-muted-foreground w-12 h-12">{icon}</div>
          </div>
        </div>
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="text-muted-foreground text-base">{description}</p>
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          {action && (
            <Button onClick={action.onClick} size="lg" className="min-w-[150px]">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              size="lg"
              className="min-w-[150px]"
            >
              {secondaryAction.label}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Specific Empty States

export function NoTripsEmpty({ onFindRide }: { onFindRide: () => void }) {
  return (
    <EmptyStateBase
      icon={<Car className="w-full h-full" />}
      title="No trips yet"
      description="Start your journey by finding a ride or offering one to fellow travelers."
      action={{
        label: 'Find a Ride',
        onClick: onFindRide,
      }}
      secondaryAction={{
        label: 'Offer a Ride',
        onClick: () => { try { history.replaceState(null, '', '/offer-ride'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* silently ignore */ } },
      }}
    />
  );
}

export function NoMessagesEmpty() {
  return (
    <EmptyStateBase
      icon={<MessageCircle className="w-full h-full" />}
      title="No messages yet"
      description="Once you book a ride, you'll be able to chat with your driver or passengers here."
    />
  );
}

export function NoFavoritesEmpty({ onBrowseServices }: { onBrowseServices: () => void }) {
  return (
    <EmptyStateBase
      icon={<Heart className="w-full h-full" />}
      title="No favorites yet"
      description="Save your favorite routes and services for quick access later."
      action={{
        label: 'Browse Services',
        onClick: onBrowseServices,
      }}
    />
  );
}

export function NoNotificationsEmpty() {
  return (
    <EmptyStateBase
      icon={<Bell className="w-full h-full" />}
      title="You're all caught up!"
      description="No new notifications at the moment. We'll notify you about important updates."
    />
  );
}

export function NoSearchResultsEmpty({ query, onClearSearch }: { query: string; onClearSearch: () => void }) {
  return (
    <EmptyStateBase
      icon={<Search className="w-full h-full" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
      action={{
        label: 'Clear Search',
        onClick: onClearSearch,
      }}
    />
  );
}

export function NoPaymentMethodsEmpty({ onAddPayment }: { onAddPayment: () => void }) {
  return (
    <EmptyStateBase
      icon={<CreditCard className="w-full h-full" />}
      title="No payment methods"
      description="Add a payment method to complete bookings faster and easier."
      action={{
        label: 'Add Payment Method',
        onClick: onAddPayment,
      }}
    />
  );
}

export function NoScheduledTripsEmpty({ onScheduleTrip }: { onScheduleTrip: () => void }) {
  return (
    <EmptyStateBase
      icon={<Calendar className="w-full h-full" />}
      title="No scheduled trips"
      description="Plan ahead by scheduling your trips for upcoming dates."
      action={{
        label: 'Schedule a Trip',
        onClick: onScheduleTrip,
      }}
    />
  );
}

export function NoSavedLocationsEmpty({ onAddLocation }: { onAddLocation: () => void }) {
  return (
    <EmptyStateBase
      icon={<MapPin className="w-full h-full" />}
      title="No saved locations"
      description="Save your frequent locations like home and work for faster bookings."
      action={{
        label: 'Add Location',
        onClick: onAddLocation,
      }}
    />
  );
}

export function NoDeliveriesEmpty({ onNewDelivery }: { onNewDelivery: () => void }) {
  return (
    <EmptyStateBase
      icon={<Package className="w-full h-full" />}
      title="No deliveries"
      description="Send packages, gifts, or documents with our fast delivery service."
      action={{
        label: 'New Delivery',
        onClick: onNewDelivery,
      }}
    />
  );
}

export function NoDocumentsEmpty({ onUploadDocument }: { onUploadDocument: () => void }) {
  return (
    <EmptyStateBase
      icon={<FileText className="w-full h-full" />}
      title="No documents uploaded"
      description="Upload your driver's license and vehicle registration to get verified."
      action={{
        label: 'Upload Documents',
        onClick: onUploadDocument,
      }}
    />
  );
}

export function NoRideRequestsEmpty() {
  return (
    <EmptyStateBase
      icon={<Users className="w-full h-full" />}
      title="No ride requests"
      description="When riders request to join your trips, they'll appear here."
    />
  );
}

export function ErrorStateEmpty({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyStateBase
      icon={<AlertCircle className="w-full h-full" />}
      title="Something went wrong"
      description={message || 'We encountered an error loading this content. Please try again.'}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
      secondaryAction={{
        label: 'Contact Support',
        onClick: () => { try { history.replaceState(null, '', '/help'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* silently ignore */ } },
      }}
    />
  );
}

export function MaintenanceModeEmpty() {
  return (
    <EmptyStateBase
      icon={<Settings className="w-full h-full" />}
      title="Under Maintenance"
      description="We're making some improvements. We'll be back shortly. Thank you for your patience!"
    />
  );
}

// Animated illustration empty state
export function IllustratedEmptyState({ type }: { type: 'trips' | 'messages' | 'favorites' }) {
  const illustrations = {
    trips: (
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        <motion.circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="502.4"
          initial={{ strokeDashoffset: 502.4 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          className="text-primary/20"
        />
        <motion.path
          d="M 60 100 L 100 60 L 140 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="150"
          initial={{ strokeDashoffset: 150 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-primary"
        />
      </svg>
    ),
    messages: (
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        <motion.rect
          x="40"
          y="60"
          width="120"
          height="80"
          rx="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
          className="text-primary"
        />
        <motion.line
          x1="60"
          y1="85"
          x2="140"
          y2="85"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-primary/60"
        />
        <motion.line
          x1="60"
          y1="105"
          x2="120"
          y2="105"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="text-primary/60"
        />
      </svg>
    ),
    favorites: (
      <svg viewBox="0 0 200 200" className="w-48 h-48">
        <motion.path
          d="M 100 40 L 120 80 L 160 80 L 130 105 L 145 145 L 100 120 L 55 145 L 70 105 L 40 80 L 80 80 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
          className="text-primary"
        />
      </svg>
    ),
  };

  return (
    <div className="flex items-center justify-center p-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {illustrations[type]}
      </motion.div>
    </div>
  );
}