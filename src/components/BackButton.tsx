import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface BackButtonProps {
  onBack?: () => void;
  label?: string;
  className?: string;
}

export function BackButton({ onBack, label, className = '' }: BackButtonProps) {
  const { t, language } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default behavior: navigate back
      window.history.back();
    }
  };

  const isRTL = language === 'ar';
  const Icon = isRTL ? ArrowRight : ArrowLeft;
  const defaultLabel = t('common.back') || 'Back';

  return (
    <Button
      variant="ghost"
      onClick={handleBack}
      className={`gap-2 ${className}`}
      aria-label={label || defaultLabel}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>{label || defaultLabel}</span>
    </Button>
  );
}
