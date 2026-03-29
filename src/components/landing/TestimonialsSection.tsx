import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, Play, ThumbsUp, MessageSquare, CheckCircle, 
  MapPin, Calendar, Users, Award, Quote, ChevronLeft, 
  ChevronRight, Filter, TrendingUp, Heart, Shield,
  Video, Image as ImageIcon, ArrowRight, Clock, Zap,
  BadgeCheck, UserCheck, TrendingDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  quote: string;
  fullReview: string;
  author: string;
  role: string;
  route: string;
  rating: number;
  image: string;
  verified: boolean;
  tripCount: number;
  memberSince: string;
  hasVideo: boolean;
  videoThumbnail?: string;
  highlights: string[];
  savings: string;
  category: 'daily-commute' | 'long-distance' | 'airport' | 'recurring';
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "واصل وفّر عليّ أكثر من 60% على تنقلاتي الأسبوعية من السابع إلى العبدلي! Wasel saved me over 60% on my weekly Amman commute!",
    fullReview: "I've been using Wasel for 6 months now for my daily commute across Amman. Not only do I save around 35 JOD per month, but I've also met wonderful professionals along the way. The AI matching pairs me with like-minded colleagues, and the rides have become a real networking opportunity. Safety features and verified drivers give me complete peace of mind.",
    author: "أحمد خ.",
    role: "Business Consultant",
    route: "السابع → العبدلي",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=400&h=400",
    verified: true,
    tripCount: 142,
    memberSince: "March 2025",
    hasVideo: true,
    videoThumbnail: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?fit=crop&w=800&h=450",
    highlights: ["Professional drivers", "60% cost savings", "Networking opportunity"],
    savings: "35 JOD/month",
    category: 'daily-commute'
  },
  {
    id: 2,
    quote: "خدمة الحافلة المدرسية المصغّرة رائعة! أطفالي في أمان تام. The micro-school bus subscription is a game-changer for our family!",
    fullReview: "As a working parent in Amman, the Micro-School Bus subscription has completely transformed our mornings. My kids are picked up from our home near Khalda and dropped safely at school in Mecca Street. I get live tracking updates and alerts. The monthly JOD subscription is incredibly affordable compared to private transport.",
    author: "سارة م.",
    role: "Marketing Director",
    route: "خلدا → شارع مكة",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=400&h=400",
    verified: true,
    tripCount: 87,
    memberSince: "January 2025",
    hasVideo: false,
    highlights: ["Safe school transport", "Live tracking", "Affordable subscription"],
    savings: "45 JOD/month",
    category: 'long-distance'
  },
  {
    id: 3,
    quote: "آمن، موثوق، وصديق للبيئة. واصل هو ما احتاجه الأردن. Safe, reliable, eco-friendly — exactly what Jordan needed!",
    fullReview: "I'm passionate about sustainability, and Wasel helps me reduce my carbon footprint while saving money. The app shows how much CO₂ I've saved across Amman routes — incredibly motivating. Every driver has been courteous and professional. The verified profiles and ratings give me total confidence.",
    author: "عمر أ.",
    role: "Environmental Engineer",
    route: "عمان → الزرقاء",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=400&h=400",
    verified: true,
    tripCount: 64,
    memberSince: "February 2025",
    hasVideo: true,
    videoThumbnail: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?fit=crop&w=800&h=450",
    highlights: ["Eco-friendly option", "Professional drivers", "Transparent ratings"],
    savings: "520 kg CO₂ saved",
    category: 'recurring'
  },
  {
    id: 4,
    quote: "المحفظة الرقمية بالدينار الأردني ميزة لا غنى عنها! The JOD digital wallet is a must-have feature for daily payments!",
    fullReview: "I use Wasel's JOD wallet for all my transport payments. No more cash fumbling or exchange hassles. Top-up is instant through local banks, and I can split payments with colleagues. The fintech features make Wasel a true super-app, not just a ride-sharing platform.",
    author: "فاطمة ح.",
    role: "Sales Executive",
    route: "الدوار السابع → ماركا",
    rating: 5,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=400&h=400",
    verified: true,
    tripCount: 156,
    memberSince: "December 2024",
    hasVideo: false,
    highlights: ["JOD digital wallet", "Instant top-up", "Split payments"],
    savings: "25 JOD/month",
    category: 'airport'
  },
  {
    id: 5,
    quote: "الذكاء الاصطناعي يقترح أفضل المسارات تلقائياً. AI route suggestions have made my Amman commute effortless!",
    fullReview: "What started as a cost-saving solution has become invaluable. The AI suggests the best routes across Amman and even predicts demand spikes. I've connected with professionals in similar industries through shared rides — I even landed a client on a Wasel trip from 5th Circle to Business District!",
    author: "خالد ر.",
    role: "Tech Entrepreneur",
    route: "الدوار الخامس → منطقة الأعمال",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?fit=crop&w=400&h=400",
    verified: true,
    tripCount: 203,
    memberSince: "October 2024",
    hasVideo: true,
    videoThumbnail: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?fit=crop&w=800&h=450",
    highlights: ["AI route optimization", "Business networking", "Consistent quality"],
    savings: "40 JOD/month",
    category: 'daily-commute'
  },
  {
    id: 6,
    quote: "كمرأة أتنقل وحدها، ميزات الأمان في واصل تريحني تماماً. Safety features give me complete peace of mind!",
    fullReview: "Safety is my top priority, and Wasel exceeds all expectations. Real-time tracking, an emergency button, and verified driver profiles make me feel fully secure. I can share my trip details with family instantly. The community is respectful and professional — this is exactly what Jordan's women drivers need.",
    author: "ليلى س.",
    role: "University Professor",
    route: "عمان → البحر الميت",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fit=crop&w=400&h=400",
    verified: true,
    tripCount: 45,
    memberSince: "April 2025",
    hasVideo: false,
    highlights: ["Excellent safety features", "Respectful community", "Peace of mind"],
    savings: "30 JOD/month",
    category: 'recurring'
  }
];

