/**
 * AI Context Provider for Wassel
 * 
 * Manages AI state, configuration, and provides hooks for AI features
 * across the application without changing UI components.
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { aiService, AIConfig, AIResponse } from '../services/aiService';
import { useAuth } from './AuthContext';

interface AIContextType {
  // Configuration
  config: AIConfig | null;
  isAIEnabled: boolean;
  userConsent: boolean;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  updateConfig: (config: Partial<AIConfig>) => Promise<void>;
  setUserConsent: (consent: boolean) => Promise<void>;
  
  // Feature flags
  features: {
    smartRoutes: boolean;
    /** @deprecated Wasel uses fixed cost-sharing pricing. No dynamic pricing. */
    dynamicPricing: false;
    riskAssessment: boolean;
    nlpSearch: boolean;
    recommendations: boolean;
    predictive: boolean;
    smartMatching: boolean;
    conversationAI: boolean;
  };
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [userConsent, setUserConsentState] = useState<boolean>(true);
  const [loading, setLoading] = useState(false); // Changed to false to prevent blocking
  const [error, setError] = useState<string | null>(null);

  // Load AI configuration on mount
  useEffect(() => {
    loadAIConfig();
  }, []);

  // Load user consent when user changes
  useEffect(() => {
    if (user?.id) {
      loadUserConsent(user.id);
    }
  }, [user?.id]);

  const loadAIConfig = async () => {
    try {
      setLoading(true);
      const aiConfig = await aiService.getAIConfig();
      setConfig(aiConfig);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Failed to load AI config:', err);
      // Set default config on error so app can still function
      setConfig({
        enabled: false,
        features: {
          smartRoutes: false,
          dynamicPricing: false,
          riskAssessment: false,
          nlpSearch: false,
          recommendations: false,
          predictive: false,
          smartMatching: false,
          conversationAI: false,
        },
        models: {
          routeOptimization: '',
          pricingModel: '',
          riskModel: '',
          nlpModel: '',
          recommendationModel: '',
        },
        thresholds: {
          riskScore: 0.5,
          matchConfidence: 0.7,
          pricingConfidence: 0.8,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserConsent = async (userId: string) => {
    try {
      const consent = await aiService.getUserAIConsent(userId);
      setUserConsentState(consent);
    } catch (err) {
      console.error('Failed to load user AI consent:', err);
    }
  };

  const updateConfig = async (updates: Partial<AIConfig>) => {
    try {
      await aiService.updateAIConfig(updates);
      await loadAIConfig();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const setUserConsent = async (consent: boolean) => {
    if (!user?.id) return;
    
    try {
      await aiService.updateUserAIConsent(user.id, consent);
      setUserConsentState(consent);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const isAIEnabled = config?.enabled && userConsent;

  const value: AIContextType = {
    config,
    isAIEnabled,
    userConsent,
    loading,
    error,
    updateConfig,
    setUserConsent,
    features: config?.features || {
      smartRoutes: false,
      dynamicPricing: false,
      riskAssessment: false,
      nlpSearch: false,
      recommendations: false,
      predictive: false,
      smartMatching: false,
      conversationAI: false,
    },
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}