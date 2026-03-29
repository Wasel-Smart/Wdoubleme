/**
 * Country Selector Component
 * 
 * Allows users to view and switch between available countries.
 * Displays country flag, name, and currency.
 */

import React, { useState } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Globe, Check, MapPin } from 'lucide-react';
import { cn } from './ui/utils';

interface CountrySelectorProps {
  className?: string;
  variant?: 'default' | 'minimal';
  showCurrency?: boolean;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  className,
  variant = 'default',
  showCurrency = true,
}) => {
  const {
    currentCountry,
    availableCountries,
    setCountry,
    isLoading,
    isDetecting,
  } = useCountry();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleCountryChange = async (isoCode: string) => {
    await setCountry(isoCode);
    setIsOpen(false);
  };

  if (isLoading || !currentCountry) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  // Minimal variant (just flag + code)
  if (variant === 'minimal') {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2', className)}
            disabled={isDetecting}
          >
            <span className="text-2xl">{currentCountry.flag_emoji}</span>
            <span className="text-sm font-medium">{currentCountry.iso_alpha2}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            {language === 'ar' ? 'اختر الدولة' : 'Select Country'}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableCountries.map((country) => (
            <DropdownMenuItem
              key={country.iso_alpha2}
              onClick={() => handleCountryChange(country.iso_alpha2)}
              className="flex items-center justify-between gap-2"
              disabled={country.status !== 'active'}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{country.flag_emoji}</span>
                <span className="font-medium">
                  {language === 'ar' ? country.name_ar : country.name}
                </span>
              </div>
              {currentCountry.iso_alpha2 === country.iso_alpha2 && (
                <Check className="h-4 w-4 text-primary" />
              )}
              {country.status !== 'active' && (
                <Badge variant="outline" className="text-xs">
                  {language === 'ar' ? 'قريباً' : 'Soon'}
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default variant (full display)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-3 px-4 hover:bg-accent/50',
            className
          )}
          disabled={isDetecting}
        >
          {isDetecting ? (
            <>
              <MapPin className="h-4 w-4 animate-pulse" />
              <span className="text-sm">
                {language === 'ar' ? 'جاري الكشف...' : 'Detecting...'}
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl">{currentCountry.flag_emoji}</span>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {language === 'ar' ? currentCountry.name_ar : currentCountry.name}
                </span>
                {showCurrency && (
                  <span className="text-xs text-muted-foreground">
                    {currentCountry.default_currency_code}
                  </span>
                )}
              </div>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
          <Globe className="h-4 w-4" />
          {language === 'ar' ? 'اختر دولتك' : 'Select Your Country'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Active countries */}
        <div className="max-h-[400px] overflow-y-auto">
          {availableCountries
            .filter((c) => c.status === 'active')
            .map((country) => (
              <DropdownMenuItem
                key={country.iso_alpha2}
                onClick={() => handleCountryChange(country.iso_alpha2)}
                className="flex items-center justify-between gap-3 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{country.flag_emoji}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {language === 'ar' ? country.name_ar : country.name}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{country.default_currency_code}</span>
                      <span>•</span>
                      <span>{country.phone_country_code}</span>
                    </div>
                  </div>
                </div>
                {currentCountry.iso_alpha2 === country.iso_alpha2 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="text-xs">
                      {language === 'ar' ? 'الحالي' : 'Current'}
                    </Badge>
                    <Check className="h-5 w-5 text-primary" />
                  </div>
                )}
              </DropdownMenuItem>
            ))}

          {/* Coming soon countries */}
          {availableCountries.filter((c) => c.status === 'coming_soon').length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                {language === 'ar' ? 'قريباً' : 'Coming Soon'}
              </DropdownMenuLabel>
              {availableCountries
                .filter((c) => c.status === 'coming_soon')
                .map((country) => (
                  <DropdownMenuItem
                    key={country.iso_alpha2}
                    disabled
                    className="flex items-center justify-between gap-3 px-3 py-3 opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{country.flag_emoji}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">
                          {language === 'ar' ? country.name_ar : country.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {country.default_currency_code}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {language === 'ar' ? 'قريباً' : 'Soon'}
                    </Badge>
                  </DropdownMenuItem>
                ))}
            </>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CountrySelector;