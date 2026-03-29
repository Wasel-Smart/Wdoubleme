import { Check, Circle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { motion, AnimatePresence } from 'motion/react';

interface JourneyStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface JourneyProgressProps {
  currentStep: number;
  completedSteps: number[];
  onNavigate?: (page: string) => void;
}

export function JourneyProgress({ currentStep, completedSteps, onNavigate }: JourneyProgressProps) {
  const steps: JourneyStep[] = [
    {
      id: 1,
      title: 'Complete Your Profile',
      description: 'Add your photo and verify your phone number',
      completed: completedSteps.includes(1),
    },
    {
      id: 2,
      title: 'Find Your First Ride',
      description: 'Search for available trips in your area',
      completed: completedSteps.includes(2),
    },
    {
      id: 3,
      title: 'Book & Connect',
      description: 'Reserve seats and chat with your driver',
      completed: completedSteps.includes(3),
    },
    {
      id: 4,
      title: 'Enjoy Your Journey',
      description: 'Meet at pickup point and travel safely',
      completed: completedSteps.includes(4),
    },
    {
      id: 5,
      title: 'Rate Your Experience',
      description: 'Help build trust in the community',
      completed: completedSteps.includes(5),
    },
  ];

  const progress = (completedSteps.length / steps.length) * 100;

  const getStepAction = (stepId: number) => {
    const actions: Record<number, () => void> = {
      1: () => onNavigate?.('profile'),
      2: () => onNavigate?.('find-ride'),
      3: () => onNavigate?.('my-trips'),
      4: () => onNavigate?.('my-trips'),
      5: () => onNavigate?.('my-trips'),
    };
    return actions[stepId];
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-gray-900 dark:to-primary/10">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              Your Journey Progress
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {completedSteps.length} of {steps.length} completed
            </p>
          </div>
          <Badge variant="secondary" className="text-base px-3 py-1">
            {Math.round(progress)}%
          </Badge>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2 mb-6" />

        {/* Steps Grid */}
        <div className="grid md:grid-cols-5 gap-3">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = step.completed;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative cursor-pointer group`}
                onClick={() => getStepAction(step.id)?.()}
              >
                <div
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : isActive
                      ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-primary/50'
                  }`}
                >
                  {/* Step Number/Check */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm">{step.id}</span>
                      )}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div>
                    <h4
                      className={`font-semibold text-sm mb-1 ${
                        isCompleted
                          ? 'text-green-700 dark:text-green-300'
                          : isActive
                          ? 'text-primary'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {step.description}
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {isActive && !isCompleted && (
                    <div className="absolute -top-1 -right-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Next Action Prompt */}
        {completedSteps.length < steps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/30"
          >
            <p className="text-sm text-center">
              <span className="font-semibold text-primary">Next Step:</span>{' '}
              {steps.find((s) => s.id === currentStep)?.title || 'Continue your journey'}
            </p>
          </motion.div>
        )}

        {/* Completion Message */}
        {completedSteps.length === steps.length && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border-2 border-green-500 text-center"
          >
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-semibold text-green-700 dark:text-green-300">
              Journey Complete! You're all set to use Wasel.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}