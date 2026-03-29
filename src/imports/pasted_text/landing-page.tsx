/**
 * Wasel | واصل — LANDING PAGE v5.0 "OUT OF EARTH"
 * ─────────────────────────────────────────────────
 * Cinematic hero · Live Mobility OS simulation embedded
 * Apple keynote × SpaceX launch × Middle Eastern soul
 * Token-compliant — all colours via WaselColors tokens
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'motion/react';
import {
  ArrowRight, MapPin, Package, Users, Star, Shield,
  CheckCircle, ChevronRight, Zap, Globe,
  Menu, X, Twitter, Instagram, Facebook, Linkedin,
  Navigation, Car, Heart, Award, Lock,
  Layers, Radio, TrendingUp, Leaf,
  Play, Pause, RotateCcw,
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { WaselBrand, WaselLogoMark } from './WaselBrand';
import { WaselColors, WaselGradients } from '../tokens/wasel-tokens';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

// ─── Seeded PRNG (Mulberry32) ─────────────────────────────────────────────────
function makePRNG(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Mobility OS Simulation Types ────────────────────────────────────────────
interface CityNode { id:number;name:string;nameAr:string;lat:number;lon:number;population:number;isHub:boolean;tier:1|2|3;x:number;y:number;demand:number;pulsePhase:number; }
interface RouteEdge { id:string;from:number;to:number;distanceKm:number;strength:number;flow:number;congestion:number;passengerFlow:number;packageFlow:number;animOffset:number; }
interface Agent { id:number;type:'passenger'|'package'|'driver';path:number[];pathSegment:number;segmentProgress:number;speed:number;x:number;y:number;trail:{x:number;y:number}[];angle:number;active:boolean; }

const JORDAN_CITIES_DATA = [
  { id:0,  name:'Amman',    nameAr:'عمّان',        lat:31.95,lon:35.93,population:10,isHub:true,  tier:1 as const },
  { id:1,  name:'Aqaba',    nameAr:'العقبة',       lat:29.53,lon:35.00,population:6, isHub:true,  tier:1 as const },
  { id:2,  name:'Irbid',    nameAr:'إربد',         lat:32.55,lon:35.85,population:8, isHub:true,  tier:1 as const },
  { id:3,  name:'Zarqa',    nameAr:'الزرقاء',      lat:32.07,lon:36.09,population:7, isHub:false, tier:1 as const },
  { id:4,  name:'Dead Sea', nameAr:'البحر الميت',  lat:31.72,lon:35.45,population:3, isHub:false, tier:2 as const },
  { id:5,  name:'Petra',    nameAr:'البتراء',      lat:30.32,lon:35.48,population:4, isHub:false, tier:2 as const },
  { id:6,  name:'Wadi Rum', nameAr:'وادي رم',      lat:29.58,lon:35.42,population:2, isHub:false, tier:2 as const },
  { id:7,  name:'Madaba',   nameAr:'مادبا',        lat:31.72,lon:35.79,population:4, isHub:false, tier:2 as const },
  { id:8,  name:'Ajloun',   nameAr:'عجلون',        lat:32.33,lon:35.75,population:3, isHub:false, tier:2 as const },
  { id:9,  name:'Jerash',   nameAr:'جرش',          lat:32.28,lon:35.90,population:3, isHub:false, tier:2 as const },
  { id:10, name:'Salt',     nameAr:'السلط',        lat:32.04,lon:35.72,population:3, isHub:false, tier:2 as const },
  { id:11, name:'Karak',    nameAr:'الكرك',        lat:31.18,lon:35.70,population:4, isHub:false, tier:2 as const },
  { id:12, name:"Ma'an",    nameAr:'معان',         lat:30.20,lon:35.73,population:3, isHub:false, tier:2 as const },
  { id:13, name:'Mafraq',   nameAr:'المفرق',       lat:32.34,lon:36.21,population:4, isHub:false, tier:2 as const },
  { id:14, name:'Tafila',   nameAr:'الطفيلة',      lat:30.84,lon:35.60,population:2, isHub:false, tier:3 as const },
  { id:15, name:'Shobak',   nameAr:'الشوبك',       lat:30.52,lon:35.55,population:2, isHub:false, tier:3 as const },
];
const ROUTE_PAIRS: [number,number,number][] = [
  [0,2,85],[0,3,22],[0,7,35],[0,10,28],[0,4,65],[0,1,335],[0,11,120],[0,9,50],[0,8,75],[0,13,75],
  [2,8,30],[2,9,50],[2,13,70],[7,11,85],[7,4,30],[11,14,80],[11,5,110],[14,5,70],[5,15,50],[5,12,110],
  [12,1,120],[6,1,60],[6,12,80],[10,7,12],[9,8,25],[3,13,55],
];
const LAT_MIN=29.1,LAT_MAX=33.6,LON_MIN=34.7,LON_MAX=39.5,PAD=55;

function lonToX(lon:number,w:number){return PAD+((lon-LON_MIN)/(LON_MAX-LON_MIN))*(w-PAD*2);}
function latToY(lat:number,h:number){return PAD+((LAT_MAX-lat)/(LAT_MAX-LAT_MIN))*(h-PAD*2);}
function todMult(hour:number){
  const m=1.8*Math.exp(-0.5*((hour-7)/1.5)**2);
  const e=2.0*Math.exp(-0.5*((hour-17.5)/1.5)**2);
  return Math.max(0.25,m+e);
}
function aStarSimple(adj:Map<number,{to:number;w:number}[]>,n:number,start:number,end:number):number[]{
  const g=new Float32Array(n).fill(Infinity),prev=new Int32Array(n).fill(-1),vis=new Uint8Array(n);
  g[start]=0;
  for(let i=0;i<n*n;i++){
    let u=-1,mf=Infinity;
    for(let k=0;k<n;k++){if(!vis[k]&&g[k]<mf){mf=g[k];u=k;}}
    if(u<0||u===end)break;
    vis[u]=1;
    for(const {to,w} of(adj.get(u)??[])){if(!vis[to]&&g[u]+w<g[to]){g[to]=g[u]+w;prev[to]=u;}}
  }
  const path:number[]=[];let cur=end;
  while(cur!==-1){path.unshift(cur);cur=prev[cur];}
  return path[0]===start&&path.length>1?path:[];
}

/* ─── Embedded Mobility OS Simulation ───────────────────────────────────────── */
function EmbeddedMobilityOS() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const simRef = useRef<{
    cities: CityNode[]; edges: RouteEdge[]; agents: Agent[];
    adj: Map<number,{to:number;w:number}[]>;
    rng: ()=>number; tick: number; agentId: number;
    animTime: number; timeOfDay: number;
    totalTrips: number; activeTravelers: number; activePackages: number;
  } | null>(null);
  const lastTimeRef = useRef<number>(0);
  const statsThrottleRef = useRef(0);

  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 560 });
  const [paused, setPaused] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState(9);
  const [stats, setStats] = useState({ travelers:0, packages:0, trips:0, strength:0, corridor:'' });
  const [hoveredCity, setHoveredCity] = useState<number|null>(null);
  const [selectedCity, setSelectedCity] = useState<number|null>(null);
  const [tooltip, setTooltip] = useState<{x:number;y:number;city:CityNode}|null>(null);

  // Build/rebuild simulation
  const buildSim = useCallback((w:number, h:number) => {
    const rng = makePRNG(20260312);
    const cities: CityNode[] = JORDAN_CITIES_DATA.slice(0,16).map(c => ({
      ...c, x: lonToX(c.lon,w), y: latToY(c.lat,h), demand: c.population/10, pulsePhase: rng()*Math.PI*2,
    }));
    const edges: RouteEdge[] = [];
    const used = new Set<string>();
    for(const [f,t,d] of ROUTE_PAIRS) {
      if(f>=cities.length||t>=cities.length) continue;
      const k=`${Math.min(f,t)}-${Math.max(f,t)}`;
      if(used.has(k)) continue; used.add(k);
      edges.push({id:k,from:f,to:t,distanceKm:d,strength:0.1+rng()*0.2,flow:0,congestion:0.05+rng()*0.1,passengerFlow:0,packageFlow:0,animOffset:rng()*1000});
    }
    const adj = new Map<number,{to:number;w:number}[]>();
    cities.forEach(c=>adj.set(c.id,[]));
    edges.forEach(e=>{
      const w=e.distanceKm*(1+e.congestion*0.75);
      adj.get(e.from)!.push({to:e.to,w});
      adj.get(e.to)!.push({to:e.from,w});
    });
    simRef.current = {cities,edges,agents:[],adj,rng,tick:0,agentId:0,animTime:0,timeOfDay:9,totalTrips:0,activeTravelers:0,activePackages:0};
    // Seed initial agents
    for(let i=0;i<60;i++) spawnAgentInto(simRef.current);
  }, []);

  function spawnAgentInto(sim: NonNullable<typeof simRef.current>) {
    const n=sim.cities.length;
    const from=Math.floor(sim.rng()*n);
    let to=Math.floor(sim.rng()*n); while(to===from) to=Math.floor(sim.rng()*n);
    const path=aStarSimple(sim.adj,n,from,to);
    if(path.length<2) return;
    const r=sim.rng();
    const type:Agent['type'] = r<0.55?'passenger':r<0.75?'package':'driver';
    const speed=(0.002+sim.rng()*0.003)*(type==='package'?0.65:type==='driver'?1.2:1);
    const c=sim.cities[from];
    sim.agents.push({id:sim.agentId++,type,path,pathSegment:0,segmentProgress:sim.rng(),speed,x:c.x,y:c.y,trail:[],angle:0,active:true});
    sim.totalTrips++;
  }

  // Measure container
  useEffect(()=>{
    const measure=()=>{
      if(!containerRef.current) return;
      const {width,height}=containerRef.current.getBoundingClientRect();
      const w=Math.max(500,width);
      const h=Math.max(380,Math.min(640, height));
      setCanvasSize(p=>{
        if(Math.abs(p.w-w)<2&&Math.abs(p.h-h)<2) return p;
        if(simRef.current) {
          // remap coords
          simRef.current.cities.forEach(c=>{c.x=lonToX(c.lon,w);c.y=latToY(c.lat,h);});
        }
        return {w,h};
      });
    };
    measure();
    const ro=new ResizeObserver(measure);
    if(containerRef.current) ro.observe(containerRef.current);
    return ()=>ro.disconnect();
  },[]);

  // Init sim
  useEffect(()=>{ buildSim(canvasSize.w,canvasSize.h); },[]);// eslint-disable-line

  // Sync time of day
  useEffect(()=>{ if(simRef.current) simRef.current.timeOfDay=timeOfDay; },[timeOfDay]);

  // Render loop
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext('2d'); if(!ctx) return;
    const loop=(time:number)=>{
      const dt=Math.min((time-(lastTimeRef.current||time))/1000,0.05);
      lastTimeRef.current=time;
      const sim=simRef.current;
      if(!paused&&sim){
        sim.animTime+=dt;
        sim.tick++;
        const tod=todMult(sim.timeOfDay);
        // Move agents
        const edgeFlow=new Map<string,{p:number;pkg:number}>();
        sim.edges.forEach(e=>edgeFlow.set(e.id,{p:0,pkg:0}));
        for(const a of sim.agents){
          if(!a.active) continue;
          const sf=a.path[a.pathSegment],st=a.path[a.pathSegment+1];
          if(sf===undefined||st===undefined){a.active=false;continue;}
          const ek=`${Math.min(sf,st)}-${Math.max(sf,st)}`;
          const ef=edgeFlow.get(ek);
          if(ef){if(a.type==='passenger')ef.p++;else if(a.type==='package')ef.pkg++;}
          a.segmentProgress+=a.speed*dt*60;
          const cf=sim.cities[sf],ct=sim.cities[st];
          const px=a.x,py=a.y;
          a.x=cf.x+(ct.x-cf.x)*a.segmentProgress;
          a.y=cf.y+(ct.y-cf.y)*a.segmentProgress;
          const dx=a.x-px,dy=a.y-py;
          if(dx!==0||dy!==0) a.angle=Math.atan2(dy,dx);
          if(sim.tick%3===0){a.trail.push({x:a.x,y:a.y});if(a.trail.length>8)a.trail.shift();}
          if(a.segmentProgress>=1){a.segmentProgress=0;a.pathSegment++;if(a.pathSegment>=a.path.length-1)a.active=false;}
        }
        // Edge reinforcement
        for(const e of sim.edges){
          const ef=edgeFlow.get(e.id)??{p:0,pkg:0};
          const total=ef.p+ef.pkg;
          e.flow=total; e.passengerFlow=ef.p; e.packageFlow=ef.pkg;
          e.strength=Math.min(1,e.strength+total*0.018*dt);
          e.strength=Math.max(0,e.strength-0.0008*dt);
          e.congestion=Math.min(1,total/12);
          e.animOffset+=dt*40;
        }
        // City pulses
        for(const c of sim.cities){
          c.demand=Math.max(0.05,Math.min(1,(c.population/10)*tod+Math.sin(sim.tick*0.009+c.id*1.4)*0.07));
          c.pulsePhase+=dt*(1.5+c.demand);
        }
        // Agent pool
        sim.agents=sim.agents.filter(a=>a.active);
        const maxA=Math.floor(45+tod*25);
        if(sim.agents.length<maxA*0.7) for(let i=0;i<Math.min(12,maxA-sim.agents.length);i++) spawnAgentInto(sim);
        sim.activeTravelers=sim.agents.filter(a=>a.type==='passenger').length;
        sim.activePackages=sim.agents.filter(a=>a.type==='package').length;

        // Draw
        drawMobilityOS(ctx, sim, canvasSize.w, canvasSize.h, hoveredCity, selectedCity);

        // Throttle stats
        statsThrottleRef.current++;
        if(statsThrottleRef.current>=20){
          statsThrottleRef.current=0;
          const topEdge=[...sim.edges].sort((a,b)=>b.strength-a.strength)[0];
          setStats({
            travelers:sim.activeTravelers,
            packages:sim.activePackages,
            trips:sim.totalTrips*180,
            strength:sim.edges.reduce((s,e)=>s+e.strength,0)/sim.edges.length,
            corridor:topEdge?`${sim.cities[topEdge.from]?.name} → ${sim.cities[topEdge.to]?.name}`:'',
          });
        }
      }
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[paused,canvasSize,hoveredCity,selectedCity]);

  function drawMobilityOS(
    ctx:CanvasRenderingContext2D,
    sim:NonNullable<typeof simRef.current>,
    W:number,H:number,
    hovered:number|null,selected:number|null,
  ){
    // Background
    ctx.fillStyle='#040C18';ctx.fillRect(0,0,W,H);
    // Subtle aurora
    const aurora=ctx.createRadialGradient(W*0.35,H*0.3,0,W*0.35,H*0.3,W*0.55);
    aurora.addColorStop(0,'rgba(0,200,232,0.045)');aurora.addColorStop(1,'rgba(0,200,232,0)');
    ctx.fillStyle=aurora;ctx.fillRect(0,0,W,H);
    const aurora2=ctx.createRadialGradient(W*0.7,H*0.7,0,W*0.7,H*0.7,W*0.4);
    aurora2.addColorStop(0,'rgba(240,168,48,0.03)');aurora2.addColorStop(1,'rgba(240,168,48,0)');
    ctx.fillStyle=aurora2;ctx.fillRect(0,0,W,H);
    // Grid
    ctx.strokeStyle='rgba(0,200,232,0.03)';ctx.lineWidth=1;
    for(let x=0;x<W;x+=55){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<H;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // Edges
    for(const e of sim.edges){
      const cf=sim.cities[e.from],ct=sim.cities[e.to];
      if(!cf||!ct) continue;
      const isHL=selected!==null&&(e.from===selected||e.to===selected);
      const isHov=hovered!==null&&(e.from===hovered||e.to===hovered);
      const str=Math.max(0.02,e.strength);
      const lw=isHL?3.5+str*4:0.4+str*4;
      const alpha=isHL?0.95:isHov?0.6:0.06+str*0.55;
      const ratio=e.passengerFlow/Math.max(1,e.passengerFlow+e.packageFlow);
      const r=Math.round(0+(217-0)*(1-ratio)),g=Math.round(200*ratio+150*(1-ratio)),b=Math.round(232*ratio+91*(1-ratio));
      ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;ctx.lineWidth=lw;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(cf.x,cf.y);ctx.lineTo(ct.x,ct.y);ctx.stroke();
      if(e.flow>0&&(str>0.08||isHL)){
        const dl=9,gl=15,len=Math.hypot(ct.x-cf.x,ct.y-cf.y),ang=Math.atan2(ct.y-cf.y,ct.x-cf.x);
        ctx.save();ctx.translate(cf.x,cf.y);ctx.rotate(ang);
        ctx.strokeStyle=`rgba(${r},${g},${b},${Math.min(0.9,alpha+0.3)})`;
        ctx.lineWidth=lw*0.5;ctx.setLineDash([dl,gl]);
        ctx.lineDashOffset=-(e.animOffset%(dl+gl));
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(len,0);ctx.stroke();
        ctx.setLineDash([]);ctx.restore();
      }
      if(e.congestion>0.3){
        ctx.strokeStyle=`rgba(255,70,70,${e.congestion*0.25})`;ctx.lineWidth=lw+4;
        ctx.beginPath();ctx.moveTo(cf.x,cf.y);ctx.lineTo(ct.x,ct.y);ctx.stroke();
      }
    }

    // Agents
    for(const a of sim.agents){
      if(!a.active) continue;
      const col=a.type==='passenger'?'#00C8E8':a.type==='package'?'#F0A830':'#00C875';
      if(a.trail.length>1){
        ctx.beginPath();ctx.moveTo(a.trail[0].x,a.trail[0].y);
        for(let i=1;i<a.trail.length;i++) ctx.lineTo(a.trail[i].x,a.trail[i].y);
        ctx.strokeStyle=col+'55';ctx.lineWidth=1;ctx.stroke();
      }
      const gR=a.type==='package'?12:10;
      const gg=ctx.createRadialGradient(a.x,a.y,0,a.x,a.y,gR);
      gg.addColorStop(0,col+'99');gg.addColorStop(1,col+'00');
      ctx.fillStyle=gg;ctx.beginPath();ctx.arc(a.x,a.y,gR,0,Math.PI*2);ctx.fill();
      ctx.save();ctx.translate(a.x,a.y);ctx.fillStyle=col;ctx.strokeStyle='rgba(4,12,24,0.6)';ctx.lineWidth=0.7;
      if(a.type==='passenger'){
        ctx.rotate(a.angle);ctx.beginPath();(ctx as any).roundRect(-4.5,-2,9,4,1.2);ctx.fill();ctx.stroke();
        ctx.fillStyle=col+'CC';ctx.beginPath();(ctx as any).roundRect(-2.2,-3.8,4.4,2.5,0.8);ctx.fill();
      }else if(a.type==='package'){
        ctx.beginPath();ctx.rect(-3,-3,6,6);ctx.fill();ctx.stroke();
        ctx.strokeStyle='rgba(4,12,24,0.45)';ctx.lineWidth=0.7;
        ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(0,3);ctx.moveTo(-3,0);ctx.lineTo(3,0);ctx.stroke();
      }else{
        ctx.rotate(a.angle);ctx.beginPath();ctx.moveTo(4.5,0);ctx.lineTo(-3,3);ctx.lineTo(-1,0);ctx.lineTo(-3,-3);ctx.closePath();
        ctx.fill();ctx.stroke();
      }
      ctx.restore();
    }

    // City nodes
    for(const c of sim.cities){
      const baseR=4+c.population*1.8;
      const pulse=Math.sin(c.pulsePhase)*0.5+0.5;
      const isH=c.id===hovered,isSel=c.id===selected;
      // Halo
      const haloR=baseR*(isH?4.5:isSel?5:2.5+pulse*1.5);
      const hCol=c.isHub?'0,200,232':'0,200,117';
      const hGrad=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,haloR);
      const hA=isH?0.35:isSel?0.4:0.1+pulse*0.08;
      hGrad.addColorStop(0,`rgba(${hCol},${hA})`);hGrad.addColorStop(0.5,`rgba(${hCol},${hA*0.25})`);hGrad.addColorStop(1,`rgba(${hCol},0)`);
      ctx.fillStyle=hGrad;ctx.beginPath();ctx.arc(c.x,c.y,haloR,0,Math.PI*2);ctx.fill();
      if(isH||isSel){
        ctx.strokeStyle=isSel?'#F0A830':'#00C8E8';ctx.lineWidth=isSel?2.5:1.5;
        ctx.setLineDash(isSel?[]:[4,3]);ctx.beginPath();ctx.arc(c.x,c.y,baseR+7+pulse*2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      }
      if(c.demand>0.25){
        ctx.strokeStyle=`rgba(240,168,48,${c.demand*0.6})`;ctx.lineWidth=2;
        ctx.beginPath();ctx.arc(c.x,c.y,baseR+4+pulse*2,-Math.PI/2,-Math.PI/2+Math.PI*2*c.demand);ctx.stroke();
      }
      const nG=ctx.createRadialGradient(c.x-baseR*0.3,c.y-baseR*0.3,0,c.x,c.y,baseR);
      nG.addColorStop(0,c.isHub?'#7EEEF8':'#6EE7B7');nG.addColorStop(1,c.isHub?'#0095B8':'#059669');
      ctx.fillStyle=nG;ctx.beginPath();ctx.arc(c.x,c.y,baseR,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=c.isHub?'rgba(0,200,232,0.6)':'rgba(0,200,117,0.5)';ctx.lineWidth=c.isHub?1.8:1;ctx.stroke();
      // Labels
      if(c.isHub||c.tier<=2||isH||isSel){
        const fs=c.isHub?12:10;
        ctx.font=`${c.isHub?600:400} ${fs}px Inter,sans-serif`;ctx.textAlign='center';
        ctx.fillStyle='rgba(4,12,24,0.8)';ctx.fillText(c.name,c.x+1,c.y+baseR+fs+2);
        ctx.fillStyle=isH||isSel?'#fff':c.isHub?'#EFF6FF':'rgba(200,240,245,0.9)';ctx.fillText(c.name,c.x,c.y+baseR+fs+1);
        ctx.font=`${fs-2}px Inter,sans-serif`;ctx.fillStyle='rgba(0,200,232,0.7)';ctx.fillText(c.nameAr,c.x,c.y+baseR+fs*2.3);
      }
    }
    // Vignette
    const vig=ctx.createRadialGradient(W/2,H/2,H*0.25,W/2,H/2,H*0.85);
    vig.addColorStop(0,'rgba(4,12,24,0)');vig.addColorStop(1,'rgba(4,12,24,0.55)');
    ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
  }

  // Mouse interaction
  const getXY=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const rect=e.currentTarget.getBoundingClientRect();
    return {x:(e.clientX-rect.left)*(canvasSize.w/rect.width),y:(e.clientY-rect.top)*(canvasSize.h/rect.height),cx:e.clientX,cy:e.clientY};
  },[canvasSize]);
  const hitTest=useCallback((x:number,y:number):number|null=>{
    const sim=simRef.current; if(!sim) return null;
    for(const c of sim.cities){if(Math.hypot(x-c.x,y-c.y)<4+c.population*1.8+10) return c.id;}
    return null;
  },[]);
  const handleMouseMove=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const {x,y,cx,cy}=getXY(e);
    const hit=hitTest(x,y);
    setHoveredCity(hit);
    if(hit!==null&&simRef.current){
      setTooltip({x:cx,y:cy,city:simRef.current.cities[hit]});
      (e.currentTarget as HTMLCanvasElement).style.cursor='pointer';
    }else{setTooltip(null);(e.currentTarget as HTMLCanvasElement).style.cursor='default';}
  },[getXY,hitTest]);
  const handleClick=useCallback((e:React.MouseEvent<HTMLCanvasElement>)=>{
    const {x,y}=getXY(e);
    const hit=hitTest(x,y);
    setSelectedCity(p=>hit===p?null:hit);
  },[getXY,hitTest]);

  const todLabel=(h:number)=>{const hh=Math.floor(h),mm=String(Math.round((h-hh)*60)).padStart(2,'0'),ap=h<12?'AM':'PM',h12=h===0?12:h>12?h-12:h;return `${h12}:${mm} ${ap}`;};
  const todMu=todMult(timeOfDay);
  const selectedInfo=useMemo(()=>{
    if(selectedCity===null||!simRef.current) return null;
    const c=simRef.current.cities[selectedCity];
    const edges=simRef.current.edges.filter(e=>e.from===selectedCity||e.to===selectedCity).sort((a,b)=>b.strength-a.strength).slice(0,3);
    return {c,edges};
  },[selectedCity,stats.trips]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ height: 580, background: WaselColors.spaceDeep, borderRadius: 24, overflow:'hidden' }}>
      {/* Canvas */}
      <canvas ref={canvasRef} width={canvasSize.w} height={canvasSize.h}
        style={{ display:'block', width:'100%', height:'100%' }}
        onMouseMove={handleMouseMove} onMouseLeave={()=>{setHoveredCity(null);setTooltip(null);}} onClick={handleClick} />

      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-3"
        style={{ background:'linear-gradient(to bottom, rgba(4,12,24,0.92), transparent)', pointerEvents:'none' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#00C8E8,#0095B8)', boxShadow:'0 0 20px rgba(0,200,232,0.5)' }}>
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="3.5" fill="white"/>
              <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="3.5 2.5"/>
              <circle cx="11" cy="3" r="1.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="19" cy="11" r="1.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="11" cy="19" r="1.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="3" cy="11" r="1.5" fill="rgba(255,255,255,0.6)"/>
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-sm leading-tight">Mobility OS <span style={{color:WaselColors.cyan}}>·</span> نظام التنقل</p>
            <p className="text-[10px] uppercase tracking-widest" style={{color:WaselColors.cyan}}>Live Jordan Network Simulation</p>
          </div>
        </div>
        <div className="flex items-center gap-2" style={{pointerEvents:'all'}}>
          <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.95}}
            onClick={()=>{setPaused(p=>!p);}}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15"
            style={{background:'rgba(4,12,24,0.8)'}}>
            {paused ? <Play className="w-3.5 h-3.5 text-white/70 ml-0.5"/> : <Pause className="w-3.5 h-3.5 text-white/70"/>}
          </motion.button>
          <motion.button whileHover={{scale:1.08}} whileTap={{scale:0.95}}
            onClick={()=>{buildSim(canvasSize.w,canvasSize.h);setSelectedCity(null);}}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/15"
            style={{background:'rgba(4,12,24,0.8)'}}>
            <RotateCcw className="w-3.5 h-3.5 text-white/70"/>
          </motion.button>
        </div>
      </div>

      {/* Live stats strip */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3"
        style={{background:'linear-gradient(to top, rgba(4,12,24,0.96), transparent)'}}>
        <div className="flex items-center gap-4 flex-wrap">
          {/* TOD slider */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-base">{timeOfDay>=6&&timeOfDay<12?'🌅':timeOfDay>=12&&timeOfDay<17?'☀️':timeOfDay>=17&&timeOfDay<20?'🌆':'🌙'}</span>
            <div className="flex-1">
              <input type="range" min={0} max={23} step={0.25} value={timeOfDay}
                onChange={e=>setTimeOfDay(parseFloat(e.target.value))}
                className="w-full h-1 rounded-full cursor-pointer"
                style={{accentColor:WaselColors.cyan}}/>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-white/40">{todLabel(timeOfDay)}</span>
                <span className="text-[9px]" style={{color:todMu>1.4?WaselColors.error:todMu>0.8?WaselColors.green:WaselColors.textSecondary}}>
                  {todMu>1.4?'🔥 Rush':'✅ Normal'}
                </span>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-4">
            {[
              {val:stats.travelers, label:'Travelers', color:WaselColors.cyan, icon:'👤'},
              {val:stats.packages,  label:'Packages',  color:WaselColors.gold, icon:'📦'},
              {val:(stats.trips).toLocaleString(), label:'Total Trips', color:'#A78BFA', icon:'🚗'},
            ].map(s=>(
              <div key={s.label} className="text-center">
                <div className="font-black text-base" style={{color:s.color}}>{s.icon} {typeof s.val==='number'?s.val:s.val}</div>
                <div className="text-white/40 text-[9px]">{s.label}</div>
              </div>
            ))}
            {stats.corridor&&(
              <div className="hidden sm:block">
                <div className="text-[9px] text-white/35 uppercase tracking-widest">Top Corridor</div>
                <div className="text-xs font-bold" style={{color:WaselColors.cyan}}>{stats.corridor}</div>
              </div>
            )}
          </div>
        </div>
        {/* Agent legend */}
        <div className="flex gap-4 mt-2">
          {[
            {col:WaselColors.cyan,'label':'Travelers'},
            {col:WaselColors.gold,'label':'Packages'},
            {col:WaselColors.green,'label':'Drivers'},
          ].map(l=>(
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{background:l.col}}/>
              <span className="text-[10px] text-white/45">{l.label}</span>
            </div>
          ))}
          <span className="text-white/25 text-[10px] ml-auto">Click a city to inspect · Drag time slider</span>
        </div>
      </div>

      {/* Selected city panel */}
      <AnimatePresence>
        {selectedInfo&&(
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
            className="absolute top-14 right-4 p-4 rounded-2xl border border-white/10 w-56"
            style={{background:'rgba(4,12,24,0.92)',backdropFilter:'blur(20px)'}}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{background:selectedInfo.c.isHub?WaselColors.cyan:WaselColors.green}}/>
              <div>
                <p className="text-white font-bold text-sm">{selectedInfo.c.name}</p>
                <p className="text-xs" style={{color:WaselColors.cyan,fontFamily:'Cairo, Tajawal, sans-serif'}}>{selectedInfo.c.nameAr}</p>
              </div>
              <button onClick={()=>setSelectedCity(null)} className="ml-auto text-white/30 hover:text-white/60"><X className="w-3.5 h-3.5"/></button>
            </div>
            <div className="space-y-1.5">
              {selectedInfo.edges.map(e=>{
                const other=simRef.current!.cities[e.from===selectedCity?e.to:e.from];
                return(
                  <div key={e.id} className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{other.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white/35">{e.distanceKm}km</span>
                      <div className="w-12 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${e.strength*100}%`,background:WaselColors.cyan}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      {tooltip&&(
        <div className="fixed z-50 px-3 py-2 rounded-xl text-xs pointer-events-none border border-white/10"
          style={{left:tooltip.x+12,top:tooltip.y-40,background:'rgba(4,12,24,0.95)',backdropFilter:'blur(16px)',transform:'translateY(-50%)'}}>
          <p className="text-white font-bold">{tooltip.city.name}</p>
          <p className="text-white/50" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>{tooltip.city.nameAr}</p>
          <p style={{color:WaselColors.cyan}}>Tier {tooltip.city.tier} · Pop ×{tooltip.city.population}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AURORA BACKGROUND — cinematic nebula effect
   ═══════════════════════════════════════════════════════════════ */
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main aurora orb — cyan */}
      <motion.div className="absolute rounded-full"
        style={{ width:'80vw', height:'80vw', maxWidth:1000, maxHeight:1000,
          left:'10%', top:'-20%', background:`radial-gradient(circle, rgba(0,200,232,0.09) 0%, rgba(0,200,232,0.03) 40%, transparent 70%)`,
          filter:'blur(60px)' }}
        animate={{ scale:[1,1.15,1], x:[0,30,0], y:[0,-20,0] }}
        transition={{ duration:14, repeat:Infinity, ease:'easeInOut' }}/>
      {/* Gold aurora */}
      <motion.div className="absolute rounded-full"
        style={{ width:'60vw', height:'60vw', maxWidth:700, maxHeight:700,
          right:'-10%', top:'20%', background:`radial-gradient(circle, rgba(240,168,48,0.06) 0%, rgba(240,168,48,0.02) 40%, transparent 70%)`,
          filter:'blur(60px)' }}
        animate={{ scale:[1.1,1,1.1], x:[0,-40,0], y:[0,30,0] }}
        transition={{ duration:11, repeat:Infinity, ease:'easeInOut', delay:3 }}/>
      {/* Green pulse bottom */}
      <motion.div className="absolute rounded-full"
        style={{ width:'50vw', height:'50vw', maxWidth:600, maxHeight:600,
          left:'30%', bottom:'-15%', background:`radial-gradient(circle, rgba(0,200,117,0.05) 0%, transparent 65%)`,
          filter:'blur(50px)' }}
        animate={{ scale:[1,1.2,1] }}
        transition={{ duration:9, repeat:Infinity, ease:'easeInOut', delay:6 }}/>
      {/* Star field */}
      {Array.from({length:60},(_,i)=>(
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: i%5===0?2:1, height: i%5===0?2:1,
            left:`${(i*137.5)%100}%`, top:`${(i*97.3)%100}%`,
            background: i%3===0?WaselColors.cyan:i%3===1?WaselColors.gold:'white', opacity:0.15+Math.random()*0.35 }}
          animate={{ opacity:[0.1,0.6,0.1], scale:[1,1.5,1] }}
          transition={{ duration:2+Math.random()*4, repeat:Infinity, ease:'easeInOut', delay:Math.random()*5 }}/>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CONSTELLATION LOGO
   ═══════════════════════════════════════════════════════════════ */
function ConstellationLogo({ size = 44, withText = true, animate = true }: {
  size?: number; withText?: boolean; animate?: boolean;
}) {
  if (!withText) return <WaselLogoMark size={size} animated={animate} id={`cl-${size}`} />;
  const brandSize = size >= 60 ? 'lg' : size >= 40 ? 'md' : size >= 30 ? 'sm' : 'xs';
  return <WaselBrand size={brandSize as 'xs'|'sm'|'md'|'lg'|'xl'} animated={animate} id={`clb-${size}`} showTagline={size>=60}/>;
}

/* ═══════════════════════════════════════════════════════════════
   PHONE MOCKUP — reimagined
   ═══════════════════════════════════════════════════════════════ */
function PhoneMockup({ screen, floating = false }: { screen: React.ReactNode; floating?: boolean }) {
  return (
    <motion.div className="relative mx-auto" style={{ width:220, height:440 }}
      animate={floating?{y:[0,-12,0]}:{}} transition={floating?{duration:4,repeat:Infinity,ease:'easeInOut'}:{}}>
      {/* Outer glow */}
      <div className="absolute -inset-4 rounded-[50px] opacity-30"
        style={{background:`radial-gradient(ellipse, ${WaselColors.cyan}40, transparent 70%)`, filter:'blur(20px)'}}/>
      <div className="absolute inset-0 rounded-[36px] border border-white/15 shadow-2xl overflow-hidden"
        style={{background:`linear-gradient(145deg, ${WaselColors.space3}, ${WaselColors.spaceDeep})`,
          boxShadow:`0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), 0 0 40px rgba(0,200,232,0.1)`}}>
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-2xl z-10 flex items-center justify-center gap-2"
          style={{background:WaselColors.spaceDeep}}>
          <div className="w-2 h-2 rounded-full" style={{background:`rgba(0,200,232,0.6)`}}/>
          <div className="w-10 h-1.5 rounded-full bg-black/60"/>
        </div>
        <div className="absolute inset-0 pt-8 overflow-hidden rounded-[36px]">{screen}</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-white/20"/>
      </div>
      <div className="absolute inset-0 rounded-[36px] bg-gradient-to-br from-white/8 to-transparent pointer-events-none"/>
    </motion.div>
  );
}

/* ── App Screens ── */
function HomeScreen() {
  return (
    <div className="h-full w-full flex flex-col" style={{background:WaselColors.spaceDeep}}>
      <div className="px-4 pt-8 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div><p className="text-white/50 text-xs">مرحبا، أحمد 👋</p><p className="text-white font-bold text-sm">Where are you going?</p></div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{background:`${WaselColors.cyan}33`,border:`1px solid ${WaselColors.cyan}66`}}>
            <span className="text-xs font-bold" style={{color:WaselColors.cyan}}>A</span>
          </div>
        </div>
        <div className="rounded-2xl p-3 border border-white/10 mb-3" style={{background:'rgba(255,255,255,0.07)'}}>
          <p className="text-white/40 text-xs">Search destination... | ابحث عن وجهتك</p>
        </div>
        <p className="text-white/50 text-xs mb-2">Popular Routes | مسارات شائعة</p>
        {[{from:'Amman',to:'Aqaba',price:'8 JOD',seats:3,color:WaselColors.cyan},{from:'Amman',to:'Irbid',price:'4 JOD',seats:2,color:WaselColors.gold}].map(r=>(
          <div key={r.to} className="flex items-center gap-2 mb-2 p-2 rounded-xl border border-white/8"
            style={{background:`${WaselColors.cyan}0F`}}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:`${r.color}33`}}>
              <Navigation className="w-3 h-3" style={{color:r.color}}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{r.from} → {r.to}</p>
              <p className="text-white/40 text-[10px]">{r.seats} seats available</p>
            </div>
            <p className="text-xs font-bold" style={{color:WaselColors.gold}}>{r.price}</p>
          </div>
        ))}
      </div>
      <div className="flex-1 relative overflow-hidden mx-3 rounded-2xl">
        <div className="absolute inset-0" style={{background:`linear-gradient(135deg, ${WaselColors.space3} 0%, ${WaselColors.spaceCard} 100%)`}}>
          {Array.from({length:12},(_,i)=>(
            <div key={i} className="absolute w-1 h-1 rounded-full"
              style={{background:`${WaselColors.cyan}66`,left:`${15+i*8}%`,top:`${30+Math.sin(i)*25}%`}}/>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{border:`2px solid ${WaselColors.cyan}`,background:`${WaselColors.cyan}33`}}>
              <div className="w-2 h-2 rounded-full" style={{background:WaselColors.cyan}}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function SearchScreen(){return(
  <div className="h-full w-full flex flex-col" style={{background:WaselColors.spaceDeep}}>
    <div className="px-4 pt-8 pb-3">
      <p className="text-white font-bold text-sm mb-4">Find a Ride | ابحث عن رحلة</p>
      {[{icon:'🟢',label:'From | من',val:'Amman, Jordan'},{icon:'🔴',label:'To | إلى',val:'Aqaba, Jordan'}].map(f=>(
        <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 mb-2">
          <span className="text-sm">{f.icon}</span><div><p className="text-white/40 text-[10px]">{f.label}</p><p className="text-white text-xs font-medium">{f.val}</p></div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-xl border border-white/10 bg-white/5"><p className="text-white/40 text-[10px]">Date</p><p className="text-white text-xs font-medium">Fri, Mar 14</p></div>
        <div className="p-2 rounded-xl border border-white/10 bg-white/5"><p className="text-white/40 text-[10px]">Seats</p><p className="text-white text-xs font-medium">2 seats</p></div>
      </div>
      <div className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 mb-3" style={{background:WaselColors.cyan}}>
        <span className="text-white text-xs font-bold">Search Rides | بحث</span>
      </div>
      {[{driver:'Mohammed K.',rating:4.9,time:'07:00 AM',price:'8 JOD'},{driver:'Sara A.',rating:4.8,time:'09:30 AM',price:'9 JOD'}].map(r=>(
        <div key={r.driver} className="flex items-center gap-3 mb-2 p-3 rounded-xl border border-white/8 bg-white/3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{background:`${WaselColors.cyan}33`,border:`1px solid ${WaselColors.cyan}4D`}}>
            <span className="text-xs font-bold" style={{color:WaselColors.cyan}}>{r.driver[0]}</span>
          </div>
          <div className="flex-1"><div className="flex items-center gap-1"><p className="text-white text-xs font-medium">{r.driver}</p><Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400"/><span className="text-white/50 text-[10px]">{r.rating}</span></div><p className="text-white/50 text-[10px]">{r.time}</p></div>
          <p className="text-xs font-bold" style={{color:WaselColors.gold}}>{r.price}</p>
        </div>
      ))}
    </div>
  </div>
);}
function PackageScreen(){return(
  <div className="h-full w-full flex flex-col" style={{background:WaselColors.spaceDeep}}>
    <div className="px-4 pt-8 pb-3">
      <p className="text-white font-bold text-sm mb-1">Send a Package</p>
      <p className="text-white/40 text-xs mb-4">أرسل طردك مع مسافر | رخيص وآمن</p>
      {[{label:'From',val:'Amman'},{label:'To',val:'Aqaba'},{label:'Size',val:'Small (up to 5kg)'}].map(f=>(
        <div key={f.label} className="mb-2 p-3 rounded-xl border border-white/10 bg-white/5"><p className="text-white/40 text-[10px]">{f.label}</p><p className="text-white text-xs font-medium">{f.val}</p></div>
      ))}
      <div className="mt-3 p-3 rounded-2xl" style={{border:`1px solid ${WaselColors.gold}4D`,background:`${WaselColors.gold}14`}}>
        <div className="flex items-center justify-between"><div><p className="text-white/60 text-[10px]">Estimated cost</p><p className="text-white font-bold text-lg">3.50 JOD</p></div><div className="flex items-center gap-1"><Shield className="w-3 h-3" style={{color:WaselColors.gold}}/><p className="text-[10px]" style={{color:WaselColors.gold}}>Insured 100 JOD</p></div></div>
      </div>
      <div className="mt-3 w-full py-2.5 rounded-2xl flex items-center justify-center" style={{background:WaselColors.gold}}>
        <span className="text-white text-xs font-bold">Send Package | أرسل</span>
      </div>
    </div>
  </div>
);}
function TrackingScreen(){return(
  <div className="h-full w-full flex flex-col" style={{background:WaselColors.spaceDeep}}>
    <div className="px-4 pt-8 pb-3">
      <p className="text-white font-bold text-sm mb-1">Live Tracking</p>
      <p className="text-xs mb-3" style={{color:WaselColors.cyan}}>Amman → Aqaba · In transit 🚗</p>
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-white/50 mb-1"><span>Amman</span><span>Aqaba</span></div>
        <div className="h-2 rounded-full bg-white/10 relative overflow-hidden">
          <motion.div className="absolute left-0 top-0 h-full rounded-full" style={{background:WaselColors.cyan}} initial={{width:'20%'}} animate={{width:'58%'}} transition={{duration:2,delay:0.5}}/>
        </div>
        <div className="flex justify-between text-[10px] mt-1"><span className="text-white/40">Departed 9:00 AM</span><span style={{color:WaselColors.cyan}}>ETA 1:15 PM</span></div>
      </div>
      <div className="h-28 rounded-2xl relative overflow-hidden mb-3" style={{background:`linear-gradient(135deg, ${WaselColors.space3}, ${WaselColors.spaceCard})`}}>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 112">
          <path d="M 20 90 Q 80 60 120 50 Q 160 40 180 20" stroke={WaselColors.cyan} strokeWidth="2" fill="none" opacity="0.6"/>
          <circle cx="120" cy="50" r="5" fill={WaselColors.cyan}/><circle cx="120" cy="50" r="10" fill={WaselColors.cyan} opacity="0.2"/>
        </svg>
      </div>
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{background:`${WaselColors.cyan}33`,border:`2px solid ${WaselColors.cyan}66`}}>
          <Car className="w-4 h-4" style={{color:WaselColors.cyan}}/>
        </div>
        <div className="flex-1"><p className="text-white text-xs font-medium">Mohammed K.</p><p className="text-white/50 text-[10px]">Toyota Camry · White · JO-1234</p></div>
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"/>
      </div>
    </div>
  </div>
);}
function ProfileScreen(){return(
  <div className="h-full w-full flex flex-col" style={{background:WaselColors.spaceDeep}}>
    <div className="px-4 pt-8 pb-3">
      <div className="flex flex-col items-center mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
          style={{background:`linear-gradient(135deg, ${WaselColors.cyan}4D, ${WaselColors.green}4D)`,border:`2px solid ${WaselColors.cyan}80`}}>
          <span className="text-xl font-bold" style={{color:WaselColors.cyan}}>أ</span>
        </div>
        <p className="text-white font-bold text-sm">أحمد الخالدي</p>
        <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400"/><span className="text-white/70 text-xs">4.97 · Verified ✓</span></div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[{val:'47',label:'Trips'},{val:'4.97',label:'Rating'},{val:'12',label:'Packages'}].map(s=>(
          <div key={s.label} className="p-2 rounded-xl border border-white/10 bg-white/5 text-center">
            <p className="font-bold text-sm" style={{color:WaselColors.cyan}}>{s.val}</p><p className="text-white/40 text-[10px]">{s.label}</p>
          </div>
        ))}
      </div>
      {[{icon:'✓',label:'ID Verified',color:WaselColors.green},{icon:'📱',label:'Phone Verified',color:WaselColors.cyan},{icon:'⭐',label:'Top Traveler',color:WaselColors.gold}].map(b=>(
        <div key={b.label} className="flex items-center gap-3 mb-2 p-2 rounded-xl border border-white/8 bg-white/3">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs" style={{background:`${b.color}33`,color:b.color}}>{b.icon}</div>
          <p className="text-white/80 text-xs">{b.label}</p>
          <CheckCircle className="w-3 h-3 ml-auto" style={{color:b.color}}/>
        </div>
      ))}
    </div>
  </div>
);}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */
function Reveal({ children, delay=0, direction='up' }: { children:React.ReactNode;delay?:number;direction?:'up'|'left'|'right'|'none' }) {
  const ref=useRef<HTMLDivElement>(null);
  const isInView=useInView(ref,{once:true,margin:'-80px'});
  return (
    <motion.div ref={ref} initial={{opacity:0,y:direction==='up'?40:0,x:direction==='left'?-40:direction==='right'?40:0}}
      animate={isInView?{opacity:1,y:0,x:0}:{opacity:0,y:direction==='up'?40:0,x:direction==='left'?-40:direction==='right'?40:0}}
      transition={{duration:0.7,delay,ease:[0.16,1,0.3,1]}}>
      {children}
    </motion.div>
  );
}
function SectionTag({ text }: { text:string }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 mb-6"
      style={{background:`${WaselColors.cyan}14`}}>
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"/>
      <span className="text-primary text-xs font-semibold uppercase tracking-widest">{text}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COST CALCULATOR
   ═══════════════════════════════════════════════════════════════ */
const JORDAN_ROUTES_CALC = [
  {en:'Amman → Aqaba',ar:'عمّان ← العقبة',km:330,price:10},
  {en:'Amman → Irbid',ar:'عمّان ← إربد',km:85,price:3},
  {en:'Amman → Dead Sea',ar:'عمّان ← البحر الميت',km:60,price:5},
  {en:'Amman → Zarqa',ar:'عمّان ← الزرقا',km:30,price:2},
  {en:'Amman → Petra',ar:'عمّان ← البتراء',km:250,price:12},
  {en:'Amman → Wadi Rum',ar:'عمّان ← وادي رم',km:320,price:15},
];
function LandingCostCalculator({ onGetStarted }: { onGetStarted:()=>void }) {
  const [selectedIdx,setSelectedIdx]=useState(0);
  const [seats,setSeats]=useState(3);
  const route=JORDAN_ROUTES_CALC[selectedIdx];
  const fuelCost=(route.km/100)*8*0.9;
  const pricePerSeat=Math.max(route.price,Math.ceil((fuelCost/seats)*1.2));
  const total=pricePerSeat*seats;
  const commission=total*0.12;
  const driverEarns=total-commission;
  const savings=Math.max(0,route.km*0.12-pricePerSeat);
  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="p-8 rounded-3xl border border-white/10" style={{background:`rgba(7,14,31,0.9)`,backdropFilter:'blur(20px)'}}>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Choose Route</p>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {JORDAN_ROUTES_CALC.map((r,i)=>(
            <button key={i} onClick={()=>setSelectedIdx(i)} className="px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{background:selectedIdx===i?`${WaselColors.cyan}1F`:'rgba(255,255,255,0.03)',border:`1px solid ${selectedIdx===i?`${WaselColors.cyan}66`:'rgba(255,255,255,0.07)'}`,color:selectedIdx===i?WaselColors.cyan:'rgba(255,255,255,0.5)'}}>
              {r.en}<br/><span style={{opacity:0.6,fontSize:'0.7rem'}}>{r.km} km</span>
            </button>
          ))}
        </div>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Passengers Sharing</p>
        <div className="flex gap-2 mb-6">
          {[1,2,3,4].map(n=>(
            <button key={n} onClick={()=>setSeats(n)} className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{background:seats===n?`${WaselColors.cyan}26`:'rgba(255,255,255,0.04)',border:`1.5px solid ${seats===n?`${WaselColors.cyan}80`:'rgba(255,255,255,0.08)'}`,color:seats===n?WaselColors.cyan:'rgba(255,255,255,0.45)'}}>
              {n}
            </button>
          ))}
        </div>
        <div className="p-5 rounded-2xl" style={{background:`${WaselColors.cyan}0F`,border:`1px solid ${WaselColors.cyan}33`}}>
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs mb-1">Price per seat</p>
              <p className="font-black text-white" style={{fontSize:'2.8rem',lineHeight:1}}>{pricePerSeat}<span className="text-base font-normal text-white/50 ml-1">JOD</span></p>
            </div>
            {savings>0&&<div className="text-right"><p className="text-white/40 text-xs mb-1">vs. taxi</p><p className="font-black" style={{color:WaselColors.green,fontSize:'1.4rem'}}>-{savings.toFixed(0)} JOD</p><p style={{color:WaselColors.green,fontSize:'0.7rem'}}>saved 🌿</p></div>}
          </div>
          <div className="space-y-2 text-xs" style={{color:'rgba(255,255,255,0.4)'}}>
            <div className="flex justify-between"><span>Fuel cost ({route.km} km)</span><span>{fuelCost.toFixed(2)} JOD</span></div>
            <div className="flex justify-between"><span>Driver earns</span><span style={{color:WaselColors.green}}>{driverEarns.toFixed(2)} JOD</span></div>
            <div className="flex justify-between"><span>Wasel fee (12%)</span><span>{commission.toFixed(2)} JOD</span></div>
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="p-6 rounded-3xl border border-white/8" style={{background:`${WaselColors.gold}0F`}}>
          <p className="text-xl font-black text-white mb-2">No surge pricing. Ever.</p>
          <p className="text-white/50 text-sm leading-relaxed">Your price is based on actual fuel cost — divided by passengers. Fixed and fair.</p>
          <p className="mt-3 text-sm" style={{fontFamily:'Cairo, Tajawal, sans-serif',color:`${WaselColors.gold}CC`}}>السعر ثابت — لا يتغير أبداً. شارك التكلفة الحقيقية فقط.</p>
        </div>
        {[{icon:'🛡️',en:'Sanad-verified drivers only',ar:'سائقون موثقون بنظام سند'},{icon:'🕌',en:'Prayer stops auto-calculated',ar:'وقفات الصلاة محسوبة تلقائياً'},{icon:'📦',en:'Passengers + packages together',ar:'ركاب وطرود في نفس الرحلة'},{icon:'💵',en:'Cash on arrival supported',ar:'الدفع نقداً عند الوصول'}].map((f,i)=>(
          <motion.div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-white/6" style={{background:'rgba(255,255,255,0.03)'}}
            whileHover={{x:6,borderColor:`${WaselColors.cyan}40`}}>
            <span className="text-2xl">{f.icon}</span>
            <div><p className="text-white font-semibold text-sm">{f.en}</p><p className="text-white/30 text-xs" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>{f.ar}</p></div>
          </motion.div>
        ))}
        <motion.button whileHover={{scale:1.03}} whileTap={{scale:0.97}} onClick={onGetStarted}
          className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2"
          style={{background:WaselGradients.primaryBtn,boxShadow:`0 8px 32px ${WaselColors.cyan}4D`}}>
          Post Your First Ride · انشر رحلتك <ArrowRight className="w-5 h-5"/>
        </motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════════ */
export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeScreen, setActiveScreen] = useState(0);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0,0.3], [0,-80]);
  const heroOpacity = useTransform(scrollYProgress, [0,0.25], [1,0]);

  useEffect(()=>{ const fn=()=>setScrolled(window.scrollY>40); window.addEventListener('scroll',fn,{passive:true}); return ()=>window.removeEventListener('scroll',fn); },[]);
  useEffect(()=>{ const t=setInterval(()=>setActiveScreen(s=>(s+1)%5),3800); return ()=>clearInterval(t); },[]);

  const screens=[<HomeScreen/>,<SearchScreen/>,<PackageScreen/>,<TrackingScreen/>,<ProfileScreen/>];
  const screenLabels=['Home','Search Rides','Send Package','Live Tracking','Profile'];
  const navLinks=[{label:'Network',href:'#network'},{label:'Mobility OS',href:'#mobility-os'},{label:'How It Works',href:'#how-it-works'},{label:'Trust',href:'#trust'}];

  const problems=[
    {emoji:'🚗',title:'Empty Seats, Full Cost',titleAr:'مقاعد فارغة، تكلفة كاملة',desc:'Millions of cars drive between cities every day with empty seats. The driver pays full fuel costs alone.',color:WaselColors.error},
    {emoji:'💸',title:'Expensive Taxis',titleAr:'تكسي غالي',desc:'Traditional taxis charge 3-5× the real cost. Intercity travel stays unaffordable.',color:WaselColors.gold},
    {emoji:'📦',title:'Slow Deliveries',titleAr:'توصيل بطيء',desc:'Packages wait days for couriers when travelers are already going to the same destination.',color:WaselColors.purple},
  ];
  const benefits=[
    {icon:<TrendingUp className="w-6 h-6"/>,title:'Save up to 70%',titleAr:'وفّر لغاية 70%',desc:'Split fuel costs with real travelers. JOD 8 instead of JOD 25.',color:WaselColors.cyan},
    {icon:<Zap className="w-6 h-6"/>,title:'Smart Matching',titleAr:'مطابقة ذكية',desc:'AI matches your trip with drivers heading the same way, same day.',color:WaselColors.gold},
    {icon:<Package className="w-6 h-6"/>,title:'Send Packages',titleAr:'أرسل الطرود',desc:'Your package rides with a verified traveler. Tracked, insured, delivered.',color:WaselColors.green},
    {icon:<Heart className="w-6 h-6"/>,title:'Cultural Comfort',titleAr:'راحة ثقافية',desc:'Women-only rides, prayer stops, Ramadan mode. Built for you.',color:WaselColors.gold},
    {icon:<Leaf className="w-6 h-6"/>,title:'Greener Travel',titleAr:'سفر أنظف',desc:'Full cars mean fewer vehicles on the road. Every shared trip reduces emissions.',color:WaselColors.green},
    {icon:<Globe className="w-6 h-6"/>,title:'Intercity Network',titleAr:'شبكة بين المدن',desc:'Amman to Aqaba, Irbid, Petra and beyond. Growing every month.',color:WaselColors.cyan},
  ];
  const steps=[
    {num:'01',title:'Choose Your Destination',titleAr:'اختر وجهتك',desc:'Search by city, date, and number of seats. Find rides posted by real travelers.',icon:<MapPin className="w-5 h-5"/>},
    {num:'02',title:'Intelligent Matching',titleAr:'مطابقة ذكية',desc:'Our network connects you with verified drivers. See reviews, ratings, and car details.',icon:<Zap className="w-5 h-5"/>},
    {num:'03',title:'Share the Journey',titleAr:'شارك الرحلة',desc:'Travel together, split the cost. Pay securely or cash on arrival.',icon:<Users className="w-5 h-5"/>},
  ];
  const trustSteps=[
    {icon:<Shield className="w-5 h-5"/>,title:'Identity Verified',titleAr:'هوية موثّقة',desc:'Sanad eKYC — government-grade ID verification for every driver and passenger.',color:WaselColors.cyan},
    {icon:<Award className="w-5 h-5"/>,title:'Driver Approved',titleAr:'سائق معتمد',desc:'Background checks, license validation, and vehicle inspection before the first trip.',color:WaselColors.gold},
    {icon:<Lock className="w-5 h-5"/>,title:'Secure Payments',titleAr:'دفع آمن',desc:'Stripe-secured payments. Cash on arrival available. Funds released after trip completion.',color:WaselColors.green},
    {icon:<Radio className="w-5 h-5"/>,title:'Live Tracking',titleAr:'تتبع مباشر',desc:'Real-time GPS for every trip. Share your journey with loved ones automatically.',color:WaselColors.cyan},
  ];
  const testimonials=[
    {name:'Ahmad Al-Khalidi',nameAr:'أحمد الخالدي',role:'Software Engineer, Amman',rating:5,text:'I drive to Aqaba every weekend. With Wasel, I fill my car and cover my fuel — I basically travel for free now.',textAr:'بروح على العقبة كل أسبوع. مع واصل، بملّى سيارتي وبغطّي البنزين — صريحة بسافر بالمجان.',avatar:'https://images.unsplash.com/photo-1597424868002-8e844632031d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'},
    {name:'Nour Al-Hassan',nameAr:'نور الحسن',role:'Teacher, Irbid',rating:5,text:"As a woman, I always felt unsafe in taxis. Wasel's women-only rides changed everything for me.",textAr:'كنت دايمًا خايفة من التاكسي. رحلات الستات على واصل غيّرت كل شي.',avatar:'https://images.unsplash.com/photo-1670251544348-e8055a6a2bdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'},
    {name:'Omar Nassar',nameAr:'عمر نصّار',role:'Student, Yarmouk University',rating:5,text:"Wasel costs me 4 JOD instead of 12 — that's my whole week's coffee budget!",textAr:'بروح عمّان كل أسبوع. واصل بيكلّفني 4 دينار بدل 12 — هاد مصاري قهوة الأسبوع كله!',avatar:'https://images.unsplash.com/photo-1669924588116-b1fdde8412e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200'},
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{background:WaselColors.spaceDeep,fontFamily:"'Inter', sans-serif"}}>

      {/* Progress bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left"
        style={{background:`linear-gradient(90deg, ${WaselColors.cyan}, ${WaselColors.gold}, ${WaselColors.green})`,scaleX:scrollYProgress}}/>

      {/* ── NAVBAR ────────────────────────────────────────────────────── */}
      <motion.nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled?'border-b border-white/8':''}`}
        style={{background:scrolled?`rgba(4,12,24,0.96)`:'transparent',backdropFilter:scrolled?'blur(24px)':'none'}}
        initial={{y:-80}} animate={{y:0}} transition={{duration:0.7,ease:'easeOut'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <ConstellationLogo size={36} animate={false}/>
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map(l=>(
                <button key={l.label} onClick={()=>{const id=l.href.replace('#','');document.getElementById(id)?.scrollIntoView({behavior:'smooth'});}}
                  className="text-white/55 hover:text-white text-sm font-medium transition-colors duration-200 tracking-wide">{l.label}</button>
              ))}
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <button onClick={onLogin} className="px-5 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">Sign In | دخول</button>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.96}} onClick={onGetStarted}
                className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white relative overflow-hidden group"
                style={{background:WaselGradients.primaryBtn}}>
                <span className="relative z-10">Join Early Access →</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"/>
              </motion.button>
            </div>
            <button className="lg:hidden p-2 text-white/70 hover:text-white" onClick={()=>setNavOpen(!navOpen)}>
              {navOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {navOpen&&(
            <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
              className="lg:hidden border-t border-white/10 overflow-hidden"
              style={{background:`rgba(4,12,24,0.98)`,backdropFilter:'blur(24px)'}}>
              <div className="px-4 py-4 flex flex-col gap-3">
                {navLinks.map(l=>(
                  <button key={l.label} onClick={()=>{setNavOpen(false);setTimeout(()=>document.getElementById(l.href.replace('#',''))?.scrollIntoView({behavior:'smooth'}),150);}}
                    className="text-white/70 hover:text-white py-2 text-sm font-medium transition-colors text-left">{l.label}</button>
                ))}
                <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                  <button onClick={()=>{setNavOpen(false);onLogin();}} className="py-2.5 text-white/70 text-sm font-medium">Sign In | دخول</button>
                  <button onClick={()=>{setNavOpen(false);onGetStarted();}} className="py-3 rounded-2xl text-white font-bold text-sm" style={{background:WaselColors.cyan}}>Join Early Access →</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — IMMERSIVE HERO (Out of Earth Level)
          ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Aurora + starfield background */}
        <AuroraBackground/>

        {/* Parallax map overlay */}
        <motion.div className="absolute inset-0 opacity-30" style={{y:heroY,opacity:heroOpacity}}>
          <svg viewBox="0 0 600 520" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id="hg"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <radialGradient id="bhero" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor={WaselColors.cyan} stopOpacity="0.1"/>
                <stop offset="100%" stopColor={WaselColors.spaceDeep} stopOpacity="0"/>
              </radialGradient>
            </defs>
            <ellipse cx="310" cy="200" rx="300" ry="280" fill="url(#bhero)"/>
            {/* Main route lines */}
            {[
              {d:'M 310 120 C 290 200, 250 300, 230 380 C 215 420, 208 435, 200 440',c:WaselColors.cyan,w:2.5},
              {d:'M 310 120 C 335 95, 360 75, 390 60',c:WaselColors.gold,w:2},
              {d:'M 310 120 C 360 120, 410 125, 460 130',c:WaselColors.green,w:1.8},
              {d:'M 310 120 C 260 130, 200 140, 160 160',c:WaselColors.cyan,w:1.5},
            ].map((r,i)=>(
              <motion.path key={i} d={r.d} stroke={r.c} strokeWidth={r.w} fill="none" strokeLinecap="round" filter="url(#hg)"
                initial={{pathLength:0,opacity:0}} animate={{pathLength:1,opacity:0.7}} transition={{duration:2,delay:i*0.4,ease:'easeInOut'}}/>
            ))}
            {/* City nodes */}
            {[{x:310,y:120,r:12,c:WaselColors.cyan},{x:200,y:440,r:9,c:WaselColors.gold},{x:390,y:60,r:8,c:WaselColors.gold},{x:460,y:130,r:7,c:WaselColors.green}].map((n,i)=>(
              <motion.g key={i} initial={{opacity:0,scale:0}} animate={{opacity:1,scale:1}} transition={{delay:i*0.3+0.5,type:'spring'}}>
                <motion.circle cx={n.x} cy={n.y} r={n.r+8} fill={n.c} opacity="0.07"
                  animate={{scale:[1,1.8,1],opacity:[0.07,0,0.07]}} transition={{duration:3,delay:i*0.7,repeat:Infinity}}
                  style={{transformOrigin:`${n.x}px ${n.y}px`}}/>
                <circle cx={n.x} cy={n.y} r={n.r} fill={WaselColors.spaceDeep} stroke={n.c} strokeWidth={2} filter="url(#hg)"/>
                <circle cx={n.x} cy={n.y} r={n.r*0.42} fill={n.c}/>
              </motion.g>
            ))}
          </svg>
          <div className="absolute inset-0" style={{background:`linear-gradient(to right, ${WaselColors.spaceDeep}, rgba(4,12,24,0.4), transparent)`}}/>
          <div className="absolute inset-0" style={{background:`linear-gradient(to top, ${WaselColors.spaceDeep}, transparent, rgba(4,12,24,0.3))`}}/>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="max-w-4xl">
            {/* Live badge */}
            <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 mb-8"
              style={{background:`${WaselColors.cyan}0F`}}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
              <motion.div className="w-2 h-2 rounded-full bg-primary"
                animate={{scale:[1,1.5,1],opacity:[1,0.5,1]}} transition={{duration:1.5,repeat:Infinity}}/>
              <span className="text-primary text-xs font-semibold uppercase tracking-widest">Live Network · Jordan 🇯🇴</span>
            </motion.div>

            {/* Headline */}
            <div className="mb-6">
              <motion.h1 className="font-black leading-none"
                style={{fontSize:'clamp(3.2rem,8.5vw,7rem)',lineHeight:0.95,letterSpacing:'-0.03em'}}
                initial={{opacity:0,y:80}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.2,ease:[0.16,1,0.3,1]}}>
                <span className="block" style={{background:'linear-gradient(135deg, white 0%, rgba(255,255,255,0.85) 100%)',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  Movement
                </span>
                <span className="block" style={{background:`linear-gradient(135deg, ${WaselColors.cyan} 0%, ${WaselColors.cyanLight} 40%, ${WaselColors.gold} 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  connects
                </span>
                <span className="block" style={{background:'linear-gradient(135deg, white 0%, rgba(255,255,255,0.75) 100%)',WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  everything.
                </span>
              </motion.h1>
            </div>

            <motion.p className="text-xl text-white/60 max-w-xl leading-relaxed mb-3"
              initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.6}}>
              The intelligent network moving people and packages between Jordan's cities. Built for the Middle East, powered by community.
            </motion.p>
            <motion.p className="text-base text-white/35 mb-10 leading-relaxed"
              style={{fontFamily:'Cairo, Tajawal, sans-serif',direction:'rtl',textAlign:'left'}}
              initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}>
              واصل — الشبكة الذكية اللي بتوصّل الناس والطرود بين المدن. شارك الرحلة، وفّر المصاري.
            </motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-4"
              initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.9}}>
              <motion.button whileHover={{scale:1.04,boxShadow:`0 24px 50px ${WaselColors.cyan}55`}}
                whileTap={{scale:0.97}} onClick={onGetStarted}
                className="group flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl text-white relative overflow-hidden"
                style={{background:WaselGradients.primaryBtn}}>
                <span>Enter the network</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform"/>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"/>
              </motion.button>
              <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.97}} onClick={()=>{document.getElementById('mobility-os')?.scrollIntoView({behavior:'smooth'});}}
                className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-semibold text-white/80 border border-white/15 hover:border-white/30 transition-all"
                style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(12px)'}}>
                <Play className="w-5 h-5 text-white/60"/> Watch Live Simulation
              </motion.button>
            </motion.div>

            {/* Live stats strip */}
            <motion.div className="flex flex-wrap gap-8 mt-14"
              initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.3}}>
              {[
                {val:'12K+',label:'Travelers',color:WaselColors.cyan},
                {val:'48K+',label:'Trips Shared',color:WaselColors.gold},
                {val:'4.9★',label:'Avg Rating',color:WaselColors.lime},
                {val:'8 JOD',label:'Amman → Aqaba',color:WaselColors.cyan},
              ].map((s,i)=>(
                <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.4+i*0.1}}>
                  <div className="font-black text-3xl" style={{color:s.color,lineHeight:1}}>{s.val}</div>
                  <div className="text-white/35 text-xs font-medium mt-1 uppercase tracking-widest">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{y:[0,8,0]}} transition={{duration:2,repeat:Infinity}}>
          <span className="text-white/25 text-xs font-medium uppercase tracking-widest">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent"/>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — THE PROBLEM
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep}, ${WaselColors.space1} 50%, ${WaselColors.spaceDeep})`}}/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal>
              <SectionTag text="The Problem"/>
              <h2 className="font-black mb-6" style={{fontSize:'clamp(2rem,5vw,3.5rem)',lineHeight:1.1}}>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.error} 0%, ${WaselColors.gold} 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  Mobility is broken.
                </span>
              </h2>
              <p className="text-white/55 text-xl max-w-2xl mx-auto leading-relaxed">
                Every day, thousands of cars drive between Jordanian cities with empty seats, while people pay too much and wait too long.
              </p>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p,i)=>(
              <Reveal key={p.title} delay={i*0.15}>
                <motion.div className="relative p-8 rounded-3xl border border-white/8 overflow-hidden group"
                  style={{background:`rgba(7,14,31,0.7)`,backdropFilter:'blur(16px)'}}
                  whileHover={{y:-8,borderColor:`${p.color}40`}}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{background:`radial-gradient(circle at 30% 30%, ${p.color}12, transparent 70%)`}}/>
                  <div className="text-5xl mb-6">{p.emoji}</div>
                  <div className="w-8 h-1 rounded-full mb-4" style={{background:p.color}}/>
                  <h3 className="text-xl font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-white/40 text-sm mb-2" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>{p.titleAr}</p>
                  <p className="text-white/60 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3 — MOBILITY OS (THE CENTREPIECE)
          ══════════════════════════════════════════════════════════════ */}
      <section id="mobility-os" className="py-28 relative overflow-hidden">
        {/* Deep space radial background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep}, ${WaselColors.space1} 30%, ${WaselColors.spaceDeep})`}}/>
          <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[1400px] max-h-[1400px] rounded-full"
            style={{background:`radial-gradient(circle, ${WaselColors.cyan}06 0%, transparent 60%)`}}
            animate={{scale:[1,1.08,1],rotate:[0,5,0]}} transition={{duration:12,repeat:Infinity,ease:'easeInOut'}}/>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Reveal>
              <SectionTag text="Mobility Operating System · نظام التنقل"/>
              <h2 className="font-black mb-6" style={{fontSize:'clamp(2.2rem,5.5vw,4rem)',lineHeight:1.05}}>
                <span className="text-white">The living brain of </span>
                <br/>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.cyan} 0%, ${WaselColors.cyanLight} 50%, ${WaselColors.gold} 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>
                  Jordan's mobility.
                </span>
              </h2>
              <p className="text-white/55 text-lg max-w-3xl mx-auto leading-relaxed">
                A real-time simulation of Wasel's Mobility OS — 16 cities, A* pathfinding, live demand clusters, and agent-based routing. Click any city. Drag the time slider to see rush hour surge.
              </p>
              <p className="text-white/30 text-sm mt-3" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>
                هذا محاكاة حية لشبكة واصل — انقر على أي مدينة عشان تشوف تفاصيلها
              </p>
            </Reveal>
          </div>

          {/* THE MAP */}
          <Reveal delay={0.2}>
            <div className="relative">
              {/* Glow frame */}
              <div className="absolute -inset-px rounded-3xl" style={{background:`linear-gradient(135deg, ${WaselColors.cyan}30, transparent 50%, ${WaselColors.gold}20)`,padding:1}}>
                <div className="absolute inset-0 rounded-3xl" style={{background:WaselColors.spaceDeep}}/>
              </div>
              {/* Outer glow */}
              <div className="absolute -inset-8 rounded-[40px] opacity-40"
                style={{background:`radial-gradient(ellipse, ${WaselColors.cyan}15, transparent 60%)`,filter:'blur(30px)'}}/>
              <EmbeddedMobilityOS/>
            </div>
          </Reveal>

          {/* Legend + meta cards */}
          <Reveal delay={0.4}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                {icon:'👤',label:'Travelers',desc:'Car-shaped agents using A* pathfinding',color:WaselColors.cyan},
                {icon:'📦',label:'Packages',desc:'Box agents on verified traveler routes',color:WaselColors.gold},
                {icon:'🚗',label:'Drivers',desc:'Chevron agents — positioned travelers',color:WaselColors.green},
                {icon:'🔥',label:'Heat Clusters',desc:'Demand zones intensify at rush hour',color:'#A78BFA'},
              ].map(m=>(
                <div key={m.label} className="p-4 rounded-2xl border border-white/8" style={{background:'rgba(7,14,31,0.7)'}}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{m.icon}</span>
                    <span className="font-bold text-sm text-white">{m.label}</span>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed">{m.desc}</p>
                  <div className="w-full h-0.5 rounded-full mt-3" style={{background:m.color}}/>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
          ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep} 0%, ${WaselColors.spaceCard} 50%, ${WaselColors.spaceDeep} 100%)`}}/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Reveal>
              <SectionTag text="How It Works"/>
              <h2 className="font-black mb-4" style={{fontSize:'clamp(2rem,5vw,3.5rem)'}}>
                <span className="text-white">Three steps to </span>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.cyan}, ${WaselColors.gold})`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>movement</span>
              </h2>
            </Reveal>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-px z-0">
              <motion.div className="h-full" style={{background:`linear-gradient(90deg, transparent 0%, ${WaselColors.cyan} 30%, ${WaselColors.gold} 70%, transparent 100%)`}}
                initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:1.5,ease:'easeInOut'}}/>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
              {steps.map((step,i)=>(
                <Reveal key={step.num} delay={i*0.2}>
                  <div className="relative group">
                    <div className="text-[80px] font-black leading-none mb-4 select-none" style={{color:`${WaselColors.cyan}0F`,lineHeight:1}}>{step.num}</div>
                    <motion.div className="p-8 rounded-3xl border border-white/8 -mt-12 relative overflow-hidden"
                      style={{background:`rgba(7,14,31,0.8)`,backdropFilter:'blur(16px)'}}
                      whileHover={{y:-8,borderColor:`${WaselColors.cyan}4D`}}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                        style={{background:`${WaselColors.cyan}1A`,border:`1px solid ${WaselColors.cyan}33`,color:WaselColors.cyan}}>{step.icon}</div>
                      <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{color:WaselColors.cyan}}>Step {step.num}</div>
                      <h3 className="text-white text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-white/40 text-sm mb-3" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>{step.titleAr}</p>
                      <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
                      {i<2&&(
                        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 items-center justify-center rounded-full"
                          style={{background:WaselColors.spaceDeep,border:`1px solid ${WaselColors.cyan}4D`}}>
                          <ChevronRight className="w-4 h-4" style={{color:WaselColors.cyan}}/>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.4}>
            <div className="text-center mt-16">
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={onGetStarted}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white"
                style={{background:`linear-gradient(135deg, ${WaselColors.cyan}, ${WaselColors.cyanDark})`}}>
                Start Your Journey | ابدأ رحلتك <ArrowRight className="w-5 h-5"/>
              </motion.button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5 — PRODUCT EXPERIENCE (Phones)
          ══════════════════════════════════════════════════════════════ */}
      <section id="product" className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal>
              <SectionTag text="Product Experience"/>
              <h2 className="font-black mb-4" style={{fontSize:'clamp(2rem,5vw,3.5rem)'}}>
                <span className="text-white">Built for every </span>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.ctaBronze}, ${WaselColors.goldLight})`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>journey</span>
              </h2>
              <p className="text-white/55 text-lg max-w-xl mx-auto">Five experiences. One network. Seamless across every touchpoint.</p>
            </Reveal>
          </div>
          <div className="flex justify-center gap-2 mb-12 flex-wrap">
            {screenLabels.map((label,i)=>(
              <motion.button key={label} onClick={()=>setActiveScreen(i)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                style={{background:activeScreen===i?WaselColors.cyan:'rgba(255,255,255,0.05)',color:activeScreen===i?'white':'rgba(255,255,255,0.45)',border:`1px solid ${activeScreen===i?WaselColors.cyan:'rgba(255,255,255,0.08)'}`}}
                whileHover={{scale:1.04}} whileTap={{scale:0.97}}>{label}</motion.button>
            ))}
          </div>
          <div className="relative flex items-center justify-center gap-6 lg:gap-12 min-h-[500px]">
            <motion.div className="hidden md:block opacity-25 scale-90" style={{filter:'blur(3px)'}}>
              <PhoneMockup screen={screens[(activeScreen-1+5)%5]}/>
            </motion.div>
            <motion.div key={activeScreen} initial={{opacity:0,scale:0.88,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{duration:0.5,ease:[0.16,1,0.3,1]}}>
              <PhoneMockup screen={screens[activeScreen]} floating/>
            </motion.div>
            <motion.div className="hidden md:block opacity-25 scale-90" style={{filter:'blur(3px)'}}>
              <PhoneMockup screen={screens[(activeScreen+1)%5]}/>
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full" style={{background:`radial-gradient(circle, ${WaselColors.cyan}18 0%, transparent 70%)`,filter:'blur(50px)'}}/>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-10">
            {screens.map((_,i)=>(
              <button key={i} onClick={()=>setActiveScreen(i)} className="transition-all duration-300 rounded-full"
                style={{width:i===activeScreen?28:6,height:6,background:i===activeScreen?WaselColors.cyan:'rgba(255,255,255,0.2)'}}/>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6 — WHY WASEL
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep} 0%, ${WaselColors.navyMid} 50%, ${WaselColors.spaceDeep} 100%)`}}/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Reveal>
              <SectionTag text="Why Wasel"/>
              <h2 className="font-black mb-4" style={{fontSize:'clamp(2rem,5vw,3.5rem)'}}>
                <span className="text-white">This changes </span>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.cyan}, ${WaselColors.ctaBronze})`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>everything</span>
              </h2>
            </Reveal>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b,i)=>(
              <Reveal key={b.title} delay={i*0.1}>
                <motion.div className="p-8 rounded-3xl border border-white/8 group relative overflow-hidden"
                  style={{background:'rgba(7,14,31,0.7)',backdropFilter:'blur(16px)'}}
                  whileHover={{y:-6,borderColor:`${b.color}40`}}>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{background:`radial-gradient(circle at 20% 20%, ${b.color}0A, transparent 70%)`}}/>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                    style={{background:`${b.color}1F`,border:`1px solid ${b.color}40`,color:b.color}}>{b.icon}</div>
                  <h3 className="text-white text-lg font-bold mb-1 relative z-10">{b.title}</h3>
                  <p className="text-sm mb-3 relative z-10" style={{color:b.color,fontFamily:'Cairo, Tajawal, sans-serif'}}>{b.titleAr}</p>
                  <p className="text-white/55 text-sm leading-relaxed relative z-10">{b.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7 — TRUST & SAFETY
          ══════════════════════════════════════════════════════════════ */}
      <section id="trust" className="py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Reveal>
                <SectionTag text="Trust & Safety"/>
                <h2 className="font-black mb-6" style={{fontSize:'clamp(2rem,4vw,3.2rem)',lineHeight:1.1}}>
                  <span className="text-white">Trust built into</span><br/>
                  <span style={{background:`linear-gradient(135deg, ${WaselColors.cyan}, ${WaselColors.forestGreen})`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>every layer</span>
                </h2>
                <p className="text-white/55 text-lg leading-relaxed mb-8">Safety isn't a feature. It's the foundation. Every person on Wasel goes through rigorous verification before their first trip.</p>
              </Reveal>
              <div className="space-y-4">
                {trustSteps.map((step,i)=>(
                  <Reveal key={step.title} delay={i*0.12}>
                    <motion.div className="flex gap-4 p-5 rounded-2xl border border-white/8 group"
                      style={{background:'rgba(7,14,31,0.6)',backdropFilter:'blur(16px)'}}
                      whileHover={{x:6,borderColor:`${step.color}40`}}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{background:`${step.color}1F`,border:`1px solid ${step.color}40`,color:step.color}}>{step.icon}</div>
                      <div>
                        <h4 className="text-white font-semibold text-sm mb-0.5">{step.title}</h4>
                        <p className="text-white/35 text-xs mb-1" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>{step.titleAr}</p>
                        <p className="text-white/55 text-xs leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.div>
                  </Reveal>
                ))}
              </div>
            </div>
            <Reveal direction="right">
              <div className="relative p-8 rounded-3xl border border-white/8" style={{background:'rgba(7,14,31,0.8)',backdropFilter:'blur(20px)'}}>
                <h3 className="text-white font-bold text-lg mb-6">Community Trust Score</h3>
                <div className="flex justify-center mb-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                      <motion.circle cx="80" cy="80" r="70" fill="none" stroke="url(#tg)" strokeWidth="12"
                        strokeLinecap="round" strokeDasharray="439.8"
                        initial={{strokeDashoffset:439.8}} whileInView={{strokeDashoffset:439.8*0.03}} viewport={{once:true}} transition={{duration:2,ease:'easeOut',delay:0.3}}/>
                      <defs><linearGradient id="tg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={WaselColors.cyan}/><stop offset="100%" stopColor={WaselColors.forestGreen}/></linearGradient></defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">97</span>
                      <span className="text-xs font-semibold" style={{color:WaselColors.cyan}}>Trust Score</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[{val:'100%',label:'ID Verified',color:WaselColors.cyan},{val:'4.92',label:'Avg. Rating',color:WaselColors.ctaBronze},{val:'0',label:'Disputes',color:WaselColors.forestGreen},{val:'< 2h',label:'Response Time',color:WaselColors.cyan}].map(s=>(
                    <div key={s.label} className="text-center p-4 rounded-2xl" style={{background:'rgba(255,255,255,0.04)'}}>
                      <div className="text-2xl font-black mb-1" style={{color:s.color}}>{s.val}</div>
                      <div className="text-white/45 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 8 — TESTIMONIALS
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep} 0%, ${WaselColors.navyMid} 50%, ${WaselColors.spaceDeep} 100%)`}}/>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal>
              <SectionTag text="Community"/>
              <h2 className="font-black mb-4" style={{fontSize:'clamp(2rem,4vw,3rem)'}}>
                <span className="text-white">Real people. </span>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.ctaBronze}, ${WaselColors.goldLight})`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>Real journeys.</span>
              </h2>
            </Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t,i)=>(
              <Reveal key={t.name} delay={i*0.15}>
                <motion.div className="p-7 rounded-3xl border border-white/8 flex flex-col gap-4 h-full relative overflow-hidden"
                  style={{background:'rgba(7,14,31,0.8)',backdropFilter:'blur(16px)'}}
                  whileHover={{y:-6,borderColor:`${WaselColors.ctaBronze}4D`}}>
                  <div className="flex gap-1">{Array.from({length:t.rating},(_,k)=><Star key={k} className="w-4 h-4 text-yellow-400 fill-yellow-400"/>)}</div>
                  <p className="text-white/80 text-sm leading-relaxed flex-1">"{t.text}"</p>
                  <p className="text-white/40 text-xs leading-relaxed text-right" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>"{t.textAr}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{border:`2px solid ${WaselColors.cyan}4D`}}>
                      <ImageWithFallback src={t.avatar} alt={t.name} className="w-full h-full object-cover"/>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-xs" style={{color:WaselColors.cyan}}>{t.role}</p>
                    </div>
                  </div>
                  <div className="absolute top-6 right-6 text-6xl font-serif leading-none select-none" style={{color:`${WaselColors.cyan}1A`}}>"</div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 9 — COST CALCULATOR
          ══════════════════════════════════════════════════════════════ */}
      <section id="calculator" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep} 0%, ${WaselColors.spaceCard} 50%, ${WaselColors.spaceDeep} 100%)`}}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center mb-12">
              <SectionTag text="Trip Cost Calculator · حاسبة التكلفة"/>
              <h2 className="font-black mb-4" style={{fontSize:'clamp(1.8rem,4vw,3rem)'}}>
                <span className="text-white">How much </span>
                <span style={{background:`linear-gradient(135deg, ${WaselColors.cyan}, ${WaselColors.gold})`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>will you save?</span>
              </h2>
              <p className="text-white/55 text-base max-w-xl mx-auto">كم ستوفر؟ · Fixed, transparent, no surge pricing ever</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}><LandingCostCalculator onGetStarted={onGetStarted}/></Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 10 — FINAL CTA (Orbital)
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:`linear-gradient(180deg, ${WaselColors.spaceDeep} 0%, ${WaselColors.spaceCard} 50%, ${WaselColors.spaceDeep} 100%)`}}/>
        {/* Orbital rings */}
        {[600,900,1200].map((sz,i)=>(
          <motion.div key={i} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{width:sz,height:sz,borderColor:`rgba(0,200,232,${0.04-i*0.01})`}}
            animate={{rotate:[0,360]}} transition={{duration:60+i*20,repeat:Infinity,ease:'linear'}}/>
        ))}
        {/* Central glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{background:`radial-gradient(circle, ${WaselColors.cyan}0A 0%, transparent 65%)`,filter:'blur(60px)'}}/>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <div className="flex justify-center mb-12">
              <motion.div animate={{y:[0,-14,0],rotate:[0,3,-3,0]}} transition={{duration:6,repeat:Infinity,ease:'easeInOut'}}>
                <ConstellationLogo size={88} withText={false}/>
              </motion.div>
            </div>
            <h2 className="font-black mb-6" style={{fontSize:'clamp(2.8rem,9vw,7rem)',lineHeight:0.95,letterSpacing:'-0.03em'}}>
              <span className="block" style={{background:`linear-gradient(135deg, white 0%, rgba(255,255,255,0.9) 40%, ${WaselColors.cyan} 70%, ${WaselColors.ctaBronze} 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>Join the</span>
              <span className="block" style={{background:`linear-gradient(135deg, ${WaselColors.cyan} 0%, ${WaselColors.cyanLight} 50%, ${WaselColors.gold} 100%)`,WebkitBackgroundClip:'text',backgroundClip:'text',WebkitTextFillColor:'transparent'}}>movement.</span>
            </h2>
            <p className="text-xl text-white/50 mb-4 max-w-2xl mx-auto leading-relaxed">
              Be part of the network that's changing how the Middle East moves. Early access is limited.
            </p>
            <p className="text-lg text-white/30 mb-16" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>
              انضم للشبكة. شارك الرحلة. وفّر المصاري. غيّر طريقة سفرك.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-5 justify-center mb-16">
              <motion.button whileHover={{scale:1.06,boxShadow:`0 28px 70px ${WaselColors.cyan}5A`}}
                whileTap={{scale:0.97}} onClick={onGetStarted}
                className="group flex items-center justify-center gap-3 px-12 py-6 rounded-2xl font-black text-xl text-white relative overflow-hidden"
                style={{background:WaselGradients.primaryBtn}}>
                <span>Join Early Access</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform"/>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"/>
              </motion.button>
              <motion.button whileHover={{scale:1.03,borderColor:`${WaselColors.ctaBronze}66`,color:WaselColors.ctaBronze}}
                whileTap={{scale:0.97}} onClick={onGetStarted}
                className="flex items-center justify-center gap-3 px-10 py-6 rounded-2xl font-bold text-white/80 border border-white/15 transition-all"
                style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(12px)'}}>
                <Car className="w-5 h-5"/> Become a Traveler
              </motion.button>
              <motion.button whileHover={{scale:1.03,borderColor:`${WaselColors.forestGreen}66`,color:WaselColors.forestGreen}}
                whileTap={{scale:0.97}} onClick={onGetStarted}
                className="flex items-center justify-center gap-3 px-10 py-6 rounded-2xl font-bold text-white/80 border border-white/15 transition-all"
                style={{background:'rgba(255,255,255,0.04)',backdropFilter:'blur(12px)'}}>
                <Layers className="w-5 h-5"/> Partner With Us
              </motion.button>
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4" style={{color:WaselColors.lime}}/><span>No credit card required</span></div>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" style={{color:WaselColors.cyan}}/><span>ID verified community</span></div>
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400"/><span>4.9 average rating</span></div>
              <div className="flex items-center gap-2"><Globe className="w-4 h-4" style={{color:WaselColors.ctaBronze}}/><span>Jordan first, MENA next</span></div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 py-16 relative" style={{background:`rgba(4,12,24,0.98)`}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 md:col-span-1">
              <ConstellationLogo size={36}/>
              <p className="text-white/40 text-sm mt-4 leading-relaxed">The intelligent mobility network connecting Jordan and beyond.</p>
              <p className="text-white/25 text-xs mt-2" style={{fontFamily:'Cairo, Tajawal, sans-serif'}}>شبكة التنقل الذكية</p>
              <div className="flex gap-4 mt-6">
                {[Twitter,Instagram,Facebook,Linkedin].map((Icon,i)=>(
                  <motion.div key={i} whileHover={{scale:1.2,color:WaselColors.cyan}} className="cursor-pointer">
                    <Icon className="w-5 h-5 text-white/30 hover:text-primary transition-colors"/>
                  </motion.div>
                ))}
              </div>
            </div>
            {[
              {title:'Product',links:['Search Rides','Post a Ride','Send Package','Track Package','How It Works']},
              {title:'Company',links:['About Us','Blog','Careers','Press','Investors']},
              {title:'Support',links:['Help Center','Safety Center','Trust & Verification','Contact Us','Terms & Privacy']},
            ].map(col=>(
              <div key={col.title}>
                <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(link=>(
                    <li key={link}><button className="text-white/40 hover:text-white/80 text-sm transition-colors">{link}</button></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm">© 2026 Wasel | واصل. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-white/25">
              <span>Built for the Middle East 🇯🇴</span><span>·</span><span>JOD · عربي · English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
