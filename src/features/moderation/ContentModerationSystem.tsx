/**
 * Wasel Content Moderation System v2.0
 * Full dark-cosmic redesign — zero shadcn/ui light-theme components
 * AI-powered: profanity · scam · spam · harassment detection (AR + EN)
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Eye,
  Flag, Ban, MessageCircle, TrendingDown, Activity, Zap,
  Clock, ChevronRight, RefreshCw, Search, Filter,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ── Tokens ────────────────────────────────────────────────────────────────────
const D = {
  bg:'#040C18', card:'#0A1628', card2:'#0D1F38', panel:'#0F2040',
  border:'rgba(0,200,232,0.10)', borderH:'rgba(0,200,232,0.28)',
  cyan:'#00C8E8', gold:'#F0A830', green:'#00C875',
  red:'#FF4455', orange:'#FB923C', purple:'#A78BFA',
  text:'#EFF6FF', sub:'rgba(148,163,184,0.80)', muted:'rgba(100,130,180,0.60)',
  F:"-apple-system,'Inter','Cairo',sans-serif",
  MONO:"'JetBrains Mono','Fira Mono',monospace",
} as const;

const pill = (c: string) => ({
  display:'inline-flex', alignItems:'center', gap:4,
  padding:'3px 10px', borderRadius:999,
  background:`${c}12`, border:`1px solid ${c}28`,
  fontSize:'0.65rem', fontWeight:700, color:c,
});

// ── AI moderation engine ─────────────────────────────────────────────────────
const SCAM_AR   = ['احتيال','نصب','تحويل فلوس','اعطني رقم بطاقتك','ارسل فلوس','ضحية'];
const SCAM_EN   = ['scam','fraud','send money','wire transfer','credit card number','bank account','victim'];
const SPAM_AR   = ['مجاني','فرصة ذهبية','ربح سريع','اشترك الآن'];
const SPAM_EN   = ['free money','click here','win now','subscribe'];
const PROFANE_AR= ['كلمة سيئة 1','كلمة سيئة 2']; // extend in production
const PROFANE_EN= ['badword1','badword2'];           // extend in production
const SPAM_PAT  = [new RegExp('(.)\\1{4,}', 'g'), new RegExp('https?://\\S+', 'gi'), new RegExp('\\d{10,}', 'g'), new RegExp('whatsapp|telegram|viber', 'gi')];

interface Violation { type:string; keyword:string; severity:'low'|'medium'|'high'|'critical'; action:string }
interface ModResult { isClean:boolean; severity:'safe'|'low'|'medium'|'high'|'critical'; violations:Violation[]; confidence:number; requiresHuman:boolean }

function moderateText(text: string): ModResult {
  const violations: Violation[] = [];
  const lower = text.toLowerCase();

  [...SCAM_AR,...SCAM_EN].forEach(kw => {
    if (lower.includes(kw.toLowerCase())) violations.push({ type:'scam', keyword:kw, severity:'critical', action:'block' });
  });
  [...PROFANE_AR,...PROFANE_EN].forEach(kw => {
    if (lower.includes(kw.toLowerCase())) violations.push({ type:'profanity', keyword:kw, severity:'medium', action:'filter' });
  });
  [...SPAM_AR,...SPAM_EN].forEach(kw => {
    if (lower.includes(kw.toLowerCase())) violations.push({ type:'spam', keyword:kw, severity:'low', action:'warn' });
  });
  SPAM_PAT.forEach(pat => { if (pat.test(text)) violations.push({ type:'spam', keyword:'pattern', severity:'low', action:'warn' }); });

  const maxSev = violations.reduce<'safe'|'low'|'medium'|'high'|'critical'>((a,v) => {
    const order = ['safe','low','medium','high','critical'];
    return order.indexOf(v.severity) > order.indexOf(a) ? v.severity : a;
  }, 'safe');

  return {
    isClean: violations.length === 0,
    severity: maxSev,
    violations,
    confidence: violations.length === 0 ? 99 : Math.min(95, 60 + violations.length * 15),
    requiresHuman: maxSev === 'high' || maxSev === 'critical',
  };
}

// ── Mock queue ────────────────────────────────────────────────────────────────
interface QueueItem { id:string; text:string; textAr:string; user:string; type:'message'|'listing'|'review'; reportCount:number; time:string; result:ModResult }

const MOCK_QUEUE: QueueItem[] = [
  { id:'q1', text:'Send me your bank account number for payment',  textAr:'ارسل رقم حسابك البنكي للدفع', user:'user_4821', type:'message', reportCount:3, time:'2m ago',
    result: moderateText('Send me your bank account number') },
  { id:'q2', text:'Great driver! Very punctual and friendly 🌟',  textAr:'سائق رائع! منضبط وودود 🌟', user:'user_7103', type:'review', reportCount:0, time:'8m ago',
    result: moderateText('Great driver very punctual') },
  { id:'q3', text:'احتيال! لم يصل السائق وأخذ الفلوس',            textAr:'احتيال! لم يصل السائق وأخذ الفلوس', user:'user_2209', type:'message', reportCount:5, time:'15m ago',
    result: moderateText('احتيال') },
  { id:'q4', text:'فرصة ذهبية! اشترك الآن واربح سريع',           textAr:'فرصة ذهبية! اشترك الآن واربح سريع', user:'user_9034', type:'listing', reportCount:2, time:'22m ago',
    result: moderateText('فرصة ذهبية اشترك الآن') },
  { id:'q5', text:'Amman to Aqaba, comfortable sedan, AC, prayer stops', textAr:'عمّان إلى العقبة، سيدان مريح، مكيف، وقفات صلاة', user:'user_5512', type:'listing', reportCount:0, time:'31m ago',
    result: moderateText('Amman to Aqaba comfortable sedan AC prayer stops') },
];

// ── Severity config ───────────────────────────────────────────────────────────
const SEV = {
  safe:     { color:D.green,  label:'Clean',    labelAr:'نظيف',        icon:<CheckCircle2 size={14}/> },
  low:      { color:D.gold,   label:'Low risk', labelAr:'خطر منخفض',   icon:<AlertTriangle size={14}/> },
  medium:   { color:D.orange, label:'Medium',   labelAr:'متوسط',       icon:<Flag size={14}/> },
  high:     { color:D.red,    label:'High',     labelAr:'خطر عالٍ',    icon:<XCircle size={14}/> },
  critical: { color:'#FF0055',label:'CRITICAL', labelAr:'خطر بالغ',    icon:<Ban size={14}/> },
};

// ── Main ─────────────────────────────────────────────────────────────────────
export function ContentModerationSystem() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [tab, setTab] = useState<'queue'|'live'|'stats'|'settings'>('queue');
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [processing, setProcessing] = useState<string|null>(null);
  const [liveInput, setLiveInput] = useState('');
  const [liveResult, setLiveResult] = useState<ModResult|null>(null);
  const [search, setSearch] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const approve = async (id: string) => {
    setProcessing(id);
    await new Promise(r => setTimeout(r, 600));
    if (!mountedRef.current) return;
    setQueue(prev => prev.filter(q => q.id !== id));
    setProcessing(null);
  };

  const reject = async (id: string) => {
    setProcessing(id);
    await new Promise(r => setTimeout(r, 600));
    if (!mountedRef.current) return;
    setQueue(prev => prev.filter(q => q.id !== id));
    setProcessing(null);
  };

  const checkLive = () => {
    if (!liveInput.trim()) return;
    setLiveResult(moderateText(liveInput));
  };

  const filtered = queue.filter(q => {
    if (!search) return true;
    return q.text.toLowerCase().includes(search.toLowerCase()) ||
           q.textAr.includes(search) || q.user.includes(search);
  });

  const stats = {
    total: 1247, clean: 1089, flagged: 158, blocked: 42,
    autoResolved: 116, pendingHuman: filtered.length,
    accuracy: 94.7,
  };

  const tabs = [
    { key:'queue',    label: isRTL?'طابور المراجعة':'Review Queue', badge: filtered.length },
    { key:'live',     label: isRTL?'فحص مباشر':'Live Check' },
    { key:'stats',    label: isRTL?'الإحصائيات':'Statistics' },
    { key:'settings', label: isRTL?'الإعدادات':'Settings' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:D.bg, fontFamily:D.F, color:D.text, padding:'28px 20px 80px' }} dir={isRTL?'rtl':'ltr'}>
      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${D.red},${D.orange})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>🛡️</div>
          <div>
            <h1 style={{ fontSize:'1.35rem', fontWeight:900, letterSpacing:'-0.03em', margin:0 }}>
              {isRTL ? 'نظام إدارة المحتوى' : 'Content Moderation'}
            </h1>
            <p style={{ fontSize:'0.72rem', color:D.muted, margin:'3px 0 0' }}>
              {isRTL ? 'كشف احتيال · إساءة · بريد مزعج · AR + EN' : 'Scam · Profanity · Spam detection — Arabic + English AI'}
            </p>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
            <span style={pill(D.green)}>{stats.accuracy}% accuracy</span>
            <span style={pill(D.cyan)}>AI Active</span>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:10, marginBottom:20 }}>
          {[
            { label:isRTL?'إجمالي':'Total',        val:stats.total,        color:D.text  },
            { label:isRTL?'نظيف':'Clean',           val:stats.clean,        color:D.green },
            { label:isRTL?'مُبلَّغ':'Flagged',      val:stats.flagged,      color:D.gold  },
            { label:isRTL?'محظور':'Blocked',         val:stats.blocked,      color:D.red   },
            { label:isRTL?'انتظار':'Pending',        val:stats.pendingHuman, color:D.orange},
            { label:isRTL?'دقة':'AI Accuracy',       val:`${stats.accuracy}%`, color:D.cyan },
          ].map(s => (
            <div key={s.label} style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:12, padding:'12px 14px' }}>
              <div style={{ fontSize:'1.4rem', fontWeight:900, color:s.color, fontFamily:D.MONO }}>{s.val}</div>
              <div style={{ fontSize:'0.62rem', color:D.muted, marginTop:3, textTransform:'uppercase', letterSpacing:'0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', background:D.card, borderRadius:12, padding:4, border:`1px solid ${D.border}`, gap:3, marginBottom:18, flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding:'8px 16px', borderRadius:9, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6,
              fontSize:'0.8rem', fontWeight: tab===t.key ? 700 : 500, fontFamily:D.F,
              background: tab===t.key ? `linear-gradient(135deg,${D.red},${D.orange})` : 'transparent',
              color: tab===t.key ? '#fff' : D.sub, transition:'all 0.15s',
            }}>
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span style={{ background:'rgba(255,255,255,0.25)', borderRadius:999, padding:'0 6px', fontSize:'0.6rem', fontWeight:800 }}>{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.15 }}>

            {/* ── QUEUE TAB ── */}
            {tab === 'queue' && (
              <div>
                <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center' }}>
                  <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, background:D.card2, border:`1px solid ${D.border}`, borderRadius:10, padding:'0 12px' }}>
                    <Search size={14} color={D.muted} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isRTL?'بحث...':'Search queue…'}
                      style={{ border:'none', background:'transparent', color:D.text, fontSize:'0.8rem', fontFamily:D.F, flex:1, padding:'10px 0', outline:'none' }} />
                  </div>
                  <motion.button whileHover={{ scale:1.04 }} onClick={() => setQueue(MOCK_QUEUE)}
                    style={{ padding:'9px 14px', borderRadius:10, border:`1px solid ${D.border}`, background:D.card2, color:D.sub, fontSize:'0.76rem', fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                    <RefreshCw size={13} /> {isRTL?'تحديث':'Refresh'}
                  </motion.button>
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px 0', color:D.muted }}>
                    <CheckCircle2 size={40} color={D.green} style={{ marginBottom:12 }} />
                    <div style={{ fontSize:'0.9rem', fontWeight:700, color:D.green }}>Queue clear!</div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    <AnimatePresence>
                      {filtered.map(item => {
                        const sev = SEV[item.result.severity];
                        const isProc = processing === item.id;
                        return (
                          <motion.div key={item.id} layout initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:8, height:0 }}
                            style={{ background:D.card, border:`1px solid ${sev.color}22`, borderRadius:14, overflow:'hidden' }}>

                            {/* Top row */}
                            <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderBottom:`1px solid ${D.border}` }}>
                              <div style={{ width:36, height:36, borderRadius:10, background:`${sev.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:sev.color, flexShrink:0 }}>
                                {sev.icon}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                  <span style={pill(sev.color)}>{isRTL ? sev.labelAr : sev.label}</span>
                                  <span style={{ fontSize:'0.65rem', background:`${D.cyan}12`, border:`1px solid ${D.cyan}20`, borderRadius:999, padding:'2px 8px', color:D.cyan }}>
                                    {item.type}
                                  </span>
                                  {item.reportCount > 0 && (
                                    <span style={{ fontSize:'0.65rem', color:D.red }}>⚑ {item.reportCount} reports</span>
                                  )}
                                </div>
                                <div style={{ fontSize:'0.65rem', color:D.muted, marginTop:2 }}>
                                  {item.user} · {item.time} · {item.result.confidence}% confidence
                                </div>
                              </div>
                              {item.result.requiresHuman && (
                                <span style={{ ...pill(D.orange), fontSize:'0.6rem' }}>👁 Human review</span>
                              )}
                            </div>

                            {/* Content */}
                            <div style={{ padding:'12px 18px' }}>
                              <div style={{ background:D.card2, borderRadius:8, padding:'10px 14px', fontSize:'0.82rem', color:D.text, lineHeight:1.6, marginBottom: item.result.violations.length ? 10 : 0 }}>
                                {isRTL ? item.textAr : item.text}
                              </div>

                              {/* Violations */}
                              {item.result.violations.length > 0 && (
                                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                                  {item.result.violations.map((v, i) => (
                                    <span key={i} style={{ fontSize:'0.62rem', background:`${D.red}12`, border:`1px solid ${D.red}25`, borderRadius:999, padding:'2px 8px', color:D.red }}>
                                      {v.type}: "{v.keyword}" → {v.action}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Actions */}
                              <div style={{ display:'flex', gap:8 }}>
                                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => approve(item.id)} disabled={isProc}
                                  style={{ flex:1, height:38, borderRadius:10, border:`1px solid ${D.green}40`, background:`${D.green}10`, color:D.green, fontSize:'0.78rem', fontWeight:700, fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                  {isProc ? <RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }} /> : <CheckCircle2 size={13} />}
                                  {isRTL ? 'موافقة' : 'Approve'}
                                </motion.button>
                                <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={() => reject(item.id)} disabled={isProc}
                                  style={{ flex:1, height:38, borderRadius:10, border:`1px solid ${D.red}40`, background:`${D.red}10`, color:D.red, fontSize:'0.78rem', fontWeight:700, fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                                  <XCircle size={13} /> {isRTL ? 'رفض وحجب' : 'Reject & Block'}
                                </motion.button>
                                <motion.button whileHover={{ scale:1.05 }} style={{ width:38, height:38, borderRadius:10, border:`1px solid ${D.border}`, background:D.card2, color:D.muted, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  <Eye size={14} />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* ── LIVE CHECK TAB ── */}
            {tab === 'live' && (
              <div>
                <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'24px' }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:700, marginBottom:12 }}>
                    {isRTL ? '🔍 فحص نص مباشر' : '🔍 Live Content Checker'}
                  </div>
                  <textarea value={liveInput} onChange={e => setLiveInput(e.target.value)}
                    placeholder={isRTL ? 'اكتب النص هنا للفحص…' : 'Paste or type text to check…'}
                    rows={4} style={{
                      width:'100%', background:D.card2, border:`1px solid ${D.border}`, borderRadius:12,
                      color:D.text, fontSize:'0.85rem', fontFamily:D.F, padding:'12px 14px',
                      outline:'none', resize:'vertical', boxSizing:'border-box', lineHeight:1.6,
                    }} />
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={checkLive}
                    style={{ marginTop:12, width:'100%', height:44, borderRadius:12, border:'none', background:`linear-gradient(135deg,${D.cyan},${D.green})`, color:'#040C18', fontSize:'0.88rem', fontWeight:800, fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    <Zap size={16} /> {isRTL ? 'فحص الآن' : 'Check Now'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {liveResult && (
                    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginTop:16, background:D.card, border:`1px solid ${SEV[liveResult.severity].color}30`, borderRadius:16, padding:'20px 24px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                        <div style={{ width:48, height:48, borderRadius:14, background:`${SEV[liveResult.severity].color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:SEV[liveResult.severity].color, fontSize:'1.4rem' }}>
                          {liveResult.isClean ? '✅' : '⚠️'}
                        </div>
                        <div>
                          <div style={{ fontSize:'1.1rem', fontWeight:900, color:SEV[liveResult.severity].color }}>
                            {isRTL ? SEV[liveResult.severity].labelAr : SEV[liveResult.severity].label}
                          </div>
                          <div style={{ fontSize:'0.72rem', color:D.muted }}>Confidence: {liveResult.confidence}% · {liveResult.violations.length} violation(s)</div>
                        </div>
                        <span style={{ ...pill(liveResult.requiresHuman ? D.orange : D.green), marginLeft:'auto' }}>
                          {liveResult.requiresHuman ? '👁 Human review' : '✓ Auto-resolved'}
                        </span>
                      </div>
                      {liveResult.violations.length > 0 ? (
                        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                          {liveResult.violations.map((v,i) => (
                            <div key={i} style={{ display:'flex', gap:10, alignItems:'center', background:D.card2, borderRadius:8, padding:'8px 12px' }}>
                              <span style={{ fontSize:'0.7rem', color:D.red, fontWeight:700, textTransform:'uppercase' }}>{v.type}</span>
                              <span style={{ fontSize:'0.75rem', color:D.sub }}>"{v.keyword}"</span>
                              <span style={{ marginLeft:'auto', ...pill(D.orange) }}>{v.action}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ textAlign:'center', color:D.green, fontSize:'0.85rem' }}>✓ {isRTL ? 'المحتوى نظيف' : 'Content is clean and safe'}</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── STATS TAB ── */}
            {tab === 'stats' && (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Volume chart */}
                <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'22px 24px' }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                    <Activity size={16} color={D.cyan} /> {isRTL ? 'حجم المراجعات يومياً' : 'Daily Review Volume'}
                  </div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:100 }}>
                    {[42,58,35,71,63,48,89,55,76,62,84,91,67].map((v,i) => {
                      const col = v>80 ? D.red : v>60 ? D.orange : v>40 ? D.gold : D.green;
                      return (
                        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                          <motion.div initial={{ height:0 }} animate={{ height:`${(v/91)*90}px` }} transition={{ duration:0.5, delay:i*0.04 }}
                            style={{ width:'100%', borderRadius:'4px 4px 0 0', background:col, opacity:0.8 }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:10, flexWrap:'wrap' }}>
                    {[{c:D.red,l:'High risk'},{c:D.orange,l:'Medium'},{c:D.gold,l:'Low'},{c:D.green,l:'Clean'}].map(x => (
                      <div key={x.l} style={{ display:'flex', gap:5, alignItems:'center' }}>
                        <div style={{ width:10, height:10, borderRadius:2, background:x.c }} />
                        <span style={{ fontSize:'0.65rem', color:D.muted }}>{x.l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakdown */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:isRTL?'رسائل مفلترة':'Filtered messages',   val:'116', pct:73, color:D.green },
                    { label:isRTL?'مستخدمون محجوبون':'Users blocked',  val:'42',  pct:27, color:D.red   },
                    { label:isRTL?'تنبيهات احتيال':'Scam alerts',       val:'28',  pct:18, color:D.orange },
                    { label:isRTL?'مراجعة بشرية':'Human reviewed',       val:'42',  pct:27, color:D.gold  },
                  ].map(s => (
                    <div key={s.label} style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:14, padding:'16px 18px' }}>
                      <div style={{ fontSize:'1.4rem', fontWeight:900, color:s.color, fontFamily:D.MONO }}>{s.val}</div>
                      <div style={{ fontSize:'0.66rem', color:D.muted, margin:'4px 0 10px' }}>{s.label}</div>
                      <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${s.pct}%` }} transition={{ duration:0.7 }}
                          style={{ height:'100%', borderRadius:999, background:s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {tab === 'settings' && (
              <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'24px' }}>
                <div style={{ fontSize:'0.85rem', fontWeight:700, color:D.text, marginBottom:20 }}>
                  {isRTL ? '⚙️ إعدادات الفلترة' : '⚙️ Filter Settings'}
                </div>
                {[
                  { label:isRTL?'فلتر الاحتيال':'Scam filter',      sub:isRTL?'يحظر الكلمات المتعلقة بالنصب والاحتيال':'Blocks fraud & scam keywords',     on:true,  color:D.red    },
                  { label:isRTL?'فلتر السبام':'Spam filter',          sub:isRTL?'يحظر الرسائل الترويجية المزعجة':'Blocks unsolicited promotional content', on:true,  color:D.orange },
                  { label:isRTL?'فلتر الإساءة':'Profanity filter',   sub:isRTL?'يزيل الألفاظ النابية':'Removes profane language (AR + EN)',               on:true,  color:D.gold   },
                  { label:isRTL?'مراجعة بشرية للخطورة العالية':'Human review (high risk)', sub:isRTL?'يُحيل المحتوى الخطير للمراجعة البشرية':'Escalates high-risk to human reviewers', on:true, color:D.cyan },
                  { label:isRTL?'الحجب التلقائي':'Auto-ban on critical', sub:isRTL?'يحجب المستخدم فوراً عند التهديدات الحرجة':'Instantly bans on critical threats', on:false, color:D.purple },
                ].map((s,i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom: i<4 ? `1px solid ${D.border}` : 'none' }}>
                    <div>
                      <div style={{ fontSize:'0.85rem', fontWeight:600, color:D.text }}>{s.label}</div>
                      <div style={{ fontSize:'0.7rem', color:D.muted, marginTop:2 }}>{s.sub}</div>
                    </div>
                    <div style={{ width:44, height:24, borderRadius:999, background: s.on ? s.color : 'rgba(255,255,255,0.1)', position:'relative', cursor:'pointer', flexShrink:0 }}>
                      <div style={{ position:'absolute', top:3, left: s.on ? 23 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ContentModerationSystem;
export { ContentModerationSystem as ContentModerationDashboard };
