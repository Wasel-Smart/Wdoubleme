import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Car,
  TrendingUp,
  Award,
  DollarSign,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';
import { formatCurrency } from '../../utils/currency';

interface DriverIncentive {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
}

export function DriverRecruitment() {
  const { t, language, dir } = useLanguage();
  const [step, setStep] = useState<'landing' | 'form' | 'confirmation'>('landing');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    vehicleType: '',
    preferredRoute: '',
  });

  // Founding driver incentives
  const incentives: DriverIncentive[] = [
    {
      id: '1',
      title: language === 'ar' ? 'أول 5 رحلات' : 'First 5 Trips',
      description:
        language === 'ar'
          ? 'اكمل أول 5 رحلات وخذ بونص 20 دينار'
          : 'Complete your first 5 trips and earn JOD 20 bonus',
      reward: 20,
      progress: 0,
      target: 5,
      completed: false,
    },
    {
      id: '2',
      title: language === 'ar' ? 'سائق موثّق' : 'Verified Driver',
      description:
        language === 'ar'
          ? 'وثّق هويتك والسيارة وخذ بونص 10 دنانير'
          : 'Verify your identity and vehicle for JOD 10 bonus',
      reward: 10,
      progress: 0,
      target: 1,
      completed: false,
    },
    {
      id: '3',
      title: language === 'ar' ? '50 رحلة' : '50 Trips Milestone',
      description:
        language === 'ar'
          ? 'اكمل 50 رحلة بتقييم 4.5+ وخذ بونص 100 دينار'
          : 'Complete 50 trips with 4.5+ rating for JOD 100 bonus',
      reward: 100,
      progress: 0,
      target: 50,
      completed: false,
    },
  ];

  const benefits = [
    {
      icon: '💰',
      title: language === 'ar' ? 'غطّي تكلفة البنزين' : 'Cover Fuel Costs',
      description:
        language === 'ar'
          ? 'الركاب يساعدوك في تكلفة البنزين في رحلاتك'
          : 'Passengers help cover your fuel costs on trips',
    },
    {
      icon: '🚗',
      title: language === 'ar' ? 'استخدم سيارتك الشخصية' : 'Use Your Personal Car',
      description:
        language === 'ar'
          ? 'لا تحتاج سيارة خاصة، استخدم سيارتك العادية'
          : "No need for a special car, use your personal vehicle",
    },
    {
      icon: '📅',
      title: language === 'ar' ? 'جدولك بإيدك' : 'Flexible Schedule',
      description:
        language === 'ar'
          ? 'انت تحدد متى ووين تروح'
          : 'You decide when and where to go',
    },
    {
      icon: '🤝',
      title: language === 'ar' ? 'رفقة بالطريق' : 'Travel Companions',
      description:
        language === 'ar'
          ? 'ما تسوق لحالك، خليك برفقة ناس طيبين'
          : "Don't drive alone, meet great people",
    },
    {
      icon: '🛡️',
      title: language === 'ar' ? 'تأمين مجاني' : 'Free Insurance',
      description:
        language === 'ar'
          ? 'كل الرحلات مؤمّنة لحد 1000 دينار'
          : 'All trips insured up to JOD 1,000',
    },
    {
      icon: '⭐',
      title: language === 'ar' ? 'بناء سمعة' : 'Build Reputation',
      description:
        language === 'ar'
          ? 'تقييمات عالية = ركاب أكثر'
          : 'High ratings = More passengers',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
    // TODO: API call to register driver
    console.log('Driver signup:', formData);
  };

  if (step === 'confirmation') {
    return (
      <div className={rtl.container()} dir={dir}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto text-center py-12"
        >
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'ar' ? '🎉 مبروك!' : '🎉 Congratulations!'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'ar'
                ? 'تم تسجيلك كسائق تأسيسي في واصل'
                : 'You are now a founding driver at Wasel'}
            </p>
          </div>

          <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <h3 className="font-semibold mb-4">
              {language === 'ar' ? 'جوائزك كسائق تأسيسي:' : 'Your Founding Driver Rewards:'}
            </h3>
            <div className="space-y-3 text-left">
              {incentives.map((incentive) => (
                <div
                  key={incentive.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{incentive.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {incentive.description}
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-lg">
                    {formatCurrency(incentive.reward, 'JOD', language)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-4">
            <Button size="lg" className="w-full">
              {language === 'ar' ? 'ابدأ رحلتك الأولى' : 'Start Your First Trip'}
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              {language === 'ar' ? 'كمّل ملفك الشخصي' : 'Complete Your Profile'}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className={rtl.container()} dir={dir}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Button
            variant="ghost"
            onClick={() => setStep('landing')}
            className="mb-6"
          >
            ← {language === 'ar' ? 'رجوع' : 'Back'}
          </Button>

          <h1 className="text-3xl font-bold mb-2">
            {language === 'ar' ? 'سجّل كسائق تأسيسي' : 'Register as Founding Driver'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {language === 'ar'
              ? 'عبّي البيانات وخلينا نبدأ'
              : "Fill in your details and let's get started"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder={language === 'ar' ? 'أحمد المصري' : 'Ahmad Al-Masri'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+962 79 123 4567"
                    type="tel"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'المدينة' : 'City'}
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر المدينة' : 'Select City'}
                    </option>
                    <option value="amman">
                      {language === 'ar' ? 'عمّان' : 'Amman'}
                    </option>
                    <option value="irbid">
                      {language === 'ar' ? 'إربد' : 'Irbid'}
                    </option>
                    <option value="aqaba">
                      {language === 'ar' ? 'العقبة' : 'Aqaba'}
                    </option>
                    <option value="zarqa">
                      {language === 'ar' ? 'الزرقاء' : 'Zarqa'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'نوع السيارة' : 'Vehicle Type'}
                  </label>
                  <Input
                    value={formData.vehicleType}
                    onChange={(e) =>
                      setFormData({ ...formData, vehicleType: e.target.value })
                    }
                    placeholder={language === 'ar' ? 'تويوتا كامري 2020' : 'Toyota Camry 2020'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ar' ? 'الطريق المفضّل' : 'Preferred Route'}
                  </label>
                  <Input
                    value={formData.preferredRoute}
                    onChange={(e) =>
                      setFormData({ ...formData, preferredRoute: e.target.value })
                    }
                    placeholder={language === 'ar' ? 'عمّان ← العقبة' : 'Amman → Aqaba'}
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('landing')}
                className="flex-1"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" className="flex-1">
                {language === 'ar' ? 'سجّل الآن' : 'Register Now'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Landing page
  return (
    <div className={rtl.container()} dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 text-lg px-4 py-2">
            <Award className={`h-5 w-5 ${rtl.mr(2)}`} />
            {language === 'ar' ? 'برنامج السائقين التأسيسيين' : 'Founding Driver Program'}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'ar'
              ? 'اربح لحد 130 دينار'
              : 'Earn up to JOD 130'}
            <br />
            {language === 'ar'
              ? 'كسائق تأسيسي في واصل'
              : 'as a Founding Driver at Wasel'}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {language === 'ar'
              ? 'رايح رحلة؟ شارك المقاعد الفاضية، غطّي تكلفة البنزين، واربح بونصات'
              : 'Going on a trip? Share empty seats, cover fuel costs, and earn bonuses'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setStep('form')} className="text-lg px-8">
              {language === 'ar' ? 'سجّل كسائق الآن' : 'Register as Driver'}
              <ArrowRight className={`h-5 w-5 ${rtl.ml(2)}`} />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              {language === 'ar' ? 'تعلّم المزيد' : 'Learn More'}
            </Button>
          </div>
        </div>

        {/* Incentives */}
        <Card className="p-8 mb-12 bg-gradient-to-r from-green-500/10 to-primary/10 border-2 border-green-500/20">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {language === 'ar' ? '💰 جوائز السائقين التأسيسيين' : '💰 Founding Driver Rewards'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {incentives.map((incentive) => (
              <Card key={incentive.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-bold text-lg">{incentive.title}</div>
                  <Badge className="bg-green-500 text-lg">
                    {formatCurrency(incentive.reward, 'JOD', language)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {incentive.description}
                </p>
                <Progress value={0} className="h-2" />
              </Card>
            ))}
          </div>
          <div className="text-center mt-6">
            <p className="text-2xl font-bold text-green-600">
              {language === 'ar'
                ? 'إجمالي البونصات: 130 دينار!'
                : 'Total Bonuses: JOD 130!'}
            </p>
          </div>
        </Card>

        {/* Benefits Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">
            {language === 'ar' ? 'ليش تصير سائق في واصل؟' : 'Why Drive with Wasel?'}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {language === 'ar' ? 'كيف يشتغل؟' : 'How It Works?'}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'سجّل' : 'Register'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'عبّي البيانات بسرعة' : 'Quick signup form'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'انشر رحلتك' : 'Post Trip'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'حدد وين ومتى رايح' : 'Where and when you go'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'استقبل ركاب' : 'Accept Passengers'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الركاب يحجزون معك' : 'Passengers book with you'}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">
                {language === 'ar' ? 'اربح فلوس' : 'Earn Money'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'غطّي البنزين + بونص' : 'Cover fuel + bonus'}
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-8 bg-primary text-primary-foreground text-center">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'ar' ? 'جاهز تبدأ؟' : 'Ready to Start?'}
          </h2>
          <p className="text-lg mb-6 opacity-90">
            {language === 'ar'
              ? 'انضم للسائقين التأسيسيين واربح بونصات حصرية'
              : 'Join founding drivers and earn exclusive bonuses'}
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setStep('form')}
            className="text-lg px-8"
          >
            {language === 'ar' ? 'سجّل الآن' : 'Register Now'}
            <ArrowRight className={`h-5 w-5 ${rtl.ml(2)}`} />
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}