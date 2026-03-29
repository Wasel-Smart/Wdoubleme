/**
 * Wasel Payment Ecosystem v2.0
 * Full dark-cosmic redesign — zero shadcn/ui light-theme components
 * JOD settlement · CliQ · Stripe · eFAWATEERcom · Cash on Arrival
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, Wallet, Shield, TrendingUp, Clock, CheckCircle2,
  XCircle, AlertTriangle, Lock, ArrowRightLeft, Users, Zap,
  ChevronRight, RefreshCw, Download, ArrowUpRight, ArrowDownLeft,
  Banknote, Smartphone, Eye, EyeOff, Plus,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// ── Design tokens ─────────────────────────────────────────────────────────────
const D = {
  bg:    '#040C18', card: '#0A1628', card2: '#0D1F38', panel: '#0F2040',
  border: 'rgba(0,200,232,0.10)', borderH: 'rgba(0,200,232,0.28)',
  cyan:  '#00C8E8', gold: '#F0A830', green: '#00C875',
  red:   '#FF4455', orange: '#FB923C', purple: '#A78BFA',
  text:  '#EFF6FF', sub:  'rgba(148,163,184,0.80)', muted: 'rgba(100,130,180,0.60)',
  F: "-apple-system,'Inter','Cairo',sans-serif",
  MONO: "'JetBrains Mono','Fira Mono',monospace",
} as const;

const pill = (c: string, bg = `${c}12`) => ({
  display:'inline-flex', alignItems:'center', gap:4,
  padding:'3px 10px', borderRadius:999,
  background: bg, border:`1px solid ${c}28`,
  fontSize:'0.65rem', fontWeight:700, color:c,
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Gateway { id:string; name:string; nameAr:string; icon:string; fee:number; time:string; currencies:string[]; color:string; default?:boolean }
interface Tx { id:string; type:string; label:string; labelAr:string; amount:number; currency:string; status:'completed'|'pending'|'failed'|'refunded'; date:string; method:string; fee:number }
interface EscrowItem { id:string; trip:string; amount:number; status:'held'|'released'|'disputed'; heldAt:string; releaseAt:string }

// ── Static data ───────────────────────────────────────────────────────────────
const GATEWAYS: Gateway[] = [
  { id:'cliq',    name:'CliQ',              nameAr:'كليك',       icon:'🏦', fee:0.5,  time:'فوري',  currencies:['JOD'],                        color:'#00C8E8', default:true },
  { id:'card',    name:'Card (Stripe)',      nameAr:'بطاقة بنكية',icon:'💳', fee:2.9,  time:'فوري',  currencies:['JOD','USD','EUR','SAR','AED'], color:'#A78BFA' },
  { id:'efawat',  name:'eFAWATEERcom',       nameAr:'إفواتيركم',  icon:'📱', fee:1.0,  time:'24 ساعة', currencies:['JOD'],                      color:'#F0A830' },
  { id:'cash',    name:'Cash on Arrival',    nameAr:'كاش عند الوصول',icon:'💵', fee:0, time:'عند التسليم', currencies:['JOD','USD'],              color:'#00C875' },
  { id:'paypal',  name:'PayPal',             nameAr:'باي بال',    icon:'🌐', fee:3.4,  time:'فوري',  currencies:['USD','EUR','GBP'],             color:'#003087' },
];

const MOCK_TXS: Tx[] = [
  { id:'tx1', type:'ride',     label:'Amman → Aqaba',    labelAr:'عمّان → العقبة',  amount:8.0,  currency:'JOD', status:'completed', date:'21 Mar 2026 08:30', method:'CliQ',    fee:0.04 },
  { id:'tx2', type:'package',  label:'Package delivery', labelAr:'توصيل طرد',        amount:5.0,  currency:'JOD', status:'completed', date:'19 Mar 2026 14:15', method:'Card',    fee:0.15 },
  { id:'tx3', type:'refund',   label:'Cancelled ride',   labelAr:'رحلة ملغاة',        amount:-4.0, currency:'JOD', status:'refunded',  date:'18 Mar 2026 11:00', method:'CliQ',    fee:0    },
  { id:'tx4', type:'ride',     label:'Amman → Dead Sea', labelAr:'عمّان → البحر الميت', amount:6.5, currency:'JOD', status:'completed', date:'15 Mar 2026 07:45', method:'Cash',    fee:0 },
  { id:'tx5', type:'bus',      label:'JETT Amman–Aqaba', labelAr:'جيت عمّان–العقبة',  amount:7.0,  currency:'JOD', status:'pending',   date:'21 Mar 2026 12:00', method:'eFAWATEERcom', fee:0.07 },
  { id:'tx6', type:'ride',     label:'Amman → Irbid',    labelAr:'عمّان → إربد',      amount:3.5,  currency:'JOD', status:'failed',    date:'14 Mar 2026 09:30', method:'Card',    fee:0 },
];

const MOCK_ESCROW: EscrowItem[] = [
  { id:'esc1', trip:'Amman → Aqaba (Fri 22 Mar)', amount:8.0,  status:'held',     heldAt:'21 Mar', releaseAt:'22 Mar after 18:00' },
  { id:'esc2', trip:'Amman → Dead Sea',            amount:6.5,  status:'released', heldAt:'15 Mar', releaseAt:'15 Mar (completed)' },
  { id:'esc3', trip:'Zarqa → Amman (disputed)',    amount:3.0,  status:'disputed', heldAt:'12 Mar', releaseAt:'Under review'       },
];

const STATUS_MAP = {
  completed: { label:'Completed', labelAr:'مكتمل',   color: D.green  },
  pending:   { label:'Pending',   labelAr:'قيد المعالجة', color: D.gold   },
  failed:    { label:'Failed',    labelAr:'فشل',      color: D.red    },
  refunded:  { label:'Refunded',  labelAr:'مُسترد',   color: D.purple },
};

const ESCROW_MAP = {
  held:     { color: D.gold,  label: 'Held',     labelAr: 'محجوز'    },
  released: { color: D.green, label: 'Released', labelAr: 'محرّر'   },
  disputed: { color: D.red,   label: 'Disputed', labelAr: 'متنازع عليه' },
};

const TX_ICONS: Record<string, string> = { ride:'🚗', package:'📦', refund:'↩️', bus:'🚌', default:'💳' };

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: D.card, border:`1px solid ${D.border}`, borderRadius:16, ...style }}>
      {children}
    </div>
  );
}

function TabBar({ tabs, active, onChange }: { tabs:{key:string;label:string}[]; active:string; onChange:(k:string)=>void }) {
  return (
    <div style={{ display:'flex', background:D.card, borderRadius:12, padding:4, border:`1px solid ${D.border}`, gap:3 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding:'8px 18px', borderRadius:9, border:'none', cursor:'pointer',
          fontSize:'0.8rem', fontWeight: active===t.key ? 700 : 500, fontFamily:D.F,
          background: active===t.key ? `linear-gradient(135deg,${D.cyan},#0095B8)` : 'transparent',
          color: active===t.key ? '#040C18' : D.sub, transition:'all 0.15s',
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────
function BalanceSection({ isRTL }: { isRTL:boolean }) {
  const [show, setShow] = useState(true);
  const balance = 23.50;
  const pending = 8.00;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0B1D45 0%, #162C6A 60%, #0A1628 100%)',
      borderRadius:20, padding:'28px 32px', border:`1px solid rgba(0,200,232,0.15)`,
      boxShadow:'0 8px 40px rgba(0,0,0,0.5)', marginBottom:24, position:'relative', overflow:'hidden',
    }}>
      {/* glow */}
      <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,200,232,0.12), transparent 65%)', pointerEvents:'none' }} />

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16, position:'relative' }}>
        <div>
          <p style={{ fontSize:'0.72rem', color:D.sub, fontFamily:D.F, margin:'0 0 8px', textTransform:'uppercase', letterSpacing:'0.1em' }}>
            {isRTL ? 'رصيدك' : 'Wallet Balance'}
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:'2.4rem', fontWeight:900, color:'#fff', fontFamily:D.MONO, letterSpacing:'-0.04em' }}>
              {show ? `JOD ${balance.toFixed(3)}` : 'JOD •••••'}
            </span>
            <button onClick={() => setShow(v=>!v)} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, width:32, height:32, cursor:'pointer', color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:8 }}>
            <span style={{ fontSize:'0.72rem', color:D.gold, fontFamily:D.F }}>
              ⏳ JOD {pending.toFixed(3)} {isRTL ? 'في الانتظار' : 'pending escrow'}
            </span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { icon:<Plus size={14}/>,            label: isRTL?'إضافة':'Add funds',  color:D.cyan,  action:()=>{} },
            { icon:<ArrowUpRight size={14}/>,    label: isRTL?'سحب':'Withdraw',    color:D.gold,  action:()=>{} },
            { icon:<ArrowRightLeft size={14}/>,  label: isRTL?'تحويل':'Transfer',   color:D.green, action:()=>{} },
          ].map(btn => (
            <motion.button key={btn.label} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }} onClick={btn.action} style={{
              display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10,
              background:`${btn.color}14`, border:`1px solid ${btn.color}30`, color:btn.color,
              fontSize:'0.78rem', fontWeight:700, fontFamily:D.F, cursor:'pointer',
            }}>
              {btn.icon}{btn.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:24, borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:20 }}>
        {[
          { label:isRTL?'هذا الشهر':'This month', val:'JOD 28.00', color:D.cyan  },
          { label:isRTL?'وفّرت':'Saved vs taxi',   val:'JOD 64.00', color:D.green },
          { label:isRTL?'رحلات':'Trips paid',       val:'7',         color:D.gold  },
          { label:isRTL?'عمولة المنصة':'Platform fee', val:'JOD 2.88', color:D.sub  },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize:'1.05rem', fontWeight:800, color:s.color, fontFamily:D.MONO }}>{s.val}</div>
            <div style={{ fontSize:'0.65rem', color:D.muted, marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GatewaysTab({ isRTL }: { isRTL:boolean }) {
  const [selected, setSelected] = useState('cliq');
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {GATEWAYS.map(g => {
        const active = selected === g.id;
        return (
          <motion.div key={g.id} whileHover={{ x:2 }} onClick={() => setSelected(g.id)} style={{
            display:'flex', alignItems:'center', gap:16, padding:'16px 20px', borderRadius:14,
            background: active ? `${g.color}0A` : D.card2,
            border:`1px solid ${active ? g.color+'40' : D.border}`,
            cursor:'pointer', transition:'all 0.15s',
          }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${g.color}15`, border:`1px solid ${g.color}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
              {g.icon}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'0.88rem', fontWeight:700, color:D.text }}>{isRTL ? g.nameAr : g.name}</span>
                {g.default && <span style={pill(D.cyan)}>Default</span>}
              </div>
              <div style={{ display:'flex', gap:12, marginTop:4 }}>
                <span style={{ fontSize:'0.68rem', color:D.muted }}>Fee: {g.fee}%</span>
                <span style={{ fontSize:'0.68rem', color:D.muted }}>⏱ {g.time}</span>
                <span style={{ fontSize:'0.68rem', color:D.muted }}>{g.currencies.join(' · ')}</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
              {active && <CheckCircle2 size={18} color={g.color} />}
              <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${active ? g.color : 'rgba(255,255,255,0.2)'}`, background: active ? g.color : 'transparent', transition:'all 0.15s' }} />
            </div>
          </motion.div>
        );
      })}

      <motion.button whileHover={{ scale:1.02 }} style={{
        marginTop:8, height:46, borderRadius:12, border:`1px dashed rgba(0,200,232,0.25)`,
        background:'transparent', color:D.cyan, fontSize:'0.82rem', fontWeight:600, fontFamily:D.F, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}>
        <Plus size={16} /> {isRTL ? 'إضافة طريقة دفع جديدة' : 'Add payment method'}
      </motion.button>
    </div>
  );
}

function TransactionsTab({ isRTL }: { isRTL:boolean }) {
  const [filter, setFilter] = useState<'all'|'completed'|'pending'|'failed'|'refunded'>('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_TXS.filter(tx => {
    if (filter !== 'all' && tx.status !== filter) return false;
    const q = search.toLowerCase();
    return !q || tx.label.toLowerCase().includes(q) || tx.labelAr.includes(q);
  });

  const totalIn  = MOCK_TXS.filter(t => t.amount > 0 && t.status === 'completed').reduce((s,t) => s+t.amount, 0);
  const totalOut = MOCK_TXS.filter(t => t.amount < 0 && t.status !== 'failed').reduce((s,t) => s+Math.abs(t.amount), 0);

  return (
    <div>
      {/* Summary bar */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
        {[
          { label:isRTL?'إجمالي الوارد':'Total in',  val:`+ JOD ${totalIn.toFixed(3)}`,  color:D.green },
          { label:isRTL?'إجمالي الصادر':'Total out', val:`- JOD ${totalOut.toFixed(3)}`, color:D.red  },
          { label:isRTL?'صافي':'Net',                  val:`JOD ${(totalIn-totalOut).toFixed(3)}`, color:D.cyan },
        ].map(s => (
          <Card key={s.label} style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:'1.05rem', fontWeight:900, color:s.color, fontFamily:D.MONO }}>{s.val}</div>
            <div style={{ fontSize:'0.65rem', color:D.muted, marginTop:3 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {(['all','completed','pending','failed','refunded'] as const).map(f => {
          const col = f==='all' ? D.cyan : f==='completed' ? D.green : f==='pending' ? D.gold : f==='failed' ? D.red : D.purple;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'5px 12px', borderRadius:999, border:`1px solid ${filter===f ? col : D.border}`,
              background: filter===f ? `${col}14` : 'transparent', color: filter===f ? col : D.muted,
              fontSize:'0.7rem', fontWeight:700, fontFamily:D.F, cursor:'pointer', textTransform:'capitalize',
            }}>{f}</button>
          );
        })}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search…"
          style={{ marginLeft:'auto', padding:'5px 12px', borderRadius:10, border:`1px solid ${D.border}`, background:D.card2, color:D.text, fontSize:'0.75rem', fontFamily:D.F, width:160 }} />
      </div>

      {/* Tx list */}
      <Card>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:D.muted, fontSize:'0.82rem' }}>No transactions found</div>
        ) : filtered.map((tx, i) => {
          const st = STATUS_MAP[tx.status];
          const isRefund = tx.amount < 0;
          return (
            <motion.div key={tx.id} initial={{ opacity:0 }} animate={{ opacity:1 }} style={{
              display:'flex', alignItems:'center', gap:14, padding:'14px 18px',
              borderBottom: i<filtered.length-1 ? `1px solid ${D.border}` : 'none',
            }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${isRefund ? D.purple : D.cyan}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>
                {TX_ICONS[tx.type] ?? TX_ICONS.default}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.84rem', fontWeight:600, color:D.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {isRTL ? tx.labelAr : tx.label}
                </div>
                <div style={{ fontSize:'0.67rem', color:D.muted, marginTop:2 }}>{tx.date} · {tx.method}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:'0.9rem', fontWeight:800, color: isRefund ? D.red : D.green, fontFamily:D.MONO }}>
                  {isRefund ? '- ' : '+ '} JOD {Math.abs(tx.amount).toFixed(3)}
                </div>
                <span style={pill(st.color)}>{isRTL ? st.labelAr : st.label}</span>
              </div>
            </motion.div>
          );
        })}
      </Card>
    </div>
  );
}

function EscrowTab({ isRTL }: { isRTL:boolean }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Explainer */}
      <Card style={{ padding:'16px 20px', borderColor:'rgba(0,200,232,0.18)' }}>
        <div style={{ display:'flex', gap:12 }}>
          <Shield size={22} color={D.cyan} style={{ flexShrink:0, marginTop:2 }} />
          <div>
            <div style={{ fontSize:'0.84rem', fontWeight:700, color:D.cyan, marginBottom:4 }}>
              {isRTL ? 'نظام الحماية بالضمان' : 'Escrow Protection'}
            </div>
            <p style={{ fontSize:'0.76rem', color:D.muted, margin:0, lineHeight:1.6 }}>
              {isRTL
                ? 'المبلغ محجوز بأمان حتى اكتمال الرحلة. يتلقى السائق المبلغ فور التأكيد.'
                : 'Your payment is held securely until trip completion. Driver receives funds upon confirmation.'}
            </p>
          </div>
        </div>
      </Card>

      {MOCK_ESCROW.map(e => {
        const st = ESCROW_MAP[e.status];
        return (
          <Card key={e.id} style={{ padding:'16px 20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'0.85rem', fontWeight:700, color:D.text }}>{e.trip}</div>
                <div style={{ fontSize:'0.68rem', color:D.muted, marginTop:4 }}>
                  Held: {e.heldAt} · Release: {e.releaseAt}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:'1.05rem', fontWeight:900, color:st.color, fontFamily:D.MONO }}>JOD {e.amount.toFixed(3)}</div>
                <span style={pill(st.color)}>{isRTL ? st.labelAr : st.label}</span>
              </div>
            </div>
            {/* Progress bar for held */}
            {e.status === 'held' && (
              <div style={{ marginTop:12 }}>
                <div style={{ height:4, borderRadius:999, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ width:'70%', height:'100%', borderRadius:999, background:`linear-gradient(90deg,${D.gold},${D.cyan})` }} />
                </div>
                <div style={{ fontSize:'0.62rem', color:D.muted, marginTop:4 }}>Releasing when trip completes</div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function AnalyticsTab({ isRTL }: { isRTL:boolean }) {
  const methods = [
    { name:'CliQ',         pct:55, color:D.cyan  },
    { name:'Card',         pct:25, color:D.purple },
    { name:'Cash',         pct:12, color:D.green  },
    { name:'eFAWATEERcom', pct:8,  color:D.gold   },
  ];
  const monthly = [
    { m:'Nov', v:12.5 }, { m:'Dec', v:18.0 }, { m:'Jan', v:15.5 },
    { m:'Feb', v:22.0 }, { m:'Mar', v:28.5 },
  ];
  const maxV = Math.max(...monthly.map(m => m.v));

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Spend chart */}
      <Card style={{ padding:'22px 24px' }}>
        <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.text, marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
          <TrendingUp size={16} color={D.cyan} />
          {isRTL ? 'الإنفاق الشهري (JOD)' : 'Monthly Spend (JOD)'}
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:120 }}>
          {monthly.map(m => (
            <div key={m.m} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:'0.65rem', color:D.cyan, fontFamily:D.MONO }}>{m.v}</span>
              <motion.div
                initial={{ height:0 }} animate={{ height:`${(m.v/maxV)*90}px` }}
                transition={{ duration:0.6, delay:0.1 }}
                style={{ width:'100%', borderRadius:'6px 6px 0 0', background:`linear-gradient(180deg,${D.cyan},rgba(0,200,232,0.3))` }}
              />
              <span style={{ fontSize:'0.65rem', color:D.muted }}>{m.m}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment method breakdown */}
      <Card style={{ padding:'22px 24px' }}>
        <div style={{ fontSize:'0.82rem', fontWeight:700, color:D.text, marginBottom:16 }}>
          {isRTL ? 'طرق الدفع المستخدمة' : 'Payment Method Usage'}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {methods.map(m => (
            <div key={m.name}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontSize:'0.78rem', color:D.text }}>{m.name}</span>
                <span style={{ fontSize:'0.78rem', color:m.color, fontFamily:D.MONO }}>{m.pct}%</span>
              </div>
              <div style={{ height:6, borderRadius:999, background:'rgba(255,255,255,0.05)', overflow:'hidden' }}>
                <motion.div initial={{ width:0 }} animate={{ width:`${m.pct}%` }} transition={{ duration:0.7 }}
                  style={{ height:'100%', borderRadius:999, background:m.color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Fee saved */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {[
          { icon:'💸', label:isRTL?'وفّرت على الرسوم':'Fees saved vs cash', val:'JOD 0.84', color:D.green },
          { icon:'🔒', label:isRTL?'معاملات آمنة':'Secure transactions',   val:'100%',    color:D.cyan  },
          { icon:'⚡', label:isRTL?'معالجة فورية':'Instant processing',    val:'97%',     color:D.gold  },
          { icon:'📊', label:isRTL?'متوسط الصفقة':'Avg transaction',       val:'JOD 6.25', color:D.purple },
        ].map(s => (
          <Card key={s.label} style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:'1.3rem', marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:'1.05rem', fontWeight:900, color:s.color, fontFamily:D.MONO }}>{s.val}</div>
            <div style={{ fontSize:'0.66rem', color:D.muted, marginTop:3 }}>{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function PaymentEcosystem() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [tab, setTab] = useState('balance');

  const tabs = [
    { key:'balance',      label: isRTL ? 'المحفظة'    : 'Wallet'       },
    { key:'gateways',     label: isRTL ? 'طرق الدفع'  : 'Pay Methods'  },
    { key:'transactions', label: isRTL ? 'المعاملات'  : 'Transactions' },
    { key:'escrow',       label: isRTL ? 'الضمان'     : 'Escrow'       },
    { key:'analytics',    label: isRTL ? 'التحليلات'  : 'Analytics'    },
  ];

  return (
    <div style={{ minHeight:'100vh', background:D.bg, fontFamily:D.F, color:D.text, padding:'28px 20px 80px' }} dir={isRTL?'rtl':'ltr'}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:`linear-gradient(135deg,${D.cyan},${D.green})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>💳</div>
          <div>
            <h1 style={{ fontSize:'1.35rem', fontWeight:900, letterSpacing:'-0.03em', margin:0 }}>
              {isRTL ? 'نظام الدفع' : 'Payment Ecosystem'}
            </h1>
            <p style={{ fontSize:'0.72rem', color:D.muted, margin:'3px 0 0' }}>
              {isRTL ? 'CliQ · بطاقة بنكية · eFAWATEERcom · نقداً — JOD' : 'CliQ · Card · eFAWATEERcom · Cash — JOD settlement'}
            </p>
          </div>
          <motion.button whileHover={{ scale:1.05 }} style={{ marginLeft:'auto', padding:'8px 16px', borderRadius:10, border:`1px solid ${D.border}`, background:D.card2, color:D.sub, fontSize:'0.76rem', fontWeight:600, fontFamily:D.F, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
            <Download size={14} /> {isRTL ? 'تصدي��' : 'Export'}
          </motion.button>
        </div>

        {/* ── Balance always visible ── */}
        <BalanceSection isRTL={isRTL} />

        {/* ── Tabs ── */}
        <div style={{ marginBottom:18 }}>
          <TabBar tabs={tabs} active={tab} onChange={setTab} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.18 }}>
            {tab === 'balance'      && <GatewaysTab   isRTL={isRTL} />}
            {tab === 'gateways'     && <GatewaysTab   isRTL={isRTL} />}
            {tab === 'transactions' && <TransactionsTab isRTL={isRTL} />}
            {tab === 'escrow'       && <EscrowTab     isRTL={isRTL} />}
            {tab === 'analytics'    && <AnalyticsTab  isRTL={isRTL} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PaymentEcosystem;
export { PaymentEcosystem as PaymentEcosystemDashboard };
