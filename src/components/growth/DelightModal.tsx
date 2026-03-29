import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Star, PartyPopper, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { OrganicGrowth } from '../../utils/growth/organicGrowth';

interface DelightModalProps {
  userId: string;
  onClose: () => void;
  forceTrigger?: boolean; // For demo purposes
}

export function DelightModal({ userId, onClose, forceTrigger = false }: DelightModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [delightType, setDelightType] = useState<'free_ride' | 'upgrade' | 'gift' | null>(null);

  useEffect(() => {
    // Check if we should delight the user
    const check = OrganicGrowth.checkForDelightMoment(userId);
    
    if (check.triggered || forceTrigger) {
      setDelightType(check.type || 'free_ride');
      
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [userId, forceTrigger]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative w-full max-w-md"
          >
            <Card className="border-none shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <CardContent className="flex flex-col items-center text-center p-8 pt-12 space-y-6">
                <motion.div
                  initial={{ rotate: -10, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-2"
                >
                  {delightType === 'free_ride' && <PartyPopper className="w-12 h-12 text-yellow-300" />}
                  {delightType === 'upgrade' && <Star className="w-12 h-12 text-yellow-300" />}
                  {delightType === 'gift' && <Gift className="w-12 h-12 text-yellow-300" />}
                </motion.div>

                <div className="space-y-2">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold tracking-tight"
                  >
                    Surprise!
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-medium text-white/90"
                  >
                    Because you're awesome.
                  </motion.p>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white/10 rounded-xl p-4 w-full border border-white/20 backdrop-blur-sm"
                >
                  <p className="text-xl font-bold text-white">
                    {delightType === 'free_ride' && "This ride is on us! 🚕💨"}
                    {delightType === 'upgrade' && "Free Upgrade to Premium! 🌟"}
                    {delightType === 'gift' && "You've got a surprise gift! 🎁"}
                  </p>
                  <p className="text-sm text-white/70 mt-2">
                    No catch. Just saying thanks for riding with Wasel.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="w-full"
                >
                  <Button 
                    onClick={onClose}
                    className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg h-12 rounded-full shadow-lg"
                  >
                    Accept & Enjoy
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
