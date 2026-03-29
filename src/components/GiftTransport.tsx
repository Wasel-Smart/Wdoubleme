import { useState } from 'react';
import { Gift, Package, MapPin, Calendar, Clock, User, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { MapComponent } from './MapComponent';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface GiftDetails {
  giftType: string;
  customGiftName?: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  receiverName: string;
  receiverPhone: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  deliveryDate: string;
  deliveryTime: string;
  specialInstructions: string;
  giftMessage?: string;
  fragile: boolean;
  requireSignature: boolean;
}

const GIFT_TYPES = [
  { id: 'flowers', name: 'Flowers & Bouquets', icon: '🌸', description: 'Fresh flowers for any occasion' },
  { id: 'cake', name: 'Cakes & Pastries', icon: '🎂', description: 'Delicious treats delivered fresh' },
  { id: 'jewelry', name: 'Jewelry & Valuables', icon: '💍', description: 'High-value items with care' },
  { id: 'electronics', name: 'Electronics', icon: '📱', description: 'Tech gifts securely delivered' },
  { id: 'clothing', name: 'Clothing & Fashion', icon: '👗', description: 'Apparel and accessories' },
  { id: 'books', name: 'Books & Media', icon: '📚', description: 'Books and entertainment' },
  { id: 'toys', name: 'Toys & Games', icon: '🧸', description: 'Gifts for kids and collectors' },
  { id: 'hamper', name: 'Gift Hampers', icon: '🎁', description: 'Curated gift baskets' },
  { id: 'custom', name: 'Custom Gift', icon: '✨', description: 'Other gift items' },
];

const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (9AM - 12PM)', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: '☀️' },
  { value: 'evening', label: 'Evening (5PM - 9PM)', icon: '🌆' },
  { value: 'specific', label: 'Specific Time', icon: '⏰' },
];

