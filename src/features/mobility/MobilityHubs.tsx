/**
 * MobilityHubs v4 — "Neural Command" Edition
 *
 * Radically innovative Digital-Twin Command Center:
 *  · Google Maps dark-teal base with RAF canvas overlay
 *    (glowing route beams, moving vehicle blips, city pulse rings)
 *  · SVG Arc-Gauge speedometer for AI demand multiplier
 *  · Hex-grid SVG background texture on side panels
 *  · Bento-style right panel (mixed card sizes, donut chart)
 *  · Animated gradient top-border + CRT scanline
 *  · Live scrolling ticker tape at the footer
 *  · Neon-glow numbers, animated borders, glassmorphism cards
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Play, Pause, RotateCcw, Zap, Package,
  AlertTriangle, CloudLightning, ShieldAlert,
  Gauge, Waves, Activity, Globe2,
} from 'lucide-react';
import { useLanguage }           from '../../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { C as CT }               from '../../tokens/colors';
import { API_URL }               from '../../services/core';

// ─────────────────────────────────────────────────────────────────────────────
// Google Maps dynamic loader
// ─────────────────────────────────────────────────────────────────────────────
const GMAPS_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ?? '';
let _gmapsPromise: Promise<any> | null = null;
function loadGoogleMaps(): Promise<any> {
  if (_gmapsPromise) return _gmapsPromise;
  _gmapsPromise = new Promise((res, rej) => {
    if ((window as any).google?.maps) { res((window as any).google.maps); return; }
    (window as any).__waselGmapsCb = () => {
      const gm = (window as any).google?.maps;
      gm ? res(gm) : rej(new Error('Google Maps not found'));
    };
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&callback=__waselGmapsCb`;
    s.async = true; s.onerror = rej;
    document.head.appendChild(s);
  });
  return _gmapsPromise;
}

// ─────────────────────────────────────────────────────────────────────────────
// Map style — ultra-dark "Neural" theme
// ─────────────────────────────────────────────────────────────────────────────
const MAP_STYLE = [
  { elementType: 'geometry',              stylers: [{ color: '#06101f' }] },
  { elementType: 'labels.icon',           stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',      stylers: [{ color: '#2a5978' }] },
  { elementType: 'labels.text.stroke',    stylers: [{ color: '#06101f' }] },
  { featureType: 'administrative',         elementType: 'geometry',          stylers: [{ color: '#0c1e36' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke',  stylers: [{ color: '#123456' }] },
  { featureType: 'administrative.locality',elementType: 'labels.text.fill', stylers: [{ color: '#1a6fa0' }] },
  { featureType: 'poi',                    stylers: [{ visibility: 'off' }] },
  { featureType: 'road',                   elementType: 'geometry',          stylers: [{ color: '#0f2540' }] },
  { featureType: 'road',                   elementType: 'geometry.stroke',   stylers: [{ color: '#08182e' }] },
  { featureType: 'road.highway',           elementType: 'geometry',          stylers: [{ color: '#13304d' }] },
  { featureType: 'transit',               stylers: [{ visibility: 'off' }] },
  { featureType: 'water',                  elementType: 'geometry',          stylers: [{ color: '#040d1a' }] },
  { featureType: 'landscape',             elementType: 'geometry',           stylers: [{ color: '#08121e' }] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
interface JCity { id:string; name:string; lat:number; lng:number; tier:'a'|'b'|'c'; color:string; }
const CITIES: JCity[] = [
  { id:'amman',   name:'Amman',    lat:31.9539, lng:35.9106, tier:'a', color:'#00D4F5' },
  { id:'aqaba',   name:'Aqaba',    lat:29.5269, lng:35.0065, tier:'a', color:'#00D4F5' },
  { id:'irbid',   name:'Irbid',    lat:32.5569, lng:35.8631, tier:'b', color:'#00F59A' },
  { id:'zarqa',   name:'Zarqa',    lat:32.0728, lng:36.0878, tier:'b', color:'#00F59A' },
  { id:'mafraq',  name:'Mafraq',   lat:32.3426, lng:36.2099, tier:'c', color:'#00F59A' },
  { id:'jerash',  name:'Jerash',   lat:32.2763, lng:35.8994, tier:'c', color:'#00F59A' },
  { id:'salt',    name:'Salt',     lat:32.0318, lng:35.7278, tier:'c', color:'#00F59A' },
  { id:'deadsea', name:'Dead Sea', lat:31.5000, lng:35.5000, tier:'b', color:'#00D4F5' },
  { id:'madaba',  name:'Madaba',   lat:31.7167, lng:35.8000, tier:'c', color:'#00F59A' },
  { id:'karak',   name:'Karak',    lat:31.1833, lng:35.7000, tier:'c', color:'#00F59A' },
  { id:'petra',   name:'Petra',    lat:30.3281, lng:35.4444, tier:'b', color:'#F5A623' },
  { id:'maan',    name:"Ma'an",    lat:30.1939, lng:35.7346, tier:'c', color:'#00F59A' },
  { id:'wadirum', name:'Wadi Rum', lat:29.5833, lng:35.4167, tier:'b', color:'#F5A623' },
];
const ROUTES: [string,string][] = [
  ['amman','zarqa'],['amman','irbid'],['amman','deadsea'],['amman','madaba'],['amman','salt'],
  ['irbid','jerash'],['zarqa','mafraq'],['madaba','karak'],['karak','petra'],
  ['petra','maan'],['maan','aqaba'],['maan','wadirum'],['aqaba','wadirum'],['deadsea','karak'],
];
function cityById(id:string){ return CITIES.find(c=>c.id===id)! }

type Incident = 'accident'|'dust_storm'|'checkpoint'|'roadblock'|'closure';
interface SimState {
  timeMins:number; tick:number; paused:boolean; speed:number;
  trips:number; health:number; traffic:number; pkgShare:number;
  avgSpeedKph:number; multiModal:boolean; incidents:Incident[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens — aligned with /tokens/colors.ts (WaselColors)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:   CT.bg,          // #040C18 — Deep Space (brand token)
  pnl:  'rgba(4,12,24,0.97)',
  brd:  CT.brd,         // rgba(0,200,232,0.10)
  card: CT.cyanDim,     // rgba(0,200,232,0.12) — subtle card
  cbrd: CT.cbrd,        // rgba(255,255,255,0.08)
  cyan: CT.cyan,        // #00C8E8 — Electric Cyan
  gold: CT.gold,        // #F0A830 — Solar Gold
  grn:  CT.green,       // #00C875 — Emerald Green
  red:  CT.red,         // #FF4455 — Destructive
  purp: CT.purple,      // #A78BFA — Soft Purple
  dim:  'rgba(148,195,230,0.45)',
  mono: CT.mono,
  sys:  CT.sys,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fmtTime(m:number){
  const h=Math.floor(m/60)%24, mm=String(m%60).padStart(2,'0');
  return `${h===0?12:h>12?h-12:h}:${mm}\u202F${h>=12?'PM':'AM'}`;
}
function periodLabel(m:number){
  if(m>=360&&m<600)  return 'Morning Rush';
  if(m>=600&&m<720)  return 'Mid Morning';
  if(m>=720&&m<900)  return 'Afternoon';
  if(m>=900&&m<1020) return 'Evening Rush';
  return 'Night';
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG HEX GRID background
// ─────────────────────────────────────────────────────────────────────────────
function HexGrid(){
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.045,pointerEvents:'none'}}
      xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hexPat" width="52" height="45" patternUnits="userSpaceOnUse">
          <polygon points="26,2 50,15 50,38 26,51 2,38 2,15"
            fill="none" stroke="#00D4F5" strokeWidth="0.6"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hexPat)"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ARC GAUGE — SVG speedometer-style arc
// ─────────────────────────────────────────────────────────────────────────────
function ArcGauge({ value, max=2, label, sublabel, color }:{
  value:number; max?:number; label:string; sublabel:string; color:string;
}){
  const pct  = Math.min(value / max, 1);
  const R    = 56, cx=70, cy=70, strokeW=7;
  const arc  = 220; // total arc degrees
  const start= 160, end = start + arc;
  function polarToCart(deg:number, r:number){
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  const s1 = polarToCart(start, R), e1 = polarToCart(end, R);
  const s2 = polarToCart(start, R), e2 = polarToCart(start + arc * pct, R);
  const lg1 = arc > 180 ? 1 : 0;
  const lg2 = arc * pct > 180 ? 1 : 0;
  const trackPath = `M ${s1.x} ${s1.y} A ${R} ${R} 0 ${lg1} 1 ${e1.x} ${e1.y}`;
  const fillPath  = pct > 0
    ? `M ${s2.x} ${s2.y} A ${R} ${R} 0 ${lg2} 1 ${e2.x} ${e2.y}`
    : '';
  return (
    <svg width="140" height="120" viewBox="0 0 140 120" style={{display:'block',margin:'0 auto'}}>
      <defs>
        <linearGradient id={`ag_${label.replace(/\s/,'')}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={color}/>
        </linearGradient>
        <filter id="agGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeW} strokeLinecap="round"/>
      {/* Fill */}
      {fillPath && (
        <path d={fillPath} fill="none"
          stroke={`url(#ag_${label.replace(/\s/,'')})`}
          strokeWidth={strokeW} strokeLinecap="round"
          filter="url(#agGlow)"
          style={{transition:'all 0.8s ease'}}/>
      )}
      {/* Needle dot */}
      {fillPath && (()=>{
        const tip = polarToCart(start + arc * pct, R);
        return <circle cx={tip.x} cy={tip.y} r="4.5" fill={color} filter="url(#agGlow)"/>;
      })()}
      {/* Value */}
      <text x={cx} y={cy-4} textAnchor="middle" fill={color}
        fontSize="22" fontWeight="700" fontFamily={C.mono}>{value.toFixed(2)}×</text>
      <text x={cx} y={cy+14} textAnchor="middle" fill="rgba(255,255,255,0.65)"
        fontSize="9" fontFamily={C.sys}>{label}</text>
      <text x={cx} y={cy+27} textAnchor="middle" fill={C.dim}
        fontSize="7.5" fontFamily={C.mono}>{sublabel}</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART
