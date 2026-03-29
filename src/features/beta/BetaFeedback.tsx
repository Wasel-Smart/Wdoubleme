/**
 * BetaFeedback — In-app feedback modal for soft beta
 *
 * Shown after key flows (post-booking, post-delivery, etc.)
 * Categories: bug, UX, feature, cultural, general
 * Backed by /beta/feedback KV endpoint
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Bug, Lightbulb, Star, ThumbsUp, Send, Mosque } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '../../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;

export type FeedbackFlow =
  | 'post-booking'
  | 'post-delivery'
  | 'post-qr-scan'
  | 'post-payment'
  | 'general';

interface BetaFeedbackProps {
  open: boolean;
  onClose: () => void;
  flow?: FeedbackFlow;
  userId?: string;
}

const CATEGORIES = [
  { key: 'bug',      icon: Bug,          en: 'Bug Report',       ar: 'بلّغ عن خطأ',    color: 'text-red-400    border-red-400/20    bg-red-400/10'   },
  { key: 'ux',       icon: Star,         en: 'UX Feedback',      ar: 'تجربة المستخدم', color: 'text-amber-400  border-amber-400/20  bg-amber-400/10' },
  { key: 'feature',  icon: Lightbulb,    en: 'Feature Request',  ar: 'فكرة جديدة',     color: 'text-cyan-400   border-cyan-400/20   bg-cyan-400/10'  },
  { key: 'cultural', icon: Mosque,       en: 'Cultural Issue',   ar: 'ملاحظة ثقافية',  color: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' },
  { key: 'general',  icon: MessageSquare,en: 'General',          ar: 'عام',             color: 'text-slate-400  border-slate-400/20  bg-slate-400/10' },
];

const QUICK_RATINGS = ['😞', '😕', '😐', '😊', '🤩'];
const FLOW_LABELS: Record<FeedbackFlow, { en: string; ar: string }> = {
  'post-booking':  { en: 'How was booking your ride?',    ar: 'كيف كانت عملية الحجز؟'        },
  'post-delivery': { en: 'How was the delivery flow?',    ar: 'كيف كانت عملية الإرسال؟'      },
  'post-qr-scan':  { en: 'How was the QR scan process?', ar: 'كيف كانت عملية مسح الكود؟'    },
  'post-payment':  { en: 'How was the payment flow?',     ar: 'كيف كانت عملية الدفع؟'        },
  'general':       { en: 'How are we doing?',             ar: 'كيف ماشي الأمور معنا؟'        },
};

export function BetaFeedback({ open, onClose, flow = 'general', userId }: BetaFeedbackProps) {
  const { language } = useLanguage();
  const ar = language === 'ar';

  const [category, setCategory] = useState('general');
  const [rating, setRating]     = useState(0);
  const [text, setText]         = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() && rating === 0) {
      toast.error(ar ? 'حط تقييم أو اكتب رأيك' : 'Add a rating or write feedback');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/beta/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ userId, flow, category, rating, text, language }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Feedback submit failed');
      }
      setSubmitted(true);
      toast.success(ar ? '🙏 شكراً على رأيك!' : '🙏 Thanks for the feedback!');
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setCategory('general');
        setRating(0);
        setText('');
      }, 2000);
    } catch (err: any) {
      console.error('[BetaFeedback] error:', err);
      toast.error(err.message || (ar ? 'حصل خطأ' : 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const label = FLOW_LABELS[flow];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          dir={ar ? 'rtl' : 'ltr'}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{   y: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-5"
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-border rounded-full mx-auto -mt-1 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {ar ? 'بيتا ٢٠٢٦' : 'Beta 2026'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {ar ? label.ar : label.en}
                </h2>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!submitted ? (
              <>
                {/* Quick emoji rating */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">{ar ? 'كيف تقيّم تجربتك؟' : 'Rate your experience'}</p>
                  <div className="flex justify-between">
                    {QUICK_RATINGS.map((emoji, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        animate={{ scale: rating === i + 1 ? 1.3 : 1 }}
                        onClick={() => setRating(i + 1)}
                        className={`text-3xl select-none transition-opacity ${rating && rating !== i + 1 ? 'opacity-40' : 'opacity-100'}`}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">{ar ? 'نوع الملاحظة' : 'Feedback type'}</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {CATEGORIES.map(({ key, icon: Icon, en, ar: arLabel, color }) => {
                      const [textCls, borderCls, bgCls] = color.split('  ');
                      return (
                        <button
                          key={key}
                          onClick={() => setCategory(key)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-semibold transition-all ${
                            category === key ? `${bgCls} ${borderCls} ${textCls}` : 'border-border bg-background text-slate-500 hover:border-muted-foreground/30'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {ar ? arLabel : en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text area */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">{ar ? 'اكتب تفاصيل (اختياري)' : 'Describe your feedback (optional)'}</p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={3}
                    placeholder={ar ? 'وين الخلل؟ وش تحب نحسّن؟...' : 'What went wrong? What could be better?...'}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-primary/30 resize-none"
                    dir={ar ? 'rtl' : 'ltr'}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                >
                  {loading ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {ar ? 'ارسل الملاحظة' : 'Submit Feedback'}
                    </>
                  )}
                </Button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 space-y-3">
                <ThumbsUp className="w-12 h-12 text-primary mx-auto" />
                <h3 className="text-xl font-bold text-white">{ar ? 'شكراً! 🙏' : 'Thank you! 🙏'}</h3>
                <p className="text-slate-400 text-sm">{ar ? 'رأيك يساعدنا نبني منصة أفضل' : 'Your feedback helps us build a better platform'}</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
