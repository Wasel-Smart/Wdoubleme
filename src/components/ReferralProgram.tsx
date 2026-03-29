import { useState, useEffect } from 'react';
import { Gift, Users, Copy, Share2, TrendingUp, DollarSign, Check, Trophy, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { referralAPI } from '../services/referrals';
import { isFeatureEnabled, getFeatureValue } from '../utils/featureFlags';
import { copyToClipboard } from '../utils/clipboard';
import { useLanguage } from '../contexts/LanguageContext';

// Referral milestones with rewards
const MILESTONES = [
  { referrals: 3, bonus: 15, icon: '🎯', label: 'Starter' },
  { referrals: 5, bonus: 30, icon: '🔥', label: 'Rising Star' },
  { referrals: 10, bonus: 75, icon: '⭐', label: 'Super Star' },
  { referrals: 20, bonus: 200, icon: '💎', label: 'Diamond' },
  { referrals: 50, bonus: 600, icon: '👑', label: 'Legend' },
];

export function ReferralProgram() {
  const { user, session } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [codeToApply, setCodeToApply] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Check if referral system is enabled
  const referralEnabled = isFeatureEnabled('ENABLE_REFERRALS');
  const referralValues = getFeatureValue<{ referrer_credit: number; referee_credit: number }>('ENABLE_REFERRALS');

  useEffect(() => {
    if (user?.id && referralEnabled) {
      fetchReferralData();
      fetchLeaderboard();
    }
  }, [user?.id, referralEnabled]);

  const fetchReferralData = async () => {
    try {
      const data = await referralAPI.getReferralCode();
      if (data) {
        setReferralCode(data.referral_code);
        setReferralCount(data.referral_count);
        setReferralEarnings(data.referral_earnings);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const data = await referralAPI.getLeaderboard();
      if (data) {
        setLeaderboard(data.leaderboard || []);
        setUserRank(data.myRank ?? data.user_rank ?? null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const copyReferralCode = () => {
    copyToClipboard(referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  const shareReferral = async () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    const shareText = `Join me on Wasel! Get your first ride FREE (up to ${referralValues?.referee_credit || 5} JOD) with my code: ${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Wasel',
          text: shareText,
          url: referralUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      copyToClipboard(referralUrl);
      toast.success('Referral link copied to clipboard!');
    }
  };

  // Calculate next milestone
  const nextMilestone = MILESTONES.find(m => m.referrals > referralCount) || MILESTONES[MILESTONES.length - 1];
  const currentMilestone = MILESTONES.filter(m => m.referrals <= referralCount).pop();
  const progressToNext = nextMilestone ? (referralCount / nextMilestone.referrals) * 100 : 100;

  if (!referralEnabled) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Referral Program Coming Soon!</h3>
            <p className="text-muted-foreground">
              Our referral program will launch in Week 2. Stay tuned!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
          Refer Friends, Earn Rewards
        </h1>
        <p className="text-lg text-muted-foreground">
          Share Wasel with friends and both get rewarded. The more you share, the more you earn!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-teal-500 to-blue-500 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 opacity-80" />
              <Badge variant="secondary" className="bg-white/20">
                {userRank ? `#${userRank}` : 'Unranked'}
              </Badge>
            </div>
            <div className="text-3xl font-bold mb-1">{referralCount}</div>
            <div className="text-sm opacity-90">Friends Referred</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 opacity-80" />
              <Zap className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-1">{referralEarnings.toFixed(2)} JOD</div>
            <div className="text-sm opacity-90">Total Earnings</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 opacity-80" />
              <span className="text-2xl">{currentMilestone?.icon || '🎯'}</span>
            </div>
            <div className="text-3xl font-bold mb-1">{currentMilestone?.label || 'Getting Started'}</div>
            <div className="text-sm opacity-90">Current Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Share Your Code */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Code
          </CardTitle>
          <CardDescription>
            Both you and your friend get {referralValues?.referrer_credit || 3} JOD when they complete their first ride!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={referralCode}
                readOnly
                className="pr-20 text-lg font-mono bg-muted"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1"
                onClick={copyReferralCode}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={shareReferral} size="lg" className="w-full">
              <Share2 className="w-5 h-5 mr-2" />
              Share via WhatsApp/SMS
            </Button>
            
            <Button onClick={copyReferralCode} variant="outline" size="lg" className="w-full">
              <Copy className="w-5 h-5 mr-2" />
              Copy Link
            </Button>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border">
            <p className="text-sm font-medium mb-2">💰 How it works:</p>
            <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Share your code with friends</li>
              <li>They sign up and use your code</li>
              <li>They get {referralValues?.referee_credit || 5} JOD free on first ride</li>
              <li>You get {referralValues?.referrer_credit || 3} JOD after their first ride</li>
              <li>Keep sharing, keep earning!</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Referral Milestones
          </CardTitle>
          <CardDescription>
            Unlock bonus rewards as you refer more friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Progress to {nextMilestone.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {referralCount} / {nextMilestone.referrals} referrals
              </span>
            </div>
            <Progress value={progressToNext} className="h-3" />
          </div>

          <div className="space-y-3">
            {MILESTONES.map((milestone, index) => {
              const isUnlocked = referralCount >= milestone.referrals;
              const isCurrent = currentMilestone?.referrals === milestone.referrals;
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    isUnlocked
                      ? 'bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-500 border-dashed'
                      : 'bg-muted/50 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl ${!isUnlocked && !isCurrent && 'grayscale opacity-40'}`}>
                      {milestone.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{milestone.label}</span>
                        {isUnlocked && <Check className="w-4 h-4 text-green-600" />}
                        {isCurrent && <Zap className="w-4 h-4 text-orange-600 animate-pulse" />}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {milestone.referrals} referrals
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      +{milestone.bonus} JOD
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isUnlocked ? 'Unlocked!' : 'Bonus'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Referrers This Week
            </CardTitle>
            <CardDescription>
              Compete with other users and climb the leaderboard!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.user_id === user?.id
                      ? 'bg-gradient-to-r from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30 border-2 border-teal-500'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-600 text-white' :
                      'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {entry.user_id === user?.id ? 'You' : entry.name || 'User'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.referral_count} referrals
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {entry.earnings.toFixed(2)} JOD
                  </Badge>
                </div>
              ))}
            </div>

            {userRank && userRank > 10 && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground text-center">
                  Your rank: <strong>#{userRank}</strong> · Keep referring to climb higher!
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}