/**
 * MainLogoShowcase - Interactive showcase for the official Wasel logo
 * Demonstrates all variants, sizes, and usage guidelines
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  WaselMainLogo,
  WaselLogoIcon,
  WaselLogoFull,
  WaselLogoHero,
  WaselLogoWithText,
  WaselLogoResponsive,
  WASEL_COLORS,
  SIZE_PRESETS,
} from '../../components/branding/WaselMainLogo';
import { Download, Sparkles, Check, X, Eye, EyeOff } from 'lucide-react';

export function MainLogoShowcase() {
  const [animated, setAnimated] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showGlow, setShowGlow] = useState(true);

  const bgColor = darkMode ? '#040C18' : '#F0F4F8';
  const textColor = darkMode ? '#FFFFFF' : '#1E293B';
  const mutedColor = darkMode ? '#64748B' : '#64748B';

  return (
    <div 
      className="min-h-screen py-20 px-4 transition-colors duration-300"
      style={{ background: bgColor }}
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 
            className="text-5xl md:text-6xl font-black mb-4"
            style={{ color: textColor }}
          >
            Wasel Official Logo
          </h1>
          <p 
            className="text-xl mb-8"
            style={{ color: mutedColor }}
          >
            High-resolution brand identity following best practices
          </p>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setAnimated(!animated)}
              className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
              style={{
                background: animated ? WASEL_COLORS.cyan : 'rgba(255,255,255,0.1)',
                color: animated ? '#000' : textColor,
                border: `1px solid ${animated ? WASEL_COLORS.cyan : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              {animated ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {animated ? 'Animated' : 'Static'}
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-6 py-3 rounded-xl font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: textColor,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {darkMode ? '🌙 Dark' : '☀️ Light'}
            </button>

            <button
              onClick={() => setShowGlow(!showGlow)}
              className="px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
              style={{
                background: showGlow ? WASEL_COLORS.gold : 'rgba(255,255,255,0.1)',
                color: showGlow ? '#000' : textColor,
                border: `1px solid ${showGlow ? WASEL_COLORS.gold : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              <Sparkles className="w-4 h-4" />
              {showGlow ? 'Glow On' : 'Glow Off'}
            </button>
          </div>
        </motion.div>

        {/* Main Hero Logo */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-24"
        >
          <div 
            className="rounded-3xl p-16 border flex flex-col items-center"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <h2 
              className="text-2xl font-bold mb-8"
              style={{ color: WASEL_COLORS.cyan }}
            >
              Hero Size (500px)
            </h2>
            <WaselLogoHero animated={animated} />
            <p 
              className="mt-8 text-center max-w-2xl"
              style={{ color: mutedColor }}
            >
              Use for landing pages, splash screens, and main hero sections.
              <br />
              <strong style={{ color: WASEL_COLORS.cyan }}>Perfect for first impressions.</strong>
            </p>
          </div>
        </motion.section>

        {/* Size Variants Grid */}
        <section className="mb-24">
          <h2 
            className="text-3xl font-black mb-8 text-center"
            style={{ color: textColor }}
          >
            Size Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Small Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl p-8 border text-center"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex justify-center mb-6">
                <WaselLogoIcon animated={false} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                Icon (40px)
              </h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                Navigation bars, buttons, favicons
              </p>
            </motion.div>

            {/* Medium Full */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl p-8 border text-center"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex justify-center mb-6">
                <WaselLogoFull animated={animated} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                Full (180px)
              </h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                Headers, cards, feature sections
              </p>
            </motion.div>

            {/* Large Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl p-8 border text-center"
              style={{
                background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              <div className="flex justify-center mb-6">
                <WaselMainLogo size={120} animated={animated} glow={showGlow} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: textColor }}>
                Hero (500px)
              </h3>
              <p className="text-sm" style={{ color: mutedColor }}>
                Landing pages, splash screens
              </p>
            </motion.div>
          </div>
        </section>

        {/* Logo with Text */}
        <section className="mb-24">
          <h2 
            className="text-3xl font-black mb-8 text-center"
            style={{ color: textColor }}
          >
            Full Branding
          </h2>

          <div 
            className="rounded-3xl p-16 border flex justify-center"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <WaselLogoWithText size={300} animated={animated} showTagline={true} />
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-24">
          <h2 
            className="text-3xl font-black mb-8 text-center"
            style={{ color: textColor }}
          >
            Brand Colors
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(WASEL_COLORS).map(([name, color]) => (
              <motion.div
                key={name}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl p-6 border text-center"
                style={{
                  background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                }}
              >
                <div
                  className="w-20 h-20 rounded-xl mx-auto mb-4 border-2"
                  style={{
                    background: color,
                    borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                    boxShadow: `0 8px 24px ${color}40`,
                  }}
                />
                <h3 className="text-sm font-bold mb-1 capitalize" style={{ color: textColor }}>
                  {name.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <code className="text-xs" style={{ color: mutedColor }}>
                  {color}
                </code>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Usage Guidelines */}
        <section className="mb-24">
          <h2 
            className="text-3xl font-black mb-8 text-center"
            style={{ color: textColor }}
          >
            Usage Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* DO */}
            <div 
              className="rounded-2xl p-8 border"
              style={{
                background: darkMode ? 'rgba(0,200,117,0.05)' : 'rgba(0,200,117,0.1)',
                borderColor: '#00C875',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#00C875' }}
                >
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#00C875' }}>
                  DO
                </h3>
              </div>
              <ul className="space-y-3 text-sm" style={{ color: textColor }}>
                <li>✓ Use on dark or light backgrounds with proper contrast</li>
                <li>✓ Maintain aspect ratio when scaling</li>
                <li>✓ Keep 20px minimum clear space around logo</li>
                <li>✓ Use provided color schemes (cyan/gold)</li>
                <li>✓ Enable glow effects for brand consistency</li>
                <li>✓ Use retina-optimized versions (2x/3x)</li>
              </ul>
            </div>

            {/* DON'T */}
            <div 
              className="rounded-2xl p-8 border"
              style={{
                background: darkMode ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.1)',
                borderColor: '#EF4444',
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: '#EF4444' }}
                >
                  <X className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#EF4444' }}>
                  DON'T
                </h3>
              </div>
              <ul className="space-y-3 text-sm" style={{ color: textColor }}>
                <li>✗ Stretch or distort proportions</li>
                <li>✗ Change colors arbitrarily</li>
                <li>✗ Add unnecessary effects or filters</li>
                <li>✗ Rotate or flip the logo</li>
                <li>✗ Use on busy or conflicting backgrounds</li>
                <li>✗ Reduce size below 32px (readability)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="mb-24">
          <h2 
            className="text-3xl font-black mb-8 text-center"
            style={{ color: textColor }}
          >
            Technical Specifications
          </h2>

          <div 
            className="rounded-2xl p-8 border"
            style={{
              background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: WASEL_COLORS.cyan }}>
                  Format
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li>• PNG (Raster Image)</li>
                  <li>• High Resolution</li>
                  <li>• Transparent Background</li>
                  <li>• Retina Support (2x/3x)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: WASEL_COLORS.gold }}>
                  Dimensions
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li>• Min: 32px (favicons)</li>
                  <li>• Small: 40-80px (icons)</li>
                  <li>• Medium: 120-320px (headers)</li>
                  <li>• Large: 400-800px (hero)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4" style={{ color: WASEL_COLORS.cyan }}>
                  Colors
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: mutedColor }}>
                  <li>• Primary: Cyan (#00C8E8)</li>
                  <li>• Secondary: Gold (#F0A830)</li>
                  <li>• Accents: White/Teal</li>
                  <li>• Background: Dark (#040C18)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Download CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <button
            className="px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 mx-auto transition-all"
            style={{
              background: `linear-gradient(135deg, ${WASEL_COLORS.cyan}, ${WASEL_COLORS.gold})`,
              color: '#000',
              boxShadow: `0 10px 40px ${WASEL_COLORS.cyanGlow}`,
            }}
          >
            <Download className="w-6 h-6" />
            Download Brand Assets
          </button>
          <p className="mt-4 text-sm" style={{ color: mutedColor }}>
            All logo variants, color palettes, and usage guidelines
          </p>
        </motion.section>

      </div>
    </div>
  );
}

export default MainLogoShowcase;
