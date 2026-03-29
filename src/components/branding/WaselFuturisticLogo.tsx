/**
 * Wasel Futuristic Logo
 * "Out of This World Transportation" - Revolutionary Mobility for Middle East
 * 
 * Concept: UFO-inspired hover vehicle representing next-gen transportation
 * Keeps: Futuristic aesthetic, teal/gold colors, mechanical gear
 * Adds: Road/journey elements, Arabic integration, location pins
 */

import { motion } from 'motion/react';

interface WaselFuturisticLogoProps {
  size?: number;
  animated?: boolean;
  variant?: 'full' | 'icon-only' | 'with-text';
  showTagline?: boolean;
}

export function WaselFuturisticLogo({ 
  size = 200, 
  animated = true,
  variant = 'full',
  showTagline = false,
}: WaselFuturisticLogoProps) {
  const MotionSvg = animated ? motion.svg : 'svg';
  const MotionG = animated ? motion.g : 'g';
  const MotionPath = animated ? motion.path : 'path';
  const MotionCircle = animated ? motion.circle : 'circle';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Main Logo */}
      <MotionSvg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={animated ? { opacity: 0, scale: 0.8 } : undefined}
        animate={animated ? { opacity: 1, scale: 1 } : undefined}
        transition={animated ? { duration: 0.8, ease: "easeOut" } : undefined}
      >
        {/* Glow Effect Background */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vehicleGradient" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </radialGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Glow Circle */}
        <circle cx="200" cy="200" r="180" fill="url(#glow)" />

        {/* Road/Journey Path (Bottom) */}
        <MotionG
          initial={animated ? { opacity: 0, y: 20 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={animated ? { delay: 0.3, duration: 0.6 } : undefined}
        >
          {/* Curved Road */}
          <path
            d="M 50 320 Q 200 300 350 320"
            stroke="url(#roadGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Road Dashes */}
          <path
            d="M 100 318 L 120 318 M 160 315 L 180 315 M 220 315 L 240 315 M 280 315 L 300 315"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />
        </MotionG>

        {/* Location Pins (Journey Points) */}
        <MotionG
          initial={animated ? { opacity: 0, scale: 0 } : undefined}
          animate={animated ? { opacity: 1, scale: 1 } : undefined}
          transition={animated ? { delay: 0.5, duration: 0.5 } : undefined}
        >
          {/* Origin Pin (Left) */}
          <g transform="translate(70, 295)">
            <path
              d="M 0 0 C 0 -8 -6 -14 -6 -20 C -6 -26 0 -32 0 -32 C 0 -32 6 -26 6 -20 C 6 -14 0 -8 0 0 Z"
              fill="#06b6d4"
              stroke="#0891b2"
              strokeWidth="2"
            />
            <circle cx="0" cy="-20" r="3" fill="white" />
          </g>

          {/* Destination Pin (Right) */}
          <g transform="translate(330, 295)">
            <path
              d="M 0 0 C 0 -8 -6 -14 -6 -20 C -6 -26 0 -32 0 -32 C 0 -32 6 -26 6 -20 C 6 -14 0 -8 0 0 Z"
              fill="#10b981"
              stroke="#059669"
              strokeWidth="2"
            />
            <circle cx="0" cy="-20" r="3" fill="white" />
          </g>
        </MotionG>

        {/* Futuristic Hover Vehicle (UFO-inspired Transport Pod) */}
        <MotionG
          initial={animated ? { opacity: 0, y: -30 } : undefined}
          animate={animated ? { 
            opacity: 1, 
            y: [0, -8, 0],
          } : undefined}
          transition={animated ? { 
            opacity: { duration: 0.6, delay: 0.2 },
            y: { 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }
          } : undefined}
        >
          {/* Connection Arc (Vehicle to Destination) */}
          <path
            d="M 200 240 Q 280 220 330 275"
            stroke="#06b6d4"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            opacity="0.4"
          />

          {/* Hover Glow/Beam */}
          <ellipse
            cx="200"
            cy="260"
            rx="60"
            ry="15"
            fill="#06b6d4"
            opacity="0.15"
          />
          <ellipse
            cx="200"
            cy="260"
            rx="40"
            ry="10"
            fill="#06b6d4"
            opacity="0.25"
          />

          {/* Main Vehicle Body (Sleek Transport Pod) */}
          <g transform="translate(200, 180)">
            {/* Top Dome/Canopy */}
            <ellipse
              cx="0"
              cy="-30"
              rx="45"
              ry="20"
              fill="#94a3b8"
              stroke="#64748b"
              strokeWidth="3"
            />
            <ellipse
              cx="0"
              cy="-30"
              rx="35"
              ry="15"
              fill="url(#vehicleGradient)"
              opacity="0.5"
            />

            {/* Main Body */}
            <ellipse
              cx="0"
              cy="0"
              rx="70"
              ry="28"
              fill="#475569"
              stroke="#334155"
              strokeWidth="4"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="70"
              ry="28"
              fill="url(#vehicleGradient)"
              opacity="0.4"
            />

            {/* Accent Stripe */}
            <ellipse
              cx="0"
              cy="2"
              rx="68"
              ry="8"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="3"
            />

            {/* Side Thrusters/Stabilizers */}
            <g>
              {/* Left Thruster */}
              <circle cx="-60" cy="5" r="18" fill="#06b6d4" stroke="#0891b2" strokeWidth="3" />
              <circle cx="-60" cy="5" r="12" fill="#0891b2" />
              <circle cx="-60" cy="5" r="6" fill="#67e8f9" />
              {/* Thruster Glow */}
              <circle cx="-60" cy="5" r="22" fill="#06b6d4" opacity="0.2" />

              {/* Right Thruster */}
              <circle cx="60" cy="5" r="18" fill="#06b6d4" stroke="#0891b2" strokeWidth="3" />
              <circle cx="60" cy="5" r="12" fill="#0891b2" />
              <circle cx="60" cy="5" r="6" fill="#67e8f9" />
              {/* Thruster Glow */}
              <circle cx="60" cy="5" r="22" fill="#06b6d4" opacity="0.2" />
            </g>

            {/* Bottom Energy Core/Gear */}
            <g transform="translate(0, 35)">
              {/* Outer Gear Ring */}
              <circle cx="0" cy="0" r="28" fill="url(#goldGradient)" />
              <circle cx="0" cy="0" r="25" fill="#1e293b" />

              {/* Gear Teeth */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <rect
                  key={angle}
                  x="-3"
                  y="-28"
                  width="6"
                  height="6"
                  fill="url(#goldGradient)"
                  transform={`rotate(${angle})`}
                />
              ))}

              {/* Inner Energy Core */}
              <circle cx="0" cy="0" r="18" fill="#0891b2" stroke="#06b6d4" strokeWidth="2" />
              <circle cx="0" cy="0" r="12" fill="#06b6d4" />
              <circle cx="0" cy="0" r="6" fill="#67e8f9" />

              {/* Pulsing Center */}
              {animated && (
                <motion.circle
                  cx="0"
                  cy="0"
                  r="8"
                  fill="#67e8f9"
                  opacity="0.6"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.6, 0.2, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Rotating Ring */}
              {animated && (
                <motion.g
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <circle
                    cx="0"
                    cy="0"
                    r="20"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    strokeDasharray="8,4"
                    opacity="0.6"
                  />
                </motion.g>
              )}

              {/* Direction Indicators */}
              <circle cx="0" cy="-22" r="3" fill="#67e8f9" />
              <circle cx="0" cy="22" r="3" fill="#06b6d4" />
            </g>

            {/* Window/Passenger Area */}
            <ellipse
              cx="0"
              cy="-8"
              rx="25"
              ry="12"
              fill="#334155"
              opacity="0.3"
            />
          </g>
        </MotionG>

        {/* Arabic Calligraphy Integration (واصل) */}
        {variant === 'full' && (
          <MotionG
            initial={animated ? { opacity: 0 } : undefined}
            animate={animated ? { opacity: 1 } : undefined}
            transition={animated ? { delay: 0.8, duration: 0.6 } : undefined}
          >
            <text
              x="200"
              y="85"
              textAnchor="middle"
              fill="url(#goldGradient)"
              fontSize="36"
              fontWeight="bold"
              fontFamily="Arial, sans-serif"
              style={{ direction: 'rtl' }}
            >
              واصل
            </text>
          </MotionG>
        )}

        {/* Orbital Rings (Innovation Symbol) */}
        <MotionG opacity="0.3">
          {animated ? (
            <motion.circle
              cx="200"
              cy="200"
              r="160"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1"
              strokeDasharray="10,10"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: '200px 200px' }}
            />
          ) : (
            <circle
              cx="200"
              cy="200"
              r="160"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1"
              strokeDasharray="10,10"
            />
          )}
        </MotionG>
      </MotionSvg>

      {/* Brand Text */}
      {variant === 'with-text' && (
        <motion.div
          className="text-center"
          initial={animated ? { opacity: 0, y: 10 } : undefined}
          animate={animated ? { opacity: 1, y: 0 } : undefined}
          transition={animated ? { delay: 1, duration: 0.6 } : undefined}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Wasel
            </h1>
            <span className="text-3xl text-gray-400">|</span>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              واصل
            </h1>
          </div>
          {showTagline && (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Out of This World Transportation
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Compact Icon Version (for app bars, favicons)
export function WaselLogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="iconGradient" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#06b6d4" />
        </radialGradient>
        <linearGradient id="iconGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Simplified Vehicle */}
      <ellipse cx="50" cy="40" rx="35" ry="14" fill="url(#iconGradient)" />
      <ellipse cx="50" cy="40" rx="35" ry="5" fill="none" stroke="url(#iconGold)" strokeWidth="2" />
      
      {/* Thrusters */}
      <circle cx="20" cy="42" r="8" fill="#06b6d4" />
      <circle cx="80" cy="42" r="8" fill="#06b6d4" />
      
      {/* Energy Core */}
      <circle cx="50" cy="58" r="12" fill="url(#iconGold)" />
      <circle cx="50" cy="58" r="8" fill="#06b6d4" />
      <circle cx="50" cy="58" r="4" fill="#67e8f9" />
      
      {/* Road */}
      <path d="M 10 85 Q 50 80 90 85" stroke="#06b6d4" strokeWidth="3" fill="none" opacity="0.4" />
    </svg>
  );
}
