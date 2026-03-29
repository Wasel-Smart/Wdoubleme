/**
 * BrandShowcase — /features/brand/BrandShowcase.tsx
 * Full-page brand / color-plate showcase.
 * Accessible at /app/brand
 */

import { ColorPlate, WaselMark, Logo } from '../../components/Logo';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { motion } from 'motion/react';

export function BrandShowcase() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const ar = language === 'ar';
  const dark = theme === 'dark';

  return (
    <div
      className="min-h-screen pb-24 px-4 pt-6"
      style={{
        background: dark
          ? 'linear-gradient(160deg, #0B1120 0%, #0D1526 50%, #0B1120 100%)'
          : 'linear-gradient(160deg, #F0F9FA 0%, #F8FAFB 50%, #EFF6FF 100%)',
        direction: ar ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1
              className="font-black"
              style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                background: 'linear-gradient(135deg, #09732E 0%, #04ADBF 60%, #ABD907 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {ar ? 'دليل العلامة التجارية' : 'Brand Guidelines'}
            </h1>
            <p style={{ fontSize: '0.78rem', color: dark ? '#475569' : '#64748B', marginTop: 4 }}>
              {ar ? 'واصل × أوصل — نظام الهوية البصرية' : 'Wasel × Awasel — Visual Identity System'}
            </p>
          </div>
          <ThemeToggle />
        </motion.div>

        {/* Logo variants showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-5 rounded-2xl space-y-4"
          style={{
            background: dark ? 'var(--wasel-glass-brand)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(4,173,191,0.15)'}`,
          }}
        >
          <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? '#334155' : '#94A3B8' }}>
            Logo Variants
          </p>
          <div className="space-y-4">
            {/* Full (wordmark + awasel) */}
            <div className="flex items-center gap-4 flex-wrap">
              <Logo variant="wordmark" size="xl" showAwasel />
            </div>
            {/* Standard */}
            <div className="flex items-center gap-6 flex-wrap">
              {(['xs', 'sm', 'md', 'lg'] as const).map(s => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Logo variant="wordmark" size={s} />
                  <span style={{ fontSize: '0.55rem', color: dark ? '#475569' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s}</span>
                </div>
              ))}
            </div>
            {/* Mark only */}
            <div className="flex items-end gap-4 flex-wrap">
              {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(s => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <WaselMark size={s} />
                  <span style={{ fontSize: '0.5rem', color: dark ? '#334155' : '#CBD5E1', textTransform: 'uppercase' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Color plate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ColorPlate />
        </motion.div>
      </div>
    </div>
  );
}