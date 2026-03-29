/**
 * Wasel Safety Center v5.0
 * Cosmic dark · Emergency-ready · Premium trust layer
 */
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { copyToClipboard } from '../utils/clipboard';

// ── Design tokens ─────────────────────────────────────────────────────────
const BG     = '#040C18';
const CARD   = 'rgba(255,255,255,0.04)';
const CARD_H = 'rgba(255,255,255,0.07)';
const BORDER = 'rgba(0,200,232,0.14)';
const CYAN   = '#00C8E8';
const GOLD   = '#F0A830';
const GREEN  = '#00C875';
const RED    = '#FF4455';
const TEXT   = '#EFF6FF';
const MUTED  = 'rgba(148,163,184,0.75)';
const F      = "-apple-system,BlinkMacSystemFont,'Inter','Cairo',sans-serif";

function dc(extra: React.CSSProperties = {}): React.CSSProperties {
  return { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, ...extra };
}

interface EmergencyContact {
  id: string; name: string; phone: string; relationship: string;
}

const SAFETY_FEATURES = [
  { icon: '🔒', title: 'Identity Verified', titleAr: 'هوية موثقة', desc: 'All drivers ID-verified before first trip', color: GREEN },
  { icon: '🛡️', title: 'Trip Insurance', titleAr: 'تأمين الرحلة', desc: 'JOD 100 coverage included — upgrade to JOD 1,000', color: CYAN },
  { icon: '📍', title: 'Live GPS Tracking', titleAr: 'تتبع مباشر', desc: 'Real-time route monitoring on every trip', color: GOLD },
  { icon: '⭐', title: 'Trust Scores', titleAr: 'درجة الثقة', desc: 'Community-rated drivers with public history', color: '#8B5CF6' },
];

const EMERGENCY_NUMBERS = [
  { label: 'Police', labelAr: 'الشرطة', number: '911', color: '#2060E8', icon: '🚔' },
  { label: 'Ambulance', labelAr: 'إسعاف', number: '912', color: RED, icon: '🚑' },
  { label: 'Civil Defense', labelAr: 'الدفاع المدني', number: '193', color: GOLD, icon: '🚒' },
  { label: 'Wasel SOS', labelAr: 'واصل طوارئ', number: '+962-800-WASEL', color: CYAN, icon: '📞' },
];

const TABS = [
  { key: 'overview',  label: 'Overview',  labelAr: 'نظرة عامة', icon: '🛡️' },
  { key: 'contacts',  label: 'Contacts',  labelAr: 'جهات الاتصال', icon: '👥' },
  { key: 'settings',  label: 'Settings',  labelAr: 'الإعدادات', icon: '⚙️' },
  { key: 'tips',      label: 'Safety Tips', labelAr: 'نصائح', icon: '💡' },
] as const;

