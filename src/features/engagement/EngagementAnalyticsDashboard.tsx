/**
 * Engagement Analytics Dashboard v2.0 — Enhanced with bar + funnel charts
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp, Users, MessageCircle, Eye, CheckCircle2,
  Clock, DollarSign, Target, Activity, Zap, Award, MapPin, ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const D = {
  bg:'#040C18', card:'#0A1628', card2:'#0F1E35',
  border:'rgba(0,200,232,0.10)', borderH:'rgba(0,200,232,0.28)',
  cyan:'#00C8E8', gold:'#F0A830', green:'#00C875',
  blue:'#2060E8', red:'#EF4444', sub:'#8299BE', muted:'#4D6A8A',
  F:"-apple-system,'Inter','Cairo',sans-serif",
};
const pill=(c:string)=>({ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 10px',borderRadius:'99px',background:`${c}15`,border:`1px solid ${c}30`,fontSize:'0.68rem',fontWeight:700,color:c });

// ── Inline mini bar chart ─────────────────────────────────────────────────────
function BarChart({ data, color = D.cyan, height = 80 }: { data:{label:string;val:number}[]; color?:string; height?:number }) {
  const max = Math.max(...data.map(d => d.val));
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:6, height }}>
      {data.map(d => (
        <div key={d.label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <span style={{ fontSize:'0.58rem', color:D.muted, fontWeight:700 }}>{d.val > 999 ? `${(d.val/1000).toFixed(1)}k` : d.val}</span>
          <motion.div initial={{ height:0 }} animate={{ height:`${(d.val/max)*(height-20)}px` }} transition={{ duration:0.6, delay:0.05 }}
            style={{ width:'100%', borderRadius:'4px 4px 0 0', background:`linear-gradient(180deg,${color},${color}50)` }} />
          <span style={{ fontSize:'0.58rem', color:D.muted }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Funnel chart ──────────────────────────────────────────────────────────────
function FunnelChart({ steps }: { steps:{label:string;labelAr:string;val:number;color:string}[] }) {
  const max = steps[0].val;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {steps.map((s,i) => (
        <div key={s.label}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:'0.73rem', color:D.sub }}>{s.label}</span>
            <span style={{ fontSize:'0.73rem', color:s.color, fontWeight:700 }}>{s.val.toLocaleString()} ({((s.val/max)*100).toFixed(0)}%)</span>
          </div>
          <div style={{ height:22, borderRadius:6, background:'rgba(255,255,255,0.04)', overflow:'hidden', position:'relative' }}>
            <motion.div initial={{ width:0 }} animate={{ width:`${(s.val/max)*100}%` }} transition={{ duration:0.7, delay:i*0.1 }}
              style={{ height:'100%', borderRadius:6, background:`linear-gradient(90deg,${s.color},${s.color}70)` }} />
          </div>
          {i < steps.length-1 && (
            <div style={{ textAlign:'center', fontSize:'0.62rem', color:D.muted, marginTop:2 }}>
              ↓ {(((steps[i+1].val/s.val)*100)).toFixed(1)}% conversion
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values:number[]; color:string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80; const h = 28;
  const pts = values.map((v,i) => `${(i/(values.length-1))*w},${h - ((v-min)/range)*h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display:'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

const MOCK = {
  totalTrips:1247, totalViews:15834, whatsappClicks:3842, totalMessages:2156, totalBookings:987,
  viewToWA:24.3, waToBk:25.7, msgToBk:45.8, conversion:6.2,
  avgResponse:8.5, msgPerTrip:3.2, repeatRate:38.5,
  dau:2847, weekGrowth:12.5, monthRevenue:28450,
  routes:[
    { route:'Amman → Aqaba',    views:3456, clicks:892, bk:234, rate:6.8, price:18, rev:4212 },
    { route:'Amman → Irbid',    views:2834, clicks:712, bk:189, rate:6.7, price:5,  rev:945  },
    { route:'Amman → Dead Sea', views:2156, clicks:534, bk:145, rate:6.7, price:8,  rev:1160 },
    { route:'Amman → Zarqa',    views:1845, clicks:423, bk:98,  rate:5.3, price:3,  rev:294  },
  ],
  drivers:[
    { name:'أحمد محمد', trips:45, bk:38, rt:3.2, rating:4.9, rev:1240, score:95 },
    { name:'فاطمة علي', trips:38, bk:32, rt:4.5, rating:4.8, rev:980,  score:92 },
    { name:'خالد حسن',  trips:42, bk:29, rt:5.8, rating:4.7, rev:890,  score:88 },
    { name:'سارة عبدالله', trips:35, bk:28, rt:4.1, rating:4.9, rev:850, score:91 },
  ],
  weekly:[
    { label:'Mon', views:1820, trips:142, rev:2100 },
    { label:'Tue', views:2100, trips:178, rev:2650 },
    { label:'Wed', views:1950, trips:155, rev:2280 },
    { label:'Thu', views:2400, trips:210, rev:3100 },
    { label:'Fri', views:3200, trips:287, rev:4200 },
    { label:'Sat', views:2800, trips:245, rev:3700 },
    { label:'Sun', views:1564, trips:130, rev:1920 },
  ],
};

function Stat({ icon, label, value, color=D.cyan, change, sparkData }: { icon:React.ReactNode; label:string; value:string; color?:string; change?:number; sparkData?:number[] }) {
  return (
    <div style={{ background:D.card, borderRadius:16, border:`1px solid ${D.border}`, padding:'18px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ color }}>{icon}</span>
        {change !== undefined && (
          <span style={{ ...pill(change>=0 ? D.green : D.red), fontSize:'0.65rem' }}>
            {change>=0 ? '↑' : '↓'}{Math.abs(change)}%
          </span>
        )}
      </div>
      <div style={{ color:'#fff', fontWeight:900, fontSize:'1.6rem', marginBottom:2 }}>{value}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div style={{ color:D.muted, fontSize:'0.72rem' }}>{label}</div>
        {sparkData && <Sparkline values={sparkData} color={color} />}
      </div>
    </div>
  );
}

export function EngagementAnalyticsDashboard() {
  const { language } = useLanguage();
  const [tab, setTab] = useState<'overview'|'routes'|'drivers'|'insights'>('overview');
  const [range, setRange] = useState<'day'|'week'|'month'>('week');
  const isRTL = language === 'ar';

  const tabs = [
    ['overview', isRTL ? 'نظرة عامة' : 'Overview'],
    ['routes',   isRTL ? 'المسارات'  : 'Route Performance'],
    ['drivers',  isRTL ? 'السائقون'  : 'Driver Performance'],
    ['insights', isRTL ? 'رؤى ذكية'  : 'Smart Insights'],
  ] as const;

  const funnelSteps = [
    { label:'Ride Views',      labelAr:'مشاهدات الرحلات',  val:MOCK.totalViews,     color:D.cyan  },
    { label:'WhatsApp Clicks', labelAr:'نقرات واتساب',      val:MOCK.whatsappClicks,  color:'#25D366'},
    { label:'Messages Sent',   labelAr:'رسائل مُرسَلة',     val:MOCK.totalMessages,   color:D.gold  },
    { label:'Bookings Made',   labelAr:'حجوزات مكتملة',     val:MOCK.totalBookings,   color:D.green },
  ];

  return (
    <div style={{ minHeight:'100vh', background:D.bg, padding:'32px 20px 80px', fontFamily:D.F }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:24 }}>
          <div style={{ background:'linear-gradient(135deg,#0B1D45,#162C6A)', borderRadius:20, padding:'28px 32px', border:`1px solid ${D.cyan}18`, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:6 }}>
              <Activity size={28} color={D.cyan} />
              <h1 style={{ color:'#fff', fontWeight:900, fontSize:'1.8rem', margin:0 }}>
                {isRTL ? 'لوحة تحليلات التفاعل' : 'Engagement Analytics'}
              </h1>
            </div>
            <p style={{ color:'rgba(255,255,255,0.45)', margin:0, fontSize:'0.85rem' }}>
              {isRTL ? 'رؤى مدعومة بالبيانات لتحسين الأداء' : 'Data-driven insights to improve platform performance'}
            </p>
          </div>
        </motion.div>

        {/* Tab + range */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', background:D.card, borderRadius:12, padding:4, border:`1px solid ${D.border}`, gap:3 }}>
            {tabs.map(([k, lbl]) => (
              <button key={k} onClick={() => setTab(k)} style={{
                padding:'8px 16px', borderRadius:8, border:'none', fontFamily:D.F,
                fontWeight: tab===k ? 700 : 500, fontSize:'0.82rem',
                background: tab===k ? `linear-gradient(135deg,${D.cyan},#0095B8)` : 'transparent',
                color: tab===k ? '#040C18' : D.muted, cursor:'pointer', transition:'all 0.15s',
              }}>{lbl}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {(['day','week','month'] as const).map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding:'6px 14px', borderRadius:'99px', border:`1px solid ${range===r ? D.cyan : D.border}`,
                background: range===r ? `${D.cyan}15` : D.card,
                color: range===r ? D.cyan : D.muted, fontFamily:D.F, fontWeight:700, fontSize:'0.78rem', cursor:'pointer',
              }}>{isRTL ? (r==='day'?'يوم':r==='week'?'أسبوع':'شهر') : (r==='day'?'Day':r==='week'?'Week':'Month')}</button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.15 }}>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (<>
              {/* Stat cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
                <Stat icon={<Activity size={20}/>} label={isRTL?'إجمالي الرحلات':'Total Trips'} value={MOCK.totalTrips.toLocaleString()} color={D.cyan} change={12.5} sparkData={[900,980,1020,1100,1180,1247]} />
                <Stat icon={<Eye size={20}/>} label={isRTL?'إجمالي المشاهدات':'Views'} value={MOCK.totalViews.toLocaleString()} color={D.blue} change={18.3} sparkData={[11000,12500,13200,14100,15000,15834]} />
                <Stat icon={<MessageCircle size={20}/>} label={isRTL?'نقرات واتساب':'WhatsApp'} value={MOCK.whatsappClicks.toLocaleString()} color='#25D366' change={24.7} sparkData={[2600,2900,3100,3400,3700,3842]} />
                <Stat icon={<Users size={20}/>} label={isRTL?'رسائل':'Messages'} value={MOCK.totalMessages.toLocaleString()} color={D.gold} change={15.2} sparkData={[1500,1700,1850,2000,2100,2156]} />
                <Stat icon={<CheckCircle2 size={20}/>} label={isRTL?'الحجوزات':'Bookings'} value={MOCK.totalBookings.toLocaleString()} color={D.green} change={9.8} sparkData={[700,780,820,880,940,987]} />
              </div>

              {/* Two-column charts */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                {/* Weekly bar */}
                <div style={{ background:D.card, borderRadius:16, padding:'22px 24px', border:`1px solid ${D.border}` }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <TrendingUp size={16} color={D.cyan}/> {isRTL?'المشاهدات اليومية':'Daily Views'}
                  </div>
                  <BarChart data={MOCK.weekly.map(d=>({label:d.label,val:d.views}))} color={D.cyan} height={100}/>
                </div>

                {/* Bookings bar */}
                <div style={{ background:D.card, borderRadius:16, padding:'22px 24px', border:`1px solid ${D.border}` }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <CheckCircle2 size={16} color={D.green}/> {isRTL?'الرحلات اليومية':'Daily Trips'}
                  </div>
                  <BarChart data={MOCK.weekly.map(d=>({label:d.label,val:d.trips}))} color={D.green} height={100}/>
                </div>
              </div>

              {/* Conversion funnel */}
              <div style={{ background:D.card, borderRadius:16, padding:'22px 24px', border:`1px solid ${D.border}`, marginBottom:14 }}>
                <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  <Target size={16} color={D.gold}/> {isRTL?'قمع التحويل':'Conversion Funnel'}
                </div>
                <FunnelChart steps={funnelSteps}/>
              </div>

              {/* Growth row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                <Stat icon={<Users size={20}/>} label={isRTL?'المستخدمون النشطون':'DAU'} value={MOCK.dau.toLocaleString()} color={D.cyan} change={8.5} sparkData={[2100,2300,2500,2600,2750,2847]} />
                <Stat icon={<TrendingUp size={20}/>} label={isRTL?'النمو الأسبوعي':'Weekly Growth'} value={`${MOCK.weekGrowth}%`} color={D.green} change={3.2} sparkData={[7,8,9,10,11,12.5]} />
                <Stat icon={<DollarSign size={20}/>} label={isRTL?'الإيرادات الشهرية':'Monthly Revenue'} value={`JOD ${MOCK.monthRevenue.toLocaleString()}`} color={D.gold} change={15.7} sparkData={[18000,20000,22000,24500,26000,28450]} />
              </div>
            </>)}

            {/* ── ROUTES ── */}
            {tab === 'routes' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {/* Route bar chart */}
                <div style={{ background:D.card, borderRadius:16, padding:'22px 24px', border:`1px solid ${D.border}` }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:16 }}>
                    📊 {isRTL?'مقارنة حجوزات المسارات':'Route Bookings Comparison'}
                  </div>
                  <BarChart data={MOCK.routes.map(r=>({label:r.route.split('→')[1].trim().slice(0,7), val:r.bk}))} color={D.cyan} height={90}/>
                </div>

                {MOCK.routes.map((r, i) => (
                  <motion.div key={r.route} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                    style={{ background:D.card, borderRadius:16, padding:'18px 22px', border:`1px solid ${D.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${D.cyan},${D.blue})`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900 }}>#{i+1}</div>
                        <span style={{ color:'#fff', fontWeight:800, fontSize:'1.02rem' }}>{r.route}</span>
                      </div>
                      <span style={pill(D.green)}>{r.rate}% conv.</span>
                    </div>
                    {/* Mini funnel per route */}
                    <div style={{ marginBottom:10 }}>
                      <div style={{ display:'flex', gap:0, height:14, borderRadius:7, overflow:'hidden' }}>
                        {[{v:r.views,c:D.cyan},{v:r.clicks,c:'#25D366'},{v:r.bk*4,c:D.green}].map((s,j) => (
                          <div key={j} style={{ flex:s.v/r.views, background:s.c, opacity:0.7+(j*0.1) }}/>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:12, marginTop:5 }}>
                        {[{l:'Views',v:r.views,c:D.cyan},{l:'Clicks',v:r.clicks,c:'#25D366'},{l:'Bookings',v:r.bk,c:D.green},{l:'Avg Price',v:`JOD ${r.price}`,c:D.gold},{l:'Revenue',v:`JOD ${r.rev}`,c:D.green}].map(m=>(
                          <div key={m.l} style={{ flex:1 }}>
                            <div style={{ color:D.muted, fontSize:'0.65rem', marginBottom:2 }}>{m.l}</div>
                            <div style={{ color:m.c, fontWeight:800, fontSize:'0.88rem' }}>{m.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── DRIVERS ── */}
            {tab === 'drivers' && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {/* Driver earnings bar */}
                <div style={{ background:D.card, borderRadius:16, padding:'22px 24px', border:`1px solid ${D.border}` }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:16 }}>
                    💰 {isRTL?'مقارنة إيرادات السائقين':'Driver Revenue Comparison'}
                  </div>
                  <BarChart data={MOCK.drivers.map(d=>({label:d.name.split(' ')[0], val:d.rev}))} color={D.gold} height={90}/>
                </div>

                {MOCK.drivers.map((d, i) => (
                  <motion.div key={d.name} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.08 }}
                    style={{ background:D.card, borderRadius:16, padding:'18px 22px', border:`1px solid ${D.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#A78BFA,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:'1.1rem' }}>{d.name.charAt(0)}</div>
                        <div>
                          <div style={{ color:'#fff', fontWeight:800, fontSize:'1rem' }}>{d.name}</div>
                          <div style={{ color:'#F59E0B', fontSize:'0.78rem', marginTop:2 }}>{'★'.repeat(Math.floor(d.rating))} {d.rating}</div>
                        </div>
                      </div>
                      <span style={pill('#A78BFA')}><Award size={10}/> {d.score} pts</span>
                    </div>
                    {/* Score bar */}
                    <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.05)', overflow:'hidden', marginBottom:10 }}>
                      <motion.div initial={{width:0}} animate={{width:`${d.score}%`}} transition={{duration:0.7}}
                        style={{ height:'100%', borderRadius:999, background:'linear-gradient(90deg,#A78BFA,#7C3AED)' }}/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
                      {[{l:isRTL?'رحلات':'Trips',v:`${d.trips}`,c:D.cyan},{l:isRTL?'حجوزات':'Bookings',v:`${d.bk}`,c:D.green},{l:isRTL?'وقت الرد':'Response',v:`${d.rt}m`,c:D.gold},{l:isRTL?'تحويل':'Conversion',v:`${((d.bk/d.trips)*100).toFixed(0)}%`,c:D.blue},{l:isRTL?'الإيرادات':'Revenue',v:`JOD ${d.rev}`,c:D.green}].map(m=>(
                        <div key={m.l}><div style={{color:D.muted,fontSize:'0.68rem',marginBottom:2}}>{m.l}</div><div style={{color:m.c,fontWeight:800,fontSize:'0.92rem'}}>{m.v}</div></div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ── INSIGHTS ── */}
            {tab === 'insights' && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Revenue bar */}
                <div style={{ background:D.card, borderRadius:16, padding:'22px 24px', border:`1px solid ${D.border}` }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:700, color:'#fff', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <DollarSign size={16} color={D.gold}/> {isRTL?'الإيرادات اليومية (JOD)':'Daily Revenue (JOD)'}
                  </div>
                  <BarChart data={MOCK.weekly.map(d=>({label:d.label,val:d.rev}))} color={D.gold} height={100}/>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  {[
                    { label:isRTL?'معدل التكرار':'Repeat rider rate', val:`${MOCK.repeatRate}%`, color:D.green, icon:'🔄', sub:'of users ride again within 7 days' },
                    { label:isRTL?'وقت الاستجابة':'Avg response time', val:`${MOCK.avgResponse}m`, color:D.cyan, icon:'⚡', sub:'driver → passenger reply time' },
                    { label:isRTL?'رسائل/رحلة':'Messages per trip',  val:MOCK.msgPerTrip.toFixed(1), color:D.gold, icon:'💬', sub:'average message thread length' },
                    { label:isRTL?'أفضل تحويل':'Best conversion',    val:`${MOCK.msgToBk.toFixed(0)}%`, color:D.purple, icon:'🎯', sub:'Message → Booking funnel' },
                  ].map(s => (
                    <div key={s.label} style={{ background:D.card, border:`1px solid ${D.border}`, borderRadius:14, padding:'18px 20px' }}>
                      <div style={{ fontSize:'1.5rem', marginBottom:8 }}>{s.icon}</div>
                      <div style={{ fontSize:'1.6rem', fontWeight:900, color:s.color }}>{s.val}</div>
                      <div style={{ fontSize:'0.73rem', color:D.sub, marginTop:3 }}>{s.label}</div>
                      <div style={{ fontSize:'0.65rem', color:D.muted, marginTop:3 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EngagementAnalyticsDashboard;