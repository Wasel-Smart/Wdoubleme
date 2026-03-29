/**
 * Medical Transport Service - Non-emergency medical appointments with accessibility features
 */

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { motion } from 'motion/react';
import { Stethoscope, MapPin, Clock, Heart, Accessibility, Pill, FileText, AlertCircle, Phone, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function MedicalTransport() {
  const [appointmentType, setAppointmentType] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [patientName, setPatientName] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [waitAndReturn, setWaitAndReturn] = useState(false);

  const appointmentTypes = [
    'Dialysis',
    'Chemotherapy',
    'Physical Therapy',
    'Doctor Consultation',
    'Lab Tests',
    'Radiology',
    'Dental',
    'Other'
  ];

  const requirements = [
    { id: 'wheelchair', label: 'Wheelchair Accessible', icon: Accessibility },
    { id: 'oxygen', label: 'Oxygen Support', icon: Heart },
    { id: 'stretcher', label: 'Stretcher Required', icon: FileText },
    { id: 'companion', label: 'Companion Allowed', icon: User },
    { id: 'medical-equipment', label: 'Medical Equipment Space', icon: Pill }
  ];

  const toggleRequirement = (id: string) => {
    setSpecialRequirements(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleBooking = () => {
    if (!patientName || !pickupLocation || !destination || !appointmentDate || !appointmentTime || !emergencyContact) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Medical transport booking confirmed! Driver will contact you 30 minutes before pickup.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 p-8 md:p-12 text-white"
      >
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1721411480070-fcb558776d54"
            alt="Medical transport"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-xl px-6 py-3 rounded-full mb-6"
          >
            <Stethoscope className="w-6 h-6" />
            <span className="font-semibold">Medical Transport</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compassionate Medical Transport
          </h1>
          <p className="text-xl opacity-90 max-w-2xl">
            Safe, comfortable, and dignified transportation to medical appointments with trained healthcare-aware drivers.
          </p>
        </div>

        {/* 3D Animated Elements */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-10 text-8xl opacity-30"
        >
          🚑
        </motion.div>
      </motion.div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Heart, label: 'Trained Drivers', color: 'text-red-600', desc: 'First aid certified' },
          { icon: Accessibility, label: 'Accessibility', color: 'text-blue-600', desc: 'Wheelchair accessible' },
          { icon: Clock, label: 'On-Time Service', color: 'text-green-600', desc: 'Never miss appointments' },
          { icon: Phone, label: '24/7 Support', color: 'text-purple-600', desc: 'Always available' }
        ].map((feature, index) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="border-2 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <feature.icon className={`w-10 h-10 mx-auto mb-2 ${feature.color}`} />
                <p className="font-semibold mb-1">{feature.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Patient & Trip Details */}
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-rose-600" />
                Patient Information
              </CardTitle>
              <CardDescription>Provide patient details for safe transport</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name *</Label>
                <Input
                  id="patient-name"
                  placeholder="Full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-contact">Emergency Contact *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="emergency-contact"
                    type="tel"
                    placeholder="+962 79 XXX XXXX"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointment-type">Appointment Type</Label>
                <Select value={appointmentType} onValueChange={setAppointmentType}>
                  <SelectTrigger id="appointment-type">
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical-notes">Medical Notes (Optional)</Label>
                <Textarea
                  id="medical-notes"
                  placeholder="Any special medical conditions or requirements the driver should know..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-blue-600" />
                Accessibility Requirements
              </CardTitle>
              <CardDescription>Select any special requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requirements.map(req => (
                <motion.div
                  key={req.id}
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => toggleRequirement(req.id)}
                >
                  <Checkbox
                    id={req.id}
                    checked={specialRequirements.includes(req.id)}
                    onCheckedChange={() => toggleRequirement(req.id)}
                  />
                  <req.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <label
                    htmlFor={req.id}
                    className="flex-1 text-sm font-medium cursor-pointer"
                  >
                    {req.label}
                  </label>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Trip Details */}
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Trip Details
              </CardTitle>
              <CardDescription>Schedule your medical transport</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="pickup"
                    placeholder="Enter pickup address"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Medical Facility *</Label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="destination"
                    placeholder="Hospital/Clinic address"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointment-date">Appointment Date *</Label>
                  <Input
                    id="appointment-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appointment-time">Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="appointment-time"
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Checkbox
                  id="wait-return"
                  checked={waitAndReturn}
                  onCheckedChange={(checked) => setWaitAndReturn(checked as boolean)}
                />
                <label
                  htmlFor="wait-return"
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Wait and return service
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-normal mt-1">
                    Driver will wait during your appointment and take you back home
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="font-semibold text-rose-900 dark:text-rose-100">Healthcare Standards</h4>
                  <ul className="text-sm text-rose-800 dark:text-rose-200 space-y-1">
                    <li>✓ Drivers trained in patient care and first aid</li>
                    <li>✓ Vehicles sanitized before each trip</li>
                    <li>✓ Assistance with boarding and alighting</li>
                    <li>✓ Direct communication with healthcare facilities</li>
                    <li>✓ Privacy and dignity maintained at all times</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency Notice */}
      <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">For Emergency Situations</h4>
              <p className="text-sm text-red-800 dark:text-red-200">
                This service is for non-emergency medical appointments only. In case of medical emergencies, please call 999 or your local emergency number immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleBooking}
          className="w-full h-14 text-lg bg-gradient-to-r from-red-500 via-rose-600 to-pink-700 hover:from-red-600 hover:via-rose-700 hover:to-pink-800 shadow-lg"
        >
          <Stethoscope className="w-5 h-5 mr-2" />
          Book Medical Transport
        </Button>
      </motion.div>
    </div>
  );
}