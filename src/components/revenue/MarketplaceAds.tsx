import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Store, TrendingUp, Eye, MousePointer, DollarSign, MapPin, Target, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface AdCampaign {
  id: string;
  businessName: string;
  adType: 'banner' | 'sponsored' | 'popup' | 'in-ride';
  title: string;
  description: string;
  budget: number;
  duration: number;
  targeting: {
    locations: string[];
    demographics: string[];
  };
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
  };
  status: 'active' | 'paused' | 'ended';
}

export function MarketplaceAds() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    {
      id: '1',
      businessName: 'Coffee Haven',
      adType: 'banner',
      title: '20% off your first order',
      description: 'Premium coffee delivered to your ride',
      budget: 500,
      duration: 30,
      targeting: {
        locations: ['Dubai', 'Abu Dhabi'],
        demographics: ['18-35', 'coffee-lovers'],
      },
      performance: {
        impressions: 45230,
        clicks: 3420,
        conversions: 287,
      },
      status: 'active',
    },
    {
      id: '2',
      businessName: 'Tech Gadgets',
      adType: 'sponsored',
      title: 'Latest smartphones on sale',
      description: 'Up to 40% discount on premium devices',
      budget: 1000,
      duration: 60,
      targeting: {
        locations: ['Amman', 'Irbid'],
        demographics: ['25-45', 'tech-enthusiasts'],
      },
      performance: {
        impressions: 89500,
        clicks: 7120,
        conversions: 534,
      },
      status: 'active',
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    businessName: '',
    adType: 'banner' as 'banner' | 'sponsored' | 'popup' | 'in-ride',
    title: '',
    description: '',
    budget: 100,
    duration: 30,
  });

  const handleCreateCampaign = () => {
    const campaign: AdCampaign = {
      id: Date.now().toString(),
      ...newCampaign,
      targeting: {
        locations: [],
        demographics: [],
      },
      performance: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
      },
      status: 'active',
    };

    setCampaigns([...campaigns, campaign]);
    setShowCreateDialog(false);
    toast.success(
      isRTL 
        ? 'تم إنشاء الحملة الإعلانية بنجاح!' 
        : 'Ad campaign created successfully!'
    );
    
    // Reset form
    setNewCampaign({
      businessName: '',
      adType: 'banner',
      title: '',
      description: '',
      budget: 100,
      duration: 30,
    });
  };

  const adTypes = [
    {
      type: 'banner',
      name: { en: 'Banner Ads', ar: 'إعلانات البانر' },
      price: { en: '$0.50 CPM', ar: '1.88 ر.س لكل 1000 ظهور' },
      description: { en: 'Display at top of app', ar: 'عرض في أعلى التطبيق' },
    },
    {
      type: 'sponsored',
      name: { en: 'Sponsored Listings', ar: 'القوائم المدعومة' },
      price: { en: '$1.00 CPM', ar: '3.75 ر.س لكل 1000 ظهور' },
      description: { en: 'Featured in search results', ar: 'مميز في نتائج البحث' },
    },
    {
      type: 'popup',
      name: { en: 'Pop-up Ads', ar: 'الإعلانات المنبثقة' },
      price: { en: '$2.00 CPM', ar: '7.50 ر.س لكل 1000 ظهور' },
      description: { en: 'Full-screen promotions', ar: 'عروض بملء الشاشة' },
    },
    {
      type: 'in-ride',
      name: { en: 'In-Ride Ads', ar: 'إعلانات أثناء الرحلة' },
      price: { en: '$3.00 CPM', ar: '11.25 ر.س لكل 1000 ظهور' },
      description: { en: 'Shown during trips', ar: 'تعرض أثناء الرحلات' },
    },
  ];

  const totalImpressions = campaigns.reduce((sum, c) => sum + c.performance.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.performance.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.performance.conversions, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.budget, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              {isRTL ? 'منصة الإعلانات' : 'Advertising Marketplace'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'تواصل مع الملايين من الركاب والسائقين' 
                : 'Connect with millions of riders and drivers'}
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-purple-600">
                {isRTL ? 'إنشاء حملة' : 'Create Campaign'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{isRTL ? 'إنشاء حملة إعلانية جديدة' : 'Create New Ad Campaign'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{isRTL ? 'اسم النشاط التجاري' : 'Business Name'}</Label>
                  <Input
                    value={newCampaign.businessName}
                    onChange={(e) => setNewCampaign({ ...newCampaign, businessName: e.target.value })}
                    placeholder={isRTL ? 'أدخل اسم نشاطك التجاري' : 'Enter your business name'}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'نوع الإعلان' : 'Ad Type'}</Label>
                  <Select 
                    value={newCampaign.adType}
                    onValueChange={(value: any) => setNewCampaign({ ...newCampaign, adType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {adTypes.map(type => (
                        <SelectItem key={type.type} value={type.type}>
                          {isRTL ? type.name.ar : type.name.en} - {isRTL ? type.price.ar : type.price.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isRTL ? 'عنوان الإعلان' : 'Ad Title'}</Label>
                  <Input
                    value={newCampaign.title}
                    onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                    placeholder={isRTL ? 'عنوان جذاب للإعلان' : 'Catchy ad title'}
                  />
                </div>
                <div>
                  <Label>{isRTL ? 'الوصف' : 'Description'}</Label>
                  <Textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    placeholder={isRTL ? 'صف عرضك أو خدمتك' : 'Describe your offer or service'}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{isRTL ? 'الميزانية' : 'Budget'}</Label>
                    <Input
                      type="number"
                      value={newCampaign.budget}
                      onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                      placeholder={isRTL ? 'الميزانية بالريال' : 'Budget in USD'}
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? 'المدة (أيام)' : 'Duration (days)'}</Label>
                    <Input
                      type="number"
                      value={newCampaign.duration}
                      onChange={(e) => setNewCampaign({ ...newCampaign, duration: Number(e.target.value) })}
                      placeholder={isRTL ? 'عدد الأيام' : 'Number of days'}
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleCreateCampaign}
                  className="w-full bg-gradient-to-r from-primary to-purple-600"
                  disabled={!newCampaign.businessName || !newCampaign.title}
                >
                  {isRTL ? 'إطلاق الحملة' : 'Launch Campaign'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { 
              label: { en: 'Total Revenue', ar: 'إجمالي الإيرادات' },
              value: isRTL ? `${totalRevenue * 3.75} ر.س` : `$${totalRevenue}`,
              icon: DollarSign,
              color: 'from-green-400 to-emerald-600',
            },
            { 
              label: { en: 'Impressions', ar: 'مرات الظهور' },
              value: totalImpressions.toLocaleString(),
              icon: Eye,
              color: 'from-blue-400 to-indigo-600',
            },
            { 
              label: { en: 'Clicks', ar: 'النقرات' },
              value: totalClicks.toLocaleString(),
              icon: MousePointer,
              color: 'from-purple-400 to-pink-600',
            },
            { 
              label: { en: 'Conversions', ar: 'التحويلات' },
              value: totalConversions.toLocaleString(),
              icon: TrendingUp,
              color: 'from-amber-400 to-orange-600',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isRTL ? stat.label.ar : stat.label.en}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Ad Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isRTL ? 'أنواع الإعلانات' : 'Ad Types'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adTypes.map((type, idx) => (
              <motion.div
                key={type.type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isRTL ? type.name.ar : type.name.en}
                    </CardTitle>
                    <CardDescription>
                      {isRTL ? type.description.ar : type.description.en}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">
                      {isRTL ? type.price.ar : type.price.en}
                    </div>
                    <Badge variant="outline">
                      {isRTL ? 'متاح الآن' : 'Available Now'}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Active Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {isRTL ? 'الحملات النشطة' : 'Active Campaigns'}
          </h2>
          <div className="space-y-4">
            {campaigns.map((campaign, idx) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{campaign.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Store className="w-4 h-4" />
                          {campaign.businessName}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={campaign.status === 'active' ? 'default' : 'secondary'}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {campaign.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {campaign.performance.impressions.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ظهور' : 'Impressions'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {campaign.performance.clicks.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'نقرات' : 'Clicks'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {campaign.performance.conversions.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'تحويلات' : 'Conversions'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {((campaign.performance.clicks / campaign.performance.impressions) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'معدل النقر' : 'CTR'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {isRTL ? `${campaign.budget * 3.75} ر.س` : `$${campaign.budget}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'الميزانية' : 'Budget'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isRTL ? 'لماذا الإعلان مع وصل؟' : 'Why Advertise with Wasel?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: { en: 'Targeted Reach', ar: 'وصول مستهدف' },
                description: { en: 'Reach the right audience at the right time', ar: 'الوصول إلى الجمهور المناسب في الوقت المناسب' },
              },
              {
                icon: TrendingUp,
                title: { en: 'High Engagement', ar: 'تفاعل عالي' },
                description: { en: 'Users actively engage during rides', ar: 'المستخدمون يتفاعلون بنشاط أثناء الرحلات' },
              },
              {
                icon: MapPin,
                title: { en: 'Location Based', ar: 'حسب الموقع' },
                description: { en: 'Target specific cities and neighborhoods', ar: 'استهدف مدن وأحياء محددة' },
              },
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">
                    {isRTL ? benefit.title.ar : benefit.title.en}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? benefit.description.ar : benefit.description.en}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
