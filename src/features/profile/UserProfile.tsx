/**
 * Wasel User Profile v3.0
 * Full dark cosmic — zero shadcn/ui light-theme components
 * Live trust score · Edit mode · Reviews · Stats · Verification
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star, Shield, CheckCircle2, Edit2, Save, X,
  Camera, Award, TrendingUp, Car, Package, MessageCircle,
  Phone, Mail, Calendar, MapPin, ChevronRight, Crown, Zap,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocalAuth } from '../../contexts/LocalAuth';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// ── Tokens ────────────────────────────────────────────────────────────────────
const D = {
  bg:'#040C18', card:'#0A1628', card2:'#0D1F38', panel:'#0F2040',
  border:'rgba(0,200,232,0.10)', borderH:'rgba(0,200,232,0.28)',
  cyan:'#00C8E8', gold:'#F0A830', green:'#00C875',
  red:'#FF4455', purple:'#A78BFA', orange:'#FB923C',
  text:'#EFF6FF', sub:'rgba(148,163,184,0.80)', muted:'rgba(100,130,180,0.60)',
  F:"-apple-system,'Inter','Cairo',sans-serif",
  MONO:"'JetBrains Mono','Fira Mono',monospace",
} as const;
const R = { sm:6, md:10, lg:14, xl:18, full:9999 } as const;

// ── Types ─────────────────────────────────────────────────────────────────────
interface TrustBreakdown { identity:number; rating:number; completion:number; punctuality:number; standing:number }

interface MockProfile {
  name: string; nameAr: string; email: string; phone: string;
  joinedYear: number; city: string; cityAr: string;
  trips: number; rating: number; reviews: number;
  balance: number; savedVsTaxi: number;
  trustScore: number; trust: TrustBreakdown;
  verified: { email:boolean; phone:boolean; id:boolean; face:boolean };
  role: 'passenger'|'driver'|'both';
  bio: string; bioAr: string;
}

// ── Mock data (replaced by live API if available) ─────────────────────────────
const DEFAULT_PROFILE: MockProfile = {
  name:'Ahmad Al-Rashid', nameAr:'أحمد الراشد',
  email:'ahmad@example.com', phone:'+962 79 123 4567',
  joinedYear:2024, city:'Amman', cityAr:'عمّان',
  trips:47, rating:4.9, reviews:38,
  balance:23.5, savedVsTaxi:142,
  trustScore:87,
  trust:{ identity:22, rating:24, completion:18, punctuality:13, standing:10 },
  verified:{ email:true, phone:true, id:true, face:false },
  role:'both',
  bio:'Frequent traveler on the Amman–Aqaba corridor. Love meeting new people and making journeys comfortable.',
  bioAr:'مسافر متكرر على خط عمّان–العقبة. أحب الاستمتاع بالرحلات ومقابلة أشخاص جدد.',
};

const MOCK_REVIEWS = [
  { id:'r1', author:'Sarah K.',     authorAr:'سارة ك.',    rating:5, text:'Very punctual and friendly driver. Highly recommended!', textAr:'سائق منضبط وودود جداً. أنصح به بشدة!', type:'driver', date:'Mar 2026' },
  { id:'r2', author:'Omar H.',      authorAr:'عمر ح.',     rating:5, text:'Clean car, comfortable ride, great conversation.',         textAr:'سيارة نظيفة، رحلة مريحة، حديث ممتع.', type:'driver', date:'Feb 2026' },
  { id:'r3', author:'Lina M.',      authorAr:'لينا م.',    rating:4, text:'Package arrived on time and in perfect condition.',         textAr:'وصل الطرد في الوقت المحدد وبحالة ممتازة.', type:'package', date:'Feb 2026' },
];

// ── Sub-components ────────────────────────────────────────────────────────────
function TrustGauge({ score }: { score:number }) {
  const size = 160;
  const r    = 66;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const offset = circ - (score / 100) * arc;
  const color  = score >= 80 ? D.green : score >= 60 ? D.cyan : score >= 40 ? D.gold : D.red;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block', margin:'0 auto' }}>
      <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${arc} ${circ - arc}`} strokeDashoffset={-(circ * 0.125)} transform={`rotate(135 80 80)`} />
      <circle cx={80} cy={80} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
        strokeDasharray={`${arc} ${circ - arc}`} strokeDashoffset={offset} transform={`rotate(135 80 80)`}
        style={{ filter:`drop-shadow(0 0 6px ${color}60)`, transition:'stroke-dashoffset 0.8s ease' }} />
      <text x={80} y={76} textAnchor="middle" fill="#fff" fontSize="26" fontWeight="900" fontFamily={D.MONO}>{score}</text>
      <text x={80} y={95} textAnchor="middle" fill={D.muted} fontSize="11">Trust Score</text>
    </svg>
  );
}

function StatCard({ label, labelAr, val, icon, color, isRTL }: { label:string; labelAr:string; val:string|number; icon:React.ReactNode; color:string; isRTL:boolean }) {
  return (
    <div style={{ background:D.card2, border:`1px solid ${D.border}`, borderRadius:14, padding:'16px 18px' }}>
      <div style={{ color, marginBottom:8 }}>{icon}</div>
      <div style={{ fontSize:'1.5rem', fontWeight:900, color, fontFamily:D.MONO }}>{val}</div>
      <div style={{ fontSize:'0.68rem', color:D.muted, marginTop:4 }}>{isRTL ? labelAr : label}</div>
    </div>
  );
}

function DarkField({ label, value, onChange, placeholder, multiline }:{
  label:string; value:string; onChange:(v:string)=>void; placeholder?:string; multiline?:boolean;
}) {
  const [focused, setFocused] = useState(false);
  const common = {
    width:'100%', background: focused ? D.panel : D.card2, color:D.text, fontSize:'0.875rem', fontFamily:D.F,
    border:`1.5px solid ${focused ? D.cyan : D.border}`, borderRadius:R.md, padding:'10px 12px', outline:'none',
    boxSizing:'border-box' as const, transition:'all 0.15s', resize:'vertical' as const,
  };
  return (
    <div>
      <label style={{ fontSize:'0.72rem', fontWeight:700, color:D.sub, display:'block', marginBottom:6 }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder={placeholder} rows={3} style={common} />
        : <input value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder={placeholder} style={common} />}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export function UserProfile() {
  const { language } = useLanguage();
  const { user: authUser } = useLocalAuth();
  const nav = useIframeSafeNavigate();
  const isRTL = language === 'ar';
  const mountedRef = useRef(true);

  const [profile, setProfile] = useState<MockProfile>(DEFAULT_PROFILE);
  const [tab, setTab] = useState<'overview'|'reviews'|'trust'|'settings'>('overview');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);

  // Populate from auth user if available
  useEffect(() => {
    if (authUser) {
      setProfile(p => ({ ...p, name: authUser.name, email: authUser.email, trips: authUser.trips, balance: authUser.balance, rating: authUser.rating }));
      setDraft(p => ({ ...p, name: authUser.name, email: authUser.email }));
    }
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, [authUser]);

  // Try live trust score
  useEffect(() => {
    if (!authUser) return;
    fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/trust-score/${authUser.id}`,
      { headers:{ Authorization:`Bearer ${publicAnonKey}` }, signal:AbortSignal.timeout(5000) })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data && mountedRef.current) setProfile(p => ({ ...p, trustScore: data.trustScore ?? p.trustScore })); })
      .catch(() => {/* use mock */});
  }, [authUser]);

  const saveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 700)); // simulated save
    if (!mountedRef.current) return;
    setProfile(draft);
    setEditing(false);
    setSaving(false);
  };

  const initials = profile.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const trustColor = profile.trustScore >= 80 ? D.green : profile.trustScore >= 60 ? D.cyan : D.gold;

  const tabs = [
    { key:'overview', label: isRTL?'نظرة عامة':'Overview'  },
    { key:'reviews',  label: isRTL?'التقييمات':'Reviews'   },
    { key:'trust',    label: isRTL?'الثقة':'Trust Score'    },
    { key:'settings', label: isRTL?'الإعدادات':'Settings'  },
  ];

  return (
    <div style={{ minHeight:'100vh', background:D.bg, fontFamily:D.F, color:D.text, padding:'28px 16px 80px' }} dir={isRTL?'rtl':'ltr'}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>

        {/* ── Profile hero ── */}
        <div style={{
          background:'linear-gradient(135deg,#0B1D45 0%,#162C6A 60%,#0A1628 100%)',
          borderRadius:20, padding:'32px 36px', marginBottom:20, border:`1px solid rgba(0,200,232,0.15)`,
          boxShadow:'0 8px 40px rgba(0,0,0,0.5)', position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,232,0.10),transparent 65%)', pointerEvents:'none' }} />

          <div style={{ display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap', position:'relative' }}>
            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{
                width:88, height:88, borderRadius:'50%',
                background:`linear-gradient(135deg,${D.cyan},#0060A0)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'2rem', fontWeight:900, color:'#fff',
                border:`3px solid ${trustColor}`, boxShadow:`0 0 20px ${trustColor}40`,
              }}>{initials}</div>
              <div style={{ position:'absolute', bottom:-2, right:-2, width:28, height:28, borderRadius:'50%', background:D.card, border:`2px solid ${trustColor}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <Camera size={14} color={trustColor} />
              </div>
              {profile.trustScore >= 85 && (
                <div style={{ position:'absolute', top:-4, right:-4, background:D.gold, borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem' }}>
                  <Crown size={12} color="#040C18" />
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <h1 style={{ fontSize:'1.5rem', fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>
                  {isRTL ? profile.nameAr : profile.name}
                </h1>
                {profile.verified.id && <span style={{ fontSize:'0.65rem', background:'rgba(0,200,117,0.15)', border:'1px solid rgba(0,200,117,0.30)', borderRadius:999, padding:'3px 9px', color:D.green, display:'flex', alignItems:'center', gap:4 }}><Shield size={10}/>Verified</span>}
                {profile.role === 'both' && <span style={{ fontSize:'0.65rem', background:'rgba(240,168,48,0.12)', border:'1px solid rgba(240,168,48,0.25)', borderRadius:999, padding:'3px 9px', color:D.gold }}>Driver + Passenger</span>}
              </div>

              <div style={{ display:'flex', gap:14, marginTop:8, flexWrap:'wrap' }}>
                <span style={{ fontSize:'0.75rem', color:D.sub, display:'flex', alignItems:'center', gap:4 }}>
                  <MapPin size={12} color={D.cyan} />{isRTL ? profile.cityAr : profile.city}
                </span>
                <span style={{ fontSize:'0.75rem', color:D.sub, display:'flex', alignItems:'center', gap:4 }}>
                  <Calendar size={12} color={D.gold} />Joined {profile.joinedYear}
                </span>
                <span style={{ fontSize:'0.75rem', color:D.sub, display:'flex', alignItems:'center', gap:4 }}>
                  <Star size={12} color={D.gold} fill={D.gold} />{profile.rating.toFixed(1)} · {profile.reviews} reviews
                </span>
              </div>

              <p style={{ fontSize:'0.8rem', color:D.sub, marginTop:10, lineHeight:1.6, maxWidth:460 }}>
                {isRTL ? profile.bioAr : profile.bio}
              </p>
            </div>

            {/* Trust ring */}
            <div style={{ textAlign:'center', flexShrink:0 }}>
              <TrustGauge score={profile.trustScore} />
            </div>

            {/* Edit button */}
            <div style={{ position:'absolute', top:0, right:0 }}>
              {editing ? (
                <div style={{ display:'flex', gap:6 }}>
                  <motion.button whileHover={{ scale:1.05 }} onClick={saveProfile} disabled={saving}
                    style={{ padding:'7px 14px', borderRadius:R.md, border:'none', background:`linear-gradient(135deg,${D.green},#00A865)`, color:'#040C18', fontWeight:700, fontSize:'0.78rem', fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                    <Save size={13} /> {saving ? 'Saving…' : 'Save'}
                  </motion.button>
                  <button onClick={() => { setEditing(false); setDraft(profile); }} style={{ padding:'7px 12px', borderRadius:R.md, border:`1px solid ${D.border}`, background:'rgba(255,255,255,0.05)', color:D.sub, cursor:'pointer' }}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <motion.button whileHover={{ scale:1.05 }} onClick={() => setEditing(true)}
                  style={{ padding:'7px 14px', borderRadius:R.md, border:`1px solid rgba(0,200,232,0.25)`, background:'rgba(0,200,232,0.08)', color:D.cyan, fontWeight:700, fontSize:'0.78rem', fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}>
                  <Edit2 size={13} /> {isRTL ? 'تعديل' : 'Edit'}
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:10, marginBottom:20 }}>
          <StatCard label="Trips" labelAr="رحلات" val={profile.trips} icon={<Car size={18}/>} color={D.cyan}  isRTL={isRTL} />
          <StatCard label="Rating" labelAr="التقييم" val={profile.rating.toFixed(1)+'⭐'} icon={<Star size={18}/>} color={D.gold}  isRTL={isRTL} />
          <StatCard label="Balance" labelAr="الرصيد" val={`JOD ${profile.balance.toFixed(1)}`} icon={<Zap size={18}/>} color={D.green} isRTL={isRTL} />
          <StatCard label="Saved vs Taxi" labelAr="وفّرت" val={`JOD ${profile.savedVsTaxi}`} icon={<TrendingUp size={18}/>} color={D.purple} isRTL={isRTL} />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display:'flex', background:D.card, borderRadius:12, padding:4, border:`1px solid ${D.border}`, gap:3, marginBottom:18, flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding:'8px 18px', borderRadius:9, border:'none', cursor:'pointer',
              fontSize:'0.8rem', fontWeight: tab===t.key ? 700 : 500, fontFamily:D.F,
              background: tab===t.key ? `linear-gradient(135deg,${D.cyan},#0095B8)` : 'transparent',
              color: tab===t.key ? '#040C18' : D.sub, transition:'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.15 }}>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Contact */}
                <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'20px 24px' }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:D.cyan, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                    {isRTL ? 'معلومات التواصل' : 'Contact Info'}
                  </div>
                  {editing ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <DarkField label="Full Name" value={draft.name} onChange={v => setDraft(p=>({...p,name:v}))} placeholder="Your name" />
                      <DarkField label="Email" value={draft.email} onChange={v => setDraft(p=>({...p,email:v}))} placeholder="your@email.com" />
                <DarkField label="Phone (WhatsApp)" value={draft.phone} onChange={v => setDraft(p=>({...p,phone:v}))} placeholder="+962 79 123 4567" />
                      <DarkField label="Bio" value={draft.bio} onChange={v => setDraft(p=>({...p,bio:v}))} placeholder="Tell others about yourself…" multiline />
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      {[
                        { icon:<Mail size={15}/>,    val:profile.email,  label:'Email',    color:D.cyan  },
                        { icon:<Phone size={15}/>,   val:profile.phone,  label:'Phone',    color:D.green },
                        { icon:<MapPin size={15}/>,  val:isRTL?profile.cityAr:profile.city, label:'City', color:D.gold },
                      ].map(r => (
                        <div key={r.label} style={{ display:'flex', gap:12, alignItems:'center' }}>
                          <div style={{ width:34, height:34, borderRadius:10, background:`${r.color}12`, display:'flex', alignItems:'center', justifyContent:'center', color:r.color, flexShrink:0 }}>{r.icon}</div>
                          <span style={{ fontSize:'0.85rem', color:D.text }}>{r.val}</span>
                          {r.label === 'Email' && profile.verified.email && <CheckCircle2 size={14} color={D.green} />}
                          {r.label === 'Phone' && profile.verified.phone && <CheckCircle2 size={14} color={D.green} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification */}
                <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'20px 24px' }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:D.cyan, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                    {isRTL ? 'التحقق من الهوية' : 'Sanad Verification'}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { label:isRTL?'البريد الإلكتروني':'Email',    done:profile.verified.email, pts:10 },
                      { label:isRTL?'رقم الهاتف':'Phone number',    done:profile.verified.phone, pts:15 },
                      { label:isRTL?'هوية وطنية':'National ID',     done:profile.verified.id,    pts:25 },
                      { label:isRTL?'التحقق الوجهي':'Face scan',    done:profile.verified.face,  pts:20 },
                    ].map(v => (
                      <div key={v.label} style={{ background:D.card2, border:`1px solid ${v.done ? D.green+'30' : D.border}`, borderRadius:12, padding:'12px 14px', display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background: v.done ? `${D.green}15` : 'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {v.done ? <CheckCircle2 size={15} color={D.green}/> : <Shield size={15} color={D.muted}/>}
                        </div>
                        <div>
                          <div style={{ fontSize:'0.78rem', fontWeight:600, color:D.text }}>{v.label}</div>
                          <div style={{ fontSize:'0.62rem', color: v.done ? D.green : D.muted }}>+{v.pts} pts · {v.done ? (isRTL?'مكتمل':'Done') : (isRTL?'مطلوب':'Pending')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── REVIEWS ── */}
            {tab === 'reviews' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {/* Summary */}
                <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:24 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'2.8rem', fontWeight:900, color:D.gold, fontFamily:D.MONO, lineHeight:1 }}>{profile.rating.toFixed(1)}</div>
                    <div style={{ display:'flex', gap:2, justifyContent:'center', margin:'6px 0 3px' }}>
                      {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i<=Math.round(profile.rating)?D.gold:'transparent'} color={D.gold}/>)}
                    </div>
                    <div style={{ fontSize:'0.68rem', color:D.muted }}>{profile.reviews} reviews</div>
                  </div>
                  <div style={{ flex:1 }}>
                    {[5,4,3,2,1].map(star => {
                      const count = star===5?28:star===4?8:star===3?2:0;
                      return (
                        <div key={star} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:'0.68rem', color:D.muted, width:10 }}>{star}</span>
                          <Star size={10} fill={D.gold} color={D.gold}/>
                          <div style={{ flex:1, height:5, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                            <div style={{ width:`${(count/profile.reviews)*100}%`, height:'100%', borderRadius:999, background:D.gold }} />
                          </div>
                          <span style={{ fontSize:'0.65rem', color:D.muted, width:18 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {MOCK_REVIEWS.map(review => (
                  <motion.div key={review.id} initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:14, padding:'16px 20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${D.cyan},#0060A0)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:800, color:'#fff' }}>
                          {(isRTL?review.authorAr:review.author)[0]}
                        </div>
                        <div>
                          <div style={{ fontSize:'0.84rem', fontWeight:700, color:D.text }}>{isRTL?review.authorAr:review.author}</div>
                          <div style={{ fontSize:'0.65rem', color:D.muted }}>{review.date} · {review.type}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:1 }}>
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} fill={i<=review.rating?D.gold:'transparent'} color={D.gold}/>)}
                      </div>
                    </div>
                    <p style={{ fontSize:'0.82rem', color:D.sub, margin:0, lineHeight:1.6 }}>
                      {isRTL ? review.textAr : review.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── TRUST ── */}
            {tab === 'trust' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ background:D.card, border:`1px solid rgba(0,200,232,0.18)`, borderRadius:16, padding:'24px', textAlign:'center' }}>
                  <TrustGauge score={profile.trustScore} />
                  <div style={{ fontSize:'0.9rem', fontWeight:700, color:trustColor, marginTop:8 }}>
                    {profile.trustScore>=85?'🏆 Trusted Member':profile.trustScore>=70?'⭐ Good Standing':'🔄 Building Trust'}
                  </div>
                  <p style={{ fontSize:'0.76rem', color:D.muted, marginTop:6 }}>
                    {isRTL ? 'درجة الثقة مبنية على التحقق والتقييمات ومعدل الإكمال' : 'Built from identity verification, ratings & trip completion'}
                  </p>
                </div>

                <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'20px 24px' }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:700, color:D.cyan, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16 }}>
                    {isRTL ? 'تفاصيل النقاط' : 'Score Breakdown'}
                  </div>
                  {[
                    { label:'Identity Verification', labelAr:'التحقق من الهوية', val:profile.trust.identity, max:25, color:D.cyan   },
                    { label:'Community Rating',       labelAr:'تقييم المجتمع',   val:profile.trust.rating,   max:25, color:D.gold   },
                    { label:'Trip Completion',        labelAr:'معدل الإكمال',    val:profile.trust.completion,max:20, color:D.green  },
                    { label:'Punctuality',            labelAr:'الالتزام بالوقت', val:profile.trust.punctuality,max:15, color:D.purple },
                    { label:'Community Standing',     labelAr:'سمعة المجتمع',   val:profile.trust.standing, max:15, color:D.orange  },
                  ].map(s => (
                    <div key={s.label} style={{ marginBottom:12 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:'0.78rem', color:D.text }}>{isRTL?s.labelAr:s.label}</span>
                        <span style={{ fontSize:'0.78rem', color:s.color, fontFamily:D.MONO }}>{s.val}/{s.max}</span>
                      </div>
                      <div style={{ height:6, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                        <motion.div initial={{ width:0 }} animate={{ width:`${(s.val/s.max)*100}%` }} transition={{ duration:0.7 }}
                          style={{ height:'100%', borderRadius:999, background:s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {tab === 'settings' && (
              <div style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:16, padding:'24px' }}>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.text, marginBottom:20 }}>
                  {isRTL ? '⚙️ إعدادات الحساب' : '⚙️ Account Settings'}
                </div>
                {[
                  { label:isRTL?'اشعارات الرحلات':'Trip notifications',        on:true,  color:D.cyan   },
                  { label:isRTL?'الوضع الليلي':'Dark mode (always on)',          on:true,  color:D.purple },
                  { label:isRTL?'عرض الرقم للسائق':'Show number to driver',      on:false, color:D.gold   },
                  { label:isRTL?'اشعارات الطرود':'Package update alerts',        on:true,  color:D.green  },
                  { label:isRTL?'وضع رمضان':'Ramadan mode',                      on:true,  color:D.orange },
                  { label:isRTL?'التفضيل الجنسي':'Gender preference matching',   on:true,  color:'#A78BFA'},
                ].map((s,i,arr) => (
                  <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom: i<arr.length-1 ? `1px solid ${D.border}` : 'none' }}>
                    <span style={{ fontSize:'0.84rem', color:D.text }}>{s.label}</span>
                    <div style={{ width:44, height:24, borderRadius:999, background: s.on ? s.color : 'rgba(255,255,255,0.1)', position:'relative', cursor:'pointer', flexShrink:0, transition:'background 0.2s' }}>
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

export default UserProfile;
