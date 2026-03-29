/**
 * WaselDelivery - Professional package delivery service
 * Same-day delivery, professional couriers, live tracking
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Truck, Package, Clock, MapPin, Shield, Star, Zap,
  CheckCircle, DollarSign, Navigation, QrCode, Phone,
  MessageCircle, Box, Weight, Ruler, TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors, WaselGradients } from '../../styles/wasel-design-system';
import { formatCurrency } from '../../utils/currency';

const C = WaselColors;

interface DeliveryOption {
  id: string;
  icon: any;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  price: number;
  duration: string;
  color: string;
}

const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'express',
    icon: Zap,
    titleEn: 'Express Delivery',
    titleAr: 'توصيل سريع',
    descEn: 'Delivered within 2 hours',
    descAr: 'يصل خلال ساعتين',
    price: 3,
    duration: '< 2 hours',
    color: C.orange,
  },
  {
    id: 'same-day',
    icon: Clock,
    titleEn: 'Same Day',
    titleAr: 'نفس اليوم',
    descEn: 'Delivered today before 8 PM',
    descAr: 'يصل اليوم قبل 8 مساءً',
    price: 2,
    duration: 'Today',
    color: C.green,
  },
  {
    id: 'scheduled',
    icon: Package,
    titleEn: 'Scheduled',
    titleAr: 'مجدول',
    descEn: 'Choose your delivery time',
    descAr: 'اختر وقت التوصيل',
    price: 1.5,
    duration: '1-3 days',
    color: C.cyan,
  },
];

export function WaselDelivery() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [packageSize, setPackageSize] = useState<'small' | 'medium' | 'large'>('small');

  const handleRequestDelivery = () => {
    if (!from || !to || !selectedOption) {
      alert(isAr ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    alert(
      isAr
        ? `✅ تم طلب التوصيل!\n\nمن: ${from}\nإلى: ${to}\nالخدمة: ${selectedOption.titleAr}\nالسعر: ${formatCurrency(selectedOption.price)}\n\nسيتم التواصل معك قريباً.`
        : `✅ Delivery Requested!\n\nFrom: ${from}\nTo: ${to}\nService: ${selectedOption.titleEn}\nPrice: ${formatCurrency(selectedOption.price)}\n\nYou'll be contacted soon.`
    );
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ background: C.bg }} dir={dir}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `${C.green}20`,
                border: `2px solid ${C.green}40`,
              }}
            >
              <Truck className="w-8 h-8" style={{ color: C.green }} />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {isAr ? 'توصيل واصل' : 'Wasel Delivery'}
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            {isAr
              ? 'خدمة توصيل طرود احترافية. مندوبين محترفين، توصيل نفس اليوم، تتبع مباشر'
              : 'Professional package delivery. Expert couriers, same-day delivery, live tracking'}
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: Zap, label: 'Delivery Time', labelAr: 'وقت التوصيل', value: '<2h' },
              { icon: MapPin, label: 'Coverage', labelAr: 'التغطية', value: '5 Cities' },
              { icon: CheckCircle, label: 'Success Rate', labelAr: 'نسبة النجاح', value: '99%' },
              { icon: Star, label: 'Rating', labelAr: 'التقييم', value: '4.9' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon className="w-5 h-5 mx-auto mb-2" style={{ color: C.green }} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-400">{isAr ? stat.labelAr : stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Delivery Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">
            {isAr ? 'اختر نوع التوصيل' : 'Choose Delivery Type'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DELIVERY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedOption?.id === option.id;

              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedOption(option)}
                  className="p-6 rounded-2xl text-left transition-all"
                  style={{
                    background: isSelected ? `${option.color}15` : 'rgba(9,21,37,0.8)',
                    border: isSelected
                      ? `2px solid ${option.color}`
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: `${option.color}30`,
                    }}
                  >
                    <Icon className="w-6 h-6" style={{ color: option.color }} />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {isAr ? option.titleAr : option.titleEn}
                  </h3>

                  <p className="text-sm text-slate-400 mb-4">
                    {isAr ? option.descAr : option.descEn}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {formatCurrency(option.price)}
                      </div>
                      <div className="text-xs text-slate-500">{isAr ? 'ابتداءً من' : 'Starting at'}</div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        background: `${option.color}20`,
                        color: option.color,
                      }}
                    >
                      {option.duration}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Delivery Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl"
          style={{
            background: 'rgba(9,21,37,0.8)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {isAr ? 'تفاصيل التوصيل' : 'Delivery Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* From */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {isAr ? 'الاستلام من' : 'Pickup From'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder={isAr ? 'عنوان الاستلام' : 'Pickup address'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-slate-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                {isAr ? 'التوصيل إلى' : 'Deliver To'}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder={isAr ? 'عنوان التوصيل' : 'Delivery address'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder:text-slate-500"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Package Size */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">
              {isAr ? 'حجم الطرد' : 'Package Size'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'small' as const, label: 'Small', labelAr: 'صغير', icon: Box },
                { id: 'medium' as const, label: 'Medium', labelAr: 'متوسط', icon: Package },
                { id: 'large' as const, label: 'Large', labelAr: 'كبير', icon: Weight },
              ].map((size) => {
                const Icon = size.icon;
                const isSelected = packageSize === size.id;
                return (
                  <motion.button
                    key={size.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPackageSize(size.id)}
                    className="p-4 rounded-xl flex flex-col items-center gap-2"
                    style={{
                      background: isSelected ? `${C.green}20` : 'rgba(255,255,255,0.03)',
                      border: isSelected ? `1px solid ${C.green}` : '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <Icon
                      className="w-6 h-6"
                      style={{ color: isSelected ? C.green : 'rgb(148, 163, 184)' }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: isSelected ? C.green : 'white' }}
                    >
                      {isAr ? size.labelAr : size.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRequestDelivery}
            className="w-full px-6 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2"
            style={{
              background: WaselGradients.green,
              boxShadow: `0 8px 24px ${C.green}40`,
            }}
          >
            <Truck className="w-6 h-6" />
            {isAr ? 'طلب التوصيل' : 'Request Delivery'}
          </motion.button>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Shield,
              titleEn: 'Insurance Included',
              titleAr: 'تأمين مشمول',
              descEn: 'All packages covered up to JOD 100',
              descAr: 'جميع الطرود مؤمنة حتى 100 دينار',
            },
            {
              icon: QrCode,
              titleEn: 'QR Verification',
              titleAr: 'تحقق بـ QR',
              descEn: 'Scan QR code for secure pickup',
              descAr: 'امسح كود QR لاستلام آمن',
            },
            {
              icon: Navigation,
              titleEn: 'Live Tracking',
              titleAr: 'تتبع مباشر',
              descEn: 'Track your package in real-time',
              descAr: 'تتبع طردك في الوقت الفعلي',
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-xl"
                style={{
                  background: 'rgba(9,21,37,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${C.green}20`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: C.green }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {isAr ? feature.titleAr : feature.titleEn}
                </h3>
                <p className="text-sm text-slate-400">
                  {isAr ? feature.descAr : feature.descEn}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
