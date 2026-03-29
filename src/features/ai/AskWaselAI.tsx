/**
 * Ask Wasel AI
 * Intelligent assistant for corridor intelligence, route optimization, and service queries
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Sparkles,
  Send,
  User,
  Bot,
  MapPin,
  TrendingUp,
  Package,
  Car,
  DollarSign,
  Clock,
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { useTranslation } from '../../components/hooks/useTranslation';
import { getRouteBetween, calculateFare, JORDAN_MOBILITY_NETWORK } from '../../config/jordan-mobility-network';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: any;
}

const QUICK_QUESTIONS_EN = [
  "Best route from Amman to Aqaba?",
  "How much to send a package to Irbid?",
  "What's the cheapest way to travel?",
  "Find rides departing today",
  "Package tracking help",
];

const QUICK_QUESTIONS_AR = [
  "أفضل طريق من عمان للعقبة؟",
  "كم سعر إرسال طرد لإربد؟",
  "أرخص طريقة للسفر؟",
  "لاقي رحلات اليوم",
  "مساعدة في تتبع الطرد",
];

export function AskWaselAI() {
  const { t, language } = useTranslation();
  const isArabic = language === 'ar';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: isArabic 
        ? 'مرحباً! أنا مساعد واصل الذكي 🤖 اسألني عن:\n\n• أفضل الطرق والمسارات\n• أسعار التوصيل والرحلات\n• تتبع الطرود\n• حجز المقاعد\n• أي شي تاني!'
        : 'Hi! I\'m Wasel AI Assistant 🤖 Ask me about:\n\n• Best routes and corridors\n• Prices and fares\n• Package tracking\n• Seat booking\n• Anything else!',
      timestamp: new Date(),
      suggestions: isArabic ? QUICK_QUESTIONS_AR : QUICK_QUESTIONS_EN,
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate AI response
    const aiResponse = generateAIResponse(messageText);
    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const generateAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();

    // Route queries
    if (lowerQuery.includes('route') || lowerQuery.includes('طريق') || lowerQuery.includes('مسار')) {
      const cities = extractCities(query);
      if (cities.length === 2) {
        const route = getRouteBetween(cities[0], cities[1]);
        if (route) {
          return {
            id: Date.now().toString(),
            type: 'ai',
            content: isArabic 
              ? `🚗 طريق ${route.origin} → ${route.destination}\n\n📍 المسافة: ${route.distance} كم\n⏱️ المدة: ${route.duration} دقيقة\n💰 السعر المتوقع: ${route.baseFare} دينار\n\nهذا ${route.popularity === 'high' ? 'طريق شائع جداً' : 'طريق متوسط الشهرة'}!`
              : `🚗 Route ${route.origin} → ${route.destination}\n\n📍 Distance: ${route.distance} km\n⏱️ Duration: ${route.duration} min\n💰 Estimated fare: JOD ${route.baseFare}\n\nThis is a ${route.popularity === 'high' ? 'very popular' : 'moderately popular'} route!`,
            timestamp: new Date(),
            data: route,
            suggestions: isArabic 
              ? [`لاقي رحلات ${route.origin} → ${route.destination}`, 'اعرض كل الطرق', 'كم السعر بالظبط؟']
              : [`Find rides ${route.origin} → ${route.destination}`, 'Show all routes', 'What\'s the exact price?'],
          };
        }
      }
    }

    // Price queries
    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('سعر') || lowerQuery.includes('كم')) {
      const cities = extractCities(query);
      if (cities.length === 2) {
        const route = getRouteBetween(cities[0], cities[1]);
        if (route) {
          const carpoolFare = calculateFare(route.distance, 1, 'carpooling');
          const onDemandFare = calculateFare(route.distance, 1, 'on-demand');
          
          return {
            id: Date.now().toString(),
            type: 'ai',
            content: isArabic 
              ? `💰 الأسعار من ${route.origin} → ${route.destination}:\n\n🚗 مشاركة الرحلة (Carpooling):\n   ${carpoolFare} دينار للشخص\n\n⚡ حجز فوري (On-Demand):\n   ${onDemandFare} دينار\n\nوفّر ${((onDemandFare - carpoolFare) / onDemandFare * 100).toFixed(0)}% مع المشاركة!`
              : `💰 Pricing ${route.origin} → ${route.destination}:\n\n🚗 Carpooling:\n   JOD ${carpoolFare} per person\n\n⚡ On-Demand:\n   JOD ${onDemandFare}\n\nSave ${((onDemandFare - carpoolFare) / onDemandFare * 100).toFixed(0)}% with carpooling!`,
            timestamp: new Date(),
            suggestions: isArabic 
              ? ['لاقي رحلة رخيصة', 'وفّر رحلة', 'ابعث طرد']
              : ['Find cheap ride', 'Offer ride', 'Send package'],
          };
        }
      }
    }

    // Package queries
    if (lowerQuery.includes('package') || lowerQuery.includes('طرد') || lowerQuery.includes('توصيل')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: isArabic 
          ? `📦 خدمة توصيل الطرود:\n\n• صغير: 3 دنانير\n• متوسط: 5 دنانير\n• كبير: 8 دنانير\n\n✅ تتبع مباشر بكود QR\n✅ تأمين 1% من القيمة\n✅ دفع آمن (محفوظ لحد التسليم)\n✅ صور تحقق من الاستلام والتسليم\n\nجاهز تبعث طردك؟`
          : `📦 Package Delivery Service:\n\n• Small: JOD 3\n• Medium: JOD 5\n• Large: JOD 8\n\n✅ Live tracking with QR code\n✅ 1% insurance on value\n✅ Secure payment (held until delivery)\n✅ Pickup & delivery photo verification\n\nReady to send your package?`,
        timestamp: new Date(),
        suggestions: isArabic 
          ? ['ابعث طرد', 'تتبع طرد', 'كيف يشتغل التتبع؟']
          : ['Send package', 'Track package', 'How does tracking work?'],
      };
    }

    // Tracking queries
    if (lowerQuery.includes('track') || lowerQuery.includes('تتبع') || lowerQuery.includes('وين')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: isArabic 
          ? `🔍 تتبع الطرد:\n\n1️⃣ كل طرد له رمز تتبع فريد (مثال: WSL-PKG-A1B2C3)\n2️⃣ كود QR للتحقق من الاستلام والتسليم\n3️⃣ تحديث مباشر للموقع GPS\n4️⃣ إشعارات فورية بكل خطوة\n5️⃣ صور من الاستلام والتسليم\n\nعندك رمز تتبع؟ احكيلي إياه وأعرضلك التفاصيل!`
          : `🔍 Package Tracking:\n\n1️⃣ Each package has a unique code (e.g., WSL-PKG-A1B2C3)\n2️⃣ QR code for pickup/delivery verification\n3️⃣ Live GPS location updates\n4️⃣ Instant notifications at every step\n5️⃣ Photos from pickup & delivery\n\nHave a tracking code? Share it and I'll show you the details!`,
        timestamp: new Date(),
        suggestions: isArabic 
          ? ['طرودي', 'ابعث طرد جديد', 'كيف أدفع؟']
          : ['My packages', 'Send new package', 'How do I pay?'],
      };
    }

    // Corridor intelligence
    if (lowerQuery.includes('best') || lowerQuery.includes('popular') || lowerQuery.includes('أفضل') || lowerQuery.includes('شائع')) {
      const popularRoutes = JORDAN_MOBILITY_NETWORK.filter(r => r.popularity === 'high');
      const routesList = popularRoutes.slice(0, 5).map(r => 
        isArabic 
          ? `• ${r.originAr} → ${r.destinationAr} (${r.distance} كم، ${r.baseFare} دينار)`
          : `• ${r.origin} → ${r.destination} (${r.distance} km, JOD ${r.baseFare})`
      ).join('\n');

      return {
        id: Date.now().toString(),
        type: 'ai',
        content: isArabic 
          ? `🔥 أشهر الطرق في الأردن:\n\n${routesList}\n\nهذي الطرق عليها طلب عالي ودايماً في رحلات متاحة!`
          : `🔥 Most Popular Routes in Jordan:\n\n${routesList}\n\nThese routes have high demand with rides available daily!`,
        timestamp: new Date(),
        suggestions: isArabic 
          ? ['لاقي رحلة', 'وفّر رحلة', 'كل الطرق']
          : ['Find ride', 'Offer ride', 'All routes'],
      };
    }

    // Default response
    return {
      id: Date.now().toString(),
      type: 'ai',
      content: isArabic 
        ? `شكراً لسؤالك! أقدر أساعدك في:\n\n🗺️ معلومات عن الطرق والمسارات\n💰 الأسعار والتكاليف\n📦 توصيل الطرود وتتبعها\n🚗 حجز الرحلات والمقاعد\n\nحاول تسأل سؤال محدد أكثر!`
        : `Thanks for asking! I can help you with:\n\n🗺️ Route and corridor information\n💰 Prices and costs\n📦 Package delivery and tracking\n🚗 Ride booking and seats\n\nTry asking a more specific question!`,
      timestamp: new Date(),
      suggestions: isArabic ? QUICK_QUESTIONS_AR : QUICK_QUESTIONS_EN,
    };
  };

  const extractCities = (text: string): string[] => {
    const cities = ['Amman', 'Irbid', 'Zarqa', 'Aqaba', 'Jerash', 'Ajloun', 'Madaba', 'Karak', 'Tafila', "Ma'an", 'Mafraq'];
    const arabicCities = ['عمان', 'إربد', 'الزرقاء', 'العقبة', 'جرش', 'عجلون', 'مادبا', 'الكرك', 'الطفيلة', 'معان', 'المفرق'];
    
    const found: string[] = [];
    cities.forEach(city => {
      if (text.toLowerCase().includes(city.toLowerCase())) {
        found.push(city);
      }
    });
    
    return found;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold">
              {isArabic ? 'اسأل واصل AI' : 'Ask Wasel AI'}
            </h2>
            <p className="text-xs text-purple-100">
              {isArabic ? 'مساعدك الذكي للطرق والتوصيل' : 'Your intelligent mobility assistant'}
            </p>
          </div>
          <Badge className="ml-auto bg-white/20 text-white">Beta</Badge>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                message.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={cn(
                "max-w-[80%] space-y-2",
                message.type === 'user' ? 'items-end' : 'items-start'
              )}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 whitespace-pre-wrap",
                  message.type === 'user'
                    ? 'bg-teal-600 text-white rounded-br-none'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                )}>
                  {message.content}
                </div>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="text-xs px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {message.type === 'user' && (
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isArabic ? 'اكتب سؤالك هنا...' : 'Type your question...'}
            className="flex-1"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
