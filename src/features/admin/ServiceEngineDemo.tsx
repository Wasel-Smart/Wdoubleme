/**
 * Service Engine Demo
 * Interactive demonstration of how the hidden service engine works
 * Shows the microservice orchestration in real-time
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { orchestrator } from '../../services/serviceOrchestrator';
import { JORDAN_MOBILITY_NETWORK } from '../../config/jordan-mobility-network';
import { ServiceFlowVisualization } from './ServiceFlowVisualization';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Play,
  RotateCcw,
  Search,
  Car,
  Package,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '../../components/ui/utils';

type DemoAction = 'find-ride' | 'offer-ride' | 'send-package' | null;

interface DemoStep {
  step: number;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'pending' | 'active' | 'completed';
}

export function ServiceEngineDemo() {
  const [activeAction, setActiveAction] = useState<DemoAction>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [demoSteps, setDemoSteps] = useState<DemoStep[]>([]);

  // Simulate "Find Ride" action
  const runFindRideDemo = async () => {
    setIsRunning(true);
    setActiveAction('find-ride');
    setDemoSteps([
      {
        step: 1,
        title: 'User clicks "Find Ride"',
        description: 'Simple button click initiates orchestration',
        icon: Search,
        status: 'active',
      },
      {
        step: 2,
        title: 'Route Intelligence activated',
        description: 'Analyzing Amman → Aqaba route (330 km)',
        icon: Search,
        status: 'pending',
      },
      {
        step: 3,
        title: 'Price Calculator activated',
        description: 'Calculating optimal fare: JOD 8/seat',
        icon: Search,
        status: 'pending',
      },
      {
        step: 4,
        title: 'Driver Matching activated',
        description: 'AI matching with available drivers',
        icon: Search,
        status: 'pending',
      },
      {
        step: 5,
        title: 'Gender Preferences checked',
        description: 'Filtering based on user preference',
        icon: Search,
        status: 'pending',
      },
      {
        step: 6,
        title: 'Results Ready',
        description: 'User sees available rides',
        icon: Check,
        status: 'pending',
      },
    ]);

    // Step 1: User action
    await delay(1000);
    updateStepStatus(0, 'completed');
    updateStepStatus(1, 'active');

    // Step 2: Route Intelligence
    await delay(800);
    const context1 = await orchestrator.orchestrateFindRide('demo-user', {
      from: 'Amman',
      to: 'Aqaba',
      date: new Date(),
      passengers: 2,
      preferences: {
        gender: 'mixed',
        prayerStops: true,
      },
    });
    setActiveServices(context1.activatedServices);
    updateStepStatus(1, 'completed');
    updateStepStatus(2, 'active');

    // Step 3: Price calculation
    await delay(800);
    updateStepStatus(2, 'completed');
    updateStepStatus(3, 'active');

    // Step 4: Driver matching
    await delay(1000);
    updateStepStatus(3, 'completed');
    updateStepStatus(4, 'active');

    // Step 5: Gender preferences
    await delay(600);
    updateStepStatus(4, 'completed');
    updateStepStatus(5, 'active');

    // Step 6: Results
    await delay(500);
    updateStepStatus(5, 'completed');
    setIsRunning(false);
  };

  // Simulate "Offer Ride" action
  const runOfferRideDemo = async () => {
    setIsRunning(true);
    setActiveAction('offer-ride');
    setDemoSteps([
      {
        step: 1,
        title: 'User clicks "Offer Ride"',
        description: 'Driver posts a new ride',
        icon: Car,
        status: 'active',
      },
      {
        step: 2,
        title: 'Route Intelligence activated',
        description: 'Optimizing Irbid → Amman route',
        icon: Car,
        status: 'pending',
      },
      {
        step: 3,
        title: 'Price Calculator activated',
        description: 'Recommending JOD 5/seat',
        icon: Car,
        status: 'pending',
      },
      {
        step: 4,
        title: 'Seat Booking system activated',
        description: 'Managing 3 available seats',
        icon: Car,
        status: 'pending',
      },
      {
        step: 5,
        title: 'Passenger Matching started',
        description: 'Searching for potential passengers',
        icon: Car,
        status: 'pending',
      },
      {
        step: 6,
        title: 'Notifications sent',
        description: 'Nearby passengers notified',
        icon: Check,
        status: 'pending',
      },
    ]);

    // Execute steps
    await delay(1000);
    updateStepStatus(0, 'completed');
    updateStepStatus(1, 'active');

    await delay(800);
    const context = await orchestrator.orchestrateOfferRide('demo-user', {
      from: 'Irbid',
      to: 'Amman',
      date: new Date(),
      availableSeats: 3,
      vehicleType: 'sedan',
      preferences: {
        gender: 'mixed',
        prayerStops: true,
      },
    });
    setActiveServices(context.activatedServices);
    updateStepStatus(1, 'completed');
    updateStepStatus(2, 'active');

    await delay(800);
    updateStepStatus(2, 'completed');
    updateStepStatus(3, 'active');

    await delay(1000);
    updateStepStatus(3, 'completed');
    updateStepStatus(4, 'active');

    await delay(1000);
    updateStepStatus(4, 'completed');
    updateStepStatus(5, 'active');

    await delay(500);
    updateStepStatus(5, 'completed');
    setIsRunning(false);
  };

  // Simulate "Send Package" action
  const runSendPackageDemo = async () => {
    setIsRunning(true);
    setActiveAction('send-package');
    setDemoSteps([
      {
        step: 1,
        title: 'User clicks "Send Package"',
        description: 'Package delivery request initiated',
        icon: Package,
        status: 'active',
      },
      {
        step: 2,
        title: 'Route Intelligence activated',
        description: 'Finding travelers: Zarqa → Amman',
        icon: Package,
        status: 'pending',
      },
      {
        step: 3,
        title: 'Package Delivery service activated',
        description: 'Registering package with tracking',
        icon: Package,
        status: 'pending',
      },
      {
        step: 4,
        title: 'Traveler Matching started',
        description: 'Matching with available travelers',
        icon: Package,
        status: 'pending',
      },
      {
        step: 5,
        title: 'Price Calculated',
        description: 'JOD 3 (small package) + JOD 0.5 insurance',
        icon: Package,
        status: 'pending',
      },
      {
        step: 6,
        title: 'Tracking Active',
        description: 'QR code generated, GPS tracking enabled',
        icon: Check,
        status: 'pending',
      },
    ]);

    // Execute steps
    await delay(1000);
    updateStepStatus(0, 'completed');
    updateStepStatus(1, 'active');

    await delay(800);
    const context = await orchestrator.orchestrateSendPackage('demo-user', {
      from: 'Zarqa',
      to: 'Amman',
      size: 'small',
      value: 50,
      insurance: true,
    });
    setActiveServices(context.activatedServices);
    updateStepStatus(1, 'completed');
    updateStepStatus(2, 'active');

    await delay(800);
    updateStepStatus(2, 'completed');
    updateStepStatus(3, 'active');

    await delay(1000);
    updateStepStatus(3, 'completed');
    updateStepStatus(4, 'active');

    await delay(800);
    updateStepStatus(4, 'completed');
    updateStepStatus(5, 'active');

    await delay(500);
    updateStepStatus(5, 'completed');
    setIsRunning(false);
  };

  const reset = () => {
    setActiveAction(null);
    setIsRunning(false);
    setActiveServices([]);
    setDemoSteps([]);
    orchestrator.clearContext('demo-user');
  };

  const updateStepStatus = (index: number, status: DemoStep['status']) => {
    setDemoSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Service Engine Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive demonstration of Wasel's hidden microservice orchestration
        </p>
      </div>

      {/* Demo Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose a User Action
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={runFindRideDemo}
            disabled={isRunning}
            className="h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-br from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
          >
            {isRunning && activeAction === 'find-ride' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Search className="w-8 h-8" />
            )}
            <span className="font-semibold">Find Ride</span>
            <span className="text-xs opacity-80">See driver matching</span>
          </Button>

          <Button
            onClick={runOfferRideDemo}
            disabled={isRunning}
            className="h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {isRunning && activeAction === 'offer-ride' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Car className="w-8 h-8" />
            )}
            <span className="font-semibold">Offer Ride</span>
            <span className="text-xs opacity-80">See passenger matching</span>
          </Button>

          <Button
            onClick={runSendPackageDemo}
            disabled={isRunning}
            className="h-auto py-6 flex flex-col items-center gap-2 bg-gradient-to-br from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {isRunning && activeAction === 'send-package' ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Package className="w-8 h-8" />
            )}
            <span className="font-semibold">Send Package</span>
            <span className="text-xs opacity-80">See traveler matching</span>
          </Button>
        </div>

        {activeAction && (
          <div className="mt-4 flex justify-center">
            <Button onClick={reset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Demo
            </Button>
          </div>
        )}
      </Card>

      {/* Demo Steps */}
      <AnimatePresence>
        {demoSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Execution Flow
              </h2>
              <div className="space-y-3">
                {demoSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-lg border-2 transition-all',
                      step.status === 'active' &&
                        'border-teal-500 bg-teal-50 dark:bg-teal-950',
                      step.status === 'completed' &&
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
                      step.status === 'pending' &&
                        'border-gray-200 dark:border-gray-700 opacity-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold',
                        step.status === 'active' && 'bg-teal-500 text-white animate-pulse',
                        step.status === 'completed' && 'bg-emerald-500 text-white',
                        step.status === 'pending' && 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {step.status === 'completed' ? (
                        <Check className="w-5 h-5" />
                      ) : step.status === 'active' ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        step.step
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </div>
                    </div>
                    {step.status === 'active' && (
                      <Badge className="bg-teal-500">Running</Badge>
                    )}
                    {step.status === 'completed' && (
                      <Badge className="bg-emerald-500">Done</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Flow Visualization */}
      {activeServices.length > 0 && (
        <ServiceFlowVisualization
          activeServices={activeServices}
          userAction={activeAction || undefined}
        />
      )}

      {/* Info Banner */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              How the Demo Works
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <span>Click a button to simulate a user action (Find Ride, Offer Ride, Send Package)</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <span>Watch as the orchestrator automatically activates relevant microservices</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <span>See the execution flow and service activations in real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
                <span>All of this happens automatically - users only see the simple interface!</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