export function GiftTransport() {
  const [step, setStep] = useState<'type' | 'pickup' | 'receiver' | 'delivery' | 'confirm'>('type');
  const [giftDetails, setGiftDetails] = useState<Partial<GiftDetails>>({
    fragile: false,
    requireSignature: false,
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const handleGiftTypeSelect = (typeId: string) => {
    setGiftDetails({ ...giftDetails, giftType: typeId });
    setStep('pickup');
  };

  const handlePickupComplete = () => {
    if (!giftDetails.pickupAddress) {
      toast.error('Please enter pickup address');
      return;
    }
    setStep('receiver');
  };

  const handleReceiverComplete = () => {
    if (!giftDetails.receiverName || !giftDetails.receiverPhone || !giftDetails.deliveryAddress) {
      toast.error('Please fill in all receiver details');
      return;
    }
    setStep('delivery');
  };

  const handleDeliveryComplete = () => {
    if (!giftDetails.deliveryDate) {
      toast.error('Please select delivery date');
      return;
    }
    if (selectedTimeSlot === 'specific' && !giftDetails.deliveryTime) {
      toast.error('Please specify delivery time');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmBooking = () => {
    toast.success('🎁 Gift delivery scheduled successfully!');
    // Reset form
    setStep('type');
    setGiftDetails({ fragile: false, requireSignature: false });
    setSelectedTimeSlot('');
  };

  const selectedGiftType = GIFT_TYPES.find(t => t.id === giftDetails.giftType);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center"
            >
              <Gift className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Gift Transport</h1>
              <p className="text-white/90 mt-1">Send happiness door-to-door</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Same-day Delivery
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Package className="w-3 h-3 mr-1" />
              Secure Handling
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { id: 'type', label: 'Gift Type', icon: Gift },
              { id: 'pickup', label: 'Pickup', icon: MapPin },
              { id: 'receiver', label: 'Receiver', icon: User },
              { id: 'delivery', label: 'Delivery', icon: Calendar },
              { id: 'confirm', label: 'Confirm', icon: Sparkles },
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step === s.id
                        ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg'
                        : ['type', 'pickup', 'receiver', 'delivery', 'confirm'].indexOf(step) > idx
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{s.label}</span>
                </div>
                {idx < 4 && (
                  <div
                    className={`h-1 flex-1 ${
                      ['type', 'pickup', 'receiver', 'delivery', 'confirm'].indexOf(step) > idx
                        ? 'bg-green-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {/* Step 1: Gift Type Selection */}
        {step === 'type' && (
          <motion.div
            key="type"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {GIFT_TYPES.map((type) => (
              <motion.div key={type.id} variants={itemVariants}>
                <Card
                  onClick={() => handleGiftTypeSelect(type.id)}
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/20 hover:scale-105 group"
                >
                  <CardContent className="p-6">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Step 2: Pickup Details */}
        {step === 'pickup' && (
          <motion.div
            key="pickup"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pickup Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Selected Gift Type</Label>
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
                    <span className="text-3xl">{selectedGiftType?.icon}</span>
                    <span className="font-semibold">{selectedGiftType?.name}</span>
                  </div>
                </div>

                {giftDetails.giftType === 'custom' && (
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="customGiftName">Specify Gift Name</Label>
                    <Input
                      id="customGiftName"
                      placeholder="e.g., Hand-made crafts"
                      value={giftDetails.customGiftName || ''}
                      onChange={(e) =>
                        setGiftDetails({ ...giftDetails, customGiftName: e.target.value })
                      }
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="pickupAddress"
                      placeholder="Enter pickup address"
                      className="pl-10"
                      value={giftDetails.pickupAddress || ''}
                      onChange={(e) =>
                        setGiftDetails({ ...giftDetails, pickupAddress: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Gift Handling Options</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fragile"
                        checked={giftDetails.fragile}
                        onCheckedChange={(checked) =>
                          setGiftDetails({ ...giftDetails, fragile: checked as boolean })
                        }
                      />
                      <label htmlFor="fragile" className="text-sm cursor-pointer">
                        Mark as Fragile (extra care handling)
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="signature"
                        checked={giftDetails.requireSignature}
                        onCheckedChange={(checked) =>
                          setGiftDetails({ ...giftDetails, requireSignature: checked as boolean })
                        }
                      />
                      <label htmlFor="signature" className="text-sm cursor-pointer">
                        Require Signature on Delivery
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handlePickupComplete} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Receiver Information */}
        {step === 'receiver' && (
          <motion.div
            key="receiver"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Receiver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receiverName">Receiver Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="receiverName"
                        placeholder="Full name"
                        className="pl-10"
                        value={giftDetails.receiverName || ''}
                        onChange={(e) =>
                          setGiftDetails({ ...giftDetails, receiverName: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverPhone">Receiver Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="receiverPhone"
                        placeholder="+962 79 XXX XXXX"
                        className="pl-10"
                        value={giftDetails.receiverPhone || ''}
                        onChange={(e) =>
                          setGiftDetails({ ...giftDetails, receiverPhone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="deliveryAddress"
                      placeholder="Enter delivery address"
                      className="pl-10"
                      value={giftDetails.deliveryAddress || ''}
                      onChange={(e) =>
                        setGiftDetails({ ...giftDetails, deliveryAddress: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Textarea
                      id="giftMessage"
                      placeholder="Add a personal message for the receiver..."
                      className="pl-10 min-h-20"
                      value={giftDetails.giftMessage || ''}
                      onChange={(e) =>
                        setGiftDetails({ ...giftDetails, giftMessage: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('pickup')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleReceiverComplete} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Delivery Schedule */}
        {step === 'delivery' && (
          <motion.div
            key="delivery"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Delivery Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date *</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={giftDetails.deliveryDate || ''}
                    onChange={(e) =>
                      setGiftDetails({ ...giftDetails, deliveryDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Preferred Time Slot *</Label>
                  <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                    {TIME_SLOTS.map((slot) => (
                      <div
                        key={slot.value}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                      >
                        <RadioGroupItem value={slot.value} id={slot.value} />
                        <label htmlFor={slot.value} className="flex-1 cursor-pointer flex items-center gap-2">
                          <span className="text-xl">{slot.icon}</span>
                          <span>{slot.label}</span>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {selectedTimeSlot === 'specific' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <Label htmlFor="specificTime">Specify Exact Time</Label>
                    <Input
                      id="specificTime"
                      type="time"
                      value={giftDetails.deliveryTime || ''}
                      onChange={(e) =>
                        setGiftDetails({ ...giftDetails, deliveryTime: e.target.value })
                      }
                    />
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Delivery Instructions</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="e.g., Call before arrival, Leave at door, etc."
                    value={giftDetails.specialInstructions || ''}
                    onChange={(e) =>
                      setGiftDetails({ ...giftDetails, specialInstructions: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('receiver')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleDeliveryComplete} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                    Review Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirm' && (
          <motion.div
            key="confirm"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Confirm Gift Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Gift Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="text-2xl">{selectedGiftType?.icon}</span>
                        <span className="font-medium">{selectedGiftType?.name}</span>
                      </p>
                      {giftDetails.customGiftName && (
                        <p className="text-muted-foreground ml-8">{giftDetails.customGiftName}</p>
                      )}
                      {giftDetails.fragile && (
                        <Badge variant="secondary" className="ml-8">⚠️ Fragile</Badge>
                      )}
                      {giftDetails.requireSignature && (
                        <Badge variant="secondary" className="ml-8">✍️ Signature Required</Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Pickup
                      </h3>
                      <p className="text-sm text-muted-foreground">{giftDetails.pickupAddress}</p>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Delivery
                      </h3>
                      <p className="text-sm text-muted-foreground">{giftDetails.deliveryAddress}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Receiver Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {giftDetails.receiverName}</p>
                      <p><strong>Phone:</strong> {giftDetails.receiverPhone}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Delivery Schedule
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>Date:</strong> {giftDetails.deliveryDate}</p>
                      <p>
                        <strong>Time:</strong>{' '}
                        {selectedTimeSlot === 'specific'
                          ? giftDetails.deliveryTime
                          : TIME_SLOTS.find((s) => s.value === selectedTimeSlot)?.label}
                      </p>
                    </div>
                  </div>

                  {giftDetails.giftMessage && (
                    <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Gift Message
                      </h3>
                      <p className="text-sm italic text-muted-foreground">"{giftDetails.giftMessage}"</p>
                    </div>
                  )}

                  {giftDetails.specialInstructions && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl">
                      <h3 className="font-semibold mb-2">Special Instructions</h3>
                      <p className="text-sm text-muted-foreground">{giftDetails.specialInstructions}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl text-white">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Estimated Total</span>
                    <span className="text-2xl font-bold">JOD 45.00</span>
                  </div>
                  <p className="text-xs mt-1 text-white/80">Price may vary based on distance</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('delivery')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleConfirmBooking} className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}