/**
 * AI Feature Hooks for Wasel
 * 
 * Custom hooks that integrate AI capabilities into existing components
 * without requiring UI changes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { aiService, AIResponse } from '../services/aiService';
import { useAI } from '../contexts/AIContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// ============ SMART ROUTE SUGGESTIONS ============

export function useSmartRoutes() {
  const { isAIEnabled, features } = useAI();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();

  const getSuggestions = useCallback(async (input: string, userLocation?: { lat: number; lng: number }) => {
    if (!isAIEnabled || !features.smartRoutes || input.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await aiService.getSmartRouteSuggestions(input, { userLocation });
        if (response.success && response.data) {
          setSuggestions(response.data);
        }
      } catch (error) {
        console.error('Smart routes error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [isAIEnabled, features.smartRoutes]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, loading, getSuggestions, clearSuggestions };
}

// ============ DYNAMIC PRICING ============

export function useDynamicPricing() {
  const { isAIEnabled, features } = useAI();
  const { user } = useAuth();
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculatePrice = useCallback(async (tripData: {
    from: string;
    to: string;
    distance_km: number;
    departureTime: string;
    seats: number;
    tripType: 'passenger' | 'package';
  }) => {
    if (!isAIEnabled || !features.dynamicPricing) {
      // Return null to indicate fallback to standard pricing
      return null;
    }

    setLoading(true);
    try {
      const response = await aiService.getDynamicPricing(tripData, {
        userId: user?.id,
      });
      
      if (response.success && response.data) {
        setPricing({
          ...response.data,
          confidence: response.confidence,
          source: response.source,
        });
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Dynamic pricing error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, features.dynamicPricing, user?.id]);

  return { pricing, loading, calculatePrice };
}

// ============ RISK ASSESSMENT ============

export function useRiskAssessment() {
  const { isAIEnabled, features } = useAI();
  const { user } = useAuth();

  const assessRisk = useCallback(async (
    action: 'signup' | 'booking' | 'profile_update' | 'payment',
    data: any
  ) => {
    if (!isAIEnabled || !features.riskAssessment) {
      // Return safe score to allow action
      return { riskScore: 0.1, flags: [], recommendation: 'allow' };
    }

    try {
      const response = await aiService.assessRisk(action, data, {
        userId: user?.id,
      });
      
      return response.data || { riskScore: 0.5, flags: [], recommendation: 'review' };
    } catch (error) {
      console.error('Risk assessment error:', error);
      return { riskScore: 0.3, flags: [], recommendation: 'allow' };
    }
  }, [isAIEnabled, features.riskAssessment, user?.id]);

  return { assessRisk };
}

// ============ NATURAL LANGUAGE SEARCH ============

export function useNLPSearch() {
  const { isAIEnabled, features } = useAI();
  const { language } = useLanguage();
  const [parsedQuery, setParsedQuery] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const parseQuery = useCallback(async (query: string) => {
    if (!isAIEnabled || !features.nlpSearch || query.length < 5) {
      return null;
    }

    setLoading(true);
    try {
      const response = await aiService.parseNaturalLanguageQuery(query, language);
      if (response.success && response.data) {
        setParsedQuery(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('NLP search error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, features.nlpSearch, language]);

  return { parsedQuery, loading, parseQuery };
}

// ============ PERSONALIZED RECOMMENDATIONS ============

export function usePersonalizedRecommendations() {
  const { isAIEnabled, features } = useAI();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = useCallback(async (context?: {
    currentLocation?: { lat: number; lng: number };
    timeOfDay?: string;
  }) => {
    if (!isAIEnabled || !features.recommendations || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const response = await aiService.getPersonalizedRecommendations(user.id, context);
      if (response.success && response.data) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, features.recommendations, user?.id]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return { recommendations, loading, loadRecommendations };
}

// ============ PREDICTIVE INSIGHTS ============

export function usePredictiveInsights() {
  const { isAIEnabled, features } = useAI();
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getInsights = useCallback(async (
    type: 'demand' | 'pricing' | 'optimal_time',
    route: { from: string; to: string },
    targetDate?: string
  ) => {
    if (!isAIEnabled || !features.predictive) {
      return null;
    }

    setLoading(true);
    try {
      const response = await aiService.getPredictiveInsights(type, route, targetDate);
      if (response.success && response.data) {
        setInsights(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Predictive insights error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, features.predictive]);

  return { insights, loading, getInsights };
}

// ============ SMART MATCHING ============

export function useSmartMatching() {
  const { isAIEnabled, features } = useAI();
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const findMatches = useCallback(async (searchCriteria: {
    from: string;
    to: string;
    date: string;
    seats: number;
    preferences?: any;
  }) => {
    if (!isAIEnabled || !features.smartMatching) {
      // Return empty to use standard search
      return [];
    }

    setLoading(true);
    try {
      const response = await aiService.getSmartMatches(searchCriteria, user?.id);
      if (response.success && response.data) {
        setMatches(response.data);
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Smart matching error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, features.smartMatching, user?.id]);

  return { matches, loading, findMatches };
}

// ============ CONVERSATION AI ============

export function useConversationAI() {
  const { isAIEnabled, features } = useAI();
  const { language } = useLanguage();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const getSuggestions = useCallback(async (
    conversationHistory: Array<{ sender: string; message: string; timestamp: string }>,
    tripId?: string
  ) => {
    if (!isAIEnabled || !features.conversationAI) {
      return [];
    }

    setLoading(true);
    try {
      const response = await aiService.getConversationSuggestions(conversationHistory, {
        tripId,
        language,
      });
      
      if (response.success && response.data?.suggestions) {
        setSuggestions(response.data.suggestions);
        return response.data.suggestions;
      }
      return [];
    } catch (error) {
      console.error('Conversation AI error:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, features.conversationAI, language]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, loading, getSuggestions, clearSuggestions };
}

// ============ COMBINED AI INSIGHTS ============

/**
 * Hook that provides aggregated AI insights for dashboard
 */
