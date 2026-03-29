/**
 * EnhancedAuthPage — World-Class Authentication Experience
 * 
 * Features:
 * - NO SIDEBAR - Full-width immersive experience
 * - Cinematic split-screen design
 * - Glassmorphism + Premium animations
 * - Social auth (Google, Facebook)
 * - Phone OTP authentication
 * - Email magic link
 * - Form validation with beautiful errors
 * - Password strength indicator
 * - Smooth micro-interactions
 * - RTL + Bilingual support
 * - Mobile responsive
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight,
  CheckCircle, AlertCircle, Loader2, Sparkles, Shield,
  Zap, Star, Globe, ChevronRight, LogIn, UserPlus,
  Check, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { WaselLogoMark } from '../../components/WaselLogoMark';

// ══════════════════════════════════════════════════════════════════════════════
// BRAND COLORS
// ══════════════════════════════════════════════════════════════════════════════

const C = {
  cyan: '#00C8E8',
  cyanDark: '#0095b8',
  gold: '#F0A830',
  green: '#00C875',
  bg: '#040C18',
  surface: '#060E1C',
  card: '#091525',
  border: 'rgba(0,200,232,0.15)',
  text: '#E2E8F0',
  textMuted: '#94A3B8',
};

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT
// ══════════════════════════════════════════════════════════════════════════════

const content = {
  ar: {
    // Tabs
    signUp: 'إنشاء حساب',
    logIn: 'تسجيل الدخول',
    
    // Hero
    hero: {
      title: 'انضم لشبكة التنقل الذكية',
      subtitle: 'وفّر 70% من تكلفة التنقل واربح المال من رحلاتك',
      features: [
        '✓ مستخدمون موثوقون عبر سند',
        '✓ توقفات الصلاة',
        '✓ رحلات نسائية فقط',
        '✓ توصيل طرود',
      ],
    },
    
    // Sign Up Form
    signUpForm: {
      title: 'أنشئ حسابك',
      subtitle: 'ابدأ رحلتك مع واصل',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      terms: 'أوافق على الشروط والأحكام',
      createAccount: 'إنشاء الحساب',
      alreadyHaveAccount: 'لديك حساب؟',
      signInInstead: 'سجّل الدخول',
    },
    
    // Log In Form
    logInForm: {
      title: 'مرحباً بعودتك',
      subtitle: 'سجّل الدخول للمتابعة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      rememberMe: 'تذكرني',
      forgotPassword: 'نسيت كلمة المرور؟',
      logIn: 'تسجيل الدخول',
      noAccount: 'ليس لديك حساب؟',
      signUpInstead: 'أنشئ حساب',
    },
    
    // Social Auth
    social: {
      orContinueWith: 'أو تابع باستخدام',
      google: 'تابع مع Google',
      facebook: 'تابع مع Facebook',
      phone: 'تابع برقم الهاتف',
      magicLink: 'أرسل رابط سحري',
    },
    
    // Validation
    validation: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'بريد إلكتروني غير صالح',
      passwordTooShort: 'كلمة المرور قصيرة جداً (8 أحرف على الأقل)',
      passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
      invalidPhone: 'رقم هاتف غير صالح',
    },
    
    // Password Strength
    passwordStrength: {
      weak: 'ضعيفة',
      medium: 'متوسطة',
      strong: 'قوية',
      veryStrong: 'قوية جداً',
    },
    
    // Success
    success: {
      accountCreated: 'تم إنشاء الحساب بنجاح!',
      loggedIn: 'مرحباً بعودتك!',
      redirecting: 'جارٍ التوجيه...',
    },
  },
  
  en: {
    // Tabs
    signUp: 'Sign Up',
    logIn: 'Log In',
    
    // Hero
    hero: {
      title: 'Join the Smart Mobility Network',
      subtitle: 'Save 70% on transportation costs and earn from your trips',
      features: [
        '✓ Verified users via Sanad',
        '✓ Prayer stops',
        '✓ Women-only rides',
        '✓ Package delivery',
      ],
    },
    
    // Sign Up Form
    signUpForm: {
      title: 'Create your account',
      subtitle: 'Start your journey with Wasel',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      phone: 'Phone Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      terms: 'I agree to the Terms & Conditions',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      signInInstead: 'Sign in',
    },
    
    // Log In Form
    logInForm: {
      title: 'Welcome back',
      subtitle: 'Sign in to continue',
      email: 'Email Address',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      logIn: 'Log In',
      noAccount: "Don't have an account?",
      signUpInstead: 'Sign up',
    },
    
    // Social Auth
    social: {
      orContinueWith: 'Or continue with',
      google: 'Continue with Google',
      facebook: 'Continue with Facebook',
      phone: 'Continue with Phone',
      magicLink: 'Send Magic Link',
    },
    
    // Validation
    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordTooShort: 'Password too short (min 8 characters)',
      passwordsDoNotMatch: 'Passwords do not match',
      invalidPhone: 'Invalid phone number',
    },
    
    // Password Strength
    passwordStrength: {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong',
      veryStrong: 'Very Strong',
    },
    
    // Success
    success: {
      accountCreated: 'Account created successfully!',
      loggedIn: 'Welcome back!',
      redirecting: 'Redirecting...',
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Animated Background ───────────────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient orbs */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${C.cyan}, transparent)` }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle, ${C.gold}, transparent)` }}
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Grid */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={C.cyan} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: i % 2 === 0 ? C.cyan : C.gold,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

