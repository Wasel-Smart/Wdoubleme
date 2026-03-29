/**
 * In-App Onboarding Component
 * First-time user onboarding flow
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useLanguage } from '../contexts/LanguageContext';

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Onboarding() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      title: t('onboarding.welcome.title'),
      description: t('onboarding.welcome.description'),
      image: '/onboarding/welcome.svg',
    },
    {
      title: t('onboarding.book.title'),
      description: t('onboarding.book.description'),
      image: '/onboarding/book.svg',
      action: {
        label: t('onboarding.book.action'),
        onClick: () => {
          history.pushState(null, '', '/app/carpooling/book');
          window.dispatchEvent(new PopStateEvent('popstate'));
        },
      },
    },
    {
      title: t('onboarding.track.title'),
      description: t('onboarding.track.description'),
      image: '/onboarding/track.svg',
    },
    {
      title: t('onboarding.pay.title'),
      description: t('onboarding.pay.description'),
      image: '/onboarding/pay.svg',
    },
    {
      title: t('onboarding.complete.title'),
      description: t('onboarding.complete.description'),
      image: '/onboarding/complete.svg',
      action: {
        label: t('onboarding.complete.action'),
        onClick: () => handleComplete(),
      },
    },
  ];

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-2xl"
        >
          <Card>
            <CardContent className="p-8">
              {/* Close Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4"
                onClick={handleSkip}
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-center space-y-6"
                >
                  {/* Image */}
                  <div className="w-48 h-48 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="text-6xl">{currentStep === 0 ? '👋' : currentStep === 1 ? '🚗' : currentStep === 2 ? '📍' : currentStep === 3 ? '💳' : '🎉'}</div>
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-foreground">
                    {step.title}
                  </h2>

                  {/* Description */}
                  <p className="text-lg text-muted-foreground max-w-md mx-auto">
                    {step.description}
                  </p>

                  {/* Action Button (optional) */}
                  {step.action && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={step.action.onClick}
                    >
                      {step.action.label}
                    </Button>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  {t('common.previous')}
                </Button>

                <Button onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}>
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      {t('common.get_started')}
                    </>
                  ) : (
                    <>
                      {t('common.next')}
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Skip Button */}
              <div className="text-center mt-4">
                <Button variant="link" onClick={handleSkip}>
                  {t('onboarding.skip')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}