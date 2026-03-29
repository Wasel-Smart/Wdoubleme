/**
 * ThemeToggle — Wasel | واصل
 * Cutting-edge sun/moon switcher with brand colors.
 * Compact pill design that works in both sidebar and header.
 */
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'motion/react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center"
      style={{
        width: 52,
        height: 28,
        borderRadius: 9999,
        background: isDark
          ? 'linear-gradient(135deg, #0F172A, #1E293B)'
          : 'linear-gradient(135deg, #E8F7F9, #D1FAE5)',
        border: `1.5px solid ${isDark ? 'rgba(0,200,232,0.3)' : 'rgba(0,200,117,0.3)'}`,
        boxShadow: isDark
          ? '0 2px 8px rgba(0,200,232,0.2), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 2px 8px rgba(0,200,117,0.15), inset 0 1px 0 rgba(255,255,255,0.6)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        padding: '2px',
        flexShrink: 0,
      }}
    >
      {/* Track icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun
          size={10}
          style={{ color: isDark ? 'rgba(100,116,139,0.4)' : '#00C875', transition: 'color 0.3s' }}
        />
        <Moon
          size={10}
          style={{ color: isDark ? '#00C8E8' : 'rgba(148,163,184,0.4)', transition: 'color 0.3s' }}
        />
      </div>

      {/* Sliding thumb */}
      <motion.div
        layout
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: isDark
            ? 'linear-gradient(135deg, #00C8E8, #00C875)'
            : 'linear-gradient(135deg, #00C875, #00C8E8)',
          boxShadow: isDark
            ? '0 2px 8px rgba(0,200,232,0.5)'
            : '0 2px 8px rgba(0,200,117,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isDark
          ? <Moon size={11} style={{ color: '#FFFFFF' }} />
          : <Sun  size={11} style={{ color: '#FFFFFF' }} />
        }
      </motion.div>
    </button>
  );
}