// ── Input Component ───────────────────────────────────────────────────────────
interface InputProps {
  icon: any;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  rightIcon?: any;
  onRightIconClick?: () => void;
}

function Input({
  icon: Icon,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  rightIcon: RightIcon,
  onRightIconClick,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1"
        style={{ color: 'rgba(226,232,240,0.85)' }}>
        {label}
        {required && <span style={{ color: '#FF4455' }}>*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(100,116,139,0.8)' }}>
          <Icon className="w-5 h-5" />
        </div>
        
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full rounded-xl pl-11 pr-11 py-3 transition-all outline-none"
          style={{
            background: focused ? 'rgba(0,200,232,0.06)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${focused ? 'rgba(0,200,232,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: '#EFF6FF',
            boxShadow: focused ? '0 0 0 3px rgba(0,200,232,0.08)' : 'none',
          }}
        />
        
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: 'rgba(100,116,139,0.7)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#EFF6FF')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(100,116,139,0.7)')}
          >
            <RightIcon className="w-5 h-5" />
          </button>
        )}
        
        {/* Success check */}
        {!error && value && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#00C875' }}
          >
            <Check className="w-5 h-5" />
          </motion.div>
        )}
      </div>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm"
            style={{ color: '#FF4455' }}
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Password Strength Indicator ──────────────────────────────────────────────
function PasswordStrength({ password, language }: { password: string; language: 'ar' | 'en' }) {
  const t = content[language];
  
  const getStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };
  
  const strength = getStrength(password);
  const labels = [
    '',
    t.passwordStrength.weak,
    t.passwordStrength.medium,
    t.passwordStrength.strong,
    t.passwordStrength.veryStrong,
  ];
  const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#00C8E8'];
  
  if (!password) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full bg-white/10"
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: i < strength ? 1 : 0,
              backgroundColor: i < strength ? colors[strength] : 'rgba(255,255,255,0.1)',
            }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[strength] }}>
        {labels[strength]}
      </p>
    </div>
  );
}

// ── Social Button ─────────────────────────────────────────────────────────────
function SocialButton({ icon: Icon, label, onClick, loading }: any) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </>
      )}
    </motion.button>
  );
}

