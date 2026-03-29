/**
 * AI Service Layer for Wassel
 * 
 * Production-ready AI integration service that handles:
 * - Smart route suggestions
 * - Dynamic pricing optimization
 * - Risk assessment and fraud detection
 * - Natural language search
 * - Personalized recommendations
 * - Predictive analytics
 * - Smart matching algorithms
 * - Conversation AI for messaging
 * 
 * @architecture
 * - Backend API endpoints handle model inference
 * - Frontend sends events and receives AI responses
 * - Session-aware with user context
 * - Latency-safe with fallback mechanisms
 */

import { supabase } from './api';

// ============ TYPES & INTERFACES ============

export interface AIConfig {
  enabled: boolean;
  features: {
    smartRoutes: boolean;
    dynamicPricing: boolean;
    riskAssessment: boolean;
    nlpSearch: boolean;
    recommendations: boolean;
    predictive: boolean;
    smartMatching: boolean;
    conversationAI: boolean;
  };
  models: {
    routeOptimization: string;
    pricingModel: string;
    riskModel: string;
    nlpModel: string;
    recommendationModel: string;
  };
  thresholds: {
    riskScore: number;
    matchConfidence: number;
    pricingConfidence: number;
  };
}

export interface AIRequest {
  feature: string;
  input: any;
  context?: {
    userId?: string;
    sessionId?: string;
    language?: string;
    timestamp?: string;
    deviceType?: 'web' | 'ios' | 'android';
  };
  options?: {
    timeout?: number;
    fallback?: boolean;
    cacheEnabled?: boolean;
  };
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  confidence?: number;
  source: 'ai' | 'rule-based' | 'cached';
  latency: number;
  metadata?: {
    modelVersion?: string;
    processingTime?: number;
    fallbackReason?: string;
  };
  error?: string;
}

export interface AILog {
  id: string;
  feature: string;
  userId?: string;
  input: any;
  output: any;
  confidence?: number;
  latency: number;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
}

// ============ AI CONFIGURATION ============

const DEFAULT_CONFIG: AIConfig = {
  enabled: true,
  features: {
    smartRoutes: true,
    dynamicPricing: true,
    riskAssessment: true,
    nlpSearch: true,
    recommendations: true,
    predictive: true,
    smartMatching: true,
    conversationAI: true,
  },
  models: {
    routeOptimization: 'gpt-4-turbo',
    pricingModel: 'xgboost-v2',
    riskModel: 'random-forest-v3',
    nlpModel: 'bert-multilingual',
    recommendationModel: 'collaborative-filtering-v2',
  },
  thresholds: {
    riskScore: 0.7,
    matchConfidence: 0.6,
    pricingConfidence: 0.8,
  },
};

// ============ HELPER FUNCTIONS ============

async function getAuthDetails() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    token: session?.access_token,
    userId: session?.user?.id,
  };
}

function createAIEndpoint(path: string): string {
  const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || 'https://ai.wasel.jo/v1';
  return `${AI_BASE_URL}${path}`;
}

async function makeAIRequest<T>(
  endpoint: string,
  request: AIRequest,
  timeout: number = 5000
): Promise<AIResponse<T>> {
  const startTime = Date.now();
  const { token, userId } = await getAuthDetails();

  try {
    const controller = new AbortController();
    // Use a custom error for timeout to identify it clearly
    const timeoutId = setTimeout(() => {
        const timeoutError = new Error('AI Request Timeout');
        timeoutError.name = 'TimeoutError'; 
        controller.abort(timeoutError);
    }, timeout);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-User-ID': userId || '',
        'X-Language': request.context?.language || 'en',
        'X-Device-Type': request.context?.deviceType || 'web',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    // Log the AI interaction
    logAIInteraction({
      feature: request.feature,
      userId,
      input: request.input,
      output: data,
      confidence: data.confidence,
      latency,
      success: true,
    });

    return {
      success: true,
      data: data.result,
      confidence: data.confidence,
      source: data.source || 'ai',
      latency,
      metadata: data.metadata,
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;

    // Handle AbortError or TimeoutError
    const isTimeout = error.name === 'AbortError' || 
                      error.name === 'TimeoutError' || 
                      error.message?.includes('aborted') || 
                      error.message?.includes('Timeout');

    // Log the failure
    logAIInteraction({
      feature: request.feature,
      userId,
      input: request.input,
      output: null,
      latency,
      success: false,
      errorMessage: error.message,
    });

    if (isTimeout) {
      return {
        success: false,
        error: 'Request timeout',
        source: 'rule-based',
        latency,
        metadata: { fallbackReason: 'timeout' },
      };
    }

    return {
      success: false,
      error: error.message,
      source: 'rule-based',
      latency,
    };
  }
}

// ============ AI LOGGING ============

async function logAIInteraction(log: Omit<AILog, 'id' | 'timestamp'>) {
  try {
    const logEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...log,
    };

    // Store in Supabase for analytics
    await supabase.from('ai_logs').insert([logEntry]);
  } catch (error) {
    console.error('Failed to log AI interaction:', error);
  }
}