// ─────────────────────────────────────────────────────────────────────────────
function DonutChart({ pct, color, label, value }:{pct:number;color:string;label:string;value:string}){
  const R=38, sw=9, C2=50, circ=2*Math.PI*R;
  const dash = circ * Math.min(pct, 1);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{display:'block'}}>
        <defs>
          <filter id="dnGlow">
            <feGaussianBlur stdDeviation="2" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <circle cx={C2} cy={C2} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
        <circle cx={C2} cy={C2} r={R} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          strokeDashoffset={circ * 0.25}
          filter="url(#dnGlow)"
          style={{transition:'stroke-dasharray 1s ease'}}/>
        <text x={C2} y={C2-4} textAnchor="middle" fill={color}
          fontSize="16" fontWeight="700" fontFamily={C.mono}>{value}</text>
        <text x={C2} y={C2+10} textAnchor="middle" fill={C.dim}
          fontSize="8" fontFamily={C.sys}>{label}</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────
function Spark({ data, color }:{ data:number[]; color:string }){
  if(data.length<2) return null;
  const mn=Math.min(...data), mx=Math.max(...data), rng=mx-mn||1, W=80, H=24;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*W},${H-((v-mn)/rng)*(H-4)-2}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{display:'block',overflow:'visible'}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.85"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED NUMBER
