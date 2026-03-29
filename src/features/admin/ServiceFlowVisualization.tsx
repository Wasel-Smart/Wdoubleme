/**
 * Service Flow Visualization
 * Interactive diagram showing how the hidden service engine works
 * Shows all microservices that activate automatically when user clicks a button
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Network,
  Zap,
  Database,
  MessageSquare,
  Shield,
  DollarSign,
  MapPin,
  Users,
  Bell,
  TrendingUp,
  Activity,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../components/ui/utils';
import { ServiceActivation, ServiceType } from '../../services/serviceOrchestrator';

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE METADATA
// ═══════════════════════════════════════════════════════════════════════════════

interface ServiceNode {
  id: ServiceType;
  name: string;
  nameAr: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  descriptionAr: string;
  layer: 'frontend' | 'orchestration' | 'backend' | 'external';
}

const SERVICE_NODES: ServiceNode[] = [
  {
    id: 'ride-sharing',
    name: 'Ride Sharing',
    nameAr: 'مشاركة الرحلات',
    icon: Users,
    color: 'from-teal-500 to-emerald-500',
    description: 'Match passengers with drivers',
    descriptionAr: 'ربط الركاب بالسواقين',
    layer: 'backend',
  },
  {
    id: 'package-delivery',
    name: 'Package Delivery',
    nameAr: 'توصيل الطرود',
    icon: MapPin,
    color: 'from-violet-500 to-purple-500',
    description: 'Match packages with travelers',
    descriptionAr: 'ربط الطرود بالمسافرين',
    layer: 'backend',
  },
  {
    id: 'seat-booking',
    name: 'Seat Booking',
    nameAr: 'حجز المقاعد',
    icon: Activity,
    color: 'from-blue-500 to-indigo-500',
    description: 'Manage seat reservations',
    descriptionAr: 'إدارة حجوزات المقاعد',
    layer: 'backend',
  },
  {
    id: 'driver-matching',
    name: 'AI Matching',
    nameAr: 'ربط ذكي',
    icon: Zap,
    color: 'from-amber-500 to-orange-500',
    description: 'Intelligent driver-passenger matching',
    descriptionAr: 'ربط ذكي بين السواق والراكب',
    layer: 'orchestration',
  },
  {
    id: 'route-intelligence',
    name: 'Route Intelligence',
    nameAr: 'ذكاء الطرق',
    icon: TrendingUp,
    color: 'from-cyan-500 to-blue-500',
    description: 'Optimize routes and predict demand',
    descriptionAr: 'تحسين الطرق وتوقع الطلب',
    layer: 'orchestration',
  },
  {
    id: 'prayer-integration',
    name: 'Prayer Integration',
    nameAr: 'تكامل الصلاة',
    icon: Network,
    color: 'from-green-500 to-teal-500',
    description: 'Plan prayer stops automatically',
    descriptionAr: 'تخطيط أوقات الصلاة تلقائياً',
    layer: 'backend',
  },
  {
    id: 'gender-preferences',
    name: 'Gender Preferences',
    nameAr: 'تفضيلات الجنس',
    icon: Shield,
    color: 'from-pink-500 to-rose-500',
    description: 'Respect cultural preferences',
    descriptionAr: 'احترام التفضيلات الثقافية',
    layer: 'backend',
  },
  {
    id: 'price-calculation',
    name: 'Price Calculator',
    nameAr: 'حاسبة الأسعار',
    icon: DollarSign,
    color: 'from-emerald-500 to-green-500',
    description: 'Calculate optimal fares',
    descriptionAr: 'حساب الأسعار المثلى',
    layer: 'orchestration',
  },
  {
    id: 'payment-processing',
    name: 'Payment Processing',
    nameAr: 'معالجة الدفع',
    icon: DollarSign,
    color: 'from-green-600 to-emerald-600',
    description: 'Process transactions securely',
    descriptionAr: 'معالجة المعاملات بأمان',
    layer: 'external',
  },
  {
    id: 'real-time-tracking',
    name: 'Live Tracking',
    nameAr: 'تتبع مباشر',
    icon: MapPin,
    color: 'from-red-500 to-orange-500',
    description: 'Real-time location tracking',
    descriptionAr: 'تتبع الموقع المباشر',
    layer: 'backend',
  },
  {
    id: 'notification-delivery',
    name: 'Notifications',
    nameAr: 'الإشعارات',
    icon: Bell,
    color: 'from-yellow-500 to-amber-500',
    description: 'Push and SMS notifications',
    descriptionAr: 'إشعارات فورية ورسائل',
    layer: 'external',
  },
  {
    id: 'trust-verification',
    name: 'Trust & Safety',
    nameAr: 'الثقة والأمان',
    icon: Shield,
    color: 'from-indigo-500 to-purple-500',
    description: 'Verify users and ensure safety',
    descriptionAr: 'التحقق من المستخدمين والأمان',
    layer: 'backend',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface ServiceFlowVisualizationProps {
  activeServices?: ServiceActivation[];
  userAction?: 'find-ride' | 'offer-ride' | 'send-package' | 'view-trips' | 'update-profile';
}

export function ServiceFlowVisualization({ 
  activeServices = [],
  userAction 
}: ServiceFlowVisualizationProps) {
  const [showLayers, setShowLayers] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [animateFlow, setAnimateFlow] = useState(false);

  // Simulate service activation flow
  useEffect(() => {
    if (userAction) {
      setAnimateFlow(true);
      const timer = setTimeout(() => setAnimateFlow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [userAction]);

  const getServicesByLayer = (layer: ServiceNode['layer']) => {
    return SERVICE_NODES.filter(s => s.layer === layer);
  };

  const isServiceActive = (serviceId: ServiceType) => {
    return activeServices.some(s => s.service === serviceId && s.status === 'active');
  };

  const isServiceCompleted = (serviceId: ServiceType) => {
    return activeServices.some(s => s.service === serviceId && s.status === 'completed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Service Flow Visualization
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            See the hidden microservices that power Wasel's simple interface
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLayers(!showLayers)}
        >
          {showLayers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showLayers ? 'Hide Layers' : 'Show Layers'}
        </Button>
      </div>

      {/* User Action Banner */}
      {userAction && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl text-white"
        >
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" />
            <div>
              <div className="font-semibold">User Action Detected</div>
              <div className="text-sm opacity-90">
                Action: <span className="font-mono">{userAction}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Service Layers */}
      <div className="space-y-6">
        {/* Frontend Layer */}
        <ServiceLayer
          title="Frontend (User Interface)"
          description="Simple 5-button interface"
          layer="frontend"
          services={getServicesByLayer('frontend')}
          activeServices={activeServices}
          animateFlow={animateFlow}
          onSelectService={setSelectedService}
          selectedService={selectedService}
          showLayer={showLayers}
        />

        {/* Orchestration Layer */}
        <ServiceLayer
          title="Orchestration Layer"
          description="AI-powered service coordination"
          layer="orchestration"
          services={getServicesByLayer('orchestration')}
          activeServices={activeServices}
          animateFlow={animateFlow}
          onSelectService={setSelectedService}
          selectedService={selectedService}
          showLayer={showLayers}
        />

        {/* Backend Layer */}
        <ServiceLayer
          title="Backend Services"
          description="Core business logic"
          layer="backend"
          services={getServicesByLayer('backend')}
          activeServices={activeServices}
          animateFlow={animateFlow}
          onSelectService={setSelectedService}
          selectedService={selectedService}
          showLayer={showLayers}
        />

        {/* External Layer */}
        <ServiceLayer
          title="External Services"
          description="Third-party integrations"
          layer="external"
          services={getServicesByLayer('external')}
          activeServices={activeServices}
          animateFlow={animateFlow}
          onSelectService={setSelectedService}
          selectedService={selectedService}
          showLayer={showLayers}
        />
      </div>

      {/* Service Details */}
      <AnimatePresence>
        {selectedService && (
          <ServiceDetails
            service={SERVICE_NODES.find(s => s.id === selectedService)!}
            activation={activeServices.find(s => s.service === selectedService)}
            onClose={() => setSelectedService(null)}
          />
        )}
      </AnimatePresence>

      {/* Stats */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              {activeServices.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Services</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeServices.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {SERVICE_NODES.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Services</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE LAYER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ServiceLayerProps {
  title: string;
  description: string;
  layer: ServiceNode['layer'];
  services: ServiceNode[];
  activeServices: ServiceActivation[];
  animateFlow: boolean;
  onSelectService: (service: ServiceType) => void;
  selectedService: ServiceType | null;
  showLayer: boolean;
}

function ServiceLayer({
  title,
  description,
  services,
  activeServices,
  animateFlow,
  onSelectService,
  selectedService,
  showLayer,
}: ServiceLayerProps) {
  if (!showLayer && services.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {services.map((service, index) => {
          const isActive = activeServices.some(s => s.service === service.id && s.status === 'active');
          const isCompleted = activeServices.some(s => s.service === service.id && s.status === 'completed');
          const isSelected = selectedService === service.id;

          return (
            <motion.button
              key={service.id}
              onClick={() => onSelectService(service.id)}
              className={cn(
                "group relative p-4 rounded-xl border-2 transition-all text-left",
                isSelected 
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                isActive && "animate-pulse",
                isCompleted && "bg-emerald-50 dark:bg-emerald-950 border-emerald-500"
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: animateFlow ? [1, 1.05, 1] : 1,
              }}
              transition={{ 
                delay: index * 0.05,
                scale: { duration: 0.3, delay: index * 0.1 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br shrink-0",
                  service.color
                )}>
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {service.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {service.description}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              {(isActive || isCompleted) && (
                <Badge 
                  className={cn(
                    "absolute top-2 right-2",
                    isActive ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  variant="default"
                >
                  {isActive ? 'Active' : 'Done'}
                </Badge>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE DETAILS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ServiceDetailsProps {
  service: ServiceNode;
  activation?: ServiceActivation;
  onClose: () => void;
}

function ServiceDetails({ service, activation, onClose }: ServiceDetailsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <Card className="p-6 border-2 border-teal-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br",
              service.color
            )}>
              <service.icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {service.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {activation && (
          <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
                <Badge className={cn(
                  activation.status === 'active' ? 'bg-amber-500' :
                  activation.status === 'completed' ? 'bg-emerald-500' :
                  'bg-red-500'
                )}>
                  {activation.status}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Triggered</div>
                <div className="text-sm font-mono">
                  {new Date(activation.triggered).toLocaleTimeString()}
                </div>
              </div>
            </div>

            {activation.metadata && Object.keys(activation.metadata).length > 0 && (
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Metadata</div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-auto">
                  {JSON.stringify(activation.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
