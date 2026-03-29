/**
 * Premium Floating Action Button (FAB)
 * 
 * Glassmorphic FAB with expandable menu
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Car, Package, Calendar, Users, X } from 'lucide-react';

interface FABAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}

interface FloatingActionButtonProps {
  onBookRide: () => void;
  onBookDelivery: () => void;
  onScheduleTrip: () => void;
  onCorporateBooking: () => void;
}

export function FloatingActionButton({
  onBookRide,
  onBookDelivery,
  onScheduleTrip,
  onCorporateBooking,
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions: FABAction[] = [
    {
      icon: <Car className="w-5 h-5" />,
      label: 'Book Ride',
      onClick: () => {
        onBookRide();
        setIsOpen(false);
      },
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Package className="w-5 h-5" />,
      label: 'Send Package',
      onClick: () => {
        onBookDelivery();
        setIsOpen(false);
      },
      color: 'from-green-500 to-green-600',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Schedule Trip',
      onClick: () => {
        onScheduleTrip();
        setIsOpen(false);
      },
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Corporate Booking',
      onClick: () => {
        onCorporateBooking();
        setIsOpen(false);
      },
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            />

            {/* Action Menu */}
            <div className="absolute bottom-20 right-0 space-y-3">
              {actions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 20 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: index * 0.05,
                  }}
                  onClick={action.onClick}
                  className="flex items-center gap-3 group"
                >
                  {/* Label */}
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                    className="px-4 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-full shadow-lg text-sm font-medium whitespace-nowrap border border-gray-200/50 dark:border-gray-700/50"
                  >
                    {action.label}
                  </motion.span>

                  {/* Icon Button */}
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${action.color} rounded-full flex items-center justify-center text-white shadow-xl group-hover:shadow-2xl transition-shadow`}
                  >
                    {action.icon}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-2xl hover:shadow-indigo-500/50 transition-shadow relative overflow-hidden"
      >
        {/* Animated background */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
        />

        {/* Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          {isOpen ? <X className="w-7 h-7" /> : <Plus className="w-7 h-7" />}
        </motion.div>
      </motion.button>

      {/* Pulse effect when closed */}
      {!isOpen && (
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full -z-10"
        />
      )}
    </div>
  );
}