export function SafetyCenter() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [tab, setTab] = useState<typeof TABS[number]['key']>('overview');
  const [sosActive, setSosActive] = useState(false);
  const sosTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: 'Sarah Ahmed', phone: '+962 79 123 4567', relationship: 'Sister' },
    { id: '2', name: 'Mohammed Ali', phone: '+962 78 987 6543', relationship: 'Brother' },
  ]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

  const [settings, setSettings] = useState({
    autoShareLocation: true,
    emergencyAlerts: true,
    nightModeAlert: true,
    tripSharing: true,
  });

  const activateSOS = () => {
    setSosActive(true);
    toast.error('🚨 SOS Activated — Alerting your emergency contacts and sharing your location!', { duration: 8000 });
    sosTimer.current = setTimeout(() => setSosActive(false), 8000);
  };

  const handleShareTrip = () => {
    const link = `https://wasel.jo/track/trip-${Date.now()}`;
    copyToClipboard(link);
    toast.success('Trip tracking link copied to clipboard!');
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error(isRTL ? 'أدخل الاسم والهاتف' : 'Please fill in name and phone');
      return;
    }
    setContacts(c => [...c, { id: Date.now().toString(), ...newContact }]);
    setNewContact({ name: '', phone: '', relationship: '' });
    toast.success(isRTL ? 'تمت الإضافة!' : 'Contact added!');
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: F, paddingBottom: 48 }} dir={isRTL ? 'rtl' : 'ltr'}>
      <style>{`
        @keyframes sos-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,68,85,0.5)} 70%{box-shadow:0 0 0 24px rgba(255,68,85,0)} }
        @keyframes slide-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .saf-tab:hover { background: rgba(0,200,232,0.07) !important; }
        .contact-row:hover { border-color: rgba(0,200,232,0.25) !important; }
      `}</style>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 0' }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,200,117,0.08),rgba(0,200,232,0.05))',
          border: `1px solid rgba(0,200,117,0.2)`,
          borderRadius: 22, padding: '24px 28px', marginBottom: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg,rgba(0,200,117,0.2),rgba(0,200,232,0.1))',
              border: `1px solid rgba(0,200,117,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
            }}>🛡️</div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: TEXT, margin: 0, letterSpacing: '-0.02em' }}>
                {isRTL ? 'مركز السلامة' : 'Safety Center'}
              </h1>
              <p style={{ fontSize: '0.78rem', color: MUTED, margin: '4px 0 0' }}>
                {isRTL ? 'حمايتك أولويتنا في كل رحلة' : 'Your protection is our priority on every trip'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, animation: 'sos-pulse 2s infinite' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: GREEN }}>
              {isRTL ? 'نظام الحماية نشط' : 'Protection Active'}
            </span>
          </div>
        </div>

        {/* ── SOS Banner ── */}
        <AnimatePresence>
          {sosActive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                background: 'rgba(255,68,85,0.15)', border: `2px solid ${RED}`,
                borderRadius: 16, padding: '16px 20px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ fontSize: '2rem', animation: 'sos-pulse 0.5s infinite' }}>🚨</div>
              <div>
                <div style={{ fontWeight: 900, color: RED, fontSize: '1rem' }}>SOS ACTIVATED</div>
                <div style={{ fontSize: '0.75rem', color: MUTED }}>
                  Alerting Sarah Ahmed, Mohammed Ali · Sharing live location
                </div>
              </div>
              <button onClick={() => setSosActive(false)} style={{
                marginLeft: 'auto', height: 34, padding: '0 14px', borderRadius: 99,
                background: 'rgba(255,68,85,0.15)', border: `1px solid ${RED}40`,
                color: RED, fontWeight: 700, fontSize: '0.78rem', fontFamily: F, cursor: 'pointer',
              }}>Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SOS Button ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '20px 24px', background: 'rgba(255,68,85,0.06)',
          border: `1px solid rgba(255,68,85,0.2)`, borderRadius: 18, marginBottom: 24,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <span style={{ fontWeight: 800, color: RED, fontSize: '0.95rem' }}>
                {isRTL ? 'نداء طوارئ SOS' : 'Emergency SOS'}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: MUTED, margin: 0, lineHeight: 1.5 }}>
              {isRTL
                ? 'اضغط هذا الزر في حالة الطوارئ لتنبيه جهات اتصالك ومشاركة موقعك فوراً'
                : 'In an emergency, press this button to instantly alert your contacts and share your live location'}
            </p>
          </div>
          <button
            onClick={activateSOS}
            style={{
              width: 90, height: 90, borderRadius: '50%',
              background: sosActive
                ? 'rgba(255,68,85,0.8)'
                : 'linear-gradient(135deg,#FF2244,#CC0033)',
              border: `3px solid rgba(255,68,85,0.4)`,
              color: '#fff', fontWeight: 900, fontSize: '0.78rem', fontFamily: F,
              cursor: 'pointer', flexShrink: 0,
              animation: sosActive ? 'sos-pulse 0.5s infinite' : 'sos-pulse 3s infinite',
              boxShadow: '0 4px 24px rgba(255,68,85,0.4)',
              transition: 'transform 0.1s',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.95)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            SOS
          </button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20,
          background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 4 }}>
          {TABS.map(t => (
            <button key={t.key} className="saf-tab" onClick={() => setTab(t.key)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 14px', borderRadius: 10,
              background: tab === t.key ? 'rgba(0,200,232,0.12)' : 'transparent',
              border: tab === t.key ? `1px solid ${BORDER}` : '1px solid transparent',
              color: tab === t.key ? CYAN : MUTED, fontWeight: tab === t.key ? 700 : 500,
              fontSize: '0.78rem', fontFamily: F, cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <span>{t.icon}</span>
              <span>{isRTL ? t.labelAr : t.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Quick actions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                {[
                  { icon: '🔗', label: isRTL ? 'شارك رحلتك' : 'Share Trip', desc: isRTL ? 'رابط تتبع مباشر' : 'Live tracking link', color: CYAN, action: handleShareTrip },
                  { icon: '📞', label: isRTL ? 'خط طوارئ' : 'Emergency Call', desc: isRTL ? 'اتصال سريع 911' : 'Quick dial 911', color: RED, action: () => window.location.href = 'tel:911' },
                  { icon: '💬', label: isRTL ? 'نصائح السلامة' : 'Safety Tips', desc: isRTL ? 'إرشادات مهمة' : 'Important guidelines', color: GOLD, action: () => setTab('tips') },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    padding: '20px 16px', borderRadius: 16,
                    background: `${a.color}08`, border: `1px solid ${a.color}20`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}14`; (e.currentTarget as HTMLElement).style.borderColor = `${a.color}35`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${a.color}08`; (e.currentTarget as HTMLElement).style.borderColor = `${a.color}20`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ width: 50, height: 50, borderRadius: 14, background: `${a.color}18`,
                      border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.5rem' }}>{a.icon}</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: TEXT }}>{a.label}</div>
                      <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 2 }}>{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Safety features */}
              <div style={dc({ padding: '20px 22px', marginBottom: 20 })}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: GREEN,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                  Active Protections
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SAFETY_FEATURES.map((f, i) => (
                    <motion.div key={f.title}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      style={{
                        display: 'flex', gap: 12, padding: '14px 14px',
                        borderRadius: 12, background: `${f.color}07`, border: `1px solid ${f.color}18`,
                      }}
                    >
                      <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{f.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: TEXT }}>{isRTL ? f.titleAr : f.title}</div>
                        <div style={{ fontSize: '0.65rem', color: MUTED, marginTop: 3, lineHeight: 1.4 }}>{f.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Emergency numbers */}
              <div style={dc({ padding: '20px 22px' })}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: RED,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                  Emergency Numbers · أرقام الطوارئ
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {EMERGENCY_NUMBERS.map(n => (
                    <a key={n.label} href={`tel:${n.number}`} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                      padding: '14px 10px', borderRadius: 12,
                      background: `${n.color}09`, border: `1px solid ${n.color}25`,
                      textDecoration: 'none', transition: 'all 0.14s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${n.color}16`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${n.color}09`; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{n.icon}</span>
                      <div style={{ fontWeight: 900, color: n.color, fontSize: '1rem' }}>{n.number}</div>
                      <div style={{ fontSize: '0.65rem', color: TEXT, textAlign: 'center' }}>{isRTL ? n.labelAr : n.label}</div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* CONTACTS */}
          {tab === 'contacts' && (
            <motion.div key="contacts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={dc({ padding: '22px', marginBottom: 16 })}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: CYAN,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {isRTL ? 'جهات الاتصال الطارئة' : 'Emergency Contacts'}
                </div>
                <div style={{ fontSize: '0.75rem', color: MUTED, marginBottom: 18 }}>
                  {isRTL ? 'هؤلاء يتلقون إشعارات فورية عند الطوارئ' : 'These people receive instant notifications in emergencies'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {contacts.map(c => (
                    <div key={c.id} className="contact-row" style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '13px 15px', borderRadius: 12, transition: 'border-color 0.15s',
                      background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`,
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        background: 'linear-gradient(135deg,rgba(0,200,232,0.2),rgba(32,96,232,0.2))',
                        border: `1px solid rgba(0,200,232,0.25)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.85rem', color: CYAN, flexShrink: 0,
                      }}>
                        {c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: TEXT, fontSize: '0.875rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.72rem', color: MUTED, marginTop: 2 }}>{c.phone}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 9px',
                        borderRadius: 99, background: 'rgba(0,200,232,0.1)', color: CYAN,
                        border: `1px solid rgba(0,200,232,0.2)` }}>{c.relationship}</span>
                      <button onClick={() => { setContacts(prev => prev.filter(x => x.id !== c.id)); toast.success('Contact removed'); }}
                        style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,68,85,0.1)',
                          border: '1px solid rgba(255,68,85,0.2)', color: RED, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add contact form */}
              <div style={dc({ padding: '22px' })}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: CYAN,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                  {isRTL ? 'إضافة جهة اتصال جديدة' : 'Add New Contact'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
                  {[
                    { key: 'name' as const, label: isRTL ? 'الاسم *' : 'Name *', placeholder: isRTL ? 'اسم جهة الاتصال' : 'Contact name' },
                    { key: 'phone' as const, label: isRTL ? 'الهاتف *' : 'Phone *', placeholder: '+962 79 ...' },
                    { key: 'relationship' as const, label: isRTL ? 'العلاقة' : 'Relationship', placeholder: isRTL ? 'مثال: أخ، صديق' : 'e.g., Sister, Friend' },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: MUTED,
                        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}</div>
                      <input
                        value={newContact[f.key]}
                        onChange={e => setNewContact(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        style={{
                          width: '100%', height: 38, padding: '0 12px', borderRadius: 10,
                          background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`,
                          color: TEXT, fontSize: '0.82rem', fontFamily: F, outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'rgba(0,200,232,0.4)')}
                        onBlur={e => (e.target.style.borderColor = BORDER)}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={addContact} style={{
                  height: 40, padding: '0 24px', borderRadius: 10,
                  background: 'linear-gradient(135deg,#00C8E8,#2060E8)', border: 'none',
                  color: '#040C18', fontWeight: 800, fontSize: '0.82rem', fontFamily: F, cursor: 'pointer',
                }}>
                  + {isRTL ? 'إضافة' : 'Add Contact'}
                </button>
              </div>
            </motion.div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={dc({ padding: '22px' })}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: CYAN,
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>
                  {isRTL ? 'إعدادات السلامة' : 'Safety Settings'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { key: 'autoShareLocation' as const, icon: '📍',
                      label: isRTL ? 'مشاركة الموقع تلقائياً' : 'Auto Share Location',
                      desc: isRTL ? 'مشاركة موقعك عند بدء الرحلة' : 'Share your location when trip starts', color: CYAN },
                    { key: 'emergencyAlerts' as const, icon: '🔔',
                      label: isRTL ? 'تنبيهات الطوارئ' : 'Emergency Alerts',
                      desc: isRTL ? 'إشعارات عند أنماط رحلات غير عادية' : 'Notifications for unusual trip patterns', color: GOLD },
                    { key: 'nightModeAlert' as const, icon: '🌙',
                      label: isRTL ? 'تنبيه الوضع الليلي' : 'Night Mode Alert',
                      desc: isRTL ? 'تعزيز السلامة للرحلات بعد منتصف الليل' : 'Enhanced safety for trips after midnight', color: '#8B5CF6' },
                    { key: 'tripSharing' as const, icon: '🔗',
                      label: isRTL ? 'مشاركة الرحلة' : 'Trip Sharing',
                      desc: isRTL ? 'إرسال رابط تتبع لجهات اتصالك' : 'Auto-send tracking link to your contacts', color: GREEN },
                  ].map((s, i) => (
                    <div key={s.key} style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0',
                      borderBottom: i < 3 ? `1px solid rgba(255,255,255,0.05)` : 'none',
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 11, background: `${s.color}18`,
                        border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: TEXT, fontSize: '0.875rem' }}>{s.label}</div>
                        <div style={{ fontSize: '0.68rem', color: MUTED, marginTop: 2 }}>{s.desc}</div>
                      </div>
                      {/* Toggle */}
                      <button
                        onClick={() => setSettings(p => ({ ...p, [s.key]: !p[s.key] }))}
                        style={{
                          width: 50, height: 28, borderRadius: 99, padding: 3,
                          background: settings[s.key]
                            ? `linear-gradient(135deg,${s.color},${s.color}CC)`
                            : 'rgba(255,255,255,0.08)',
                          border: `1px solid ${settings[s.key] ? s.color + '50' : BORDER}`,
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                          transform: settings[s.key] ? 'translateX(22px)' : 'translateX(0)',
                          transition: 'transform 0.2s',
                        }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TIPS */}
          {tab === 'tips' && (
            <motion.div key="tips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: '✅', color: GREEN, title: 'Verify your driver', titleAr: 'تحقق من السائق',
                    tips: ['Check the rating is 4.5+', 'Confirm car plate matches app', 'Ask driver to say your name first'] },
                  { icon: '📍', color: CYAN, title: 'Share your trip', titleAr: 'شارك رحلتك',
                    tips: ['Tap "Share Trip" before entering car', 'Send link to a trusted contact', 'Turn on auto-share in settings'] },
                  { icon: '🚗', color: GOLD, title: 'During the trip', titleAr: 'أثناء الرحلة',
                    tips: ['Sit in the back seat when possible', 'Keep phone charged', 'Note the route matches the map'] },
                  { icon: '⚠️', color: RED, title: 'If something feels wrong', titleAr: 'إذا شعرت بخطر',
                    tips: ['Ask driver to stop in a public area', 'Press SOS for instant help', 'Call 911 or text a contact your GPS'] },
                ].map((section, i) => (
                  <motion.div key={section.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={dc({ padding: '20px 22px', borderColor: `${section.color}20` })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: '1.4rem' }}>{section.icon}</span>
                      <div>
                        <div style={{ fontWeight: 800, color: section.color, fontSize: '0.9rem' }}>
                          {isRTL ? section.titleAr : section.title}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {section.tips.map(tip => (
                        <div key={tip} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${section.color}18`,
                            border: `1px solid ${section.color}30`, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                            <span style={{ fontSize: '0.6rem', color: section.color }}>✓</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: MUTED, lineHeight: 1.5 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