// ─────────────────────────────────────────────────────────────────────────────
function AnimNum({ val, color, size=26, unit='' }:{val:number;color:string;size?:number;unit?:string}){
  const [disp, setDisp] = useState(val);
  const prev = useRef(val);
  useEffect(()=>{
    if(val===prev.current) return;
    const diff=val-prev.current, steps=8;
    let i=0;
    const id=setInterval(()=>{
      i++;
      setDisp(Math.round(prev.current + diff*(i/steps)));
      if(i>=steps){ clearInterval(id); prev.current=val; }
    },60);
    return ()=>clearInterval(id);
  },[val]);
  return (
    <span style={{color,fontSize:size,fontWeight:700,fontFamily:C.mono,lineHeight:1,letterSpacing:'-0.02em'}}>
      {disp}{unit}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEON BADGE
// ─────────────────────────────────────────────────────────────────────────────
function NeonBadge({ label, color, blink=false }:{label:string;color:string;blink?:boolean}){
  return (
    <div style={{
      display:'inline-flex',alignItems:'center',gap:5,
      background:`${color}12`,border:`1px solid ${color}38`,
      borderRadius:20,padding:'3px 10px',
      color,fontSize:8.5,fontWeight:700,fontFamily:C.mono,letterSpacing:'0.1em',
    }}>
      <span style={{width:5,height:5,borderRadius:'50%',background:color,
        boxShadow:`0 0 6px ${color}`,display:'inline-block',
        animation:blink?'nmBlink 1.4s infinite':'none'}}/>
      {label}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE MAP + RAF canvas animation overlay
// ─────────────────────────────────────────────────────────────────────────────
function MobilityMap({ paused, incidents, speed }:{
  paused:boolean; incidents:Incident[]; speed:number;
}){
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [err,   setErr]   = useState(false);

  useEffect(()=>{
    let alive = true;
    loadGoogleMaps().then(gm=>{
      if(!alive || !containerRef.current) return;
      const map = new gm.Map(containerRef.current, {
        center:{ lat:30.9, lng:35.85 }, zoom:7,
        styles: MAP_STYLE,
        disableDefaultUI:true, gestureHandling:'greedy',
        backgroundColor:'#06101f',
      });
      mapRef.current = map;

      // ── Polylines ────────────────────────────────────────────
      ROUTES.forEach(([a,b])=>{
        const fa=cityById(a), fb=cityById(b);
        new gm.Polyline({
          path:[{lat:fa.lat,lng:fa.lng},{lat:fb.lat,lng:fb.lng}],
          strokeColor:'#F5A62340', strokeOpacity:1, strokeWeight:1, map, zIndex:1,
        });
      });

      // ── All-in-one animation overlay (canvas + HTML nodes) ────
      class MegaOverlay extends gm.OverlayView {
        canvas: HTMLCanvasElement | null = null;
        nodeEls: Map<string,HTMLDivElement> = new Map();
        vehicles: Array<{ri:number;phase:number;spd:number;dir:1|-1}> = [];
        rafId: number = 0;
        tick: number = 0;

        onAdd(){
          // Canvas in overlay layer
          const cvs = document.createElement('canvas');
          cvs.style.cssText='position:absolute;top:0;left:0;pointer-events:none;';
          this.canvas = cvs;
          this.getPanes()?.overlayLayer.appendChild(cvs);

          // HTML city nodes in mouse pane
          CITIES.forEach(city=>{
            const SZ = city.tier==='a'?18:city.tier==='b'?12:7;
            const div = document.createElement('div');
            div.style.cssText='position:absolute;transform:translate(-50%,-50%);pointer-events:none;';
            div.innerHTML=`
              <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="position:relative;width:${SZ*2}px;height:${SZ*2}px;">
                  <div style="position:absolute;inset:-${SZ*1.5}px;border-radius:50%;
                    background:radial-gradient(circle,${city.color}0f 0%,transparent 70%);
                    animation:mapPulse ${1.6+Math.random()*0.8}s ease-in-out infinite;"></div>
                  <div style="position:absolute;inset:-${SZ*0.8}px;border-radius:50%;
                    border:1px solid ${city.color}30;
                    animation:mapPulse ${1.2+Math.random()*0.6}s ease-in-out infinite alternate;"></div>
                  <div style="width:100%;height:100%;border-radius:50%;
                    background:radial-gradient(circle at 38% 35%,#ffffffd0 0%,${city.color} 45%,${city.color}80 90%);
                    box-shadow:0 0 ${SZ}px ${city.color}cc,0 0 ${SZ*2.5}px ${city.color}44;"></div>
                </div>
                <div style="margin-top:4px;color:#fff;font-size:${city.tier==='a'?12:city.tier==='b'?10:8}px;
                  font-weight:${city.tier==='a'?700:600};white-space:nowrap;
                  font-family:system-ui,-apple-system,sans-serif;
                  text-shadow:0 1px 8px #000,0 0 16px #000;">
                  ${city.name}
                </div>
              </div>`;
            this.nodeEls.set(city.id, div);
            this.getPanes()?.overlayMouseTarget.appendChild(div);
          });

          // Vehicles — 2 per route
          ROUTES.forEach((_,ri)=>{
            this.vehicles.push({ri,phase:Math.random(),spd:0.0007+Math.random()*0.0008,dir:1});
            this.vehicles.push({ri,phase:(Math.random()+0.5)%1,spd:0.0006+Math.random()*0.001,dir:-1});
          });

          this.startRAF();
        }

        draw(){
          const proj = this.getProjection();
          if(!proj) return;

          // Resize canvas
          if(this.canvas){
            const par = this.canvas.parentElement!;
            if(this.canvas.width!==par.offsetWidth)  this.canvas.width =par.offsetWidth;
            if(this.canvas.height!==par.offsetHeight) this.canvas.height=par.offsetHeight;
          }

          // Position node elements
          CITIES.forEach(city=>{
            const el = this.nodeEls.get(city.id);
            if(!el) return;
            const pt = proj.fromLatLngToDivPixel(new gm.LatLng(city.lat,city.lng));
            if(pt){ el.style.left=`${pt.x}px`; el.style.top=`${pt.y}px`; }
          });
        }

        startRAF(){
          const render = () => {
            this.rafId = requestAnimationFrame(render);
            if(!this.canvas) return;
            const ctx = this.canvas.getContext('2d')!;
            const W=this.canvas.width, H=this.canvas.height;
            if(!W||!H) return;
            ctx.clearRect(0,0,W,H);

            const proj = this.getProjection();
            if(!proj) return;

            // Project cities
            const pts: Record<string,{x:number,y:number}> = {};
            CITIES.forEach(c=>{
              const p = proj.fromLatLngToDivPixel(new gm.LatLng(c.lat,c.lng));
              if(p) pts[c.id]={x:p.x,y:p.y};
            });

            this.tick++;

            // ── Draw route glow beams ─────────────────────────
            ROUTES.forEach(([a,b])=>{
              const pa=pts[a], pb=pts[b];
              if(!pa||!pb) return;
              // Outer glow
              ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
              ctx.strokeStyle='rgba(245,166,35,0.12)'; ctx.lineWidth=8; ctx.stroke();
              // Inner line
              ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
              ctx.strokeStyle='rgba(245,166,35,0.45)'; ctx.lineWidth=1.2; ctx.stroke();
            });

            // ── City pulse rings ─────────────────────────────
            CITIES.forEach(c=>{
              const p=pts[c.id]; if(!p) return;
              const R = c.tier==='a'?28:c.tier==='b'?18:11;
              const phase = ((this.tick*0.018)%1);
              ctx.beginPath();
              ctx.arc(p.x,p.y, R*phase,0,Math.PI*2);
              const a = Math.round((1-phase)*100).toString(16).padStart(2,'0');
              ctx.strokeStyle=`${c.color}${a}`; ctx.lineWidth=1.2; ctx.stroke();
            });

            // ── Moving vehicle blips ─────────────────────────
            if(!paused){
              this.vehicles.forEach(v=>{
                const sp = v.spd * speed * (1+incidents.length*0.4);
                v.phase = (v.phase + sp) % 1;
              });
            }
            this.vehicles.forEach(v=>{
              const [a,b] = ROUTES[v.ri];
              const pa=pts[a], pb=pts[b]; if(!pa||!pb) return;
              const t = v.dir===1 ? v.phase : 1-v.phase;
              const x=pa.x+(pb.x-pa.x)*t, y=pa.y+(pb.y-pa.y)*t;
              // Trail
              for(let i=4;i>=0;i--){
                const tr = Math.max(0,t-(i+1)*0.04);
                const tx=pa.x+(pb.x-pa.x)*tr, ty=pa.y+(pb.y-pa.y)*tr;
                ctx.beginPath();
                ctx.arc(tx,ty,1+i*0.3,0,Math.PI*2);
                ctx.fillStyle=`rgba(0,212,245,${0.06*i})`; ctx.fill();
              }
              // Core blip
              ctx.beginPath(); ctx.arc(x,y,2.8,0,Math.PI*2);
              ctx.fillStyle='#00D4F5'; ctx.fill();
              // Glow halo
              ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2);
              ctx.fillStyle='rgba(0,212,245,0.18)'; ctx.fill();
            });
          };
          this.rafId = requestAnimationFrame(render);
        }

        onRemove(){
          cancelAnimationFrame(this.rafId);
          this.canvas?.parentNode?.removeChild(this.canvas);
          this.canvas=null;
          this.nodeEls.forEach(el=>el.parentNode?.removeChild(el));
          this.nodeEls.clear();
        }
      }

      const overlay = new MegaOverlay();
      overlay.setMap(map);

      if(alive) setReady(true);
    }).catch(e=>{ console.error(e); if(alive) setErr(true); });
    return ()=>{ alive=false; };
  },[]);// eslint-disable-line

  return (
    <div style={{position:'relative',width:'100%',height:'100%',background:'#06101f'}}>
      <div ref={containerRef} style={{width:'100%',height:'100%'}}/>
      {!ready&&!err&&(
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#06101f',zIndex:9}}>
          <div style={{textAlign:'center'}}>
            <div style={{width:40,height:40,border:`2px solid ${C.cyan}`,borderTopColor:'transparent',borderRadius:'50%',animation:'nmSpin 0.7s linear infinite',margin:'0 auto 12px'}}/>
            <div style={{color:C.cyan,fontSize:9,fontFamily:C.mono,letterSpacing:'0.18em'}}>INITIALISING NEURAL MAP</div>
          </div>
        </div>
      )}
      {err&&(
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#06101f',zIndex:9,gap:8}}>
          <div style={{color:C.red,fontSize:13,fontFamily:C.mono}}>⚠ MAP LOAD FAILED</div>
          <div style={{color:C.dim,fontSize:9,fontFamily:C.sys}}>Check VITE_GOOGLE_MAPS_API_KEY</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING MAP OVERLAY CARD
// ─────────────────────────────────────────────────────────────────────────────
function MapInfoCard({ sim }:{ sim:SimState }){
  return (
    <div style={{
      position:'absolute',top:14,left:14,zIndex:20,
      background:'rgba(2,8,16,0.88)',
      border:`1px solid rgba(0,212,245,0.22)`,
      borderRadius:12,padding:14,backdropFilter:'blur(18px)',
      minWidth:210,
    }}>
      {/* Glowing top accent line */}
      <div style={{position:'absolute',top:0,left:20,right:20,height:1,background:`linear-gradient(90deg,transparent,${C.cyan}80,transparent)`}}/>
      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:11}}>
        <Globe2 size={13} style={{color:C.cyan}}/>
        <span style={{color:'white',fontSize:12,fontWeight:700,fontFamily:C.sys}}>Jordan Mobility Network</span>
      </div>
      {[
        {lbl:'On Road',  val:sim.trips,          unit:'',   color:C.cyan,  pct:sim.trips/80},
        {lbl:'Health',   val:sim.health,          unit:'%',  color:C.grn,   pct:sim.health/100},
        {lbl:'Avg Speed',val:sim.avgSpeedKph,     unit:'km/h',color:C.gold, pct:sim.avgSpeedKph/120},
      ].map(row=>(
        <div key={row.lbl} style={{marginBottom:8}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3,alignItems:'center'}}>
            <span style={{color:C.dim,fontSize:8.5,fontFamily:C.sys}}>{row.lbl}</span>
            <span style={{color:row.color,fontSize:13,fontWeight:700,fontFamily:C.mono}}>
              {row.val}{row.unit}
            </span>
          </div>
          <div style={{height:2,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
            <motion.div animate={{width:`${Math.min(row.pct*100,100)}%`}} transition={{duration:0.8}}
              style={{height:'100%',background:row.color,borderRadius:2,boxShadow:`0 0 6px ${row.color}80`}}/>
          </div>
        </div>
      ))}
      <div style={{display:'flex',alignItems:'center',gap:5,marginTop:8,paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <span style={{width:5,height:5,borderRadius:'50%',background:C.grn,boxShadow:`0 0 5px ${C.grn}`,display:'inline-block',animation:'nmBlink 1.5s infinite'}}/>
        <span style={{color:C.grn,fontSize:8,fontFamily:C.mono,letterSpacing:'0.1em'}}>
          {CITIES.length} NODES · {ROUTES.length} ROUTES · LIVE
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEFT PANEL
// ─────────────────────────────────────────────────────────────────────────────
type TabId = 'demand'|'routes'|'agents'|'events';

const INCIDENTS_DEF: Array<{type:Incident;icon:any;label:string;color:string}> = [
  {type:'accident',   icon:AlertTriangle,   label:'Accident',   color:'#FF3B5C'},
  {type:'dust_storm', icon:CloudLightning,  label:'Dust Storm', color:'#F5A623'},
  {type:'checkpoint', icon:ShieldAlert,     label:'Checkpoint', color:'#BD5FFF'},
  {type:'roadblock',  icon:Gauge,           label:'Road Block', color:'#F59E0B'},
  {type:'closure',    icon:Waves,           label:'Closure',    color:'#DC2626'},
];

function LeftPanel({ sim, onMultiModal, onIncident, ar }:{
  sim:SimState; onMultiModal:()=>void; onIncident:(i:Incident)=>void; ar:boolean;
}){
  const [tab, setTab] = useState<TabId>('events');
  const [hist, setHist] = useState<number[]>(Array.from({length:24},(_,i)=>1+Math.sin(i*0.4)*0.3));
  useEffect(()=>{
    if(!sim.paused) setHist(p=>[...p.slice(1), 0.7+Math.random()*0.7]);
  },[sim.tick, sim.paused]);

  const d30 = hist[hist.length-1];
  const d2h = hist[hist.length-9]??0.22;
  const trend = d30>d2h+0.06?'Rising':d30<d2h-0.06?'Easing':'Stable';
  const trendColor = trend==='Rising'?C.red:trend==='Easing'?C.grn:C.gold;

  const tabs: Array<{id:TabId;label:string}> = [
    {id:'demand', label:'DEMAND'},
    {id:'routes', label:'ROUTES'},
    {id:'agents', label:'AGENTS'},
    {id:'events', label:'EVENTS'},
  ];

  return (
    <div style={{position:'relative',display:'flex',flexDirection:'column',background:C.pnl,borderRight:`1px solid ${C.brd}`,overflow:'hidden'}}>
      <HexGrid/>
      {/* Gradient left edge */}
      <div style={{position:'absolute',top:0,bottom:0,left:0,width:2,background:`linear-gradient(180deg,transparent,${C.cyan}60,${C.purp}60,transparent)`,zIndex:1}}/>

      {/* Tabs */}
      <div style={{position:'relative',zIndex:2,display:'flex',borderBottom:`1px solid ${C.brd}`,flexShrink:0}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:'10px 2px',
            background:tab===t.id?`${C.cyan}0d`:'transparent',
            borderBottom:`2px solid ${tab===t.id?C.cyan:'transparent'}`,
            color:tab===t.id?C.cyan:C.dim,
            fontSize:7.5,fontWeight:700,letterSpacing:'0.1em',cursor:'pointer',fontFamily:C.mono,
            transition:'all 0.2s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{position:'relative',zIndex:2,flex:1,overflowY:'auto',padding:'14px 13px 24px',scrollbarWidth:'none'}}>

        {/* ── AI DEMAND ARC GAUGE ─────────────────────────────── */}
        <section style={{marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <div>
              <div style={{color:C.cyan,fontSize:9,fontWeight:700,letterSpacing:'0.14em',fontFamily:C.mono}}>
                ⚡ DEMAND FORECAST
              </div>
              <div style={{color:C.dim,fontSize:8,marginTop:2,fontFamily:C.mono}}>توقعات الطلب · AI</div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{color:trendColor,fontSize:11,fontWeight:700,fontFamily:C.mono}}>{trend}</div>
              <Spark data={hist.slice(-12)} color={trendColor}/>
            </div>
          </div>
          <ArcGauge value={d30} max={2} label="Demand Multiplier" sublabel="+30 min forecast" color={C.cyan}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10}}>
            {[
              {lbl:'+30 min',val:`${d30.toFixed(2)}×`,col:C.cyan},
              {lbl:'+2 hours',val:`${d2h.toFixed(2)}×`,col:C.purp},
            ].map(item=>(
              <div key={item.lbl} style={{
                background:C.card,border:`1px solid ${item.col}22`,borderRadius:8,
                padding:'8px 10px',textAlign:'center',
                boxShadow:`inset 0 0 20px ${item.col}08`,
              }}>
                <div style={{color:C.dim,fontSize:7,letterSpacing:'0.08em',marginBottom:4,fontFamily:C.mono}}>{item.lbl}</div>
                <div style={{color:item.col,fontSize:18,fontWeight:700,fontFamily:C.mono}}>{item.val}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.brd},transparent)`,margin:'12px 0'}}/>

        {/* ── MULTI-MODAL ─────────────────────────────────────── */}
        <div style={{
          background:`linear-gradient(135deg,${C.gold}0a,${C.purp}0a)`,
          border:`1px solid ${C.gold}22`,borderRadius:10,padding:12,marginBottom:14,
        }}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:7}}>
            <div>
              <div style={{color:C.gold,fontSize:9,fontWeight:700,letterSpacing:'0.1em',fontFamily:C.mono}}>◈ MULTI-MODAL</div>
              <div style={{color:C.dim,fontSize:8,fontFamily:C.mono,marginTop:2}}>رحلات متعددة الوسائط</div>
            </div>
            <button onClick={onMultiModal} style={{
              background:sim.multiModal?`${C.grn}18`:`rgba(255,255,255,0.05)`,
              border:`1px solid ${sim.multiModal?C.grn:C.cbrd}`,
              borderRadius:20,padding:'4px 12px',
              color:sim.multiModal?C.grn:C.dim,
              fontSize:9,fontWeight:700,cursor:'pointer',fontFamily:C.mono,
              boxShadow:sim.multiModal?`0 0 12px ${C.grn}30`:'none',
              transition:'all 0.2s',
            }}>
              {sim.multiModal?'● ON':'○ OFF'}
            </button>
          </div>
          <div style={{color:'rgba(255,255,255,0.65)',fontSize:10,fontFamily:C.sys,lineHeight:1.5}}>
            Travelers carry packages en route
          </div>
          <div style={{display:'flex',gap:10,marginTop:8}}>
            <span style={{color:C.gold,fontSize:8,fontFamily:C.mono}}>Pkg/Trip: 0.41</span>
            <span style={{color:C.dim,fontSize:8,fontFamily:C.mono}}>·</span>
            <span style={{color:C.cyan,fontSize:8,fontFamily:C.mono}}>Cap: 3P+1📦</span>
          </div>
        </div>

        <div style={{height:1,background:`linear-gradient(90deg,transparent,${C.brd},transparent)`,margin:'12px 0'}}/>

        {/* ── ROAD INCIDENTS ───────────────────────────────────── */}
        <section>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:10}}>
            <AlertTriangle size={11} style={{color:C.red}}/>
            <div>
              <div style={{color:C.red,fontSize:9,fontWeight:700,letterSpacing:'0.12em',fontFamily:C.mono}}>ROAD INCIDENTS</div>
              <div style={{color:C.dim,fontSize:7.5,fontFamily:C.mono}}>حوادث الطريق</div>
            </div>
            {sim.incidents.length>0&&(
              <div style={{marginLeft:'auto',background:`${C.red}18`,border:`1px solid ${C.red}40`,borderRadius:20,padding:'2px 7px',color:C.red,fontSize:7.5,fontFamily:C.mono,animation:'nmBlink 1.2s infinite'}}>
                {sim.incidents.length} ACTIVE
              </div>
            )}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {INCIDENTS_DEF.map(inc=>{
              const Icon = inc.icon;
              const on = sim.incidents.includes(inc.type);
              return (
                <button key={inc.type} onClick={()=>onIncident(inc.type)} style={{
                  display:'flex',alignItems:'center',gap:10,padding:'9px 12px',
                  background:on?`${inc.color}16`:C.card,
                  border:`1px solid ${on?inc.color+'44':C.cbrd}`,
                  borderRadius:9,cursor:'pointer',transition:'all 0.2s',
                  boxShadow:on?`0 0 14px ${inc.color}20,inset 0 0 20px ${inc.color}08`:'none',
                }}>
                  <Icon size={13} style={{color:on?inc.color:C.dim,flexShrink:0}}/>
                  <span style={{color:on?inc.color:'rgba(255,255,255,0.65)',fontSize:10,fontWeight:on?700:500,fontFamily:C.sys,flex:1,textAlign:'left'}}>
                    {inc.label}
                  </span>
                  <span style={{
                    width:7,height:7,borderRadius:'50%',
                    background:on?inc.color:'transparent',
                    border:on?'none':`1px solid ${C.cbrd}`,
                    boxShadow:on?`0 0 8px ${inc.color}`:'none',
                    flexShrink:0,display:'inline-block',
                    animation:on?'nmBlink 1s infinite':'none',
                  }}/>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RIGHT PANEL — BENTO GRID
// ─────────────────────────────────────────────────────────────────────────────
function RightPanel({ sim, onSpeed, ar }:{ sim:SimState; onSpeed:(s:number)=>void; ar:boolean }){
  const period   = periodLabel(sim.timeMins);
  const pctTime  = (sim.timeMins/1440)*100;
  const tripHist = useRef<number[]>(Array.from({length:16},()=>47));
  useEffect(()=>{
    tripHist.current = [...tripHist.current.slice(1), sim.trips];
  },[sim.trips]);

  return (
    <div style={{position:'relative',background:C.pnl,borderLeft:`1px solid ${C.brd}`,overflowY:'auto',padding:12,display:'flex',flexDirection:'column',gap:10,scrollbarWidth:'none'}}>
      <HexGrid/>
      <div style={{position:'absolute',top:0,bottom:0,right:0,width:2,background:`linear-gradient(180deg,transparent,${C.purp}60,${C.cyan}60,transparent)`,zIndex:1}}/>

      {/* ── HEALTH + TRIPS row (bento) ─── */}
      <div style={{position:'relative',zIndex:2,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {/* Health donut */}
        <div style={{background:C.card,border:`1px solid ${C.grn}22`,borderRadius:12,padding:'12px 8px',textAlign:'center',boxShadow:`inset 0 0 30px ${C.grn}06`}}>
          <DonutChart pct={sim.health/100} color={C.grn} label="Health" value={`${sim.health}%`}/>
        </div>
        {/* Active trips */}
        <div style={{background:C.card,border:`1px solid ${C.cyan}22`,borderRadius:12,padding:12,display:'flex',flexDirection:'column',justifyContent:'space-between',boxShadow:`inset 0 0 30px ${C.cyan}06`}}>
          <div style={{color:C.dim,fontSize:8,fontFamily:C.mono,letterSpacing:'0.1em'}}>ACTIVE TRIPS</div>
          <div style={{textAlign:'center'}}>
            <AnimNum val={sim.trips} color={C.cyan} size={32}/>
          </div>
          <Spark data={tripHist.current} color={C.cyan}/>
        </div>
      </div>

      {/* ── AVG SPEED full-width ─── */}
      <div style={{position:'relative',zIndex:2,background:C.card,border:`1px solid ${C.gold}22`,borderRadius:12,padding:12,boxShadow:`inset 0 0 30px ${C.gold}06`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{color:C.dim,fontSize:8,fontFamily:C.mono,letterSpacing:'0.1em',marginBottom:3}}>AVG SPEED</div>
            <div style={{color:C.dim,fontSize:7.5,fontFamily:C.mono}}>متوسط السرعة</div>
          </div>
          <div style={{textAlign:'right'}}>
            <AnimNum val={sim.avgSpeedKph} color={C.gold} size={28} unit=" km/h"/>
          </div>
        </div>
        <div style={{marginTop:9,height:3,background:'rgba(255,255,255,0.07)',borderRadius:2}}>
          <motion.div animate={{width:`${(sim.avgSpeedKph/120)*100}%`}} transition={{duration:0.7}}
            style={{height:'100%',background:`linear-gradient(90deg,${C.gold}80,${C.gold})`,borderRadius:2,boxShadow:`0 0 8px ${C.gold}60`}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:4,color:C.dim,fontSize:7,fontFamily:C.mono}}>
          <span>0</span><span>60</span><span>120 km/h</span>
        </div>
      </div>

      {/* ── TIME CARD ─── */}
      <div style={{position:'relative',zIndex:2,background:`linear-gradient(135deg,${C.card},rgba(245,166,35,0.04))`,border:`1px solid ${C.gold}22`,borderRadius:12,padding:12}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
          <div>
            <div style={{color:C.dim,fontSize:8,fontFamily:C.mono,letterSpacing:'0.1em',marginBottom:2}}>SIM TIME</div>
            <div style={{color:C.dim,fontSize:7.5,fontFamily:C.mono}}>وقت المحاكاة</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{color:C.gold,fontSize:22,fontWeight:700,fontFamily:C.mono,lineHeight:1}}>
              {fmtTime(sim.timeMins)}
            </div>
            <div style={{marginTop:4}}>
              <NeonBadge label={period} color={C.cyan}/>
            </div>
          </div>
        </div>
        {/* Timeline bar */}
        <div style={{position:'relative',height:14}}>
          <div style={{position:'absolute',top:5,left:0,right:0,height:3,borderRadius:2,background:'rgba(255,255,255,0.07)'}}/>
          <motion.div animate={{left:`${pctTime}%`}} transition={{duration:0.5}}
            style={{position:'absolute',top:1,width:11,height:11,borderRadius:'50%',background:C.gold,boxShadow:`0 0 10px ${C.gold}`,transform:'translateX(-50%)'}}/>
          <div style={{position:'absolute',top:5,left:0,width:`${pctTime}%`,height:3,background:`linear-gradient(90deg,${C.cyan}60,${C.gold})`,borderRadius:2}}/>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:4,color:C.dim,fontSize:7,fontFamily:C.mono}}>
          {['12a','6a','12p','6p','12a'].map(t=><span key={t}>{t}</span>)}
        </div>
      </div>

      {/* ── SIM SPEED ─── */}
      <div style={{position:'relative',zIndex:2,background:C.card,border:`1px solid ${C.cbrd}`,borderRadius:12,padding:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div>
            <div style={{color:C.dim,fontSize:8,fontFamily:C.mono,letterSpacing:'0.1em'}}>SIM SPEED</div>
            <div style={{color:C.dim,fontSize:7.5,fontFamily:C.mono,marginTop:1}}>سرعة المحاكاة</div>
          </div>
          <AnimNum val={Math.round(sim.speed*10)/10} color={C.cyan} size={20} unit="×"/>
        </div>
        <div style={{display:'flex',gap:4}}>
          {[0.5,1,1.2,2,5].map(s=>(
            <button key={s} onClick={()=>onSpeed(s)} style={{
              flex:1,padding:'5px 0',fontSize:8,fontWeight:700,cursor:'pointer',
              fontFamily:C.mono,borderRadius:6,transition:'all 0.15s',
              background:sim.speed===s?`${C.cyan}18`:C.card,
              border:`1px solid ${sim.speed===s?C.cyan:C.cbrd}`,
              color:sim.speed===s?C.cyan:C.dim,
              boxShadow:sim.speed===s?`0 0 10px ${C.cyan}30`:'none',
            }}>{s}×</button>
          ))}
        </div>
      </div>

      {/* ── TRAFFIC MIX ─── */}
      <div style={{position:'relative',zIndex:2,display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[
          {lbl:'Traffic Vol',sub:'حجم الحركة',val:`${Math.round(sim.traffic/1000)}K`,pct:sim.traffic/20000,col:C.purp},
          {lbl:'Pkg Share',  sub:'نسبة الطرود',val:`${sim.pkgShare}%`,             pct:sim.pkgShare/100,  col:C.gold},
        ].map(item=>(
          <div key={item.lbl} style={{background:C.card,border:`1px solid ${item.col}22`,borderRadius:12,padding:12,boxShadow:`inset 0 0 20px ${item.col}06`}}>
            <DonutChart pct={item.pct} color={item.col} label={item.lbl} value={item.val}/>
          </div>
        ))}
      </div>

      {/* ── NETWORK STATUS ─── */}
      <div style={{position:'relative',zIndex:2,background:`linear-gradient(135deg,${C.grn}0a,${C.cyan}0a)`,border:`1px solid ${C.grn}22`,borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',gap:10}}>
        <Activity size={13} style={{color:C.grn,flexShrink:0}}/>
        <div style={{flex:1}}>
          <div style={{color:C.grn,fontSize:9,fontWeight:700,letterSpacing:'0.1em',fontFamily:C.mono}}>NETWORK ONLINE</div>
          <div style={{color:C.dim,fontSize:8,fontFamily:C.sys,marginTop:2}}>
            {CITIES.length} nodes · {ROUTES.length} corridors · Jordan
          </div>
        </div>
        <NeonBadge label="LIVE" color={C.grn} blink/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT TICKER (scrolling bottom tape)
// ─────────────────────────────────────────────────────────────────────────────
const TICKER_EVENTS = [
  '🚗 Amman → Aqaba  3 seats · JOD 8.00/seat',
  '📦 Package  Amman → Irbid  0.8 kg · JOD 3.50',
  '✅ Trip verified  Zarqa → Mafraq  QR scan OK',
  '🕌 Prayer stop  Madaba mosque  15 min · Asr',
  '⭐ Rating  Ali M. rated 5 / 5  Amman → Dead Sea',
  '🚗 Irbid → Amman  2 seats · JOD 4.50/seat',
  '📦 Package  Petra → Ma\'an  2.1 kg · JOD 5.00',
  '🔴 Incident cleared  Desert Hwy km 200  +4 min delay',
  '💳 Payment  JOD 24.00  Amman → Aqaba  3 passengers',
  '🌙 Ramadan mode ON  Iftar ETA 18:02  arrive before',
];

function EventTicker(){
  return (
    <div style={{
      height:28,background:'rgba(4,12,24,0.97)',
      borderTop:`1px solid ${C.brd}`,
      display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,
      position:'relative',
    }}>
      {/* fade masks */}
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:40,background:'linear-gradient(90deg,rgba(4,12,24,1),transparent)',zIndex:2}}/>
      <div style={{position:'absolute',right:0,top:0,bottom:0,width:40,background:'linear-gradient(270deg,rgba(4,12,24,1),transparent)',zIndex:2}}/>
      {/* Label */}
      <div style={{flexShrink:0,padding:'0 12px',color:C.red,fontSize:8,fontWeight:700,fontFamily:C.mono,letterSpacing:'0.12em',borderRight:`1px solid ${C.brd}`,height:'100%',display:'flex',alignItems:'center',zIndex:3}}>
        ▶ LIVE FEED
      </div>
      {/* Scrolling content */}
      <div style={{flex:1,overflow:'hidden',position:'relative'}}>
        <div style={{display:'flex',animation:'tickerScroll 40s linear infinite',whiteSpace:'nowrap',alignItems:'center',height:'100%'}}>
          {[...TICKER_EVENTS,...TICKER_EVENTS].map((ev,i)=>(
            <span key={`tick-${i}`} style={{color:C.dim,fontSize:9,fontFamily:C.mono,padding:'0 28px'}}>
              {ev}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export function MobilityHubs(){
  const { language } = useLanguage();
  const ar = language === 'ar';
  const mountedRef = useRef(true);

  const [sim, setSim] = useState<SimState>({
    timeMins:480, tick:0, paused:false, speed:1.2,
    trips:47, health:41, traffic:15000, pkgShare:28,
    avgSpeedKph:72, multiModal:true, incidents:[],
  });
  const simRef = useRef(sim);
  simRef.current = sim;

  // ── Seed from real backend on mount ───────────────────────────────────────
  useEffect(()=>{
    mountedRef.current = true;
    const fetchSeed = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/overview`, {
          headers:{ 'Content-Type':'application/json' },
        });
        if(!res.ok || !mountedRef.current) return;
        const data = await res.json();
        const liveTrips  = data?.activeTrips   ?? data?.todayTrips  ?? null;
        const livePkgs   = data?.activePackages ?? data?.todayPkgs   ?? null;
        if(mountedRef.current && (liveTrips !== null || livePkgs !== null)){
          setSim(p=>({
            ...p,
            trips:    liveTrips !== null ? Math.max(0, Number(liveTrips))   : p.trips,
            pkgShare: livePkgs  !== null ? Math.min(80, Number(livePkgs))   : p.pkgShare,
          }));
        }
      } catch {
        // Backend unavailable — simulation runs on seed defaults
      }
    };
    fetchSeed();
    return ()=>{ mountedRef.current = false; };
  },[]);

  // ── Simulation engine ─────────────────────────────────────────────────────
  useEffect(()=>{
    const id = setInterval(()=>{
      if(simRef.current.paused) return;
      setSim(p=>{
        const pen = p.incidents.length * 3;
        const t   = p.tick;
        return {
          ...p,
          timeMins:    (p.timeMins + Math.ceil(p.speed)) % 1440,
          tick:        p.tick + 1,
          trips:       Math.round(Math.max(0,  p.trips + Math.sin(t*0.03)*3 + (Math.random()-0.5)*3 - pen)),
          health:      Math.round(Math.max(10, p.health + Math.sin(t*0.02)*2 - pen*0.5)),
          traffic:     Math.round(15000 + Math.sin(t*0.04)*2200),
          pkgShare:    Math.round(Math.max(0, Math.min(80, p.pkgShare + Math.sin(t*0.05)*1.5))),
          avgSpeedKph: Math.round(Math.max(20, 72 + Math.sin(t*0.07)*12 - pen*2)),
        };
      });
    },1000);
    return ()=>clearInterval(id);
  },[]);

  const handleIncident = useCallback((inc:Incident)=>{
    setSim(p=>({...p,incidents:p.incidents.includes(inc)?p.incidents.filter(i=>i!==inc):[...p.incidents,inc]}));
  },[]);

  return (
    <div dir={ar?'rtl':'ltr'} style={{height:'100vh',display:'flex',flexDirection:'column',background:C.bg,overflow:'hidden',fontFamily:C.sys}}>

      {/* ── GLOBAL ANIMATIONS ──────────────────────────────────── */}
      <style>{`
        @keyframes nmBlink    { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes nmSpin     { to{transform:rotate(360deg)} }
        @keyframes nmScan     { 0%{transform:translateY(-100%)} 100%{transform:translateY(200vh)} }
        @keyframes nmGradShft { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes mapPulse   { 0%,100%{opacity:0.4;transform:translate(-50%,-50%) scale(0.85)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)} }
        @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .nm-panel::-webkit-scrollbar { display:none }
      `}</style>

      {/* ── CRT SCANLINE overlay ────────────────────────────────── */}
      <div style={{
        position:'fixed',inset:0,zIndex:9999,pointerEvents:'none',
        background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)',
        mixBlendMode:'overlay',
      }}/>
      {/* Scan sweep */}
      <div style={{
        position:'fixed',left:0,right:0,height:60,zIndex:9998,pointerEvents:'none',
        background:'linear-gradient(180deg,transparent,rgba(0,212,245,0.025),transparent)',
        animation:'nmScan 8s linear infinite',
      }}/>

      {/* ══ HEADER ════════════════════════════════════════════════ */}
      <header style={{
        flexShrink:0,height:56,display:'flex',alignItems:'center',padding:'0 16px',gap:10,zIndex:100,
        background:'rgba(2,8,16,0.98)',borderBottom:`1px solid ${C.brd}`,position:'relative',
      }}>
        {/* Animated gradient top line */}
        <div style={{
          position:'absolute',top:0,left:0,right:0,height:2,
          background:`linear-gradient(90deg,${C.cyan},${C.purp},${C.gold},${C.cyan})`,
          backgroundSize:'300% 300%',animation:'nmGradShft 4s ease infinite',
        }}/>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:9,marginRight:4}}>
          <div style={{
            width:34,height:34,borderRadius:9,
            background:`linear-gradient(135deg,${C.cyan}22,${C.purp}22)`,
            border:`1px solid ${C.cyan}40`,
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,
            boxShadow:`0 0 16px ${C.cyan}20`,
          }}>🌐</div>
          <div>
            <div style={{color:'white',fontSize:13.5,fontWeight:800,letterSpacing:'-0.01em',lineHeight:1.15}}>
              واصل <span style={{color:C.cyan}}>|</span> Mobility OS
            </div>
            <div style={{color:C.dim,fontSize:7,letterSpacing:'0.16em',fontFamily:C.mono}}>
              JORDAN DIGITAL TWIN · NEURAL COMMAND
            </div>
          </div>
        </div>

        <div style={{flex:1}}/>

        {/* Status chips */}
        <NeonBadge label="LIVE" color={C.grn} blink/>

        {/* Time */}
        <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.gold}30`,borderRadius:9,padding:'4px 11px',boxShadow:`0 0 14px ${C.gold}10`}}>
          <div style={{width:5,height:5,borderRadius:1,background:C.gold}}/>
          <span style={{color:C.gold,fontSize:14,fontWeight:700,fontFamily:C.mono}}>
            {fmtTime(sim.timeMins)}
          </span>
          <NeonBadge label={periodLabel(sim.timeMins)} color={C.cyan}/>
        </div>

        {/* Trips */}
        <div style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.cyan}30`,borderRadius:9,padding:'4px 11px'}}>
          <Zap size={11} style={{color:C.cyan}}/>
          <div>
            <div style={{color:C.cyan,fontSize:15,fontWeight:700,fontFamily:C.mono,lineHeight:1}}>{sim.trips}</div>
            <div style={{color:C.dim,fontSize:7,fontFamily:C.mono,lineHeight:1}}>trips</div>
          </div>
        </div>

        {/* Health */}
        <div style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,0.05)',border:`1px solid ${C.grn}30`,borderRadius:9,padding:'4px 11px'}}>
          <Package size={11} style={{color:C.grn}}/>
          <div>
            <div style={{color:C.grn,fontSize:15,fontWeight:700,fontFamily:C.mono,lineHeight:1}}>{sim.health}%</div>
            <div style={{color:C.dim,fontSize:7,fontFamily:C.mono,lineHeight:1}}>health</div>
          </div>
        </div>

        {/* Incident alert */}
        {sim.incidents.length>0&&(
          <div style={{
            display:'flex',alignItems:'center',gap:5,
            background:`${C.red}15`,border:`1px solid ${C.red}40`,
            borderRadius:9,padding:'4px 11px',
            color:C.red,fontSize:9,fontWeight:700,fontFamily:C.mono,
            animation:'nmBlink 0.9s infinite',
          }}>
            <AlertTriangle size={10}/>
            {sim.incidents.length} INCIDENT{sim.incidents.length>1?'S':''}
          </div>
        )}

        {/* Controls */}
        <button onClick={()=>setSim(p=>({...p,paused:!p.paused}))} style={{
          background:sim.paused?`${C.cyan}18`:'rgba(255,255,255,0.06)',
          border:`1px solid ${sim.paused?C.cyan:'rgba(255,255,255,0.14)'}`,
          borderRadius:9,padding:'6px 14px',
          color:sim.paused?C.cyan:'rgba(255,255,255,0.8)',
          fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:C.mono,
          display:'flex',alignItems:'center',gap:5,transition:'all 0.18s',
          boxShadow:sim.paused?`0 0 14px ${C.cyan}30`:'none',
        }}>
          {sim.paused?<><Play size={10}/> RESUME</>:<><Pause size={10}/> PAUSE</>}
        </button>

        <button onClick={()=>setSim(p=>({...p,timeMins:480,tick:0,trips:47,health:41,avgSpeedKph:72,incidents:[]}))}
          style={{
            background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:9,padding:'6px 14px',
            color:'rgba(200,220,255,0.65)',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:C.mono,
            display:'flex',alignItems:'center',gap:5,
          }}>
          <RotateCcw size={10}/> RESET
        </button>
      </header>

      {/* ══ THREE-COLUMN BODY ════════════════════════════════════ */}
      <div style={{flex:1,display:'grid',gridTemplateColumns:'260px 1fr 284px',minHeight:0,overflow:'hidden'}}>

        <LeftPanel
          sim={sim}
          onMultiModal={()=>setSim(p=>({...p,multiModal:!p.multiModal}))}
          onIncident={handleIncident}
          ar={ar}
        />

        {/* CENTER */}
        <div style={{position:'relative',overflow:'hidden'}}>
          <MobilityMap paused={sim.paused} incidents={sim.incidents} speed={sim.speed}/>
          <MapInfoCard sim={sim}/>
          {/* Coord strip */}
          <div style={{
            position:'absolute',bottom:0,left:0,right:0,height:22,
            background:'rgba(2,8,16,0.9)',borderTop:`1px solid ${C.brd}`,
            display:'flex',alignItems:'center',justifyContent:'space-between',
            padding:'0 12px',fontSize:8,fontFamily:C.mono,color:C.dim,
          }}>
            <span>⊕ 37SMB 31954 35911</span>
            <span>SCALE 1:50 000 · JO GRID · WGS84</span>
            <span style={{color:sim.paused?C.red:C.grn,animation:sim.paused?'nmBlink 1s infinite':'none'}}>
              {sim.paused?'⏸ PAUSED':`● TICK ${sim.tick}`}
            </span>
          </div>
        </div>

        <RightPanel sim={sim} onSpeed={s=>setSim(p=>({...p,speed:s}))} ar={ar}/>
      </div>

      {/* ══ TICKER ═══════════════════════════════════════════════ */}
      <EventTicker/>
    </div>
  );
}

export default MobilityHubs;
