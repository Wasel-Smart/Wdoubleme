/**
 * useTranslation Hook - Compatibility wrapper
 * 
 * This hook wraps the LanguageContext to provide translation functionality
 * For now, it simply re-exports useLanguage
 */

import { useLanguage } from '../../contexts/LanguageContext';

export function useTranslation() {
  return useLanguage();
}
