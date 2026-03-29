/**
 * Wasel — Jordan Mobility OS  v8.0
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ PERFORMANCE  — Canvas2D GPU particle layer · O(1) routeMap · DPR retina
 * ✅ RAF DECOUPLED — mirror-refs for paused/hr/mult/live/bp → dep array=[W,H]
 * ✅ MOBILE        — touch pinch-zoom/pan · bottom-sheet · compact nav
 * ✅ RTL           — full dir="rtl" · L() helper · logical CSS
 * ✅ UX            — collapsible cards · kbd shortcuts · animated counters
 * ✅ MAP TILES     — CartoDB dark tiles via Leaflet · geo-accurate overlay
 * ✅ BOOKING       — 5-step cinematic booking flow → QR ticket (BookingModal)
 * ✅ LIVE DATA     — Supabase-ready real-time event ticker w/ proper cleanup
 * ✅ GxP           — mountedRef guards on ALL async/RAF/Leaflet operations
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Pause, RotateCcw, Radio, Clock, ZoomIn, ZoomOut,
  Crosshair, X, Zap, Activity,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Bus, Car, Package, MoreHorizontal, BarChart2, BrainCircuit,
  Keyboard, Menu, ArrowUpRight, Ticket,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { BookingModal } from './BookingModal';
import brandMark from '../../assets/4a69b221f1cb55f2d763abcfb9817a7948272c0c.png';

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:'#020810', bgMap:'#03091A',
  nav:'rgba(2,8,16,0.98)', glass:'rgba(6,15,35,0.88)', glassMd:'rgba(8,19,44,0.92)',
  bdr:'rgba(255,255,255,0.07)', bdrA:'rgba(0,180,255,0.16)', bdrB:'rgba(43,143,255,0.24)',
  ride:'#2B8FFF', rideLt:'#82BFFF',
  pkg:'#F5A623',  pkgLt:'#FFD07A',
  traf:'#8B5CF6', trafLt:'#C4B5FD',
  green:'#00E87A', orange:'#FF7722', red:'#FF2D55', cyan:'#00D4FF',
  t0:'#FFFFFF', t1:'rgba(255,255,255,0.85)',
  t2:'rgba(255,255,255,0.55)', t3:'rgba(255,255,255,0.30)',
  t4:'rgba(255,255,255,0.14)',
  F:"-apple-system,'Inter',ui-sans-serif,'Cairo',sans-serif",
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
interface City{id:number;name:string;ar:string;lat:number;lon:number;pop:number;tier:1|2|3;}
interface Route{id:string;from:number;to:number;km:number;mins:number;fare:number;pop:'high'|'med'|'low';}

const CITIES:City[]=[
  {id:0, name:'Amman',    ar:'عمّان',       lat:31.9454,lon:35.9284,pop:4200,tier:1},
  {id:1, name:'Irbid',    ar:'إربد',        lat:32.5556,lon:35.8500,pop:1800,tier:1},
  {id:2, name:'Zarqa',    ar:'الزرقاء',     lat:32.0728,lon:36.0882,pop: 700,tier:1},
  {id:3, name:'Aqaba',    ar:'العقبة',      lat:29.5267,lon:35.0081,pop: 200,tier:1},
  {id:4, name:'Jerash',   ar:'جرش',         lat:32.2718,lon:35.8965,pop:  55,tier:2},
  {id:5, name:'Ajloun',   ar:'عجلون',       lat:32.3326,lon:35.7519,pop:  45,tier:2},
  {id:6, name:'Madaba',   ar:'مادبا',       lat:31.7197,lon:35.7936,pop:  65,tier:2},
  {id:7, name:'Karak',    ar:'الكرك',       lat:31.1853,lon:35.7048,pop:  95,tier:2},
  {id:8, name:'Tafila',   ar:'الطفيلة',     lat:30.8375,lon:35.6042,pop:  35,tier:2},
  {id:9, name:"Ma'an",    ar:'معان',        lat:30.1962,lon:35.7360,pop:  55,tier:2},
  {id:10,name:'Mafraq',   ar:'المفرق',      lat:32.3406,lon:36.2074,pop:  65,tier:2},
  {id:11,name:'Salt',     ar:'السلط',       lat:32.0390,lon:35.7270,pop: 110,tier:2},
  {id:12,name:'Dead Sea', ar:'البحر الميت', lat:31.5590,lon:35.4730,pop:  10,tier:3},
  {id:13,name:'Petra',    ar:'البتراء',     lat:30.3285,lon:35.4444,pop:  12,tier:3},
  {id:14,name:'Wadi Rum', ar:'وادي رم',     lat:29.6100,lon:35.4200,pop:   5,tier:3},
  {id:15,name:'Ramtha',   ar:'الرمثا',      lat:32.5570,lon:36.0190,pop:  40,tier:2},
];
const ROUTES:Route[]=[
  {id:'a-i',  from:0,to:1,  km:85,  mins:70, fare:6.0, pop:'high'},
  {id:'a-z',  from:0,to:2,  km:25,  mins:30, fare:3.0, pop:'high'},
  {id:'a-aq', from:0,to:3,  km:330, mins:240,fare:25.0,pop:'high'},
  {id:'a-j',  from:0,to:4,  km:48,  mins:45, fare:4.5, pop:'med' },
  {id:'a-aj', from:0,to:5,  km:73,  mins:65, fare:5.5, pop:'med' },
  {id:'a-m',  from:0,to:6,  km:33,  mins:35, fare:3.5, pop:'high'},
  {id:'a-k',  from:0,to:7,  km:120, mins:90, fare:9.0, pop:'med' },
  {id:'a-tf', from:0,to:8,  km:183, mins:135,fare:14.0,pop:'low' },
  {id:'a-mn', from:0,to:9,  km:218, mins:165,fare:16.0,pop:'med' },
  {id:'a-mf', from:0,to:10, km:80,  mins:70, fare:6.0, pop:'med' },
  {id:'a-s',  from:0,to:11, km:28,  mins:35, fare:3.5, pop:'high'},
  {id:'a-ds', from:0,to:12, km:65,  mins:60, fare:5.0, pop:'med' },
  {id:'i-j',  from:1,to:4,  km:22,  mins:25, fare:2.5, pop:'high'},
  {id:'i-aj', from:1,to:5,  km:28,  mins:30, fare:3.0, pop:'high'},
  {id:'i-mf', from:1,to:10, km:70,  mins:60, fare:5.5, pop:'med' },
  {id:'i-r',  from:1,to:15, km:18,  mins:20, fare:2.0, pop:'high'},
  {id:'z-mf', from:2,to:10, km:55,  mins:50, fare:4.5, pop:'med' },
  {id:'m-k',  from:6,to:7,  km:85,  mins:75, fare:6.5, pop:'low' },
  {id:'k-tf', from:7,to:8,  km:60,  mins:55, fare:5.0, pop:'low' },
  {id:'tf-mn',from:8,to:9,  km:85,  mins:70, fare:6.5, pop:'low' },
  {id:'mn-aq',from:9,to:3,  km:120, mins:90, fare:9.0, pop:'med' },
  {id:'mn-p', from:9,to:13, km:30,  mins:30, fare:3.0, pop:'med' },
  {id:'p-aq', from:13,to:3, km:125, mins:100,fare:9.5, pop:'med' },
  {id:'aq-wr',from:3,to:14, km:60,  mins:50, fare:5.0, pop:'med' },
  {id:'s-aj', from:11,to:5, km:40,  mins:40, fare:3.5, pop:'low' },
  {id:'z-i',  from:2,to:1,  km:78,  mins:60, fare:6.0, pop:'med' },
];

const JO_BORDER:[number,number][]=[
  [32.56,35.54],[32.57,35.97],[32.56,36.25],[32.56,38.00],[32.00,38.80],
  [31.50,39.20],[30.80,39.00],[30.00,38.50],[29.50,37.50],[29.20,36.50],
  [29.18,35.30],[29.53,35.01],[30.00,34.95],[30.85,35.05],[31.25,35.10],
  [31.56,35.47],[31.95,35.54],[32.20,35.54],[32.56,35.54],
];

// ─────────────────────────────────────────────────────────────────────────────
// GEO + MATH (fallback when Leaflet not ready)
// ─────────────────────────────────────────────────────────────────────────────
const LAT_MAX=32.85,LAT_MIN=29.10,LON_MIN=34.85,LON_MAX=39.30,PAD=52;
const toX=(lon:number,W:number)=>PAD+(lon-LON_MIN)/(LON_MAX-LON_MIN)*(W-PAD*2);
const toY=(lat:number,H:number)=>PAD+(LAT_MAX-lat)/(LAT_MAX-LAT_MIN)*(H-PAD*2);

type V2={x:number;y:number};
const bz=(t:number,a:V2,c:V2,b:V2):V2=>{const m=1-t;return{x:m*m*a.x+2*m*t*c.x+t*t*b.x,y:m*m*a.y+2*m*t*c.y+t*t*b.y};};
const cpOf=(a:V2,b:V2,s:number):V2=>{const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,l=Math.hypot(dx,dy)||1,d=Math.min(60,l*.22);return{x:mx+(-dy/l)*d*s,y:my+(dx/l)*d*s};};
const hourDemand=(h:number)=>Math.max(.18,1.9*Math.exp(-.5*((h-8)/1.6)**2)+2.1*Math.exp(-.5*((h-18)/1.5)**2));
function hexPoly(ctx:CanvasRenderingContext2D,cx:number,cy:number,r:number,a0=0){ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3+a0;i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));}ctx.closePath();}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION
// ─────────────────────────────────────────────────────────────────────────────
interface SimCity  extends City{x:number;y:number;pulse:number;demand:number;pingT:number;}
interface SimRoute extends Route{cong:number;speed:number;paxF:number;pkgF:number;animOff:number;pA:V2;pB:V2;cp:V2;}
interface Particle{id:number;routeId:string;kind:'pax'|'pkg';t:number;spd:number;}
interface Sim{cities:SimCity[];routes:SimRoute[];routeMap:Map<string,SimRoute>;particles:Particle[];trips:number;scanY:number;tick:number;}

function buildSim(W:number,H:number,lod=1):Sim{
  const cities:SimCity[]=CITIES.map(c=>({...c,x:toX(c.lon,W),y:toY(c.lat,H),pulse:Math.random()*Math.PI*2,demand:c.pop/4200,pingT:Math.random()*4}));
  const routes:SimRoute[]=ROUTES.map(r=>{
    const pA={x:cities[r.from]?.x??0,y:cities[r.from]?.y??0};
    const pB={x:cities[r.to]?.x??0,y:cities[r.to]?.y??0};
    return{...r,cong:0,speed:110,paxF:0,pkgF:0,animOff:Math.random(),pA,pB,cp:cpOf(pA,pB,r.from<r.to?1:-1)};
  });
  const routeMap=new Map<string,SimRoute>(routes.map(r=>[r.id,r]));
  const particles:Particle[]=[];
  routes.forEach(r=>{const n=Math.max(2,Math.round((r.pop==='high'?16:r.pop==='med'?11:6)*lod));for(let i=0;i<n;i++)particles.push({id:particles.length,routeId:r.id,kind:Math.random()<.70?'pax':'pkg',t:i/n,spd:.0022+Math.random()*.003});});
  return{cities,routes,routeMap,particles,trips:11918,scanY:0,tick:0};
}

function resyncFallback(s:Sim,W:number,H:number){
  s.cities.forEach(c=>{c.x=toX(c.lon,W);c.y=toY(c.lat,H);});
  s.routes.forEach(r=>{r.pA={x:s.cities[r.from]?.x??0,y:s.cities[r.from]?.y??0};r.pB={x:s.cities[r.to]?.x??0,y:s.cities[r.to]?.y??0};r.cp=cpOf(r.pA,r.pB,r.from<r.to?1:-1);});
}

function resyncLeaflet(s:Sim,map:any){
  try{
    s.cities.forEach(c=>{const pt=map.latLngToContainerPoint([c.lat,c.lon]);c.x=pt.x;c.y=pt.y;});
    s.routes.forEach(r=>{
      const fc=s.cities[r.from],tc=s.cities[r.to];
      if(fc&&tc){r.pA={x:fc.x,y:fc.y};r.pB={x:tc.x,y:tc.y};r.cp=cpOf(r.pA,r.pB,r.from<r.to?1:-1);}
    });
  }catch{}
}

function stepSim(s:Sim,dt:number,h:number,mult:number,paused:boolean){
  if(paused)return; s.tick++;
  const tod=hourDemand(h);
  s.routes.forEach(r=>{r.paxF=0;r.pkgF=0;});
  s.particles.forEach(p=>{const r=s.routeMap.get(p.routeId);if(!r)return;p.t+=p.spd*dt*55*mult*(tod*.55+.45);if(p.t>1){p.t-=1;s.trips++;}p.kind==='pax'?r.paxF++:r.pkgF++;});
  s.routes.forEach(r=>{r.speed=Math.max(5,110*(1-(r.paxF+r.pkgF)/130));r.cong=Math.min(1,(r.paxF+r.pkgF)/42);r.animOff+=dt*mult*.8;});
  s.cities.forEach(c=>{c.demand=Math.max(.04,(c.pop/4200)*hourDemand(h)+Math.sin(s.tick*.007+c.id)*.035);c.pulse+=dt*(1.5+c.demand);c.pingT+=dt;});
  s.scanY+=dt*48*mult;
}

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS RENDERER (overlay on Leaflet tiles — transparent background)
// ─────────────────────────────────────────────────────────────────────────────
interface RO{W:number;H:number;dpr:number;leaflet:boolean;leafletZoom:number;
  z:number;ox:number;oy:number;
  layers:{rides:boolean;packages:boolean;traffic:boolean};
  hovCity:number|null;selRoute:string|null;t:number;isMobile:boolean;}

function renderMap(ctx:CanvasRenderingContext2D,s:Sim,o:RO){
  const{W,H,dpr,leaflet,leafletZoom,z,ox,oy}=o;

  ctx.save(); ctx.scale(dpr,dpr);

  if(leaflet){
    // Transparent — let Leaflet tiles show through
    ctx.clearRect(0,0,W,H);
    // Subtle tech overlay
    const gs=70; ctx.strokeStyle='rgba(0,100,220,0.018)'; ctx.lineWidth=.5;
    for(let gx=0;gx<W;gx+=gs){ctx.beginPath();ctx.moveTo(gx,0);ctx.lineTo(gx,H);ctx.stroke();}
    for(let gy=0;gy<H;gy+=gs){ctx.beginPath();ctx.moveTo(0,gy);ctx.lineTo(W,gy);ctx.stroke();}

    // Amman epicentre glow
    const am=s.cities[0];
    if(am){const glR=80*Math.pow(2,(leafletZoom-7)/2.5);const ag=ctx.createRadialGradient(am.x,am.y,0,am.x,am.y,glR);ag.addColorStop(0,'rgba(43,143,255,0.14)');ag.addColorStop(1,'transparent');ctx.fillStyle=ag;ctx.beginPath();ctx.arc(am.x,am.y,glR,0,Math.PI*2);ctx.fill();}

    // Draw Jordan border highlight over tiles
    ctx.beginPath();
    JO_BORDER.forEach(([lat,lon],i)=>{
      try{const map=(window as any).__dmLeaflet;if(!map)throw new Error();const pt=map.latLngToContainerPoint([lat,lon]);i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y);}
      catch{const bx=toX(lon,W),by=toY(lat,H);i===0?ctx.moveTo(bx,by):ctx.lineTo(bx,by);}
    });
    ctx.closePath();
    ctx.strokeStyle='rgba(0,150,255,0.20)'; ctx.lineWidth=1.6; ctx.setLineDash([4,8]);ctx.stroke();ctx.setLineDash([]);

    // Zoom-adaptive scale for lines
    const lz=Math.pow(2,(leafletZoom-7)*0.5);

    // Routes
    for(const r of s.routes){
      const{pA,pB,cp}=r,sel=r.id===o.selRoute;
      const bw=r.pop==='high'?3:r.pop==='med'?2.2:1.6;

      if(o.layers.traffic&&r.cong>.15){
        const ci=r.cong; ctx.lineCap='round';ctx.setLineDash([]);
        ctx.strokeStyle=`rgba(139,92,246,${ci*.14})`;ctx.lineWidth=(24+ci*14)*lz*.35;
        ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
        ctx.strokeStyle=`rgba(139,92,246,${ci*.55})`;ctx.lineWidth=(6+ci*10)*lz*.35;
        ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
        ctx.strokeStyle=`rgba(196,181,253,${ci*.65})`;ctx.lineWidth=1.3;
        ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
      }

      ctx.setLineDash([]);ctx.lineCap='round';
      ctx.strokeStyle=sel?'rgba(43,143,255,0.28)':'rgba(10,22,60,0.75)';
      ctx.lineWidth=Math.max(1.5,bw*lz*.5);
      ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();

      if(o.layers.rides&&r.paxF>0){
        const al=Math.min(.92,.32+r.paxF/11);
        ctx.strokeStyle=`rgba(43,143,255,${al*.28})`;ctx.lineWidth=(12+r.paxF*.5)*lz*.3;
        ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
        ctx.strokeStyle=`rgba(43,143,255,${al})`;ctx.lineWidth=Math.max(1.5,(2+r.paxF*.22)*lz*.5);
        ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
      }
      if(o.layers.packages&&r.pkgF>0){
        const al=Math.min(.88,.26+r.pkgF/8);
        ctx.setLineDash([5,9]);ctx.lineDashOffset=-(r.animOff*10%15);
        ctx.strokeStyle=`rgba(245,166,35,${al})`;ctx.lineWidth=Math.max(1.2,(2+r.pkgF*.18)*lz*.5);
        ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
        ctx.setLineDash([]);
      }
      if(sel){ctx.setLineDash([7,4]);ctx.strokeStyle='rgba(150,220,255,0.85)';ctx.lineWidth=2.2;ctx.lineDashOffset=-(r.animOff*14%13);ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();ctx.setLineDash([]);}
    }

    // City nodes (fixed screen size in Leaflet mode)
    for(const c of s.cities){
      const pulse=Math.sin(c.pulse)*.5+.5,hov=c.id===o.hovCity;
      const baseR=c.tier===1?12:c.tier===2?8:5.5;

      const glR=baseR*(c.tier===1?5:4);
      const gl=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,glR);
      gl.addColorStop(0,`rgba(0,${c.tier===1?200:150},255,${.18+pulse*.10})`);
      gl.addColorStop(1,'transparent');
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(c.x,c.y,glR,0,Math.PI*2);ctx.fill();

      if(c.demand>.10){ctx.strokeStyle=`rgba(255,${c.tier===1?185:145},20,${c.demand*.85})`;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(c.x,c.y,baseR+9,-Math.PI/2,-Math.PI/2+Math.PI*2*c.demand);ctx.stroke();}

      if(c.tier===1){const sc=baseR+7.5+pulse*2.8,rot=o.t*.6+c.id*1.4;ctx.strokeStyle=`rgba(0,212,255,${.30+pulse*.24})`;ctx.lineWidth=1.1;for(let k=0;k<3;k++){const a0=rot+(k*Math.PI*2)/3;ctx.beginPath();ctx.arc(c.x,c.y,sc,a0,a0+Math.PI*.44);ctx.stroke();}}

      if(c.pingT<2.9&&c.tier<=2){const pp=c.pingT/2.9;ctx.strokeStyle=`rgba(0,200,255,${(1-pp)*.50})`;ctx.lineWidth=1.5*(1-pp);ctx.beginPath();ctx.arc(c.x,c.y,baseR+pp*40,0,Math.PI*2);ctx.stroke();}
      if(c.pingT>3.0+Math.random()*.6)c.pingT=0;

      const ng=ctx.createRadialGradient(c.x-baseR*.3,c.y-baseR*.32,0,c.x,c.y,baseR);
      ng.addColorStop(0,c.tier===1?'#64C8FF':c.tier===2?'#44AADD':'#3385BB');
      ng.addColorStop(.55,c.tier===1?'#0077EE':'#0066AA');
      ng.addColorStop(1,c.tier===1?'#003ECC':'#003088');
      ctx.fillStyle=ng;
      if(c.tier<=2)hexPoly(ctx,c.x,c.y,baseR,Math.PI/6);else{ctx.beginPath();ctx.arc(c.x,c.y,baseR,0,Math.PI*2);}ctx.fill();
      ctx.strokeStyle=hov?'rgba(0,225,255,0.98)':`rgba(0,${c.tier===1?210:170},255,${c.tier===1?.88:.62})`;
      ctx.lineWidth=c.tier===1?2.2:1.6;
      if(c.tier<=2)hexPoly(ctx,c.x,c.y,baseR,Math.PI/6);else{ctx.beginPath();ctx.arc(c.x,c.y,baseR,0,Math.PI*2);}ctx.stroke();
      if(c.tier===1){ctx.fillStyle='rgba(255,255,255,0.94)';ctx.beginPath();ctx.arc(c.x,c.y,baseR*.28,0,Math.PI*2);ctx.fill();}
      if(hov){ctx.strokeStyle='rgba(0,230,255,0.78)';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(c.x,c.y,baseR+9,0,Math.PI*2);ctx.stroke();}

      const showL=c.tier===1||(c.tier===2&&leafletZoom>=8)||(c.tier===3&&leafletZoom>=10);
      if(showL){
        const fs=c.tier===1?11:10,ly=c.y+baseR+fs+8;
        ctx.textAlign='center';
        ctx.fillStyle='rgba(2,8,16,0.88)';ctx.font=`${c.tier===1?700:600} ${fs}px Inter,sans-serif`;ctx.fillText(c.name,c.x+.5,ly+.8);
        ctx.fillStyle=hov?'#8AEEFF':(c.tier===1?'#E8F6FF':'#B0D0EE');ctx.fillText(c.name,c.x,ly);
        ctx.font=`${fs*.84}px Cairo,sans-serif`;ctx.fillStyle=`rgba(90,190,255,${.52+pulse*.16})`;ctx.fillText(c.ar,c.x,ly+fs+3);
      }
    }

    // Scanline
    const sl=(s.scanY*55%(H*1.6))-H*.28;
    ctx.strokeStyle='rgba(0,180,255,0.04)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,sl);ctx.lineTo(W,sl);ctx.stroke();

  } else {
    // ── FALLBACK: Custom zoom mode (no Leaflet) ─────────────────────────────
    const bg=ctx.createRadialGradient(W*.36,H*.42,0,W*.36,H*.42,W*.85);
    bg.addColorStop(0,'#091428');bg.addColorStop(.5,'#050C1C');bg.addColorStop(1,'#020810');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    ctx.save();ctx.translate(ox,oy);ctx.scale(z,z);
    const vx0=-ox/z,vy0=-oy/z,vx1=(W-ox)/z,vy1=(H-oy)/z;
    const gs=50/z; ctx.strokeStyle='rgba(0,100,220,0.028)'; ctx.lineWidth=.5/z;
    for(let gx=Math.floor(vx0/gs)*gs;gx<vx1;gx+=gs){ctx.beginPath();ctx.moveTo(gx,vy0);ctx.lineTo(gx,vy1);ctx.stroke();}
    for(let gy=Math.floor(vy0/gs)*gs;gy<vy1;gy+=gs){ctx.beginPath();ctx.moveTo(vx0,gy);ctx.lineTo(vx1,gy);ctx.stroke();}
    ctx.beginPath();JO_BORDER.forEach(([lat,lon],i)=>{const bx=toX(lon,W),by=toY(lat,H);i===0?ctx.moveTo(bx,by):ctx.lineTo(bx,by);});
    ctx.closePath();ctx.fillStyle='rgba(0,70,180,0.022)';ctx.fill();
    ctx.strokeStyle='rgba(0,150,255,0.14)';ctx.lineWidth=1.5/z;ctx.setLineDash([4/z,9/z]);ctx.stroke();ctx.setLineDash([]);
    // Routes (fallback zoom mode)
    for(const r of s.routes){
      const{pA,pB,cp}=r,sel=r.id===o.selRoute;
      if(o.layers.traffic&&r.cong>.15){const ci=r.cong;ctx.lineCap='round';ctx.setLineDash([]);ctx.strokeStyle=`rgba(139,92,246,${ci*.14})`;ctx.lineWidth=(28+ci*18)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();ctx.strokeStyle=`rgba(139,92,246,${ci*.52})`;ctx.lineWidth=(7+ci*11)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();}
      ctx.setLineDash([]);ctx.lineCap='round';ctx.strokeStyle=sel?'rgba(43,143,255,0.28)':'rgba(10,22,60,0.70)';ctx.lineWidth=(r.pop==='high'?5.5:r.pop==='med'?4.2:3.2)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();
      if(o.layers.rides&&r.paxF>0){const al=Math.min(.92,.32+r.paxF/11);ctx.strokeStyle=`rgba(43,143,255,${al*.25})`;ctx.lineWidth=(14+r.paxF*.6)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();ctx.strokeStyle=`rgba(43,143,255,${al})`;ctx.lineWidth=(2.2+r.paxF*.24)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();}
      if(o.layers.packages&&r.pkgF>0){const al=Math.min(.88,.26+r.pkgF/8);ctx.setLineDash([5.5/z,10/z]);ctx.lineDashOffset=-(r.animOff*10%15)/z;ctx.strokeStyle=`rgba(245,166,35,${al})`;ctx.lineWidth=(2+r.pkgF*.20)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();ctx.setLineDash([]);}
      if(sel){ctx.setLineDash([8/z,5/z]);ctx.strokeStyle='rgba(150,220,255,0.82)';ctx.lineWidth=2.5/z;ctx.lineDashOffset=-(r.animOff*14%13)/z;ctx.beginPath();ctx.moveTo(pA.x,pA.y);ctx.quadraticCurveTo(cp.x,cp.y,pB.x,pB.y);ctx.stroke();ctx.setLineDash([]);}
    }
    // Cities (fallback zoom mode)
    for(const c of s.cities){
      const pulse=Math.sin(c.pulse)*.5+.5,hov=c.id===o.hovCity;
      const baseR=c.tier===1?12.5:c.tier===2?8:5.5,r=baseR/z;
      const glR=(baseR*(c.tier===1?6:c.tier===2?4.5:3.2))/z;
      const gl=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,glR);gl.addColorStop(0,`rgba(0,${c.tier===1?200:150},255,${.17+pulse*.10})`);gl.addColorStop(1,'transparent');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(c.x,c.y,glR,0,Math.PI*2);ctx.fill();
      if(c.demand>.10){ctx.strokeStyle=`rgba(255,${c.tier===1?185:145},20,${c.demand*.85})`;ctx.lineWidth=2.8/z;ctx.beginPath();ctx.arc(c.x,c.y,(baseR+9)/z,-Math.PI/2,-Math.PI/2+Math.PI*2*c.demand);ctx.stroke();}
      if(c.tier===1){const sc=(baseR+7.5+pulse*2.8)/z,rot=o.t*.6+c.id*1.4;ctx.strokeStyle=`rgba(0,212,255,${.30+pulse*.24})`;ctx.lineWidth=1.1/z;for(let k=0;k<3;k++){const a0=rot+(k*Math.PI*2)/3;ctx.beginPath();ctx.arc(c.x,c.y,sc,a0,a0+Math.PI*.44);ctx.stroke();}}
      if(c.pingT<2.9&&c.tier<=2){const pp=c.pingT/2.9;ctx.strokeStyle=`rgba(0,200,255,${(1-pp)*.50})`;ctx.lineWidth=(1.5*(1-pp))/z;ctx.beginPath();ctx.arc(c.x,c.y,(baseR+pp*44)/z,0,Math.PI*2);ctx.stroke();}
      if(c.pingT>3.0+Math.random()*.6)c.pingT=0;
      const ng=ctx.createRadialGradient(c.x-r*.3,c.y-r*.32,0,c.x,c.y,r);ng.addColorStop(0,c.tier===1?'#64C8FF':'#44AADD');ng.addColorStop(.55,c.tier===1?'#0077EE':'#0066AA');ng.addColorStop(1,'#003ECC');ctx.fillStyle=ng;
      if(c.tier<=2)hexPoly(ctx,c.x,c.y,r,Math.PI/6);else{ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);}ctx.fill();
      ctx.strokeStyle=hov?'rgba(0,225,255,0.98)':`rgba(0,${c.tier===1?210:170},255,${c.tier===1?.88:.62})`;ctx.lineWidth=(c.tier===1?2.2:1.6)/z;
      if(c.tier<=2)hexPoly(ctx,c.x,c.y,r,Math.PI/6);else{ctx.beginPath();ctx.arc(c.x,c.y,r,0,Math.PI*2);}ctx.stroke();
      if(c.tier===1){ctx.fillStyle='rgba(255,255,255,0.94)';ctx.beginPath();ctx.arc(c.x,c.y,r*.28,0,Math.PI*2);ctx.fill();}
      if(hov){ctx.strokeStyle='rgba(0,230,255,0.78)';ctx.lineWidth=2.2/z;ctx.beginPath();ctx.arc(c.x,c.y,(baseR+9)/z,0,Math.PI*2);ctx.stroke();}
      const showL=c.tier===1||(c.tier===2&&z>=.65)||(c.tier===3&&z>=1.05);
      if(showL){const fs=(c.tier===1?11:10)/z,ly=c.y+(baseR+fs+8)/z;ctx.textAlign='center';ctx.fillStyle='rgba(2,8,16,0.88)';ctx.font=`${c.tier===1?700:600} ${fs}px Inter,sans-serif`;ctx.fillText(c.name,c.x+.5/z,ly+.8/z);ctx.fillStyle=hov?'#8AEEFF':(c.tier===1?'#E8F6FF':'#B0D0EE');ctx.fillText(c.name,c.x,ly);if(z>=.62){ctx.font=`${fs*.84}px Cairo,sans-serif`;ctx.fillStyle=`rgba(90,190,255,${.52+pulse*.16})`;ctx.fillText(c.ar,c.x,ly+(fs+2.5)/z);}}
    }
    // Fallback particles (canvas 2D)
    const step=o.isMobile?2:1;
    for(let pi=0;pi<s.particles.length;pi+=step){
      const p=s.particles[pi];const r=s.routeMap.get(p.routeId);if(!r)continue;
      if(p.kind==='pax'&&!o.layers.rides)continue;if(p.kind==='pkg'&&!o.layers.packages)continue;
      const pos=bz(p.t,r.pA,r.cp,r.pB);const nxt=bz(Math.min(p.t+.018,1),r.pA,r.cp,r.pB);const ang=Math.atan2(nxt.y-pos.y,nxt.x-pos.x);
      if(p.kind==='pax'){const sz=5.8/z;ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(ang);ctx.fillStyle=C.ride;ctx.strokeStyle='rgba(130,191,255,0.95)';ctx.lineWidth=.85/z;ctx.beginPath();ctx.moveTo(sz*1.6,0);ctx.lineTo(-sz*.95,-sz*.92);ctx.lineTo(-sz*.38,0);ctx.lineTo(-sz*.95,sz*.92);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
      else{const sz=4.6/z;ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(Math.PI/4);ctx.fillStyle=C.pkg;ctx.strokeStyle=C.pkgLt;ctx.lineWidth=.9/z;ctx.beginPath();ctx.rect(-sz*.94,-sz*.94,sz*1.88,sz*1.88);ctx.fill();ctx.stroke();ctx.restore();}
    }
    // Scanline
    const sl=(s.scanY*55%(H/z*1.6))-H*.28/z;ctx.strokeStyle='rgba(0,180,255,0.05)';ctx.lineWidth=1/z;ctx.beginPath();ctx.moveTo(vx0,sl);ctx.lineTo(vx1,sl);ctx.stroke();
    ctx.restore();
  }

  // Signature
  ctx.textAlign='left';ctx.font='400 9px Inter,sans-serif';ctx.fillStyle='rgba(0,140,255,0.12)';
  ctx.fillText(`Wasel · Jordan Mobility OS · ${leaflet?'Leaflet+CartoDB':'Canvas2D'} · GxP`,14,H*dpr-12);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────────────────────────────────────────
function useAnimatedNumber(target:number,duration=600){
  const[display,setDisplay]=useState(target);
  const prev=useRef(target);
  useEffect(()=>{
    const start=prev.current,diff=target-start,t0=Date.now();
    if(Math.abs(diff)<1){setDisplay(target);return;}
    let raf=0;
    const step=()=>{const p=Math.min(1,(Date.now()-t0)/duration);const ease=1-Math.pow(1-p,3);setDisplay(Math.round(start+diff*ease));if(p<1)raf=requestAnimationFrame(step);else prev.current=target;};
    raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf);
  },[target,duration]);
  return display;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE EVENT TICKER (Supabase-ready)
// ─────────────────────────────────────────────────────────────────────────────
interface LiveEvent{id:string;icon:string;text:string;col:string;}
const EVENT_TEMPLATES=[
  {icon:'🚗',col:'#2B8FFF',mk:(a:string,b:string)=>`Ride booked: ${a} → ${b}`},
  {icon:'⚡',col:'#FF7722',mk:(a:string,b:string)=>`On-demand: ${a} → ${b}`},
  {icon:'📦',col:'#F5A623',mk:(a:string,b:string)=>`Package: ${a} → ${b}`},
  {icon:'✅',col:'#00E87A',mk:(a:string,b:string)=>`Trip completed · JOD ${(parseFloat(b)).toFixed(2)}`},
  {icon:'👤',col:'#00D4FF',mk:(a:string)=>`Driver online: ${a} area`},
  {icon:'💰',col:'#00E87A',mk:(a:string,b:string)=>`Fare paid: JOD ${a} · ${b}`},
];
function useLiveEvents(ar:boolean){
  const[events,setEvents]=useState<LiveEvent[]>([]);
  const mountedRef=useRef(true);
  useEffect(()=>{mountedRef.current=true;return()=>{mountedRef.current=false;};},[]);

  useEffect(()=>{
    const cities=CITIES.map(c=>ar?c.ar:c.name);
    const timeouts:ReturnType<typeof setTimeout>[]=[];

    const add=()=>{
      if(!mountedRef.current)return;
      const t=EVENT_TEMPLATES[Math.floor(Math.random()*EVENT_TEMPLATES.length)];
      const a=cities[Math.floor(Math.random()*cities.length)];
      const b=Math.random()<.5?cities[Math.floor(Math.random()*cities.length)]:(Math.random()*20+2).toFixed(2);
      const ev:LiveEvent={id:Math.random().toString(36).slice(2),icon:t.icon,text:t.mk(a,b as string),col:t.col};
      setEvents(prev=>[ev,...prev].slice(0,4));
      // Expiry timeout — stored so we can cancel on unmount
      const tid=setTimeout(()=>{
        if(mountedRef.current)setEvents(prev=>prev.filter(e=>e.id!==ev.id));
      },5000);
      timeouts.push(tid);
    };

    add();
    const intervalId=setInterval(add,4000+Math.random()*4000);
    return()=>{
      clearInterval(intervalId);
      timeouts.forEach(clearTimeout);  // ← GxP: cancel all pending expiry timers
    };
  },[ar]);
  return events;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface TipData{city:SimCity;sx:number;sy:number;pax:number;pkg:number;cong:number;}
interface SelRoute{route:SimRoute;info:Route;}
interface BookingData{route:Route;fromCity:City;toCity:City;}
type Breakpoint='desktop'|'tablet'|'mobile';

export function MobilityOSCore(){
  const{language}=useLanguage(); const ar=language==='ar';
  const liveEvents=useLiveEvents(ar);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const cvRef        = useRef<HTMLCanvasElement>(null);
  const areaRef      = useRef<HTMLDivElement>(null);
  const mapDivRef    = useRef<HTMLDivElement>(null);
  const particleCvRef= useRef<HTMLCanvasElement>(null);
  const simRef       = useRef<Sim|null>(null);
  const rafRef       = useRef(0);
  const mountRef     = useRef(true);
  const lastTRef     = useRef(0);
  const elRef        = useRef(0);
  const stTickRef    = useRef(0);
  const zRef         = useRef(1);
  const offRef       = useRef({x:0,y:0});
  const dragRef      = useRef({on:false,lx:0,ly:0});
  const pinchRef     = useRef({on:false,dist:0});
  const hovRef       = useRef<number|null>(null);
  const selRRef      = useRef<string|null>(null);
  const layRef       = useRef({rides:true,packages:true,traffic:true});
  const dprRef       = useRef(Math.min(typeof window!=='undefined'?window.devicePixelRatio||1:1,2.5));
  const leafletRef   = useRef<any>(null);
  const leafletRdy   = useRef(false);

  // ── RAF mirror-refs  (read inside the loop without restarting it) ─────────
  // Synced to state in useEffects below — keeps the RAF dependency array =[W,H]
  const pausedRef_raf = useRef(false);
  const hrRef_raf     = useRef(8);
  const multRef_raf   = useRef(1);
  const liveRef_raf   = useRef(true);
  const bpRef_raf     = useRef<Breakpoint>('desktop');

  // ── State ─────────────────────────────────────────────────────────────────
  const[W,setW]             = useState(900);
  const[H,setH]             = useState(560);
  const[paused,setPaused]   = useState(false);
  const[mult,setMult]       = useState(1);
  const[live,setLive]       = useState(true);
  const[hr,setHr]           = useState(8);
  const[zoom,setZoom]       = useState(1);
  const[leafletZoom,setLeafletZoom] = useState(7);
  const[sideOpen,setSideOpen]   = useState(true);
  const[mobileDrawer,setMobileDrawer] = useState(false);
  const[layers,setLayers]   = useState({rides:true,packages:true,traffic:true});
  const[tip,setTip]         = useState<TipData|null>(null);
  const[selR,setSelR]       = useState<SelRoute|null>(null);
  const[activeNav,setActiveNav] = useState('intelligence');
  const[bp,setBp]           = useState<Breakpoint>('desktop');
  const[mobileNavOpen,setMobileNavOpen] = useState(false);
  const[collapsed,setCollapsed] = useState<Set<string>>(new Set());
  const[showKbd,setShowKbd] = useState(false);
  const[booking,setBooking] = useState<BookingData|null>(null);
  const[insightsOpen,setInsightsOpen]=useState(false);

  const[stats,setStats]=useState({
    pax:175,pkg:79,total:11918,util:1.0,
    avgSpeed:101,cong:0.24,topRoute:'Amman → Irbid',
    latency:9,stability:.88,
    trafficLow:18,trafficMed:8,trafficHigh:0,
  });

  const aPax   = useAnimatedNumber(stats.pax);
  const aPkg   = useAnimatedNumber(stats.pkg);
  const aTotal = useAnimatedNumber(stats.total,1200);
  const aSpeed = useAnimatedNumber(stats.avgSpeed,800);

  const isMobile = bp==='mobile';
  const stable   = stats.cong<.38;
  const curH     = live?new Date().getHours():hr;
  const isPeak   = hourDemand(curH)>1.4;
  const valueMetrics = useMemo(() => {
    const demandPressure = hourDemand(curH);
    const fulfillment = Math.min(98, Math.round((stats.stability * 0.45 + (1 - stats.cong) * 0.35 + Math.min(stats.avgSpeed / 110, 1) * 0.20) * 100));
    const riderEtaGain = Math.max(6, Math.round(stats.avgSpeed * (1 - stats.cong) * 0.16));
    const driverYield = ((stats.pax * 2.4) + (stats.pkg * 1.8)) / Math.max(1, stats.trafficLow + stats.trafficMed + stats.trafficHigh);
    const corridorReuse = Math.min(95, Math.round(((stats.pax + stats.pkg) / Math.max(1, stats.total)) * 100 * 52));
    return {
      fulfillment,
      riderEtaGain,
      driverYield,
      corridorReuse,
      demandPressure,
    };
  }, [curH, stats]);

  const insights = useMemo(() => {
    const readiness = valueMetrics.fulfillment;
    const congPct = Math.round(stats.cong * 100);
    const speed = stats.avgSpeed;
    const pressure = valueMetrics.demandPressure;

    const severity =
      readiness >= 92 && congPct < 30 ? 'good' :
      readiness >= 82 && congPct < 45 ? 'watch' : 'risk';

    const sevCol = severity === 'good' ? C.green : severity === 'watch' ? C.orange : C.red;

    const bottleneck =
      congPct >= 55 ? (ar ? 'عنق زجاجة: ازدحام مرتفع في الممرات الرئيسية' : 'Bottleneck: high congestion on primary corridors') :
      pressure >= 1.55 ? (ar ? 'ضغط طلب مرتفع: ذروة تشغيل' : 'High demand pressure: peak-hour surge') :
      (ar ? 'التدفق مستقر: توزيع جيد للشبكة' : 'Stable flow: healthy distribution');

    const why =
      severity === 'good'
        ? (ar ? 'السرعة مستقرة والازدحام منخفض، مما يحسن جودة المطابقة.' : 'Speed is stable and congestion is low, improving match quality.')
        : severity === 'watch'
          ? (ar ? 'هناك تزايد في الازدحام أو ضغط الطلب، وقد يظهر تأخير محلي.' : 'Congestion or demand pressure is rising; localized delays may appear.')
          : (ar ? 'ازدحام مرتفع مع ضغط طلب قوي، مما يتطلب توازن فوري.' : 'High congestion with strong demand pressure requires immediate rebalancing.');

    const action =
      severity === 'good'
        ? (ar ? 'التوصية: عزز إعادة استخدام الشبكة بدمج الركاب والطرود على نفس الممر.' : 'Recommendation: boost reuse by co-loading riders and packages on the same corridor.')
        : severity === 'watch'
          ? (ar ? 'التوصية: أضف سائقين للممرات الأعلى طلباً وخفف الطبقة المرورية.' : 'Recommendation: add drivers to hottest corridors and dampen traffic exposure.')
          : (ar ? 'التوصية: فعّل إعادة التوازن، وارفع التسعير ديناميكياً، وفعّل بدائل الحافلات.' : 'Recommendation: rebalance now, increase dynamic pricing, and activate bus alternatives.');

    const signal =
      ar ? `جاهزية ${readiness}% · ازدحام ${congPct}% · سرعة ${speed} كم/س` : `Ready ${readiness}% · Congestion ${congPct}% · Speed ${speed} km/h`;

    return { sevCol, severity, bottleneck, why, action, signal };
  }, [ar, stats.avgSpeed, stats.cong, valueMetrics.demandPressure, valueMetrics.fulfillment]);

  const benefitCards = useMemo(() => ([
    {
      key: 'rider',
      accent: C.ride,
      title: ar ? 'فائدة الراكب' : 'Rider Benefit',
      value: ar ? `أسرع ${valueMetrics.riderEtaGain} د` : `${valueMetrics.riderEtaGain} min faster`,
      sub: ar ? 'تجميع أفضل + وقت انتظار أقل + مسار أوضح' : 'Better matching, lower wait time, clearer route timing',
    },
    {
      key: 'driver',
      accent: C.green,
      title: ar ? 'فائدة السائق' : 'Driver Benefit',
      value: `${valueMetrics.driverYield.toFixed(1)} JOD`,
      sub: ar ? 'عائد متوقع لكل ممر نشط بعد موازنة الطلب' : 'Expected yield per active corridor after demand balancing',
    },
    {
      key: 'ops',
      accent: C.pkg,
      title: ar ? 'فائدة التشغيل' : 'Ops Benefit',
      value: `${valueMetrics.fulfillment}%`,
      sub: ar ? 'جاهزية تشغيلية مبنية على السرعة والاستقرار والازدحام' : 'Operational readiness from speed, stability, and congestion',
    },
    {
      key: 'network',
      accent: C.traf,
      title: ar ? 'استفادة الشبكة' : 'Network Reuse',
      value: `${valueMetrics.corridorReuse}%`,
      sub: ar ? 'نفس الشبكة تخدم ركاباً وطروداً في نفس التدفق' : 'The same network serves riders and packages in one flow',
    },
  ]), [ar, valueMetrics]);

  const methodChips = useMemo(() => ([
    {
      key: 'demand',
      label: ar ? 'توقع الطلب' : 'Demand Forecast',
      formula: ar ? 'قمتا طلب يومياً: 8 ص + 6 م' : 'Two daily demand peaks: 8 AM + 6 PM',
    },
    {
      key: 'speed',
      label: ar ? 'سرعة التدفق' : 'Flow Speed',
      formula: 'speed = 110 x (1 - volume / 130)',
    },
    {
      key: 'matching',
      label: ar ? 'درجة المطابقة' : 'Match Score',
      formula: ar ? '40% مسافة + 30% تقييم + 20% خبرة + 10% تفضيل' : '40% distance + 30% rating + 20% experience + 10% preference',
    },
    {
      key: 'pricing',
      label: ar ? 'منهج التسعير' : 'Pricing Method',
      formula: ar ? 'سعر المقعد = (الوقود / المقاعد) x 1.2' : 'Seat price = (fuel / seats) x 1.2',
    },
  ]), [ar]);

  useEffect(()=>{mountRef.current=true;return()=>{mountRef.current=false;};},[]);

  // ── Sync state → RAF mirror-refs (no RAF restart on every change) ─────────
  useEffect(()=>{pausedRef_raf.current=paused;},[paused]);
  useEffect(()=>{hrRef_raf.current=hr;},[hr]);
  useEffect(()=>{multRef_raf.current=mult;},[mult]);
  useEffect(()=>{liveRef_raf.current=live;},[live]);
  useEffect(()=>{bpRef_raf.current=bp;},[bp]);

  // ── Responsive ────────────────────────────────────────────────────────────
  useEffect(()=>{
    const el=areaRef.current;if(!el)return;
    const ro=new ResizeObserver(es=>{
      if(!mountRef.current)return;
      const e=es[0];if(!e)return;
      const cw=Math.max(300,e.contentRect.width);
      const ch=Math.max(280,Math.min(820,cw*.62));
      setW(cw);setH(ch);
      setBp(window.innerWidth<640?'mobile':window.innerWidth<1024?'tablet':'desktop');
      if(simRef.current&&!leafletRdy.current)resyncFallback(simRef.current,cw,ch);
      if(leafletRef.current)try{leafletRef.current.invalidateSize();}catch{}
      // pixiRef removed — PixiJS replaced by Canvas2D GPU layer (v7.0)
    });
    ro.observe(el);return()=>ro.disconnect();
  },[]);

  // ── Sim init ──────────────────────────────────────────────────────────────
  useEffect(()=>{
    const cores=(navigator as any).hardwareConcurrency||4;
    const lod=cores<=2?.5:cores<=4?.75:1;
    simRef.current=buildSim(W,H,lod);
  },[]);// eslint-disable-line

  // ── Leaflet init ──────────────────────────────────────────────────────────
  useEffect(()=>{
    const div=mapDivRef.current;if(!div)return;
    // Inject Leaflet CSS
    if(!document.getElementById('dm-leaflet-css')){
      const lnk=document.createElement('link');lnk.id='dm-leaflet-css';lnk.rel='stylesheet';
      lnk.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(lnk);
    }
    let map:any=null;
    import('leaflet').then(({default:L})=>{
      if(!mountRef.current||leafletRef.current)return;
      map=L.map(div,{center:[31.0,36.0],zoom:7,zoomControl:false,attributionControl:false,preferCanvas:false});
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
        attribution:'© OpenStreetMap © CartoDB',subdomains:'abcd',maxZoom:20,opacity:0.88,
      }).addTo(map);
      leafletRef.current=map;
      (window as any).__dmLeaflet=map;
      leafletRdy.current=true;
      // Leaflet events
      map.on('mousemove',(e:any)=>{
        if(!mountRef.current)return;
        const{x,y}=e.containerPoint;const sim=simRef.current;if(!sim)return;
        let found:SimCity|null=null;
        for(const c of sim.cities){if(Math.hypot(x-c.x,y-c.y)<(c.tier===1?18:c.tier===2?13:9)){found=c;break;}}
        if(found?.id!==hovRef.current){
          hovRef.current=found?.id??null;
          if(found){const rs=sim.routes.filter(r=>r.from===found!.id||r.to===found!.id);setTip({city:found,sx:found.x,sy:found.y,pax:(found.demand*130)|0,pkg:(found.demand*45)|0,cong:rs.reduce((s,r)=>s+r.cong,0)/Math.max(1,rs.length)});}
          else setTip(null);
        }
      });
      map.on('click',(e:any)=>{
        if(!mountRef.current)return;
        const{x,y}=e.containerPoint;const sim=simRef.current;if(!sim)return;
        let best:SimRoute|null=null,bd=18;
        for(const r of sim.routes)for(let i=0;i<=20;i++){const p=bz(i/20,r.pA,r.cp,r.pB);const d=Math.hypot(x-p.x,y-p.y);if(d<bd){bd=d;best=r;}}
        selRRef.current=best?.id??null;
        if(best){const info=ROUTES.find(r=>r.id===best!.id);if(info)setSelR({route:best,info});setTip(null);}
        else setSelR(null);
      });
      map.on('zoomend',()=>{if(!mountRef.current)return;setLeafletZoom(map.getZoom());});
    }).catch(()=>{leafletRdy.current=false;});
    return()=>{if(map){try{map.remove();}catch{}leafletRef.current=null;(window as any).__dmLeaflet=null;}};
  },[]);// eslint-disable-line

  // ── RAF loop ──────────────────────────────────────────────────────────────
  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');if(!ctx)return;
    lastTRef.current=0;
    const dpr=dprRef.current;
    const loop=(ts:number)=>{
      if(!mountRef.current)return;
      const dt=lastTRef.current?Math.min((ts-lastTRef.current)/1000,.05):.016;
      lastTRef.current=ts;elRef.current+=dt;
      try{
        const sim=simRef.current;
        if(sim){
          const h=liveRef_raf.current?new Date().getHours():hrRef_raf.current;
          // Sync city positions from Leaflet (if ready)
          if(leafletRef.current&&leafletRdy.current)resyncLeaflet(sim,leafletRef.current);
          stepSim(sim,dt,h,multRef_raf.current,pausedRef_raf.current);
          stTickRef.current++;
          if(stTickRef.current>=30&&mountRef.current){
            stTickRef.current=0;
            const pax=sim.particles.filter(p=>p.kind==='pax').length;
            const pkg=sim.particles.filter(p=>p.kind==='pkg').length;
            const avgSpd=sim.routes.reduce((s,r)=>s+r.speed,0)/Math.max(1,sim.routes.length);
            const avgCong=sim.routes.reduce((s,r)=>s+r.cong,0)/Math.max(1,sim.routes.length);
            const topR=[...sim.routes].sort((a,b)=>b.paxF+b.pkgF-a.paxF-a.pkgF)[0];
            const cn=(id:number)=>CITIES.find(c=>c.id===id)?.name??'';
            setStats({pax,pkg,total:sim.trips,util:(pax+pkg)/Math.max(1,sim.particles.length),avgSpeed:Math.round(avgSpd),cong:avgCong,topRoute:topR?`${cn(topR.from)} → ${cn(topR.to)}`:'',latency:8+Math.round(Math.random()*5),stability:Math.max(.65,1-avgCong*.52),trafficLow:sim.routes.filter(r=>r.cong<.35).length,trafficMed:sim.routes.filter(r=>r.cong>=.35&&r.cong<.65).length,trafficHigh:sim.routes.filter(r=>r.cong>=.65).length});
          }
          // Canvas 2D (roads, cities, overlay)
          const tw=W*dpr,th=H*dpr;
          if(cv.width!==tw||cv.height!==th){cv.width=tw;cv.height=th;}
          const lz=leafletRef.current?leafletRef.current.getZoom():7;
          renderMap(ctx,sim,{W,H,dpr,leaflet:leafletRdy.current,leafletZoom:lz,z:zRef.current,ox:offRef.current.x,oy:offRef.current.y,layers:layRef.current,hovCity:hovRef.current,selRoute:selRRef.current,t:elRef.current,isMobile:bpRef_raf.current==='mobile'});

          // Dedicated particle canvas (GPU-composited via separate layer)
          const pcv=particleCvRef.current;
          if(pcv){
            if(pcv.width!==tw||pcv.height!==th){pcv.width=tw;pcv.height=th;}
            const pctx=pcv.getContext('2d');
              if(pctx){
                pctx.clearRect(0,0,pcv.width,pcv.height);
                pctx.save();pctx.scale(dpr,dpr);
                pctx.globalCompositeOperation='lighter';
                if(leafletRdy.current){
                  // Leaflet mode — screen coords already set
                  // Reduce overdraw on large screens so the flow looks "real" (not a neon blob).
                  const skip=bpRef_raf.current==='mobile'?3:2;

                  // Pass 1: soft density cloud (blurred glows only)
                  pctx.save();
                  pctx.filter = bpRef_raf.current === 'mobile' ? 'blur(1.4px)' : 'blur(2.2px)';
                  pctx.globalAlpha = 0.60;
                  for(let pi=0;pi<sim.particles.length;pi+=skip){
                    const p=sim.particles[pi];const r=sim.routeMap.get(p.routeId);if(!r)continue;
                    if(p.kind==='pax'&&!layRef.current.rides)continue;
                    if(p.kind==='pkg'&&!layRef.current.packages)continue;
                    const pos=bz(p.t,r.pA,r.cp,r.pB);
                    if(p.kind==='pax'){
                      const sz=5.2;
                      const ga=pctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,sz*5.2);
                      ga.addColorStop(0,'rgba(43,143,255,0.20)');ga.addColorStop(1,'rgba(43,143,255,0)');
                      pctx.fillStyle=ga;pctx.beginPath();pctx.arc(pos.x,pos.y,sz*5.2,0,Math.PI*2);pctx.fill();
                    } else {
                      const sz=4.7;
                      const ga=pctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,sz*5.0);
                      ga.addColorStop(0,'rgba(245,166,35,0.18)');ga.addColorStop(1,'rgba(245,166,35,0)');
                      pctx.fillStyle=ga;pctx.beginPath();pctx.arc(pos.x,pos.y,sz*5.0,0,Math.PI*2);pctx.fill();
                    }
                  }
                  pctx.restore();

                  // Pass 2: crisp glyphs
                  pctx.save();
                  pctx.filter = 'none';
                  pctx.globalAlpha = 0.92;
                  for(let pi=0;pi<sim.particles.length;pi+=skip){
                    const p=sim.particles[pi];const r=sim.routeMap.get(p.routeId);if(!r)continue;
                    if(p.kind==='pax'&&!layRef.current.rides)continue;
                    if(p.kind==='pkg'&&!layRef.current.packages)continue;
                    const pos=bz(p.t,r.pA,r.cp,r.pB);const nxt=bz(Math.min(p.t+.018,1),r.pA,r.cp,r.pB);
                    const ang=Math.atan2(nxt.y-pos.y,nxt.x-pos.x);
                    if(p.kind==='pax'){
                      const sz=4.6;
                      pctx.save();pctx.translate(pos.x,pos.y);pctx.rotate(ang);
                      const tl=pctx.createLinearGradient(-sz*4.1,0,0,0);tl.addColorStop(0,'rgba(43,143,255,0)');tl.addColorStop(1,'rgba(43,143,255,0.20)');
                      pctx.fillStyle=tl;pctx.beginPath();pctx.moveTo(0,0);pctx.lineTo(-sz*4.1,-sz*.62);pctx.lineTo(-sz*4.1,sz*.62);pctx.closePath();pctx.fill();
                      pctx.fillStyle=C.ride;pctx.strokeStyle='rgba(210,235,255,0.55)';pctx.lineWidth=.75;
                      pctx.beginPath();pctx.moveTo(sz*1.55,0);pctx.lineTo(-sz*.86,-sz*.86);pctx.lineTo(-sz*.30,0);pctx.lineTo(-sz*.86,sz*.86);pctx.closePath();pctx.fill();pctx.stroke();
                      pctx.fillStyle='rgba(255,255,255,0.82)';pctx.beginPath();pctx.arc(sz*1.0,0,sz*.26,0,Math.PI*2);pctx.fill();
                      pctx.restore();
                    } else {
                      const sz=3.9;
                      pctx.save();pctx.translate(pos.x,pos.y);pctx.rotate(Math.PI/4);
                      pctx.fillStyle='rgba(245,166,35,0.92)';pctx.strokeStyle='rgba(255,208,122,0.55)';pctx.lineWidth=.85;
                      pctx.beginPath();pctx.rect(-sz*.92,-sz*.92,sz*1.84,sz*1.84);pctx.fill();pctx.stroke();
                      pctx.fillStyle='rgba(255,245,180,0.60)';pctx.beginPath();pctx.rect(-sz*.34,-sz*.34,sz*.68,sz*.68);pctx.fill();
                      pctx.restore();
                    }
                  }
                  pctx.restore();
                }
                pctx.globalCompositeOperation='source-over';
                pctx.restore();
              }
            }
        }
      }catch{}
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[W,H]);// RAF reads paused/hr/mult/live/bp via mirror-refs — no restart needed

  useEffect(()=>{layRef.current=layers;},[layers]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
      if(e.key===' '){e.preventDefault();setPaused(p=>!p);}
      if(e.key==='r'||e.key==='R')reset();
      if(e.key==='='||e.key==='+')zIn();
      if(e.key==='-')zOut();
      if(e.key==='0')zCtr();
      if(e.key==='Escape'){setSelR(null);selRRef.current=null;setTip(null);setBooking(null);}
      if(e.key==='?')setShowKbd(k=>!k);
    };
    window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);
  },[]);// eslint-disable-line

  // ── Fallback mouse (when Leaflet not loaded) ──────────────────────────────
  const wpos=useCallback((cx:number,cy:number)=>{
    const rect=cvRef.current?.getBoundingClientRect();if(!rect)return{wx:0,wy:0};
    return{wx:(cx-rect.left-offRef.current.x)/zRef.current,wy:(cy-rect.top-offRef.current.y)/zRef.current};
  },[]);
  const onMove=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    if(leafletRdy.current)return;
    const rect=cvRef.current?.getBoundingClientRect();if(!rect)return;
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    if(dragRef.current.on){offRef.current={x:offRef.current.x+(mx-dragRef.current.lx),y:offRef.current.y+(my-dragRef.current.ly)};dragRef.current.lx=mx;dragRef.current.ly=my;setTip(null);return;}
    const{wx,wy}=wpos(e.clientX,e.clientY);const sim=simRef.current;if(!sim)return;
    let found:SimCity|null=null;
    for(const c of sim.cities){const rb=c.tier===1?12.5:c.tier===2?8:5.5;if(Math.hypot(wx-c.x,wy-c.y)<(rb+8)/zRef.current){found=c;break;}}
    if(found?.id!==hovRef.current){hovRef.current=found?.id??null;if(found){const rs=sim.routes.filter(r=>r.from===found!.id||r.to===found!.id);setTip({city:found,sx:found.x*zRef.current+offRef.current.x,sy:found.y*zRef.current+offRef.current.y,pax:(found.demand*130)|0,pkg:(found.demand*45)|0,cong:rs.reduce((s,r)=>s+r.cong,0)/Math.max(1,rs.length)});}else setTip(null);}
  },[wpos]);
  const onDown=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{if(leafletRdy.current)return;const rect=cvRef.current?.getBoundingClientRect();if(!rect)return;dragRef.current={on:true,lx:e.clientX-rect.left,ly:e.clientY-rect.top};},[]);
  const onUp=useCallback(()=>{dragRef.current.on=false;},[]);
  const onClick=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    if(leafletRdy.current)return;
    const{wx,wy}=wpos(e.clientX,e.clientY);const sim=simRef.current;if(!sim)return;
    let best:SimRoute|null=null,bd=16/zRef.current;
    for(const r of sim.routes)for(let i=0;i<=24;i++){const p=bz(i/24,r.pA,r.cp,r.pB);const d=Math.hypot(wx-p.x,wy-p.y);if(d<bd){bd=d;best=r;}}
    selRRef.current=best?.id??null;
    if(best){const info=ROUTES.find(r=>r.id===best!.id);if(info)setSelR({route:best,info});setTip(null);}else setSelR(null);
  },[wpos]);
  const onWheel=useCallback((e:React.WheelEvent<HTMLCanvasElement>)=>{
    if(leafletRdy.current)return;
    e.preventDefault();const rect=cvRef.current?.getBoundingClientRect();if(!rect)return;
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    const f=e.deltaY<0?1.14:.88,nz=Math.max(.28,Math.min(5,zRef.current*f));
    offRef.current={x:mx-(mx-offRef.current.x)*(nz/zRef.current),y:my-(my-offRef.current.y)*(nz/zRef.current)};
    zRef.current=nz;setZoom(nz);
  },[]);
  const onTouchStart=useCallback((e:React.TouchEvent<HTMLCanvasElement>)=>{
    if(leafletRdy.current)return;e.preventDefault();
    if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;pinchRef.current={on:true,dist:Math.hypot(dx,dy)};dragRef.current.on=false;}
    else if(e.touches.length===1){const rect=cvRef.current?.getBoundingClientRect();if(!rect)return;dragRef.current={on:true,lx:e.touches[0].clientX-rect.left,ly:e.touches[0].clientY-rect.top};pinchRef.current.on=false;}
  },[]);
  const onTouchMove=useCallback((e:React.TouchEvent<HTMLCanvasElement>)=>{
    if(leafletRdy.current)return;e.preventDefault();
    const rect=cvRef.current?.getBoundingClientRect();if(!rect)return;
    if(e.touches.length===2&&pinchRef.current.on){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;const dist=Math.hypot(dx,dy);const f=dist/Math.max(1,pinchRef.current.dist);const mx=(e.touches[0].clientX+e.touches[1].clientX)/2-rect.left,my=(e.touches[0].clientY+e.touches[1].clientY)/2-rect.top;const nz=Math.max(.28,Math.min(5,zRef.current*f));offRef.current={x:mx-(mx-offRef.current.x)*(nz/zRef.current),y:my-(my-offRef.current.y)*(nz/zRef.current)};zRef.current=nz;setZoom(nz);pinchRef.current.dist=dist;}
    else if(e.touches.length===1&&dragRef.current.on){const mx=e.touches[0].clientX-rect.left,my=e.touches[0].clientY-rect.top;offRef.current={x:offRef.current.x+(mx-dragRef.current.lx),y:offRef.current.y+(my-dragRef.current.ly)};dragRef.current.lx=mx;dragRef.current.ly=my;}
  },[]);
  const onTouchEnd=useCallback(()=>{dragRef.current.on=false;pinchRef.current.on=false;},[]);

  const reset=useCallback(()=>{
    if(!mountRef.current)return;
    const cores=(navigator as any).hardwareConcurrency||4;
    const lod=cores<=2?.5:cores<=4?.75:1;
    simRef.current=buildSim(W,H,lod);
    zRef.current=1;offRef.current={x:0,y:0};
    setZoom(1);selRRef.current=null;setSelR(null);
    if(leafletRef.current)try{leafletRef.current.setView([31.0,36.0],7,{animate:true});}catch{};
  },[W,H]);
  const zIn=()=>{if(leafletRef.current&&leafletRdy.current){try{leafletRef.current.zoomIn();}catch{}}else{zRef.current=Math.min(5,zRef.current*1.22);setZoom(zRef.current);}};
  const zOut=()=>{if(leafletRef.current&&leafletRdy.current){try{leafletRef.current.zoomOut();}catch{}}else{zRef.current=Math.max(.28,zRef.current*.85);setZoom(zRef.current);}};
  const zCtr=()=>{if(leafletRef.current&&leafletRdy.current){try{leafletRef.current.setView([31.0,36.0],7,{animate:true});}catch{}}else{zRef.current=1;offRef.current={x:0,y:0};setZoom(1);}};

  const toggleCard=(key:string)=>setCollapsed(prev=>{const n=new Set(prev);n.has(key)?n.delete(key):n.add(key);return n;});
  const fmtH=(h:number)=>{const hh=Math.floor(h),mm=String(Math.round((h%1)*60)).padStart(2,'0'),ap=hh<12?'AM':'PM',h12=hh===0?12:hh>12?hh-12:hh;return`${h12}:${mm} ${ap}`;};

  const dir=ar?'rtl':'ltr' as 'rtl'|'ltr';
  const rowDir=ar?'row-reverse':'row' as 'row'|'row-reverse';
  const L=(lft:number|string,rht:number|string)=>ar?{right:lft,left:rht}:{left:lft,right:rht};

  const NAV=[
    {k:'rides',        icon:<Car size={13}/>,           en:'Rides',         ar:'ركاب'     },
    {k:'delivery',     icon:<Package size={13}/>,        en:'Delivery',      ar:'توصيل'    },
    {k:'bus',          icon:<Bus size={13}/>,            en:'Wasel Bus', ar:'باص'      },
    {k:'driver',       icon:<Zap size={13}/>,            en:'Driver Hub',    ar:'سائق'     },
    {k:'intelligence', icon:<BrainCircuit size={13}/>,   en:'Intelligence',  ar:'ذكاء'     },
    {k:'more',         icon:<MoreHorizontal size={13}/>, en:'More',          ar:'المزيد'   },
  ];
  const LAYER_CFG=[
    {k:'rides',   col:C.ride,en:'Rides',   arL:'ركاب', shape:<svg width="18" height="12" viewBox="0 0 18 12"><line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="2.2"/><polygon points="18,6 11,2.5 13,6 11,9.5" fill="currentColor"/></svg>},
    {k:'packages',col:C.pkg, en:'Pkgs',    arL:'طرود', shape:<svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="currentColor"/></svg>},
    {k:'traffic', col:C.traf,en:'Traffic', arL:'مرور', shape:<svg width="18" height="10" viewBox="0 0 18 10"><rect x="0" y="2" width="18" height="6" rx="3" fill="currentColor" opacity=".65"/><rect x="0" y="3.5" width="18" height="3" rx="1.5" fill="currentColor"/></svg>},
  ] as const;

  const CSS=`
    @keyframes dmPulse{0%,100%{opacity:1}50%{opacity:.18}}
    @keyframes dmIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    @keyframes dmSheen{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
    @keyframes dmToastBar{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    .dm{transition:transform .12s ease,filter .16s ease,box-shadow .16s ease,background .16s ease,border-color .16s ease;cursor:pointer;}
    .dm:hover{filter:brightness(1.08) saturate(1.06);}
    .dm:active{transform:scale(.97);}
    .dm:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(0,212,255,0.22), 0 10px 30px rgba(0,0,0,0.45);}

    .dmnav{position:relative;transition:transform .12s ease,filter .16s ease,box-shadow .18s ease,background .18s ease,border-color .18s ease;cursor:pointer;}
    .dmnav:hover{filter:brightness(1.06) saturate(1.05);}
    .dmnav:active{transform:scale(.985);}
    .dmnav:focus-visible{outline:none;box-shadow:0 0 0 3px rgba(43,143,255,0.22), 0 10px 30px rgba(0,0,0,0.45);}
    .dmnav[data-on="true"]{
      background:linear-gradient(135deg, rgba(43,143,255,0.22), rgba(0,212,255,0.10)) !important;
      border:1px solid rgba(43,143,255,0.26) !important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.10), 0 10px 28px rgba(0,0,0,0.50);
    }
    .dmnav[data-on="true"]::after{
      content:'';position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;
      background:linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent);
      opacity:.35;mix-blend-mode:screen;transform:translateX(-120%);
      animation:dmSheen 3.6s ease-in-out infinite;
    }

    .dmcard{border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);background:rgba(8,20,46,0.72);}
    .dm-surface{
      border:1px solid rgba(255,255,255,0.07);
      background:linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02));
      box-shadow:inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 60px rgba(0,0,0,0.55);
      backdrop-filter:blur(22px) saturate(160%);
    }

    .dm-map{position:relative;}
    .dm-map::before{
      content:'';position:absolute;inset:0;z-index:4;pointer-events:none;
      background:
        radial-gradient(85% 60% at 55% 30%, rgba(0,212,255,0.10), transparent 60%),
        radial-gradient(90% 80% at 50% 65%, rgba(43,143,255,0.06), transparent 62%),
        radial-gradient(120% 120% at 50% 50%, transparent 45%, rgba(0,0,0,0.52) 100%);
      mix-blend-mode:normal;
    }
    .dm-map::after{
      content:'';position:absolute;inset:0;z-index:5;pointer-events:none;opacity:.08;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E");
    }

    .dmtoast{
      position:relative;
      overflow:hidden;
    }
    .dmtoast .bar{
      position:absolute;
      left:0;right:0;bottom:0;height:2px;
      transform-origin:left;
      animation:dmToastBar 5s linear forwards;
      opacity:.75;
    }

    .leaflet-container{background:#020810!important;}
    .leaflet-tile-pane{filter:saturate(1.10) contrast(1.08) brightness(0.82);}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-thumb{background:rgba(0,140,255,0.25);border-radius:2px;}
    canvas{touch-action:none;}
  `;

  // ── Sidebar (shared desktop + mobile drawer) ──────────────────────────────
  const SidebarContent=(
    <div style={{padding:'14px 13px',display:'flex',flexDirection:'column',gap:10,minWidth:isMobile?'auto':258}}>
      <CollapsibleCard id="health" title={ar?'صحة النظام':'System Health'} icon={<span style={{color:stable?C.green:C.red,fontSize:'1rem'}}>{stable?'●':'⚠'}</span>} accent={stable?C.green:C.red} collapsed={collapsed.has('health')} onToggle={()=>toggleCard('health')} dir={dir}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
          <div style={{display:'flex',alignItems:'center',gap:7,flexDirection:rowDir}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:stable?C.green:C.red,boxShadow:`0 0 9px ${stable?C.green:C.red}`,display:'block',animation:'dmPulse 2s ease-in-out infinite'}}/>
            <span style={{fontSize:'.68rem',fontWeight:800,color:stable?C.green:C.red,letterSpacing:'.10em'}}>{stable?'STABLE':'WARNING'}</span>
          </div>
          <span style={{fontSize:'.60rem',color:C.t3}}>{stats.latency}ms</span>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',flexDirection:rowDir}}>
          <span style={{fontSize:'.63rem',color:C.t2}}>{ar?'استقرار التدفق':'Flow Stability'}</span>
          <span style={{fontSize:'.72rem',fontWeight:800,color:stable?C.green:C.orange}}>{(stats.stability*100).toFixed(0)}%</span>
        </div>
        {/* Leaflet + PixiJS badge */}
        <div style={{marginTop:8,display:'flex',gap:5,flexDirection:rowDir}}>
          <span style={{fontSize:'.54rem',padding:'2px 7px',borderRadius:99,background:'rgba(0,212,255,0.10)',border:'1px solid rgba(0,212,255,0.20)',color:C.cyan,fontWeight:700}}>🗺 Leaflet</span>
          <span style={{fontSize:'.54rem',padding:'2px 7px',borderRadius:99,background:'rgba(245,166,35,0.10)',border:'1px solid rgba(245,166,35,0.20)',color:C.pkg,fontWeight:700}}>⚡ Canvas 2D GPU</span>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="flow" title={ar?'التدفق الفوري':'Live Flow'} icon={<Activity size={12}/>} accent={C.ride} collapsed={collapsed.has('flow')} onToggle={()=>toggleCard('flow')} dir={dir}>
        <FlowRow icon={<svg width="16" height="10" viewBox="0 0 16 10"><line x1="0" y1="5" x2="10" y2="5" stroke={C.ride} strokeWidth="2"/><polygon points="16,5 9,1.5 11,5 9,8.5" fill={C.ride}/></svg>} label={ar?'ركاب':'Rides'} val={aPax} col={C.ride} dir={dir}/>
        <FlowRow icon={<svg width="14" height="14" viewBox="0 0 14 14"><rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill={C.pkg}/></svg>} label={ar?'طرود':'Packages'} val={aPkg} col={C.pkg} dir={dir}/>
        <div style={{height:1,background:C.bdr,margin:'6px 0'}}/>
        <FlowRow icon={<Activity size={11} color={C.t3}/>} label={ar?'إجمالي الرحلات':'Total Trips'} val={aTotal.toLocaleString(ar?'ar-JO':undefined)} col={C.t0} dir={dir}/>
        <FlowRow icon={<Zap size={11} color={C.green}/>}   label={ar?'السرعة':'Speed'}   val={`${aSpeed} km/h`} col={C.green} dir={dir}/>
        <FlowRow icon={<BarChart2 size={11} color={stats.util>.85?C.orange:C.green}/>} label={ar?'استخدام الشبكة':'Network Util.'} val={`${(stats.util*100).toFixed(0)}%`} col={stats.util>.85?C.orange:C.green} dir={dir}/>
        <div style={{marginTop:8,padding:'7px 9px',borderRadius:9,background:`${C.ride}09`,border:`1px solid ${C.ride}18`}}>
          <div style={{fontSize:'.59rem',color:C.t3,marginBottom:2}}>{ar?'أكثر مسار نشاطاً':'Top Active Route'}</div>
          <div style={{fontSize:'.74rem',fontWeight:700,color:C.rideLt,direction:'ltr',textAlign:ar?'right':'left'}}>{stats.topRoute}</div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="traffic" title={ar?'كثافة المرور':'Traffic Density'} icon={<svg width="13" height="8" viewBox="0 0 13 8"><rect x="0" y="1" width="13" height="6" rx="3" fill={C.traf} opacity=".35"/><rect x="0" y="2.5" width="13" height="3" rx="1.5" fill={C.traf} opacity=".80"/></svg>} accent={C.traf} collapsed={collapsed.has('traffic')} onToggle={()=>toggleCard('traffic')} dir={dir}>
        {[{l:ar?'منخفض <35%':'Low  <35%',n:stats.trafficLow,a:.42},{l:ar?'متوسط 35-65%':'Med 35-65%',n:stats.trafficMed,a:.66},{l:ar?'مرتفع >65%':'High >65%',n:stats.trafficHigh,a:.90}].map(b=>(
          <div key={b.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 9px',borderRadius:8,background:`rgba(139,92,246,${b.a*.08})`,border:`1px solid rgba(139,92,246,${b.a*.20})`,marginBottom:5,flexDirection:rowDir}}>
            <span style={{color:C.t2,fontSize:'.67rem'}}>{b.l}</span>
            <span style={{color:C.trafLt,fontWeight:800,fontSize:'.82rem'}}>{b.n}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',padding:'6px 9px',borderRadius:8,background:`${C.traf}09`,border:`1px solid ${C.traf}18`,flexDirection:rowDir}}>
          <span style={{fontSize:'.63rem',color:C.t3}}>{ar?'الازدحام الكلي':'Avg Congestion'}</span>
          <span style={{fontSize:'.72rem',fontWeight:800,color:C.trafLt}}>{(stats.cong*100).toFixed(0)}%</span>
        </div>
      </CollapsibleCard>

      <CollapsibleCard id="ai" title={ar?'محرك الأتمتة':'Automation Engine'} icon={<BrainCircuit size={12}/>} accent={C.cyan} collapsed={collapsed.has('ai')} onToggle={()=>toggleCard('ai')} dir={dir}>
        {[{l:ar?'تحسين المسار':'Route Optimizer',on:true},{l:ar?'التسعير الذكي':'Dynamic Pricing',on:true},{l:ar?'توقع الطلب':'Demand Forecast',on:true},{l:ar?'تجميع الرحلات':'Trip Clustering',on:false}].map(ai=>(
          <div key={ai.l} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 8px',borderRadius:7,background:'rgba(255,255,255,0.025)',marginBottom:5,flexDirection:rowDir}}>
            <span style={{fontSize:'.66rem',color:C.t2}}>{ai.l}</span>
            <div style={{display:'flex',alignItems:'center',gap:4,flexDirection:rowDir}}>
              <span style={{width:5,height:5,borderRadius:'50%',background:ai.on?C.green:C.t3,boxShadow:ai.on?`0 0 7px ${C.green}`:'none',display:'block',animation:ai.on?'dmPulse 2s ease-in-out infinite':'none'}}/>
              <span style={{fontSize:'.60rem',fontWeight:700,color:ai.on?C.green:C.t3}}>{ai.on?(ar?'نشط':'Active'):(ar?'متوقف':'Idle')}</span>
            </div>
          </div>
        ))}
        <div style={{marginTop:6,padding:'6px 9px',borderRadius:8,background:'rgba(0,212,255,0.06)',border:'1px solid rgba(0,212,255,0.14)'}}>
          <div style={{fontSize:'.59rem',color:'rgba(0,212,255,0.55)',direction:'ltr',textAlign:ar?'right':'left'}}>CartoDB · Leaflet · Canvas2D · Greenshields · GxP</div>
        </div>
      </CollapsibleCard>
    </div>
  );

  return(
    <div dir={dir} style={{display:'flex',flexDirection:'column',height:'100vh',background:C.bg,fontFamily:C.F,overflow:'hidden',color:C.t1}}>
      <style>{CSS}</style>

      {/* ════ MEGA-NAV ════ */}
      <nav style={{height:56,flexShrink:0,background:C.nav,borderBottom:`1px solid ${C.bdr}`,backdropFilter:'blur(28px)',display:'flex',alignItems:'center',padding:`0 ${isMobile?12:18}px`,gap:isMobile?6:4,boxShadow:'0 1px 0 rgba(0,130,255,0.07),0 4px 30px rgba(0,0,0,0.65)',zIndex:200,position:'relative',flexDirection:rowDir}}>
        {!isMobile&&(
          <div style={{display:'flex',alignItems:'center',gap:2,flex:1,overflow:'hidden',flexDirection:rowDir}}>
            {NAV.map(n=>{const on=activeNav===n.k;return(
              <button key={n.k} className="dmnav" data-on={on} onClick={()=>setActiveNav(n.k)} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 11px',borderRadius:10,border:on?`1px solid rgba(43,143,255,0.18)`:'1px solid transparent',fontFamily:C.F,background:on?'rgba(43,143,255,0.12)':'transparent',color:on?C.ride:C.t2,fontWeight:on?700:500,fontSize:'.72rem',boxShadow:on?'0 0 14px rgba(43,143,255,0.12)':'none',flexShrink:0,flexDirection:rowDir}}>
                {n.icon}<span>{ar?n.ar:n.en}</span>
              </button>
            );})}
          </div>
        )}
        {isMobile&&<div style={{flex:1}}/>}
        {isMobile&&(
          <button className="dm" onClick={()=>setMobileNavOpen(o=>!o)} style={{padding:'7px',borderRadius:9,border:`1px solid ${C.bdr}`,background:'rgba(255,255,255,0.04)',color:C.t2,display:'flex',alignItems:'center'}}>
            <Menu size={16}/>
          </button>
        )}
        <div style={{display:'flex',alignItems:'center',gap:isMobile?5:7,flexShrink:0,marginInlineStart:'auto',flexDirection:rowDir}}>
          {!isMobile&&(
            <div style={{display:'flex',gap:4,flexDirection:rowDir}}>
              {LAYER_CFG.map(l=>{const on=layers[l.k as keyof typeof layers];return(
                <button key={l.k} className="dm" onClick={()=>setLayers(p=>({...p,[l.k]:!p[l.k as keyof typeof p]}))} style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:8,border:`1px solid ${on?l.col+'52':C.bdr}`,background:on?`${l.col}12`:'rgba(255,255,255,0.02)',color:on?l.col:C.t3,fontWeight:700,fontSize:'.67rem',fontFamily:C.F,boxShadow:on?`0 0 8px ${l.col}18`:'none',opacity:on?1:.50,flexDirection:rowDir}}>
                  {l.shape}<span>{ar?l.arL:l.en}</span>
                </button>
              );})}
            </div>
          )}
          {!isMobile&&<div style={{width:1,height:24,background:C.bdr}}/>}
          <button className="dm" onClick={()=>setLive(l=>!l)} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 9px',borderRadius:8,border:`1px solid ${live?C.cyan+'44':C.bdr}`,background:live?'rgba(0,212,255,0.09)':'rgba(255,255,255,0.02)',color:live?C.cyan:C.t3,fontWeight:700,fontSize:'.67rem',fontFamily:C.F}}>
            <Radio size={10}/>{!isMobile&&<span>{ar?'مباشر':'Live'}</span>}
          </button>
          <button className="dm" onClick={()=>setPaused(p=>!p)} style={{display:'flex',alignItems:'center',gap:4,padding:'4px 9px',borderRadius:8,border:`1px solid ${paused?C.ride+'55':C.bdr}`,background:paused?`${C.ride}18`:'rgba(255,255,255,0.02)',color:paused?C.ride:C.t2,fontWeight:700,fontSize:'.67rem',fontFamily:C.F}}>
            {paused?<Play size={10}/>:<Pause size={10}/>}{!isMobile&&<span>{paused?(ar?'تشغيل':'Play'):(ar?'إيقاف':'Pause')}</span>}
          </button>
          <button className="dm" onClick={reset} style={{padding:'4px 7px',borderRadius:8,border:`1px solid ${C.bdr}`,background:'rgba(255,255,255,0.02)',color:C.t3,display:'flex',alignItems:'center'}}><RotateCcw size={10}/></button>
          {!isMobile&&<div style={{display:'flex',gap:3}}>{([1,2,5] as const).map(s=>(<button key={s} className="dm" onClick={()=>setMult(s)} style={{padding:'4px 8px',borderRadius:7,border:`1px solid ${mult===s?C.ride+'44':C.bdr}`,background:mult===s?`${C.ride}16`:'rgba(255,255,255,0.02)',color:mult===s?C.ride:C.t3,fontWeight:700,fontSize:'.66rem',fontFamily:C.F}}>{s}×</button>))}</div>}
          {!isMobile&&<div style={{width:1,height:24,background:C.bdr}}/>}
          <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 9px',borderRadius:99,background:'rgba(0,232,122,0.09)',border:'1px solid rgba(0,232,122,0.22)',flexDirection:rowDir}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:C.green,boxShadow:`0 0 8px ${C.green}`,display:'block',animation:'dmPulse 1.4s ease-in-out infinite'}}/>
            <span style={{fontSize:'.60rem',fontWeight:800,color:C.green,letterSpacing:'.12em'}}>LIVE</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 9px',borderRadius:8,background:'rgba(255,255,255,0.04)',border:`1px solid ${C.bdr}`,flexDirection:rowDir}}>
            <Clock size={10} color={C.t3}/>
            <span style={{fontSize:'.66rem',color:C.t1,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{fmtH(curH)}</span>
            {isPeak&&<span style={{fontSize:'.55rem',fontWeight:800,color:C.orange}}>🔥</span>}
          </div>
          {!isMobile&&(
            <button className="dm" onClick={()=>setShowKbd(k=>!k)} style={{padding:'4px 7px',borderRadius:8,border:`1px solid ${C.bdr}`,background:showKbd?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.02)',color:C.t3,display:'flex',alignItems:'center'}}>
              <Keyboard size={10}/>
            </button>
          )}
          {/* ── Brand: Crown W logo + Wasel wordmark (right side) ── */}
          <div style={{width:1,height:24,background:C.bdr,flexShrink:0,marginInline:2}}/>
          <div style={{display:'flex',alignItems:'center',gap:7,flexShrink:0,flexDirection:rowDir,minWidth:0,maxWidth:isMobile?44:150}}>
            <img
              src={brandMark}
              alt="Wasel"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src.includes('/icon-512.png')) return;
                img.src = '/icon-512.png';
              }}
              draggable={false}
              style={{width:32,height:32,objectFit:'contain',flexShrink:0,borderRadius:6,display:'block'}}
            />
            {!isMobile&&(
              <span style={{fontWeight:800,fontSize:'1.0rem',color:C.t0,letterSpacing:'-.018em',flexShrink:1,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Wasel</span>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile nav dropdown */}
      <AnimatePresence>
        {isMobile&&mobileNavOpen&&(
          <motion.div key="mnav" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:.15}}
            style={{position:'absolute',top:56,insetInlineStart:0,insetInlineEnd:0,background:C.nav,borderBottom:`1px solid ${C.bdr}`,zIndex:190,padding:'8px 12px',display:'flex',flexDirection:'column',gap:4,backdropFilter:'blur(24px)'}}>
            {NAV.map(n=>{const on=activeNav===n.k;return(
              <button key={n.k} className="dmnav" data-on={on} onClick={()=>{setActiveNav(n.k);setMobileNavOpen(false);}} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:12,border:on?`1px solid rgba(43,143,255,0.18)`:'1px solid transparent',fontFamily:C.F,background:on?'rgba(43,143,255,0.12)':'transparent',color:on?C.ride:C.t2,fontWeight:on?700:500,fontSize:'.80rem',flexDirection:rowDir,justifyContent:'flex-start'}}>
                {n.icon}<span>{ar?n.ar:n.en}</span>
                {on&&<ArrowUpRight size={12} style={{marginInlineStart:'auto'}}/>}
              </button>
            );})}
            <div style={{height:1,background:C.bdr,margin:'4px 0'}}/>
            <div style={{display:'flex',gap:6,padding:'4px 0',flexDirection:rowDir}}>
              {LAYER_CFG.map(l=>{const on=layers[l.k as keyof typeof layers];return(
                <button key={l.k} className="dm" onClick={()=>setLayers(p=>({...p,[l.k]:!p[l.k as keyof typeof p]}))} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'8px 6px',borderRadius:9,border:`1px solid ${on?l.col+'52':C.bdr}`,background:on?`${l.col}12`:'rgba(255,255,255,0.02)',color:on?l.col:C.t3,fontWeight:700,fontSize:'.60rem',fontFamily:C.F,opacity:on?1:.50}}>
                  {l.shape}<span>{ar?l.arL:l.en}</span>
                </button>
              );})}
            </div>
            <div style={{display:'flex',gap:5,padding:'4px 0',flexDirection:rowDir}}>
              {([1,2,5] as const).map(s=>(<button key={s} className="dm" onClick={()=>setMult(s)} style={{flex:1,padding:'8px',borderRadius:8,border:`1px solid ${mult===s?C.ride+'44':C.bdr}`,background:mult===s?`${C.ride}16`:'rgba(255,255,255,0.02)',color:mult===s?C.ride:C.t3,fontWeight:700,fontSize:'.72rem',fontFamily:C.F}}>{s}×</button>))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section style={{flexShrink:0,padding:isMobile?'10px 10px 8px':'12px 16px 10px',background:'linear-gradient(180deg, rgba(3,10,24,0.98), rgba(3,10,24,0.92))',borderBottom:`1px solid ${C.bdr}`,display:'flex',flexDirection:'column',gap:10}}>
        <div style={{display:'flex',alignItems:isMobile?'flex-start':'center',justifyContent:'space-between',gap:10,flexDirection:isMobile?'column':'row'}}>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            <div style={{fontSize:'.62rem',fontWeight:800,color:C.cyan,letterSpacing:'.14em',textTransform:'uppercase'}}>
              {ar?'محرك قيمة التنقل':'Mobility Value Engine'}
            </div>
            <div style={{fontSize:isMobile?'.92rem':'1.02rem',fontWeight:800,color:C.t0}}>
              {ar
                ? 'يبين لماذا Mobility OS أفضل للراكب والسائق والتشغيل في نفس الشاشة'
                : 'Shows why Mobility OS is better for riders, drivers, and operators in one screen'}
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',flexDirection:rowDir}}>
            <span style={{padding:'4px 9px',borderRadius:999,background:'rgba(0,232,122,0.10)',border:'1px solid rgba(0,232,122,0.22)',fontSize:'.62rem',fontWeight:800,color:C.green}}>
              {ar?`جاهزية ${valueMetrics.fulfillment}%`:`${valueMetrics.fulfillment}% ready`}
            </span>
            <span style={{padding:'4px 9px',borderRadius:999,background:`${C.pkg}12`,border:`1px solid ${C.pkg}26`,fontSize:'.62rem',fontWeight:800,color:C.pkg}}>
              {ar?`ضغط الطلب x${valueMetrics.demandPressure.toFixed(2)}`:`Demand x${valueMetrics.demandPressure.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr 1fr':'repeat(4, minmax(0, 1fr))',gap:10}}>
          {benefitCards.map(card=>(
            <div key={card.key} className="dm-surface" style={{borderRadius:16,padding:'12px 12px',border:`1px solid ${card.accent}22`,background:`linear-gradient(180deg, ${card.accent}10, rgba(8,19,44,0.84) 55%, rgba(6,14,32,0.92) 100%)`}}>
              <div style={{fontSize:'.58rem',fontWeight:800,color:card.accent,letterSpacing:'.10em',textTransform:'uppercase',marginBottom:6}}>{card.title}</div>
              <div style={{fontSize:isMobile?'.95rem':'1.08rem',fontWeight:900,color:C.t0,marginBottom:4,fontVariantNumeric:'tabular-nums'}}>{card.value}</div>
              <div style={{fontSize:'.63rem',lineHeight:1.45,color:C.t2}}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{borderRadius:12,padding:'10px 11px',background:'rgba(5,14,32,0.92)',border:`1px solid ${C.bdrB}`,display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexDirection:rowDir}}>
            <div style={{fontSize:'.62rem',fontWeight:800,color:C.t0,letterSpacing:'.12em',textTransform:'uppercase'}}>
              {ar?'Math & Method':'Math & Method'}
            </div>
            <div style={{fontSize:'.60rem',color:C.t3}}>
              {ar?'المعادلات التي تشغل التوجيه والتسعير والتوازن':'The formulas driving routing, pricing, and balancing'}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(4, minmax(0, 1fr))',gap:8}}>
            {methodChips.map(chip=>(
              <div key={chip.key} className="dm-surface" style={{borderRadius:14,padding:'10px 11px',minWidth:0,background:'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018))'}}>
                <div style={{fontSize:'.60rem',fontWeight:900,color:C.cyan,marginBottom:4,letterSpacing:'.01em'}}>{chip.label}</div>
                <div style={{fontSize:'.63rem',lineHeight:1.55,color:C.t2,wordBreak:'break-word'}}>{chip.formula}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keyboard shortcuts overlay */}
      <AnimatePresence>
        {showKbd&&(
          <motion.div key="kbd" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.15}}
            style={{position:'fixed',inset:0,background:'rgba(2,8,16,0.80)',backdropFilter:'blur(8px)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}}
            onClick={()=>setShowKbd(false)}>
            <motion.div initial={{scale:.92,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.92,opacity:0}} transition={{duration:.18}} onClick={e=>e.stopPropagation()}
              style={{background:C.glassMd,border:`1px solid ${C.bdrB}`,borderRadius:18,padding:'24px 28px',minWidth:280,boxShadow:'0 24px 64px rgba(0,0,0,0.75)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
                <div style={{display:'flex',alignItems:'center',gap:9,flexDirection:rowDir}}>
                  <Keyboard size={16} color={C.cyan}/>
                  <span style={{fontWeight:800,color:C.t0,fontSize:'.92rem'}}>{ar?'اختصارات لوحة المفاتيح':'Keyboard Shortcuts'}</span>
                </div>
                <button className="dm" onClick={()=>setShowKbd(false)} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.bdr}`,borderRadius:6,padding:'4px 6px',color:C.t3,display:'flex',alignItems:'center'}}><X size={11}/></button>
              </div>
              {[{k:'Space',d:ar?'إيقاف/تشغيل':'Pause / Play'},{k:'R',d:ar?'إعادة تعيين':'Reset'},{k:'+ / -',d:ar?'تكبير/تصغير':'Zoom In / Out'},{k:'0',d:ar?'توسيط':'Center View'},{k:'Esc',d:ar?'إغلاق':'Close Panel'},{k:'?',d:ar?'هذه القائمة':'This Menu'}].map(s=>(
                <div key={s.k} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${C.bdr}`,flexDirection:rowDir}}>
                  <kbd style={{padding:'3px 9px',borderRadius:6,background:'rgba(255,255,255,0.08)',border:`1px solid ${C.bdr}`,fontSize:'.68rem',fontWeight:700,color:C.t1,fontFamily:'monospace'}}>{s.k}</kbd>
                  <span style={{fontSize:'.70rem',color:C.t2}}>{s.d}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════ BODY ════ */}
      <div style={{flex:1,display:'flex',minHeight:0,overflow:'hidden',flexDirection:rowDir}}>

        {/* Desktop sidebar */}
        {!isMobile&&(
          <AnimatePresence>
            {sideOpen&&(
              <motion.aside key="side" initial={{width:0,opacity:0}} animate={{width:258,opacity:1}} exit={{width:0,opacity:0}} transition={{duration:.22,ease:[.25,.1,.25,1]}}
                style={{flexShrink:0,background:C.glass,borderInlineEnd:`1px solid ${C.bdr}`,backdropFilter:'blur(22px)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
                <div style={{overflowY:'auto',flex:1}}>{SidebarContent}</div>
              </motion.aside>
            )}
          </AnimatePresence>
        )}
        {!isMobile&&(
          <button className="dm" onClick={()=>setSideOpen(o=>!o)} style={{width:16,flexShrink:0,background:'rgba(6,15,35,0.75)',border:'none',borderInlineStart:`1px solid ${C.bdr}`,borderInlineEnd:`1px solid ${C.bdr}`,color:C.t3,display:'flex',alignItems:'center',justifyContent:'center'}}>
            {ar?(sideOpen?<ChevronRight size={10}/>:<ChevronLeft size={10}/>):(sideOpen?<ChevronLeft size={10}/>:<ChevronRight size={10}/>)}
          </button>
        )}

        {/* MAP AREA */}
        <div ref={areaRef} className="dm-map" style={{flex:1,position:'relative',overflow:'hidden',background:C.bgMap}}>
          {/* Layer 1: Leaflet map tiles */}
          <div ref={mapDivRef} style={{position:'absolute',inset:0,zIndex:1}}/>
          {/* Layer 2: Canvas 2D overlay (roads, cities, effects) */}
          <canvas ref={cvRef}
            width={W*dprRef.current} height={H*dprRef.current}
            style={{position:'absolute',inset:0,zIndex:2,display:'block',width:'100%',height:'100%',cursor:'crosshair'}}
            onMouseMove={onMove} onMouseDown={onDown} onMouseUp={onUp}
            onMouseLeave={onUp} onClick={onClick} onWheel={onWheel}
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          />
          {/* Layer 3: Dedicated particle canvas (composited above routes) */}
          <canvas ref={particleCvRef} style={{position:'absolute',inset:0,zIndex:3,pointerEvents:'none',width:'100%',height:'100%',opacity:0.88}}/>

          {/* ── City tooltip ── */}
          <AnimatePresence>
            {tip&&!selR&&(
              <motion.div key="tip" initial={{opacity:0,scale:.90,y:8}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.90}} transition={{duration:.13}}
                style={{position:'absolute',pointerEvents:'none',zIndex:10,...L(Math.min(tip.sx+16,W-200),'auto'),top:Math.max(tip.sy-90,8),background:C.glassMd,backdropFilter:'blur(22px)',border:`1px solid ${C.bdrA}`,borderRadius:14,padding:'13px 16px',minWidth:176,boxShadow:'0 14px 42px rgba(0,0,0,0.7)'}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,flexDirection:rowDir}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:C.cyan,boxShadow:`0 0 8px ${C.cyan}`}}/>
                  <span style={{fontWeight:800,color:C.t0,fontSize:'.86rem'}}>{tip.city.name}</span>
                  <span style={{color:C.t3,fontSize:'.72rem',marginInlineStart:'auto',fontFamily:'Cairo,sans-serif'}}>{tip.city.ar}</span>
                </div>
                {[{l:ar?'🔵 ركاب':'🔵 Rides',v:tip.pax,c:C.ride},{l:ar?'🟡 طرود':'🟡 Packages',v:tip.pkg,c:C.pkg},{l:ar?'🟣 ازدحام':'🟣 Congestion',v:`${(tip.cong*100).toFixed(0)}%`,c:C.traf}].map(m=>(
                  <div key={m.l} style={{display:'flex',justifyContent:'space-between',marginBottom:5,flexDirection:rowDir}}>
                    <span style={{color:C.t3,fontSize:'.67rem'}}>{m.l}</span>
                    <span style={{color:m.c,fontWeight:700,fontSize:'.70rem'}}>{m.v}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Route detail panel ── */}
          <AnimatePresence>
            {selR&&(
              <motion.div key="rp" initial={{opacity:0,x:ar?-18:18}} animate={{opacity:1,x:0}} exit={{opacity:0,x:ar?-18:18}} transition={{duration:.17}}
                style={{position:'absolute',top:14,zIndex:10,...L('auto',14),width:240,background:C.glassMd,backdropFilter:'blur(24px)',border:`1px solid ${C.bdrB}`,borderRadius:16,padding:'16px',boxShadow:'0 18px 52px rgba(0,0,0,0.70)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:13,flexDirection:rowDir}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,flexDirection:rowDir}}>
                    <div style={{width:7,height:7,borderRadius:'50%',background:C.ride,boxShadow:`0 0 9px ${C.ride}`}}/>
                    <span style={{fontWeight:800,color:C.t0,fontSize:'.82rem'}}>{ar?'تفاصيل المسار':'Route Details'}</span>
                  </div>
                  <button className="dm" onClick={()=>{setSelR(null);selRRef.current=null;}} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.bdr}`,borderRadius:6,padding:'3px 5px',color:C.t3,display:'flex',alignItems:'center'}}><X size={11}/></button>
                </div>
                <div style={{fontWeight:800,color:C.ride,fontSize:'.87rem',marginBottom:13,paddingBottom:13,borderBottom:`1px solid ${C.bdr}`,direction:'ltr',textAlign:ar?'right':'left'}}>
                  {CITIES[selR.info.from]?.name} → {CITIES[selR.info.to]?.name}
                </div>
                {[{l:ar?'المسافة':'Distance',v:`${selR.info.km} km`},{l:ar?'المدة':'Duration',v:`${selR.info.mins} min`},{l:ar?'السعر':'Base Fare',v:`JOD ${selR.info.fare.toFixed(2)}`},{l:ar?'الازدحام':'Congestion',v:`${(selR.route.cong*100).toFixed(0)}%`},{l:ar?'السرعة':'Flow Speed',v:`${selR.route.speed.toFixed(0)} km/h`}].map(m=>(
                  <div key={m.l} style={{display:'flex',justifyContent:'space-between',marginBottom:8,flexDirection:rowDir}}>
                    <span style={{color:C.t3,fontSize:'.67rem'}}>{m.l}</span>
                    <span style={{color:C.t0,fontWeight:700,fontSize:'.70rem'}}>{m.v}</span>
                  </div>
                ))}
                {/* Book Now Button */}
                <button className="dm" onClick={()=>{const fc=CITIES.find(c=>c.id===selR.info.from);const tc=CITIES.find(c=>c.id===selR.info.to);if(fc&&tc)setBooking({route:selR.info,fromCity:fc,toCity:tc});}}
                  style={{width:'100%',marginTop:10,padding:'10px',borderRadius:11,border:'none',background:`linear-gradient(135deg,${C.ride},#1A55E3)`,color:'#fff',fontWeight:800,fontSize:'.78rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,flexDirection:rowDir,fontFamily:C.F,boxShadow:`0 4px 20px rgba(43,143,255,0.40)`,transition:'all .16s ease'}}>
                  <Ticket size={13}/>{ar?'احجز الآن':'Book Now'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Live event ticker (Supabase-style) ── */}
          <div style={{position:'absolute',zIndex:10,...L('auto',isMobile?8:14),bottom:60,display:'flex',flexDirection:'column',gap:5,alignItems:ar?'flex-start':'flex-end',maxWidth:240}}>
            <AnimatePresence>
              {liveEvents.map(ev=>(
                <motion.div key={ev.id}
                  initial={{opacity:0,x:ar?-18:18,scale:.92}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:ar?-18:18,scale:.92}}
                  transition={{duration:.2,ease:[.22,.1,.25,1]}}
                  className="dmtoast dm-surface"
                  style={{
                    display:'flex',alignItems:'center',gap:9,padding:'8px 12px',
                    borderRadius:14,
                    background:`linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`,
                    border:`1px solid rgba(255,255,255,0.08)`,
                    boxShadow:'0 14px 40px rgba(0,0,0,0.60)',
                    flexDirection:rowDir,
                    maxWidth:260,
                  }}>
                  <div style={{width:3,alignSelf:'stretch',borderRadius:99,background:`linear-gradient(180deg, ${ev.col}, rgba(255,255,255,0.0))`,boxShadow:`0 0 18px ${ev.col}55`}} />
                  <span style={{fontSize:'.92rem',flexShrink:0,filter:'drop-shadow(0 6px 14px rgba(0,0,0,0.55))'}}>{ev.icon}</span>
                  <span style={{fontSize:'.64rem',color:C.t1,fontWeight:650,lineHeight:1.32,textAlign:'start'}}>
                    <span style={{color:ev.col,fontWeight:800}}>{ev.text}</span>
                  </span>
                  <div className="bar" style={{background:`linear-gradient(90deg, ${ev.col}, rgba(255,255,255,0.25))`}} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Flow Legend ── */}
          <div style={{position:'absolute',bottom:52,zIndex:10,...L(12,'auto'),background:C.glass,backdropFilter:'blur(20px)',border:`1px solid ${C.bdr}`,borderRadius:14,padding:'11px 13px',boxShadow:'0 8px 34px rgba(0,0,0,0.58)',minWidth:isMobile?160:190}}>
            <div style={{fontSize:'.53rem',color:C.t3,fontWeight:800,letterSpacing:'.14em',textTransform:'uppercase',marginBottom:9}}>{ar?'دليل التدفق':'Flow Legend'}</div>
            {[
              {k:'rides' as const,   col:C.ride,en:'Rides',   arL:'ركاب',val:aPax, svg:<svg width="24" height="12" viewBox="0 0 24 12"><line x1="0" y1="6" x2="15" y2="6" stroke={C.ride} strokeWidth="2.5"/><polygon points="24,6 14,2 16.5,6 14,10" fill={C.ride}/></svg>},
              {k:'packages' as const,col:C.pkg, en:'Packages',arL:'طرود',val:aPkg, svg:<svg width="24" height="12" viewBox="0 0 24 12"><line x1="0" y1="6" x2="12" y2="6" stroke={C.pkg} strokeWidth="1.8" strokeDasharray="3,4"/><rect x="14" y="2" width="8" height="8" transform="rotate(45 18 6)" fill={C.pkg}/></svg>},
              {k:'traffic' as const, col:C.traf,en:'Traffic', arL:'مرور',val:`${(stats.cong*100).toFixed(0)}%`,svg:<svg width="24" height="12" viewBox="0 0 24 12"><rect x="0" y="2" width="24" height="8" rx="4" fill={C.traf} opacity=".28"/><rect x="0" y="4" width="24" height="4" rx="2" fill={C.traf} opacity=".75"/><rect x="0" y="5.5" width="24" height="2" rx="1" fill={C.trafLt} opacity=".55"/></svg>},
            ].map(r=>{
              const on = layers[r.k];
              return(
              <button
                key={r.en}
                className="dm"
                onClick={()=>setLayers(p=>({...p,[r.k]:!p[r.k]}))}
                style={{width:'100%',display:'flex',alignItems:'center',gap:8,marginBottom:6,padding:'6px 8px',borderRadius:10,background:on?`${r.col}10`:'rgba(255,255,255,0.02)',border:`1px solid ${on ? r.col+'22' : C.bdr}`,flexDirection:rowDir,textAlign:'start'}}
                aria-label={(ar? r.arL : r.en) + (on ? (ar?' إيقاف':' disable') : (ar?' تفعيل':' enable'))}
              >
                <div style={{flexShrink:0}}>{r.svg}</div>
                {!isMobile&&<div style={{flex:1}}><div style={{fontSize:'.69rem',fontWeight:700,color:C.t0}}>{ar?r.arL:r.en}</div></div>}
                <span style={{color:r.col,fontWeight:900,fontSize:'.92rem',fontVariantNumeric:'tabular-nums'}}>{r.val}</span>
              </button>
            );})}
          </div>

          {/* ── Zoom controls ── */}
          <div style={{position:'absolute',bottom:52,zIndex:10,...L('auto',14),display:'flex',flexDirection:'column',gap:5}}>
            {[{icon:<ZoomIn size={11}/>,fn:zIn},{icon:<ZoomOut size={11}/>,fn:zOut},{icon:<Crosshair size={11}/>,fn:zCtr}].map((b,i)=>(
              <button key={i} className="dm" onClick={b.fn} style={{width:32,height:32,borderRadius:9,background:C.glass,border:`1px solid ${C.bdr}`,color:C.t2,display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(12px)',boxShadow:'0 2px 12px rgba(0,0,0,0.4)'}}>{b.icon}</button>
            ))}
            <div style={{textAlign:'center',fontSize:'.50rem',color:C.t3,fontWeight:700,marginTop:1}}>
              {leafletRdy.current?`z${leafletZoom}`:Math.round(zoom*100)+'%'}
            </div>
          </div>

          {/* ── Status pill ── */}
          {!selR&&(
            <div style={{position:'absolute',top:12,zIndex:10,...L(12,'auto'),display:'flex',alignItems:'center',gap:8,background:C.glass,backdropFilter:'blur(16px)',border:`1px solid ${C.bdr}`,borderRadius:12,padding:'6px 10px',boxShadow:'0 10px 30px rgba(0,0,0,0.55)',flexDirection:rowDir}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:stable?C.green:C.orange,boxShadow:`0 0 7px ${stable?C.green:C.orange}`,display:'block'}}/>
              <span style={{fontSize:'.61rem',fontWeight:700,color:stable?C.green:C.orange}}>{ar?(stable?'مستقر':'تحذير'):(stable?'STABLE':'WARNING')}</span>
              <span style={{color:C.t4}}>·</span>
              <span style={{fontSize:'.59rem',color:C.t3,fontVariantNumeric:'tabular-nums'}}>{stats.latency}ms</span>
              <span style={{color:C.t4}}>·</span>
              <span style={{fontSize:'.54rem',padding:'1px 6px',borderRadius:99,background:'rgba(0,212,255,0.10)',color:C.cyan,fontWeight:700}}>{leafletRdy.current?'🗺 Live Tiles':'Canvas'}</span>
              <span style={{color:C.t4}}>·</span>
              <button
                className="dm"
                onClick={()=>setInsightsOpen(o=>!o)}
                style={{display:'flex',alignItems:'center',gap:6,padding:'3px 8px',borderRadius:99,border:`1px solid ${insights.sevCol}28`,background:`${insights.sevCol}10`,color:insights.sevCol,fontWeight:800,fontSize:'.58rem',fontFamily:C.F}}
                aria-label={ar?'فتح لوحة الرؤى':'Open insights'}
              >
                <BrainCircuit size={11} />
                <span>{ar?'Insights':'Insights'}</span>
              </button>
            </div>
          )}

          {/* ── Insights panel ── */}
          <AnimatePresence>
            {!selR&&insightsOpen&&(
              <motion.div
                key="ins"
                initial={{opacity:0,y:-10,scale:.98}}
                animate={{opacity:1,y:0,scale:1}}
                exit={{opacity:0,y:-10,scale:.98}}
                transition={{duration:.18,ease:[.22,.1,.25,1]}}
                style={{
                  position:'absolute',
                  top:48,
                  zIndex:10,
                  ...L(12,'auto'),
                  width: Math.min(360, isMobile ? 320 : 380),
                  borderRadius:18,
                  padding:'12px 12px',
                  background:'linear-gradient(180deg, rgba(6,15,35,0.88), rgba(4,10,22,0.92))',
                  border:`1px solid ${insights.sevCol}26`,
                  boxShadow:'0 22px 70px rgba(0,0,0,0.72)',
                  backdropFilter:'blur(26px) saturate(170%)',
                }}
              >
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexDirection:rowDir,marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexDirection:rowDir}}>
                    <div style={{width:9,height:9,borderRadius:99,background:insights.sevCol,boxShadow:`0 0 12px ${insights.sevCol}88`}} />
                    <div style={{fontWeight:900,color:C.t0,fontSize:'.78rem',letterSpacing:'-.01em'}}>{ar?'Live Insights':'Live Insights'}</div>
                  </div>
                  <button className="dm" onClick={()=>setInsightsOpen(false)} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${C.bdr}`,borderRadius:10,padding:'5px 7px',color:C.t3,display:'flex',alignItems:'center'}}><X size={12}/></button>
                </div>

                <div style={{fontSize:'.62rem',color:C.t3,marginBottom:10,direction:'ltr',textAlign:ar?'right':'left'}}>{insights.signal}</div>

                {[
                  {t: ar?'الملخص':'Summary', v: insights.bottleneck, col: insights.sevCol},
                  {t: ar?'لماذا':'Why', v: insights.why, col: C.cyan},
                  {t: ar?'التوصية':'Recommendation', v: insights.action, col: C.ride},
                ].map((b)=> (
                  <div key={b.t} className="dm-surface" style={{borderRadius:14,padding:'10px 11px',marginBottom:8,background:'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.018))'}}>
                    <div style={{fontSize:'.58rem',fontWeight:900,color:b.col,letterSpacing:'.10em',textTransform:'uppercase',marginBottom:6}}>{b.t}</div>
                    <div style={{fontSize:'.66rem',lineHeight:1.52,color:C.t1}}>{b.v}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Paused overlay */}
          {paused&&(
            <div style={{position:'absolute',inset:0,zIndex:20,background:'rgba(2,8,16,0.60)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{background:C.glassMd,border:`1px solid ${C.bdr}`,borderRadius:18,padding:'24px 48px',textAlign:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.75)',animation:'dmIn .2s ease-out'}}>
                <Pause size={28} color={C.ride} style={{marginBottom:12}}/>
                <p style={{color:C.t0,fontWeight:700,margin:0,fontSize:'.98rem'}}>{ar?'الحركة متوقفة':'Simulation Paused'}</p>
                <p style={{color:C.t3,margin:'6px 0 0',fontSize:'.68rem'}}>{ar?'اضغط مسافة للاستئناف':'Press Space to resume'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {isMobile&&mobileDrawer&&(
          <motion.div key="drawer" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{duration:.25,ease:[.25,.1,.25,1]}}
            style={{position:'fixed',bottom:0,left:0,right:0,zIndex:300,background:C.glassMd,backdropFilter:'blur(28px)',borderTop:`1px solid ${C.bdrA}`,borderRadius:'18px 18px 0 0',maxHeight:'70vh',overflowY:'auto',boxShadow:'0 -12px 48px rgba(0,0,0,0.65)'}}>
            <div style={{display:'flex',justifyContent:'center',padding:'10px 0 4px'}}>
              <div style={{width:36,height:4,borderRadius:2,background:C.t4}}/>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px 8px',flexDirection:rowDir}}>
              <span style={{fontWeight:700,color:C.t1,fontSize:'.82rem'}}>{ar?'لوحة البيانات':'Data Panel'}</span>
              <button className="dm" onClick={()=>setMobileDrawer(false)} style={{background:'rgba(255,255,255,0.06)',border:`1px solid ${C.bdr}`,borderRadius:6,padding:'4px 6px',color:C.t3,display:'flex',alignItems:'center'}}><X size={12}/></button>
            </div>
            {SidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      {isMobile&&(
        <button className="dm" onClick={()=>setMobileDrawer(d=>!d)} style={{position:'fixed',bottom:58,insetInlineEnd:16,width:44,height:44,borderRadius:'50%',background:'linear-gradient(140deg,#1A6AFF,#0040CC)',border:`1px solid ${C.bdrB}`,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 20px rgba(43,143,255,0.50)',zIndex:200}}>
          <BarChart2 size={16}/>
        </button>
      )}

      {/* ════ TIMELINE ════ */}
      <div style={{height:44,flexShrink:0,background:C.nav,borderTop:`1px solid ${C.bdr}`,backdropFilter:'blur(22px)',display:'flex',alignItems:'center',gap:isMobile?8:14,padding:`0 ${isMobile?10:18}px`,flexDirection:rowDir}}>
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0,flexDirection:rowDir}}>
          <Clock size={12} color={C.t3}/>
          <span style={{fontWeight:700,color:C.t1,fontSize:'.77rem',fontVariantNumeric:'tabular-nums'}}>{fmtH(curH)}</span>
          {isPeak&&<span style={{fontSize:'.57rem',fontWeight:800,padding:'2px 7px',borderRadius:99,background:'rgba(255,119,34,0.12)',color:C.orange,border:'1px solid rgba(255,119,34,0.22)'}}>🔥 PEAK</span>}
        </div>
        <div style={{flex:1,position:'relative',height:20,borderRadius:5,overflow:'hidden',background:'rgba(255,255,255,0.04)',border:`1px solid ${C.bdr}`}}>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'row'}}>
            {Array.from({length:24},(_,i)=>{const d=hourDemand(i);return(<div key={i} style={{flex:1,background:d>1.4?`rgba(255,119,34,${Math.min(.32,(d-1.4)*.22)})`:`rgba(43,143,255,${Math.min(.10,d*.055)})`}}/>);})}
          </div>
          <input type="range" min={0} max={23} step={.5} value={curH}
            onChange={e=>{setLive(false);setHr(parseFloat(e.target.value));}}
            style={{position:'absolute',inset:0,width:'100%',height:'100%',accentColor:C.ride,cursor:'pointer',opacity:.9,direction:'ltr'}}
          />
        </div>
        {!isMobile&&(
          <div style={{display:'flex',gap:10,fontSize:'.57rem',color:C.t3,flexShrink:0,flexDirection:rowDir}}>
            {['0h','6h','12h','18h','23h'].map(t=><span key={t} style={{fontVariantNumeric:'tabular-nums'}}>{t}</span>)}
          </div>
        )}
      </div>

      {/* ════ BOOKING MODAL ════ */}
      <AnimatePresence>
        {booking&&(
          <BookingModal
            key="bm"
            route={booking.route}
            fromCity={booking.fromCity}
            toCity={booking.toCity}
            onClose={()=>setBooking(null)}
            ar={ar}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLAPSIBLE CARD
// ─────────────────────────────────────────────────────────────────────────────
function CollapsibleCard({id,title,icon,accent,collapsed,onToggle,children,dir}:{id:string;title:string;icon:React.ReactNode;accent:string;collapsed:boolean;onToggle:()=>void;children:React.ReactNode;dir:'ltr'|'rtl'}){
  const rowDir=dir==='rtl'?'row-reverse':'row' as 'row'|'row-reverse';
  return(
    <div className="dmcard">
      <button onClick={onToggle} className="dm" style={{width:'100%',display:'flex',alignItems:'center',padding:'10px 13px',borderBottom:`1px solid ${collapsed?'transparent':C.bdr}`,background:'rgba(255,255,255,0.02)',border:'none',borderRadius:0,cursor:'pointer',flexDirection:rowDir,gap:8}}>
        <div style={{width:22,height:22,borderRadius:7,background:`${accent}18`,border:`1px solid ${accent}28`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{color:accent,display:'flex',alignItems:'center'}}>{icon}</span>
        </div>
        <span style={{fontWeight:700,color:C.t1,fontSize:'.72rem',flex:1,textAlign:'start'}}>{title}</span>
        <span style={{color:C.t3,display:'flex',alignItems:'center',flexShrink:0}}>{collapsed?<ChevronDown size={12}/>:<ChevronUp size={12}/>}</span>
        {!collapsed&&<span style={{width:5,height:5,borderRadius:'50%',background:accent,boxShadow:`0 0 6px ${accent}`,display:'block',animation:'dmPulse 2.4s ease-in-out infinite',flexShrink:0}}/>}
      </button>
      <AnimatePresence>
        {!collapsed&&(
          <motion.div key="body" initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.18,ease:[.25,.1,.25,1]}}>
            <div style={{padding:'11px 12px'}}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW ROW
// ─────────────────────────────────────────────────────────────────────────────
function FlowRow({icon,label,val,col,dir}:{icon:React.ReactNode;label:string;val:string|number;col:string;dir:'ltr'|'rtl'}){
  const rowDir=dir==='rtl'?'row-reverse':'row' as 'row'|'row-reverse';
  return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8,flexDirection:rowDir}}>
      <div style={{display:'flex',alignItems:'center',gap:7,flexDirection:rowDir}}>
        <span style={{display:'flex',alignItems:'center',width:16,height:16,justifyContent:'center'}}>{icon}</span>
        <span style={{fontSize:'.68rem',color:C.t2}}>{label}</span>
      </div>
      <span style={{color:col,fontWeight:800,fontSize:'.74rem',textShadow:`0 0 10px ${col}45`,fontVariantNumeric:'tabular-nums'}}>{val}</span>
    </div>
  );
}
