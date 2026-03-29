/**
 * URGENT LOGIN/SIGNUP FIX
 * 
 * This component provides a comprehensive fix for authentication issues
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle, CheckCircle, Loader2, Mail, Lock, User } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

export function AuthFix() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleDirectSignup = async () => {
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Direct Signup: Starting
      
      // Use Supabase admin API through edge function
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          email,
          password,
          fullName
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        if (data.error?.includes('already been registered')) {
          setResult({ success: false, message: 'Email already exists. Please login instead.' });
          toast.error('Email already registered', {
            description: 'Please use the login form instead'
          });
          setMode('login');
          return;
        }
        throw new Error(data.error || 'Signup failed');
      }

      // Direct Signup: User created, attempting login
      
      // Auto-login after signup
      const { data: loginData, error: loginError } = await supabase!.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        console.error('🔧 Auto-login failed:', loginError);
        setResult({ 
          success: true, 
          message: 'Account created! Please login manually.' 
        });
        toast.success('Account created!', {
          description: 'Please login with your credentials'
        });
        setMode('login');
        return;
      }

      // Direct Signup: Complete and logged in
      setResult({ success: true, message: 'Account created and logged in successfully!' });
      toast.success('Welcome to Wassel!', {
        description: 'Your account has been created'
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        // Use history API to avoid IframeMessageAbortError in Figma iframe
        try {
          history.replaceState(null, '', '/app/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch { /* silently ignore */ }
      }, 1500);

    } catch (error: any) {
      console.error('🔧 Direct Signup Error:', error);
      setResult({ success: false, message: error.message || 'Signup failed' });
      toast.error('Signup Failed', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Direct Login: Starting
      
      // Try direct Supabase login first
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // If email not confirmed, try to fix it
        if (error.message.includes('Email not confirmed')) {
          // Email not confirmed, attempting fix
          
          // Call confirm endpoint
          const confirmResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/auth/confirm-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ email })
          });

          const confirmData = await confirmResponse.json();
          
          if (confirmResponse.ok) {
            // Email confirmed, retrying login
            
            // Retry login
            const { data: retryData, error: retryError } = await supabase!.auth.signInWithPassword({
              email,
              password
            });

            if (retryError) {
              throw retryError;
            }

            // Login successful after email confirmation
            setResult({ success: true, message: 'Login successful!' });
            toast.success('Welcome back!', {
              description: 'Successfully logged in'
            });
            
            // Redirect to dashboard
            setTimeout(() => {
              // Use history API to avoid IframeMessageAbortError in Figma iframe
              try {
                history.replaceState(null, '', '/app/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              } catch { /* silently ignore */ }
            }, 1500);
            return;
          }
        }
        
        throw error;
      }

      // Direct Login: Successful
      setResult({ success: true, message: 'Login successful!' });
      toast.success('Welcome back!', {
        description: 'Successfully logged in'
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        // Use history API to avoid IframeMessageAbortError in Figma iframe
        try {
          history.replaceState(null, '', '/app/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch { /* silently ignore */ }
      }, 1500);

    } catch (error: any) {
      console.error('🔧 Direct Login Error:', error);
      setResult({ 
        success: false, 
        message: error.message || 'Login failed. Please check your credentials.' 
      });
      toast.error('Login Failed', {
        description: error.message || 'Invalid email or password'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmartLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    // Avoid server calls for clearly invalid emails (keeps tests and UX deterministic)
    if (!email.includes('@')) {
      toast.error('Invalid email');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Smart Login: Using server endpoint
      
      // Use smart login endpoint that auto-confirms email
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-0b1f4071/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email, password })
      });

      // Be liberal in what we accept: test mocks and some proxies omit content-type headers.
      let data: any;
      try {
        data = await response.json();
      } catch {
        const text = await response.text().catch(() => '');
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Server returned an unreadable response');
        }
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.session) {
        throw new Error('No session returned from server');
      }

      // Set the session in Supabase client
      const { error: setSessionError } = await supabase!.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      if (setSessionError) {
        throw setSessionError;
      }

      // Smart Login: Complete
      setResult({ success: true, message: 'Login successful via smart endpoint!' });
      toast.success('Welcome back!', {
        description: 'Successfully logged in'
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        // Use history API to avoid IframeMessageAbortError in Figma iframe
        try {
          history.replaceState(null, '', '/app/dashboard');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch { /* silently ignore */ }
      }, 1500);

    } catch (error: any) {
      console.error('🔧 Smart Login Error:', error);
      setResult({ success: false, message: error.message || 'Smart login failed' });
      toast.error('Login Failed', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {mode === 'login' ? 'Login to Wassel' : 'Sign Up for Wassel'}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === 'login' 
              ? 'Enter your credentials to access your account' 
              : 'Create a new Wasel account'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                mode === 'login' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                mode === 'signup' 
                  ? 'bg-primary text-white' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Signup Fields */}
          {mode === 'signup' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    mode === 'login' ? handleSmartLogin() : handleDirectSignup();
                  }
                }}
              />
            </div>
          </div>

          {/* Result Message */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <AlertTitle>
                {result.success ? 'Success!' : 'Error'}
              </AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {mode === 'signup' ? (
              <Button
                onClick={handleDirectSignup}
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSmartLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    'Login with Smart Fix'
                  )}
                </Button>
                
                <Button
                  onClick={handleDirectLogin}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  Direct Login (Fallback)
                </Button>
              </>
            )}
          </div>

          {/* Helper Text */}
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline font-semibold"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline font-semibold"
                >
                  Go back
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