// ============ AI FEATURES ============

/**
 * Smart Route Suggestions
 * AI Trigger: User starts typing in origin/destination fields
 * AI Input: Partial text, user location, historical data
 * AI Processing: NLP + geospatial model
 * AI Output: Ranked list of suggested locations
 * AI Fallback: Fuzzy text matching on database locations
 */
export async function getSmartRouteSuggestions(
  input: string,
  context?: { userLocation?: { lat: number; lng: number }; language?: string }
): Promise<AIResponse<Array<{ location: string; type: string; confidence: number }>>> {
  const request: AIRequest = {
    feature: 'smart_routes',
    input: {
      query: input,
      userLocation: context?.userLocation,
    },
    context: {
      language: context?.language,
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 2000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<Array<{ location: string; type: string; confidence: number }>>(
    createAIEndpoint('/routes/suggest'),
    request,
    2000
  );

  // Fallback to rule-based suggestion
  if (!response.success) {
    const fallbackSuggestions = getFallbackRouteSuggestions(input);
    return {
      ...response,
      data: fallbackSuggestions,
      source: 'rule-based',
    };
  }

  return response;
}

function getFallbackRouteSuggestions(input: string) {
  const commonLocations = [
    'Dubai', 'Abu Dhabi', 'Riyadh', 'Jeddah', 'Cairo',
    'Alexandria', 'Doha', 'Kuwait City', 'Manama', 'Muscat',
  ];
  return commonLocations
    .filter((loc) => loc.toLowerCase().includes(input.toLowerCase()))
    .slice(0, 5)
    .map((location) => ({
      location,
      type: 'city',
      confidence: 0.5,
    }));
}

/**
 * Dynamic Pricing Optimization
 * AI Trigger: Trip creation, route calculation
 * AI Input: Distance, time, demand, historical prices, user type
 * AI Processing: XGBoost pricing model
 * AI Output: Optimized price with confidence interval
 * AI Fallback: Distance-based formula (base + per_km)
 */
export async function getDynamicPricing(
  tripData: {
    from: string;
    to: string;
    distance_km: number;
    departureTime: string;
    seats: number;
    tripType: 'passenger' | 'package';
  },
  userContext?: {
    userId?: string;
    reputation?: number;
  }
): Promise<AIResponse<{ price: number; currency: string; breakdown: any }>> {
  const request: AIRequest = {
    feature: 'dynamic_pricing',
    input: {
      ...tripData,
      userReputation: userContext?.reputation,
      timestamp: new Date().toISOString(),
    },
    context: {
      userId: userContext?.userId,
    },
    options: {
      timeout: 3000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<{ price: number; currency: string; breakdown: any }>(
    createAIEndpoint('/pricing/optimize'),
    request,
    3000
  );

  // Fallback to simple distance-based pricing
  if (!response.success) {
    const fallbackPrice = calculateFallbackPrice(tripData);
    return {
      ...response,
      data: fallbackPrice,
      source: 'rule-based',
    };
  }

  return response;
}

function calculateFallbackPrice(tripData: any) {
  const BASE_PRICE = 1;
  const PER_KM = 0.15;
  const PACKAGE_MULTIPLIER = 1.3;

  let price = BASE_PRICE + tripData.distance_km * PER_KM;
  if (tripData.tripType === 'package') {
    price *= PACKAGE_MULTIPLIER;
  }

  return {
    price: Math.round(price * 100) / 100,
    currency: 'JOD',
    breakdown: {
      base: BASE_PRICE,
      distance: tripData.distance_km * PER_KM,
      multiplier: tripData.tripType === 'package' ? PACKAGE_MULTIPLIER : 1,
    },
  };
}

/**
 * Risk Assessment & Fraud Detection
 * AI Trigger: User signup, booking creation, profile updates
 * AI Input: User behavior, device fingerprint, transaction patterns
 * AI Processing: Random Forest anomaly detection
 * AI Output: Risk score (0-1) with flagged behaviors
 * AI Fallback: Basic rule-based checks (email validation, phone verification)
 */
export async function assessRisk(
  action: 'signup' | 'booking' | 'profile_update' | 'payment',
  data: any,
  userContext?: {
    userId?: string;
    accountAge?: number;
    previousFlags?: number;
  }
): Promise<AIResponse<{ riskScore: number; flags: string[]; recommendation: string }>> {
  const request: AIRequest = {
    feature: 'risk_assessment',
    input: {
      action,
      data,
      accountAge: userContext?.accountAge,
      previousFlags: userContext?.previousFlags,
    },
    context: {
      userId: userContext?.userId,
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 2000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<{ riskScore: number; flags: string[]; recommendation: string }>(
    createAIEndpoint('/risk/assess'),
    request,
    2000
  );

  // Fallback to basic validation
  if (!response.success) {
    const fallbackRisk = calculateFallbackRisk(action, data);
    return {
      ...response,
      data: fallbackRisk,
      source: 'rule-based',
    };
  }

  return response;
}

function calculateFallbackRisk(action: string, data: any) {
  let riskScore = 0.1;
  const flags: string[] = [];

  // Basic validation rules
  if (action === 'signup') {
    if (!data.email?.includes('@')) {
      riskScore += 0.3;
      flags.push('invalid_email');
    }
    if (!data.phone) {
      riskScore += 0.2;
      flags.push('missing_phone');
    }
  }

  return {
    riskScore: Math.min(riskScore, 1),
    flags,
    recommendation: riskScore > 0.5 ? 'require_verification' : 'allow',
  };
}

/**
 * Natural Language Search
 * AI Trigger: Search query submission
 * AI Input: Free-text query in English or Arabic
 * AI Processing: BERT multilingual NLP model
 * AI Output: Structured search parameters
 * AI Fallback: Keyword extraction and fuzzy matching
 */
export async function parseNaturalLanguageQuery(
  query: string,
  language: 'en' | 'ar'
): Promise<AIResponse<{ from?: string; to?: string; date?: string; seats?: number; preferences?: any }>> {
  const request: AIRequest = {
    feature: 'nlp_search',
    input: {
      query,
      language,
    },
    context: {
      language,
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 2000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<any>(
    createAIEndpoint('/nlp/parse'),
    request,
    2000
  );

  // Fallback to keyword extraction
  if (!response.success) {
    const fallbackParsing = extractKeywords(query);
    return {
      ...response,
      data: fallbackParsing,
      source: 'rule-based',
    };
  }

  return response;
}

function extractKeywords(query: string) {
  const locations = ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Salt'];
  const found: any = {};

  locations.forEach((loc) => {
    if (query.toLowerCase().includes(loc.toLowerCase())) {
      if (!found.from) {
        found.from = loc;
      } else {
        found.to = loc;
      }
    }
  });

  return found;
}

/**
 * Personalized Recommendations
 * AI Trigger: Dashboard load, trip search results
 * AI Input: User history, preferences, location, time
 * AI Processing: Collaborative filtering + content-based
 * AI Output: Ranked list of recommended trips/routes
 * AI Fallback: Popular routes based on frequency
 */
export async function getPersonalizedRecommendations(
  userId: string,
  context?: {
    currentLocation?: { lat: number; lng: number };
    timeOfDay?: string;
  }
): Promise<AIResponse<Array<{ tripId?: string; route: string; reason: string; score: number }>>> {
  const request: AIRequest = {
    feature: 'recommendations',
    input: {
      currentLocation: context?.currentLocation,
      timeOfDay: context?.timeOfDay,
    },
    context: {
      userId,
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 3000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<Array<any>>(
    createAIEndpoint('/recommendations/personalized'),
    request,
    3000
  );

  // Fallback to popular routes
  if (!response.success) {
    const fallbackRecs = getPopularRoutes();
    return {
      ...response,
      data: fallbackRecs,
      source: 'rule-based',
    };
  }

  return response;
}

function getPopularRoutes() {
  return [
    { route: 'Amman → Zarqa', reason: 'Most popular route', score: 0.9 },
    { route: 'Riyadh → Jeddah', reason: 'Frequently traveled', score: 0.85 },
    { route: 'Cairo → Alexandria', reason: 'High demand', score: 0.8 },
  ];
}

/**
 * Predictive Analytics
 * AI Trigger: User interaction patterns, time-based events
 * AI Input: Historical trip data, seasonal patterns, events
 * AI Processing: Time series forecasting (LSTM)
 * AI Output: Predicted demand, optimal times, price trends
 * AI Fallback: Simple moving averages
 */
export async function getPredictiveInsights(
  type: 'demand' | 'pricing' | 'optimal_time',
  route: { from: string; to: string },
  targetDate?: string
): Promise<AIResponse<{ prediction: any; confidence: number; factors: string[] }>> {
  const request: AIRequest = {
    feature: 'predictive_analytics',
    input: {
      type,
      route,
      targetDate: targetDate || new Date().toISOString(),
    },
    context: {
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 4000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<any>(
    createAIEndpoint('/analytics/predict'),
    request,
    4000
  );

  // Fallback to simple heuristics
  if (!response.success) {
    const fallbackPrediction = calculateSimplePrediction(type, route);
    return {
      ...response,
      data: fallbackPrediction,
      source: 'rule-based',
    };
  }

  return response;
}

function calculateSimplePrediction(type: string, route: any) {
  if (type === 'demand') {
    return {
      prediction: 'medium',
      confidence: 0.5,
      factors: ['historical_average'],
    };
  }
  return {
    prediction: null,
    confidence: 0.3,
    factors: [],
  };
}

/**
 * Smart Matching Algorithm
 * AI Trigger: New trip posted or new search performed
 * AI Input: Trip details, user preferences, historical matches
 * AI Processing: Graph neural network matching
 * AI Output: Ranked matches with compatibility scores
 * AI Fallback: Simple route + time + seats matching
 */
export async function getSmartMatches(
  searchCriteria: {
    from: string;
    to: string;
    date: string;
    seats: number;
    preferences?: any;
  },
  userId?: string
): Promise<AIResponse<Array<{ tripId: string; matchScore: number; reasons: string[] }>>> {
  const request: AIRequest = {
    feature: 'smart_matching',
    input: searchCriteria,
    context: {
      userId,
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 3000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<Array<any>>(
    createAIEndpoint('/matching/smart'),
    request,
    3000
  );

  // Fallback to basic matching (handled by existing searchTrips API)
  if (!response.success) {
    return {
      ...response,
      data: [],
      source: 'rule-based',
      metadata: { fallbackReason: 'Use existing search API' },
    };
  }

  return response;
}

/**
 * Conversation AI
 * AI Trigger: Message composition, auto-reply suggestions
 * AI Input: Conversation history, message context, user intent
 * AI Processing: GPT-4 conversation model with context
 * AI Output: Suggested replies, translated messages, sentiment
 * AI Fallback: Template-based quick replies
 */
export async function getConversationSuggestions(
  conversationHistory: Array<{ sender: string; message: string; timestamp: string }>,
  context?: {
    tripId?: string;
    language?: string;
  }
): Promise<AIResponse<{ suggestions: string[]; sentiment?: string; translation?: string }>> {
  const request: AIRequest = {
    feature: 'conversation_ai',
    input: {
      history: conversationHistory,
      tripId: context?.tripId,
    },
    context: {
      language: context?.language,
      timestamp: new Date().toISOString(),
    },
    options: {
      timeout: 2000,
      fallback: true,
    },
  };

  const response = await makeAIRequest<any>(
    createAIEndpoint('/conversation/suggest'),
    request,
    2000
  );

  // Fallback to template replies
  if (!response.success) {
    const fallbackSuggestions = getTemplateReplies(context?.language || 'en');
    return {
      ...response,
      data: { suggestions: fallbackSuggestions },
      source: 'rule-based',
    };
  }

  return response;
}

function getTemplateReplies(language: string) {
  if (language === 'ar') {
    return ['شكراً لك', 'حسناً، أتفهم', 'سأكون هناك في الوقت المحدد'];
  }
  return ['Thank you', 'Sounds good', "I'll be there on time"];
}

/**
 * AI Configuration Management
 */
export async function getAIConfig(): Promise<AIConfig> {
  try {
    const { data } = await supabase
      .from('ai_config')
      .select('*')
      .single();

    return data || DEFAULT_CONFIG;
  } catch (error) {
    console.error('Failed to load AI config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function updateAIConfig(config: Partial<AIConfig>): Promise<void> {
  try {
    await supabase
      .from('ai_config')
      .upsert({ ...DEFAULT_CONFIG, ...config });
  } catch (error) {
    console.error('Failed to update AI config:', error);
    throw error;
  }
}

/**
 * User Consent Management
 */
export async function getUserAIConsent(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('user_preferences')
      .select('ai_enabled')
      .eq('user_id', userId)
      .single();

    return data?.ai_enabled ?? true; // Default to enabled
  } catch (error) {
    return true;
  }
}

export async function updateUserAIConsent(userId: string, consent: boolean): Promise<void> {
  try {
    await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, ai_enabled: consent });
  } catch (error) {
    console.error('Failed to update AI consent:', error);
    throw error;
  }
}

// ============ EXPORTS ============

export const aiService = {
  // Route & Location
  getSmartRouteSuggestions,
  
  // Pricing
  getDynamicPricing,
  
  // Safety & Risk
  assessRisk,
  
  // Search
  parseNaturalLanguageQuery,
  
  // Recommendations
  getPersonalizedRecommendations,
  
  // Analytics
  getPredictiveInsights,
  
  // Matching
  getSmartMatches,
  
  // Messaging
  getConversationSuggestions,
  
  // Configuration
  getAIConfig,
  updateAIConfig,
  
  // Consent
  getUserAIConsent,
  updateUserAIConsent,
};
