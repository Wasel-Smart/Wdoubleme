/**
 * NotFound — 404 page for Wasel app
 * Shown for any unknown /app/* route
 * ✅ Bilingual | ✅ Dark design | ✅ Back to Dashboard CTA
 */

import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Home, ArrowLeft, Search, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function NotFound() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === 'ar';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      dir={ar ? 'rtl' : 'ltr'}
      style={{ background: '#040C18' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full"
      >
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(0,200,232,0.1)', border: '1px solid rgba(0,200,232,0.2)' }}>
          <MapPin className="w-10 h-10" style={{ color: '#00C8E8' }} />
        </div>

        {/* Error code */}
        <p className="text-7xl font-black mb-2 leading-none"
          style={{ color: 'rgba(0,200,232,0.25)' }}>404</p>

        {/* Title */}
        <h1 className="text-2xl font-bold mb-3" style={{ color: '#EFF6FF', fontWeight: 700 }}>
          {ar ? 'الصفحة مش موجودة' : 'Page Not Found'}
        </h1>

        {/* Subtitle */}
        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
          {ar
            ? 'يبدو إن هاد المسار غلط. ارجع للرئيسية وكمل رحلتك!'
            : "Looks like this route doesn't exist. Head back home and continue your journey!"}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/app')}
            className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #00C8E8, #00C875)', color: '#040C18' }}
          >
            <Home className="w-4 h-4" />
            {ar ? 'الرئيسية' : 'Back to Home'}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,200,232,0.1)', color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <ArrowLeft className="w-4 h-4" />
            {ar ? 'ارجع للخلف' : 'Go Back'}
          </button>

          <button
            onClick={() => navigate('/app/find-ride')}
            className="w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ color: '#00C8E8' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,200,232,0.06)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Search className="w-4 h-4" />
            {ar ? 'دور على رحلة' : 'Search for a Ride'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}