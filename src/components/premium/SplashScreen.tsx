/**
 * Premium Splash Screen
 * 
 * Beautiful animated splash screen with the Wasel logo
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from 'figma:asset/a27f60f5bb3f7a6f1c6cbf6b21c04044dc1e53e1.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1120 0%, #0F1E35 50%, #0B1120 100%)' }}
      >
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.4, 1], x: [0, 80, 0], y: [0, -60, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(4,173,191,0.12) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.4], x: [0, -80, 0], y: [0, 80, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(9,115,46,0.10) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ scale: [1, 1.25, 1], rotate: [0, 180, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(171,217,7,0.04) 0%, transparent 70%)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center w-full max-w-sm mx-auto">
          {/* Logo with animated ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
            className="relative"
          >
            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-4 rounded-full"
              style={{ border: '2px dashed rgba(4,173,191,0.25)' }}
            />
            {/* Pulse ring */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-2 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(4,173,191,0.15) 0%, transparent 70%)' }}
            />
            {/* Logo badge */}
            <motion.div
              animate={{ boxShadow: ['0 0 24px rgba(4,173,191,0.3)', '0 0 48px rgba(4,173,191,0.5)', '0 0 24px rgba(4,173,191,0.3)'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-28 h-28 rounded-3xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(4,173,191,0.2)' }}
            >
              <img
                src={logoImage}
                alt="Wasel واصل"
                className="w-full h-full object-contain p-1"
                loading="eager"
              />
            </motion.div>
          </motion.div>

          {/* Brand Name */}
          <div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-black tracking-tight"
              style={{
                fontSize: 'clamp(2rem, 8vw, 3rem)',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #09732E 0%, #04ADBF 55%, #ABD907 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              واصل | Wasel
            </motion.h1>
            <motion.p
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.9rem', marginTop: '6px' }}
            >
              شارك الرحلة، وفّر المصاري
            </motion.p>
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'rgba(100,116,139,0.8)', fontSize: '0.75rem', marginTop: '2px', letterSpacing: '0.06em' }}
            >
              Share the Journey, Share the Cost
            </motion.p>
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5 }}
            className="w-full max-w-[200px]"
          >
            <div className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <motion.div
                style={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #09732E, #04ADBF, #ABD907)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
            <p style={{ color: 'rgba(100,116,139,0.7)', fontSize: '0.7rem', marginTop: '8px' }}>
              Loading your experience...
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}