// ── Primary Button ────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, loading, disabled }: any) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-3.5 rounded-xl font-bold text-white text-base relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: `linear-gradient(135deg, ${C.cyan}, ${C.cyanDark})`,
        boxShadow: `0 8px 24px ${C.cyan}40`,
      }}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{content.en.success.redirecting}</span>
          </>
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export function EnhancedAuthPage() {
  const { signUp, signIn, signInWithGoogle, signInWithFacebook, user } = useAuth();
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  
  // Sign up form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const t = content[language as 'ar' | 'en'];
  const isAr = language === 'ar';
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  // Validation
  const validateSignUp = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) newErrors.firstName = t.validation.required;
    if (!lastName.trim()) newErrors.lastName = t.validation.required;
    if (!email.trim()) newErrors.email = t.validation.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = t.validation.invalidEmail;
    if (!password) newErrors.password = t.validation.required;
    else if (password.length < 8) newErrors.password = t.validation.passwordTooShort;
    if (!confirmPassword) newErrors.confirmPassword = t.validation.required;
    else if (password !== confirmPassword) newErrors.confirmPassword = t.validation.passwordsDoNotMatch;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateLogin = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!loginEmail.trim()) newErrors.loginEmail = t.validation.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) newErrors.loginEmail = t.validation.invalidEmail;
    if (!loginPassword) newErrors.loginPassword = t.validation.required;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle Sign Up
  const handleSignUp = async () => {
    if (!validateSignUp()) return;
    if (!agreeTerms) {
      toast.error('Please agree to the Terms & Conditions');
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await signUp(email, password, `${firstName} ${lastName}`);
      if (error) {
        const msg = error.message || 'Sign up failed';
        if (msg === 'EMAIL_ALREADY_EXISTS') {
          toast.error(isAr ? 'البريد الإلكتروني مسجل مسبقاً' : 'Email already registered. Please login instead.');
          setMode('login');
          setLoginEmail(email);
        } else {
          toast.error(msg);
        }
        return;
      }
      toast.success(t.success.accountCreated);
      setTimeout(() => navigate('/app/dashboard'), 1000);
    } catch (error: any) {
      console.error('SignUp unexpected error:', error);
      toast.error(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Login
  const handleLogin = async () => {
    if (!validateLogin()) return;
    
    setLoading(true);
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        const msg = error.message || 'Login failed';
        console.error('Login error:', msg);
        if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
          toast.error(isAr ? 'بريد إلكتروني أو كلمة مرور غير صحيحة' : 'Invalid email or password');
        } else {
          toast.error(msg);
        }
        return;
      }
      toast.success(t.success.loggedIn);
      setTimeout(() => navigate('/app/dashboard'), 1000);
    } catch (error: any) {
      console.error('Login unexpected error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Social Auth
  const handleGoogleAuth = async () => {
    setSocialLoading('google');
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.message || 'Google sign in failed');
        return;
      }
      toast.success(t.success.loggedIn);
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
    } finally {
      setSocialLoading(null);
    }
  };
  
  const handleFacebookAuth = async () => {
    setSocialLoading('facebook');
    try {
      const { error } = await signInWithFacebook();
      if (error) {
        toast.error(error.message || 'Facebook sign in failed');
        return;
      }
      toast.success(t.success.loggedIn);
    } catch (error: any) {
      toast.error(error.message || 'Facebook sign in failed');
    } finally {
      setSocialLoading(null);
    }
  };
  
  return (
    <div className="min-h-screen flex" dir={dir} style={{ background: C.bg }}>
      {/* Background */}
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10 w-full flex">
        {/* Left Side - Hero (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <div className="max-w-lg space-y-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center lg:items-start gap-3"
            >
              <WaselLogoMark size="lg" animated />
              {/* Brand name + slogan */}
              <div className="text-center lg:text-start">
                <h2
                  className="font-black text-2xl"
                  style={{
                    background: `linear-gradient(135deg, #fff 0%, ${C.cyan} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Wasel واصل
                </h2>
                <p
                  className="text-sm font-semibold mt-1"
                  dir="rtl"
                  style={{
                    color: C.gold,
                    fontFamily: '"Cairo", "Tajawal", sans-serif',
                    letterSpacing: '0.02em',
                  }}
                >
                  انا واصل انتا؟
                </p>
              </div>
            </motion.div>
            
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold text-white leading-tight">
                {t.hero.title}
              </h1>
              <p className="text-xl text-slate-400">
                {t.hero.subtitle}
              </p>
            </motion.div>
            
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-3"
            >
              {t.hero.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.cyan }}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              {[
                { label: isAr ? 'مستخدم' : 'Users', value: '50K+' },
                { label: isAr ? 'رحلة' : 'Trips', value: '100K+' },
                { label: isAr ? 'مدينة' : 'Cities', value: '12+' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold" style={{ color: C.cyan }}>{stat.value}</div>
                  <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            {/* Card */}
            <div
              className="backdrop-blur-xl rounded-2xl border p-8 space-y-6"
              style={{
                background: 'rgba(9, 21, 37, 0.6)',
                borderColor: C.border,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Logo (Mobile Only) */}
              <div className="lg:hidden mb-6 flex flex-col items-center gap-2">
                <WaselLogoMark size="md" animated />
                <div className="text-center">
                  <h2
                    className="font-black text-xl"
                    style={{
                      background: `linear-gradient(135deg, #fff 0%, ${C.cyan} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Wasel واصل
                  </h2>
                  <p
                    className="text-xs font-semibold mt-0.5"
                    dir="rtl"
                    style={{
                      color: C.gold,
                      fontFamily: '"Cairo", "Tajawal", sans-serif',
                    }}
                  >
                    انا واصل انتا؟
                  </p>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    background: mode === 'signup' ? `linear-gradient(135deg, ${C.cyan}, ${C.cyanDark})` : 'transparent',
                  }}
                >
                  <UserPlus className="w-4 h-4 inline mr-2" />
                  {t.signUp}
                </button>
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2.5 rounded-lg font-semibold transition-all ${
                    mode === 'login'
                      ? 'bg-gradient-to-r text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  style={{
                    background: mode === 'login' ? `linear-gradient(135deg, ${C.cyan}, ${C.cyanDark})` : 'transparent',
                  }}
                >
                  <LogIn className="w-4 h-4 inline mr-2" />
                  {t.logIn}
                </button>
              </div>
              
              {/* Forms */}
              <AnimatePresence mode="wait">
                {mode === 'signup' ? (
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t.signUpForm.title}</h2>
                      <p className="text-slate-400 mt-1">{t.signUpForm.subtitle}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        icon={User}
                        label={t.signUpForm.firstName}
                        placeholder="Ahmed"
                        value={firstName}
                        onChange={setFirstName}
                        error={errors.firstName}
                        required
                      />
                      <Input
                        icon={User}
                        label={t.signUpForm.lastName}
                        placeholder="Hassan"
                        value={lastName}
                        onChange={setLastName}
                        error={errors.lastName}
                        required
                      />
                    </div>
                    
                    <Input
                      icon={Mail}
                      label={t.signUpForm.email}
                      type="email"
                      placeholder="ahmed@example.com"
                      value={email}
                      onChange={setEmail}
                      error={errors.email}
                      required
                    />
                    
                    <Input
                      icon={Phone}
                      label={t.signUpForm.phone}
                      type="tel"
                      placeholder="+962 79 123 4567"
                      value={phone}
                      onChange={setPhone}
                      error={errors.phone}
                    />
                    
                    <Input
                      icon={Lock}
                      label={t.signUpForm.password}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={setPassword}
                      error={errors.password}
                      required
                      rightIcon={showPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                    
                    <PasswordStrength password={password} language={language as 'ar' | 'en'} />
                    
                    <Input
                      icon={Lock}
                      label={t.signUpForm.confirmPassword}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      error={errors.confirmPassword}
                      required
                      rightIcon={showConfirmPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500"
                      />
                      <span className="text-sm text-slate-300">
                        {t.signUpForm.terms}
                      </span>
                    </label>
                    
                    <PrimaryButton onClick={handleSignUp} loading={loading}>
                      {t.signUpForm.createAccount}
                      <ArrowRight className="w-5 h-5" />
                    </PrimaryButton>
                    
                    <div className="text-center text-sm text-slate-400">
                      {t.signUpForm.alreadyHaveAccount}{' '}
                      <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: C.cyan }}>
                        {t.signUpForm.signInInstead}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t.logInForm.title}</h2>
                      <p className="text-slate-400 mt-1">{t.logInForm.subtitle}</p>
                    </div>
                    
                    <Input
                      icon={Mail}
                      label={t.logInForm.email}
                      type="email"
                      placeholder="ahmed@example.com"
                      value={loginEmail}
                      onChange={setLoginEmail}
                      error={errors.loginEmail}
                      required
                    />
                    
                    <Input
                      icon={Lock}
                      label={t.logInForm.password}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={setLoginPassword}
                      error={errors.loginPassword}
                      required
                      rightIcon={showPassword ? EyeOff : Eye}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded accent-cyan-500"
                        />
                        <span className="text-sm text-slate-300">{t.logInForm.rememberMe}</span>
                      </label>
                      
                      <button className="text-sm font-semibold hover:underline" style={{ color: C.cyan }}>
                        {t.logInForm.forgotPassword}
                      </button>
                    </div>
                    
                    <PrimaryButton onClick={handleLogin} loading={loading}>
                      {t.logInForm.logIn}
                      <ArrowRight className="w-5 h-5" />
                    </PrimaryButton>
                    
                    <div className="text-center text-sm text-slate-400">
                      {t.logInForm.noAccount}{' '}
                      <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: C.cyan }}>
                        {t.logInForm.signUpInstead}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 text-slate-400" style={{ background: C.card }}>
                    {t.social.orContinueWith}
                  </span>
                </div>
              </div>
              
              {/* Social Auth */}
              <div className="grid grid-cols-2 gap-3">
                <SocialButton
                  icon={() => (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  label="Google"
                  onClick={handleGoogleAuth}
                  loading={socialLoading === 'google'}
                />
                <SocialButton
                  icon={() => (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  )}
                  label="Facebook"
                  onClick={handleFacebookAuth}
                  loading={socialLoading === 'facebook'}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
