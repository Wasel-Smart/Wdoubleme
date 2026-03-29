/**
 * Student Verification Component
 * Unlocks 20% discount on all rides
 * 
 * Verification Methods:
 * 1. .edu email address
 * 2. Student ID upload
 * 
 * Expiry: Annual renewal required
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { GraduationCap, Mail, Upload, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { useAuth } from '../contexts/AuthContext';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/server`;

interface StudentVerificationProps {
  onVerificationComplete?: () => void;
}

export function StudentVerification({ onVerificationComplete }: StudentVerificationProps) {
  const { user, session } = useAuth();
  const [method, setMethod] = useState<'email' | 'id' | null>(null);
  const [eduEmail, setEduEmail] = useState('');
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'select' | 'email-input' | 'email-verify' | 'id-upload' | 'pending' | 'verified'>('select');

  const [verificationStatus, setVerificationStatus] = useState<{
    status: 'none' | 'pending' | 'verified' | 'rejected';
    verified_at?: string;
    expires_at?: string;
    reason?: string;
  }>({ status: 'none' });

  // Check existing verification status on mount
  useState(() => {
    if (user?.id) {
      checkVerificationStatus();
    }
  });

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/student-verification/status/${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
        
        if (data.status === 'verified') {
          setStep('verified');
        } else if (data.status === 'pending') {
          setStep('pending');
        }
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };

  const handleEmailSubmit = async () => {
    if (!eduEmail || !eduEmail.endsWith('.edu')) {
      toast.error('Please enter a valid .edu email address');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/student-verification/send-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          edu_email: eduEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to send verification code');
        return;
      }

      toast.success('Verification code sent to your email!');
      setStep('email-verify');
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/student-verification/verify-email-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        toast.error('Invalid code. Please try again.');
        return;
      }

      toast.success('Student status verified! 🎉');
      setStep('verified');
      onVerificationComplete?.();
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleIdUpload = async () => {
    if (!studentIdFile) {
      toast.error('Please upload your student ID');
      return;
    }

    try {
      setLoading(true);

      // Upload file
      const formData = new FormData();
      formData.append('file', studentIdFile);
      formData.append('type', 'student_id');

      const uploadResponse = await fetch(`${API_BASE}/document-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload document');
      }

      const { file_url } = await uploadResponse.json();

      // Submit for verification
      const verifyResponse = await fetch(`${API_BASE}/student-verification/submit-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || publicAnonKey}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          student_id_url: file_url,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to submit verification');
      }

      toast.success('Student ID submitted for review!');
      setStep('pending');
    } catch (error) {
      console.error('Error uploading ID:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle>Student Discount</CardTitle>
              <CardDescription>Get 20% off all rides</CardDescription>
            </div>
          </div>
          {verificationStatus.status === 'verified' && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 'select' && (
          <>
            <Alert>
              <GraduationCap className="h-4 w-4" />
              <AlertDescription>
                Verify your student status to unlock 20% discount on all rides throughout Jordan!
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium">Choose verification method:</p>

              {/* Email Method */}
              <button
                onClick={() => {
                  setMethod('email');
                  setStep('email-input');
                }}
                className="w-full p-4 border-2 rounded-lg hover:border-blue-500 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">University Email (.edu)</p>
                    <p className="text-sm text-muted-foreground">
                      Instant verification with your .edu email address
                    </p>
                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                      ⚡ Instant (Recommended)
                    </Badge>
                  </div>
                </div>
              </button>

              {/* ID Upload Method */}
              <button
                onClick={() => {
                  setMethod('id');
                  setStep('id-upload');
                }}
                className="w-full p-4 border-2 rounded-lg hover:border-purple-500 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium mb-1">Student ID Card</p>
                    <p className="text-sm text-muted-foreground">
                      Upload a photo of your valid student ID
                    </p>
                    <Badge variant="outline" className="mt-2 bg-orange-50 text-orange-700 border-orange-200">
                      ⏱️ Review within 24 hours
                    </Badge>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}

        {step === 'email-input' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('select')}
            >
              ← Back
            </Button>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  University Email Address
                </label>
                <Input
                  type="email"
                  placeholder="yourname@university.edu"
                  value={eduEmail}
                  onChange={(e) => setEduEmail(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must end with .edu (e.g., name@ju.edu.jo)
                </p>
              </div>

              <Button
                onClick={handleEmailSubmit}
                disabled={loading || !eduEmail.includes('.edu')}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          </>
        )}

        {step === 'email-verify' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('email-input')}
            >
              ← Back
            </Button>

            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-muted-foreground">
                  We sent a 6-digit code to<br />
                  <strong>{eduEmail}</strong>
                </p>
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-widest"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleEmailVerify}
                disabled={loading || verificationCode.length !== 6}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>

              <div className="text-center">
                <button
                  onClick={handleEmailSubmit}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Resend code
                </button>
              </div>
            </div>
          </>
        )}

        {step === 'id-upload' && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('select')}
            >
              ← Back
            </Button>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Upload Student ID Card
                </label>
                <FileUpload
                  onFileSelect={setStudentIdFile}
                  accept="image/*"
                  maxSize={5}
                />
                {studentIdFile && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    {studentIdFile.name}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Make sure your name, university, and expiry date are clearly visible
                </p>
              </div>

              <Button
                onClick={handleIdUpload}
                disabled={loading || !studentIdFile}
                className="w-full"
              >
                {loading ? 'Uploading...' : 'Submit for Review'}
                <Upload className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}

        {step === 'pending' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Review in Progress</h3>
              <p className="text-sm text-muted-foreground">
                We're reviewing your student verification. You'll get a notification within 24 hours.
              </p>
            </div>
            {verificationStatus.reason && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {verificationStatus.reason}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'verified' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Student Status Verified! 🎓</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You now get 20% off all rides automatically
              </p>
              {verificationStatus.expires_at && (
                <p className="text-xs text-muted-foreground">
                  Valid until {new Date(verificationStatus.expires_at).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-1">20% OFF</div>
              <p className="text-sm text-muted-foreground">
                Your discount is applied automatically at checkout
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}