export function useAIDashboardInsights() {
  const { isAIEnabled } = useAI();
  const { user } = useAuth();
  const [insights, setInsights] = useState<{
    recommendations: any[];
    trendingRoutes: any[];
    priceAlerts: any[];
    safetyScore: number;
  }>({
    recommendations: [],
    trendingRoutes: [],
    priceAlerts: [],
    safetyScore: 100,
  });
  const [loading, setLoading] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!isAIEnabled || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      // Load multiple AI insights in parallel
      const [recsResponse, trendsResponse] = await Promise.all([
        aiService.getPersonalizedRecommendations(user.id),
        aiService.getPredictiveInsights('demand', { from: '', to: '' }),
      ]);

      setInsights({
        recommendations: recsResponse.data || [],
        trendingRoutes: trendsResponse.data?.prediction || [],
        priceAlerts: [],
        safetyScore: 100,
      });
    } catch (error) {
      console.error('Dashboard insights error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAIEnabled, user?.id]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return { insights, loading, reload: loadInsights };
}

// ============ AI EVENT TRACKING ============

/**
 * Hook for tracking AI interactions and user behavior
 * Used for model improvement and analytics
 */
export function useAITracking() {
  const { isAIEnabled } = useAI();
  const { user } = useAuth();

  const trackEvent = useCallback(async (
    eventType: string,
    eventData: any,
    aiResponse?: AIResponse<any>
  ) => {
    if (!isAIEnabled) return;

    try {
      // Send tracking event to backend
      const trackingData = {
        userId: user?.id,
        eventType,
        eventData,
        aiResponse: aiResponse ? {
          confidence: aiResponse.confidence,
          source: aiResponse.source,
          latency: aiResponse.latency,
        } : null,
        timestamp: new Date().toISOString(),
      };

      // TODO: Send to analytics endpoint
      console.log('[AI Tracking]', trackingData);
    } catch (error) {
      console.error('AI tracking error:', error);
    }
  }, [isAIEnabled, user?.id]);

  return { trackEvent };
}