// Animated Rating Stars
function AnimatedStars({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <Star 
            className={`${sizeClasses[size]} ${i < rating ? 'fill-[#ABD907] text-[#ABD907]' : 'text-gray-600'}`}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Enhanced Testimonial Card
function TestimonialCard({ testimonial, onExpand, delay }: { testimonial: Testimonial; onExpand: () => void; delay: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-card border border-border rounded-3xl overflow-hidden cursor-pointer"
      style={{
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(171, 217, 7, 0.25)' 
          : '0 10px 30px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s ease'
      }}
      onClick={() => {
        setIsExpanded(!isExpanded);
        if (!isExpanded) onExpand();
      }}
    >
      {/* Animated Background Gradient */}
      <motion.div 
        className="absolute inset-0 bg-[#ABD907]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        initial={false}
        animate={isHovered ? { scale: 1.5, rotate: 45 } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.6 }}
      />

      {/* Floating Particles on Hover */}
      {isHovered && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#ABD907]/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 - 50 + '%',
                y: '100%',
                opacity: 0,
                scale: 0
              }}
              animate={{
                y: ['-20%', '-100%'],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 p-8">
        {/* Quote Icon with Animation */}
        <motion.div 
          className="w-20 h-20 bg-[#ABD907]/10 rounded-2xl flex items-center justify-center mb-6 relative"
          animate={isHovered ? { rotate: [0, -10, 10, -10, 0], scale: 1.1 } : { rotate: 3, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Quote className="w-10 h-10 text-[#ABD907]" />
          
          {/* Pulse Ring on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 rounded-2xl bg-[#ABD907]/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Badges Row */}
        <div className="flex gap-2 mb-4">
          {testimonial.verified && (
            <div className="px-3 py-1.5 bg-[#50A612]/10 border border-[#50A612]/20 rounded-full text-xs font-bold text-[#50A612] flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3" />
              <span>VERIFIED</span>
            </div>
          )}
          {testimonial.hasVideo && (
            <div className="px-3 py-1.5 bg-[#D9965B]/10 border border-[#D9965B]/20 rounded-full text-xs font-bold text-[#D9965B] flex items-center gap-1.5">
              <Video className="w-3 h-3" />
              <span>VIDEO</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="mb-6">
          <AnimatedStars rating={testimonial.rating} size="md" />
        </div>

        {/* Quote */}
        <p className="text-slate-400 leading-relaxed mb-6 line-clamp-3">
          "{testimonial.quote}"
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            className="bg-[#04ADBF]/5 rounded-xl p-3 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-[#04ADBF] mb-1">
              {testimonial.tripCount}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Trips
            </div>
          </motion.div>
          <motion.div 
            className="bg-[#50A612]/5 rounded-xl p-3 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-xl font-bold text-[#50A612] mb-1">
              {testimonial.savings}
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Saved
            </div>
          </motion.div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 pt-6 border-t border-[#1E293B]">
          <div className="relative">
            <div className="w-14 h-14 aspect-square rounded-full overflow-hidden border-2 border-[#1E293B] flex items-center justify-center">
              <ImageWithFallback 
                src={testimonial.image} 
                alt={testimonial.author} 
                className="w-full h-full object-cover"
                style={{
                  clipPath: 'circle(50% at 50% 50%)',
                }}
              />
            </div>
            {testimonial.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#50A612] rounded-full flex items-center justify-center border-2 border-card">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base group-hover:scale-105 transition-transform origin-left">{testimonial.author}</p>
            <p className="text-slate-400 text-sm">{testimonial.role}</p>
            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
              <MapPin className="w-3 h-3" />
              <span>{testimonial.route}</span>
            </div>
          </div>
        </div>

        {/* Expandable Benefits */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#1E293B] pt-4 mt-4 space-y-3">
                {testimonial.highlights.map((highlight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-[#50A612] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{highlight}</span>
                  </motion.div>
                ))}
                
                {/* Member Since */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 pt-4 border-t border-[#1E293B]">
                  <Calendar className="w-3 h-3" />
                  <span>Member since {testimonial.memberSince}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand Indicator */}
        <motion.div 
          className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 group-hover:text-slate-300"
          animate={isExpanded ? { rotate: 180 } : { rotate: 0 }}
        >
          <span>{isExpanded ? 'Show Less' : 'Read Full Story'}</span>
          <ArrowRight className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Hover Glow Border */}
      <motion.div
        className="absolute inset-0 rounded-3xl border-2 border-[#ABD907] opacity-0 group-hover:opacity-100 pointer-events-none"
        initial={false}
        animate={isHovered ? { scale: 1.02 } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

// Expanded Testimonial Modal
function ExpandedTestimonial({ testimonial, onClose }: { testimonial: Testimonial; onClose: () => void }) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-card rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Video Thumbnail */}
        {testimonial.hasVideo && (
          <div className="relative h-64 bg-gray-900 rounded-t-3xl overflow-hidden">
            {showVideo ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-70">Video player would be embedded here</p>
                </div>
              </div>
            ) : (
              <>
                <img 
                  src={testimonial.videoThumbnail} 
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVideo(true)}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
                  </motion.button>
                </div>
              </>
            )}
          </div>
        )}

        <div className="p-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            ✕
          </button>

          {/* User Header */}
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="w-20 h-20 aspect-square rounded-full overflow-hidden border-4 border-primary/20">
                <ImageWithFallback 
                  src={testimonial.image} 
                  alt={testimonial.author} 
                  className="w-full h-full object-cover"
                  style={{
                    clipPath: 'circle(50% at 50% 50%)',
                  }}
                />
              </div>
              {testimonial.verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-foreground">{testimonial.author}</h3>
                {testimonial.verified && (
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                    VERIFIED USER
                  </span>
                )}
              </div>
              <p className="text-gray-600 font-medium mb-2">{testimonial.role}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {testimonial.route}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {testimonial.memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <AnimatedStars rating={testimonial.rating} size="lg" />
          </div>

          {/* Full Review */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-foreground mb-4">Full Review</h4>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {testimonial.fullReview}
            </p>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h4 className="text-lg font-bold text-foreground mb-4">Key Highlights</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {testimonial.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-muted-foreground font-medium">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">{testimonial.tripCount}</div>
              <div className="text-sm text-gray-600">Total Trips</div>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="text-3xl font-bold text-green-600 mb-1">{testimonial.savings}</div>
              <div className="text-sm text-gray-600">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-1">{testimonial.rating}.0</div>
              <div className="text-sm text-gray-600">Rating Given</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '', prefix = '' }: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startCount = 0;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - percentage, 4);
      const current = Math.floor(startCount + (end - startCount) * easeOutQuart);
      
      setCount(current);

      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// Live Stats Ticker
function LiveStatsTicker() {
  const stats = [
    { label: 'Total Reviews', value: 12458, icon: MessageSquare, suffix: '+', color: 'text-[#04ADBF]' },
    { label: 'Average Rating', value: 4.9, icon: Star, suffix: '/5', color: 'text-[#ABD907]' },
    { label: 'Verified Reviews', value: 98, icon: BadgeCheck, suffix: '%', color: 'text-[#50A612]' },
    { label: 'Would Recommend', value: 96, icon: ThumbsUp, suffix: '%', color: 'text-[#D9965B]' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-3xl p-8 mb-16"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="text-center"
          >
            <div className="flex justify-center mb-3">
              <div className={`w-12 h-12 ${stat.color.replace('text-', 'bg-')}/10 rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
              <AnimatedCounter 
                end={stat.value} 
                duration={2500}
                suffix={stat.suffix}
              />
            </div>
            <div className="text-sm text-slate-400 font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Main Testimonials Section
export function TestimonialsSection() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;

  const filteredTestimonials = filter === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.category === filter);

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const displayedTestimonials = filteredTestimonials.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="bg-[#0B1120] py-24 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-[#ABD907]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#04ADBF]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header with Animated Badge */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#50A612]/10 backdrop-blur-md border border-[#50A612]/20 rounded-full text-[#50A612] text-sm font-medium shadow-lg mb-6"
          >
            <Award className="w-4 h-4" />
            <span>Trusted by 50,000+ Travelers</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
          >
            ماذا يقول مجتمعنا؟ What Our Community Says
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Real stories from real travelers who transformed their commute with Wasel
          </motion.p>
        </div>

        {/* Live Stats Ticker */}
        <LiveStatsTicker />

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { label: 'All Stories', value: 'all' },
            { label: 'Daily Commute', value: 'daily-commute' },
            { label: 'Long Distance', value: 'long-distance' },
            { label: 'Airport Transfers', value: 'airport' },
            { label: 'Recurring Trips', value: 'recurring' }
          ].map((filterOption) => (
            <motion.button
              key={filterOption.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFilter(filterOption.value);
                setCurrentPage(0);
              }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                filter === filterOption.value
                  ? 'bg-[#ABD907] text-[#0B1120] shadow-lg'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
              }`}
            >
              {filterOption.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage + filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {displayedTestimonials.map((testimonial, idx) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                onExpand={() => setSelectedTestimonial(testimonial)}
                delay={idx * 0.15}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentPage === 0
                  ? 'bg-card text-muted-foreground cursor-not-allowed'
                  : 'bg-[#ABD907] text-[#0B1120] hover:bg-[#ABD907]/90 shadow-lg'
              }`}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentPage(idx)}
                  className={`h-3 rounded-full transition-all ${
                    currentPage === idx
                      ? 'bg-[#ABD907] w-8'
                      : 'bg-[#1E293B] hover:bg-[#1E293B]/70 w-3'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentPage === totalPages - 1
                  ? 'bg-card text-muted-foreground cursor-not-allowed'
                  : 'bg-[#ABD907] text-[#0B1120] hover:bg-[#ABD907]/90 shadow-lg'
              }`}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </div>
        )}

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Award, label: '12K+ Reviews', color: 'text-[#ABD907]' },
            { icon: Shield, label: '100% Verified', color: 'text-[#04ADBF]' },
            { icon: ThumbsUp, label: '96% Recommend', color: 'text-[#50A612]' },
            { icon: Heart, label: '4.9/5 Rating', color: 'text-[#D9965B]' }
          ].map((badge, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-card rounded-2xl p-6 border border-border text-center"
            >
              <div className={`w-12 h-12 ${badge.color.replace('text-', 'bg-')}/10 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <badge.icon className={`w-6 h-6 ${badge.color}`} />
              </div>
              <div className="text-sm font-bold text-white">{badge.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Expanded Testimonial Modal */}
      <AnimatePresence>
        {selectedTestimonial && (
          <ExpandedTestimonial
            testimonial={selectedTestimonial}
            onClose={() => setSelectedTestimonial(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}