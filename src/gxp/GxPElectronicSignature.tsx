/**
 * GxPElectronicSignature — 21 CFR Part 11 Electronic Signature Modal
 * Triggers when a critical action requires authentication before execution.
 * Records the signature in the backend KV store.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, CheckCircle2, Eye, EyeOff, X, Lock, FileText } from 'lucide-react';
import { useGxPContext } from './GxPContext';
import { useLanguage } from '../contexts/LanguageContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071`;
const C = {
  bg: '#040C18', card: '#0A1628', card2: '#0D1E35',
  cyan: '#00C8E8', green: '#00C875', gold: '#F0A830',
  red: '#EF4444', muted: '#4D6A8A', border: '#1A2D4A',
};

async function sha256Hex(input: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    let h = 5381;
    for (let i = 0; i < input.length; i++) h = ((h << 5) + h) ^ input.charCodeAt(i);
    return Math.abs(h).toString(16).padStart(8, '0');
  }
}

export function GxPElectronicSignature() {
  const { pendingEsigAction, clearEsig, onEsigCallback, sessionId, userId } = useGxPContext();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [password, setPassword]       = useState('');
  const [reason, setReason]           = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingEsigAction) {
      setPassword(''); setReason(''); setError(null); setSuccess(false);
      setTimeout(() => passwordRef.current?.focus(), 300);
    }
  }, [pendingEsigAction]);

  const handleSign = async () => {
    if (!password || password.length < 4) {
      setError(isAr ? 'كلمة المرور قصيرة جدًا (4 أحرف على الأقل)' : 'Password too short (min 4 chars)');
      return;
    }
    if (!reason.trim()) {
      setError(isAr ? 'السبب مطلوب' : 'Reason is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const passwordHash = await sha256Hex(`${userId || 'anon'}:${password}`);
      const res = await fetch(`${API}/gxp/electronic-signatures`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId,
        },
        body: JSON.stringify({
          action:        pendingEsigAction,
          reason:        reason.trim(),
          password_hash: passwordHash,
          metadata:      { session_id: sessionId, user_id: userId },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || (isAr ? 'فشل إنشاء التوقيع' : 'Signature creation failed'));
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        if (onEsigCallback.current) onEsigCallback.current(data.sig_id);
        clearEsig();
        setSuccess(false);
      }, 1200);
    } catch (e: any) {
      setError(e.message || (isAr ? 'خطأ في الشبكة' : 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    clearEsig();
    setPassword(''); setReason(''); setError(null);
  };

  return (
    <AnimatePresence>
      {pendingEsigAction && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(4,12,24,0.92)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl p-6"
            style={{ background: C.card, border: `2px solid ${C.gold}60` }}
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className={`flex items-center gap-3 mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${C.gold}20`, border: `1px solid ${C.gold}50` }}>
                <Shield className="w-6 h-6" style={{ color: C.gold }} />
              </div>
              <div className={`flex-1 ${isAr ? 'text-right' : ''}`}>
                <h2 className="text-base font-black text-white">
                  {isAr ? 'توقيع إلكتروني مطلوب' : 'Electronic Signature Required'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>
                  21 CFR Part 11 · ALCOA+
                </p>
              </div>
              <button onClick={handleCancel}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
                style={{ background: `${C.muted}20`, color: C.muted }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action being signed */}
            <div className="rounded-xl p-4 mb-5" style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}30` }}>
              <div className={`flex items-start gap-2 ${isAr ? 'flex-row-reverse' : ''}`}>
                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: C.gold }} />
                <div className={isAr ? 'text-right' : ''}>
                  <div className="text-xs font-bold mb-1" style={{ color: C.gold }}>
                    {isAr ? 'الإجراء المطلوب التوقيع عليه' : 'Action requiring signature'}
                  </div>
                  <div className="text-sm font-semibold text-white">{pendingEsigAction}</div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-5 ${isAr ? 'flex-row-reverse' : ''}`}
              style={{ background: `${C.red}10`, border: `1px solid ${C.red}30` }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: C.red }} />
              <p className="text-xs" style={{ color: C.red }}>
                {isAr
                  ? 'هذا الإجراء حرج ويُسجَّل بشكل دائم في سجل التدقيق وفق 21 CFR Part 11'
                  : 'This critical action will be permanently recorded in the audit trail per 21 CFR Part 11'}
              </p>
            </div>

            {/* Reason field */}
            <div className="mb-4">
              <label className={`block text-xs font-bold mb-2 ${isAr ? 'text-right' : ''}`} style={{ color: C.muted }}>
                {isAr ? 'السبب / المبرر *' : 'Reason / Justification *'}
              </label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder={isAr ? 'اذكر سبب تنفيذ هذا الإجراء...' : 'Describe why this action is being performed...'}
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm text-white resize-none outline-none transition-all"
                style={{
                  background: C.card2,
                  border: `1px solid ${reason ? C.cyan + '60' : C.border}`,
                  color: 'white',
                  direction: isAr ? 'rtl' : 'ltr',
                }}
              />
            </div>

            {/* Password field */}
            <div className="mb-5">
              <label className={`block text-xs font-bold mb-2 ${isAr ? 'text-right' : ''}`} style={{ color: C.muted }}>
                {isAr ? 'كلمة المرور لتأكيد الهوية *' : 'Password to confirm identity *'}
              </label>
              <div className="relative">
                <input
                  ref={passwordRef}
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSign()}
                  placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'}
                  className="w-full px-3 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{
                    background: C.card2,
                    border: `1px solid ${password ? C.cyan + '60' : C.border}`,
                    paddingRight: isAr ? 12 : 42,
                    paddingLeft:  isAr ? 42 : 12,
                    direction: 'ltr',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute top-1/2 -translate-y-1/2 p-1"
                  style={{ [isAr ? 'left' : 'right']: 12, color: C.muted }}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className={`flex items-center gap-1 mt-1.5 text-xs ${isAr ? 'flex-row-reverse' : ''}`} style={{ color: C.muted }}>
                <Lock className="w-3 h-3" />
                {isAr ? 'يُحوَّل إلى SHA-256 قبل الإرسال — لا يُخزَّن بنص واضح' : 'SHA-256 hashed before transmission — never stored in plain text'}
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isAr ? 'flex-row-reverse' : ''}`}
                style={{ background: `${C.red}15`, border: `1px solid ${C.red}40` }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: C.red }} />
                <span className="text-sm" style={{ color: C.red }}>{error}</span>
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-2 p-3 rounded-xl mb-4 ${isAr ? 'flex-row-reverse' : ''}`}
                style={{ background: `${C.green}15`, border: `1px solid ${C.green}40` }}>
                <CheckCircle2 className="w-5 h-5" style={{ color: C.green }} />
                <span className="text-sm font-bold" style={{ color: C.green }}>
                  {isAr ? 'تم التوقيع بنجاح' : 'Signature recorded successfully'}
                </span>
              </motion.div>
            )}

            {/* Buttons */}
            <div className={`flex gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
              <button onClick={handleCancel} disabled={loading}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-80"
                style={{ background: `${C.muted}20`, color: C.muted, border: `1px solid ${C.border}` }}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button onClick={handleSign} disabled={loading || success || !password || !reason}
                className="flex-2 flex-1 py-3 rounded-xl text-sm font-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{
                  background: (loading || !password || !reason) ? `${C.gold}40` : `${C.gold}`,
                  color: C.bg,
                  opacity: (loading || !password || !reason) ? 0.6 : 1,
                }}>
                {loading ? (
                  <motion.div className="w-4 h-4 border-2 rounded-full"
                    style={{ borderColor: `${C.bg}40`, borderTopColor: C.bg }}
                    animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {loading ? (isAr ? 'جارٍ التوقيع...' : 'Signing...') : (isAr ? 'وقّع الآن' : 'Sign Now')}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs mt-4" style={{ color: `${C.muted}80` }}>
              {isAr ? 'ID الجلسة:' : 'Session ID:'} {sessionId.slice(0, 20)}…
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
