import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BrainCircuit, Zap, TrendingUp, MapPin, BatteryCharging } from 'lucide-react';
import { NeuroCore, DemandHotspot } from '../../utils/ai/NeuroCore';
import { motion, AnimatePresence } from 'motion/react';

/**
 * DriverAssistant — AI-powered driver recommendations
 * 
 * Consolidated from: SmartDriverAssistant (Phase 2 naming cleanup)
 * Uses: NeuroCore AI engine for predictive demand analysis
 * Location: /components/driver/DriverAssistant.tsx
 */
export function DriverAssistant() {
  const [hotspots, setHotspots] = useState<DemandHotspot[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(78); // Simulate EV battery
  const [aiSuggestion, setAiSuggestion] = useState<string>('Scanning market conditions...');

  useEffect(() => {
    // Simulate AI thinking time
    const timer = setTimeout(() => {
      setHotspots(NeuroCore.getPredictiveHotspots());
      setAiSuggestion('Optimal Strategy: Head towards Abdali Boulevard (Surge Pricing Active +25%)');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const { carbonSaved } = NeuroCore.analyzeEVRoute(150, batteryLevel); // 150km hypothetical route

  return (
    <Card className="border-l-4 border-l-purple-600 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
          <BrainCircuit className="w-6 h-6 animate-pulse" />
          Wasel NeuroCore™ Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* AI Suggestion */}
          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border border-purple-100 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">Smart Recommendation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {aiSuggestion}
                </p>
              </div>
            </div>
          </div>

          {/* Predictive Hotspots */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Predicted Demand (Next 30m)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hotspots.map((spot, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">{spot.label}</span>
                  </div>
                  <Badge variant={spot.intensity > 85 ? 'destructive' : 'default'} className="text-xs">
                    {spot.intensity}% Load
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* EV Optimization */}
          <div className="pt-2 border-t border-purple-100 dark:border-purple-800/50">
             <h4 className="text-xs font-semibold uppercase tracking-wider text-green-600 mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" /> EV Optimization
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Range: ~240km</span>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                {carbonSaved.toFixed(1)}kg CO₂ Saved Today
              </Badge>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5H5" />
      <path d="M19 18v4" />
      <path d="M15 20h4" />
    </svg>
  );
}
