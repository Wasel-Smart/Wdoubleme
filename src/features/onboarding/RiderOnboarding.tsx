/**
 * Rider Onboarding
 * Goal: Book first trip in <1 minute
 * 
 * Flow:
 * 1. Phone + OTP (15 sec)
 * 2. "First Ride FREE!" → Book Now
 * 
 * Deferred: Name, email, payment (after first ride)
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Gift, Phone, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useIframeSafeNavigate } from '../../hooks/useIframeSafeNavigate';
import { supabase } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';

export function RiderOnboarding() {
  const navigate = useIframeSafeNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'welcome'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 9) {
      toast.error('Please enter a valid phone number');
      return;
    }

    if (!supabase) {
      toast.error('Supabase client not initialized');
      return;
    }

    try {
      setLoading(true);

      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+962${phone}`, // Jordan country code
      });

      if (error) {
        toast.error('Failed to send OTP. Please try again.');
        console.error('OTP send error:', error);
        return;
      }

      toast.success('OTP sent to your phone!');
      setStep('otp');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    if (!supabase) {
      toast.error('Supabase client not initialized');
      return;
    }

    try {
      setLoading(true);

      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+962${phone}`,
        token: otp,
        type: 'sms',
      });

      if (error) {
        toast.error('Invalid code. Please try again.');
        console.error('OTP verify error:', error);
        return;
      }

      if (data.user) {
        // Create minimal profile (just phone)
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/profile`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session?.access_token}`,
            },
            body: JSON.stringify({
              userId: data.user.id,
              phone: `+962${phone}`,
              full_name: 'New Rider', // Temporary
              onboarding_completed: false,
            }),
          }
        );

        if (!response.ok) {
          console.warn('Profile creation status:', response.status);
        }

        toast.success('Welcome to Wasel! 🎉');
        setStep('welcome');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Navigate to find ride page with promo applied
    navigate('/app/find-ride?promo=FIRST5FREE');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'phone' && (
          <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                Welcome to Wasel
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Jordan's smartest ride-sharing app
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* FREE RIDE BANNER */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gift className="w-6 h-6" />
                  <span className="text-2xl font-bold">FIRST RIDE FREE!</span>
                </div>
                <p className="text-sm opacity-90">
                  Up to 5 JOD off your first trip
                </p>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-muted rounded-lg border">
                    <span className="font-medium">+962</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="7X XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                    className="flex-1 text-lg"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send you a verification code
                </p>
              </div>

              <Button
                onClick={handlePhoneSubmit}
                disabled={loading || phone.length < 9}
                className="w-full h-12 text-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                {loading ? 'Sending...' : 'Continue'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our{' '}
                <button type="button" onClick={() => navigate('/terms')} className="underline">Terms</button> and{' '}
                <button type="button" onClick={() => navigate('/privacy')} className="underline">Privacy Policy</button>
              </p>
            </CardContent>
          </Card>
        )}

        {step === 'otp' && (
          <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Verify Your Number
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Enter the 6-digit code sent to<br />
                <strong>+962 {phone}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleOtpVerify}
                disabled={loading || otp.length !== 6}
                className="w-full h-12 text-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="text-center">
                <button
                  onClick={() => setStep('phone')}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Wrong number? Go back
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading}
                  className="text-sm text-teal-600 hover:underline font-medium"
                >
                  Resend code
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 'welcome' && (
          <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
            <CardContent className="py-12 text-center space-y-6">
              {/* Animated Success */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto animate-bounce">
                  <Gift className="w-16 h-16 text-white" />
                </div>
                <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-20 animate-ping mx-auto" />
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-2">
                  You're All Set! 🎉
                </h2>
                <p className="text-lg text-muted-foreground">
                  Your first ride is on us
                </p>
              </div>

              <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl space-y-3">
                <Badge className="bg-green-500 text-white text-base px-4 py-1">
                  5 JOD FREE CREDIT
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Use code <strong className="font-mono">FIRST5FREE</strong> at checkout
                </p>
              </div>

              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full h-14 text-lg bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Book Your First Ride
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground">
                Complete your profile later in Settings
              </p>
            </CardContent>
          </Card>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          <div className={`w-2 h-2 rounded-full ${step === 'phone' ? 'bg-teal-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'otp' ? 'bg-teal-600' : 'bg-gray-300'}`} />
          <div className={`w-2 h-2 rounded-full ${step === 'welcome' ? 'bg-teal-600' : 'bg-gray-300'}`} />
        </div>

        {/* Estimated Time */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            ⏱️ Takes less than 1 minute
          </p>
        </div>
      </div>
    </div>
  );
}
