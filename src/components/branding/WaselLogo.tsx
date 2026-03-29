import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselLoadingScreen } from '../WaselBrand';
import { WaselCoreMark } from './WaselCoreMark';

export type LogoVariant = 'full' | 'icon' | 'horizontal' | 'minimal';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface WaselLogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

const sizeMap = {
  xs: { icon: 'w-6 h-6', text: 'text-xs', px: 24 },
  sm: { icon: 'w-8 h-8', text: 'text-sm', px: 32 },
  md: { icon: 'w-12 h-12', text: 'text-base', px: 48 },
  lg: { icon: 'w-16 h-16', text: 'text-lg', px: 64 },
  xl: { icon: 'w-24 h-24', text: 'text-2xl', px: 96 },
  '2xl': { icon: 'w-32 h-32', text: 'text-4xl', px: 128 },
} as const;

export const WaselLogo: React.FC<WaselLogoProps> = ({
  variant = 'full',
  size = 'md',
  showText = true,
  className = '',
  onClick,
  animated = false,
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const sizes = sizeMap[size];
  const isClickable = !!onClick;

  if (variant === 'icon' || variant === 'minimal') {
    return (
      <div
        className={`
          relative inline-flex items-center justify-center flex-shrink-0
          ${sizes.icon}
          ${animated ? 'transition-all duration-300 hover:scale-110' : ''}
          ${isClickable ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        aria-label="Wasel Logo"
      >
        <WaselCoreMark size={sizes.px} animated={animated} glow={animated} title="Wasel" />
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-2.5 min-w-0
        ${isClickable ? 'cursor-pointer group' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      aria-label="Wasel"
    >
      <div
        className={`
          relative flex-shrink-0
          ${sizes.icon}
          ${animated ? 'transition-all duration-300 group-hover:scale-110' : ''}
        `}
      >
        <WaselCoreMark size={sizes.px} animated={animated} glow title="Wasel" />
      </div>

      {showText && (
        <div
          className={`
            flex flex-col min-w-0
            ${isRTL ? 'text-right' : 'text-left'}
            ${animated ? 'transition-all duration-300 group-hover:translate-x-0.5' : ''}
          `}
        >
          <div
            className={`
              font-black tracking-tight leading-none
              ${sizes.text}
              bg-gradient-to-r from-[#0B1D45] via-[#00C8E8] to-[#13D38D] bg-clip-text text-transparent
              ${animated ? 'group-hover:from-[#00C8E8] group-hover:to-[#13D38D] transition-all duration-500' : ''}
            `}
          >
            {isRTL ? 'ÙˆØ§ØµÙ„' : 'Wasel'} <span className="opacity-60 text-[0.7em]">|</span> {isRTL ? 'Wasel' : 'ÙˆØ§ØµÙ„'}
          </div>
          <div
            className={`
              text-[0.6em] text-muted-foreground font-medium leading-none mt-0.5 truncate
              ${animated ? 'group-hover:text-primary transition-colors duration-300' : ''}
            `}
          >
            {isRTL ? 'ØªØ­Ø±Ùƒ Ø¨Ø°ÙƒØ§Ø¡ Ø¹Ø¨Ø± Ø§Ù„Ø£Ø±Ø¯Ù†' : 'Move smarter across Jordan'}
          </div>
        </div>
      )}
    </div>
  );
};

export const WaselLogoHorizontal: React.FC<Omit<WaselLogoProps, 'variant'>> = (props) => {
  return <WaselLogo {...props} variant="horizontal" />;
};

export const WaselLogoIcon: React.FC<Omit<WaselLogoProps, 'variant' | 'showText'>> = (props) => {
  return <WaselLogo {...props} variant="icon" showText={false} />;
};

export const WaselLogoHero: React.FC<Omit<WaselLogoProps, 'animated'>> = (props) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute inset-0 blur-3xl opacity-25 bg-gradient-to-r from-[#0B1D45] via-[#00C8E8] to-[#13D38D] animate-pulse rounded-full" />
      <WaselLogo {...props} animated size="2xl" />
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Jordan&apos;s connected mobility and delivery brand
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Ø¹Ù„Ø§Ù…Ø© ÙˆØ§ØµÙ„ Ù„Ù„ØªÙ†Ù‚Ù„ ÙˆØ§Ù„ØªÙˆØµÙŠÙ„ Ø§Ù„Ù…ØªØµÙ„
        </p>
      </div>
    </div>
  );
};

export const WaselLogoLoading: React.FC = () => {
  return <WaselLoadingScreen />;
};
