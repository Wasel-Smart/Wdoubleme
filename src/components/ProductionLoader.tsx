/**
 * Production Loader - Wasel | واصل
 * Beautiful loading states with brand identity
 * 
 * Variants:
 * - full: Full-screen loader (app initialization)
 * - inline: Inline loader (page transitions)
 * - button: Button loader (form submissions)
 * - minimal: Minimal spinner (small components)
 */

import { motion } from 'motion/react';
import logoImage from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

interface ProductionLoaderProps {
  variant?: 'full' | 'inline' | 'button' | 'minimal';
  message?: string;
  messageAr?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProductionLoader({
  variant = 'full',
  message = 'Loading...',
  messageAr = 'جاري التحميل...',
  size = 'md',
}: ProductionLoaderProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  const logoSize = sizeClasses[size];

  // Minimal spinner for buttons
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center">
        <motion.div
          className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  // Button loader
  if (variant === 'button') {
    return (
      <div className="flex items-center justify-center gap-2">
        <motion.div
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  // Inline loader for page content
  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {/* Rotating glow ring */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{ background: 'conic-gradient(from 0deg, #00C8E8, #00C875, #00C8E8)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Logo */}
          <motion.img
            src={logoImage}
            alt="Loading"
            className={`${logoSize} object-contain relative z-10`}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 0 12px rgba(0,200,232,0.6))' }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm"
          style={{ color: 'rgba(148,163,184,0.7)' }}
        >
          {message}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-1 text-xs"
          dir="rtl"
          style={{ color: 'rgba(100,116,139,0.6)' }}
        >
          {messageAr}
        </motion.p>
      </div>
    );
  }

  // Full-screen loader (default)
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: '#040C18' }}>
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top:  `${((i * 1.618) % 1) * 100}%`,
              left: `${((i * 2.414) % 1) * 100}%`,
              width: i % 7 === 0 ? 2 : 1,
              height: i % 7 === 0 ? 2 : 1,
              opacity: 0.15 + (i % 5) * 0.06,
            }}
            animate={{ opacity: [0.15 + (i % 5) * 0.06, 0.5, 0.15 + (i % 5) * 0.06], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.5 + (i % 4) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: (i % 8) * 0.3 }}
          />
        ))}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,232,0.06) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,117,0.04) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      {/* Main loader */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        {/* Rotating gradient ring */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl opacity-60"
          style={{
            background: 'conic-gradient(from 0deg, #00C8E8, #00C875, #F0A830, #00C8E8)',
            width: '140%',
            height: '140%',
            left: '-20%',
            top: '-20%',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            width: '120%',
            height: '120%',
            left: '-10%',
            top: '-10%',
            border: '2px solid rgba(0,200,232,0.3)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo with floating animation */}
        <motion.img
          src={logoImage}
          alt="Wasel"
          className={`${logoSize} object-contain relative z-10`}
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'drop-shadow(0 0 24px rgba(0,200,232,0.8))' }}
        />
      </motion.div>

      {/* Loading text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 text-center"
      >
        <motion.h2
          className="text-2xl font-bold"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #00C8E8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.h2>
        <motion.p
          className="mt-2 text-sm"
          dir="rtl"
          style={{ color: 'rgba(148,163,184,0.7)' }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          {messageAr}
        </motion.p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: '#00C8E8' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Suspense fallback wrapper
export function SuspenseFallback({ message, messageAr }: { message?: string; messageAr?: string }) {
  return <ProductionLoader variant="full" message={message} messageAr={messageAr} />;
}