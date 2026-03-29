/**
 * WaselBrandAssets — Production-grade logo, sound design, and brand utilities
 */

import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import waselLogoImg from 'figma:asset/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

// ─── SVG Logo Mark ──────────────────────────────────────────────────────────────
export function WaselLogoMark({ size = 40, glow = true, className = '' }: { size?: number; glow?: boolean; className?: string }) {
  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.2,
        overflow: 'hidden',
        background: '#000',
        boxShadow: glow
          ? `0 0 ${size * 0.5}px rgba(0,200,232,0.45), 0 0 ${size * 0.2}px rgba(0,200,232,0.2)`
          : 'none',
      }}
    >
      <img
        src={waselLogoImg}
        alt="Wasel واصل"
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  );
}

// ─── Wasel Wordmark ────────────────────────────────────────────────────────────
export function WaselWordmark({ ar, className = '' }: { ar: boolean; className?: string }) {
  return (
    <div className={`flex flex-col ${className}`} dir={ar ? 'rtl' : 'ltr'}>
      <span className="text-white leading-none" style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '-0.01em' }}>
        {ar ? 'واصل' : 'Wasel'}
        <span className="mx-1 text-slate-600">|</span>
        <span className="text-slate-400" style={{ fontWeight: 600 }}>
          {ar ? 'Wasel' : 'واصل'}
        </span>
      </span>
      <span className="leading-none mt-0.5" style={{ color: '#00C8E8', fontWeight: 600, fontSize: '10px', letterSpacing: '0.02em' }}>
        {ar ? 'مشاركة الرحلات بين المدن' : 'Intercity Carpooling Jordan'}
      </span>
    </div>
  );
}

// ─── Cinematic Ken Burns Hero Background ────────────────────────────────────────
const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1633583928919-d499f50f8d55?w=1920&h=1080&fit=crop&q=80',
    alt: 'Amman cityscape at dusk',
    origin: 'center center',
  },
  {
    src: 'https://images.unsplash.com/photo-1596399000861-08a2dcd9e31a?w=1920&h=1080&fit=crop&q=80',
    alt: 'Jordan desert highway',
    origin: 'center bottom',
  },
  {
    src: 'https://images.unsplash.com/photo-1669022474986-f60302bd9529?w=1920&h=1080&fit=crop&q=80',
    alt: 'Car driving through desert at sunset',
    origin: 'center center',
  },
  {
    src: 'https://images.unsplash.com/photo-1693008288639-92c6369d964e?w=1920&h=1080&fit=crop&q=80',
    alt: 'Friends on a road trip',
    origin: 'center top',
  },
];

export function CinematicHeroBackground() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(new Set());

  // Preload all images
  useEffect(() => {
    HERO_SLIDES.forEach((slide, i) => {
      const img = new Image();
      img.onload = () => setLoaded(prev => new Set(prev).add(i));
      img.src = slide.src;
    });
  }, []);

  // Cycle slides every 8s
  useEffect(() => {
    const t = setInterval(() => setCurrent(p => (p + 1) % HERO_SLIDES.length), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {HERO_SLIDES.map((slide, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: current === i ? 1 : 0,
            scale: current === i ? [1, 1.08] : 1,
          }}
          transition={{
            opacity: { duration: 1.5, ease: 'easeInOut' },
            scale: { duration: 8, ease: 'linear' },
          }}
          style={{ transformOrigin: slide.origin }}
        >
          {loaded.has(i) ? (
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full" style={{ background: '#0B1120' }} />
          )}
        </motion.div>
      ))}

      {/* Cinematic overlays */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(11,17,32,0.95) 0%, rgba(11,17,32,0.82) 40%, rgba(11,17,32,0.72) 100%)',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 20% 50%, rgba(4,173,191,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(9,115,46,0.06) 0%, transparent 50%)',
      }} />
      {/* Film grain effect */}
      <div className="absolute inset-0 opacity-[0.018] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(11,17,32,0.4) 100%)',
        }} />

      {/* Slide indicator dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300"
            style={{
              width: current === i ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: current === i ? '#04ADBF' : 'rgba(255,255,255,0.2)',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Subtle Sound Design ────────────────────────────────────────────────────────
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(frequency: number, duration: number, volume: number = 0.03, type: OscillatorType = 'sine') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silent fail
  }
}

/** Hook for subtle interaction sounds */
export function useInteractionSounds() {
  const enabled = useRef(false);

  // Only enable after first user gesture (browser autoplay policy)
  const enable = useCallback(() => {
    if (!enabled.current) {
      enabled.current = true;
      // Resume audio context on first interaction
      const ctx = getAudioContext();
      if (ctx?.state === 'suspended') ctx.resume();
    }
  }, []);

  useEffect(() => {
    const handler = () => enable();
    window.addEventListener('click', handler, { once: true });
    window.addEventListener('touchstart', handler, { once: true });
    return () => {
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [enable]);

  const click = useCallback(() => {
    if (!enabled.current) return;
    playTone(800, 0.06, 0.025, 'sine');
  }, []);

  const hover = useCallback(() => {
    if (!enabled.current) return;
    playTone(600, 0.04, 0.012, 'sine');
  }, []);

  const success = useCallback(() => {
    if (!enabled.current) return;
    playTone(523, 0.1, 0.03, 'sine'); // C5
    setTimeout(() => playTone(659, 0.1, 0.03, 'sine'), 80); // E5
    setTimeout(() => playTone(784, 0.15, 0.025, 'sine'), 160); // G5
  }, []);

  const toggle = useCallback(() => {
    if (!enabled.current) return;
    playTone(700, 0.05, 0.02, 'triangle');
  }, []);

  return { click, hover, success, toggle };
}

// ─── Video Testimonial Card ─────────────────────────────────────────────────────
export function VideoTestimonialBadge({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full z-10 ${className}`}
      style={{ background: 'rgba(11,17,32,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[10px] font-bold text-white/80">VIDEO</span>
    </div>
  );
}

// ─── App Store Rating Badge ─────────────────────────────────────────────────────
export function AppStoreBadge({ ar }: { ar: boolean }) {
  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl"
      style={{ background: 'var(--wasel-glass-brand)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= 4 ? '#F59E0B' : 'none'} stroke="#F59E0B" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
        <span className="text-xs font-bold text-amber-400 ml-1">4.9</span>
      </div>
      <div className="w-px h-4 bg-white/10" />
      <span className="text-[10px] text-slate-500 font-medium">
        {ar ? '+٥٠ ألف تحميل' : '50K+ downloads'}
      </span>
    </div>
  );
}

// ─── Animated Background Particles ──────────────────────────────────────────────
export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 3) * 2,
            height: 2 + (i % 3) * 2,
            background: i % 2 === 0 ? 'rgba(4,173,191,0.15)' : 'rgba(217,150,91,0.12)',
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${10 + (i * 11) % 80}%`,
          }}
          animate={{
            y: [0, -20 - (i % 3) * 10, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + (i % 3) * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}