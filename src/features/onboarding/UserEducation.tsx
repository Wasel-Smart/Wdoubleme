import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Play,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  X,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { useLanguage } from '../../contexts/LanguageContext';
import { rtl } from '../../utils/rtl';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  steps: {
    title: string;
    description: string;
    image?: string;
    tip?: string;
  }[];
}

export function UserEducation() {
  const { t, language, dir } = useLanguage();
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  const tutorials: Tutorial[] = [
    {
      id: 'driver-first-trip',
      title: language === 'ar' ? 'كيف تنشر رحلتك الأولى' : 'How to Post Your First Trip',
      description:
        language === 'ar'
          ? 'تعلم كيف تنشر رحلتك وتستقبل ركاب'
          : 'Learn how to post your trip and accept passengers',
      steps: [
        {
          title: language === 'ar' ? 'اضغط "انشر رحلة"' : 'Click "Post a Ride"',
          description:
            language === 'ar'
              ? 'من الصفحة الرئيسية، اضغط على زر "انشر رحلة"'
              : 'From the home page, click "Post a Ride" button',
          tip:
            language === 'ar'
              ? '💡 موجود في الأعلى على اليمين'
              : '💡 Located at the top right',
        },
        {
          title: language === 'ar' ? 'حدد الطريق والتاريخ' : 'Set Route and Date',
          description:
            language === 'ar'
              ? 'اختر من وين ولوين رايح، ومتى'
              : 'Choose where you are going from and to, and when',
          tip:
            language === 'ar'
              ? '💡 اختر تاريخ على الأقل 24 ساعة قدام'
              : '💡 Choose a date at least 24 hours ahead',
        },
        {
          title: language === 'ar' ? 'حدد السعر والمقاعد' : 'Set Price and Seats',
          description:
            language === 'ar'
              ? 'كم مقعد فاضي عندك؟ وكم السعر لكل مقعد؟'
              : 'How many seats available? What price per seat?',
          tip:
            language === 'ar'
              ? '💡 السعر المقترح معتمد على تكلفة البنزين'
              : '💡 Suggested price based on fuel costs',
        },
        {
          title: language === 'ar' ? 'اختر التفضيلات' : 'Choose Preferences',
          description:
            language === 'ar'
              ? 'نساء فقط؟ وقفات صلاة؟ موسيقى؟'
              : 'Women only? Prayer stops? Music?',
          tip:
            language === 'ar'
              ? '💡 التفضيلات تساعد الركاب يختاروا رحلتك'
              : '💡 Preferences help passengers choose your ride',
        },
        {
          title: language === 'ar' ? 'انشر!' : 'Publish!',
          description:
            language === 'ar'
              ? 'اضغط "انشر الرحلة" وخلص!'
              : 'Click "Post Ride" and done!',
          tip:
            language === 'ar'
              ? '🎉 تهانينا! رحلتك الأولى منشورة'
              : '🎉 Congratulations! Your first ride is posted',
        },
      ],
    },
    {
      id: 'passenger-book-ride',
      title: language === 'ar' ? 'كيف تحجز رحلة' : 'How to Book a Ride',
      description:
        language === 'ar'
          ? 'تعلم كيف تلاقي وتحجز رحلة مناسبة'
          : 'Learn how to find and book a suitable ride',
      steps: [
        {
          title: language === 'ar' ? 'ابحث عن رحلة' : 'Search for a Ride',
          description:
            language === 'ar'
              ? 'حدد من وين لوين، ومتى'
              : 'Choose from where to where, and when',
        },
        {
          title: language === 'ar' ? 'اختر السائق' : 'Choose Driver',
          description:
            language === 'ar'
              ? 'شوف التقييمات وعدد الرحلات'
              : 'Check ratings and trip count',
        },
        {
          title: language === 'ar' ? 'احجز المقعد' : 'Book Seat',
          description:
            language === 'ar' ? 'اضغط "احجز الآن"' : 'Click "Book Now"',
        },
        {
          title: language === 'ar' ? 'ادفع' : 'Pay',
          description:
            language === 'ar'
              ? 'ادفع أونلاين أو اختر كاش عند الوصول'
              : 'Pay online or choose cash on arrival',
        },
        {
          title: language === 'ar' ? 'استمتع!' : 'Enjoy!',
          description:
            language === 'ar'
              ? 'انتظر يوم الرحلة واستمتع'
              : 'Wait for trip day and enjoy',
        },
      ],
    },
    {
      id: 'safety-tips',
      title: language === 'ar' ? 'نصائح السلامة' : 'Safety Tips',
      description:
        language === 'ar'
          ? 'كيف تبقى آمن في رحلاتك'
          : 'How to stay safe during your trips',
      steps: [
        {
          title: language === 'ar' ? 'وثّق هويتك' : 'Verify Your Identity',
          description:
            language === 'ar'
              ? 'ارفع بطاقتك الشخصية ورخصة القيادة'
              : 'Upload your ID and driver license',
          tip:
            language === 'ar'
              ? '🛡️ الحسابات الموثّقة تحصل +40% حجوزات'
              : '🛡️ Verified accounts get +40% bookings',
        },
        {
          title: language === 'ar' ? 'اقرأ التقييمات' : 'Read Reviews',
          description:
            language === 'ar'
              ? 'شوف شو الناس بيقولوا عن السائق'
              : 'See what people say about the driver',
        },
        {
          title: language === 'ar' ? 'شارك موقعك' : 'Share Your Location',
          description:
            language === 'ar'
              ? 'شارك موقعك مع أهلك أو أصحابك'
              : 'Share your location with family or friends',
        },
        {
          title: language === 'ar' ? 'استخدم زر SOS' : 'Use SOS Button',
          description:
            language === 'ar'
              ? 'في حالة الطوارئ، اضغط زر SOS'
              : 'In case of emergency, press SOS button',
          tip:
            language === 'ar'
              ? '🚨 متوفر في كل رحلة'
              : '🚨 Available in every trip',
        },
      ],
    },
    {
      id: 'earnings-guide',
      title: language === 'ar' ? 'كيف تزيد أرباحك' : 'How to Maximize Earnings',
      description:
        language === 'ar'
          ? 'نصائح لتزيد حجوزاتك وأرباحك'
          : 'Tips to increase bookings and earnings',
      steps: [
        {
          title: language === 'ar' ? 'انشر مبكراً' : 'Post Early',
          description:
            language === 'ar'
              ? 'انشر رحلتك قبل 3-7 أيام'
              : 'Post your trip 3-7 days in advance',
          tip:
            language === 'ar'
              ? '📅 الرحلات المبكرة تحصل +60% حجوزات'
              : '📅 Early trips get +60% more bookings',
        },
        {
          title: language === 'ar' ? 'حافظ على تقييم عالي' : 'Maintain High Rating',
          description:
            language === 'ar'
              ? 'كن مهذب، نظف سيارتك، التزم بالموعد'
              : 'Be polite, clean car, be on time',
          tip:
            language === 'ar'
              ? '⭐ تقييم 4.8+ = +50% حجوزات'
              : '⭐ 4.8+ rating = +50% bookings',
        },
        {
          title: language === 'ar' ? 'قدم مميزات' : 'Offer Amenities',
          description:
            language === 'ar'
              ? 'واي فاي، شواحن، ماء، وقفات صلاة'
              : 'Wi-Fi, chargers, water, prayer stops',
        },
        {
          title: language === 'ar' ? 'انشر بانتظام' : 'Post Regularly',
          description:
            language === 'ar'
              ? 'كل ما تنشر أكثر، كل ما تربح أكثر'
              : 'The more you post, the more you earn',
          tip:
            language === 'ar'
              ? '💰 السائقين النشطين يربحون 3× أكثر'
              : '💰 Active drivers earn 3× more',
        },
      ],
    },
  ];

  const FAQs = [
    {
      question: language === 'ar' ? 'كيف بدفع؟' : 'How does payment work?',
      answer:
        language === 'ar'
          ? 'ممكن تدفع أونلاين بالبطاقة، أو نقداً لمّا توصل. الدفع آمن 100%'
          : 'You can pay online with card or choose cash on arrival. Payment is 100% secure and encrypted',
    },
    {
      question: language === 'ar' ? 'هل الرحلات مؤمّنة؟' : 'Are trips insured?',
      answer:
        language === 'ar'
          ? 'نعم، كل الرحلات مؤمّنة لحد 1000 دينار. التأمين يغطي الحوادث والأضرار'
          : 'Yes, all trips are insured up to JOD 1,000. Insurance covers accidents and damages',
    },
    {
      question:
        language === 'ar'
          ? 'كم أحتاج أن أنشر قبل الرحلة؟'
          : 'How early should I post my trip?',
      answer:
        language === 'ar'
          ? 'ننصح بالنشر قبل 24-72 ساعة على الأقل. الرحلات المبكرة تحصل حجوزات أكثر'
          : 'We recommend posting at least 24-72 hours in advance. Early trips get more bookings',
    },
    {
      question: language === 'ar' ? 'ماذا لو ألغى الراكب؟' : 'What if passenger cancels?',
      answer:
        language === 'ar'
          ? 'الإلغاء قبل 24 ساعة مجاني. بعد ذلك، يدفع الراكب 50% من القيمة'
          : 'Cancellation before 24h is free. After that, passenger pays 50% of the value',
    },
  ];

  const handleComplete = () => {
    if (selectedTutorial && !completedTutorials.includes(selectedTutorial.id)) {
      setCompletedTutorials([...completedTutorials, selectedTutorial.id]);
    }
    setSelectedTutorial(null);
    setCurrentStep(0);
  };

  return (
    <div className={rtl.container()} dir={dir}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <BookOpen className={`inline h-8 w-8 ${rtl.mr(2)} text-primary`} />
            {language === 'ar' ? 'مركز التعليم' : 'Learning Center'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar'
              ? 'تعلم كيف تستخدم واصل بشكل احترافي'
              : 'Learn how to use Wasel like a pro'}
          </p>
        </div>

        {/* Progress */}
        {completedTutorials.length > 0 && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-green-500/10 to-primary/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">
                  {language === 'ar' ? 'تقدمك' : 'Your Progress'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {completedTutorials.length} / {tutorials.length}{' '}
                  {language === 'ar' ? 'دروس مكتملة' : 'tutorials completed'}
                </p>
              </div>
              <div className="text-4xl font-bold text-primary">
                {Math.round((completedTutorials.length / tutorials.length) * 100)}%
              </div>
            </div>
            <Progress
              value={(completedTutorials.length / tutorials.length) * 100}
              className="h-2"
            />
          </Card>
        )}

        {/* Tutorials Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {tutorials.map((tutorial) => {
            const isCompleted = completedTutorials.includes(tutorial.id);

            return (
              <Card
                key={tutorial.id}
                className={`p-6 cursor-pointer hover:border-primary transition-colors ${
                  isCompleted ? 'bg-green-500/5 border-green-500/30' : ''
                }`}
                onClick={() => {
                  setSelectedTutorial(tutorial);
                  setCurrentStep(0);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      <h3 className="font-semibold">{tutorial.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tutorial.description}
                    </p>
                  </div>
                  <Play className="h-8 w-8 text-primary ml-4" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tutorial.steps.length} {language === 'ar' ? 'خطوة' : 'steps'}
                  </span>
                  <Button size="sm" variant="ghost">
                    {language === 'ar' ? 'ابدأ' : 'Start'}
                    <ArrowRight className={`h-4 w-4 ${rtl.ml(2)}`} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            <HelpCircle className={`inline h-6 w-6 ${rtl.mr(2)} text-primary`} />
            {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {FAQs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {selectedTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTutorial(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="p-8">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTutorial(null)}
                  className={`absolute ${rtl.right(4)} top-4`}
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedTutorial.title}
                  </h2>
                  <Progress
                    value={((currentStep + 1) / selectedTutorial.steps.length) * 100}
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'ar' ? 'خطوة' : 'Step'} {currentStep + 1} /{' '}
                    {selectedTutorial.steps.length}
                  </p>
                </div>

                {/* Current Step */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-semibold mb-4">
                      {selectedTutorial.steps[currentStep].title}
                    </h3>
                    <p className="text-lg mb-6">
                      {selectedTutorial.steps[currentStep].description}
                    </p>
                    {selectedTutorial.steps[currentStep].tip && (
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm">
                          {selectedTutorial.steps[currentStep].tip}
                        </p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className={`h-5 w-5 ${rtl.mr(2)}`} />
                    {language === 'ar' ? 'السابق' : 'Previous'}
                  </Button>

                  {currentStep === selectedTutorial.steps.length - 1 ? (
                    <Button onClick={handleComplete} className="px-8">
                      <CheckCircle className={`h-5 w-5 ${rtl.mr(2)}`} />
                      {language === 'ar' ? 'إنهاء' : 'Complete'}
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        setCurrentStep(
                          Math.min(selectedTutorial.steps.length - 1, currentStep + 1)
                        )
                      }
                    >
                      {language === 'ar' ? 'التالي' : 'Next'}
                      <ArrowRight className={`h-5 w-5 ${rtl.ml(2)}`} />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}